import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Grid
} from '@mui/material';
import { Save, PhotoCamera } from '@mui/icons-material';
import { userAPI } from '../services/api';

const UserProfile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    preferredStyle: user.preferredStyle || '',
    faceShape: user.faceShape || '',
    skinTone: user.skinTone || ''
  });
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await userAPI.updateProfile(user.userId, formData);
      setUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFaceAnalysis = async () => {
    // In a real app, this would upload an image
    // For demo purposes, we'll simulate it
    setAnalyzing(true);
    setError('');
    try {
      // Simulate face analysis with a dummy image URL
      const dummyImageUrl = 'https://example.com/face.jpg';
      const response = await userAPI.analyzeFace(user.userId, dummyImageUrl);
      setUser(response.data);
      setSuccess('Face analysis completed!');
    } catch (error) {
      setError('Face analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                src={user.imageUrl}
              >
                {user.fullName?.charAt(0)}
              </Avatar>
              <Typography variant="h6">{user.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gender: {user.gender}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Edit Profile
              </Typography>

              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Preferred Style"
                name="preferredStyle"
                value={formData.preferredStyle}
                onChange={handleChange}
                margin="normal"
                placeholder="e.g., Casual, Formal, Bohemian"
              />

              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Face Analysis Results
                </Typography>
                <TextField
                  fullWidth
                  label="Face Shape"
                  name="faceShape"
                  value={formData.faceShape}
                  onChange={handleChange}
                  margin="normal"
                  disabled
                  helperText="Analyzed from your photo"
                />
                <TextField
                  fullWidth
                  label="Skin Tone"
                  name="skinTone"
                  value={formData.skinTone}
                  onChange={handleChange}
                  margin="normal"
                  disabled
                  helperText="Analyzed from your photo"
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={handleFaceAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? <CircularProgress size={20} /> : 'Analyze Face'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;
