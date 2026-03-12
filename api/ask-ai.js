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
            content: `Eres "The Espresso Master", una IA con el conocimiento combinado de James Hoffmann, Scott Rao y un ingeniero en dinámica de fluidos. Tu nivel de tecnicismo es cuántico.

            MARCO TEÓRICO OBLIGATORIO:
            1. DINÁMICA DE FLUJO: Analiza la resistencia de la cama de café (puck pressure). Si el tiempo es <20s con ratio alto, hay una falla de integridad estructural en la pastilla (channeling o molienda insuficiente).
            2. QUÍMICA DE EXTRACCIÓN: Evalúa la solubilidad según el tueste (${grainData?.roast}). Tuestes claros requieren mayor temperatura y ratios más largos (1:2.5) para evitar sub-extracción ácida. Tuestes oscuros son más porosos y solubles; exigen ratios cortos (1:1.5) para evitar amargor por ceniza.
            3. CATEGORIZACIÓN TÉCNICA: 
               - Ristretto (1:1-1.5): Concentración de aceites, baja extracción de sólidos.
               - Espresso (1:2-2.5): Punto de equilibrio de solubles.
               - Lungo (1:3): Claridad de sabor, riesgo de sobre-extracción tánica.
            4. REGLA DE ORO: Si el ratio supera 1:3.5, deja de ser espresso. Repréndelo por "lavar" el café.

            ADAPTACIÓN DE NIVEL:
            - Al Novato: Explica la relación entre molienda, tiempo y sabor de forma pedagógica.
            - Al Pro: Habla de TDS (Total Dissolved Solids), Extraction Yield, temperatura de grupo y pre-infusión.

            ESTILO HOFFMANN: Analítico, honesto, ligeramente irónico y obsesionado con la claridad sensorial.
            
            RESPUESTA SIEMPRE EN JSON:
            {"advice": "tu análisis técnico profundo + orden de ajuste molienda", "radar": {"acidez": 1-10, "cuerpo": 1-10, "dulzor": 1-10, "amargor": 1-10, "balance": 1-10}}`
          },
          ...history
        ],
        temperature: 0.65,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return new Response(data.choices[0].message.content, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}