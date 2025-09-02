from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from helpers.lifespan import lifespan
from controllers import (
    user_controller,
    job_controller,
    application_controller,
    interview_controller,
    checklist_controller,
)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_controller.router, tags=["User"])
app.include_router(job_controller.router, tags=["Job"])
app.include_router(application_controller.router, tags=["Application"])
app.include_router(interview_controller.router, tags=["Interview"])
app.include_router(checklist_controller.router, tags=["CheckList"])


@app.get("/")
def say_hello():
    return {"message": "Welcome from business automation server!"}
