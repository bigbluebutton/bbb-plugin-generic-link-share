import {
  CurrentUserData, DataToGenericLink, DefaultLink, PlaceholderEntry, PluginSettings, UserMetadata,
} from './types';

const DEFAULT_PREFIX = 'genericLinkShare';

export function mergePlaceholdersList(
  currentUserParams?: CurrentUserData,
  userdataParams?: UserMetadata[],
): PlaceholderEntry[] {
  const placeholdersList: PlaceholderEntry[] = [];

  if (currentUserParams) {
    Object.entries(currentUserParams).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      placeholdersList.push({ placeholder, value });
    });
  }

  if (userdataParams) {
    const allowedUserdataParams = userdataParams?.filter(
      (entry) => entry.parameter.startsWith(DEFAULT_PREFIX),
    );

    allowedUserdataParams.forEach((userdata) => {
      const userdataUrlParameterPattern = `{${userdata.parameter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}}`;
      const userdataUrlValuePattern = userdata.value.replace(/[.*+?^${}()|[\]\\]/g, '');

      placeholdersList
        .push({ placeholder: userdataUrlParameterPattern, value: userdataUrlValuePattern });
    });
  }

  return placeholdersList;
}

export function replaceUrlPlaceholders(
  url: string,
  placeholdersList: PlaceholderEntry[],
): string {
  let result = url;

  placeholdersList.forEach(({ placeholder, value }) => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, encodeURIComponent(String(value)));
  });

  return result;
}

export const EMPTY_MODAL_STATE: DataToGenericLink = {
  isUrlSameForRole: true,
  url: null,
};

function readStringSetting(settings: PluginSettings | undefined, name: string): string {
  const value: unknown = settings?.[name];
  return typeof value === 'string' ? value.trim() : '';
}

// Builds the link suggested to the presenter from the plugin settings, which bbb-web fills
// with the plugin_GenericLinkShare_* parameters of the /create call (see manifest.json).
// A single URL is suggested for everyone; two different ones are split between roles.
export function getDefaultLink(settings?: PluginSettings): DefaultLink {
  const url = readStringSetting(settings, 'defaultUrl');
  const viewerUrl = readStringSetting(settings, 'defaultViewerUrl');
  const description = readStringSetting(settings, 'defaultUrlDescription');

  let modalState: DataToGenericLink = EMPTY_MODAL_STATE;
  if (url && viewerUrl && url !== viewerUrl) {
    modalState = { isUrlSameForRole: false, url, viewerUrl };
  } else if (url || viewerUrl) {
    modalState = { isUrlSameForRole: true, url: url || viewerUrl };
  }
  return { modalState, description };
}

// Whether the modal still holds the suggested link, untouched by the presenter
export function isDefaultLinkUnchanged(
  modalState: DataToGenericLink,
  defaultLink: DefaultLink,
): boolean {
  const { modalState: defaultState } = defaultLink;
  if (!defaultState.url) return false;
  return modalState.isUrlSameForRole === defaultState.isUrlSameForRole
    && (modalState.url || '') === (defaultState.url || '')
    && (modalState.isUrlSameForRole
      || (modalState.viewerUrl || '') === (defaultState.viewerUrl || ''));
}
