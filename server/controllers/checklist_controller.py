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
from helpers.get_document_text import get_text

router = APIRouter(prefix="/api/checklist")


class SaveListPayload(BaseModel):
    checkList: List[dict]


class CheckDocument(BaseModel):
    id: int
    name: str
    purpose: str
    get: str
    file_path: str


class CheckDocumentsPayload(BaseModel):
    documents: List[CheckDocument]


SERVER_URL = "https://2f7b9c89b66f.ngrok-free.app/files"


@router.post("/check-documents")
async def check_documents(data: CheckDocumentsPayload, user: CurrentUser):
    available_docs = await CheckList.filter(
        user=user,
        status="available",
    ).all()

    # fine tune model
    if available_docs:
        for doc in available_docs:
            file_path = os.path.join("uploads", doc.file_path.lstrip("/"))
            actual_document = await Document.get_or_none(id=doc.document_id)
            if actual_document:
                if actual_document.get == "text":
                    text_content = await get_text(file_path) if file_path else ""
                    await ai_document_checker(actual_document.purpose, text_content)
                else:
                    image_url = f"{SERVER_URL}{doc.file_path}"
                    await image_checker(actual_document.purpose, image_url)

    # rest of logic
    for doc in data.documents:
        is_checklist_exists = await CheckList.get_or_none(document_id=doc.id)
        if is_checklist_exists and is_checklist_exists.status == "available":
            # file_path = os.path.join(
            #     "uploads", is_checklist_exists.file_path.lstrip("/")
            # )
            # if doc.get == "text":
            #     text_content = await get_text(file_path) if file_path else ""
            #     response = await ai_document_checker(doc.purpose, text_content)
            #     print(f"available doc response {response}")
            # else:
            #     image_url = f"{SERVER_URL}{is_checklist_exists.file_path}"
            #     response = await image_checker(doc.purpose, image_url)
            #     print(f"available image response {response}")
            delete_file(doc.file_path)
            continue
        public_path = None
        if doc.file_path:
            public_path = "/" + doc.file_path.replace("\\", "/").split("uploads/", 1)[1]
        if is_checklist_exists and is_checklist_exists.status == "not_available":
            if doc.get == "text":
                text_content = await get_text(doc.file_path) if doc.file_path else ""
                response = await ai_document_checker(doc.purpose, text_content)
                print(f"AI doc response: {response}")
                if response == "true":
                    await CheckList.filter(document_id=doc.id, user=user).update(
                        status="available", file_path=public_path
                    )
                else:
                    delete_file(doc.file_path)
            else:
                if public_path:
                    image_url = f"{SERVER_URL}{public_path}"
                    response = await image_checker(doc.purpose, image_url)
                    print(f"AI image response: {response}")
                    if response == "true":
                        await CheckList.filter(document_id=doc.id, user=user).update(
                            status="available", file_path=public_path
                        )
                    else:
                        delete_file(doc.file_path)

        else:
            if doc.get == "text":
                text_content = await get_text(doc.file_path) if doc.file_path else ""
                print("doc purpose", doc.purpose)
                response = await ai_document_checker(doc.purpose, text_content)

                print(f"AI doc response: {response}")
                if response == "true":
                    await CheckList.create(
                        document_id=doc.id,
                        user=user,
                        status="available",
                        file_path=public_path,
                    )
                else:
                    await CheckList.create(
                        document_id=doc.id,
                        user=user,
                        status="not_available",
                        file_path="",
                    )
                    delete_file(doc.file_path)
            else:
                if public_path:
                    image_url = f"{SERVER_URL}{public_path}"
                    response = await image_checker(doc.purpose, image_url)
                    print(f"AI image response: {response}")
                    if response == "true":
                        await CheckList.create(
                            document_id=doc.id,
                            user=user,
                            status="available",
                            file_path=public_path,
                        )
                    else:
                        await CheckList.create(
                            document_id=doc.id,
                            user=user,
                            status="not_available",
                            file_path="",
                        )
                        delete_file(doc.file_path)
    return {"message": "Documents submitted successfully"}
