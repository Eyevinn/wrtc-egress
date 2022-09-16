# Standardized WebRTC Egress Endpoint Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Slack](http://slack.streamingtech.se/badge.svg)](http://slack.streamingtech.se)

Server endpoint for standardized WebRTC based streaming. Currently supports the following egress / playback protocol:
- WHPP: [WebRTC HTTP Playback Protocol](https://github.com/Eyevinn/webrtc-http-playback-protocol/blob/master/webrtc-http-playback-protocol.md)

And support for the following SFUs:
- Symphony Media Bridge (`SfuType.smb`)

![Example of a setup using WHIP and WHPP](docs/webrtc_egress_endpoint.png)

## Usage

Install library

```
npm install --save @eyevinn/wrtc-egress
```

### WHPP Example

Use WHPP as egress protocol and Symphony Media Bridge as SFU.

```javascript
import { WHPPEndpoint, SfuType } from "@eyevinn/wrtc-egress";

const endpoint = new WHPPEndpoint({
  port: 8001,
  hostname: "wrtc-edge.eyevinn.technology",
  prefix: "/whpp",
  sfuAdapter: SfuType.smb,
  sfuOptions: { smbUrl: "http://localhost:8080/conferences/", apiKey: "secret" },
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});
endpoint.listen();
```

When running an HTTP API for managing the channel is available at `/api/channels` by default. 

Access to WHPP endpoint at `/whpp/channels`.

## API

| Resource  | HTTP Method | Description |
| --------  | ------ | ----------- |
| `/api/docs` | GET | Online API docs |
| `/api/channels/:channelId` | POST | Create a new channel |
| `/api/channels/:channelId` | DELETE | Delete a channel |

## Local Development

To develop locally a `docker-compose` config exists that spins up a WHIP-endpoint and origin + egress SFU.

```
docker-compose up
```

Then run the egress endpoint in developer mode:

```
npm run dev
```

If you don't have a WHIP stream you can go to https://web.whip.eyevinn.technology and enter this endpoint URL: [http://localhost:8200/api/v2/whip/sfu-broadcaster?channelId=test](https://web.whip.eyevinn.technology/?endpoint=http%3A%2F%2Flocalhost%3A8200%2Fapi%2Fv2%2Fwhip%2Fsfu-broadcaster%3FchannelId%3Dtest)

To try playback with for example WHPP you can open a browser at https://webrtc.player.eyevinn.technology and enter `http://localhost:8001/whpp/channel/test` as WHPP url.

## About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!