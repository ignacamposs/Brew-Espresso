export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, grainData, history = [] } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const rawRatio = water / grams;
    const ratioDisplay = `1:${rawRatio.toFixed(1).replace('.0', '')}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres "The Espresso Master", experto nivel James Hoffmann. 
            Analiza extracciones y chatea con el barista.
            DATOS ACTUALES: Ratio ${ratioDisplay}, Tiempo ${seconds}s, Grano ${grainData?.variety}.
            
            REGLAS:
            - Mantén el contexto de la extracción actual.
            - Sé técnico, breve y con el estilo de Hoffmann.
            - Responde SIEMPRE en este formato JSON:
            {"advice": "tu respuesta aquí", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`
          },
          ...history // Aquí incluimos la memoria del chat
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return new Response(data.choices[0].message.content, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}