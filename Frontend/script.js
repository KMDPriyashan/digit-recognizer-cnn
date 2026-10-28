const API_URL = 'http://127.0.0.1:5000';

const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearBtn');
const predictButton = document.getElementById('predictBtn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hasDrawing = false;

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasDrawing = false;
}

clearCanvas();
ctx.strokeStyle = '#111111';
ctx.lineWidth = 20;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX - rect.left) * canvas.width / rect.width;
    lastY = (e.clientY - rect.top) * canvas.height / rect.height;
    hasDrawing = true;
    canvas.setPointerCapture(e.pointerId);

    ctx.beginPath();
    ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
});

function finishDrawing(e) {
    isDrawing = false;
    if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
    }
}

canvas.addEventListener('pointerup', finishDrawing);
canvas.addEventListener('pointercancel', finishDrawing);

clearButton.addEventListener('click', () => {
    clearCanvas();
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
});

predictButton.addEventListener('click', async () => {
    if (!hasDrawing) {
        showError('Please draw a digit before predicting.');
        return;
    }

    predictButton.disabled = true;
    predictButton.textContent = 'Predicting...';
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try{
        const dataURL = canvas.toDataURL('image/png');
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: dataURL })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Prediction failed');
        }

        const data = await response.json();
        showResult(data);

    }catch (err) {
        showError(err.message || 'Cannot connect to server. Is backend running?');
    }finally {
        predictButton.disabled = false;
        predictButton.textContent = 'Predict';
    }
});

function showResult(data) {
    document.getElementById('predictedDigit').textContent = data.digit;
    document.getElementById('confidence').textContent = `Confidence: ${data.confidence}%`;

    const top3Html = data.top3.map(item => 
        `<span>${item.digit}: ${item.confidence}%</span>`
    ).join('');
    document.getElementById('top3').innerHTML = top3Html;
    resultDiv.classList.remove('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}