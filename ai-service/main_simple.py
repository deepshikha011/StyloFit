from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
from PIL import Image
import requests
from io import BytesIO
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StyloFit AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageAnalysisRequest(BaseModel):
    image_url: str

class ClothingAnalysisResponse(BaseModel):
    clothing_type: str
    primary_color: str
    secondary_color: Optional[str]
    material: str
    confidence: float

COLOR_RANGES = {
    'red': ([0, 50, 50], [10, 255, 255]),
    'blue': ([100, 50, 50], [130, 255, 255]),
    'green': ([40, 50, 50], [80, 255, 255]),
    'black': ([0, 0, 0], [180, 255, 30]),
    'white': ([0, 0, 200], [180, 30, 255]),
    'grey': ([0, 0, 50], [180, 30, 200])
}

@app.get("/")
async def root():
    return {"message": "StyloFit AI Service is running", "status": "healthy"}

@app.post("/analyze-clothing", response_model=ClothingAnalysisResponse)
async def analyze_clothing(request: ImageAnalysisRequest):
    try:
        response = requests.get(request.image_url)
        image = Image.open(BytesIO(response.content)).convert('RGB')
        
        clothing_type = classify_clothing_simple(image)
        primary_color, secondary_color = detect_colors_simple(image)
        material = detect_material_simple(clothing_type)
        
        return ClothingAnalysisResponse(
            clothing_type=clothing_type,
            primary_color=primary_color,
            secondary_color=secondary_color,
            material=material,
            confidence=0.85
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-clothing-upload", response_model=ClothingAnalysisResponse)
async def analyze_clothing_upload(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert('RGB')
        
        clothing_type = classify_clothing_simple(image)
        primary_color, secondary_color = detect_colors_simple(image)
        material = detect_material_simple(clothing_type)
        
        return ClothingAnalysisResponse(
            clothing_type=clothing_type,
            primary_color=primary_color,
            secondary_color=secondary_color,
            material=material,
            confidence=0.85
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-face")
async def analyze_face(request: ImageAnalysisRequest):
    return {
        "face_shape": "oval",
        "skin_tone": "medium",
        "confidence": 0.8
    }

def classify_clothing_simple(image):
    img_array = np.array(image)
    height, width = img_array.shape[:2]
    aspect_ratio = width / height
    
    if aspect_ratio > 1.5:
        return "T_SHIRT"
    elif aspect_ratio < 0.7:
        return "TROUSERS"
    else:
        return "SHIRT"

def detect_colors_simple(image):
    try:
        img_array = np.array(image)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        
        color_percentages = {}
        for color_name, (lower, upper) in COLOR_RANGES.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            percentage = cv2.countNonZero(mask) / (hsv.shape[0] * hsv.shape[1])
            color_percentages[color_name] = percentage
        
        sorted_colors = sorted(color_percentages.items(), key=lambda x: x[1], reverse=True)
        primary_color = sorted_colors[0][0] if sorted_colors[0][1] > 0.1 else "blue"
        secondary_color = sorted_colors[1][0] if len(sorted_colors) > 1 and sorted_colors[1][1] > 0.05 else None
        
        return primary_color, secondary_color
    except:
        return "blue", None

def detect_material_simple(clothing_type):
    materials = {
        "T_SHIRT": "Cotton",
        "SHIRT": "Cotton",
        "TROUSERS": "Denim",
        "JEANS": "Denim",
        "DRESS": "Polyester",
        "BLAZER": "Wool"
    }
    return materials.get(clothing_type, "Cotton")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)