# Crop Disease Detection Backend

## Overview
FastAPI backend for syncing offline crop disease detection data from mobile and web applications.

## Features
- Batch sync endpoint for offline scan data
- Image upload for future model retraining
- Scan history retrieval with filtering
- Disease outbreak analytics
- PostgreSQL database with indexed queries

## Setup

### Prerequisites
- Python 3.9+
- PostgreSQL 13+

### Installation

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure database**
```bash
# Create PostgreSQL database
createdb crop_disease_db

# Or using psql
psql -U postgres
CREATE DATABASE crop_disease_db;
\q
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Run database migrations**
```bash
# Tables are created automatically on first run
python main.py
```

### Running the Server

**Development mode:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check
```
GET /health
```

### Sync Scans
```
POST /api/sync
Content-Type: application/json

{
  "scans": [
    {
      "disease": "Tomato___Late_blight",
      "confidence": 0.95,
      "severity": "critical",
      "timestamp": "2024-01-28T00:00:00Z",
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  ]
}
```

### Upload Image
```
POST /api/upload-image
Content-Type: multipart/form-data

image: <file>
scan_id: <optional_scan_id>
```

### Get Scans
```
GET /api/scans?skip=0&limit=100&disease=Tomato
```

### Get Statistics
```
GET /api/stats
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

### Scans Table
- `id`: Primary key
- `disease`: Disease name
- `confidence`: Confidence score (0-1)
- `severity`: Severity level (low/medium/high/critical)
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `timestamp`: Scan timestamp
- `created_at`: Record creation time

### Image Metadata Table
- `id`: Primary key
- `scan_id`: Reference to scan (optional)
- `filename`: Image filename
- `file_path`: Storage path
- `file_size`: File size in bytes
- `uploaded_at`: Upload timestamp

## Deployment

### Using Docker (Recommended)

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t crop-disease-backend .
docker run -p 8000:8000 --env-file .env crop-disease-backend
```

### Using systemd

Create `/etc/systemd/system/crop-disease-api.service`:

```ini
[Unit]
Description=Crop Disease Detection API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/crop-disease-backend
Environment="PATH=/var/www/crop-disease-backend/venv/bin"
ExecStart=/var/www/crop-disease-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable crop-disease-api
sudo systemctl start crop-disease-api
```

## License
MIT
