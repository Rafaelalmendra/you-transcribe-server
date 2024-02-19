import OpenAI from "openai";
import { env } from "env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export { openai };
