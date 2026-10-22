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

// Fields of the meeting already subscribed by the client and delivered through
// useMeetingData. The screen share comes in the same object but is not typed in the SDK.
export interface PresentationAreaContentTimes {
    screenshare?: { startedAt?: string | number | null } | null;
    externalVideo?: {
        externalVideoUrl?: string | null;
        startedSharingAt?: string | number | null;
    } | null;
}

export interface PlaceholderEntry {
  placeholder: string;
  value: string | boolean;
}

export { GenericLinkShareProps, ExternalVideoMeetingSubscription, DataToGenericLink };
