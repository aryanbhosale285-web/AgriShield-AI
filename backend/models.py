"""
Database Models
SQLAlchemy ORM models for scan records
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Index, JSON
from sqlalchemy.sql import func
from database import Base


class Scan(Base):
    """
    Scan record model - AgriShield AI
    Stores multimodal disease detection results:
    - Image-based predictions
    - Farmer symptom input
    - GPS/climate context
    - Confidence bands
    """
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    disease = Column(String(255), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False, default='medium')
    
    # Multimodal Intelligence Fields (AgriShield AI)
    symptoms = Column(JSON, nullable=True)  # Array of farmer-reported symptoms
    climate_data = Column(JSON, nullable=True)  # Temperature, humidity, rainfall, season
    gps_grid = Column(String(50), nullable=True, index=True)  # Privacy-safe grid identifier
    top_3_predictions = Column(JSON, nullable=True)  # Top 3 disease predictions with confidence
    confidence_band = Column(String(20), nullable=True)  # low/medium/high
    
    # Legacy GPS coordinates (kept for backward compatibility)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Metadata
    synced = Column(Boolean, default=True)  # Always true for backend records
    
    # Indexes for efficient queries
    __table_args__ = (
        Index('idx_disease_timestamp', 'disease', 'timestamp'),
        Index('idx_location', 'latitude', 'longitude'),
        Index('idx_created_at', 'created_at'),
        Index('idx_gps_grid', 'gps_grid'),  # For regional outbreak analytics
        Index('idx_confidence_band', 'confidence_band'),
    )

    def __repr__(self):
        return f"<Scan(id={self.id}, disease='{self.disease}', confidence={self.confidence})>"


class ImageMetadata(Base):
    """
    Image metadata model
    Stores uploaded images for future retraining
    """
    __tablename__ = "image_metadata"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, nullable=True)  # Reference to scan (optional)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ImageMetadata(id={self.id}, filename='{self.filename}')>"
