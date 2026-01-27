"""
Enhanced Sync Router - AgriShield AI
API endpoints for syncing multimodal data and regional analytics
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import List, Dict
from datetime import datetime

from database import get_db
from models import Scan
from schemas import (
    ScanCreate,
    ScanResponse,
    BatchSyncRequest,
    BatchSyncResponse,
)

router = APIRouter(prefix="/api", tags=["sync-multimodal"])


@router.post("/sync/multimodal", response_model=BatchSyncResponse)
async def sync_multimodal_scans(
    request: BatchSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Sync batch of scan records with multimodal data
    Supports: symptoms, climate_data, gps_grid, top_3_predictions, confidence_band
    """
    try:
        synced_count = 0
        
        for scan_data in request.scans:
            # Create scan record with multimodal data
            scan = Scan(
                disease=scan_data.disease,
                confidence=scan_data.confidence,
                severity=scan_data.severity,
                timestamp=scan_data.timestamp,
                # Legacy GPS coordinates (backward compatible)
                latitude=scan_data.latitude,
                longitude=scan_data.longitude,
                # Multimodal fields
                symptoms=scan_data.symptoms if hasattr(scan_data, 'symptoms') else None,
                climate_data=scan_data.climate_data if hasattr(scan_data, 'climate_data') else None,
                gps_grid=scan_data.gps_grid if hasattr(scan_data, 'gps_grid') else None,
                top_3_predictions=scan_data.top_3_predictions if hasattr(scan_data, 'top_3_predictions') else None,
                confidence_band=scan_data.confidence_band if hasattr(scan_data, 'confidence_band') else None,
                synced=True
            )
            
            db.add(scan)
            synced_count += 1
        
        db.commit()
        
        return BatchSyncResponse(
            success=True,
            synced_count=synced_count,
            message=f"Successfully synced {synced_count} multimodal scans"
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Multimodal sync failed: {str(e)}")


@router.get("/analytics/regional/{gps_grid}")
async def get_regional_analytics(
    gps_grid: str,
    radius: int = 1,
    db: Session = Depends(get_db)
):
    """
    Get regional disease analytics for a GPS grid
    Includes nearby grids based on radius (~5km per grid)
    """
    try:
        # Parse grid coordinates
        parts = gps_grid.split('_')
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Invalid GPS grid format (expected: G_LAT_LON)")
        
        try:
            base_lat = float(parts[1])
            base_lon = float(parts[2])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid GPS grid coordinates")
        
        # Generate nearby grid IDs
        step = 0.05  # ~5km grid size
        nearby_grids = []
        
        for lat_offset in range(-radius, radius + 1):
            for lon_offset in range(-radius, radius + 1):
                nearby_lat = round(base_lat + lat_offset * step, 2)
                nearby_lon = round(base_lon + lon_offset * step, 2)
                nearby_grids.append(f"G_{nearby_lat:.2f}_{nearby_lon:.2f}")
        
        # Query scans from nearby grids
        scans = db.query(Scan).filter(Scan.gps_grid.in_(nearby_grids)).all()
        
        if not scans:
            return {
                "gps_grid": gps_grid,
                "total_scans": 0,
                "disease_prevalence": {},
                "outbreaks": [],
                "nearby_grids": nearby_grids,
                "radius_km": radius * 5
            }
        
        # Calculate disease prevalence
        total_scans = len(scans)
        disease_counts = {}
        
        for scan in scans:
            disease = scan.disease
            disease_counts[disease] = disease_counts.get(disease, 0) + 1
        
        # Calculate prevalence and detect outbreaks
        disease_prevalence = {}
        outbreaks = []
        outbreak_threshold = 0.3  # 30%
        
        for disease, count in disease_counts.items():
            prevalence = count / total_scans
            disease_prevalence[disease] = {
                "count": count,
                "prevalence": round(prevalence, 3),
                "percentage": round(prevalence * 100, 1)
            }
            
            if prevalence >= outbreak_threshold:
                outbreaks.append({
                    "disease": disease,
                    "prevalence": round(prevalence, 3),
                    "percentage": round(prevalence * 100, 1),
                    "count": count,
                    "severity": "high" if prevalence >= 0.5 else "medium"
                })
        
        # Sort by prevalence
        outbreaks.sort(key=lambda x: x["prevalence"], reverse=True)
        
        return {
            "gps_grid": gps_grid,
            "total_scans": total_scans,
            "disease_prevalence": disease_prevalence,
            "outbreaks": outbreaks,
            "nearby_grids": nearby_grids,
            "radius_km": radius * 5,
            "has_outbreak": len(outbreaks) > 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics query failed: {str(e)}")


@router.post("/analytics/regional")
async def sync_regional_analytics(
    regional_data: Dict,
    db: Session = Depends(get_db)
):
    """
    Sync regional analytics data from mobile devices
    Returns merged server-side analytics
    """
    try:
        # Get all unique GPS grids from database
        grids = db.query(distinct(Scan.gps_grid)).filter(Scan.gps_grid.isnot(None)).all()
        
        server_data = {}
        
        for (grid,) in grids:
            if not grid:
                continue
                
            scans = db.query(Scan).filter(Scan.gps_grid == grid).all()
            
            disease_counts = {}
            for scan in scans:
                disease_counts[scan.disease] = disease_counts.get(scan.disease, 0) + 1
            
            server_data[grid] = {
                "gridId": grid,
                "diseasePrevalence": disease_counts,
                "totalScans": len(scans),
                "lastUpdated": int(datetime.now().timestamp() * 1000)
            }
        
        return server_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regional analytics sync failed: {str(e)}")


@router.get("/analytics/outbreaks")
async def get_all_outbreaks(
    threshold: float = 0.3,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get all active disease outbreaks across all regions
    """
    try:
        # Get all grids with scans
        grids = db.query(distinct(Scan.gps_grid)).filter(Scan.gps_grid.isnot(None)).all()
        
        all_outbreaks = []
        
        for (grid,) in grids:
            if not grid:
                continue
            
            scans = db.query(Scan).filter(Scan.gps_grid == grid).all()
            total_scans = len(scans)
            
            if total_scans == 0:
                continue
            
            disease_counts = {}
            for scan in scans:
                disease_counts[scan.disease] = disease_counts.get(scan.disease, 0) + 1
            
            for disease, count in disease_counts.items():
                prevalence = count / total_scans
                
                if prevalence >= threshold:
                    all_outbreaks.append({
                        "gps_grid": grid,
                        "disease": disease,
                        "prevalence": round(prevalence, 3),
                        "percentage": round(prevalence * 100, 1),
                        "count": count,
                        "total_scans": total_scans,
                        "severity": "critical" if prevalence >= 0.7 else "high" if prevalence >= 0.5 else "medium"
                    })
        
        # Sort by prevalence (highest first)
        all_outbreaks.sort(key=lambda x: x["prevalence"], reverse=True)
        
        return {
            "total_outbreaks": len(all_outbreaks),
            "threshold": threshold,
            "outbreaks": all_outbreaks[:limit]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outbreak query failed: {str(e)}")


@router.get("/analytics/confidence-bands")
async def get_confidence_band_stats(db: Session = Depends(get_db)):
    """
    Get statistics on confidence bands
    """
    try:
        total_scans = db.query(Scan).filter(Scan.confidence_band.isnot(None)).count()
        
        if total_scans == 0:
            return {
                "total_scans": 0,
                "distribution": {},
                "recovery_needed": 0
            }
        
        # Count by confidence band
        band_counts = {}
        for band in ['low', 'medium', 'high']:
            count = db.query(Scan).filter(Scan.confidence_band == band).count()
            band_counts[band] = {
                "count": count,
                "percentage": round((count / total_scans) * 100, 1)
            }
        
        # Count scans that needed recovery (low confidence)
        recovery_needed = db.query(Scan).filter(Scan.confidence_band == 'low').count()
        
        return {
            "total_scans": total_scans,
            "distribution": band_counts,
            "recovery_needed": recovery_needed,
            "recovery_percentage": round((recovery_needed / total_scans) * 100, 1)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Confidence stats query failed: {str(e)}")
