import * as React from 'react';
import * as Styled from './styles';
import { TextInputComponentProps } from './types';

export function TextInputComponent(props: TextInputComponentProps) {
  const {
    setPreviousModalState,
    isUrlSameForRole,
    isUrlAlreadyFormated,
    isUrlPreviewing,
    urlToPreview,
    url,
    isViewer,
    setUrlToPreview,
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Opening the modal with no link yet: put the cursor in the field, ready to paste
  React.useEffect(() => {
    if (!isViewer && !url) inputRef.current?.focus();
  }, []);

  let label: string;
  if (isViewer) {
    label = 'Viewer URL (It can be set later on):';
  } else if (isUrlSameForRole) {
    label = 'URL: ';
  } else {
    label = 'Presenter URL: ';
  }
  const styleOfLabelInPreviewMode: React.CSSProperties = !isUrlSameForRole
    ? { marginBottom: '1rem' }
    : null;

  const styleOfPreviewButtonWrapper: React.CSSProperties = urlToPreview
    ? { display: 'flex', flexDirection: 'column' }
    : { display: 'flex' };
  const styleOfPreviewButton: React.CSSProperties = !urlToPreview
    ? { marginLeft: '3px' }
    : { marginTop: '5px' };

  return (
    <Styled.FormToSendUrlItem
      style={styleOfLabelInPreviewMode}
      as="label"
      htmlFor="link-receiver"
    >
      <Styled.LabelForm>
        {label}
      </Styled.LabelForm>
      <div style={styleOfPreviewButtonWrapper}>
        <Styled.LabelFormTextInput
          id="link-receiver"
          ref={inputRef}
          value={url}
          type="text"
          name="link"
          placeholder="https://..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPreviousModalState((p) => {
              const newState = (isViewer) ? ({
                isUrlSameForRole: p?.isUrlSameForRole,
                url: p?.url,
                viewerUrl: e?.target?.value,
              }) : ({
                isUrlSameForRole: p?.isUrlSameForRole,
                url: e?.target?.value,
                viewerUrl: p?.viewerUrl,
              });
              return newState;
            });
          }}
        />
        {(isUrlAlreadyFormated || isUrlPreviewing) && (
          <Styled.ButtonStyle
            style={styleOfPreviewButton}
            type="button"
            onClick={() => {
              if (!isUrlPreviewing) {
                setUrlToPreview({ url, isViewer });
              } else {
                setUrlToPreview(null);
              }
            }}
          >
            {!isUrlPreviewing ? 'Show preview' : 'Hide preview'}
          </Styled.ButtonStyle>
        )}
      </div>
    </Styled.FormToSendUrlItem>
  );
}
