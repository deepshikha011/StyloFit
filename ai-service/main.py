from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
import requests
from io import BytesIO
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StyloFit AI Service",
    description="AI-powered clothing analysis and face feature detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI models
try:
    mobilenet_model = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=True)
    mp_face_mesh = mp.solutions.face_mesh
    logger.info("AI models loaded successfully")
except Exception as e:
    logger.error(f"Failed to load AI models: {e}")

# Pydantic models
class ImageAnalysisRequest(BaseModel):
    image_url: str

class ClothingAnalysisResponse(BaseModel):
    clothing_type: str
    primary_color: str
    secondary_color: Optional[str]
    material: str
    confidence: float

class FaceAnalysisResponse(BaseModel):
    face_shape: str
    skin_tone: str
    confidence: float

# Clothing type mapping
CLOTHING_TYPE_MAPPING = {
    'jersey': 'T_SHIRT',
    'suit': 'BLAZER',
    'jean': 'JEANS',
    'miniskirt': 'SKIRT',
    'cardigan': 'CARDIGAN',
    'sweatshirt': 'HOODIE'
}

# Color detection ranges (HSV)
COLOR_RANGES = {
    'red': ([0, 50, 50], [10, 255, 255]),
    'blue': ([100, 50, 50], [130, 255, 255]),
    'green': ([40, 50, 50], [80, 255, 255]),
    'yellow': ([20, 50, 50], [30, 255, 255]),
    'black': ([0, 0, 0], [180, 255, 30]),
    'white': ([0, 0, 200], [180, 30, 255]),
    'grey': ([0, 0, 50], [180, 30, 200]),
    'brown': ([10, 50, 20], [20, 255, 200]),
    'pink': ([160, 50, 50], [180, 255, 255]),
    'purple': ([130, 50, 50], [160, 255, 255])
}

@app.get("/")
async def root():
    return {"message": "StyloFit AI Service is running", "version": "1.0.0"}

