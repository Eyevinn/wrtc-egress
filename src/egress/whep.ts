import { BaseAdapter } from "./base";
import { EgressEndpointOptions } from "./interface";
import api from "./whep/fastify";
import { WhepViewer } from "./whep/viewer";
import SfuProtocolFactory from "../core/sfu/protocolFactory";
import { SfuProtocol } from "../core/sfu/interface";
import { Viewer } from "../core/interface";
import { MediaStreamsInfo } from "../core/mediaStreamsInfo";

export class WHEPEndpoint extends BaseAdapter {
  private sfuProtocol: SfuProtocol;

  constructor(opts: EgressEndpointOptions ) {
    super(opts);

    this.server.register(api, { prefix: this.opts.prefix, adapter: this });
    this.sfuProtocol = SfuProtocolFactory(this.opts.sfuAdapter, this.opts.sfuOptions);
  }

  createViewer(channelId: string, resourceId: string, mediaStreams: MediaStreamsInfo): WhepViewer {
    const viewer = new WhepViewer(channelId, resourceId, this.sfuProtocol, mediaStreams);

    return viewer;
  }

  addViewerToChannel(channelId: string, viewer: WhepViewer) {
    const channel = this.channelManager.getChannel(channelId);
    
    if (!channel) {
      this.error(`Channel ${channelId} not found`);
      return;
    }
    channel.addViewer(viewer);
  }

  removeViewerFromChannel(channelId: string, viewer: WhepViewer) {
    const channel = this.channelManager.getChannel(channelId);
    if (!channel) {
      this.error(`Channel ${channelId} not found`);
      return;
    }
    channel.removeViewer(viewer);
  }

  getViewerForChannel(channelId: string, viewerId: string): Viewer | undefined {
    const channel = this.channelManager.getChannel(channelId);
    if (channel) {
      return channel.getViewer(viewerId);
    }
    return undefined;
  }
}
