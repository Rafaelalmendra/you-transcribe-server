import fastify from "fastify";
import cors from "@fastify/cors";
import { audio } from "routes";

const app = fastify();

app.register(cors);
app.register(audio);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running");
});
