from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from models.job import Job
from models.checklist import CheckList
from helpers.generate_check_list import generate_check_list
from tortoise import fields, Model
from helpers.get_current_user import CurrentUser
from fastapi import APIRouter, UploadFile, File, Form
from helpers.check_documents import ai_document_checker
from models.document import Document
from helpers.files import get_file
from helpers.check_image import image_checker
import base64
from PIL import Image
import io
import os
from helpers.files import delete_file


router = APIRouter(prefix="/api/checklist")


class SaveListPayload(BaseModel):
    checkList: List[dict]


class CheckDocument(BaseModel):
    id: int
    name: str
    purpose: str
    text: Optional[str] = None
    get: str
    file_path: str


class CheckDocumentsPayload(BaseModel):
    documents: List[CheckDocument]


@router.post("/check-documents")
async def check_documents(data: CheckDocumentsPayload, user: CurrentUser):
    for doc in data.documents:
        file_path = doc.file_path.replace("\\", "/")
        uploads_marker = "uploads/"
        relative_path = (
            file_path.split(uploads_marker, 1)[1]
            if uploads_marker in file_path
            else file_path
        )
        url = f"http://3.91.226.230/backend/files/{relative_path}"

        existing = await CheckList.get_or_none(user=user, document_id=doc.id)
        if existing and existing.status == "available":
            print(f"Skipping {doc.name}, already available.")
            continue
        is_valid = "not_available"
        if doc.get == "object":
            try:
                result = await image_checker(doc.purpose, url)
                print("image_analyzer_repsonse", result)
                if result.strip().upper() == "TRUE":
                    is_valid = "available"
            except Exception as e:
                print(f"Failed to check image {doc.file_path}: {e}")
                is_valid = "not_available"
        else:
            result = await ai_document_checker(doc.purpose, doc.text or "")
            print("doc_reader_repsonse", result)
            if result.strip().lower() == "true":
                is_valid = "available"
            else:
                delete_file(relative_path)
        if existing:
            existing.status = is_valid
            if is_valid == "available":
                existing.file_path = relative_path
            await existing.save()
        else:
            create_data = {
                "status": is_valid,
                "user": user,
                "document_id": doc.id,
            }
            if is_valid == "available":
                create_data["file_path"] = relative_path
            else:
                delete_file(relative_path)
            await CheckList.create(**create_data)

    return {"message": "Documents submitted successfully"}


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
