export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { grams, water, seconds, personality } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ error: "No hay API KEY" }), { status: 500 });

    // USAMOS EL MODELO 1.5 FLASH QUE TIENE MÁS CUOTA DISPONIBLE
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Eres un experto barista con personalidad ${personality}. Analiza: ${grams}g café, ${water}g agua, ${seconds}s. Responde SOLO JSON: {"advice": "tu consejo breve", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: "Google dice: " + data.error.message }), { status: 500 });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json|```/g, '').trim();

    return new Response(cleanJson, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}