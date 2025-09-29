# Marine Microscopy Backend

Node.js/Express backend API for the Embedded Intelligent Microscopy System for Marine Organisms.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
PORT=5000
CORS_ORIGINS=http://localhost:5173
ENABLE_DEMO_MODE=true
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Production

Start the production server:
```bash
npm start
```

## API Endpoints

### Models
- `GET /api/models` - Get available AI models
- Returns model information including metrics, download links

### Downloads  
- `GET /api/downloads` - List available download files
- `GET /api/downloads/:filename` - Download specific file

### Prediction
- `POST /api/predict` - Submit images for analysis
- Accepts multipart/form-data with images and metadata
- Returns analysis results with species counts and bounding boxes

### Health Check
- `GET /api/health` - Server health status

## Configuration

### Demo Mode

Set `ENABLE_DEMO_MODE=true` to return sample results without actual AI processing.

When demo mode is disabled, you'll need to integrate with actual AI models.

### Adding Models

Edit `data/models.json` to add new AI models:

```json
{
  "id": "model-id",
  "name": "Model Name", 
  "description": "Model description",
  "type": "detector|classifier|counter",
  "metrics": {
    "accuracy": "94.7%",
    "speed": "0.3s"
  },
  "version": "1.0.0",
  "size": "45.2 MB",
  "framework": "PyTorch|TensorFlow|ONNX"
}
```

### Adding Downloads

Edit `data/downloads.json` to add downloadable files:

```json
{
  "name": "File Name",
  "filename": "actual-filename.zip",
  "description": "File description", 
  "size": "45.2 MB",
  "type": "model|dataset|code|documentation|data",
  "version": "1.0.0"
}
```

Place actual files in `storage/downloads/` directory.

## File Structure

```
backend/
├── server.js              # Main server file
├── data/                   # Configuration data
│   ├── models.json        # AI models configuration
│   └── downloads.json     # Download files configuration
├── storage/               # File storage
│   ├── uploads/          # Uploaded images (auto-created)
│   └── downloads/        # Downloadable files
├── sample_outputs/        # Sample analysis results
│   └── sample-results.json
└── README.md
```

## Storage Directories

The server automatically creates these directories:

- `storage/uploads/` - Temporary storage for uploaded images
- `storage/downloads/` - Static files served for download
- `data/` - Configuration files

### Adding Download Files

1. Place files in `storage/downloads/`
2. Update `data/downloads.json` with file information
3. Files will be accessible via `/api/downloads/:filename`

## Demo Mode Sample Results

When `ENABLE_DEMO_MODE=true`, the `/api/predict` endpoint returns:

- Random species counts for common marine organisms
- Simulated bounding box coordinates
- Processing time and confidence metrics
- CSV download link (placeholder)

## Production Integration

To integrate with actual AI models:

1. Set `ENABLE_DEMO_MODE=false`
2. Implement model inference in the `/api/predict` endpoint
3. Add model loading and prediction logic
4. Handle GPU/CPU inference as needed

## Error Handling

The API includes comprehensive error handling for:
- File upload errors (size limits, file types)
- Missing configuration files
- Invalid request parameters
- Server errors

## CORS Configuration

Configure allowed origins in the `CORS_ORIGINS` environment variable:
```
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```