# Medical Image Analysis Flask Server

This Flask server provides an API endpoint for analyzing medical images using a PyTorch model. It can identify various medical conditions from MRI scans and retinal images.

## Supported Conditions

1. **Alzheimer's Disease** - Classifies brain MRI scans into:
   - NonDemented
   - VeryMildDemented
   - MildDemented
   - ModerateDemented

2. **Brain Tumor** - Detects the presence of brain tumors in MRI scans:
   - no (no tumor detected)
   - yes (tumor detected)

3. **Diabetic Retinopathy** - Classifies retinal images into:
   - Healthy (No DR)
   - Mild DR
   - Moderate DR
   - Severe DR
   - Proliferate DR

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Place your PyTorch model:**
   - Save your trained PyTorch model as `model.pth` in the flask-server directory
   - The model should be a classification model that outputs 11 classes (as defined in the labels)

3. **Test your model:**
   ```bash
   python test_model.py --image path/to/test/image.jpg
   ```
   This will verify that your model loads correctly and can make predictions.

4. **Run the server:**
   ```bash
   python app.py
   ```

   The server will run on `http://localhost:5000`

## API Endpoint

### POST /analyze

Analyzes a medical image and returns the prediction.

**Request:**
- Form data with an 'image' field containing the image file

**Response:**
```json
{
  "prediction": "NonDemented",
  "category": "Alzheimer's Disease",
  "prediction_idx": 0
}
```

## Testing Your Model

The `test_model.py` script allows you to verify that your model works correctly before starting the server:

```bash
python test_model.py --image path/to/test/image.jpg --model path/to/model.pth
```

Arguments:
- `--image`: Path to the test image (required)
- `--model`: Path to the model file (default: model.pth)

The script will:
1. Load the model
2. Preprocess the image
3. Run inference
4. Display the prediction results and confidence scores

## Integration with Next.js

This Flask server is designed to work with the Next.js frontend. The Next.js app sends images to this server for analysis, and then uses the Gemini API to provide detailed information about the detected condition.

## Notes

- The server uses CPU for inference by default. If you have a CUDA-compatible GPU, you can modify the code to use it for faster inference.
- The model expects images to be resized to 224x224 pixels and normalized according to ImageNet standards.
- Make sure the Flask server is running before using the image analysis feature in the Next.js app. 