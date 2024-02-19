import { AssemblyAI } from "assemblyai";
import { env } from "env";

const client = new AssemblyAI({
  apiKey: env.ASSEMBLYAI_API_KEY,
});

export { client };
