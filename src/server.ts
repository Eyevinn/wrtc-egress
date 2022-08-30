import { WHPPEndpoint, SfuType } from ".";

const endpoint = new WHPPEndpoint({
  port: 8001,
  hostname: "wrtc-edge.eyevinn.technology",
  prefix: "/whpp",
  sfuAdapter: SfuType.smb,
  sfuOptions: { smbUrl: "http://localhost:8080/conferences/" },
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});
endpoint.listen();