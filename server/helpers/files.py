from fastapi import UploadFile
import shutil
import os
from PIL import Image
import uuid
from pathlib import Path
from urllib.parse import urlparse
import os


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


PROJECT_ROOT = Path(__file__).resolve().parent.parent  # change as needed
UPLOAD_DIR = PROJECT_ROOT / "uploads"


def delete_file(file_path_from_db: str) -> bool:
    if not file_path_from_db:
        print("No path provided.")
        return False
    parsed = urlparse(file_path_from_db)
    path_part = parsed.path if parsed.scheme else file_path_from_db
    path_part = path_part.lstrip("/\\")
    candidate = (UPLOAD_DIR / Path(path_part)).resolve()
    try:
        candidate.relative_to(UPLOAD_DIR.resolve())
    except Exception:
        print(f"Unsafe path or path points outside upload dir: {candidate}")
        return False
    print(f"UPLOAD_DIR         : {UPLOAD_DIR.resolve()}")
    print(f"Requested file path: {file_path_from_db}")
    print(f"Resolved full path : {candidate}")
    if candidate.exists() and candidate.is_file():
        try:
            candidate.unlink()
            print(f"Deleted: {candidate}")
            return True
        except PermissionError as e:
            print(f"Permission error when deleting file: {e}")
            return False
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    else:
        print(f"File not found: {candidate}")
        return False
