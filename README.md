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
