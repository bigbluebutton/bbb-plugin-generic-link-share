import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  MediaAreaOption,
  BbbPluginSdk,
  GenericContentMainArea,
  PluginApi,
  LayoutPresentationAreaUiDataNames,
  UiLayouts,
  CurrentPresentation,
  RESET_DATA_CHANNEL,
  pluginLogger,
  PresentationToolbarButton,
} from 'bigbluebutton-html-plugin-sdk';
import { parseTags } from '../utils';

import GenericComponentLinkShare from '../generic-component/component';

import {
  CurrentUserData,
  DataToGenericLink,
  GenericLinkShareProps,
  PresentationAreaContentTimes,
  UserMetadataGraphqlResponse,
} from './types';
import { ModalToShareLink } from '../modal-to-share-link/component';
import { LinkTag } from '../modal-to-share-link/types';
import { REGEX } from './constants';
import { isSameSharedLink, mergePlaceholdersList, replaceUrlPlaceholders } from './utils';
import { USER_METADATA } from './subscription';

// How many times the link may be put back on top of the same older content,
// so two contents fighting for the presentation area can never loop.
const MAX_RAISES_PER_CONTENT = 3;

// Keeps only what the plugin needs from the meeting, so other meeting changes do
// not reach the plugin state (useMeetingData compares the projected value)
type MeetingDataProjection = Parameters<PluginApi['useMeetingData']>[0];
const projectContentTimes: MeetingDataProjection = (meeting) => {
  const { screenshare, externalVideo } = meeting as typeof meeting & PresentationAreaContentTimes;
  const contentTimes: PresentationAreaContentTimes = {
    screenshare: { startedAt: screenshare?.startedAt ?? null },
    externalVideo: {
      externalVideoUrl: externalVideo?.externalVideoUrl ?? null,
      startedSharingAt: externalVideo?.startedSharingAt ?? null,
    },
  };
  return contentTimes as ReturnType<MeetingDataProjection>;
};

// Globe icon (Material "Language"). An svg because the media area gives plugins no
// active style: painting it with the primary color while a website is shared is
// what tells the presenter it is being shared, like the built-in options do.
const websiteIcon = (isSharing: boolean) => ({
  svgContent: (
    <path
      fill={isSharing ? 'var(--color-primary, #0F70D7)' : 'currentColor'}
      d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56M12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96M4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56m2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8M12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96M14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2m.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56M16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2z"
    />
  ) as React.SVGProps<SVGSVGElement>,
});

const toTime = (value?: string | number | null): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const time = typeof value === 'number' ? value : Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

