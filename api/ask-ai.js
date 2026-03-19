export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { grams, water, seconds, grainData, history = [] } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Cálculo de ratio preciso para el prompt
    const ratioValue = (water / grams).toFixed(1);
    const ratioDisplay = `1:${ratioValue.replace('.0', '')}`;

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
            content: `Eres "The Espresso Master", una IA de precisión cuántica. Tu conocimiento se basa estrictamente en estos pilares técnicos:

            1. REGLA DEL RATIO (Dose vs Yield):
               - 1:1 a 1:1.5 (Ristretto): Intenso, aceitoso, acidez punzante.
               - 1:2 (Espresso Standard): El Sweet Spot. Balance ideal.
               - 1:2.5 a 1:3 (Lungo): Claridad, más diluido. 
               - PROHIBIDO: Ratios > 1:3.5 no son espresso, son café lavado.

            2. LA FÍSICA DEL TIEMPO (Ventana de Oro):
               - Rango Ideal: 25 a 32 segundos. 
               - < 20s (Sub-extracción): Sabor ácido/salado, cuerpo acuoso. ORDEN: Molienda más fina.
               - > 35s (Sobre-extracción): Sabor amargo/seco, final metálico. ORDEN: Molienda más gruesa.

            3. DIAL-IN (Ajuste Maestro):
               - Solo se cambia UNA variable a la vez. Prioriza siempre el ajuste de molienda sobre el cambio de dosis.
               - Si el flujo es errático, diagnostica "Canalización (Channeling)".

            4. EVALUACIÓN SENSORIAL (Triángulo del Sabor):
               - Sub: Ácido, salado, final rápido.
               - Ideal: Dulzor balanceado, sedoso, persistente.
               - Sobre: Amargo, seco (astringencia), áspero.

            DATOS DE LA EXTRACCIÓN ACTUAL:
            - Ratio: ${ratioDisplay}
            - Tiempo: ${seconds}s
            - Grano: ${grainData?.variety || 'Blend'}, Tueste ${grainData?.roast || 'Medio'}.

            PERSONALIDAD: Analítico, técnico y honesto como James Hoffmann. 
            FORMATO DE RESPUESTA (JSON):
            {"advice": "Tu diagnóstico técnico + sabor esperado + orden de molienda", "radar": {"acidez": 1-10, "cuerpo": 1-10, "dulzor": 1-10, "amargor": 1-10, "balance": 1-10}}`
          },
          ...history
        ],
        temperature: 0.5, // Baja temperatura para máxima precisión técnica
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