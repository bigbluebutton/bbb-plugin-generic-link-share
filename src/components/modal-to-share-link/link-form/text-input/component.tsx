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
  // Each input needs its own name and id: the submit handler reads them by name
  // (`link` and `viewerLink`), and a shared name would turn `form.link` into a list
  const inputName = isViewer ? 'viewerLink' : 'link';
  const inputId = isViewer ? 'viewer-link-receiver' : 'link-receiver';

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
      htmlFor={inputId}
    >
      <Styled.LabelForm>
        {label}
      </Styled.LabelForm>
      <div style={styleOfPreviewButtonWrapper}>
        <Styled.LabelFormTextInput
          id={inputId}
          ref={inputRef}
          value={url}
          type="text"
          name={inputName}
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
