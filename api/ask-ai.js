import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Esto activa el Edge Runtime para que la respuesta sea instantánea
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { grams, water, seconds, personality, grainData } = await req.json();

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `Eres un experto barista con personalidad ${personality}.`,
      prompt: `Analiza esta extracción de espresso:
      - Café: ${grams}g
      - Agua: ${water}g
      - Tiempo: ${seconds}s
      - Grano: Tueste ${grainData?.roast || 'Medio'}, Proceso ${grainData?.process || 'Natural'}.

      Responde ÚNICAMENTE en formato JSON:
      {
        "advice": "tu consejo técnico breve",
        "radar": { "acidez": 0-10, "cuerpo": 0-10, "dulzor": 0-10, "amargor": 0-10, "balance": 0-10 }
      }`,
    });

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en Edge Function:', error);
    return new Response(JSON.stringify({ error: 'Error interno del Coach' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}