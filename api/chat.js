import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // saugoma Vercel aplinkoje
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Tik POST metodas leidžiamas" });
  }

  const { message, threadId: incomingThreadId } = req.body;

  try {
    const threadId = incomingThreadId || (await openai.beta.threads.create()).id;

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_ls1r6XhekISt4chsMsO42SdC" // ← čia įrašai ID
    });

    let runStatus;
    const maxRetries = 20;
    let attempts = 0;

    do {
      if (attempts++ > maxRetries) throw new Error("Viršytas laukimo limitas.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (runStatus.status !== "completed" && runStatus.status !== "failed");

    if (runStatus.status === "failed") {
      return res.status(500).json({ reply: "Asistentas nepavyko atsakyti.", threadId });
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    const reply = messages.data
      .filter(msg => msg.role === "assistant")
      .map(msg =>
        msg.content
          .filter(part => part.type === "text")
          .map(part => part.text.value)
          .join("\n")
      )
      .join("\n");

    return res.status(200).json({ reply, threadId });

  } catch (error) {
    console.error("OpenAI klaida:", error);
    return res.status(500).json({ reply: "Klaida jungiantis prie asistento." });
  }
}
