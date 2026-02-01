import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Avatar,
  Chip
} from '@mui/material';
import {
  Checkroom as WardrobeIcon,
  AutoAwesome as RecommendationsIcon,
  TrendingUp as TrendingIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { wardrobeAPI, recommendationsAPI } from '../services/api';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    recentRecommendations: 0,
    favoriteStyle: 'Casual'
  });

  useEffect(() => {
    loadDashboardData();
  }, [user.userId]);

  const loadDashboardData = async () => {
    try {
      const wardrobeResponse = await wardrobeAPI.getUserWardrobe(user.userId);
      const recommendationsResponse = await recommendationsAPI.getRecommendationHistory(user.userId);
      
      setStats({
        totalItems: wardrobeResponse.data.length,
        recentRecommendations: recommendationsResponse.data.length,
        favoriteStyle: user.preferredStyle || 'Casual'
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Upload New Item',
      description: 'Add clothes to your digital wardrobe',
      icon: <WardrobeIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/wardrobe'),
      color: 'primary'
    },
    {
      title: 'Get Recommendations',
      description: 'AI-powered outfit suggestions',
      icon: <RecommendationsIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/recommendations'),
      color: 'secondary'
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {user.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {user.fullName.split(' ')[0]}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Ready to look amazing today?
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WardrobeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="primary">
                {stats.totalItems}
              </Typography>
              <Typography color="text.secondary">
                Wardrobe Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="secondary">
                {stats.recentRecommendations}
              </Typography>
              <Typography color="text.secondary">
                Recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FavoriteIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
              <Chip 
                label={stats.favoriteStyle} 
                color="error" 
                variant="outlined"
                sx={{ fontSize: '1.1rem', py: 2 }}
              />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Preferred Style
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {action.description}
                </Typography>
                <Button 
                  variant="contained" 
                  color={action.color}
                  size="large"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          How StyloFit Works
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                1. Upload
              </Typography>
              <Typography variant="body2">
                Add photos of your clothes to build your digital wardrobe
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                2. AI Analysis
              </Typography>
              <Typography variant="body2">
                Our AI identifies clothing type, colors, and materials automatically
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                3. Smart Matching
              </Typography>
              <Typography variant="body2">
                Get recommendations based on weather, occasion, and your style
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                4. Look Amazing
              </Typography>
              <Typography variant="body2">
                Step out with confidence in perfectly coordinated outfits
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;