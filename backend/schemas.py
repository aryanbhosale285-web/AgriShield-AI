"""
Pydantic Schemas
Request and response models with validation
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List


class ScanCreate(BaseModel):
    """
    Schema for creating a scan record - AgriShield AI
    Supports multimodal intelligence data
    """
    disease: str = Field(..., min_length=1, max_length=255)
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: str = Field(default='medium')
    timestamp: datetime
    
    # Multimodal Intelligence Fields (AgriShield AI)
    symptoms: Optional[List[str]] = Field(None, description="Farmer-reported symptoms")
    climate_data: Optional[dict] = Field(None, description="Temperature, humidity, rainfall, season")
    gps_grid: Optional[str] = Field(None, max_length=50, description="Privacy-safe grid identifier")
    top_3_predictions: Optional[List[dict]] = Field(None, description="Top 3 disease predictions")
    confidence_band: Optional[str] = Field(None, description="low/medium/high")
    
    # Legacy GPS coordinates (optional, backward compatible)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

    @field_validator('severity')
    @classmethod
    def validate_severity(cls, v):
        allowed = ['low', 'medium', 'high', 'critical']
        if v not in allowed:
            raise ValueError(f'Severity must be one of {allowed}')
        return v
    
    @field_validator('confidence_band')
    @classmethod
    def validate_confidence_band(cls, v):
        if v is None:
            return v
        allowed = ['low', 'medium', 'high']
        if v not in allowed:
            raise ValueError(f'Confidence band must be one of {allowed}')
        return v
    
    @field_validator('symptoms')
    @classmethod
    def validate_symptoms(cls, v):
        if v is None:
            return v
        allowed_symptoms = [
            'yellowing', 'leaf_curling', 'wilting', 'brown_spots', 
            'black_spots', 'powdery_layer', 'sticky_surface', 'slow_growth',
            'holes', 'discoloration', 'deformation'
        ]
        for symptom in v:
            if symptom not in allowed_symptoms:
                raise ValueError(f'Invalid symptom: {symptom}. Must be one of {allowed_symptoms}')
        return v


class ScanResponse(BaseModel):
    """
    Schema for scan response - AgriShield AI
    """
    id: int
    disease: str
    confidence: float
    severity: str
    
    # Multimodal Intelligence Fields
    symptoms: Optional[List[str]]
    climate_data: Optional[dict]
    gps_grid: Optional[str]
    top_3_predictions: Optional[List[dict]]
    confidence_band: Optional[str]
    
    # Legacy GPS coordinates
    latitude: Optional[float]
    longitude: Optional[float]
    
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class BatchSyncRequest(BaseModel):
    """
    Schema for batch sync request
    """
    scans: List[ScanCreate]

    @field_validator('scans')
    @classmethod
    def validate_scans(cls, v):
        if len(v) == 0:
            raise ValueError('Scans list cannot be empty')
        if len(v) > 100:
            raise ValueError('Maximum 100 scans per batch')
        return v


class BatchSyncResponse(BaseModel):
    """
    Schema for batch sync response
    """
    success: bool
    synced_count: int
    message: str


class HealthResponse(BaseModel):
    """
    Schema for health check response
    """
    status: str
    timestamp: datetime
    database: str


class ImageUploadResponse(BaseModel):
    """
    Schema for image upload response
    """
    success: bool
    filename: str
    message: str
