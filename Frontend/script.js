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

//canvas setup

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'white';
ctx.lineWidth = 20;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

//drowing logic
canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
});

canvas.addEventListener('pointerup', () => {
    isDrawing = false;
    canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener('pointercancel', () => {
    isDrawing = false;
    canvas.releasePointerCapture(e.pointerId);
});

//clear buutten
clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
});

//predict button
predictBtn.addEventListener('click', async () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
    const pixels = imageData.data;
    let hashDrawing = false;

    for (let i = 0; i < pixels.length; i += 160) {
        if(pixels[i] < 250 || pixels[i + 1] < 250 || pixels[i + 2] < 250) {
            hashDrawing = true;
            break;
        }
    }

    if (!hashDrawing) {
        showError('Please draw a digit before predicting.');
        return;
    }

    //loading state
    predictBtn.disabled = true;
    predictBtn.textContent = 'Predicting...';
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
            const err = await response.json();
            throw new Error(err.error || 'Prediction failed');
        }

        const data = await response.json();
        showResult(data);

    }catch (err) {
        showError(err.message || 'Cannot connect to server. Is backend running?');
    }finally {
        predictBtn.disabled = false;
        predictBtn.textContent = 'Predict';
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