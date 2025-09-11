import mimetypes
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from langchain_community.document_loaders import PyPDFLoader
from pdf2image import convert_from_path
import os


async def get_text(file_path: str) -> str:
    if file_path == "" or None:
        return ""
    try:
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type and mime_type.startswith("image/"):
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        elif mime_type == "application/pdf":
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            extracted_text = "\n".join([doc.page_content for doc in documents])
            if extracted_text.strip():
                return extracted_text.strip()
            images = convert_from_path(file_path)
            ocr_text = []
            for img in images:
                page_text = pytesseract.image_to_string(img)
                if page_text.strip():
                    ocr_text.append(page_text.strip())
            return "\n".join(ocr_text)
        else:
            return "❌ Unsupported file type. Only images & PDFs supported."
    except Exception as e:
        return f"Error: {str(e)}"