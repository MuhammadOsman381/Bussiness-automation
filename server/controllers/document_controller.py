from fastapi import APIRouter, HTTPException, Depends, Form
from pydantic import BaseModel
from models.document import Document
from fastapi import APIRouter, UploadFile, File, HTTPException
# import boto3
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
import shutil
import uuid
import os

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


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...), folder_name: str = Form(...)):
    try:
        folder_path = os.path.join(UPLOAD_DIR, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(folder_path, unique_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {
            "success": True,
            "message": f"File '{file.filename}' saved successfully as '{unique_name}'.",
            "file_path": file_path,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
