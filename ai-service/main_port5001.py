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

@app.get("/")
async def root():
    return {"message": "StyloFit AI Service is running", "status": "healthy", "port": 5001}

@app.post("/analyze-clothing")
async def analyze_clothing(request: ImageAnalysisRequest):
    return {
        "clothing_type": "T_SHIRT",
        "primary_color": "blue",
        "secondary_color": "white",
        "material": "Cotton",
        "confidence": 0.85
    }

@app.post("/analyze-clothing-upload")
async def analyze_clothing_upload(file: UploadFile = File(...)):
    return {
        "clothing_type": "SHIRT",
        "primary_color": "blue",
        "secondary_color": None,
        "material": "Cotton",
        "confidence": 0.85
    }

@app.post("/analyze-face")
async def analyze_face(request: ImageAnalysisRequest):
    return {
        "face_shape": "oval",
        "skin_tone": "medium",
        "confidence": 0.8
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)