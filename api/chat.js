import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Tik POST metodas leidžiamas" });
  }

  const { message } = req.body;

  try {
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_ls1r6XhekISt4chsMsO42SdC"
    });

    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== "completed" && runStatus.status !== "failed");

    if (runStatus.status === "failed") {
      return res.status(500).json({ reply: "Asistentas nepavyko atsakyti." });
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = messages.data
      .filter(msg => msg.role === "assistant")
      .map(msg => msg.content.map(part => part.text).join("\\n"))
      .join("\\n");

    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI klaida:", error.message);
    res.status(500).json({ reply: "Klaida jungiantis prie asistento." });
  }
}
