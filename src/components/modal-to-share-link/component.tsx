import * as React from 'react';
import { useEffect, useState } from 'react';

import * as Styled from './styles';

import { ModalToShareLinkProps } from './types';
import { REGEX } from '../generic-link-share/constants';
import { LinkForm } from './link-form/component';

export function ModalToShareLink(props: ModalToShareLinkProps) {
  const {
    previousModalState,
    setPreviousModalState,
    showModal,
    handleCloseModal,
    linkError,
    handleSendLinkToIframe,
    handleCheckboxChange,
    setLinkError,
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
        <h1 style={{ margin: '5px 0' }}>Share your link</h1>
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
              previousModalState={previousModalState}
              setPreviousModalState={setPreviousModalState}
              handleCloseModal={handleCloseModal}
              handleSendLinkToIframe={handleSendLinkToIframe}
              handleCheckboxChange={handleCheckboxChange}
              isUrlAlreadyFormated={isUrlAlreadyFormated}
              isViewerUrlAlreadyFormated={isViewerUrlAlreadyFormated}
            />
          ) : (
            <div>
              <h1>Error: </h1>
              <Styled.ErrorContentBlock>
                <Styled.ErrorSpan>{linkError}</Styled.ErrorSpan>
                <Styled.ButtonStyle onClick={() => setLinkError(null)}>
                  clear
                </Styled.ButtonStyle>
              </Styled.ErrorContentBlock>
            </div>
          )}
        </div>
      </div>
    </Styled.PluginModal>
  );
}
