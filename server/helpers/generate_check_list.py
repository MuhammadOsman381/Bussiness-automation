from pydantic import BaseModel, Field
from typing import List
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os

class SingleList(BaseModel):
    list: str

class CheckList(BaseModel):
    array_list: List[SingleList] = Field(..., description="Provide exactly 5 document checklist items.")

llm = ChatGroq(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0,
    api_key=os.environ.get("GROQ_API_KEY"),
).with_structured_output(CheckList)

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are an HR assistant tasked with creating a document checklist based on a job's title and description. "
        "Respond in JSON format with exactly 5 checklist items."
    ),
    HumanMessagePromptTemplate.from_template(
        "Job Title: {title}\nJob Description: {description}"
    ),
])

async def generate_check_list(title: str, description: str) -> List[str]:
    chain = prompt | llm
    result: CheckList = await chain.ainvoke({"title": title, "description": description})
    return result.array_list
