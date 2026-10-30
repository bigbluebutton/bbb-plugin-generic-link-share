import * as React from 'react';
import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';

import * as Styled from './styles';

import { ModalToShareLinkProps } from './types';
import { REGEX } from '../generic-link-share/constants';
import { LinkForm } from './link-form/component';

const intlMessages = defineMessages({
  title: {
    id: 'genericLinkSharePlugin.modal.title',
    description: 'Title of the modal to share a link',
    defaultMessage: 'Share your link',
  },
  errorTitle: {
    id: 'genericLinkSharePlugin.modal.error.title',
    description: 'Title shown above an error message in the modal',
    defaultMessage: 'Error:',
  },
  clearErrorButtonLabel: {
    id: 'genericLinkSharePlugin.modal.error.clearButton.label',
    description: 'Label of the button that dismisses the error message in the modal',
    defaultMessage: 'clear',
  },
});

export function ModalToShareLink(props: ModalToShareLinkProps) {
  const {
    intl,
    previousModalState,
    setPreviousModalState,
    showModal,
    handleCloseModal,
    linkError,
    handleSendLinkToIframe,
    handleCheckboxChange,
    setLinkError,
    isShareDisabled,
  } = props;

  const [isUrlAlreadyFormated, setIsUrlAlreadyFormated] = useState<boolean>(false);
  const [isViewerUrlAlreadyFormated, setIsViewerUrlAlreadyFormated] = useState<boolean>();

  const {
    url: incomingUrl,
    viewerUrl: incomingViewerUrl,
  } = previousModalState;

  const url = incomingUrl || '';
  const viewerUrl = incomingViewerUrl || '';

  useEffect(() => {
    if (url.match(REGEX)) {
      setIsUrlAlreadyFormated(true);
    } else setIsUrlAlreadyFormated(false);
    if (viewerUrl.match(REGEX)) {
      setIsViewerUrlAlreadyFormated(true);
    } else setIsViewerUrlAlreadyFormated(false);
  }, [previousModalState]);

  return showModal && (
    <Styled.PluginModal
      portalClassName="modal-low"
      parentSelector={() => document.querySelector('#modals-container')}
      overlayClassName="modalOverlay"
      ariaHideApp={false}
      isOpen={showModal}
      onRequestClose={handleCloseModal}
    >
      <Styled.ClickableClose
        type="button"
        onClick={() => {
          handleCloseModal();
        }}
      >
        <i className="icon-bbb-close" />
      </Styled.ClickableClose>
      <div
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          display: 'flex',
        }}
      >
        <h1 style={{ margin: '5px 0' }}>{intl.formatMessage(intlMessages.title)}</h1>
        <div
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyItems: 'center',
          }}
        >
          {!linkError ? (
            <LinkForm
              intl={intl}
              previousModalState={previousModalState}
              setPreviousModalState={setPreviousModalState}
              handleCloseModal={handleCloseModal}
              handleSendLinkToIframe={handleSendLinkToIframe}
              handleCheckboxChange={handleCheckboxChange}
              isUrlAlreadyFormated={isUrlAlreadyFormated}
              isViewerUrlAlreadyFormated={isViewerUrlAlreadyFormated}
              isShareDisabled={isShareDisabled}
            />
          ) : (
            <div>
              <h1>{intl.formatMessage(intlMessages.errorTitle)}</h1>
              <Styled.ErrorContentBlock>
                <Styled.ErrorSpan>{linkError}</Styled.ErrorSpan>
                <Styled.ButtonStyle onClick={() => setLinkError(null)}>
                  {intl.formatMessage(intlMessages.clearErrorButtonLabel)}
                </Styled.ButtonStyle>
              </Styled.ErrorContentBlock>
            </div>
          )}
        </div>
      </div>
    </Styled.PluginModal>
  );
}
