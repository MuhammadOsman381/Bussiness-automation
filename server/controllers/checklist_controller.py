from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from models.job import Job
from models.checklist import CheckList
from helpers.generate_check_list import generate_check_list
from tortoise import fields, Model

router = APIRouter(prefix="/api/checklist")


class SaveListPayload(BaseModel):
    checkList: List[dict]


@router.post("/generate-list/{job_id}")
async def generate_list(job_id: str):
    job = await Job.get_or_none(id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    existing = await CheckList.filter(job_id=job.id).first()
    if existing:
        return {"list": existing.check_list}
    generated_items = await generate_check_list(job.title, job.description)
    temp_array = [{"list": item.list, "isChecked": False} for item in generated_items]
    check_list = await CheckList.create(check_list=temp_array, job=job)
    return {"list": check_list.check_list}


@router.put("/save/{job_id}")
async def save_list(data: SaveListPayload, job_id: str):
    job = await Job.get_or_none(id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    check_list = await CheckList.get_or_none(job_id=job.id)
    if not check_list:
        raise HTTPException(status_code=404, detail="Checklist not found")
    check_list.check_list = data.checkList
    await check_list.save()
    return {"message": "CheckList saved succesfully", "list": check_list.check_list}
