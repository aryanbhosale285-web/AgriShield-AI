"""
Sync Router
API endpoints for syncing offline data
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime

from database import get_db
from models import Scan, ImageMetadata
from schemas import (
    ScanCreate,
    ScanResponse,
    BatchSyncRequest,
    BatchSyncResponse,
    ImageUploadResponse
)

router = APIRouter(prefix="/api", tags=["sync"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/sync", response_model=BatchSyncResponse)
async def sync_scans(
    request: BatchSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Sync batch of scan records from offline devices
    """
    try:
        synced_count = 0
        
        for scan_data in request.scans:
            # Create scan record
            scan = Scan(
                disease=scan_data.disease,
                confidence=scan_data.confidence,
                severity=scan_data.severity,
                timestamp=scan_data.timestamp,
                latitude=scan_data.latitude,
                longitude=scan_data.longitude,
                synced=True
            )
            
            db.add(scan)
            synced_count += 1
        
        db.commit()
        
        return BatchSyncResponse(
            success=True,
            synced_count=synced_count,
            message=f"Successfully synced {synced_count} scans"
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/upload-image", response_model=ImageUploadResponse)
async def upload_image(
    image: UploadFile = File(...),
    scan_id: int = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload image for future model retraining
    """
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create metadata record
        metadata = ImageMetadata(
            scan_id=scan_id,
            filename=filename,
            file_path=file_path,
            file_size=file_size
        )
        
        db.add(metadata)
        db.commit()
        
        return ImageUploadResponse(
            success=True,
            filename=filename,
            message="Image uploaded successfully"
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/scans", response_model=List[ScanResponse])
async def get_scans(
    skip: int = 0,
    limit: int = 100,
    disease: str = None,
    db: Session = Depends(get_db)
):
    """
    Get scan history with optional filtering
    """
    try:
        query = db.query(Scan)
        
        if disease:
            query = query.filter(Scan.disease.ilike(f"%{disease}%"))
        
        scans = query.order_by(Scan.timestamp.desc()).offset(skip).limit(limit).all()
        
        return scans
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: int, db: Session = Depends(get_db)):
    """
    Get specific scan by ID
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Get statistics about scans
    """
    try:
        total_scans = db.query(Scan).count()
        
        # Count by severity
        severity_counts = {}
        for severity in ['low', 'medium', 'high', 'critical']:
            count = db.query(Scan).filter(Scan.severity == severity).count()
            severity_counts[severity] = count
        
        # Most common diseases
        from sqlalchemy import func
        top_diseases = db.query(
            Scan.disease,
            func.count(Scan.id).label('count')
        ).group_by(Scan.disease).order_by(func.count(Scan.id).desc()).limit(10).all()
        
        return {
            "total_scans": total_scans,
            "severity_distribution": severity_counts,
            "top_diseases": [{"disease": d[0], "count": d[1]} for d in top_diseases]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats query failed: {str(e)}")
