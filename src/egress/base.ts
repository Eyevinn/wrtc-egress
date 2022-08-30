import { EgressEndpoint, EgressEndpointOptions, ICEServer } from "./interface";
import fastify, { FastifyInstance } from "fastify";
import api from "../core/api";
import { ChannelManager } from "../core/channelManager";
import { Viewer } from "../core/interface";

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
    this.opts.hostname = this.opts.hostname || "localhost";
    this.opts.iceServers = this.opts.iceServers || [];

    this.channelManager = new ChannelManager();

    this.server = fastify({
      ignoreTrailingSlash: true,
      logger:
      { level: "info" },
    });
    this.server.register(require("fastify-cors"), {
      exposedHeaders: ["Location", "Accept", "Allow"],
      methods: ["POST", "GET", "OPTIONS", "PATCH", "PUT"],
      preflightContinue: true,
      strictPreflight: false,
    });
    this.server.register(api, { prefix: "/api", channelManager: this.channelManager });

  }

  protected log(...args: any[]) {
    console.log(`Egress Adapter:`, ...args);
  }

  protected error(...args: any[]) {
    console.error(`Egress Adapter:`, ...args);
  }

  async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen({ port: this.opts.port, host: this.opts.interfaceIp }, (err, address) => {
        if (err) reject(err);
        this.log(`Listening at ${address}`);
      });  
    });
  }

  getBaseUrl(): string {
    return (this.opts.useHttps ? "https" : "http") + "://" + this.opts.hostname + ":" + this.opts.extPort + this.opts.prefix;
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
}