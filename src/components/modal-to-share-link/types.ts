import { DataToGenericLink, DefaultLink } from '../generic-link-share/types';

export interface ModalToShareLinkProps {
    previousModalState: DataToGenericLink;
    setPreviousModalState: React.Dispatch<React.SetStateAction<DataToGenericLink>>;
    defaultLink: DefaultLink;
    showModal: boolean;
    handleCloseModal: () => void;
    linkError: string;
    setLinkError: React.Dispatch<React.SetStateAction<string>>;
    handleSendLinkToIframe: (e: React.SyntheticEvent) => void;
    handleCheckboxChange: () => void;
    isShareDisabled: boolean;
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
