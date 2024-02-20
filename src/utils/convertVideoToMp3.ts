import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

const convertVideoToMp3 = () =>
  new Promise((resolve, reject) => {
    if (ffmpegStatic === null) {
      throw new Error("ffmpegStatic is null");
    }

    ffmpeg.setFfmpegPath(ffmpegStatic);

    ffmpeg()
      .input("video.mp4")
      .outputOptions("-ab", "60k")
      .saveToFile("audio.mp3")
      .on("end", () => {
        console.log("Conversion finished");
        resolve("Conversion finished");
      })
      .on("error", (error: Error) => {
        console.error("Conversion failed", error);
        reject(error);
      });
  });

export { convertVideoToMp3 };
