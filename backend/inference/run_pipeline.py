import argparse
import json
import os
import sys
import time
import traceback
from io import BytesIO
from PIL import Image
import base64

# Attempt heavy imports lazily; if they fail, return error JSON

def load_pickle(path):
    import pickle
    with open(path, 'rb') as f:
        return pickle.load(f)

def pil_image_from_path(path: str) -> Image.Image:
    return Image.open(path).convert('RGB')


def main():
    parser = argparse.ArgumentParser(description='Run phytoplankton full pipeline inference on one image.')
    parser.add_argument('--pipeline', required=True, help='Path to phytoplankton_full_pipeline.pkl')
    parser.add_argument('--image', required=True, help='Path to image file')
    parser.add_argument('--topk', type=int, default=10, help='Top K classes to include')
    parser.add_argument('--threshold', type=float, default=None, help='Optional override threshold')
    parser.add_argument('--return-image', action='store_true', help='Return processed image (base64)')
    args = parser.parse_args()

    start_time = time.time()
    try:
        payload = load_pickle(args.pipeline)
        full_pipeline = payload.get('pipeline') if isinstance(payload, dict) else payload
        if args.threshold is not None and hasattr(full_pipeline, 'threshold'):
            full_pipeline.threshold = args.threshold

        if not os.path.exists(args.image):
            raise FileNotFoundError(f'Image not found: {args.image}')

        result = full_pipeline.predict(args.image)
        counts = result.get('counts', {})
        presence = result.get('presence', {})
        top_items = result.get('top10', [])[:args.topk]
        rois = result.get('rois', [])

        processed_image_b64 = None
        if args.return_image and 'processed_image' in result:
            buf = BytesIO()
            try:
                result['processed_image'].save(buf, format='PNG')
                processed_image_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            except Exception:
                processed_image_b64 = None

        duration = time.time() - start_time
        out = {
            'success': True,
            'timing': round(duration, 3),
            'top': [{'class': c, 'value': v} for c, v in top_items],
            'counts': counts,
            'presence': presence,
            'roi_count': len(rois),
            'processed_image_base64': processed_image_b64,
        }
        print(json.dumps(out))
    except Exception as e:
        err = {
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc(limit=3)
        }
        print(json.dumps(err))
        sys.exit(1)

if __name__ == '__main__':
    main()
