import { DataToGenericLink, DefaultLink } from '../../generic-link-share/types';

export interface LinkFormProps {
    previousModalState: DataToGenericLink;
    setPreviousModalState: React.Dispatch<React.SetStateAction<DataToGenericLink>>;
    defaultLink: DefaultLink;
    handleCloseModal: () => void;
    handleSendLinkToIframe: (e: React.SyntheticEvent) => void;
    handleCheckboxChange: () => void;
    isUrlAlreadyFormated: boolean;
    isViewerUrlAlreadyFormated: boolean;
    isShareDisabled: boolean;
}

export interface UrlPreview {
    url: string;
    isViewer: boolean;
}

export interface FormToSendUrlItemProps {
    isCheckboxItem?: boolean;
}

export interface ButtonStyleProps {
    color?: string;
}

export interface LinkTag {
    title: string;
    viewer: string;
    presenter?: string;
}
