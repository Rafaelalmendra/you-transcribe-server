import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { downloadVideo, convertVideoToMp3 } from "utils";
import { openai } from "lib";
import fs from "fs";

type MyRequest = FastifyRequest<{
  Querystring: {
    videoId: string;
    lang?: string;
  };
}>;

const transcription = async (app: FastifyInstance) => {
  app.get("/transcription", async (request: MyRequest, reply: FastifyReply) => {
    const videoId = request.query.videoId;
    const lang = request.query.lang as string;

    if (!videoId) return reply.code(400).send("Missing videoId parameter");

    try {
      await downloadVideo(videoId);
      await convertVideoToMp3();

      const language = lang || "pt";

      const transcription = await openai.audio.transcriptions.create({
        language,
        model: "whisper-1",
        file: fs.createReadStream("audio.mp3"),
      });

      if (!transcription) {
        return reply.code(500).send("Error creating transcription");
      }

      return reply.send(transcription);
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { transcription };
