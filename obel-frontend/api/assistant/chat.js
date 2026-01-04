export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing GROQ_API_KEY" });

  try {
    const { userId, message, tasks } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    // Keep it simple: send the board + user message to BoBo
    const system = `You are BoBo, an AI workspace assistant. 
You help prioritize tasks and can suggest new task cards when helpful.
Return JSON ONLY with:
{
  "reply": "string",
  "suggestedTasks": [{ "title": "string", "status": "todo|inProgress|done", "priority": "High Priority|Medium Priority|Low Priority", "tag": "string" }]
}
If no tasks to suggest, return suggestedTasks as [].`;

    const user = `User: ${userId || "unknown"}
Message: ${message}

Current board (kanban columns object):
${JSON.stringify(tasks || {}, null, 2)}
`;

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);

    const raw = data.choices?.[0]?.message?.content || "";
    let parsed;

    // Try to parse BoBo JSON safely
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw, suggestedTasks: [] };
    }

    return res.status(200).json({
      reply: parsed.reply || "Done.",
      suggestedTasks: Array.isArray(parsed.suggestedTasks) ? parsed.suggestedTasks : [],
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
