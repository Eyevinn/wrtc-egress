import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ChannelManager } from "./channelManager";
import { MediaStreamsInfo, MediaStreamsSchema } from "./mediaStreamsInfo";

interface ChannelRequest {
  Params: {
    channelId: string;
  },
  Body: {
    resourceId: string;
    mediaStreams: MediaStreamsInfo;
  }
}
type PostRequest = FastifyRequest<ChannelRequest>;

interface ChannelResponseBody {
  channelId: string;
  resourceId: string;
  mediaStreams: MediaStreamsInfo;
}

type DeleteRequest = FastifyRequest<{
  Params: {
    channelId: string;
  }
}>

const PostRequestSchema = {
  description: "Create a channel",
  body: {
    type: "object",
    properties: {
      resourceId: { type: "string" },
      mediaStreams: { $ref: "mediastream#" }
    }
  }
};

export default function (fastify: FastifyInstance, opts: any, done) {
  const channelManager: ChannelManager = opts.channelManager;

  fastify.register(require("fastify-swagger"), {
    routePrefix: "/docs",
    swagger: {
      consumes: ["application/json"],
      produces: ["applucation/json"]
    },
    exposeRoute: true,
  });
  fastify.addSchema(MediaStreamsSchema);

  // create channel
  fastify.post("/channel/:channelId", { schema: PostRequestSchema }, async (request: PostRequest, reply: FastifyReply) => {
    try {
      const channelId = request.params.channelId;
      const channel = 
        channelManager.createChannel(channelId, request.body.resourceId, request.body.mediaStreams);
      const responseBody: ChannelResponseBody = {
        channelId: channel.getId(),
        resourceId: channel.getResourceId(),
        mediaStreams: channel.getMediaStreams(),
      };
      reply.code(200).send(responseBody);
    } catch (e) {
      console.error(e);
      const err = new Error("Exception thrown when creating a channel, see server logs for more details");
      reply.code(500).send(err.message);
    }
  });

  // remove channel
  fastify.delete("/channel/:channelId", {}, async (request: DeleteRequest, reply: FastifyReply) => {
    try {
      const channelId = request.params.channelId;
      channelManager.removeChannel(channelId);
      reply.code(204).send();
    } catch (e) {
      console.error(e);
      const err = new Error("Exception thrown when deleting a channel, see server logs for more details");
      reply.code(500).send(err.message);
    }
  });

  done();
}