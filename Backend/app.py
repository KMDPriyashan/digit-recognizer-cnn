from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps
import base64
import io
import cv2

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model('digit_model.h5')
print("Model loaded successfully.")

def preprocess_image(data_url):
    header, encoded = data_url.split(",", 1)
    img_bytes = base64.b64decode(encoded)
    img = Image.open(io.BytesIO(img_bytes))
    
    if img.mode in ('RGBA', 'LA'):  # Convert to grayscale
        background = Image.new('RGBA', img.size, (255, 255, 255, 255))
        img = Image.alpha_composite(background, img.convert('RGBA'))

    img = img.convert('L')  # Convert to grayscale
    arr = np.array(img)

    _, arr = cv2.threshold(arr, 127, 255, cv2.THRESH_BINARY_INV)

    coords = cv2.findNonZero(arr)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        arr = arr[y:y+h, x:x+w]

    