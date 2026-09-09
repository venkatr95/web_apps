from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
from database import SessionLocal, init_db
from models import FormData, FormInteraction
from agent import UUIDAgent
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="UUID Form Filler Agent API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Get LLM provider from environment (default to openai)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower()

# Initialize agent based on provider
if LLM_PROVIDER == "lmstudio":
    print("Using LM Studio with locally hosted model")
    agent = UUIDAgent(
        provider="lmstudio",
        model=os.getenv("LMSTUDIO_MODEL", "gemma-3")
    )
else:
    print("Using OpenAI API")
    agent = UUIDAgent(
        api_key=os.getenv("OPENAI_API_KEY"),
        provider="openai",
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    )


class UUIDRequest(BaseModel):
    uuid: str


class FormResponse(BaseModel):
    uuid: str
    name: str
    email: str
    phone: str
    address: str
    company: str
    position: str
    notes: str


@app.get("/")
async def root():
    return {"message": "UUID Form Filler Agent API", "status": "running"}


@app.get("/api/uuids", response_model=List[str])
async def get_all_uuids():
    """Get list of all available UUIDs"""
    db = SessionLocal()
    try:
        form_data = db.query(FormData).all()
        return [data.uuid for data in form_data]
    finally:
        db.close()


@app.post("/api/get-form-data", response_model=FormResponse)
async def get_form_data(request: UUIDRequest):
    """Get form data by UUID using LLM agent"""
    db = SessionLocal()
    try:
        # First, try to get data from database
        form_data = db.query(FormData).filter(FormData.uuid == request.uuid).first()
        
        if not form_data:
            raise HTTPException(status_code=404, detail="UUID not found")
        
        # Update access time and count
        form_data.last_accessed = datetime.utcnow()
        form_data.access_count += 1
        db.commit()
        
        # Use OpenAI agent to intelligently map and format the data
        agent_response = agent.map_uuid_to_form(
            uuid=request.uuid,
            raw_data={
                "name": form_data.name,
                "email": form_data.email,
                "phone": form_data.phone,
                "address": form_data.address,
                "company": form_data.company,
                "position": form_data.position,
                "notes": form_data.notes
            }
        )
        
        return FormResponse(**agent_response)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        db.close()


@app.get("/api/duplicates")
async def get_duplicates(threshold: float = 0.85):
    """Detect duplicate records using intelligent agent"""
    db = SessionLocal()
    try:
        # Get all records
        all_records = db.query(FormData).all()
        records_data = [
            {
                "uuid": r.uuid,
                "name": r.name,
                "email": r.email,
                "company": r.company,
                "position": r.position
            }
            for r in all_records
        ]
        
        # Use agent to intelligently detect duplicates
        duplicates = agent.detect_duplicates_intelligently(records_data)
        
        return {
            "count": len(duplicates),
            "threshold": threshold,
            "duplicates": duplicates,
            "intelligence": "AI-powered semantic analysis"
        }
    finally:
        db.close()


@app.get("/api/database-stats")
async def get_database_stats():
    """Get database statistics and health metrics"""
    db = SessionLocal()
    try:
        from datetime import timedelta
        
        # Get total records
        total_records = db.query(FormData).count()
        
        # Get duplicate count
        duplicate_count = db.query(FormData).filter(FormData.is_duplicate == True).count()
        
        # Get stale records (not updated in 365 days)
        threshold_date = datetime.utcnow() - timedelta(days=365)
        stale_count = db.query(FormData).filter(
            FormData.updated_at < threshold_date
        ).count()
        
        # Active records (not duplicates, not stale)
        active_records = total_records - duplicate_count - stale_count
        
        return {
            "total_records": total_records,
            "duplicate_count": duplicate_count,
            "stale_count": stale_count,
            "active_records": max(0, active_records)
        }
    finally:
        db.close()


