import { FastifyInstance } from "fastify";
import { ChannelManager } from "./channelManager";

export default function (fastify: FastifyInstance, opts: any, done) {
  const channelManager: ChannelManager = opts.channelManager;

  done();
}