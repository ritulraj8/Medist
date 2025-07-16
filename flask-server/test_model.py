import torch
import torchvision.transforms as transforms
from PIL import Image
import os
import sys
import argparse

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

def load_model(model_path):
    try:
        model = torch.load(model_path, map_location=torch.device('cpu'))
        model.eval()
        print(f"✅ Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

def preprocess_image(image_path):
    try:
        # Open and preprocess image
        image = Image.open(image_path).convert('RGB')
        
        # Define transformations
        transform = transforms.Compose([
            transforms.Resize((224, 224)),  # Resize to model input size
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Apply transformations
        image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
        print(f"✅ Image preprocessed successfully: {image_path}")
        return image_tensor
    except Exception as e:
        print(f"❌ Error preprocessing image: {e}")
        return None

def predict(model, image_tensor):
    try:
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
            
            print("\n===== PREDICTION RESULTS =====")
            print(f"Category: {category}")
            print(f"Prediction: {label}")
            print(f"Prediction Index: {prediction_idx}")
            
            # Show confidence scores
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
            print("\nConfidence Scores:")
            for idx, prob in enumerate(probabilities):
                if idx in all_labels:
                    print(f"  {all_labels[idx]}: {prob.item()*100:.2f}%")
            
            return {
                'prediction': label,
                'category': category,
                'prediction_idx': prediction_idx
            }
        else:
            print(f"❌ Unknown prediction category: {prediction_idx}")
            return None
    except Exception as e:
        print(f"❌ Error making prediction: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Test PyTorch model for medical image analysis')
    parser.add_argument('--image', required=True, help='Path to the image file')
    parser.add_argument('--model', default='model.pth', help='Path to the model file (default: model.pth)')
    
    args = parser.parse_args()
    
    # Check if model file exists
    if not os.path.exists(args.model):
        print(f"❌ Model file not found: {args.model}")
        sys.exit(1)
    
    # Check if image file exists
    if not os.path.exists(args.image):
        print(f"❌ Image file not found: {args.image}")
        sys.exit(1)
    
    # Load model
    model = load_model(args.model)
    if model is None:
        sys.exit(1)
    
    # Preprocess image
    image_tensor = preprocess_image(args.image)
    if image_tensor is None:
        sys.exit(1)
    
    # Make prediction
    result = predict(model, image_tensor)
    if result is None:
        sys.exit(1)
    
    print("\n✅ Test completed successfully!")

if __name__ == "__main__":
    main() 