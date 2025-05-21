
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Tik POST metodas leidžiamas" });
  }

  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu esi išmanus AI asistentas automobilių temomis, kalbi tik lietuviškai." },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI klaida:", error.message);
    res.status(500).json({ reply: "Įvyko klaida jungiantis prie AI asistento." });
  }
}
