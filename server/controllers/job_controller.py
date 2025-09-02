from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from models.user import User
from models.job import Job
from helpers.get_current_user import CurrentUser
from models.application import Application
from models.interview import Interview

router = APIRouter(prefix="/api/job")

class CreateJobPayload(BaseModel):
    id: int
    title: str
    description: str
    time: str
    fields: List[Dict[str, Any]]


@router.post("/create-or-edit")
async def create_or_edit_job(data: CreateJobPayload, user: CurrentUser):
    try:
        if data.id == 0:
            new_job = await Job.create(
                title=data.title,
                description=data.description,
                time=data.time,
                form_fields=data.fields,
                user=user,
            )
            return {"message": "Job created successfully", "job_id": new_job.id}
        else:
            job = await Job.get_or_none(id=data.id, user=user)
            if not job:
                raise HTTPException(
                    status_code=404, detail="Job not found or not owned by user"
                )
            job.title = data.title
            job.description = data.description
            job.time = data.time
            job.form_fields = data.fields
            await job.save()
            return {"message": "Job updated successfully", "job_id": job.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get")
async def get_jobs():
    jobs = await Job.all()
    return {"jobs": jobs}


@router.get("/get-all")
async def get_all_jobs(user: CurrentUser):
    jobs = await Job.all()
    user_applications = await Application.filter(user_id=user.id).values_list(
        "job_id", flat=True
    )
    interviews = await Interview.filter(user_id=user.id).values_list(
        "job_id", flat=True
    )
    applied_job_ids = set(user_applications)
    interview_job_ids = set(interviews)
    jobs_with_status = []
    for job in jobs:
        job_dict = job.__dict__
        if job.id in interview_job_ids:
            job_dict["status"] = "interview cleared"
        elif job.id in applied_job_ids:
            job_dict["status"] = "application submitted"
        else:
            job_dict["status"] = "available"
        jobs_with_status.append(job_dict)

    return {"jobs": jobs_with_status}


@router.delete("/delete/{job_id}")
async def delete_job(job_id: int):
    job = await Job.filter(id=job_id).delete()
    applicants = await Application.filter(job_id=job_id).delete()
    return {"success": True, "deleted_count": {applicants, job}}


@router.get("/get/{jobID}")
async def get_jobs(jobID: int, user: CurrentUser):
    job = await Job.get_or_none(id=jobID)
    isApplicationFilled = await Application.filter(user=user, job_id=jobID).first()
    isInterViewConducted = await Interview.filter(user=user, job_id=jobID).first()
    return {
        "job": job,
        "application_filled": bool(isApplicationFilled),
        "interview_conducted": bool(isInterViewConducted),
    }
