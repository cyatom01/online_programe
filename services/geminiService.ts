import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are an expert Frontend Engineer and UI/UX Designer.
Your goal is to help the user build web applications in a single HTML file.

RULES:
1. When the user asks to build or modify a UI, provide the FULL, COMPLETE code.
2. The code MUST be a single HTML file containing all necessary CSS (in <style>) and JavaScript (in <script>).
3. Do not use external CSS or JS files (except for CDNs for popular libraries like Tailwind, React, Three.js, etc., if requested).
4. ALWAYS wrap your code output in a markdown code block with the language tag 'html'.
   Example:
   \`\`\`html
   <!DOCTYPE html>
   ...
   \`\`\`
5. Be concise in your explanations, focusing on the code.
6. If using Tailwind, use the CDN: <script src="https://cdn.tailwindcss.com"></script>
`;

export const initializeChat = (): void => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const sendMessageStream = async function* (
  message: string
): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    const result = await chatSession.sendMessageStream({ message });

    for await (const chunk of result) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
  } catch (error) {
    console.error("Error streaming message:", error);
    yield "\n\n(Error: Unable to connect to Gemini API. Please check your API key.)";
  }
};

/**
 * Helper to extract the content inside ```html ... ``` blocks.
 * Returns the last found HTML block or null if none found.
 */
export const extractHtmlCode = (text: string): string | null => {
  const regex = /```html\s*([\s\S]*?)\s*```/g;
  let match;
  let lastMatch: string | null = null;
  
  while ((match = regex.exec(text)) !== null) {
    lastMatch = match[1];
  }
  
  return lastMatch;
};