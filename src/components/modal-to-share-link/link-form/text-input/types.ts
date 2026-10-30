import { IntlShape } from 'react-intl';
import { DataToGenericLink } from '../../../generic-link-share/types';
import { UrlPreview } from '../types';

export interface TextInputComponentProps {
  intl: IntlShape;
  setPreviousModalState: React.Dispatch<React.SetStateAction<DataToGenericLink>>;
  isUrlSameForRole: boolean;
  isUrlAlreadyFormated: boolean;
  isUrlPreviewing: boolean;
  urlToPreview: UrlPreview;
  url: string;
  isViewer: boolean;
  setUrlToPreview: React.Dispatch<React.SetStateAction<UrlPreview>>;
}

export interface ButtonStyleProps {
  color?: string;
}
