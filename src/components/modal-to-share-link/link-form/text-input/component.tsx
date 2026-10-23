import * as React from 'react';
import { defineMessages } from 'react-intl';
import * as Styled from './styles';
import { TextInputComponentProps } from './types';

const intlMessages = defineMessages({
  viewerUrlLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.viewerUrl.label',
    description: 'Label of the input for the URL shown to viewers',
    defaultMessage: 'Viewer URL (It can be set later on):',
  },
  urlLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.url.label',
    description: 'Label of the input for the URL shown to everyone',
    defaultMessage: 'URL:',
  },
  presenterUrlLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.presenterUrl.label',
    description: 'Label of the input for the URL shown to the presenter',
    defaultMessage: 'Presenter URL:',
  },
  showPreviewButtonLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.showPreviewButton.label',
    description: 'Label of the button that shows a preview of the link',
    defaultMessage: 'Show preview',
  },
  hidePreviewButtonLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.hidePreviewButton.label',
    description: 'Label of the button that hides the preview of the link',
    defaultMessage: 'Hide preview',
  },
});

export function TextInputComponent(props: TextInputComponentProps) {
  const {
    intl,
    setPreviousModalState,
    isUrlSameForRole,
    isUrlAlreadyFormated,
    isUrlPreviewing,
    urlToPreview,
    url,
    isViewer,
    setUrlToPreview,
  } = props;

  let label: string;
  if (isViewer) {
    label = intl.formatMessage(intlMessages.viewerUrlLabel);
  } else if (isUrlSameForRole) {
    label = intl.formatMessage(intlMessages.urlLabel);
  } else {
    label = intl.formatMessage(intlMessages.presenterUrlLabel);
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
            {intl.formatMessage(!isUrlPreviewing
              ? intlMessages.showPreviewButtonLabel
              : intlMessages.hidePreviewButtonLabel)}
          </Styled.ButtonStyle>
        )}
      </div>
    </Styled.FormToSendUrlItem>
  );
}
