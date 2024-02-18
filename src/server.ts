import fastify from "fastify";
import { audio } from "routes";

const app = fastify();

app.register(audio);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running");
});
