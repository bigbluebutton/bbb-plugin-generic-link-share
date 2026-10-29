const MEETING_SUBSCRIPTION = `
subscription MeetingSubscription {
    meeting {
        externalVideo {
            playerPlaying
            externalVideoUrl
        }
    }
}
`;

// Join userdata does not change during the session: a query, not a subscription
const USER_METADATA = `
 query {
    user_metadata {
        parameter
        value
    }
}
`;

export { MEETING_SUBSCRIPTION, USER_METADATA };
