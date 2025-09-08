interface GenericLinkShareProps {
    pluginName: string,
    pluginUuid: string,
}

interface ExternalVideoMeetingSubscription {
    meeting: {
        externalVideo: {
            playerPlaying: boolean
            externalVideoUrl: string
        }
    }[]
}

interface DataToGenericLink {
    isUrlSameForRole: boolean;
    url: string;
    viewerUrl?: string
}

export interface CurrentUserData {
  name: string;
  extId: string;
  role: string;
  presenter: boolean;
}

export interface UserMetadata {
    parameter: string;
    value: string;
}

export interface UserMetadataGraphqlResponse {
    user_metadata: UserMetadata[];
}

export interface PlaceholderEntry {
  placeholder: string;
  value: string | boolean;
}

export { GenericLinkShareProps, ExternalVideoMeetingSubscription, DataToGenericLink };
