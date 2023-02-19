import { WHPPEndpoint, WHEPEndpoint, SfuType } from ".";

const egressStandard = process.env.EGRESS_STANDARD ? process.env.EGRESS_STANDARD : 'whep';

if (egressStandard === 'whep') {
  const endpoint = new WHEPEndpoint({
    port: parseInt(process.env.WHPP_PORT || "8001"),
    extPort: parseInt(process.env.WHPP_EXT_PORT || "8001"),
    hostname: process.env.EGRESS_HOSTNAME,
    useHttps: process.env.EGRESS_USE_HTTPS && process.env.EGRESS_USE_HTTPS === "true",
    prefix: "/whep",
    sfuAdapter: SfuType.smb,
    sfuOptions: { 
      smbUrl: process.env.SMB_URL || "http://localhost:8380/conferences/", 
      smbApiKey: process.env.SMB_API_KEY || "dev"
    },
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  endpoint.listen();

} else if (egressStandard === 'whpp') {
  const endpoint = new WHPPEndpoint({
    port: parseInt(process.env.WHPP_PORT || "8001"),
    extPort: parseInt(process.env.WHPP_EXT_PORT || "8001"),
    hostname: process.env.EGRESS_HOSTNAME,
    useHttps: process.env.EGRESS_USE_HTTPS && process.env.EGRESS_USE_HTTPS === "true",
    prefix: "/whpp",
    sfuAdapter: SfuType.smb,
    sfuOptions: { 
      smbUrl: process.env.SMB_URL || "http://localhost:8380/conferences/", 
      smbApiKey: process.env.SMB_API_KEY || "dev"
    },
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  endpoint.listen();
}
