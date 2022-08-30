import { SfuType } from "../core/sfu/interface";

export interface ICEServer {
  urls: string;
  username?: string;
  credential?: string;
}

export interface EgressEndpointOptions {
  port?: number;
  extPort?: number;
  interfaceIp?: string;
  useHttps?: boolean;
  hostname?: string;
  sfuAdapter: SfuType;
  sfuOptions: any;
  iceServers: ICEServer[];
  prefix: string;
}

export interface EgressEndpoint {
  listen(): Promise<void>;
}