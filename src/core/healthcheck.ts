import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default function (fastify: FastifyInstance, opts: any, done) {
  fastify.get("/", {}, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({ status: "OK" });
  });
  done();
}