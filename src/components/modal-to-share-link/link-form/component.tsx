import { useState } from 'react';
import * as React from 'react';
import Iframe from 'react-iframe';
import * as Styled from './styles';
import { TextInputComponent } from './text-input/component';
import { CheckboxInputComponent } from './checkbox-input/component';
import { LinkFormProps, UrlPreview } from './types';
import { isDefaultLinkUnchanged } from '../../generic-link-share/utils';

export function LinkForm(props: LinkFormProps) {
  const {
    previousModalState,
    setPreviousModalState,
    defaultLink,
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

  // The description belongs to the suggested link: it goes away once the link is changed
  const showDefaultLinkDescription = !!defaultLink.description
    && isDefaultLinkUnchanged(previousModalState, defaultLink);

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
            isUrlSameForRole={isUrlSameForRole}
            handleCheckboxChange={handleCheckboxChange}
          />
          <TextInputComponent
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
          {showDefaultLinkDescription && (
            <Styled.DefaultLinkDescription>
              {defaultLink.description}
            </Styled.DefaultLinkDescription>
          )}
          {(isUrlAlreadyFormated || isViewerUrlAlreadyFormated) && (
            <Styled.WarningIframeMessage>
              Click show preview to check if it
              the website works correctly when embedded (recommended)
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
          Cancel
        </Styled.ButtonStyle>
        <Styled.SendingButton type="submit" value="Share as content" />
      </Styled.ButtonsWrapper>
    </Styled.FormToSendUrl>
  );
}
