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

