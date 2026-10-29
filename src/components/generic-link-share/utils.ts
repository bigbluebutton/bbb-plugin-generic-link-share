import {
  CurrentUserData, DataToGenericLink, PlaceholderEntry, UserMetadata,
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

// Whether sharing these links would only repeat the link already shared. The viewer
// URL only counts when the roles get different URLs.
export function isSameSharedLink(
  newLink: DataToGenericLink,
  sharedLink?: DataToGenericLink | null,
): boolean {
  if (!sharedLink) return false;
  const isUrlSameForRole = newLink.isUrlSameForRole ?? true;
  if (isUrlSameForRole !== (sharedLink.isUrlSameForRole ?? true)) return false;
  if ((newLink.url || '') !== (sharedLink.url || '')) return false;
  return isUrlSameForRole || (newLink.viewerUrl || '') === (sharedLink.viewerUrl || '');
}
