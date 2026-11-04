import { IntlShape } from 'react-intl';

export interface CheckboxInputComponentProps {
  intl: IntlShape;
  isUrlSameForRole: boolean;
  handleCheckboxChange: () => void;
}
