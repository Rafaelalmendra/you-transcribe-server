import fs from "fs";
import "dotenv/config";
import ytdl from "ytdl-core";

process.env.YTDL_NO_UPDATE = "true";

const downloadVideo = (videoId: string) =>
  new Promise(async (resolve, reject) => {
    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const response = await ytdl.getInfo(videoURL);
      const format = ytdl.chooseFormat(response.formats, {
        quality: "lowest",
      });

      const outputFilePath = `video.mp4`;
      const outputStream = fs.createWriteStream(outputFilePath);

      ytdl(videoURL, { format }).pipe(outputStream);
      outputStream.on("finish", () => {
        console.log("Download finished");
        resolve(outputFilePath);
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

export { downloadVideo };
