document.addEventListener('DOMContentLoaded', () => {
    const askAiBtn = document.getElementById('ask-ai-btn');
    const responseElement = document.getElementById('ai-response');
    const radarContainer = document.getElementById('radar-container');

    if (askAiBtn) {
        askAiBtn.addEventListener('click', async () => {
            // 1. Capturamos los datos de los inputs (Usando los IDs de tu HTML)
            const grams = parseFloat(document.getElementById('input-cafe').value);
            const water = parseFloat(document.getElementById('input-agua').value);
            
            // Usamos window.currentSeconds que viene de tu app.js
            const seconds = window.currentSeconds || 0; 
            
            // Datos del grano
            const variety = document.getElementById('input-variedad')?.value || 'Blend';
            const roast = document.getElementById('input-tostado')?.value || 'Medio';
            const process = document.getElementById('input-proceso')?.value || 'Natural';

            // Validación rápida
            if (!grams || !water) {
                alert("Nacho, para que el Maestro hable, primero poné los gramos de café y el agua.");
                return;
            }

            // 2. Feedback visual (Estado de carga)
            askAiBtn.disabled = true;
            askAiBtn.innerText = "ANALIZANDO PUCK...";
            responseElement.innerText = "The Espresso Master está evaluando la extracción...";
            responseElement.classList.add('animate-pulse');

            try {
                // 3. Llamada a nuestra API en Vercel
                const response = await fetch('/api/ask-ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grams,
                        water,
                        seconds,
                        grainData: {
                            variety,
                            roast,
                            process
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Fallo en la conexión');
                }

                const data = await response.json();

                // 4. Mostramos el resultado y activamos el Radar
                responseElement.innerText = data.advice;
                responseElement.classList.remove('animate-pulse');

                // Si la IA devolvió datos de radar, mostramos el contenedor y actualizamos
                if (data.radar) {
                    radarContainer.classList.remove('hidden');
                    if (window.actualizarGraficoRadar) {
                        window.actualizarGraficoRadar(data.radar);
                    }
                }

            } catch (error) {
                console.error('Error:', error);
                responseElement.innerText = "Error: " + error.message;
            } finally {
                // Restauramos el botón
                askAiBtn.disabled = false;
                askAiBtn.innerText = "ANALIZAR EXTRACCIÓN CON IA";
            }
        });
    }
});