@app.get("/api/stale-records")
async def get_stale_records(days: int = 30):
    """Get stale/inactive records with intelligent analysis"""
    db = SessionLocal()
    try:
        from datetime import timedelta
        threshold_date = datetime.utcnow() - timedelta(days=days)
        
        # Get potentially stale records
        stale_candidates = db.query(FormData).filter(
            FormData.updated_at < threshold_date
        ).all()
        
        records_data = [
            {
                "uuid": r.uuid,
                "name": r.name,
                "position": r.position,
                "last_accessed": r.last_accessed.isoformat() if r.last_accessed else None,
                "days_inactive": (datetime.utcnow() - (r.last_accessed or r.updated_at)).days,
                "access_count": r.access_count if r.access_count else 0
            }
            for r in stale_candidates
        ]
        
        # Use agent to intelligently analyze stale records
        analysis = agent.identify_stale_records_intelligently(records_data)
        
        # Enrich analysis with names
        uuid_to_name = {r["uuid"]: r["name"] for r in records_data}
        
        if "stale_records" in analysis and analysis["stale_records"]:
            for record in analysis["stale_records"]:
                if "uuid" in record:
                    record["name"] = uuid_to_name.get(record["uuid"], "Unknown")
        
        if "important_but_inactive" in analysis and analysis["important_but_inactive"]:
            for record in analysis["important_but_inactive"]:
                if "uuid" in record:
                    record["name"] = uuid_to_name.get(record["uuid"], "Unknown")
        
        return {
            "count": len(records_data),
            "days_threshold": days,
            "analysis": analysis,
            "intelligence": "AI-powered context-aware analysis"
        }
    finally:
        db.close()


@app.get("/api/user-stats")
async def get_user_stats():
    """Get user behavior statistics with intelligent insights"""
    db = SessionLocal()
    try:
        from sqlalchemy import func
        from models import FormInteraction
        
        # Get basic stats
        total_interactions = db.query(func.count(FormInteraction.id)).scalar() or 0
        total_corrections = db.query(func.count(FormInteraction.id)).filter(
            FormInteraction.interaction_type == "correction"
        ).scalar() or 0
        total_views = db.query(func.count(FormInteraction.id)).filter(
            FormInteraction.interaction_type == "view"
        ).scalar() or 0
        
        # Get recent interactions for intelligent analysis
        recent_interactions = db.query(FormInteraction).order_by(
            FormInteraction.timestamp.desc()
        ).limit(50).all()
        
        interactions_data = [
            {
                "field_name": i.field_name,
                "interaction_type": i.interaction_type,
                "original_value": i.original_value,
                "corrected_value": i.corrected_value
            }
            for i in recent_interactions
        ]
        
        # Use agent to analyze behavior patterns
        behavior_analysis = agent.analyze_user_behavior(interactions_data)
        
        return {
            "total_interactions": total_interactions,
            "total_corrections": total_corrections,
            "total_views": total_views,
            "intelligent_analysis": behavior_analysis,
            "intelligence": "AI-powered behavior learning"
        }
    finally:
        db.close()


@app.post("/api/record-interaction")
async def record_interaction(
    uuid: str,
    field_name: str,
    interaction_type: str,
    original_value: Optional[str] = None,
    corrected_value: Optional[str] = None
):
    """Record user interaction for learning"""
    db = SessionLocal()
    try:
        interaction = FormInteraction(
            uuid=uuid,
            field_name=field_name,
            original_value=original_value,
            corrected_value=corrected_value,
            interaction_type=interaction_type
        )
        db.add(interaction)
        db.commit()
        
        return {"status": "recorded", "intelligence": "Learning from your behavior"}
    finally:
        db.close()


@app.post("/api/mark-duplicate")
async def mark_duplicate(duplicate_uuid: str, original_uuid: str):
    """Mark a record as duplicate of another"""
    db = SessionLocal()
    try:
        record = db.query(FormData).filter(FormData.uuid == duplicate_uuid).first()
        if record:
            record.is_duplicate = True
            record.duplicate_of = original_uuid
            db.commit()
        return {"status": "marked", "duplicate_uuid": duplicate_uuid, "original_uuid": original_uuid}
    finally:
        db.close()


@app.put("/api/update-form-data/{uuid}")
async def update_form_data(uuid: str, form_data: Dict[str, Any]):
    """Update form data by UUID"""
    db = SessionLocal()
    try:
        record = db.query(FormData).filter(FormData.uuid == uuid).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="UUID not found")
        
        # Update fields
        if "name" in form_data:
            record.name = form_data["name"]
        if "email" in form_data:
            record.email = form_data["email"]
        if "phone" in form_data:
            record.phone = form_data["phone"]
        if "address" in form_data:
            record.address = form_data["address"]
        if "company" in form_data:
            record.company = form_data["company"]
        if "position" in form_data:
            record.position = form_data["position"]
        if "notes" in form_data:
            record.notes = form_data["notes"]
        
        record.updated_at = datetime.utcnow()
        db.commit()
        
        return {"status": "success", "message": "Record updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    llm_provider = os.getenv("LLM_PROVIDER", "openai").lower()
    return {
        "status": "healthy",
        "llm_provider": llm_provider,
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "lmstudio_enabled": llm_provider == "lmstudio"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
