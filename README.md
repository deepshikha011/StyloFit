# StyloFit - AI-Powered Outfit Recommendation System

StyloFit is a comprehensive outfit recommendation platform that uses artificial intelligence to analyze clothing items and provide personalized style suggestions based on weather, occasion, and individual preferences.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │ Spring Boot API │    │  Python AI      │
│   (Port 3000)    │◄──►│   (Port 8080)   │◄──►│  (Port 5000)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MySQL DB      │
                       │   (Port 3306)   │
                       └─────────────────┘
```

## 🚀 Features

### Core Functionality
- **User Management**: Registration, profile management, face shape analysis
- **Digital Wardrobe**: Upload and manage clothing items with AI analysis
- **Smart Recommendations**: Weather and occasion-based outfit suggestions
- **AI Analysis**: Automatic clothing type, color, and material detection

### AI Capabilities
- **Computer Vision**: MobileNet for clothing classification
- **Color Detection**: Advanced HSV-based color analysis
- **Face Analysis**: MediaPipe for face shape and skin tone detection
- **Style Matching**: Intelligent outfit coordination algorithms

### Weather Integration
- **Real-time Weather**: OpenWeather API integration
- **Climate-based Suggestions**: Temperature and condition-aware recommendations
- **Seasonal Adaptability**: Smart seasonal clothing suggestions

## 📋 Prerequisites

- **Java 17+** with Maven 3.6+
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **MySQL 8.0+**
- **OpenWeather API Key**

## 🛠️ Installation & Setup

### 1. Database Setup
```sql
CREATE DATABASE stylofit_db;
CREATE USER 'stylofit_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON stylofit_db.* TO 'stylofit_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup (Spring Boot)
```bash
cd backend
# Update application.properties with your database credentials
mvn clean install
mvn spring-boot:run
```

### 3. AI Service Setup (Python)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### 4. Frontend Setup (React)
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuration

### Backend Configuration (`application.properties`)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/stylofit_db
spring.datasource.username=stylofit_user
spring.datasource.password=your_password

# Weather API
weather.api.key=your_openweather_api_key

# AI Service
ai.service.url=http://localhost:5000
```

### Environment Variables
```bash
# Optional: Set environment variables
export OPENWEATHER_API_KEY=your_api_key
export MYSQL_PASSWORD=your_db_password
```

## 📱 API Documentation

### User Endpoints
- `POST /api/users/register` - Register new user
- `GET /api/users/{userId}` - Get user details
- `PUT /api/users/{userId}/profile` - Update user profile
- `POST /api/users/{userId}/analyze-face` - Analyze face features

### Wardrobe Endpoints
- `POST /api/wardrobe/upload` - Upload clothing item with AI analysis
- `GET /api/wardrobe/user/{userId}` - Get user's wardrobe
- `GET /api/wardrobe/user/{userId}/filter` - Get filtered wardrobe items
- `DELETE /api/wardrobe/{itemId}` - Delete clothing item

### Recommendation Endpoints
- `POST /api/recommendations/generate` - Generate outfit recommendation
- `GET /api/recommendations/user/{userId}/history` - Get recommendation history
- `POST /api/recommendations/{id}/feedback` - Provide feedback

### AI Service Endpoints
- `POST /analyze-clothing` - Analyze clothing from image URL
- `POST /analyze-clothing-upload` - Analyze uploaded clothing image
- `POST /analyze-face` - Analyze face features

## 🎯 Usage Flow

1. **Registration**: User creates account with basic information
2. **Wardrobe Building**: Upload clothing photos for AI analysis
3. **Profile Enhancement**: Optional face analysis for personalized recommendations
4. **Daily Recommendations**: Get outfit suggestions based on weather and occasion
5. **Feedback Loop**: Rate recommendations to improve future suggestions

## 🧠 AI Models & Technologies

### Computer Vision
- **MobileNetV2**: Pre-trained model for clothing classification
- **OpenCV**: Image processing and color analysis
- **MediaPipe**: Face mesh detection and analysis

### Backend Technologies
- **Spring Boot 3.2**: REST API framework
- **Spring Data JPA**: Database abstraction
- **MySQL**: Relational database
- **Maven**: Dependency management

### Frontend Technologies
- **React 18**: User interface framework
- **Material-UI**: Component library
- **Axios**: HTTP client
- **React Router**: Navigation

### AI Service Technologies
- **FastAPI**: Python web framework
- **TensorFlow**: Machine learning framework
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

## 📊 Database Schema

### Key Entities
- **Users**: User profiles and preferences
- **ClothingItems**: Wardrobe items with AI analysis results
- **OutfitRecommendations**: Generated recommendations with feedback

### Relationships
- User → ClothingItems (One-to-Many)
- User → OutfitRecommendations (One-to-Many)
- OutfitRecommendations → ClothingItems (Many-to-Many)

## 🔮 Future Enhancements

### Phase 2 Features
- **Social Integration**: Share outfits and get community feedback
- **Shopping Integration**: Purchase recommendations for missing items
- **Style Trends**: AI-powered trend analysis and suggestions
- **Mobile App**: Native iOS and Android applications

### Advanced AI Features
- **Style Transfer**: Generate new outfit combinations
- **Seasonal Predictions**: Anticipate style preferences
- **Body Type Analysis**: Personalized fit recommendations
- **Occasion Detection**: Automatic event-based suggestions

## 🤝 Development Team Structure

### Recommended Team Roles
- **Backend Developer**: Spring Boot, MySQL, API design
- **AI/ML Engineer**: Python, TensorFlow, computer vision
- **Frontend Developer**: React, UI/UX, responsive design
- **DevOps Engineer**: Deployment, monitoring, scaling

## 📈 Performance Considerations

### Optimization Strategies
- **Image Compression**: Optimize uploaded images for faster processing
- **Caching**: Redis for frequently accessed recommendations
- **Database Indexing**: Optimize queries for large wardrobes
- **CDN Integration**: Fast image delivery via Cloudinary

## 🔒 Security Features

- **Input Validation**: Comprehensive data validation
- **File Upload Security**: Image type and size restrictions
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Data Privacy**: Secure handling of personal information

## 📞 Support & Contributing

### Getting Help
- Check the documentation and API endpoints
- Review common issues in the troubleshooting section
- Create GitHub issues for bugs or feature requests

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**StyloFit** - Making fashion choices smarter, one outfit at a time! ✨