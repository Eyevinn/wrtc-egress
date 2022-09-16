import fetch from 'node-fetch';
import { SfuProtocol } from "./interface";

export interface SmbProtocolOptions {
  smbUrl: string;
  smbApiKey?: string;
}

interface SmbCandidate {
  'generation': number;
  'component': number;
  'protocol': string;
  'port': number;
  'ip': string;
  'rel-port'?: number;
  'rel-addr'?: string;
  'foundation': string;
  'priority': number;
  'type': string;
  'network'?: number;
}

interface SmbTransport {
  'rtcp-mux'?: boolean;
  'ice'?: {
    'ufrag': string;
    'pwd': string;
    'candidates': SmbCandidate[];
  };
  'dtls'?: {
    'setup': string;
    'type': string;
    'hash': string;
  };
}

interface RtcpFeedback {
  'type': string;
  'subtype': string;
}

interface SmbPayloadType {
  'id': number;
  'name': string;
  'clockrate': number;
  'channels'?: number;
  'parameters'?: any;
  'rtcp-fbs'?: RtcpFeedback[];
}

interface SmbRtpHeaderExtension {
  'id': number;
  'uri': string;
}

interface SmbSsrcAttribute {
  'sources': number[];
  'content': string;
}

interface SmbSsrcGroup {
  'ssrcs': string[];
  'semantics': string;
}

export interface SmbEndpointDescription {
  'bundle-transport'?: SmbTransport;
  'audio'?: {
    'ssrcs': string[];
    'payload-type': SmbPayloadType;
    'rtp-hdrexts': SmbRtpHeaderExtension[];
  };

  'video'?: {
    'ssrcs': string[];
    'ssrc-groups': SmbSsrcGroup[];
    'payload-types': SmbPayloadType[];
    'rtp-hdrexts'?: SmbRtpHeaderExtension[];
    'ssrc-attributes'?: SmbSsrcAttribute[];
  };

  'data'?: {
    'port': number;
  };
}

export class SmbProtocol implements SfuProtocol {
  private smbUrl: string;
  private smbApiKey?: string;

  constructor(opts?: SmbProtocolOptions) {
    this.smbUrl = opts.smbUrl;
    this.smbApiKey = opts.smbApiKey;
    this.log("URL=" + this.smbUrl);
  }

  log(...args: any[]) {
    console.log(`[SMB SFU]:`, ...args);
  }

  async allocateConference(): Promise<string> {
    const allocateResponse = await fetch(this.smbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-APIkey": this.smbApiKey,
      },
      body: '{}'
    });

    if (!allocateResponse.ok) {
      throw new Error("Failed to allocate resource");
    }

    const allocateResponseJson = await allocateResponse.json();

    return allocateResponseJson['id'];
  }

  async allocateEndpoint(conferenceId: string,
    endpointId: string,
    audio: boolean,
    video: boolean,
    data: boolean): Promise<SmbEndpointDescription> {

    let request = {
      "action": "allocate",
      "bundle-transport": {
        "ice-controlling": true,
        "ice": true,
        "dtls": true
      }
    }

    if (audio) {
      request["audio"] = { "relay-type": "forwarder" };
    }
    if (video) {
      request["video"] = { "relay-type": "forwarder" };
    }
    if (data) {
      request["data"] = {};
    }

    const url = this.smbUrl + conferenceId + '/' + endpointId;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-APIkey": this.smbApiKey,
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      console.log(JSON.stringify(request));
      throw new Error("Failed to allocate endpoint");
    }

    const smbEndpointDescription: SmbEndpointDescription = (await response.json());
    return smbEndpointDescription;
  }

  async configureEndpoint(conferenceId: string, endpointId: string, endpointDescription: SmbEndpointDescription): Promise<void> {
    let request = JSON.parse(JSON.stringify(endpointDescription));
    request["action"] = "configure";

    const url = this.smbUrl + conferenceId + '/' + endpointId;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-APIkey": this.smbApiKey,
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      console.log(JSON.stringify(request));
      throw new Error("Failed to configure endpoint");
    }
  }

  async getConferences(): Promise<string[]> {
    const url = this.smbUrl;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-APIkey": this.smbApiKey,
      }
    });

    if (!response.ok) {
      return [];
    }

    const responseBody: string[] = await response.json();
    return responseBody;
  }

}