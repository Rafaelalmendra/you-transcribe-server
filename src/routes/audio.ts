import fs from "fs";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
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
          .audioCodec("libmp3lame")
          .outputOptions(
            "-vn",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-ab",
            "20k",
            "-f",
            "mp3"
          )
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
      const mp3Data = fs.readFileSync("audio.mp3");
      reply.header("Content-Disposition", "attachment; filename=audio.mp3");
      reply.header("Content-Type", "audio/mpeg");
      return reply.send(mp3Data);
    } catch (error) {
      console.error(error);
      return reply.send(error);
    }
  });
};

export { audio };
