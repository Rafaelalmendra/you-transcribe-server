import fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { transcription } from "routes";
import { env } from "env";

dotenv.config();
const app = fastify();

app.register(cors);
app.register(transcription);

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT,
  })
  .then((address) => {
    console.log(`Server is now listening on -> ${address}`);
  });
