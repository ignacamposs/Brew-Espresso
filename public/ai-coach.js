document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const askAiBtn = document.getElementById('ask-ai-btn'); // Botón principal de análisis

    let chatHistory = []; // Aquí se guarda la memoria de la sesión

    // Función para agregar burbujas al chat
    const appendMessage = (role, text) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
            role === 'user' 
            ? 'bg-white/10 text-white ml-auto rounded-tr-none' 
            : 'bg-[#d4a373]/20 text-[#d4a373] mr-auto rounded-tl-none border border-[#d4a373]/20'
        }`;
        
        msgDiv.innerHTML = `<strong>${role === 'user' ? 'Tú' : 'Maestro'}:</strong> ${text}`;
        chatBox.appendChild(msgDiv);
        
        // Auto-scroll al último mensaje
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    // Función principal para enviar mensajes a la API
    const sendMessage = async (initialRequest = false) => {
        const userText = initialRequest ? "Analiza mi extracción actual y dame un diagnóstico." : chatInput.value.trim();
        
        if (!userText) return;

        // Si no es el análisis inicial, mostramos lo que escribió el usuario
        if (!initialRequest) {
            appendMessage('user', userText);
            chatInput.value = '';
        }

        // Capturamos los datos técnicos del momento
        const payload = {
            grams: parseFloat(document.getElementById('input-cafe').value),
            water: parseFloat(document.getElementById('input-agua').value),
            seconds: window.currentSeconds || 0,
            grainData: {
                variety: document.getElementById('input-variedad')?.value,
                roast: document.getElementById('input-tostado')?.value,
                process: document.getElementById('input-proceso')?.value
            },
            history: [...chatHistory, { role: "user", content: userText }]
        };

        try {
            const response = await fetch('/api/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error en la conexión');

            const data = await response.json();

            // Guardamos en la memoria local
            chatHistory.push({ role: "user", content: userText });
            chatHistory.push({ role: "assistant", content: data.advice });

            // Mostramos la respuesta del Maestro
            appendMessage('assistant', data.advice);

            // Actualizamos el radar si viene en el JSON
            if (data.radar && window.actualizarGraficoRadar) {
                document.getElementById('radar-container').classList.remove('hidden');
                window.actualizarGraficoRadar(data.radar);
            }

        } catch (error) {
            appendMessage('assistant', "Lo siento, Nacho. Hubo un error al conectar con la API.");
            console.error(error);
        }
    };

    // Evento para el botón de "Analizar" (Resetea el chat y arranca de cero)
    if (askAiBtn) {
        askAiBtn.addEventListener('click', () => {
            chatBox.innerHTML = ''; // Limpiamos el chat anterior
            chatHistory = [];      // Reseteamos la memoria
            sendMessage(true);     // Enviamos el primer análisis
        });
    }

    // Eventos para el chat manual
    sendBtn.addEventListener('click', () => sendMessage(false));
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(false);
    });
});