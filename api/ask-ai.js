export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Conexión directa por URL (esto no falla nunca si la key es válida)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres un experto barista con personalidad ${personality}. 
            Analiza esta extracción: ${grams}g de café, ${water}g de agua, en ${seconds} segundos.
            Responde ÚNICAMENTE un JSON con este formato exacto:
            {"advice": "tu consejo breve", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Si la clave está mal o Google rechaza, nos enteramos acá
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Error en Google" }), { status: response.status });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    // Limpieza de formato por si la IA devuelve texto con Markdown
    const cleanJson = aiText.replace(/```json|```/g, '').trim();

    return new Response(cleanJson, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Fallo de red: " + error.message }), { status: 500 });
  }
}