import { ChannelManager } from "./channelManager";
import { MediaStreamsInfo } from "./mediaStreamsInfo";

const mockMediaStreams: MediaStreamsInfo = {
  audio: { ssrcs: [] },
  video: { ssrcs: [], ssrcGroups: [] },
};

describe("ChannelManager", () => {
  let manager: ChannelManager;

  beforeEach(() => {
    manager = new ChannelManager();
  });

  describe("getAllChannels()", () => {
    it("returns an empty array when no channels exist", () => {
      expect(manager.getAllChannels()).toEqual([]);
    });

    it("returns all created channels", () => {
      manager.createChannel("ch1", "res1", mockMediaStreams);
      manager.createChannel("ch2", "res2", mockMediaStreams);
      const channels = manager.getAllChannels();
      expect(channels).toHaveLength(2);
      expect(channels.map((c) => c.getId()).sort()).toEqual(["ch1", "ch2"]);
    });
  });

  describe("startReaper()", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Anchor the fake clock so Date.now() / new Date() both return fake time.
      // Without this, new Date() inside Channel's constructor still uses the real
      // wall-clock, so the reaper sees ~0ms elapsed even after advanceTimersByTime.
      jest.setSystemTime(new Date());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("removes a channel whose lastActivityAt exceeds the TTL", () => {
      const ttlMs = 5000;
      manager.createChannel("stale", "res1", mockMediaStreams);
      manager.startReaper(ttlMs);

      // Advance time past two interval ticks so the reaper fires when age > ttlMs.
      // The interval period equals ttlMs, so the first tick fires at exactly ttlMs
      // (age === ttlMs, not strictly greater), and the second tick fires at 2*ttlMs
      // (age > ttlMs). We advance by 2*ttlMs + 1 to ensure the second tick fires.
      jest.advanceTimersByTime(ttlMs * 2 + 1);

      expect(manager.getChannel("stale")).toBeUndefined();
      expect(manager.getAllChannels()).toHaveLength(0);
    });

    it("does NOT remove a channel that was touched recently", () => {
      const ttlMs = 5000;
      const ch = manager.createChannel("active", "res1", mockMediaStreams);
      manager.startReaper(ttlMs);

      // Advance time partially, then touch to reset idle timer
      jest.advanceTimersByTime(ttlMs - 1000);
      ch.touch();

      // Advance past the original TTL — the touch should have reset the timer
      jest.advanceTimersByTime(ttlMs - 1000);

      expect(manager.getChannel("active")).toBeDefined();
      expect(manager.getAllChannels()).toHaveLength(1);
    });
  });
});