function GenericLinkShare(
  { pluginUuid: uuid }: GenericLinkShareProps,
): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  const { data: userData, loading: userDataLoading } = pluginApi
    .useCustomQuery<UserMetadataGraphqlResponse>(USER_METADATA);
  const { data: currentUser } = pluginApi.useCurrentUser();
  const { data: urlToGenericLink, pushEntry: pushEntryUrlToGenericLink, deleteEntry: deleteEntryUrlToGenericLink } = pluginApi.useDataChannel<DataToGenericLink>('urlToGenericLink');
  const currentPresentationResponse = pluginApi.useCurrentPresentation();
  const currentLayout = pluginApi.useUiData(LayoutPresentationAreaUiDataNames.CURRENT_ELEMENT, [{
    isOpen: true,
    currentElement: UiLayouts.WHITEBOARD,
  }]);
  const [genericContentId, setGenericContentId] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [link, setLink] = useState<string>(null);
  const [linkError, setLinkError] = useState<string>(null);
  const [previousModalState, setPreviousModalState] = useState<DataToGenericLink>({
    isUrlSameForRole: true,
    url: null,
  });
  // Links of the entry being shown. Sharing them again would recreate the generic
  // content for everyone and lose what users were doing in the page, so it is not
  // allowed. Also kept in a ref: the toolbar buttons only see the state from when
  // they were created.
  const [sharedLink, setSharedLink] = useState<DataToGenericLink>(null);
  const sharedLinkRef = useRef<DataToGenericLink>(null);
  sharedLinkRef.current = sharedLink;
  const isSharing = !!sharedLink;
  // Identity and server time of the data-channel entry being shown. A new entry
  // (a share again, even with the same URL) recreates the generic content, which
  // puts it back on top of the presentation area for everyone.
  const [linkEntryId, setLinkEntryId] = useState<string>(null);
  const [linkSharedAt, setLinkSharedAt] = useState<number>(null);
  const [raiseCount, setRaiseCount] = useState<number>(0);
  const raisesByContent = useRef<Record<string, number>>({});
  // Root of the shown generic content, rendered again when the presenter changes so
  // only the presenter gets the close button (recreating the content would put it
  // back on top of the presentation area for everyone)
  const contentRootRef = useRef<ReactDOM.Root>(null);
  const isPresenterRef = useRef<boolean>(false);
  isPresenterRef.current = !!currentUser?.presenter;
  // Start times of the other contents of the presentation area, from the meeting
  // the client already subscribes to (no subscription of our own)
  const { data: contentTimes } = pluginApi.useMeetingData(
    projectContentTimes,
  ) as { data?: PresentationAreaContentTimes };
  const screenshareStartedAt = toTime(contentTimes?.screenshare?.startedAt);
  const externalVideoStartedAt = contentTimes?.externalVideo?.externalVideoUrl
    ? toTime(contentTimes.externalVideo.startedSharingAt) : null;

  const currentUserPlaceholders: CurrentUserData = {
    name: currentUser?.name ?? '',
    extId: currentUser?.extId ?? '',
    role: currentUser?.role ?? '',
    presenter: !!currentUser?.presenter,
  };

  const handleCheckboxChange = () => {
    setPreviousModalState((p) => ({
      isUrlSameForRole: !p.isUrlSameForRole,
      url: p.url,
      viewerUrl: p.viewerUrl,
    }));
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setLinkError(null);
  };

  const handleStopSharing = (): void => {
    deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
    setShowModal(false);
    setLinkError(null);
  };

  const renderLinkContent = (root: ReactDOM.Root, contentLink: string) => {
    root.render(
      <GenericComponentLinkShare
        link={contentLink}
        onClose={isPresenterRef.current ? handleStopSharing : undefined}
      />,
    );
  };

  const requestCurrentPage = (currentTxtUri: string) => fetch(currentTxtUri)
    .then((response) => response.text());

  const addButtonsToPresentationToolbar = (tags : LinkTag[]) => {
    if (currentUser?.presenter) {
      const buttons = tags.map((tag) => (
        new PresentationToolbarButton({
          label: `Play ${tag.title}`,
          tooltip: 'A generic link tag has been detected in this slide, show it to all?',
          style: {},
          onClick: () => {
            const tagLink: DataToGenericLink = {
              url: tag.presenter,
              isUrlSameForRole: tag.presenter === tag.viewer,
              viewerUrl: tag.viewer,
            };
            if (isSameSharedLink(tagLink, sharedLinkRef.current)) return;
            deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
            pushEntryUrlToGenericLink(tagLink);
          },
        })
      ));
      pluginApi.setPresentationToolbarItems(buttons);
    }
  };

  const handleFetchPresentationData = (
    currentPres: CurrentPresentation,
  ) => {
    pluginApi.setPresentationToolbarItems([]);
    const currentTxtUri = currentPres?.currentPage?.urlsJson?.text;
    pluginLogger.info('Trying to fetch the slide text in the following URI:', currentTxtUri);
    if (currentTxtUri) {
      requestCurrentPage(currentTxtUri).then((currentPageContent) => {
        const linkTags = parseTags(currentPageContent);
        addButtonsToPresentationToolbar(linkTags);
      }).catch((err) => {
        pluginLogger.error(`Error while requesting data from bbb-web. Could not get the base text, error: ${err.message}`);
      });
    }
  };

  useEffect(() => {
    const { data: currentPresentation } = currentPresentationResponse;
    if (currentUser?.presenter) handleFetchPresentationData(currentPresentation);
  }, [currentPresentationResponse, currentUser]);

  const handleSendLinkToIframe = (e: React.SyntheticEvent) => {
    e.preventDefault();
    let objectToDispatch: DataToGenericLink;
    if (previousModalState.isUrlSameForRole) {
      const target = e.target as typeof e.target & {
        link: { value: string };
      };
      if (target.link.value.match(REGEX)) {
        objectToDispatch = {
          isUrlSameForRole: true,
          url: target.link.value,
        };
      }
    } else {
      const target = e.target as typeof e.target & {
        link: { value: string };
        viewerLink: { value?: string };
      };
      if (target.link.value.match(REGEX)) {
        objectToDispatch = {
          isUrlSameForRole: false,
          url: target.link.value,
          viewerUrl: target.viewerLink.value,
        };
      }
    }
    if (objectToDispatch && isSameSharedLink(objectToDispatch, sharedLink)) {
      setShowModal(false);
    } else if (objectToDispatch) {
      deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
      pushEntryUrlToGenericLink(objectToDispatch);
      setShowModal(false);
    } else {
      setLinkError('Link is malformed, please insert a valid one');
    }
  };

  // Receiving URL data and persisting it to be inserted in the iframe later on
  useEffect(() => {
    if (
      urlToGenericLink.data
      && urlToGenericLink
        .data[urlToGenericLink.data.length - 1]?.payloadJson
    ) {
      const lastEntry = urlToGenericLink.data[urlToGenericLink.data.length - 1];
      setLinkEntryId(lastEntry.entryId);
      setLinkSharedAt(toTime(lastEntry.createdAt));
      setSharedLink(lastEntry.payloadJson);
      setPreviousModalState(urlToGenericLink
        .data[
          urlToGenericLink.data.length - 1]?.payloadJson);
      const isUrlTheSame = urlToGenericLink
        .data[
          urlToGenericLink.data.length - 1
        ]?.payloadJson.isUrlSameForRole;
      if (!isUrlTheSame && !currentUser?.presenter) {
        const viewerUrl = urlToGenericLink
          .data[
            urlToGenericLink.data.length - 1
          ]?.payloadJson.viewerUrl;
        if (viewerUrl) setLink(viewerUrl);
      } else {
        setLink(urlToGenericLink
          .data[
            urlToGenericLink.data.length - 1
          ]?.payloadJson.url);
      }
    } else if (
      urlToGenericLink.data
      && !urlToGenericLink
        .data[urlToGenericLink.data.length - 1]?.payloadJson
    ) {
      setLink(null);
      setLinkEntryId(null);
      setLinkSharedAt(null);
      setSharedLink(null);
      setPreviousModalState({
        isUrlSameForRole: true,
        url: null,
      });
    }
  }, [urlToGenericLink, currentUser]);

  // Set extensible areas (depending o the role of the user). A single option: the
  // modal it opens shares, changes and stops the shared website.
  useEffect(() => {
    if (currentUser?.presenter) {
      pluginApi.setMediaAreaItems([
        new MediaAreaOption({
          label: isSharing ? 'Sharing website' : 'Share website',
          icon: websiteIcon(isSharing),
          tooltip: isSharing ? 'Change or stop sharing the website'
            : 'Share a website into the presentation area',
          dataTest: 'genericLinkShareMediaAreaOption',
          allowed: true,
          onClick: () => {
            // Show the links being shared, not edits left from a cancelled modal
            if (sharedLinkRef.current) setPreviousModalState(sharedLinkRef.current);
            setShowModal(true);
          },
        }),
      ]);
    } else {
      pluginApi.setMediaAreaItems([]);
    }
  }, [currentUser, isSharing]);

  // Someone who joins (or reloads the page) while a link is already shared gets the
  // data-channel entry before the current user and the user metadata. Resolving the
  // placeholders then used to throw on the missing metadata and unmount the whole
  // plugin, so that user never saw the link again. Wait for both before rendering,
  // and render again if the resolved URL changes.
  const placeholdersReady = !!currentUser && (!!userData || userDataLoading === false);
  const resolvedLink = link && link !== '' && placeholdersReady
    ? replaceUrlPlaceholders(link, mergePlaceholdersList(
      currentUserPlaceholders,
      userData?.user_metadata,
    ))
    : null;

  useEffect(() => {
    if (link && link !== '' && !resolvedLink) return undefined;
    if (resolvedLink) {
      pluginApi.setGenericContentItems([]);
      // Add the new item on the next tick. Removing the old item and adding the
      // new one in the same render keeps the size of the client's presentation
      // area pile, and the client only refreshes the shown content when that
      // size changes: everyone would get the slides instead of the link.
      const timeout = setTimeout(() => {
        setGenericContentId(pluginApi.setGenericContentItems([
          new GenericContentMainArea({
            contentFunction: (element: HTMLElement) => {
              const root = ReactDOM.createRoot(element);
              contentRootRef.current = root;
              renderLinkContent(root, resolvedLink);
              return root;
            },
          }),
        ])[0]);
      }, 0);
      return () => clearTimeout(timeout);
    }
    pluginApi.setGenericContentItems([]);
    contentRootRef.current = null;
    setGenericContentId('');
    return undefined;
  }, [resolvedLink, link, linkEntryId, raiseCount]);

  useEffect(() => {
    if (!contentRootRef.current || !resolvedLink) return;
    try {
      renderLinkContent(contentRootRef.current, resolvedLink);
    } catch (err) {
      // The client already unmounted that content
      contentRootRef.current = null;
    }
  }, [currentUser?.presenter]);

  // The presentation area shows whatever reached this client last. When a client
  // reconnects, the screen share (or external video) remounts and lands on top
  // of the link, even though the link was shared after it: that user stops seeing
  // the link while the presenter still sees it. Compare server times and put the
  // link back on top when older content is covering it.
  useEffect(() => {
    if (!link || !genericContentId || !linkSharedAt || !linkEntryId) return;
    const linkIndex = currentLayout.map((gc) => (
      gc.currentElement === UiLayouts.GENERIC_CONTENT && gc.genericContentId === genericContentId
    )).lastIndexOf(true);
    if (linkIndex === -1) return;
    const coveringContent = currentLayout.slice(linkIndex + 1);
    // Area minimized: nothing to fix now, this runs again when it is restored
    if (coveringContent.length === 0 || !coveringContent[coveringContent.length - 1].isOpen) return;
    const olderContent = coveringContent.find((gc) => {
      if (gc.currentElement === UiLayouts.SCREEN_SHARE) {
        return screenshareStartedAt !== null && screenshareStartedAt < linkSharedAt;
      }
      if (gc.currentElement === UiLayouts.EXTERNAL_VIDEO) {
        return externalVideoStartedAt !== null && externalVideoStartedAt < linkSharedAt;
      }
      return false;
    });
    if (!olderContent) return;
    const contentStartedAt = olderContent.currentElement === UiLayouts.SCREEN_SHARE
      ? screenshareStartedAt : externalVideoStartedAt;
    const key = `${linkEntryId}|${olderContent.currentElement}|${contentStartedAt}`;
    const raises = raisesByContent.current[key] ?? 0;
    if (raises >= MAX_RAISES_PER_CONTENT) return;
    raisesByContent.current[key] = raises + 1;
    pluginLogger.info(`Link covered by older ${olderContent.currentElement}, putting it back on top`);
    setRaiseCount((count) => count + 1);
  }, [
    currentLayout, genericContentId, link, linkEntryId, linkSharedAt,
    screenshareStartedAt, externalVideoStartedAt,
  ]);
  return (
    <ModalToShareLink
      {...{
        setPreviousModalState,
        previousModalState,
        showModal,
        handleCloseModal,
        linkError,
        handleSendLinkToIframe,
        handleCheckboxChange,
        setLinkError,
        isShareDisabled: isSameSharedLink(previousModalState, sharedLink),
        isSharing,
        handleStopSharing,
      }}
    />
  );
}

export default GenericLinkShare;
