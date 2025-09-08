from fastapi import UploadFile
import shutil
import os
from PIL import Image
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


UPLOAD_DIR = "uploads"

async def upload_file(file: UploadFile, folder_name: str):
    folder_path = os.path.join(UPLOAD_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    name, ext = os.path.splitext(file.filename)
    unique_filename = f"{name}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(folder_path, unique_filename)
    file.file.seek(0)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": unique_filename, "path": file_path}


async def get_file(file_path: str):
    img = Image.open(file_path)
    return img


def delete_file(file_path_from_db: str):
    if file_path_from_db == "":
        return
    full_path = os.path.join("uploads", file_path_from_db)
    if os.path.exists(full_path):
        os.remove(full_path)
        print(f"Deleted: {full_path}")
    else:
        print(f"File not found: {full_path}")
