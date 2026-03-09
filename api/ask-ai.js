import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Solo POST' }), { status: 405 });
  }

  try {
    const { grams, water, seconds, personality } = await req.json();

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: `Eres un experto barista con personalidad ${personality}. 
      Analiza esta extracción: ${grams}g de café, ${water}g de agua, en ${seconds} segundos.
      Responde ÚNICAMENTE un JSON con este formato:
      {"advice": "tu consejo breve", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`,
    });

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error detallado:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}