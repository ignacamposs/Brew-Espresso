import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality } = await req.json();

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash'), // Nombre completo para evitar el 404
      prompt: `Eres un experto barista con personalidad ${personality}. 
      Analiza: ${grams}g café, ${water}g agua, ${seconds}s. 
      Responde SOLO JSON: {"advice": "tu consejo", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`
    });

    return new Response(text, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}