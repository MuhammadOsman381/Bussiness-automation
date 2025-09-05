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
from fastapi import HTTPException
from models.prescreeninterview import PreScreenInterview
from typing import Optional

router = APIRouter(prefix="/api/interview")


class Result(BaseModel):
    qaList: List[Dict[str, Any]]


class CreateInterviewPayload(BaseModel):
    id: int
    question: str
    expectedAnswer: str


class CreateInterviewPayload(BaseModel):
    id: Optional[int] = 0
    question: str
    expectedAnswer: str


class PassOrFail(BaseModel):
    name: str
    email: str
    contact_no: int


@router.post("/create")
async def create_or_edit_prescreen_interview_question(data: CreateInterviewPayload):
    print("data", data)
    if data.id == 0:
        await PreScreenInterview.create(
            question=data.question, expected_output=data.expectedAnswer
        )
        return {"message": "Question added successfully"}
    else:
        existing_question = await PreScreenInterview.get_or_none(id=data.id)
        if not existing_question:
            raise HTTPException(status_code=404, detail="Question not found")
        existing_question.question = data.question
        existing_question.expected_output = data.expectedAnswer
        await existing_question.save()
        return {"message": "Question updated successfully"}


@router.get("/get_questions")
async def get_prescreen_interview_questions():
    interview_questions = await PreScreenInterview.all().values()
    return {"questions": interview_questions}


@router.delete("/delete_question/{id}")
async def delete_prescreen_interview_question(id: str):
    interview_question = await PreScreenInterview.filter(id=id).delete()
    return {"question": interview_question}


@router.post("/pass-or-fail/{status}")
async def pass_or_fail(status: str, user: PassOrFail):
    print("user", user)
    send_result_email(
        user.email,
        "Bussiness Automation",
        status,
        f"https://cal.com/muhammad-osman-rco9zx/15min",
    )
    return {"message": f"Email sent to {user.name} successfully"}


# @router.post("/generate/{job_id}")
# async def generate_questions(job_id: int, user: CurrentUser):
#     job = await Job.get_or_none(id=job_id)
#     if not job:
#         raise HTTPException(status_code=404, detail="Job not found")

#     is_interview_submitted = await Interview.filter(user=user, job=job).first()
#     if is_interview_submitted:
#         raise HTTPException(
#             status_code=400,
#             detail="You have already submitted an interview for this job.",
#         )
#     result = await generate_job_questions(job.title, job.description)
#     return {"questions": result}


@router.post("/check-answers")
async def result(
    data: Result,
    user: CurrentUser,
):
    is_interview_submitted = await Interview.filter(user=user).first()
    if is_interview_submitted:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted an interview for this job.",
        )
    score = await check_answers(data.qaList)
    await Interview.create(
        status=str(score),
        user=user,
        qa=data.qaList,
    )
    return {"message": "Thank you for your time. We will contact you soon."}

@router.get("/get-users")
async def get_users():
    users_with_interviews = await Interview.all().prefetch_related("user")
    if not users_with_interviews:
        raise HTTPException(status_code=404, detail="Interviews not found")
    users = []
    for interview in users_with_interviews:
        user = interview.user
        payload = {
            "id": interview.id,
            "name": user.name,
            "email": user.email,
            "status": interview.status,
            "user_id": user.id,
        }
        users.append(payload)
    return {"users": users}


@router.get("/get-filtered-users/{filter}")
async def get_users(filter: str):
    if filter == "":
        users_with_interviews = await Interview.all().prefetch_related("user")
    else:
        users_with_interviews = await Interview.filter(status=filter).prefetch_related(
            "user",
        )
    users = []
    for interview in users_with_interviews:
        user = interview.user
        payload = {
            "id": interview.id,
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
