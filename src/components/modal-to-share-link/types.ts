import { IntlShape } from 'react-intl';
import { DataToGenericLink } from '../generic-link-share/types';

export interface ModalToShareLinkProps {
    intl: IntlShape;
    previousModalState: DataToGenericLink;
    setPreviousModalState: React.Dispatch<React.SetStateAction<DataToGenericLink>>;
    showModal: boolean;
    handleCloseModal: () => void;
    linkError: string;
    setLinkError: React.Dispatch<React.SetStateAction<string>>;
    handleSendLinkToIframe: (e: React.SyntheticEvent) => void;
    handleCheckboxChange: () => void
}
export interface UrlPreview {
    url: string;
    isViewer: boolean;
  }

export interface ButtonStyleProps {
    color?: string;
}

export interface LinkTag {
    title: string;
    viewer: string;
    presenter?: string;
}
