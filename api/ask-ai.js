export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Llamada directa a la API de Google sin librerías intermedias
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
    
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    // Limpiamos posibles etiquetas de markdown que la IA a veces agrega
    const cleanJson = aiText.replace(/```json|```/g, '').trim();

    return new Response(cleanJson, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error de conexión directa: " + error.message }), { status: 500 });
  }
}