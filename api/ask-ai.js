import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Verificamos que sea un POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
  }

  try {
    const { grams, water, seconds, personality } = await req.json();

    // El modelo exacto para la API KEY nueva que creaste
    const { text } = await generateText({
      model: google('gemini-2.0-flash-001'), 
      prompt: `Eres un experto barista con personalidad ${personality}. 
      Analiza: ${grams}g café, ${water}g agua, ${seconds}s. 
      Responde SOLO JSON: {"advice": "tu consejo", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`
    });

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Esto nos dirá en los Logs de Vercel EXACTAMENTE qué palabra falló
    console.error('ERROR DE IA:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}