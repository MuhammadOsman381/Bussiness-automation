from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.memory import ConversationBufferMemory
import os

class Result(BaseModel):
    result: str

# Shared memory for text checks
text_memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# Text LLM
text_llm = ChatGroq(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0,
    api_key=os.environ.get("GROQ_API_KEY"),
).with_structured_output(Result)

async def ai_document_checker(requirements: str, text: str) -> str:
    """
    Checks a document's text against requirements using LLM.
    Returns 'true' or 'false'.
    """
    if not text or text.strip() == "":
        return "false"

    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(
            "You are an AI document checker. "
            "Your job is to verify whether a document is valid for the requested requirements."
        ),
        HumanMessagePromptTemplate.from_template(
            f"Requirements:\n{requirements}\n\n"
            "Document Text:\n{text}\n\n"
            "Answer with result=true if the document matches the requirements AND is not expired. "
            "Otherwise, result=false."
        )
    ])

    chain = prompt | text_llm
    result: Result = await chain.ainvoke({"text": text}, memory=text_memory)
    return result.result
