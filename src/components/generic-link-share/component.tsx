import * as React from 'react';
import { useEffect, useState } from 'react';
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
import { defineMessages } from 'react-intl';
import { parseTags } from '../utils';
import { useGetInternationalization } from '../../commons/hooks';

import GenericComponentLinkShare from '../generic-component/component';

import {
  CurrentUserData,
  DataToGenericLink,
  GenericLinkShareProps,
  UserMetadataGraphqlResponse,
} from './types';
import { ModalToShareLink } from '../modal-to-share-link/component';
import { LinkTag } from '../modal-to-share-link/types';
import { REGEX } from './constants';
import { mergePlaceholdersList, replaceUrlPlaceholders } from './utils';
import { USER_METADATA } from './subscription';

const intlMessages = defineMessages({
  presentationToolbarButtonLabel: {
    id: 'genericLinkSharePlugin.presentationToolbar.playButton.label',
    description: 'Label of the presentation toolbar button that shares a link tag found in the slide',
    defaultMessage: 'Play {title}',
  },
  presentationToolbarButtonTooltip: {
    id: 'genericLinkSharePlugin.presentationToolbar.playButton.tooltip',
    description: 'Tooltip of the presentation toolbar button that shares a link tag found in the slide',
    defaultMessage: 'A generic link tag has been detected in this slide, show it to all?',
  },
  editLinksLabel: {
    id: 'genericLinkSharePlugin.mediaArea.editLinks.label',
    description: 'Label of the media area option to edit the shared link(s)',
    defaultMessage: 'Edit link(s)',
  },
  editLinksTooltip: {
    id: 'genericLinkSharePlugin.mediaArea.editLinks.tooltip',
    description: 'Tooltip of the media area option to edit the shared link(s)',
    defaultMessage: 'Edit previously set links',
  },
  removeLinkShareLabel: {
    id: 'genericLinkSharePlugin.mediaArea.removeLinkShare.label',
    description: 'Label of the media area option to stop sharing the link',
    defaultMessage: 'Remove link share',
  },
  removeLinkShareTooltip: {
    id: 'genericLinkSharePlugin.mediaArea.removeLinkShare.tooltip',
    description: 'Tooltip of the media area option to stop sharing the link',
    defaultMessage: 'Remove generic link from presentation area',
  },
  shareLinkLabel: {
    id: 'genericLinkSharePlugin.mediaArea.shareLink.label',
    description: 'Label of the media area option to share a link',
    defaultMessage: 'Share Website Link as Content',
  },
  shareLinkTooltip: {
    id: 'genericLinkSharePlugin.mediaArea.shareLink.tooltip',
    description: 'Tooltip of the media area option to share a link',
    defaultMessage: 'Share a generic link into the presentation area',
  },
  malformedLinkError: {
    id: 'genericLinkSharePlugin.modal.error.malformedLink',
    description: 'Error shown when the link typed in the modal is not a valid URL',
    defaultMessage: 'Link is malformed, please insert a valid one',
  },
});

