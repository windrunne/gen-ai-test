"""
Responses API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import Response, Metric

router = APIRouter()


class ResponseWithMetrics(BaseModel):
    id: int
    experiment_id: int
    temperature: float
    top_p: float
    max_tokens: int
    text: str
    finish_reason: Optional[str]
    validation_metadata: Optional[dict] = None
    created_at: str
    metrics: List[dict]
    
    class Config:
        from_attributes = True


@router.get("/experiment/{experiment_id}", response_model=List[ResponseWithMetrics])
async def get_experiment_responses(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    """Get all responses for an experiment with their metrics"""
    responses = db.query(Response).filter(Response.experiment_id == experiment_id).all()
    
    result = []
    for response in responses:
        metrics = db.query(Metric).filter(Metric.response_id == response.id).all()
        metrics_data = [
            {
                "name": m.name,
                "value": m.value,
                "metadata": m.metadata_json
            }
            for m in metrics
        ]
        
        result.append({
            "id": response.id,
            "experiment_id": response.experiment_id,
            "temperature": response.temperature,
            "top_p": response.top_p,
            "max_tokens": response.max_tokens,
            "text": response.text,
            "finish_reason": response.finish_reason,
            "validation_metadata": response.validation_metadata,
            "created_at": response.created_at.isoformat() if response.created_at else "",
            "metrics": metrics_data
        })
    
    return result


@router.get("/{response_id}", response_model=ResponseWithMetrics)
async def get_response(
    response_id: int,
    db: Session = Depends(get_db)
):
    """Get a single response with its metrics"""
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    metrics = db.query(Metric).filter(Metric.response_id == response_id).all()
    metrics_data = [
        {
            "name": m.name,
            "value": m.value,
            "metadata": m.metadata_json
        }
        for m in metrics
    ]
    
    return {
        "id": response.id,
        "experiment_id": response.experiment_id,
        "temperature": response.temperature,
        "top_p": response.top_p,
        "max_tokens": response.max_tokens,
        "text": response.text,
        "finish_reason": response.finish_reason,
        "validation_metadata": response.validation_metadata,
        "created_at": response.created_at.isoformat() if response.created_at else "",
        "metrics": metrics_data
    }
