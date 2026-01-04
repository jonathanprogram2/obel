

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// -------- In-memory "memory" per user ------
// userId -> { knownTasks: Map(taskID -> taskSnapshot), deletedTaskIds: Set }
const userMemory = new Map();

/** Flatten columns into a single list of { ...task, status } */
function flattenColumns(columns = {}) {
  const out = [];
  for (const [status, list] of Object.entries(columns)) {
    (list || []).forEach((t) => {
      if (!t || !t.id) return;
      out.push({ ...t, status });
    });
  }
  return out;
}

/**
 * Update memory for this user.
 * Returns { boardSummaryText, deletedSummaryText }
 */
function updateTaskMemory(userId, columns) {
  const currentTasks = flattenColumns(columns);

  let memory = userMemory.get(userId);
  if (!memory) {
    memory = {
      knownTasks: new Map(),
      deletedTaskIds: new Set(),
    };
    userMemory.set(userId, memory);
  }

  const newKnown = new Map(memory.knownTasks);

  // Update known tasks & detect deletions
  const currentIds = new Set();
  for (const task of currentTasks) {
    currentIds.add(task.id);
    newKnown.set(task.id, {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      tag: task.tag,
    });
  }

  for (const [taskId] of newKnown.entries()) {
    if (!currentIds.has(taskId)) {
      memory.deletedTaskIds.add(taskId);
    }
  }

  memory.knownTasks = newKnown;

  // Prepare summaries for the LLM
  const byStatus = { todo: [], inProgress: [], done: [] };
  for (const task of currentTasks) {
    const line =
      `- [${task.id}] (${task.priority || "—"}) ${task.title} ` +
      `(status: ${task.status}, tag: ${task.tag || "General"})`;
    (byStatus[task.status] || (byStatus[task.status] = [])).push(line);
  }

  const boardSummaryParts = [];
  if (byStatus.todo.length) boardSummaryParts.push("TO DO:\n" + byStatus.todo.join("\n"));
  if (byStatus.inProgress.length) boardSummaryParts.push("\nIN PROGRESS:\n" + byStatus.inProgress.join("\n"));
  if (byStatus.done.length) boardSummaryParts.push("\nDONE:\n" + byStatus.done.join("\n"));

  const boardSummaryText = boardSummaryParts.join("\n\n") || "No tasks on the board yet.";

  const deletedIds = [...memory.deletedTaskIds];
  const deletedSummaryText = deletedIds.length
    ? `Recently deleted task IDs: ${deletedIds.join(", ")}`
    : "No deleted tasks yet.";

  return { boardSummaryText, deletedSummaryText };
}

// --------------- LLM helpers (Groq) ------------------------

async function callGroqChat(messages, model = "llama-3.3-70b-versatile") {
  if (!GROQ_API_KEY) return null;

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    console.error("Groq error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function runLLM(messages) {
  if (!GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY — set it in Vercel env vars");
    throw new Error("Missing GROQ_API_KEY");
  }

  const text = await callGroqChat(messages);
  if (text) return text;

  throw new Error("Groq API call failed — check your key/model/network.");
}

function wantsDetailedAnswer(rawMessage = "") {
  const text = rawMessage.toLowerCase();
  return /detail|details|explain|explanation|walk me through|step by step|step-by-step|full plan|long answer|deep dive|break it down|breakdown/.test(
    text
  );
}

function clampReply(text = "", maxSentences = 3, maxChars = 125) {
  if (!text) return "";

  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);

  const result = [];
  let totalChars = 0;

  for (const s of sentences) {
    if (result.length >= maxSentences) break;

    const extra = (result.length ? 1 : 0) + s.length;
    if (totalChars + extra > maxChars) {
      if (result.length === 0) result.push(s);
      break;
    }

    result.push(s);
    totalChars += extra;
  }

  return result.length ? result.join(" ") : cleaned;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { userId = "demo-user", message, tasks } = body || {};

    const rawMessage = (message || "").trim();

    // Greeting detection
    const isCasualGreeting =
      rawMessage &&
      rawMessage.length <= 20 &&
      /^(hi|hey|hello|yo|sup|what's up|whats up)\b/i.test(rawMessage);

    if (isCasualGreeting) {
      return res.json({
        reply: "Hey! 👋 I'm BoBo, your AI workspace assistant. What do you need help with?",
        suggestedTasks: [],
      });
    }

    if (!rawMessage || !tasks) {
      return res.status(400).json({
        error: "Missing required fields: message, tasks",
      });
    }

    const { boardSummaryText, deletedSummaryText } = updateTaskMemory(userId, tasks);

    const systemPrompt = `
You are "BoBo", an AI productivity assistant inside the Obel Workspace.

You can see the user's Kanban board and recently deleted tasks.

Hard rules:
- The board always has exactly three columns: "To Do", "In Progress", and "Done".
- Never suggest adding new columns or changing the board structure.
- Never mention task IDs like DEV-201 or API-89 in your replies; those IDs are for your internal memory only.
- If you need to reference a task, use only its human title (e.g. "Refactor user authentication flow").
- By default, answer in no more than 3 short sentences.
- Only write longer, detailed answers if the user clearly asks for more detail, explanation, a plan, or a breakdown.
- Only perform deep analysis of the board when the user asks about tasks, planning, priorities, time estimates, etc.
- If the user is just greeting or chatting casually, respond conversationally and briefly.

Your goals:
- Understand how the user typically works by looking at task titles, tags, priorities, and which tasks they delete.
- Give concise, practical suggestions that feel like advice from a smart teammate, not a robot.

Extra instruction for task creation:
- If the user clearly asks you to CREATE a new task or tasks:
  1) First answer in natural language as usual.
  2) Then append a JSON block wrapped in <TASKS> and </TASKS> tags.
  3) JSON shape:
     {
       "newTasks": [
         {
           "title": "Clear, short task title",
           "status": "todo" | "inProgress" | "done",
           "priority": "High Priority" | "Medium Priority" | "Low Priority",
           "tag": "Short tag like Backend, Design, Research, Personal, etc."
         }
       ]
     }

- Only include <TASKS> JSON when user explicitly asks to create/add tasks.
- Never mention the tags <TASKS> or the JSON format to the user.
`.trim();

    const contextPrompt = `
Current Kanban board:
${boardSummaryText}

${deletedSummaryText}
`.trim();

    const userPrompt = `
User message:
${rawMessage}
`.trim();

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "system", content: contextPrompt },
      { role: "user", content: userPrompt },
    ];

    const replyText = (await runLLM(messages)) || "";

    // extract optional <TASKS> JSON block from model reply
    let suggestedTasks = [];
    let visibleText = replyText;

    const taskBlockMatch = replyText.match(/<TASKS>\s*([\s\S]*?)<\/TASKS>/);
    if (taskBlockMatch) {
      const jsonString = taskBlockMatch[1];
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed && Array.isArray(parsed.newTasks)) {
          suggestedTasks = parsed.newTasks;
        }
      } catch (e) {
        console.error("Failed to parse <TASKS> JSON:", e);
      }
      visibleText = replyText.replace(taskBlockMatch[0], "").trim();
    }

    // strip any leftover [DEV-201]-style IDs just in case
    let cleanedReply = (visibleText || "")
      .replace(/\[[A-Za-z0-9_-]+\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!wantsDetailedAnswer(rawMessage)) {
      cleanedReply = clampReply(cleanedReply, 3, 125);
    }

    return res.json({
      reply: cleanedReply,
      suggestedTasks,
    });
  } catch (err) {
    console.error("Assistant backend error:", err);
    return res.status(500).json({ error: "Assistant backend error" });
  }
}
