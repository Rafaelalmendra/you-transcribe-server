import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type MyRequest = FastifyRequest<{
  Querystring: {
    videoId: string;
    lang?: string;
  };
}>;

const transcription = async (app: FastifyInstance) => {
  app.get("/resume", async (request: MyRequest, reply: FastifyReply) => {
    try {
      return reply.code(200).send("Transcription failed");
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { transcription };
