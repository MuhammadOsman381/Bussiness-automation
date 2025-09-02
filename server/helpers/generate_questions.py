from pydantic import BaseModel, Field
from typing import List
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
import os


class Question(BaseModel):
    question: str = Field(description="Question related to the job to be asked")


class QuestionsResponse(BaseModel):
    questions: List[Question] = Field(description="Provide exactly 5 questions.")


prompt = ChatPromptTemplate.from_template("""You are an HR assistant. Based on the job title and description below,
    generate 5 professional interview questions to ask the candidate.
    Job Title: {title}
    Job Description: {description}
    """)

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable not set")

llm = ChatGroq(
    model="meta-llama/llama-4-scout-17b-16e-instruct", temperature=0, api_key=api_key
).with_structured_output(QuestionsResponse)

chain = prompt | llm


async def generate_job_questions(title: str, description: str):
    result = await chain.ainvoke({"title": title, "description": description})
    return result
