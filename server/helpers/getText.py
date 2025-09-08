from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
import os


class Result(BaseModel):
    result: str


text_llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0,
    api_key=os.environ.get("OPENAI_API_KEY"),
).with_structured_output(Result)


async def get_text(file) -> str:
    if not file:
        return ""
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                "You are an AI document reviewer. "
                "Your job is to get the text from the image by performing OCR. "
                "If the image is unclear, blurry, or text cannot be extracted, "
                "return an empty string."
            ),
            HumanMessagePromptTemplate.from_template("Document:\n{file}\n\n"),
        ]
    )
    chain = prompt | text_llm
    result: Result = await chain.ainvoke({"file": file})
    if not result or not result.result.strip():
        return ""
    return result.result.strip()
