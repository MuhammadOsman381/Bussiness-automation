from fastapi import APIRouter, HTTPException, Request
from models.job import Job
from helpers.get_current_user import CurrentUser
from helpers.generate_questions import generate_job_questions
from helpers.check_answers import check_answers
from helpers.get_current_user import CurrentUser
from pydantic import BaseModel
from typing import List, Dict, Any
from models.interview import Interview
from models.user import User
from helpers.mail import send_result_email
import requests
import os
import httpx

router = APIRouter(prefix="/api/interview")


class Result(BaseModel):
    qaList: List[Dict[str, Any]]


from fastapi import HTTPException


@router.post("/generate/{job_id}")
async def generate_questions(job_id: int, user: CurrentUser):
    job = await Job.get_or_none(id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    is_interview_submitted = await Interview.filter(user=user, job=job).first()
    if is_interview_submitted:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted an interview for this job.",
        )
    result = await generate_job_questions(job.title, job.description)
    return {"questions": result}


@router.post("/check-answers/{job_id}")
async def result(data: Result, user: CurrentUser, job_id: int):
    job = await Job.get_or_none(id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    status = await check_answers(data.qaList)
    await Interview.create(
        status=status,
        user=user,
        job=job,
    )
    send_result_email(
        user.email,
        "Bussiness Automation",
        status,
        f"https://cal.com/muhammad-osman-rco9zx/15min?metadata[job_id]={job.id}",
    )
    return {"message": "Thank you for your time. We will contact you soon."}


@router.get("/get-users/{job_id}")
async def get_users(job_id: str):
    users_with_interviews = await Interview.filter(job_id=job_id).prefetch_related(
        "user", "job"
    )
    if not users_with_interviews:
        raise HTTPException(status_code=404, detail="Interviews not found")
    
    users = []
    for interview in users_with_interviews:
        user = interview.user
        job = interview.job
        payload = {
            "id": interview.id,
            "job": job.title,
            "name": user.name,
            "email": user.email,
            "status": interview.status,
            "user_id": user.id,
        }
        users.append(payload)

    return {"users": users}


@router.get("/get-filtered-users/{filter}/{job_id}")
async def get_users(filter: str, job_id: str):
    print(filter)
    if filter == "":
        users_with_interviews = await Interview.filter(job_id=job_id).prefetch_related(
            "user", "job"
        )
    else:
        users_with_interviews = await Interview.filter(
            status=filter, job_id=job_id
        ).prefetch_related("user", "job")

    users = []
    for interview in users_with_interviews:
        user = interview.user
        job = interview.job
        payload = {
            "id": interview.id,
            "job": job.title,
            "name": user.name,
            "email": user.email,
            "status": interview.status,
            "user_id": user.id,
        }
        users.append(payload)

    return {"users": users}


@router.get("/booked-slots")
async def get_booked_users():
    CAL_API_KEY = os.environ.get("CAL_API_KEY")
    CAL_API_URL = "https://api.cal.com/v2/bookings"
    headers = {"Authorization": f"Bearer {CAL_API_KEY}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(CAL_API_URL, headers=headers)
    return {"response": response.json()}

