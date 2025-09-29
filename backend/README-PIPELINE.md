# Phytoplankton Full Pipeline Inference

This backend supports running a unified phytoplankton analysis pipeline stored as a single pickle file `phytoplankton_full_pipeline.pkl`.

## Directory
Place the pickle at:
```
backend/models/phytoplankton_full_pipeline.pkl
```
(or set `PIPELINE_PATH` to a custom path.)

## New Endpoint
`POST /api/analyze`

Multipart form-data:
- `image`: (required) microscopy image file (jpg/png)

Response JSON (success):
```json
{
  "success": true,
  "timing": 0.842,
  "top": [{"class": "Diatoms", "value": 12.3}],
  "counts": {"Diatoms": 12.3, "Dinoflagellates": 4.1},
  "presence": {"Diatoms": 1, "Dinoflagellates": 1},
  "roi_count": 17,
  "processed_image_base64": "iVBORw0KGgo..." // optional
}
```

## Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| `PIPELINE_PATH` | Path to full pipeline pickle | `backend/models/phytoplankton_full_pipeline.pkl` |
| `PYTHON_BIN` | Python executable used for inference | `python` |
| `ENABLE_DEMO_MODE` | If `true`, legacy `/api/predict` returns mock data | `false` |

## Implementation Notes
- Inference script: `backend/inference/run_pipeline.py`
- Invoked via child process: `python run_pipeline.py --pipeline <pkl> --image <file>`
- Returns single-line JSON printed to stdout.

## Troubleshooting
1. `Pipeline pickle not found` → verify file path or set `PIPELINE_PATH`.
2. `Inference failed` with Python traceback → ensure required Python packages (torch, torchvision, Pillow, numpy, sklearn) are installed in the environment referenced by `PYTHON_BIN`.
3. Empty / corrupted base64 image → processed image not available in pipeline output; run without `--return-image`.

## Suggested Python Environment Setup
```bash
python -m venv venv
venv/Scripts/activate
pip install torch torchvision pillow numpy scikit-learn
```
Then start backend with:
```bash
PIPELINE_PATH=backend/models/phytoplankton_full_pipeline.pkl PYTHON_BIN=venv/Scripts/python npm run dev
```
(Adjust for Windows PowerShell.)
