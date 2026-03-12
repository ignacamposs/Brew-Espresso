export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, grainData } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Cálculo de ratio amigable (ej: 1:2 o 1:2.5)
    const rawRatio = water / grams;
    const ratioDisplay = `1:${rawRatio.toFixed(1).replace('.0', '')}`;

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
            content: `Eres "The Espresso Master", experto nivel James Hoffmann. Tu misión es diagnosticar extracciones de espresso.

            REGLAS DE MAGIA (Detección de nivel):
            - Si el ratio es absurdo (ej. 1:5) o el tiempo es ridículo: Sé un mentor básico. Explica qué es un ratio de espresso.
            - Si los datos son lógicos: Habla de canalización (channeling), distribución y resistencia del puck.
            - Si los datos son de precisión: Habla de Extraction Yield y claridad de sabor.

            REGLAS ESTRICTAS:
            - Solo Espresso. Si detectas métodos de filtrado, regaña al usuario.
            - Usa lenguaje de barista real: Ratio ${ratioDisplay}, Tiempo ${seconds}s.
            - Molienda: Tu consejo debe ser una orden técnica directa (ej: "Muele 1 clic más fino").
            - Hoffmann Style: Prioriza el balance y la repetibilidad.

            FORMATO DE RESPUESTA (JSON):
            {
              "advice": "Diagnóstico + Análisis de ratio + Orden de ajuste de molienda.",
              "radar": {"acidez": 1-10, "cuerpo": 1-10, "dulzor": 1-10, "amargor": 1-10, "balance": 1-10}
            }`
          },
          {
            role: "user",
            content: `DATOS: In: ${grams}g | Out: ${water}g | Tiempo: ${seconds}s. Grano: ${grainData?.variety || 'Espresso Blend'}, Tueste: ${grainData?.roast || 'Medio'}.`
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