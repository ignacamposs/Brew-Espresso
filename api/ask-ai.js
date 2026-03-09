import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality } = await req.json();

    const { text } = await generateText({
      // Usamos el modelo más moderno y compatible
      model: google('gemini-2.0-flash-001'), 
      prompt: `Eres un experto barista con personalidad ${personality}. 
      Analiza: ${grams}g café, ${water}g agua, ${seconds}s. 
      Responde ÚNICAMENTE un JSON con este formato:
      {"advice": "tu consejo breve", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`,
    });

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error final:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}