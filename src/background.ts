type FetchConceptMessage = { type: "fetchConcept"; text: string };

const promptTemplate = (text: string) => `
I will give you a Japanese text and a word from that text. Explain what the word means in English (not the sentence, the word).

Don’t just give an English translation; actually explain what the word means in a similar manner to how the word would be explained in a Japanese-to-Japanese dictionary for native Japanese speakers, but in English. Avoid using direct English equivalents of the word. Explain 100% in English, without using any Japanese.

If there are multiple meanings, only explain the "core meaning" of the word (not just what the word means in this particular sentence).

Since the result will be fed directly to a text-to-speech program, don't repeat the word itself, and skip introductory comments like "I will explain X". Just start explaining straight away.

Explain the entire thing in one sentence. Try to make the explanation as intuitive as possible, using plain language. Keep the explanation short (around 15 words max, but less if that isn't needed).

Text: ${text}
`;

async function fetchConceptualDefinition(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Set it before building the extension.");
  }

  const body = {
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: "You generate concise conceptual definitions as instructed.",
      },
      { role: "user", content: promptTemplate(text) },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message?.content;
  if (!choice) throw new Error("No definition returned.");
  return choice.trim();
}

chrome.runtime.onMessage.addListener((message: FetchConceptMessage, _sender, sendResponse) => {
  if (message?.type !== "fetchConcept") return;

  fetchConceptualDefinition(message.text)
    .then((definition) => sendResponse({ success: true, definition }))
    .catch((error: Error) => {
      console.error("Concept fetch failed", error);
      sendResponse({ success: false, error: error.message });
    });

  return true;
});

