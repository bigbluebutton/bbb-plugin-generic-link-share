import * as React from 'react';
import { defineMessages } from 'react-intl';
import * as Styled from './styles';
import { CheckboxInputComponentProps } from './types';

const intlMessages = defineMessages({
  sameUrlForRolesLabel: {
    id: 'genericLinkSharePlugin.modal.linkForm.sameUrlForRoles.label',
    description: 'Label of the checkbox to use the same URL for presenter and viewers',
    defaultMessage: 'Same URL for presenter and viewers',
  },
});

export function CheckboxInputComponent(props: CheckboxInputComponentProps) {
  const {
    intl,
    isUrlSameForRole,
    handleCheckboxChange,
  } = props;
  return (
    <Styled.FormToSendUrlItem isCheckboxItem as="label" htmlFor="same-links-for-pres-viewer">
      <input
        id="same-links-for-pres-viewer"
        type="checkbox"
        name="isUrlSameForRole"
        checked={isUrlSameForRole}
        onChange={handleCheckboxChange}
      />
      <Styled.LabelFormCheckbox>
        {intl.formatMessage(intlMessages.sameUrlForRolesLabel)}
      </Styled.LabelFormCheckbox>
    </Styled.FormToSendUrlItem>
  );
}
