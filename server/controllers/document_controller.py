from fastapi import APIRouter, HTTPException, Depends, Form
from pydantic import BaseModel
from typing import List, Dict, Any
from models.job import Job
from models.application import Application
from helpers.get_current_user import CurrentUser
from models.user import User
from models.document import Document
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_community.document_loaders import PyPDFLoader
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
import tempfile
import os
from helpers.files import upload_file

router = APIRouter(prefix="/api/document")


class CreateAndUpdateDocumentPayload(BaseModel):
    name: str
    purpose: str
    title: str
    get: str


@router.post("/create-or-edit/{id}")
async def create_and_update_document(id: int, data: CreateAndUpdateDocumentPayload):
    try:
        if id == 0:
            new_document = await Document.create(
                title=data.title,
                name=data.name,
                purpose=data.purpose,
                get=data.get,
            )
            return {
                "message": "Document created successfully",
                "document": new_document,
            }
        else:
            document = await Document.get_or_none(id=id)
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")

            document.title = data.title
            document.name = data.name
            document.purpose = data.purpose
            document.get = data.get
            await document.save()

            return {
                "message": "Document updated successfully",
                "document": document,
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get")
async def get_documents():
    try:
        documents = await Document.all()
        return {
            "documents": documents,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{document_id}")
async def delete_documents(document_id: str):
    try:
        await Document.filter(id=document_id).delete()
        return {
            "message": "Document deleted successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/get-text-from-document")
async def get_text_from_document(
    file: UploadFile = File(...), folder_name: str = Form(...), get: str = Form("text")
):
    try:
        saved_file = await upload_file(file, folder_name)
        text_content = ""

        if get == "text":
            if file.content_type.startswith("image/"):
                image = Image.open(saved_file["path"])
                text_content = pytesseract.image_to_string(image)
            elif file.content_type == "application/pdf":
                loader = PyPDFLoader(saved_file["path"])
                documents = loader.load()
                text_content = "\n".join([doc.page_content for doc in documents])

        return {
            "success": True,
            "file_path": saved_file["path"],
            "text": text_content.strip(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
