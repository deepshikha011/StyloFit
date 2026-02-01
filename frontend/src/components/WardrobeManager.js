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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import { Add, Delete, FilterList } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { wardrobeAPI } from '../services/api';

const WardrobeManager = ({ user }) => {
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({ occasionType: '', weatherSuitability: '' });
  const [uploadData, setUploadData] = useState({ itemName: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWardrobe();
  }, [user]);

  const loadWardrobe = async () => {
    try {
      const response = await wardrobeAPI.getUserWardrobe(user.userId);
      setWardrobe(response.data);
    } catch (error) {
      setError('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.itemName) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('userId', user.userId);
      formData.append('itemName', uploadData.itemName);

      await wardrobeAPI.uploadClothing(formData);
      setUploadDialog(false);
      setUploadData({ itemName: '', file: null });
      loadWardrobe();
    } catch (error) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await wardrobeAPI.deleteClothingItem(itemId);
      loadWardrobe();
    } catch (error) {
      setError('Delete failed');
    }
  };

  const handleFilter = async () => {
    try {
      const params = {};
      if (filters.occasionType) params.occasionType = filters.occasionType;
      if (filters.weatherSuitability) params.weatherSuitability = filters.weatherSuitability;

      const response = await wardrobeAPI.getFilteredWardrobe(user.userId, params);
      setWardrobe(response.data);
      setFilterDialog(false);
    } catch (error) {
      setError('Filter failed');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setUploadData({ ...uploadData, file: acceptedFiles[0] });
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Wardrobe
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterDialog(true)}
            sx={{ mr: 2 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setUploadDialog(true)}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {wardrobe.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.itemId}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={item.imageUrl}
                alt={item.itemName}
              />
              <CardContent>
                <Typography variant="h6">{item.itemName}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip label={item.clothingType} size="small" sx={{ mr: 1 }} />
                  <Chip label={item.occasionType} size="small" sx={{ mr: 1 }} />
                  <Chip label={item.weatherSuitability} size="small" />
                </Box>
                {item.primaryColor && (
                  <Typography variant="body2" color="text.secondary">
                    Color: {item.primaryColor}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(item.itemId)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Clothing Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Name"
            value={uploadData.itemName}
            onChange={(e) => setUploadData({ ...uploadData, itemName: e.target.value })}
            margin="normal"
          />
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              mt: 2,
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            {uploadData.file ? (
              <Typography>{uploadData.file.name}</Typography>
            ) : (
              <Typography>Drop an image here or click to select</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || !uploadData.file || !uploadData.itemName}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialog} onClose={() => setFilterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Wardrobe</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Occasion Type</InputLabel>
            <Select
              value={filters.occasionType}
              onChange={(e) => setFilters({ ...filters, occasionType: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CASUAL">Casual</MenuItem>
              <MenuItem value="BUSINESS">Business</MenuItem>
              <MenuItem value="FORMAL">Formal</MenuItem>
              <MenuItem value="PARTY">Party</MenuItem>
              <MenuItem value="SPORTS">Sports</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Weather Suitability</InputLabel>
            <Select
              value={filters.weatherSuitability}
              onChange={(e) => setFilters({ ...filters, weatherSuitability: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="HOT">Hot</MenuItem>
              <MenuItem value="WARM">Warm</MenuItem>
              <MenuItem value="COOL">Cool</MenuItem>
              <MenuItem value="COLD">Cold</MenuItem>
              <MenuItem value="ALL_WEATHER">All Weather</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialog(false)}>Cancel</Button>
          <Button onClick={handleFilter} variant="contained">Apply Filter</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WardrobeManager;
