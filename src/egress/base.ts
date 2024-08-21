import { EgressEndpoint, EgressEndpointOptions, ICEServer } from "./interface";
import fastify, { FastifyInstance } from "fastify";
import api from "../core/api";
import healthcheck from "../core/healthcheck";
import { ChannelManager } from "../core/channelManager";
import { Viewer } from "../core/interface";
import { MediaStreamsInfo } from "../core/mediaStreamsInfo";

export class BaseAdapter implements EgressEndpoint {
  protected opts: EgressEndpointOptions;
  protected server: FastifyInstance;
  protected channelManager: ChannelManager;

  constructor(opts: EgressEndpointOptions) {
    this.opts = opts;
    this.opts.port = this.opts.port || 8001;
    this.opts.extPort = this.opts.extPort || this.opts.port;
    this.opts.interfaceIp = this.opts.interfaceIp || "0.0.0.0";
    this.opts.useHttps = !!(this.opts.useHttps);
    this.opts.hostname = this.opts.hostname;
    this.opts.iceServers = this.opts.iceServers || [];

    this.channelManager = new ChannelManager();

    this.server = fastify({
      ignoreTrailingSlash: true,
      logger:
      { level: "warn" },
    });
    this.server.register(require("fastify-cors"), {
      exposedHeaders: ["Location", "Accept", "Allow", "Accept-POST"],
      methods: ["POST", "GET", "OPTIONS", "PATCH", "PUT"],
      preflightContinue: true,
      strictPreflight: false,
    });
    this.server.register(api, { prefix: "/api", channelManager: this.channelManager });
    this.server.register(healthcheck);
  }

  protected log(...args: any[]) {
    console.log(`[WebRTC Egress]:`, ...args);
  }

  protected error(...args: any[]) {
    console.error(`Egress Adapter:`, ...args);
  }

  async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen({ port: this.opts.port, host: this.opts.interfaceIp }, (err, address) => {
        if (err) reject(err);
        this.log(`Playback endpoint at ${address + this.opts.prefix}`);
        this.log(`Channel management endpoint at ${address + "/api/docs" }`);
        this.log(`Base URL: ${this.getBaseUrl()}`);
        resolve();
      });  
    });
  }

  getBaseUrl(): string {
    if (this.opts.hostname) {
      return (this.opts.useHttps ? "https" : "http") + "://" + this.opts.hostname + ":" + this.opts.extPort + this.opts.prefix;
    }
    return this.opts.prefix;
  }

  getIceServers(): ICEServer[] {
    return this.opts.iceServers;
  }

  getResourceIdForChannel(channelId: string): string | undefined {
    const channel = this.channelManager.getChannel(channelId);
    if (channel) {
      return channel.getResourceId();
    }
    return undefined;
  }

  getViewerForChannel(channelId: string, viewerId: string): Viewer | undefined {
    const channel = this.channelManager.getChannel(channelId);
    if (channel) {
      return channel.getViewer(viewerId);
    }
    return undefined;
  }

  getMediaStreamsForChannel(channelId: string): MediaStreamsInfo {
    const channel = this.channelManager.getChannel(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    return channel.getMediaStreams();
  }

  getChannelList(): string[] {
    return this.channelManager.getChannelIds();
  }
}
