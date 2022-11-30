import fastify from "fastify";
import api from "./fastify";

describe('WHEP API', () => {
  let app;

  afterEach(() => {
    app.close();
  });

  test('returns accept-post header with application/sdp', async () => {
    app = fastify({
      ignoreTrailingSlash: true,
    });
    app.register(api);
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/channel/test'
    });
    expect(response.statusCode).toEqual(204);
    const acceptPost = <string[]>response.headers['accept-post'];
    expect(acceptPost).toBeDefined();
    expect(acceptPost.includes('application/sdp')).toBeTruthy();
  });

  test('handles empty POST body', async () => {
    app = fastify({
      ignoreTrailingSlash: true,
    });
    app.register(api);
    const response = await app.inject({
      method: 'POST',
      url: '/channel/test'
    });
    expect(response.statusCode).toEqual(400);
  });
});