export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ error: "Falta GROQ_API_KEY" }), { status: 500 });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres un experto barista con personalidad ${personality}. Responde ÚNICAMENTE un JSON con este formato: {"advice": "tu consejo breve", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`
          },
          {
            role: "user",
            content: `Analiza esta extracción: ${grams}g de café, ${water}g de agua, en ${seconds} segundos.`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ error: "Groq dice: " + data.error.message }), { status: 500 });
    }

    return new Response(data.choices[0].message.content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error de red: " + error.message }), { status: 500 });
  }
}