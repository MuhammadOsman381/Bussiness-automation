from fastapi import UploadFile
import shutil
import os
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def upload_file(file: UploadFile, folder_name: str):
    folder_path = os.path.join(UPLOAD_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, file.filename)
    file.file.seek(0)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "path": file_path}


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
