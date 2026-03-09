let timerInterval;
let seconds = 0;
let isRunning = false;
const ring = document.getElementById('progress-ring');
const circumference = 58 * 2 * Math.PI;
window.currentSeconds = 0;

// NUEVO: Tiempo objetivo (por defecto 40s para espresso)
let maxTiempoIdeal = 40; 

function toggleTimer() {
    const btn = document.getElementById('btn-timer');
    if (!isRunning) {
        isRunning = true;
        btn.innerText = "Pausar";
        timerInterval = setInterval(updateTimer, 1000);
    } else {
        stopTimer();
        btn.innerText = "Continuar";
    }
    // SE ELIMINÓ: window.currentSeconds++ que estaba acá
}

function updateTimer() {
    seconds++;
    window.currentSeconds = seconds;
    const display = document.getElementById('timer-display');
    display.innerText = `${seconds.toString().padStart(2, '0')}s`;

    // Animación del anillo dinámica
    const offset = circumference - (seconds / maxTiempoIdeal) * circumference;
    ring.style.strokeDashoffset = Math.max(0, offset);

    // Feedback visual (Rango de oro para Espresso)
    // Mañana ajustaremos estos rangos según el método elegido
    if (seconds >= 25 && seconds <= 30) {
        display.classList.add('text-emerald-400');
        ring.classList.replace('text-[#d4a373]', 'text-emerald-400');
    } else {
        display.classList.remove('text-emerald-400');
        if (ring.classList.contains('text-emerald-400')) {
            ring.classList.replace('text-emerald-400', 'text-[#d4a373]');
        }
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    window.currentSeconds = 0;
    document.getElementById('timer-display').innerText = "00s";
    document.getElementById('btn-timer').innerText = "Iniciar";
    ring.style.strokeDashoffset = circumference;
}

function calcularExtraccion() {
    const cafe = parseFloat(document.getElementById('input-cafe').value);
    const agua = parseFloat(document.getElementById('input-agua').value);
    const resultDiv = document.getElementById('resultado');
    const displayRatio = document.getElementById('display-ratio');
    const displayMsg = document.getElementById('display-msg');

    if (!cafe || !agua || cafe <= 0) {
        alert("¡Che Nacho! Falta la dosis de café para el cálculo.");
        return;
    }

    const ratio = (agua / cafe).toFixed(1);
    displayRatio.innerText = `1:${ratio}`;
    
    if (ratio < 1.5) {
        displayMsg.innerText = "Ristretto - Corto y Fuerte";
    } else if (ratio >= 1.5 && ratio <= 2.5) {
        displayMsg.innerText = "Espresso - Punto Dulce";
    } else {
        displayMsg.innerText = "Lungo - Extracción Larga";
    }

    resultDiv.classList.add('visible');
}

// --- PERSISTENCIA (LocalStorage) ---

let historial = JSON.parse(localStorage.getItem('brewHistory')) || [];

function guardarBrew() {
    const cafe = document.getElementById('input-cafe').value;
    const agua = document.getElementById('input-agua').value;
    const tiempo = window.currentSeconds || 0;

    if (!cafe || !agua) return alert("Faltan datos para guardar");

    const nuevaReceta = {
        id: Date.now(),
        cafe,
        agua,
        tiempo,
        fecha: new Date().toLocaleDateString()
    };

    historial.unshift(nuevaReceta);
    localStorage.setItem('brewHistory', JSON.stringify(historial));
    actualizarVistaHistorial();
}

function actualizarVistaHistorial() {
    const contenedor = document.getElementById('historial-container');
    const lista = document.getElementById('lista-brews');
    
    if (historial.length === 0) {
        contenedor.classList.add('hidden');
        return;
    }

    contenedor.classList.remove('hidden');
    lista.innerHTML = historial.map(brew => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/5 mb-3">
            <div class="flex justify-between items-center">
                <span class="text-[#d4a373] font-bold">${brew.cafe}g / ${brew.agua}g</span>
                <span class="text-[10px] opacity-50">${brew.fecha}</span>
            </div>
            <div class="text-[10px] uppercase tracking-wider opacity-70 mt-1">
                Tiempo: ${brew.tiempo}s
            </div>
        </div>
    `).join('');
}

function borrarHistorial() {
    if(confirm("¿Borramos todo el historial?")) {
        historial = [];
        localStorage.removeItem('brewHistory');
        actualizarVistaHistorial();
    }
}

// --- GRÁFICO ---

let flavorChart = null;

window.actualizarGraficoRadar = function(puntos) {
    const ctx = document.getElementById('flavorRadar').getContext('2d');
    document.getElementById('radar-container').classList.remove('hidden');

    if (flavorChart) { flavorChart.destroy(); }

    flavorChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Acidez', 'Cuerpo', 'Dulzor', 'Amargor', 'Balance'],
            datasets: [{
                data: [puntos.acidez, puntos.cuerpo, puntos.dulzor, puntos.amargor, puntos.balance],
                backgroundColor: 'rgba(212, 163, 115, 0.2)',
                borderColor: '#d4a373',
                borderWidth: 2,
                pointBackgroundColor: '#faedcd'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#fefae0', font: { size: 10 } },
                    ticks: { display: false }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// Iniciar vista al cargar
document.addEventListener('DOMContentLoaded', actualizarVistaHistorial);