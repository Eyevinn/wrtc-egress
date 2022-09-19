import { WHPPEndpoint, SfuType } from ".";

const endpoint = new WHPPEndpoint({
  port: parseInt(process.env.WHPP_PORT || "8001"),
  extPort: parseInt(process.env.WHPP_EXT_PORT || "8001"),
  hostname: process.env.WHPP_HOSTNAME,
  useHttps: process.env.WHPP_USE_HTTPS && process.env.WHPP_USE_HTTPS === "true",
  prefix: "/whpp",
  sfuAdapter: SfuType.smb,
  sfuOptions: { 
    smbUrl: process.env.SMB_URL || "http://localhost:8380/conferences/", 
    smbApiKey: process.env.SMB_API_KEY || "dev"
  },
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});
endpoint.listen();
