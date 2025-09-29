# Marine Microscopy Frontend

React-based frontend for the Embedded Intelligent Microscopy System for Marine Organisms.

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

3. Update environment variables in `.env`:
```
VITE_BACKEND_URL=http://localhost:5000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

## Configuration

### Models Configuration

Edit `public/models.json` to add or modify AI models:

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
  "diagram": "/diagrams/model-diagram.png",
  "downloadUrl": "/downloads/model.zip"
}
```

### Pipeline Configuration

Edit `public/pipeline.json` to modify the processing pipeline:

```json
{
  "stages": [
    {
      "id": "stage-id",
      "name": "Stage Name",
      "description": "Stage description",
      "duration": "0.1s",
      "inputs": ["input1"],
      "outputs": ["output1"],
      "icon": "icon-name"
    }
  ]
}
```

## Features

### Showcase Page (/)
- Hero section with project overview
- Model cards displaying AI models
- Processing pipeline visualization
- Performance metrics
- Team information
- Download section

### Lab Page (/run)
- Gamified wizard interface
- Step-by-step configuration
- Image upload and processing
- Real-time results display
- CSV report generation

## File Structure

```
src/
├── components/          # Reusable components
│   └── Navbar.jsx      # Navigation component
├── pages/              # Page components
│   ├── Showcase.jsx    # Landing page
│   └── Lab.jsx         # Analysis interface
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles

public/
├── models.json        # AI models configuration
└── pipeline.json      # Processing pipeline config
```

## Styling

The project uses Tailwind CSS with custom themes:
- **Oceanic theme**: Blue gradients for showcase
- **Lab theme**: Dark with neon accents for analysis
- **Animations**: Framer Motion for smooth transitions

## API Integration

The frontend communicates with the backend via:
- `GET /api/models` - Fetch available models
- `GET /api/downloads` - List downloadable files
- `POST /api/predict` - Submit analysis requests