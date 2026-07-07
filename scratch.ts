import { config } from "dotenv";
config();
import ky from "ky";

const gamblingPrompt = `Analyze if the following Indonesian text is promoting or related to online gambling (judi online, slot, gacor, maxwin, depo, etc.). Response ONLY with valid JSON in this exact format:
{
  "prediction": 1 for gambling or 0 for not gambling,
  "label": "judi_online" or "non_judi",
  "confidence": 0.0 to 1.0 (float),
  "probabilities": {
    "non_judi": 0.0 to 1.0,
    "judi_online": 0.0 to 1.0
  }
}

Text to analyze: "Ayo daftar sekarang di link ini, slot gacor gampang menang maxwin depo 10k"`;

async function main() {
  const groqApiKey = process.env.GROQ_API_KEY;
  const res = await ky
    .post("https://api.groq.com/openai/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
      },
      json: {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that detects Indonesian online gambling promotions. Reply ONLY with valid JSON.",
          },
          {
            role: "user",
            content: gamblingPrompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      },
      timeout: 20000,
    })
    .json();
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
