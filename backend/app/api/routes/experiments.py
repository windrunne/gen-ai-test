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
        import asyncio
        param_combinations = list(itertools.product(
            experiment_data.temperature_range,
            experiment_data.top_p_range
        ))
        
        print(f"[EXPERIMENT {experiment.id}] Starting parallel generation of {len(param_combinations)} responses...")
        
        async def generate_single_response(temp: float, top_p: float, idx: int):
            """Generate a single response and save to database"""
            try:
                print(f"[EXPERIMENT {experiment.id}] Generating response {idx}/{len(param_combinations)}: temp={temp}, top_p={top_p}")
                
                # Generate LLM response
                llm_response = await llm_service.generate_response(
                    prompt=experiment_data.prompt,
                    temperature=temp,
                    top_p=top_p,
                    max_tokens=experiment_data.max_tokens
                )
                
                print(f"[EXPERIMENT {experiment.id}] LLM response {idx} received (length: {len(llm_response['text'])})")
                
                # Calculate metrics (CPU-bound, do this before DB operations)
                metrics = metrics_service.calculate_all_metrics(llm_response["text"])
                print(f"[EXPERIMENT {experiment.id}] Metrics calculated for response {idx}: {list(metrics.keys())}")
                
                # Create new DB session for this response (thread-safe)
                from app.db.database import SessionLocal
                local_db = SessionLocal()
                try:
                    # Create response record
                    response = Response(
                        experiment_id=experiment.id,
                        temperature=temp,
                        top_p=top_p,
                        max_tokens=experiment_data.max_tokens,
                        text=llm_response["text"],
                        finish_reason=llm_response.get("finish_reason", "stop")
                    )
                    local_db.add(response)
                    local_db.commit()
                    local_db.refresh(response)
                    
                    # Store metrics
                    for metric_name, metric_value in metrics.items():
                        metric = Metric(
                            response_id=response.id,
                            name=metric_name,
                            value=metric_value.get("value", 0.0),
                            metadata_json=metric_value.get("metadata")
                        )
                        local_db.add(metric)
                    
                    local_db.commit()
                    print(f"[EXPERIMENT {experiment.id}] Response {idx} saved successfully (ID: {response.id})")
                    return True
                except Exception as db_error:
                    local_db.rollback()
                    print(f"[EXPERIMENT {experiment.id}] DB error for response {idx}: {str(db_error)}")
                    raise
                finally:
                    local_db.close()
                    
            except Exception as e:
                # Log error but don't fail the whole experiment
                import traceback
                print(f"[EXPERIMENT {experiment.id}] ERROR generating response {idx} (temp={temp}, top_p={top_p}): {str(e)}")
                traceback.print_exc()
                return False
        
        # Generate all responses in parallel
        tasks = [
            generate_single_response(temp, top_p, idx)
            for idx, (temp, top_p) in enumerate(param_combinations, 1)
        ]
        
        # Run all tasks concurrently with a limit to avoid overwhelming the API
        # Process in batches of 5 to respect rate limits
        batch_size = 5
        success_count = 0
        
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            print(f"[EXPERIMENT {experiment.id}] Processing batch {i//batch_size + 1}/{(len(tasks) + batch_size - 1)//batch_size}")
            results = await asyncio.gather(*batch, return_exceptions=True)
            success_count += sum(1 for r in results if r is True)
            print(f"[EXPERIMENT {experiment.id}] Batch complete: {sum(1 for r in results if r is True)}/{len(batch)} successful")
        
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
