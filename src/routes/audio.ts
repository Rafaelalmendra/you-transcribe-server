import fs from "fs";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { client } from "lib/assemblyai";

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

    const downloadVideo = () =>
      new Promise((resolve, reject) => {
        const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

        ytdl(videoURL, {
          quality: "lowestaudio",
          filter: "audioonly",
        })
          .pipe(fs.createWriteStream("video.mp4"))
          .on("finish", () => {
            console.log("Download finished");
            resolve("Download finished");
          })
          .on("error", (error: Error) => {
            console.error("Download failed", error);
            reject(error);
          });
      });

    const convertToMp3 = () =>
      new Promise((resolve, reject) => {
        if (ffmpegStatic === null) {
          throw new Error("ffmpegStatic is null");
        }

        ffmpeg.setFfmpegPath(ffmpegStatic);

        ffmpeg()
          .input("video.mp4")
          .outputOptions("-ab", "20k")
          .saveToFile("audio.mp3")
          .on("end", () => {
            console.log("Conversion finished");
            fs.unlink("video.mp4", (error) => {
              if (error) {
                console.error("Error deleting video file", error);
                reject(error);
              } else {
                console.log("Video file deleted");
                resolve("Conversion finished");
              }
            });
          })
          .on("error", (error: Error) => {
            console.error("Conversion failed", error);
            reject(error);
          });
      });

    try {
      await downloadVideo();
      await convertToMp3();

      const params = {
        audio: "audio.mp3",
        summarization: true,
        language_detection: true,
      };

      const transcription = await client.transcripts.transcribe(params as any);

      fs.unlink("audio.mp3", (error) => {
        if (error) {
          console.error("Error deleting audio file", error);
        } else {
          console.log("Audio file deleted");
        }
      });

      console.log(transcription);
      return reply.send(transcription);
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { audio };
