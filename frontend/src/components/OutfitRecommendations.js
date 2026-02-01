import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Rating,
  Chip
} from '@mui/material';
import { Refresh, ThumbUp } from '@mui/icons-material';
import { recommendationsAPI } from '../services/api';

const OutfitRecommendations = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [generateData, setGenerateData] = useState({ occasion: '', location: '' });
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationsAPI.getRecommendationHistory(user.userId);
      setRecommendations(response.data);
    } catch (error) {
      setError('Failed to load recommendations');
    }
  };

  const handleGenerate = async () => {
    if (!generateData.occasion) return;

    setLoading(true);
    setError('');
    try {
      const response = await recommendationsAPI.generateRecommendation(
        user.userId,
        generateData.occasion,
        generateData.location
      );
      setRecommendations([response.data, ...recommendations]);
      setGenerateDialog(false);
      setGenerateData({ occasion: '', location: '' });
    } catch (error) {
      setError('Failed to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!selectedRecommendation || feedbackRating === 0) return;

    try {
      await recommendationsAPI.provideFeedback(selectedRecommendation.recommendationId, feedbackRating);
      setFeedbackDialog(false);
      setSelectedRecommendation(null);
      setFeedbackRating(0);
      loadRecommendations();
    } catch (error) {
      setError('Failed to submit feedback');
    }
  };

  const occasions = [
    'CASUAL', 'BUSINESS', 'FORMAL', 'PARTY', 'DATE', 'SPORTS', 'BEACH'
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Outfit Recommendations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => setGenerateDialog(true)}
        >
          Get New Recommendation
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {recommendations.map((rec) => (
          <Grid item xs={12} md={6} key={rec.recommendationId}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {rec.occasionRequested} Outfit
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Weather: {rec.weatherCondition} ({rec.temperature}°C)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reason: {rec.styleReason}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Items:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {rec.recommendedItems?.map((item) => (
                      <Chip
                        key={item.itemId}
                        label={item.itemName}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<ThumbUp />}
                  onClick={() => {
                    setSelectedRecommendation(rec);
                    setFeedbackDialog(true);
                  }}
                >
                  Rate
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {recommendations.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No recommendations yet. Generate your first outfit suggestion!
          </Typography>
        </Box>
      )}

      {/* Generate Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Get Outfit Recommendation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Occasion</InputLabel>
            <Select
              value={generateData.occasion}
              onChange={(e) => setGenerateData({ ...generateData, occasion: e.target.value })}
            >
              {occasions.map((occasion) => (
                <MenuItem key={occasion} value={occasion}>
                  {occasion.charAt(0) + occasion.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Location (optional)"
            value={generateData.location}
            onChange={(e) => setGenerateData({ ...generateData, location: e.target.value })}
            margin="normal"
            placeholder="e.g., Delhi, Mumbai"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={loading || !generateData.occasion}
          >
            {loading ? <CircularProgress size={20} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate This Recommendation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            How would you rate this outfit recommendation?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Rating
              size="large"
              value={feedbackRating}
              onChange={(event, newValue) => {
                setFeedbackRating(newValue);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button
            onClick={handleFeedback}
            variant="contained"
            disabled={feedbackRating === 0}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OutfitRecommendations;
