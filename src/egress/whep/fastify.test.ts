import fastify from "fastify";
import api from "./fastify";
import managementApi from "../../core/api";
import { ChannelManager } from "../../core/channelManager";

describe("WHEP API", () => {
  let app;

  afterEach(() => {
    app.close();
  });

  test("returns accept-post header with application/sdp", async () => {
    app = fastify({
      ignoreTrailingSlash: true,
    });
    app.register(api);
    const response = await app.inject({
      method: "OPTIONS",
      url: "/channel/test",
    });
    expect(response.statusCode).toEqual(204);
    const acceptPost = <string[]>response.headers["accept-post"];
    expect(acceptPost).toBeDefined();
    expect(acceptPost.includes("application/sdp")).toBeTruthy();
  });

  test("handles empty POST body", async () => {
    app = fastify({
      ignoreTrailingSlash: true,
    });
    app.register(api);
    const response = await app.inject({
      method: "POST",
      url: "/channel/test",
    });
    expect(response.statusCode).toEqual(400);
  });
});

describe("Management API GET /channels", () => {
  let app;
  let channelManager: ChannelManager;

  beforeEach(() => {
    channelManager = new ChannelManager();
    app = fastify({ ignoreTrailingSlash: true });
    app.register(managementApi, { channelManager });
  });

  afterEach(() => {
    app.close();
  });

  test("returns empty array when no channels exist", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/channels",
    });
    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual([]);
  });

  test("returns channel with metadata after POST /channel/:channelId", async () => {
    const mediaStreams = {
      audio: { ssrcs: [] },
      video: { ssrcs: [], ssrcGroups: [] },
    };
    channelManager.createChannel("test-channel", "resource-1", mediaStreams);

    const response = await app.inject({
      method: "GET",
      url: "/channels",
    });
    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(1);
    expect(body[0].channelId).toEqual("test-channel");
    expect(body[0].status).toEqual("active");
    expect(body[0].createdAt).toBeDefined();
    expect(body[0].lastActivityAt).toBeDefined();
  });
});
