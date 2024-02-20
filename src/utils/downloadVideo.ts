import fs from "fs";
import ytdl from "ytdl-core";

const downloadVideo = (videoId: string) =>
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

export { downloadVideo };