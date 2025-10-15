import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  ActionButtonDropdownOption,
  ActionButtonDropdownSeparator,
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
  UserMetadataGraphqlResponse,
} from './types';
import { ModalToShareLink } from '../modal-to-share-link/component';
import { LinkTag } from '../modal-to-share-link/types';
import { REGEX } from './constants';
import { mergePlaceholdersList, replaceUrlPlaceholders } from './utils';
import { USER_METADATA } from './subscription';

function GenericLinkShare(
  { pluginUuid: uuid }: GenericLinkShareProps,
): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
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
          label: `Play ${tag.title}`,
          tooltip: 'A generic link tag has been detected in this slide, show it to all?',
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
    if (objectToDispatch) {
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
    if (currentUser?.presenter) {
      const actionDropdownItemsToRender = [
        new ActionButtonDropdownSeparator(),
      ];
      if (showingPresentationContent) {
        actionDropdownItemsToRender.push(new ActionButtonDropdownOption({
          label: 'Edit link(s)',
          icon: 'copy',
          tooltip: 'Edit previously set links',
          allowed: true,
          onClick: () => {
            setShowModal(true);
          },
        }));
      }
      actionDropdownItemsToRender.push(new ActionButtonDropdownOption({
        label: showingPresentationContent ? 'Remove link share' : 'Share Website Link as Content',
        icon: 'copy',
        tooltip: showingPresentationContent ? 'Remove generic link from presentation area'
          : 'Share a generic link into the presentation area',
        allowed: true,
        onClick: showingPresentationContent ? () => {
          deleteEntryUrlToGenericLink([RESET_DATA_CHANNEL]);
          setShowingPresentationContent(false);
        } : () => {
          setShowModal(true);
        },
      }));
      pluginApi.setActionButtonDropdownItems(actionDropdownItemsToRender);
    } else {
      pluginApi.setActionButtonDropdownItems([]);
    }
  }, [currentUser, showingPresentationContent]);

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
      }}
    />
  );
}

export default GenericLinkShare;