function GenericLinkShare(
  { pluginUuid: uuid }: GenericLinkShareProps,
): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  const { intl } = useGetInternationalization(pluginApi);
  const userMetaDataSubscription = pluginApi
    .useCustomSubscription<UserMetadataGraphqlResponse>(USER_METADATA);
  const { data: currentUser } = pluginApi.useCurrentUser();
  const { data: urlToGenericLink, pushEntry: pushEntryUrlToGenericLink, deleteEntry: deleteEntryUrlToGenericLink } = pluginApi.useDataChannel<DataToGenericLink>('urlToGenericLink');
  const { data: userData } = userMetaDataSubscription;
  const currentPresentationResponse = pluginApi.useCurrentPresentation();
  const currentLayout = pluginApi.useUiData(LayoutPresentationAreaUiDataNames.CURRENT_ELEMENT, [{
    isOpen: true,
    currentElement: UiLayouts.WHITEBOARD,
  }]);
  const [genericContentId, setGenericContentId] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showingPresentationContent, setShowingPresentationContent] = useState(false);
  const [link, setLink] = useState<string>(null);
  const [linkError, setLinkError] = useState<string>(null);
  const [previousModalState, setPreviousModalState] = useState<DataToGenericLink>({
    isUrlSameForRole: true,
    url: null,
  });

  const currentUserPlaceholders: CurrentUserData = {
    name: currentUser?.name ?? '',
    extId: currentUser?.extId ?? '',
    role: currentUser?.role ?? '',
    presenter: !!currentUser?.presenter,
  };

  useEffect(() => {
    const isGenericComponentInPile = currentLayout.some((gc) => (
      gc.currentElement === UiLayouts.GENERIC_CONTENT
      && gc.genericContentId === genericContentId
    ));
    if (isGenericComponentInPile) {
      setShowingPresentationContent(true);
    } else setShowingPresentationContent(false);
  }, [currentLayout]);

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

  const handleChangePresentationAreaContent = (changeToShare: boolean) => {
    if (!changeToShare) {
      setShowingPresentationContent(false);
    } else {
      setShowingPresentationContent(true);
    }
  };

  const requestCurrentPage = (currentTxtUri: string) => fetch(currentTxtUri)
    .then((response) => response.text());

  const addButtonsToPresentationToolbar = (tags : LinkTag[]) => {
    if (currentUser?.presenter) {
      const buttons = tags.map((tag) => (
        new PresentationToolbarButton({
          label: intl.formatMessage(
            intlMessages.presentationToolbarButtonLabel,
            { title: tag.title },
          ),
          tooltip: intl.formatMessage(intlMessages.presentationToolbarButtonTooltip),
          style: {},
          onClick: () => {
            deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
            pushEntryUrlToGenericLink({
              url: tag.presenter,
              isUrlSameForRole: tag.presenter === tag.viewer,
              viewerUrl: tag.viewer,
            });
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
    if (intl && currentUser?.presenter) handleFetchPresentationData(currentPresentation);
  }, [currentPresentationResponse, currentUser, intl]);

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
    if (objectToDispatch) {
      deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
      pushEntryUrlToGenericLink(objectToDispatch);
      setShowModal(false);
    } else {
      setLinkError(intl.formatMessage(intlMessages.malformedLinkError));
    }
  };

  // Receiving URL data and persisting it to be inserted in the iframe later on
  useEffect(() => {
    if (
      urlToGenericLink.data
      && urlToGenericLink
        .data[urlToGenericLink.data.length - 1]?.payloadJson
    ) {
      setPreviousModalState(urlToGenericLink
        .data[
          urlToGenericLink.data.length - 1]?.payloadJson);
      const isUrlTheSame = urlToGenericLink
        .data[
          urlToGenericLink.data.length - 1
        ]?.payloadJson.isUrlSameForRole;
      if (!isUrlTheSame && !currentUser.presenter) {
        const viewerUrl = urlToGenericLink
          .data[
            urlToGenericLink.data.length - 1
          ]?.payloadJson.viewerUrl;
        if (viewerUrl) {
          setLink(viewerUrl);
          handleChangePresentationAreaContent(true);
        }
      } else {
        setLink(urlToGenericLink
          .data[
            urlToGenericLink.data.length - 1
          ]?.payloadJson.url);
        handleChangePresentationAreaContent(true);
      }
    } else if (
      urlToGenericLink.data
      && !urlToGenericLink
        .data[urlToGenericLink.data.length - 1]?.payloadJson
    ) {
      setLink(null);
      setPreviousModalState({
        isUrlSameForRole: true,
        url: null,
      });
      handleChangePresentationAreaContent(false);
    }
  }, [urlToGenericLink, currentUser]);

  // Set extensible areas (depending o the role of the user)
  useEffect(() => {
    if (!intl) return;
    if (currentUser?.presenter) {
      const mediaAreaItemsToRender = [];
      if (showingPresentationContent) {
        mediaAreaItemsToRender.push(new MediaAreaOption({
          label: intl.formatMessage(intlMessages.editLinksLabel),
          icon: { iconName: 'copy' },
          tooltip: intl.formatMessage(intlMessages.editLinksTooltip),
          allowed: true,
          onClick: () => {
            setShowModal(true);
          },
        }));
      }
      mediaAreaItemsToRender.push(new MediaAreaOption({
        label: intl.formatMessage(showingPresentationContent
          ? intlMessages.removeLinkShareLabel
          : intlMessages.shareLinkLabel),
        icon: { iconName: 'copy' },
        tooltip: intl.formatMessage(showingPresentationContent
          ? intlMessages.removeLinkShareTooltip
          : intlMessages.shareLinkTooltip),
        allowed: true,
        onClick: showingPresentationContent ? () => {
          deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
          setShowingPresentationContent(false);
        } : () => {
          setShowModal(true);
        },
      }));
      pluginApi.setMediaAreaItems(mediaAreaItemsToRender);
    } else {
      pluginApi.setMediaAreaItems([]);
    }
  }, [currentUser, showingPresentationContent, intl]);

  useEffect(() => {
    if (link && link !== '') {
      const placeholdersList = mergePlaceholdersList(
        currentUserPlaceholders,
        userData.user_metadata,
      );
      pluginApi.setGenericContentItems([]);
      setGenericContentId(pluginApi.setGenericContentItems([
        new GenericContentMainArea({
          contentFunction: (element: HTMLElement) => {
            const root = ReactDOM.createRoot(element);
            root.render(
              <GenericComponentLinkShare
                link={replaceUrlPlaceholders(link, placeholdersList)}
              />,
            );
            return root;
          },
        }),
      ])[0]);
    } else {
      pluginApi.setGenericContentItems([]);
    }
  }, [link]);

  if (!intl) return null;

  return (
    <ModalToShareLink
      {...{
        intl,
        setPreviousModalState,
        previousModalState,
        showModal,
        handleCloseModal,
        linkError,
        handleSendLinkToIframe,
        handleCheckboxChange,
        setLinkError,
      }}
    />
  );
}

export default GenericLinkShare;
