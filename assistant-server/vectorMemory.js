import fetch from "node-fetch";

const memoryStore = new Map();  // userId -> [{ embedding: [...], text }]

// Get embedding from Groq LLM
export async function embedText(text) {
    const apiKey = process.env.GROQ_API_KEY;
    const res = await fetch("https://api.groq.com/openai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "nomic-embed-text",
            input: text
        })
    });

    const data = await res.json();
    return data.data?.[0]?.embedding || [];
}

// Store memory embedding
export async function vectorMemoryStore(userId, text) {
    const emb = await embedText(text);
    if (!emb.length) return;

    if (!memoryStore.has(userId)) {
        memoryStore.set(userId, []);
    }

    memoryStore.get(userId).push({ embedding: emb, text });

    // keep memory compact
    if (memoryStore.get(userId).length > 50) {
        memoryStore.get(userId).shift();
    }
}

// Cosine similarity
function sim(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Recall top 3 related memories
export async function vectorMemoryRecall(userId, query) {
    const store = memoryStore.get(userId) || [];
    if (!store.length) return [];

    const qEmb = await embedText(query);
    if (!qEmb.length) return [];

    const scored = store
        .map(m => ({ score: sim(qEmb, m.embedding), text: m.text }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    return scored.map(s => s.text);
}