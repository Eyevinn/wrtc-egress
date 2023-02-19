import fetch from 'node-fetch';
import { SfuEndpointDescription, SfuProtocol, SfuTransport } from "./interface";

export interface SmbProtocolOptions {
  smbUrl: string;
  smbApiKey?: string;
}

export interface SmbEndpointDescription extends SfuEndpointDescription {
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
    const response: Response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-APIkey": this.smbApiKey,
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      console.log(JSON.stringify(request));
      throw new Error("Failed to allocate endpoint " + response.status + " " + response.statusText);
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