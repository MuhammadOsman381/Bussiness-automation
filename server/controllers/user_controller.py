from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, EmailStr
from models.user import User
from argon2 import PasswordHasher
import jwt
import os
import datetime
from helpers.get_current_user import CurrentUser
from models.interview import Interview
from models.checklist import CheckList
from models.document import Document

router = APIRouter(prefix="/api/auth")
ph = PasswordHasher()


class SignupPayload(BaseModel):
    name: str = Field(max_length=255, min_length=2)
    email: EmailStr
    password: str = Field(max_length=255, min_length=2)
    contactNo: str = Field(max_length=255, min_length=2)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(max_length=255, min_length=2)


@router.post("/signup")
async def signup(data: SignupPayload):
    user_exists = await User.filter(email=data.email).first()

    if user_exists:
        raise HTTPException(400, "You are already registered. Please Login.")

    await User.create(
        name=data.name,
        email=data.email,
        contact_no=data.contactNo,
        password=ph.hash(data.password),
        type="applicant",
    )

    return {"success": True, "message": "Your account is successfully registered."}


@router.get("/create-admin")
async def signup():
    admin_exists = await User.filter(email="admin@gmail.com").first()
    if admin_exists:
        raise HTTPException(400, "Admin already exists.")
    new_admin = await User.create(
        name="admin",
        email="admin@gmail.com",
        password=ph.hash("123456"),
        type="recruiter",
    )
    return {"success": True, "message": "Admin created succesfully.", "data": new_admin}


@router.post("/login")
async def login(data: LoginPayload):
    user = await User.filter(email=data.email).first()
    if not user:
        raise HTTPException(400, "Invalid email or password.")
    try:
        ph.verify(user.password, data.password)
    except:
        raise HTTPException(400, "Invalid email or password.")
    return {
        "success": True,
        "message": "You're loggedin successfully",
        "token": jwt.encode(
            {"id": user.id, "generated_at": str(datetime.datetime.now())},
            os.environ.get("JWT_SECRET"),
            algorithm="HS256",
        ),
        "userType": user.type,
    }


# @router.get("/get")
# async def get_users():
#     users = await User.filter(type="applicant")
#     return {"success": True, "users": users}


@router.get("/get")
async def get_users():
    users = await User.filter(type="applicant").all()
    
    user_data = []
    for user in users:
        interview = await Interview.filter(user_id=user.id).first()
        doc_count = await CheckList.filter(user_id=user.id,time="available" ).count()
        total_doc = await Document.all().count()
        user_data.append({
            "user": user,
            "interview": interview if interview else "No Interview Found",
            "available_documents": doc_count,
            "total_documents": total_doc
        })

    return {"success": True, "users": user_data}

@router.get("/me")
async def get_users(user: CurrentUser):
    return {"success": True, "users": user}
