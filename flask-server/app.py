from flask import Flask, request, jsonify
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define labels
alzheim_labels = {
    0: 'NonDemented',
    1: 'VeryMildDemented',
    2: 'MildDemented',
    3: 'ModerateDemented'
}

brain_labels = {
    4: 'no',
    5: 'yes'
}

dr_labels = {
    6: 'Healthy',            # No DR
    7: 'Mild DR',            # Mild NPDR
    8: 'Moderate DR',        # Moderate NPDR
    9: 'Severe DR',          # Severe NPDR
    10: 'Proliferate DR'     # Proliferative DR
}

# Combined labels dictionary
all_labels = {**alzheim_labels, **brain_labels, **dr_labels}

# Load model
model = None

def load_model():
    global model
    try:
        # Load the PyTorch model
        model_path = os.path.join(os.path.dirname(__file__), 'model.pth')
        model = torch.load(model_path, map_location=torch.device('cpu'))
        model.eval()
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Image preprocessing
def preprocess_image(image_bytes):
    # Open image from bytes
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Define transformations
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # Resize to model input size
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Apply transformations
    image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    return image_tensor

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    # Get image file
    image_file = request.files['image']
    image_bytes = image_file.read()
    
    # Ensure model is loaded
    if model is None:
        if not load_model():
            return jsonify({'error': 'Failed to load model'}), 500
    
    try:
        # Preprocess image
        image_tensor = preprocess_image(image_bytes)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)
            prediction_idx = predicted.item()
        
        # Get label
        if prediction_idx in all_labels:
            label = all_labels[prediction_idx]
            
            # Determine category
            category = ""
            if prediction_idx in alzheim_labels:
                category = "Alzheimer's Disease"
            elif prediction_idx in brain_labels:
                category = "Brain Tumor"
            elif prediction_idx in dr_labels:
                category = "Diabetic Retinopathy"
            
            return jsonify({
                'prediction': label,
                'category': category,
                'prediction_idx': prediction_idx
            })
        else:
            return jsonify({'error': 'Unknown prediction category'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

if __name__ == '__main__':
    load_model()
    app.run(debug=True, host='0.0.0.0', port=5000) 