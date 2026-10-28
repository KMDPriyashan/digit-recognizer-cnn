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

