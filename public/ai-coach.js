document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const askAiBtn = document.getElementById('ask-ai-btn');

    let chatHistory = [];

    const appendMessage = (role, text) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
            role === 'user' 
            ? 'bg-white/10 text-white ml-auto rounded-tr-none' 
            : 'bg-[#d4a373]/20 text-[#d4a373] mr-auto rounded-tl-none border border-[#d4a373]/20'
        }`;
        msgDiv.innerHTML = `<strong>${role === 'user' ? 'Tú' : 'Maestro'}:</strong> ${text}`;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const sendMessage = async (initialRequest = false) => {
        const grams = parseFloat(document.getElementById('input-cafe').value);
        const water = parseFloat(document.getElementById('input-agua').value);
        const seconds = window.currentSeconds || 0; 

        if (initialRequest && (isNaN(grams) || isNaN(water))) {
            alert("Nacho, ingresá los gramos de café y agua para que el Maestro pueda analizar algo.");
            return;
        }

        // CORRECCIÓN: Definimos userText una sola vez de forma limpia
        let userText = "";
        if (initialRequest) {
            userText = `ANÁLISIS TÉCNICO: Café: ${grams}g | Agua: ${water}g | Tiempo: ${seconds}s.`;
        } else {
            userText = chatInput.value.trim();
        }
        
        if (!userText) return;

        if (!initialRequest) {
            appendMessage('user', userText);
            chatInput.value = '';
        }

        const payload = {
            grams: grams,
            water: water,
            seconds: seconds,
            grainData: {
                variety: document.getElementById('input-variedad')?.value || 'Blend',
                roast: document.getElementById('input-tostado')?.value || 'Medio',
                process: document.getElementById('input-proceso')?.value || 'Natural'
            },
            history: [...chatHistory, { role: "user", content: userText }]
        };

        try {
            const response = await fetch('/api/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Guardamos en memoria para mantener el hilo
            chatHistory.push({ role: "user", content: userText });
            chatHistory.push({ role: "assistant", content: data.advice });

            appendMessage('assistant', data.advice);

            if (data.radar && window.actualizarGraficoRadar) {
                document.getElementById('radar-container').classList.remove('hidden');
                window.actualizarGraficoRadar(data.radar);
            }

        } catch (error) {
            appendMessage('assistant', "Error de comunicación con la red neuronal.");
        }
    };

    if (askAiBtn) {
        askAiBtn.addEventListener('click', () => {
            chatBox.innerHTML = ''; 
            chatHistory = [];      
            sendMessage(true);     
        });
    }

    sendBtn.addEventListener('click', () => sendMessage(false));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(false);
    });
});