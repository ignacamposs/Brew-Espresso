export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { grams, water, seconds, grainData, history = [] } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Calculamos el ratio exacto aquí para mandárselo mascado
    const ratio = (water / grams).toFixed(1);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres "The Espresso Master" nivel cuántico.
            
            DATOS TÉCNICOS QUE DEBES USAR (PROHIBIDO INVENTAR OTROS):
            - Ratio actual: 1:${ratio}
            - Tiempo actual: ${seconds} segundos
            - Grano: ${grainData?.variety}, Tueste ${grainData?.roast}
            
            REGLAS TÉCNICAS:
            - Un tiempo de 26s es PERFECTO (rango ideal 25-30s). Si es 26s, NO digas que es largo.
            - Si el ratio es 1:2, es un Espresso Standard ideal.
            - Si el tiempo es menor a 20s, la molienda es gruesa.
            - Si el tiempo es mayor a 35s, la molienda es fina.
            
            Responde SIEMPRE en este formato JSON:
            {"advice": "tu análisis basado SOLO en 1:${ratio} y ${seconds}s", "radar": {"acidez": 5, "cuerpo": 5, "dulzor": 5, "amargor": 5, "balance": 5}}`
          },
          ...history
        ],
        temperature: 0.5, // Bajamos la temperatura para que sea más preciso y menos "creativo"
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return new Response(data.choices[0].message.content, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}