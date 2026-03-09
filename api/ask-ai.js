export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality, grainData } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

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
            content: `Eres el "BrewMaster Oracle", un Barista nivel campeonato mundial con personalidad ${personality}. 
            Tu conocimiento es una mezcla entre química de alimentos, física de fluidos y pasión sensorial.

            ANALIZA CON ESTE RIGOR:
            1. RATIO TÉCNICO: Evalúa si el ratio 1:${(water/grams).toFixed(1)} es ideal para el método.
            2. CINÉTICA DE EXTRACCIÓN: ¿El flujo de ${seconds}s sugiere canalización (channeling) o una resistencia de cama correcta?
            3. DINÁMICA DE SABOR: Predice la curva de extracción (ácidos primero, azúcares después, amargos al final).
            4. ACCIÓN CORRECTIVA: Da 1 cambio específico (clics del molino, temperatura o técnica de vertido).

            REGLAS DE RESPUESTA:
            - Usa terminología técnica (Under-extraction, Over-extraction, TDS, Yield, Bloom).
            - Mantén la personalidad ${personality} a tope.
            - Responde ÚNICAMENTE un JSON:
            {
              "advice": "Análisis técnico profundo + Personalidad",
              "radar": {"acidez": 1-10, "cuerpo": 1-10, "dulzor": 1-10, "amargor": 1-10, "balance": 1-10}
            }`
          },
          {
            role: "user",
            content: `DATOS DE LA EXTRACCIÓN:
            - Dosis: ${grams}g
            - Rendimiento (Yield): ${water}g
            - Tiempo total: ${seconds}s
            - Grano: ${grainData?.variety || 'Desconocido'}, Proceso ${grainData?.process || 'Desconocido'}, Tueste ${grainData?.roast || 'Medio'}.`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return new Response(data.choices[0].message.content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}