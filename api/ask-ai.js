export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { grams, water, seconds, personality } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No encontré la API KEY en Vercel" }), { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Eres un barista ${personality}. Analiza: ${grams}g café, ${water}g agua, ${seconds}s. Responde SOLO JSON.` }] }]
      })
    });

    const data = await response.json();

    // SI GOOGLE DA ERROR, LO DEVOLVEMOS PARA VERLO EN LA CONSOLA
    if (data.error) {
      return new Response(JSON.stringify({ 
        error: "Google dice: " + data.error.message,
        details: data.error 
      }), { status: 500 });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    return new Response(aiText.replace(/```json|```/g, '').trim(), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Error de código: " + e.message }), { status: 500 });
  }
}