# wrtc-egress

Server endpoint for standardized WebRTC based streaming. Currently supports the following egress / playback protocol:
- WHPP: [WebRTC HTTP Playback Protocol](https://github.com/Eyevinn/webrtc-http-playback-protocol/blob/master/webrtc-http-playback-protocol.md)

And support for the following SFUs:
- Symphony Media Bridge (smb)

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
  sfuOptions: { smbUrl: "http://localhost:8080/conferences/" },
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});
endpoint.listen();
```

When running an HTTP API for managing the channel is available at `/api/channels` by default. 

Access to WHPP endpoint at `/whpp/channels`.

## API

| Resource  | Method | Description |
| --------  | ------ | ----------- |
| /api/docs | GET | Online API docs |
| /api/channels | POST | Create a new channel |

## License (Apache-2.0)

```
Copyright 2022 Eyevinn Technology AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!