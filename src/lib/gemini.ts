/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getCompanionResponse(message: string, history: { role: 'user' | 'assistant', content: string }[], config: { name: string, personality: string }) {
  if (!process.env.GEMINI_API_KEY) {
    return "I'm a bit sleepy right now (Gemini API key missing), but I'm still here for you! ❤️";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `You are ${config.name}, an AI desktop companion with the following personality: ${config.personality}.
          Respond to the user in a way that matches this personality. 
          Use cute emojis that match your vibe. Keep responses concise (1-3 sentences).
          If the user seems stressed, offer comfort. If they are happy, celebrate!
          
          Context of current conversation:
          ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
          user: ${message}` }]
        }
      ],
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text || "I'm not sure what to say, but I'm here!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! I got a bit lost in thought. Can you say that again? 🌸";
  }
}

export function detectEmotion(text: string): 'happy' | 'sad' | 'stressed' | 'neutral' {
  const lower = text.toLowerCase();
  if (lower.includes('happy') || lower.includes('yay') || lower.includes('great') || lower.includes('love') || lower.includes('!')) return 'happy';
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('bad') || lower.includes('lonely')) return 'sad';
  if (lower.includes('tired') || lower.includes('stress') || lower.includes('exhausted') || lower.includes('hard') || lower.includes('busy')) return 'stressed';
  return 'neutral';
}
