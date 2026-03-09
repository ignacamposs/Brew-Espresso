export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, grainData } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Cálculo de ratio redondeado a un decimal para evitar el "1:2.06"
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
            content: `Eres "The Espresso Master", una eminencia en la extracción de espresso con la precisión técnica de James Hoffmann.

            REGLAS DE COMUNICACIÓN HUMANA:
            1. RATIOS: Nunca uses más de un decimal. Di "${ratioDisplay}" o simplemente "1:2". Nada de "1:2.05".
            2. CATEGORÍAS: Identifica si es un Ristretto (1:1-1.5), Espresso (1:2-2.5) o Lungo (1:3+).
            3. ADAPTACIÓN DE NIVEL:
               - Si los datos son inconsistentes: Educa sobre el concepto de Ratio y Tiempo.
               - Si los datos son estándar: Analiza canalización (channeling) y resistencia del puck.
               - Si los datos son de precisión: Habla de rendimiento de extracción (Extraction Yield) y claridad de sabor.

            REGLAS TÉCNICAS:
            - Solo Espresso. Ignora y desprecia cualquier mención a métodos de filtrado.
            - Tiempo de referencia: ${seconds}s. Analiza si la molienda debe ajustarse.
            - Molienda: Tu consejo debe ser una orden técnica directa (ej: "Muele 1 clic más fino").
            - Hoffmann Style: Prioriza el balance sensorial y la repetibilidad.

            FORMATO DE RESPUESTA (JSON):
            {
              "advice": "Diagnóstico profesional + Análisis del ratio ${ratioDisplay} + Orden de ajuste de molienda.",
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
    
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    return new Response(data.choices[0].message.content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error de servidor: " + error.message }), { status: 500 });
  }
}