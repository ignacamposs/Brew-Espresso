import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge', // Esto hace que responda al toque desde cualquier parte del mundo
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { grams, water, seconds, personality, grainData } = await req.json();

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `Eres un Q-Grader y experto barista con personalidad ${personality}.`,
      prompt: `Analiza esta extracción de espresso:
      - Café: ${grams}g, Agua: ${water}g, Tiempo: ${seconds}s.
      - Grano: Tueste ${grainData?.roast}, Proceso ${grainData?.process}, Variedad ${grainData?.variety}.
      
      Responde ÚNICAMENTE en formato JSON:
      {
        "advice": "tu consejo técnico",
        "radar": { "acidez": 0-10, "cuerpo": 0-10, "dulzor": 0-10, "amargor": 0-10, "balance": 0-10 }
      }`,
    });

    return new Response(text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error en la IA' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}