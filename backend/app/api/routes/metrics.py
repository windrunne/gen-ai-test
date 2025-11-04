"""
Metrics API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db.models import Metric, Response

router = APIRouter()


@router.get("/experiment/{experiment_id}/summary")
async def get_experiment_metrics_summary(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    """Get metrics summary for all responses in an experiment"""
    responses = db.query(Response).filter(Response.experiment_id == experiment_id).all()
    
    if not responses:
        raise HTTPException(status_code=404, detail="No responses found for this experiment")
    
    # Aggregate metrics by name
    metrics_summary = {}
    
    for response in responses:
        metrics = db.query(Metric).filter(Metric.response_id == response.id).all()
        
        for metric in metrics:
            if metric.name not in metrics_summary:
                metrics_summary[metric.name] = {
                    "values": [],
                    "responses": []
                }
            
            metrics_summary[metric.name]["values"].append(metric.value)
            metrics_summary[metric.name]["responses"].append({
                "response_id": response.id,
                "temperature": response.temperature,
                "top_p": response.top_p,
                "value": metric.value
            })
    
    # Calculate statistics
    import statistics
    summary = {}
    for metric_name, data in metrics_summary.items():
        values = data["values"]
        summary[metric_name] = {
            "mean": statistics.mean(values) if values else 0,
            "median": statistics.median(values) if values else 0,
            "min": min(values) if values else 0,
            "max": max(values) if values else 0,
            "std_dev": statistics.stdev(values) if len(values) > 1 else 0,
            "count": len(values),
            "responses": data["responses"]
        }
    
    return summary
