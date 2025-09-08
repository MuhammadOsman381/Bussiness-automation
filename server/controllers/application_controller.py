from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from models.job import Job
from models.application import Application
from helpers.get_current_user import CurrentUser
from models.user import User

router = APIRouter(prefix="/api/application")

class CreateApplicationPayload(BaseModel):
    job_id: int
    fields: Dict[str, Any]


@router.post("/create")
async def create_application(data: CreateApplicationPayload, user: CurrentUser):
    try:
        job = await Job.get_or_none(id=data.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        existing_application = await Application.get_or_none(user=user, job=job)
        if existing_application:
            raise HTTPException(
                status_code=400, detail="You have already applied for this job"
            )
        new_application = await Application.create(
            user=user, job=job, form_fields=data.fields
        )
        return {
            "message": "Application submitted successfully",
            "application_id": new_application.id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get")
async def get_all_applications():
    applications = await Application.all()
    result = []
    for app in applications:
        user = await User.get_or_none(id=app.user_id)
        result.append({
            "id": app.id,
            "created_at":app.created_at,
            "fields": app.form_fields,  
            "user": user,  
        })
    return {"success": True, "applications": result}

@router.get("/get/{job_id}")
async def get_applications(job_id: int):
    applications = await Application.filter(job_id=job_id)
    if not applications:
        raise HTTPException(status_code=404, detail="No applications found for this job")
    result = []
    for app in applications:
        user = await User.get_or_none(id=app.user_id)
        result.append({
            "id": app.id,
            "created_at":app.created_at,
            "fields": app.form_fields,  
            "user": user,  
        })

    return {"success": True, "applications": result}
