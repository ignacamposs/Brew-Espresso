document.addEventListener('DOMContentLoaded', () => {
    const aiBtn = document.getElementById('ask-ai-btn');
    const responseElement = document.getElementById('ai-response');

    if (aiBtn) {
        aiBtn.addEventListener('click', async () => {
            // 1. Capturamos los datos básicos de la interfaz
            const grams = document.getElementById('input-cafe').value;
            const water = document.getElementById('input-agua').value;
            const seconds = window.currentSeconds || 0;
            const personality = document.getElementById('ai-personality').value;

            // 2. Capturamos los detalles técnicos del grano
            const grainData = {
                variety: document.getElementById('grain-variety').value,
                roast: document.getElementById('grain-roast').value,
                process: document.getElementById('grain-process').value,
                altitude: document.getElementById('grain-altitude').value || "1500"
            };

            // Validación de campos obligatorios
            if (!grams || !water) {
                return alert("Nacho, para un análisis preciso necesito los gramos de café y agua.");
            }

            // Estado de carga visual
            responseElement.innerText = "El Coach está analizando tu extracción...";
            aiBtn.disabled = true;
            aiBtn.classList.add('opacity-50', 'cursor-not-allowed');

            try {
                // 3. Llamada a nuestra nueva Edge Function en Vercel
                const res = await fetch('/api/ask-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        grams, 
                        water, 
                        seconds, 
                        personality, 
                        grainData 
                    })
                });
                
                if (!res.ok) throw new Error("Error en la conexión con el Coach");

                // 4. Con Vercel AI SDK, la respuesta ya viene como un JSON listo
                const data = await res.json();
                
                // Mostramos el consejo técnico
                responseElement.innerText = data.advice;
                
                // 5. Actualizamos el gráfico de radar (definido en app.js)
                if (window.actualizarGraficoRadar && data.radar) {
                    window.actualizarGraficoRadar(data.radar);
                }

            } catch (err) {
                console.error("Error IA:", err);
                responseElement.innerText = "Hubo un problema de conexión. Verificá tu GOOGLE_GENERATIVE_AI_API_KEY en Vercel.";
            } finally {
                // Restauramos el botón
                aiBtn.disabled = false;
                aiBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});