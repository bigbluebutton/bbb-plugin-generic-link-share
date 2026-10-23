# Generic Sharing of a Webpage

## What is it?

This plugin is one of the official BigBlueButton plugins. It basically opens up a link that the presenter wants. That might be a video, a document, or anything that supports being rendered in an iFrame.

## Building the Plugin

To build the plugin for production use, follow these steps:

```bash
cd $HOME/src/bbb-plugin-generic-link-share
npm ci
npm run build-bundle
```

The above commands will generate the `dist` folder, containing the bundled JavaScript file named `GenericLinkShare.js`. This file can be hosted on any HTTPS server along with its `manifest.json`.

If you install the plugin separated from the manifest, remember to change the `javascriptEntrypointUrl` in the `manifest.json` to the correct endpoint.

To use the plugin in BigBlueButton, send this parameter along in create call:

```
pluginManifests=[{"url":"<your-domain>/path/to/manifest.json"}]
```

Or additionally, you can add this same configuration in the `.properties` file from `bbb-web` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`


## Default URL

A link can be suggested to the presenter when the meeting is created. The first time the presenter opens the plugin (and whenever no link is being shared), the share form comes filled with it, so they only need to click "Share as content".

It is set with these `/create` parameters:

| Parameter | Description |
|-----------|-------------|
| `plugin_GenericLinkShare_default-url` | URL suggested to the presenter. When it is the only URL given, it is suggested for everyone ("Same URL for presenter and viewers" stays checked). |
| `plugin_GenericLinkShare_default-viewer-url` | URL suggested for the viewers. When it differs from `default-url`, "Same URL for presenter and viewers" comes unchecked with each URL in its field. |
| `plugin_GenericLinkShare_default-url-description` | Text shown below the suggested URL(s), to tell the presenter what the link is. It disappears as soon as the presenter changes the link. |

Example:

```
plugin_GenericLinkShare_default-url=https://example.com/vote/{genericLinkShare_poll}
plugin_GenericLinkShare_default-url-description=Voting page for this meeting
```

The suggested URL may use the [URL placeholders](#url-placeholders) below, which are replaced for each participant when the link is shown.

These parameters reach the plugin through the `settingsSchema` of `manifest.json`: `bbb-web` writes each value into the `defaultValue` of the matching setting, and the settings are marked as required only so that BigBlueButton applies that default; when a parameter is not sent, its setting is an empty string and nothing is suggested. The values are inserted as-is into the manifest JSON, so they must not contain double quotes (`"`) or backslashes (`\`). The same settings can also be set server-wide in `/etc/bigbluebutton/bbb-html5.yml` (`defaultUrl`, `defaultViewerUrl` and `defaultUrlDescription` under the `GenericLinkShare` plugin), which take precedence over the `/create` parameters.

## URL Placeholders

When sharing a link, you can use placeholders in the URL that will be dynamically replaced with user or session information. This allows you to personalize the shared content for each participant.

### Supported Placeholders

- `{name}`: The user's display name
- `{extId}`: The user's external ID
- `{role}`: The user's role
- `{presenter}`: `true` if the user is a presenter, otherwise `false`
- `{genericLinkShare_KEY}`: Any additional user metadata field, where `KEY` is the metadata key name (e.g., `{genericLinkShare_info}` will be replaced with the user's *info* if available)

**Note:**  
To use user metadata as a placeholder, the metadata key must start with the prefix `genericLinkShare_`. 
For example, if the metadata is `{genericLinkShare_mykey}`, in the join call, it is necessary to send:

```
  userdata-genericLinkShare_mykey=abc_example
```


If additional user metadata is available, you can also use placeholders matching those metadata keys.


### Example

If you enter the following link to share:

```
https://bigbluebutton.org/?name={name}&id={extId}&role={role}&presenter={presenter}&pass={genericLinkShare_mykey}
```

Each participant will see a personalized link with their own name, role, and the value of `genericLinkShare_mykey` (if set) substituted in the URL.

### Security

Sensitive placeholders are replaced securely to prevent injection or misuse. Only the placeholders listed above and those present in user metadata with the `genericLinkShare_` prefix are supported.

## Development mode

As for development mode (running this plugin from source), please, refer back to https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk section `Running the Plugin from Source`
