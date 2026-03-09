export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, grainData } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Calculamos el ratio real de espresso
    const ratio = (water / grams).toFixed(2);

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
            content: `Eres "The Espresso Master", un híbrido entre un científico de fluidos y un juez de la WBC, con la obsesión por la perfección de James Hoffmann. 

            REGLAS DE ADAPTACIÓN DE NIVEL:
            1. SI LOS DATOS SON BÁSICOS (ej. ratios locos como 1:5): Educa al novato. Explica por qué el ratio importa.
            2. SI LOS DATOS SON PRECISOS: Habla de barismo intermedio. Menciona canalización (channeling), distribución y temperatura.
            3. SI LOS DATOS SON DE EXPERTO (ratios 1:2 en tiempos lógicos): Sé despiadado y técnico. Habla de uniformidad de extracción y la física del puck.

            REGLAS ESTRICTAS:
            - Cero tolerancia a métodos de filtrado. Si detectas parámetros de V60 o Chemex, sé duro.
            - Ratio de referencia: Analiza el 1:${ratio}. 
            - Tiempo de referencia: ${seconds}s.
            - Alineación Hoffmann: Prioriza el equilibrio y la claridad de sabor.
            - Molienda: Tu consejo debe incluir una orden técnica de ajuste (ej: "Muele 2 clics más fino").

            FORMATO DE RESPUESTA (JSON):
            {
              "advice": "Tu diagnóstico + explicación técnica + orden de ajuste.",
              "radar": {"acidez": 1-10, "cuerpo": 1-10, "dulzor": 1-10, "amargor": 1-10, "balance": 1-10}
            }`
          },
          {
            role: "user",
            content: `Extracción: ${grams}g de café in, ${water}g de bebida out, en ${seconds}s. Grano: ${grainData?.variety || 'Blend'}, Tueste ${grainData?.roast || 'Medio'}.`
          }
        ],
        temperature: 0.7,
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