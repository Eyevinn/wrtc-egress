import { Channel } from "./channel";
import { MediaStreamsInfo } from "./mediaStreamsInfo";

export class ChannelManager {
  private channels: Map<string, Channel>;

  constructor() {
    this.channels = new Map();
  }

  createChannel(channelId: string, resourceId: string, mediaStreams: MediaStreamsInfo): Channel {
    // Check if channel with channelId already exists
    if (this.channels.get(channelId)) {
      throw new Error(`Channel with Id ${channelId} already exists`);
    }
    
    const channel = new Channel(channelId, resourceId, mediaStreams);
    this.channels.set(channelId, channel);
    return channel;
  }

  getChannel(channelId: string): Channel | undefined {
    const channel = this.channels.get(channelId);
    return channel;
  }
  
  getChannelIds(): string[] {
    const channelIds = [];
    for (const k of this.channels.keys()) {
      channelIds.push(k);
    }
    return channelIds;
  }
  
  removeChannel(channelId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.destroy();
    }
    this.channels.delete(channelId);
  }
}