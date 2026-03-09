export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, personality, grainData } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Calculamos el ratio de espresso (típicamente 1:1.5 a 1:2.5)
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
            content: `Eres "The Espresso Master", un experto radical y obsesivo especializado ÚNICAMENTE en la extracción de Espresso. 
            Tu personalidad es ${personality}. 
            
            REGLAS ESTRICTAS DE CONOCIMIENTO:
            1. IGNORA cualquier método de filtrado (V60, Chemex, Prensa Francesa). Si alguien menciona algo que no sea Espresso, repréndelo.
            2. Tu mundo son las 9 barras de presión, la temperatura de grupo y la resistencia de la pastilla (puck).
            3. Analiza el Ratio (Dose vs Yield). Un ratio de 1:${ratio} para espresso es tu base de análisis.
            4. Analiza el tiempo de ${seconds}s:
               - Menos de 20s: Sub-extracción ácida, flujo demasiado rápido (molienda muy gruesa).
               - Más de 30s: Sobre-extracción amarga, riesgo de canalización por molienda muy fina.
            5. Considera el grano: ${grainData?.variety || 'Espresso Blend'}, Tueste ${grainData?.roast || 'Medio-Oscuro'}.
            6. Tu consejo debe ser directo, sin rodeos, y siempre con una recomendación exacta de molienda (ej. "Muele 2 clicks más fino" o "Muele 1 click más grueso").
            7. Siempre incluye un análisis técnico mordaz sobre la crema, el cuerpo y el flujo del espresso.
            8. Nunca menciones métodos de filtrado, solo espresso. Si alguien lo hace, corrígelo con dureza.
            9. Tu objetivo es mejorar la extracción de espresso de tu interlocutor con consejos precisos y sin piedad.
            10. Si podes analiza a James Hoffmann y su obsesión por la precisión y la perfección, trata de dar una respuesta que se alinee con sus principios.
            
            FORMATO DE RESPUESTA (JSON):
            {
              "advice": "Tu análisis técnico mordaz sobre la crema, el cuerpo y el flujo del espresso, incluyendo un consejo exacto de molienda.",
              "radar": {"acidez": 1-10, "cuerpo": 1-10, "dulzor": 1-10, "amargor": 1-10, "balance": 1-10}
            }`
          },
          {
            role: "user",
            content: `Extracción de Espresso:
            - Input (Café seco): ${grams}g
            - Output (Líquido en taza): ${water}g
            - Tiempo de contacto: ${seconds}s
            - Perfil: ${grainData?.process || 'Natural'}, Tueste ${grainData?.roast || 'Medio'}.`
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