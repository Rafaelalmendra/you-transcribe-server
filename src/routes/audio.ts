import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type MyRequest = FastifyRequest<{
  Querystring: {
    videoId: string;
  };
}>;

const audio = async (app: FastifyInstance) => {
  app.get("/audio", async (request: MyRequest, reply: FastifyReply) => {
    const videoId = request.query.videoId as string;
    if (!videoId) {
      return reply.code(400).send("Missing videoId query parameter");
    }

    try {
      return reply.send(`Audio for video ${videoId}`);
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { audio };
