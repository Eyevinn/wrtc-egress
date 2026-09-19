import { Viewer } from "./interface";
import { MediaStreamsInfo } from "./mediaStreamsInfo";

export class Channel {
  private channelId: string;
  private resourceId: string;
  private mediaStreams: MediaStreamsInfo;
  private viewers: Map<string, Viewer>;
  private createdAt: Date;
  private lastActivityAt: Date;

  constructor(
    channelId: string,
    resourceId: string,
    mediaStreams: MediaStreamsInfo,
  ) {
    this.channelId = channelId;
    this.resourceId = resourceId;
    this.mediaStreams = mediaStreams;

    this.viewers = new Map();
    this.createdAt = new Date();
    this.lastActivityAt = new Date();
  }

  touch() {
    this.lastActivityAt = new Date();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getLastActivityAt(): Date {
    return this.lastActivityAt;
  }

  getStatus(): string {
    return "active";
  }

  private log(...args: any[]) {
    console.log(`[${this.channelId}]`, ...args);
  }

  addViewer(newViewer: Viewer) {
    this.viewers.set(newViewer.getId(), newViewer);
    this.log(
      `Add viewer ${newViewer.getId()} to ${this.channelId}, size ${this.viewers.size}`,
    );
  }

  removeViewer(viewerToRemove: Viewer) {
    this.viewers.delete(viewerToRemove.getId());
  }

  getViewers(): Viewer[] {
    return Array.from(this.viewers.values());
  }

  getViewer(viewerId: string): Viewer | undefined {
    if (!this.viewers.has(viewerId)) {
      return undefined;
    }
    return this.viewers.get(viewerId);
  }

  getResourceId(): string {
    return this.resourceId;
  }

  getId(): string {
    return this.channelId;
  }

  getMediaStreams(): MediaStreamsInfo {
    return this.mediaStreams;
  }

  destroy() {}
}
