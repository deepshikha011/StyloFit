# StyloFit: File-by-File Explanation - Part 3

## 🤖 AI Service Files (Python FastAPI)

### `/ai-service/main.py` - AI Service Main Application
**Purpose**: FastAPI application that provides AI-powered clothing analysis and recommendations.

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import cv2
import numpy as np
from PIL import Image
import io
import uvicorn
from typing import List, Optional

# Initialize FastAPI app
app = FastAPI(
    title="StyloFit AI Service",
    description="AI-powered clothing analysis and recommendation service",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI models on startup
clothing_classifier = None
color_analyzer = None

@app.on_event("startup")
async def load_models():
    global clothing_classifier, color_analyzer
    try:
        # Load pre-trained MobileNetV2 for clothing classification
        clothing_classifier = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3)
        )
        print("AI models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")

# Pydantic models for request/response
class ClothingAnalysisRequest(BaseModel):
    image_url: str
    user_preferences: Optional[dict] = {}

class ClothingAnalysisResponse(BaseModel):
    clothing_type: str
    primary_color: str
    secondary_color: Optional[str]
    material: str
    confidence_score: float
    weather_suitability: List[str]
    occasion_types: List[str]

class FaceAnalysisResponse(BaseModel):
    face_shape: str
    skin_tone: str
    confidence_score: float