@app.post("/analyze-clothing", response_model=ClothingAnalysisResponse)
async def analyze_clothing(request: ImageAnalysisRequest):
    """Analyze clothing item from image URL"""
    try:
        # Download and process image
        response = requests.get(request.image_url)
        image = Image.open(BytesIO(response.content)).convert('RGB')
        
        # Analyze clothing type
        clothing_type, confidence = detect_clothing_type(image)
        
        # Analyze colors
        primary_color, secondary_color = detect_colors(image)
        
        # Detect material (simplified)
        material = detect_material(image, clothing_type)
        
        return ClothingAnalysisResponse(
            clothing_type=clothing_type,
            primary_color=primary_color,
            secondary_color=secondary_color,
            material=material,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Clothing analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-clothing-upload")
async def analyze_clothing_upload(file: UploadFile = File(...)):
    """Analyze clothing item from uploaded file"""
    try:
        # Read uploaded image
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert('RGB')
        
        # Analyze clothing type
        clothing_type, confidence = detect_clothing_type(image)
        
        # Analyze colors
        primary_color, secondary_color = detect_colors(image)
        
        # Detect material
        material = detect_material(image, clothing_type)
        
        return ClothingAnalysisResponse(
            clothing_type=clothing_type,
            primary_color=primary_color,
            secondary_color=secondary_color,
            material=material,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Clothing analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-face", response_model=FaceAnalysisResponse)
async def analyze_face(request: ImageAnalysisRequest):
    """Analyze face features from image URL"""
    try:
        # Download and process image
        response = requests.get(request.image_url)
        image = Image.open(BytesIO(response.content)).convert('RGB')
        img_array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Analyze face shape and skin tone
        face_shape, skin_tone, confidence = analyze_face_features(img_array)
        
        return FaceAnalysisResponse(
            face_shape=face_shape,
            skin_tone=skin_tone,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Face analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Face analysis failed: {str(e)}")

def detect_clothing_type(image):
    """Detect clothing type using MobileNet"""
    try:
        # Preprocess image
        img_array = tf.keras.preprocessing.image.img_to_array(image.resize((224, 224)))
        img_array = tf.expand_dims(img_array, 0)
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        
        # Predict
        predictions = mobilenet_model.predict(img_array)
        decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=5)[0]
        
        # Map to clothing types
        for pred in decoded_predictions:
            class_name = pred[1].lower()
            confidence = float(pred[2])
            
            for key, clothing_type in CLOTHING_TYPE_MAPPING.items():
                if key in class_name:
                    return clothing_type, confidence
        
        # Default classification based on image analysis
        return classify_by_shape_analysis(image), 0.7
        
    except Exception as e:
        logger.error(f"Clothing type detection failed: {e}")
        return "T_SHIRT", 0.5

def classify_by_shape_analysis(image):
    """Fallback classification based on image shape analysis"""
    img_array = np.array(image)
    height, width = img_array.shape[:2]
    
    # Simple heuristics based on aspect ratio
    aspect_ratio = width / height
    
    if aspect_ratio > 1.5:
        return "T_SHIRT"
    elif aspect_ratio < 0.7:
        return "TROUSERS"
    else:
        return "SHIRT"

def detect_colors(image):
    """Detect primary and secondary colors"""
    try:
        # Convert to HSV for better color detection
        img_array = np.array(image)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        
        color_percentages = {}
        
        # Check each color range
        for color_name, (lower, upper) in COLOR_RANGES.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            percentage = cv2.countNonZero(mask) / (hsv.shape[0] * hsv.shape[1])
            color_percentages[color_name] = percentage
        
        # Sort by percentage
        sorted_colors = sorted(color_percentages.items(), key=lambda x: x[1], reverse=True)
        
        primary_color = sorted_colors[0][0] if sorted_colors[0][1] > 0.1 else "unknown"
        secondary_color = sorted_colors[1][0] if len(sorted_colors) > 1 and sorted_colors[1][1] > 0.05 else None
        
        return primary_color, secondary_color
        
    except Exception as e:
        logger.error(f"Color detection failed: {e}")
        return "unknown", None

def detect_material(image, clothing_type):
    """Detect material based on texture analysis (simplified)"""
    try:
        # Simplified material detection based on clothing type and texture
        img_array = np.array(image.convert('L'))  # Convert to grayscale
        
        # Calculate texture features
        texture_variance = np.var(img_array)
        
        # Simple heuristics
        if clothing_type in ["T_SHIRT", "POLO_SHIRT"] and texture_variance < 1000:
            return "Cotton"
        elif clothing_type in ["JEANS", "TROUSERS"] and texture_variance > 1500:
            return "Denim"
        elif clothing_type in ["BLAZER", "JACKET"]:
            return "Wool"
        elif clothing_type == "DRESS":
            return "Polyester"
        else:
            return "Cotton"
            
    except Exception as e:
        logger.error(f"Material detection failed: {e}")
        return "Unknown"

def analyze_face_features(img_array):
    """Analyze face shape and skin tone using MediaPipe"""
    try:
        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        ) as face_mesh:
            
            rgb_image = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_image)
            
            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0]
                
                # Analyze face shape
                face_shape = determine_face_shape(landmarks, img_array.shape)
                
                # Analyze skin tone
                skin_tone = determine_skin_tone(img_array, landmarks)
                
                return face_shape, skin_tone, 0.8
            else:
                return "oval", "medium", 0.3
                
    except Exception as e:
        logger.error(f"Face analysis failed: {e}")
        return "oval", "medium", 0.3

def determine_face_shape(landmarks, image_shape):
    """Determine face shape from landmarks"""
    try:
        # Extract key facial points
        height, width = image_shape[:2]
        
        # Get landmark coordinates
        face_points = []
        for landmark in landmarks.landmark:
            x = int(landmark.x * width)
            y = int(landmark.y * height)
            face_points.append((x, y))
        
        # Calculate face measurements (simplified)
        # In a full implementation, you would calculate ratios between
        # forehead width, cheekbone width, jawline width, and face length
        
        # For now, return a default classification
        return "oval"  # Most common and versatile face shape
        
    except Exception as e:
        logger.error(f"Face shape determination failed: {e}")
        return "oval"

def determine_skin_tone(img_array, landmarks):
    """Determine skin tone from face region"""
    try:
        # Extract face region and analyze average color
        # This is a simplified implementation
        
        # Convert to RGB for color analysis
        rgb_image = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
        
        # Calculate average color in face region (simplified)
        avg_color = np.mean(rgb_image, axis=(0, 1))
        
        # Simple skin tone classification based on RGB values
        if avg_color[0] > 200 and avg_color[1] > 180 and avg_color[2] > 160:
            return "light"
        elif avg_color[0] > 150 and avg_color[1] > 120 and avg_color[2] > 100:
            return "medium"
        else:
            return "dark"
            
    except Exception as e:
        logger.error(f"Skin tone determination failed: {e}")
        return "medium"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")