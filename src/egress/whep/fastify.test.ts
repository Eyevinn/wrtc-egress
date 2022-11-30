import fastify from "fastify";
import api from "./fastify";

describe('WHEP API', () => {
  test('returns accept-post header with application/sdp', async () => {
    const app = fastify({
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
});