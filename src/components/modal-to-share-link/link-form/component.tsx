import { useState } from 'react';
import * as React from 'react';
import Iframe from 'react-iframe';
import { defineMessages } from 'react-intl';
import * as Styled from './styles';
import { TextInputComponent } from './text-input/component';
import { CheckboxInputComponent } from './checkbox-input/component';
import { LinkFormProps, UrlPreview } from './types';

const intlMessages = defineMessages({
  previewWarning: {
    id: 'genericLinkSharePlugin.modal.linkForm.previewWarning',
    description: 'Hint recommending to preview the link before sharing it',
    defaultMessage: 'Click show preview to check if the website works correctly when embedded (recommended)',
  },
  cancelButtonLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.cancelButton.label',
    description: 'Label of the button that closes the modal without sharing',
    defaultMessage: 'Cancel',
  },
  shareButtonLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.shareButton.label',
    description: 'Label of the button that shares the link as content',
    defaultMessage: 'Share as content',
  },
});

export function LinkForm(props: LinkFormProps) {
  const {
    intl,
    previousModalState,
    setPreviousModalState,
    handleCloseModal,
    handleSendLinkToIframe,
    handleCheckboxChange,
    isUrlAlreadyFormated,
    isViewerUrlAlreadyFormated,
  } = props;

  const {
    isUrlSameForRole = true,
    url: incomingUrl,
    viewerUrl: incomingViewerUrl,
  } = previousModalState;

  const url = incomingUrl || '';
  const viewerUrl = incomingViewerUrl || '';

  const [urlToPreview, setUrlToPreview] = useState<UrlPreview>(null);

  const isUrlPreviewing = urlToPreview && !urlToPreview?.isViewer;
  const isViewerUrlPreviewing = !!urlToPreview?.isViewer;
  React.useEffect(() => {
    const hasUrlChange = urlToPreview && ((
      urlToPreview.isViewer && urlToPreview.url !== previousModalState.viewerUrl
    ) || (!urlToPreview.isViewer && urlToPreview.url !== previousModalState.url));
    if (hasUrlChange) {
      setUrlToPreview(null);
    }
  }, [previousModalState]);
  return (
    <Styled.FormToSendUrl onSubmit={handleSendLinkToIframe}>
      <Styled.FormWrapper>
        {urlToPreview && (
          <div style={{ height: '40vh', width: '100%' }}>
            <Iframe url={urlToPreview.url} width="100%" height="100%" display="block" position="relative" />
          </div>
        )}
        <Styled.FormBody>
          <CheckboxInputComponent
            intl={intl}
            isUrlSameForRole={isUrlSameForRole}
            handleCheckboxChange={handleCheckboxChange}
          />
          <TextInputComponent
            intl={intl}
            setPreviousModalState={setPreviousModalState}
            isUrlSameForRole={isUrlSameForRole}
            isUrlAlreadyFormated={isUrlAlreadyFormated}
            isUrlPreviewing={isUrlPreviewing}
            urlToPreview={urlToPreview}
            url={url}
            setUrlToPreview={setUrlToPreview}
            isViewer={false}
          />
          {!isUrlSameForRole && (
            <TextInputComponent
              intl={intl}
              setPreviousModalState={setPreviousModalState}
              isUrlSameForRole={isUrlSameForRole}
              isUrlAlreadyFormated={isViewerUrlAlreadyFormated}
              isUrlPreviewing={isViewerUrlPreviewing}
              urlToPreview={urlToPreview}
              setUrlToPreview={setUrlToPreview}
              url={viewerUrl}
              isViewer
            />
          )}
          {(isUrlAlreadyFormated || isViewerUrlAlreadyFormated) && (
            <Styled.WarningIframeMessage>
              {intl.formatMessage(intlMessages.previewWarning)}
            </Styled.WarningIframeMessage>
          )}
        </Styled.FormBody>
      </Styled.FormWrapper>
      <Styled.BottomSeparator />
      <Styled.ButtonsWrapper>
        <Styled.ButtonStyle
          style={{ marginRight: '.3rem' }}
          color="secondary"
          onClick={() => {
            setUrlToPreview(null);
            handleCloseModal();
          }}
        >
          {intl.formatMessage(intlMessages.cancelButtonLabel)}
        </Styled.ButtonStyle>
        <Styled.SendingButton type="submit" value={intl.formatMessage(intlMessages.shareButtonLabel)} />
      </Styled.ButtonsWrapper>
    </Styled.FormToSendUrl>
  );
}
