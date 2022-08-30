import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { WHPPEndpoint } from "../whpp";
import { WhppAnswerRequest } from "./requests";
import { WhppViewer } from "./viewer";

type Request = FastifyRequest<{
  Params: {
    channelId: string
  }
}>

type PutRequest = FastifyRequest<{
  Params: {
    channelId: string,
    viewerId: string
  },
  Body: WhppAnswerRequest;
}>

type PatchRequest = FastifyRequest<{
  Params: {
    channelId: string,
    viewerId: string
  },
  Body: WhppAnswerRequest;
}>

type PostRequest = FastifyRequest<{
  Params: {
    channelId: string
  },
  Body: {};
}>

export default function (fastify: FastifyInstance, opts: any, done) {
  const adapter: WHPPEndpoint = opts.adapter;

  fastify.addContentTypeParser('application/whpp+json', { parseAs: "string" }, (req, body: string, done) => {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  fastify.options("/channel/:channelId", {}, async (request: PostRequest, reply: FastifyReply) => {
    try {
      reply.headers({
        "Accept": [ "application/json", "application/whpp+json" ],
      });
      reply.code(204).send();
    } catch (e) {
      console.error(e);
      const err = new Error("Options request failed, see server logs for more details");
      reply.code(500).send(err.message);
    }
  });

  fastify.post("/channel/:channelId", {}, async (request: PostRequest, reply: FastifyReply) => {
    try {
      const channelId = request.params.channelId;
      const iceServers = adapter.getIceServers();

      const viewer = adapter.createViewer(channelId, adapter.getResourceIdForChannel(channelId));

      viewer.on("connect", () => {
        adapter.addViewerToChannel(channelId, viewer);
      });
      viewer.on("disconnect", () => {
        adapter.removeViewerFromChannel(channelId, viewer);
      });

      const responseBody = await viewer.generateOfferResponse();

      reply.code(201)
        .headers({
          'Content-type': 'application/whpp+json',
          'Location': adapter.getBaseUrl() + "/channel/" + channelId + '/' + viewer.getId()
        })
        .send(responseBody);

    } catch (e) {
      console.error(e);
      const err = new Error("Exception thrown when handling a new WHPP client connection, see server logs for more details");
      reply.code(500).send(err.message);
    }
  });

  fastify.options("/channel/:channelId/:viewerId", {}, async (request: PatchRequest, reply: FastifyReply) => {
    const channelId = request.params.channelId;
    const viewerId = request.params.viewerId;

    console.log(`channelId ${channelId}, viewerId ${viewerId}`);

    try {
      let allowedMethods = [ "PUT" ];
      const viewer = adapter.getViewerForChannel(channelId, viewerId);
      if (viewer.supportIceTrickle()) {
        allowedMethods.push("PATCH");
      }

      reply.headers({
        "Accept": [ "application/json", "application/whpp+json" ],
        "Allow": allowedMethods
      });
      reply.code(204).send();
    } catch (e) {
      console.error(e);
      const err = new Error("Exception thrown see server logs for more details");
      reply.code(500).send(err.message);
    }
  });

  fastify.put("/channel/:channelId/:viewerId", {}, async (request: PutRequest, reply: FastifyReply) => {
    try {
      const channelId = request.params.channelId;
      const viewerId = request.params.viewerId;

      console.log(`channelId ${channelId}, viewerId ${viewerId}`);

      const viewer = adapter.getViewerForChannel(channelId, viewerId);
      if (!viewer) {
        console.error(`channelId ${channelId}, viewerId ${viewerId} not found`);
        reply.code(404).send();
        return;
      }

      await viewer.handleAnswerRequest(request.body);
      reply.code(204).send();

    } catch (e) {
      console.error(e);
      const err = new Error("Exception thrown when handling answer from WHPP client");
      reply.code(500).send(err.message);
    }
  });

  fastify.patch("/channel/:channelId/:viewerId", {}, async (request: PatchRequest, reply: FastifyReply) => {
    try {
      const channelId = request.params.channelId;
      const viewerId = request.params.viewerId;

      console.log(`channelId ${channelId}, viewerId ${viewerId}`);

      const viewer = adapter.getViewerForChannel(channelId, viewerId);
      if (!viewer) {
        console.error(`channelId ${channelId}, viewerId ${viewerId} not found`);
        reply.code(404).send();
        return;
      }

      if (viewer.supportIceTrickle()) {
        await viewer.handleIceCandidateRequest(request.body);
        reply.code(204).send();
      } else {
        reply.code(405).send();
      }
    } catch (e) {
      console.error(e);
      const err = new Error("Exception thrown when handling ICE candidate");
      reply.code(500).send(err.message);
    }
  });

  done();
}