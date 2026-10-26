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

    arr = cv2.resize(arr, (28, 28), interpolation=cv2.INTER_AREA)
    blank = np.zeros((28, 28), dtype=np.uint8)

    x_offset = (28 - arr.shape[1]) // 2
    y_offset = (28 - arr.shape[0]) // 2

    blank[y_offset:y_offset+arr.shape[0], x_offset:x_offset+arr.shape[1]] = arr

    blank = blank.astype('float32') / 255.0
    blank = blank.reshape(1, 28, 28, 1)
    return blank

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "Digit Recognition API is running.",
        "Endpoints": {
            "POST /predict": "Send {'image': 'data:image/png;base64,...'} to get the predicted digit."
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"status": "error", "message": "No image provided."}), 400

        processed = preprocess_image(data['image'])
        prediction = model.predict(processed, verbose=0)
        predicted_digit = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0]) * 100)

        top3_idx = np.argsort(prediction[0])[-3:][::-1]
        top3 = [
            {"digit": int(i), "confidence": round(float(prediction[0][i]) * 100, 2)} 
            for i in top3_idx
        ]

        return jsonify({
            "digit": predicted_digit,
            "confidence": round(confidence, 2),
            "top3": top3
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)