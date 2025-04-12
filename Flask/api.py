from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
from src.main import (
    load_model,
    load_index_to_label_dict,
    predict,
    cal_classes_counts,
    image_annotation,
    save_image,
)

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the frontend

# Load the model and other resources
model = load_model()
class_list = load_index_to_label_dict()
uploaded_path = "uploaded_images/"
predicted_path = "predicted_images/"
detection_colors = [(10, 239, 8), (252, 10, 73)]
confidence_rate = 0.45

@app.route('/process-image', methods=['POST'])
def process_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save the uploaded image
    os.makedirs(uploaded_path, exist_ok=True)
    file_path = os.path.join(uploaded_path, file.filename)
    file.save(file_path)

    # Process the image
    frame = cv2.imread(file_path)
    prediction = predict(model, frame, confidence_rate)  # Pass the model here
    class_counts, slot_numbers = cal_classes_counts(len(prediction[0]), prediction, class_list)
    predicted_image = image_annotation(prediction, frame, class_list, detection_colors, slot_numbers)

    # Save the processed image
    save_image(predicted_image, file.filename, predicted_path)

    # Return the processed data
    return jsonify({
        'class_counts': class_counts,
        'slot_numbers': slot_numbers,
        'total_slots': len(prediction[0])
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)