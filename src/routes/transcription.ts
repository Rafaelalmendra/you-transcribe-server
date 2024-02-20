import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { downloadVideo, convertVideoToMp3 } from "utils";
import { client } from "lib";
import fs from "fs";
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

      fs.unlink("audio.mp3", (error) => {
        if (!error) return console.log("Audio file deleted");
        console.error("Error deleting audio file", error);
      });

      fs.unlink("video.mp4", (error) => {
        if (!error) return console.log("Video file deleted");
        console.error("Error deleting video file", error);
      });

      if (transcription.status === "error") {
        console.error("Error transcribing audio", transcription);
        return reply.code(500).send("Error transcribing audio");
      }

      console.log(transcription);
      return reply.send(transcription);
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { transcription };
