import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { downloadVideo, convertVideoToMp3 } from "utils";
import { client } from "lib";
import { TranscribeParams, TranscriptLanguageCode } from "assemblyai";

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

      const params: TranscribeParams = {
        audio: "audio.mp3",
        language_code: language as TranscriptLanguageCode,
      };

      const transcription = await client.transcripts.transcribe(params);

      const formattedTranscription = {
        text: transcription.text || "No transcription available",
      };

      if (transcription.status === "completed") {
        console.log(formattedTranscription);
        return reply.send(formattedTranscription);
      }

      return reply.code(500).send("Transcription failed");
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { transcription };