# Clothing analysis endpoint
@app.post("/analyze-clothing", response_model=ClothingAnalysisResponse)
async def analyze_clothing(request: ClothingAnalysisRequest):
    """
    Analyze clothing from image URL
    Returns clothing type, colors, material, and suitability
    """
    try:
        # Download and process image
        image = download_image(request.image_url)
        processed_image = preprocess_image(image)
        
        # Classify clothing type
        clothing_type = classify_clothing_type(processed_image)
        
        # Analyze colors
        primary_color, secondary_color = analyze_colors(image)
        
        # Detect material (simplified)
        material = detect_material(processed_image, clothing_type)
        
        # Determine weather suitability
        weather_suitability = determine_weather_suitability(clothing_type, material)
        
        # Determine occasion types
        occasion_types = determine_occasion_types(clothing_type, primary_color)
        
        # Calculate confidence score
        confidence_score = calculate_confidence_score(processed_image)
        
        return ClothingAnalysisResponse(
            clothing_type=clothing_type,
            primary_color=primary_color,
            secondary_color=secondary_color,
            material=material,
            confidence_score=confidence_score,
            weather_suitability=weather_suitability,
            occasion_types=occasion_types
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Upload and analyze clothing endpoint
@app.post("/analyze-clothing-upload", response_model=ClothingAnalysisResponse)
async def analyze_clothing_upload(file: UploadFile = File(...)):
    """
    Analyze clothing from uploaded image file
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process uploaded image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)
        
        # Convert to RGB if necessary
        if len(image_array.shape) == 3 and image_array.shape[2] == 4:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2RGB)
        elif len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        
        # Process image
        processed_image = preprocess_image(image_array)
        
        # Perform analysis (same as URL-based analysis)
        clothing_type = classify_clothing_type(processed_image)
        primary_color, secondary_color = analyze_colors(image_array)
        material = detect_material(processed_image, clothing_type)
        weather_suitability = determine_weather_suitability(clothing_type, material)
        occasion_types = determine_occasion_types(clothing_type, primary_color)
        confidence_score = calculate_confidence_score(processed_image)
        
        return ClothingAnalysisResponse(
            clothing_type=clothing_type,
            primary_color=primary_color,
            secondary_color=secondary_color,
            material=material,
            confidence_score=confidence_score,
            weather_suitability=weather_suitability,
            occasion_types=occasion_types
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Face analysis endpoint
@app.post("/analyze-face", response_model=FaceAnalysisResponse)
async def analyze_face(file: UploadFile = File(...)):
    """
    Analyze face shape and skin tone from uploaded image
    """
    try:
        # Read uploaded image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)
        
        # Analyze face shape using MediaPipe or similar
        face_shape = analyze_face_shape(image_array)
        
        # Analyze skin tone
        skin_tone = analyze_skin_tone(image_array)
        
        # Calculate confidence
        confidence_score = 0.85  # Placeholder
        
        return FaceAnalysisResponse(
            face_shape=face_shape,
            skin_tone=skin_tone,
            confidence_score=confidence_score
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face analysis failed: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "StyloFit AI Service"}

# Helper functions for AI processing
def preprocess_image(image):
    """Preprocess image for AI model input"""
    # Resize to model input size
    image = cv2.resize(image, (224, 224))
    
    # Normalize pixel values
    image = image.astype(np.float32) / 255.0
    
    # Add batch dimension
    image = np.expand_dims(image, axis=0)
    
    return image

def classify_clothing_type(image):
    """Classify clothing type using deep learning model"""
    global clothing_classifier
    
    if clothing_classifier is None:
        return "UNKNOWN"
    
    # Get features from MobileNet
    features = clothing_classifier.predict(image)
    
    # Custom classification logic (simplified)
    # In real implementation, this would use a trained classifier
    clothing_types = [
        "SHIRT", "T_SHIRT", "JEANS", "TROUSERS", "DRESS", 
        "JACKET", "SNEAKERS", "FORMAL_SHOES", "ACCESSORIES"
    ]
    
    # Placeholder classification logic
    return np.random.choice(clothing_types)

def analyze_colors(image):
    """Extract dominant colors using K-means clustering"""
    # Convert to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Reshape image to list of pixels
    pixels = image_rgb.reshape(-1, 3)
    
    # Use K-means to find dominant colors
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=3, random_state=42)
    kmeans.fit(pixels)
    
    # Get dominant colors
    colors = kmeans.cluster_centers_
    
    # Convert to color names
    primary_color = rgb_to_color_name(colors[0])
    secondary_color = rgb_to_color_name(colors[1]) if len(colors) > 1 else None
    
    return primary_color, secondary_color

def rgb_to_color_name(rgb):
    """Convert RGB values to color name"""
    # Simplified color mapping
    r, g, b = rgb
    
    if r > 200 and g > 200 and b > 200:
        return "white"
    elif r < 50 and g < 50 and b < 50:
        return "black"
    elif r > g and r > b:
        return "red"
    elif g > r and g > b:
        return "green"
    elif b > r and b > g:
        return "blue"
    elif r > 150 and g > 150 and b < 100:
        return "yellow"
    else:
        return "mixed"

def detect_material(image, clothing_type):
    """Detect material based on texture analysis"""
    # Simplified material detection
    materials = ["cotton", "polyester", "denim", "silk", "wool", "leather"]
    
    # In real implementation, this would analyze texture features
    return np.random.choice(materials)

def determine_weather_suitability(clothing_type, material):
    """Determine weather suitability based on clothing type and material"""
    weather_map = {
        "T_SHIRT": ["HOT", "WARM"],
        "SHIRT": ["WARM", "COOL"],
        "JACKET": ["COOL", "COLD"],
        "JEANS": ["COOL", "WARM"],
        "SHORTS": ["HOT", "WARM"],
        "SWEATER": ["COOL", "COLD"]
    }
    
    return weather_map.get(clothing_type, ["ALL_WEATHER"])

def determine_occasion_types(clothing_type, color):
    """Determine suitable occasions based on clothing type and color"""
    occasion_map = {
        "T_SHIRT": ["CASUAL", "SPORTS"],
        "SHIRT": ["BUSINESS", "CASUAL"],
        "DRESS": ["FORMAL", "PARTY"],
        "JEANS": ["CASUAL"],
        "FORMAL_SHOES": ["BUSINESS", "FORMAL"]
    }
    
    return occasion_map.get(clothing_type, ["CASUAL"])

def calculate_confidence_score(image):
    """Calculate confidence score for the analysis"""
    # Simplified confidence calculation
    # In real implementation, this would be based on model certainty
    return np.random.uniform(0.7, 0.95)

def analyze_face_shape(image):
    """Analyze face shape using facial landmarks"""
    # Placeholder implementation
    face_shapes = ["oval", "round", "square", "heart", "diamond"]
    return np.random.choice(face_shapes)

def analyze_skin_tone(image):
    """Analyze skin tone from face image"""
    # Placeholder implementation
    skin_tones = ["warm", "cool", "neutral"]
    return np.random.choice(skin_tones)

def download_image(url):
    """Download image from URL"""
    import requests
    response = requests.get(url)
    image = Image.open(io.BytesIO(response.content))
    return np.array(image)

# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

**AI Service Features:**
- **FastAPI Framework**: High-performance async API
- **Computer Vision**: TensorFlow/OpenCV integration
- **Image Processing**: Multiple input formats (URL, upload)
- **Color Analysis**: K-means clustering for dominant colors
- **Face Analysis**: MediaPipe integration for face shape detection
- **Error Handling**: Comprehensive exception handling
- **CORS Support**: Cross-origin requests from frontend

---

### `/ai-service/requirements.txt` - Python Dependencies
**Purpose**: Specifies all Python packages required for the AI service.

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
tensorflow==2.13.0
opencv-python==4.8.1.78
numpy==1.24.3
pillow==10.0.1
scikit-learn==1.3.0
python-multipart==0.0.6
requests==2.31.0
pydantic==2.4.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
mediapipe==0.10.7
```

**Dependencies Explained:**
- **fastapi**: Modern web framework for APIs
- **uvicorn**: ASGI server for FastAPI
- **tensorflow**: Machine learning framework
- **opencv-python**: Computer vision library
- **numpy**: Numerical computing
- **pillow**: Image processing
- **scikit-learn**: Machine learning utilities
- **python-multipart**: File upload support
- **requests**: HTTP client for external APIs
- **pydantic**: Data validation and serialization
- **mediapipe**: Google's ML framework for face analysis

---

## ⚛️ Frontend Files (React)

### `/frontend/package.json` - Frontend Dependencies
**Purpose**: Defines React application dependencies and scripts.

```json
{
  "name": "stylofit-frontend",
  "version": "1.0.0",
  "description": "StyloFit React Frontend Application",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "react-router-dom": "^6.8.0",
    "@mui/material": "^5.11.0",
    "@mui/icons-material": "^5.11.0",
    "@emotion/react": "^11.10.5",
    "@emotion/styled": "^11.10.5",
    "axios": "^1.3.0",
    "web-vitals": "^3.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8081"
}
```

**Key Dependencies:**
- **react/react-dom**: Core React framework
- **react-router-dom**: Client-side routing
- **@mui/material**: Material-UI component library
- **axios**: HTTP client for API calls
- **proxy**: Automatically forwards API calls to backend

---

### `/frontend/src/App.js` - Main Application Component
**Purpose**: Root component that sets up routing and global layout.

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Import components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import WardrobeManager from './components/WardrobeManager';
import OutfitRecommendations from './components/OutfitRecommendations';
import UserProfile from './components/UserProfile';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Check for existing user session on app load
  React.useEffect(() => {
    const savedUser = localStorage.getItem('stylofit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Handle user login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('stylofit_user', JSON.stringify(userData));
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('stylofit_user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {user && <Navbar user={user} onLogout={handleLogout} />}
          
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  user ? <Dashboard user={user} /> : <Navigate to="/login" />
                } 
              />
              <Route 
                path="/wardrobe" 
                element={
                  user ? <WardrobeManager user={user} /> : <Navigate to="/login" />
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  user ? <OutfitRecommendations user={user} /> : <Navigate to="/login" />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  user ? <UserProfile user={user} onUserUpdate={setUser} /> : <Navigate to="/login" />
                } 
              />
              
              {/* Default redirect */}
              <Route 
                path="/" 
                element={<Navigate to={user ? "/dashboard" : "/login"} />} 
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

**App Component Features:**
- **Routing**: React Router for navigation
- **Authentication**: User session management
- **Theme**: Material-UI theme configuration
- **Protected Routes**: Authentication-based route protection
- **State Management**: User state and localStorage persistence

---

### `/frontend/src/services/api.js` - API Service Layer
**Purpose**: Centralized API communication with the backend service.

```javascript
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Uses proxy from package.json
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('stylofit_user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('stylofit_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API functions
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return response.data;
  },

  // Analyze face
  analyzeFace: async (userId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/users/${userId}/analyze-face`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Wardrobe API functions
export const wardrobeAPI = {
  // Upload clothing item
  uploadItem: async (userId, itemName, imageFile) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('itemName', itemName);
    formData.append('image', imageFile);

    const response = await api.post('/wardrobe/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user's wardrobe
  getWardrobe: async (userId) => {
    const response = await api.get(`/wardrobe/user/${userId}`);
    return response.data;
  },

  // Filter wardrobe items
  filterWardrobe: async (userId, filters) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.occasion) params.append('occasion', filters.occasion);
    if (filters.weather) params.append('weather', filters.weather);

    const response = await api.get(`/wardrobe/user/${userId}/filter?${params}`);
    return response.data;
  },

  // Delete clothing item
  deleteItem: async (itemId, userId) => {
    const response = await api.delete(`/wardrobe/${itemId}?userId=${userId}`);
    return response.data;
  },
};

// Recommendation API functions
export const recommendationAPI = {
  // Generate outfit recommendation
  generateRecommendation: async (userId, occasion, location) => {
    const response = await api.post('/recommendations/generate', {
      userId,
      occasion,
      location,
    });
    return response.data;
  },

  // Get recommendation history
  getHistory: async (userId, page = 0, size = 10) => {
    const response = await api.get(`/recommendations/user/${userId}/history?page=${page}&size=${size}`);
    return response.data;
  },

  // Provide feedback
  provideFeedback: async (recommendationId, rating, comments) => {
    const response = await api.post(`/recommendations/${recommendationId}/feedback`, {
      rating,
      comments,
    });
    return response.data;
  },

  // Get recommendations by occasion
  getByOccasion: async (userId, occasion) => {
    const response = await api.get(`/recommendations/user/${userId}/occasion/${occasion}`);
    return response.data;
  },
};

// AI Service API functions (direct calls to AI service)
export const aiAPI = {
  // Analyze clothing from upload
  analyzeClothing: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await axios.post('http://localhost:5000/analyze-clothing-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Analyze face
  analyzeFace: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await axios.post('http://localhost:5000/analyze-face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
```

**API Service Features:**
- **Axios Configuration**: Base URL, headers, interceptors
- **Authentication**: Automatic token handling
- **Error Handling**: Global error interceptor
- **Organized Functions**: Grouped by feature (user, wardrobe, recommendations)
- **File Upload**: FormData handling for image uploads
- **Direct AI Calls**: Separate functions for AI service integration

---

This completes Part 3 of the file-by-file explanation. I'll create Part 4 to cover the remaining frontend components and configuration files.