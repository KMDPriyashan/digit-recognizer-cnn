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

