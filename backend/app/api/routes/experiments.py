"""
Experiments API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import Experiment, Response, Metric
from app.services.llm_service import LLMService
from app.services.metrics_service import MetricsService

router = APIRouter()


class ExperimentCreate(BaseModel):
    name: str
    prompt: str
    temperature_range: List[float]
    top_p_range: List[float]
    max_tokens: int = 1000


class ExperimentResponse(BaseModel):
    id: int
    name: str
    prompt: str
    created_at: str
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        """Convert ORM object to response model"""
        return cls(
            id=obj.id,
            name=obj.name,
            prompt=obj.prompt,
            created_at=obj.created_at.isoformat() if obj.created_at else ""
        )


class ExperimentDetail(ExperimentResponse):
    response_count: int = 0


@router.post("/", response_model=ExperimentResponse)
async def create_experiment(
    experiment_data: ExperimentCreate,
    db: Session = Depends(get_db)
):
    """Create a new experiment and generate responses"""
    try:
        # Create experiment
        experiment = Experiment(
            name=experiment_data.name,
            prompt=experiment_data.prompt
        )
        db.add(experiment)
        db.commit()
        db.refresh(experiment)
        
        # Generate responses with different parameter combinations
        try:
            llm_service = LLMService()
            metrics_service = MetricsService()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to initialize services: {str(e)}")
        
        # Generate parameter combinations
        import itertools
        param_combinations = list(itertools.product(
            experiment_data.temperature_range,
            experiment_data.top_p_range
        ))
        
        print(f"[EXPERIMENT {experiment.id}] Starting generation of {len(param_combinations)} responses...")
        
        # Generate responses for each combination
        success_count = 0
        for idx, (temp, top_p) in enumerate(param_combinations, 1):
            try:
                print(f"[EXPERIMENT {experiment.id}] Generating response {idx}/{len(param_combinations)}: temp={temp}, top_p={top_p}")
                
                # Generate LLM response
                llm_response = await llm_service.generate_response(
                    prompt=experiment_data.prompt,
                    temperature=temp,
                    top_p=top_p,
                    max_tokens=experiment_data.max_tokens
                )
                
                print(f"[EXPERIMENT {experiment.id}] LLM response received (length: {len(llm_response['text'])})")
                
                # Create response record
                response = Response(
                    experiment_id=experiment.id,
                    temperature=temp,
                    top_p=top_p,
                    max_tokens=experiment_data.max_tokens,
                    text=llm_response["text"],
                    finish_reason=llm_response.get("finish_reason", "stop")
                )
                db.add(response)
                db.commit()
                db.refresh(response)
                
                print(f"[EXPERIMENT {experiment.id}] Response saved (ID: {response.id}), calculating metrics...")
                
                # Calculate and store metrics
                metrics = metrics_service.calculate_all_metrics(llm_response["text"])
                print(f"[EXPERIMENT {experiment.id}] Metrics calculated: {list(metrics.keys())}")
                
                for metric_name, metric_value in metrics.items():
                    metric = Metric(
                        response_id=response.id,
                        name=metric_name,
                        value=metric_value.get("value", 0.0),
                        metadata_json=metric_value.get("metadata")
                    )
                    db.add(metric)
                
                db.commit()
                success_count += 1
                print(f"[EXPERIMENT {experiment.id}] Response {idx} completed successfully")
                
            except Exception as e:
                # Log error but continue with other combinations
                import traceback
                print(f"[EXPERIMENT {experiment.id}] ERROR generating response {idx} (temp={temp}, top_p={top_p}): {str(e)}")
                traceback.print_exc()
                continue
        
        print(f"[EXPERIMENT {experiment.id}] Generation complete: {success_count}/{len(param_combinations)} successful")
        
        # Return experiment with proper datetime serialization
        return ExperimentResponse(
            id=experiment.id,
            name=experiment.name,
            prompt=experiment.prompt,
            created_at=experiment.created_at.isoformat() if experiment.created_at else ""
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating experiment: {str(e)}")


@router.get("/", response_model=List[ExperimentResponse])
async def list_experiments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all experiments"""
    experiments = db.query(Experiment).offset(skip).limit(limit).all()
    return [
        {
            "id": exp.id,
            "name": exp.name,
            "prompt": exp.prompt,
            "created_at": exp.created_at.isoformat() if exp.created_at else ""
        }
        for exp in experiments
    ]


@router.get("/{experiment_id}", response_model=ExperimentDetail)
async def get_experiment(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    """Get experiment details"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    response_count = db.query(Response).filter(Response.experiment_id == experiment_id).count()
    
    return {
        "id": experiment.id,
        "name": experiment.name,
        "prompt": experiment.prompt,
        "created_at": experiment.created_at.isoformat() if experiment.created_at else "",
        "response_count": response_count
    }


@router.delete("/{experiment_id}")
async def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    """Delete an experiment"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    db.delete(experiment)
    db.commit()
    
    return {"message": "Experiment deleted successfully"}
