const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const splitIntoChunks = (text, chunkSize = 1000) => {
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    const slice = text.slice(index, index + chunkSize).trim();
    if (slice) {
      chunks.push(slice);
    }
    index += chunkSize;
  }
  return chunks;
};

const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2);

const scoreChunk = (chunk, tokens) => {
  if (!tokens.length) {
    return 0;
  }
  const lowerChunk = chunk.toLowerCase();
  let score = 0;
  tokens.forEach((token) => {
    if (lowerChunk.includes(token)) {
      score += 1;
    }
  });
  return score;
};

const extractResponseText = (responseJson) => {
  if (responseJson.output_text) {
    return responseJson.output_text.trim();
  }
  if (Array.isArray(responseJson.output)) {
    const textParts = responseJson.output
      .flatMap((item) => item.content || [])
      .filter((part) => part.type === "output_text")
      .map((part) => part.text);
    if (textParts.length > 0) {
      return textParts.join("\n").trim();
    }
  }
  return "";
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const message = (payload && payload.message ? String(payload.message) : "").trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!env.ATLAS_RAW_BASE || !env.ATLAS_PATHS) {
      return new Response(JSON.stringify({
        answer: "Atlas documents are not configured. Please set ATLAS_RAW_BASE and ATLAS_PATHS.",
        used_sources: [],
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paths = env.ATLAS_PATHS.split(/\r?\n/).map((path) => path.trim()).filter(Boolean);
    const docs = [];
    for (const path of paths) {
      try {
        const docResponse = await fetch(`${env.ATLAS_RAW_BASE.replace(/\/$/, "")}/${path}`);
        if (docResponse.ok) {
          const text = await docResponse.text();
          docs.push({ path, text });
        }
      } catch (error) {
        // Ignore fetch errors for individual docs
      }
    }

    const chunks = docs.flatMap((doc) =>
      splitIntoChunks(doc.text).map((chunk) => ({
        path: doc.path,
        chunk,
      }))
    );

    const tokens = tokenize(message);
    const rankedChunks = chunks
      .map((item) => ({
        ...item,
        score: scoreChunk(item.chunk, tokens),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (rankedChunks.length === 0 || rankedChunks.reduce((sum, item) => sum + item.chunk.length, 0) < 200) {
      return new Response(JSON.stringify({
        answer: "I do not have enough Atlas information to answer that yet. Consider adding more country, framework, or theme markdown files that cover this topic.",
        used_sources: [],
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        answer: "The assistant is not configured with an OpenAI API key. Please set OPENAI_API_KEY.",
        used_sources: rankedChunks.map((item) => item.path),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const usedSources = [...new Set(rankedChunks.map((item) => item.path))];
    const context = rankedChunks
      .map((item) => `Source: ${item.path}\n${item.chunk}`)
      .join("\n\n");

    const systemPrompt = "You are the Atlas AI Assistant. Use the provided Atlas sources to answer questions about migration policy, political climate, and EU frameworks. Use short paragraphs, headings, and bullet points. Avoid long walls of text. Keep answers concise. If the sources are insufficient, say so and suggest which Atlas documents to add.";
    const userPrompt = `User question: ${message}\n\nAtlas sources:\n${context}\n\nAnswer the question and include a \"Sources (Atlas)\" list based on the provided sources.`;

    let answerText = "";
    try {
      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          input: [
            {
              role: "system",
              content: [{ type: "text", text: systemPrompt }],
            },
            {
              role: "user",
              content: [{ type: "text", text: userPrompt }],
            },
          ],
        }),
      });
      const responseJson = await aiResponse.json();
      answerText = extractResponseText(responseJson) || "The assistant did not return a response.";
    } catch (error) {
      answerText = "There was an error contacting the language model.";
    }

    return new Response(JSON.stringify({
      answer: answerText,
      used_sources: usedSources,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
