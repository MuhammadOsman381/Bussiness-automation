from pydantic import BaseModel
from langchain.chat_models import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.memory import ConversationBufferMemory
import os


image_memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

image_llm = ChatOpenAI(
    model_name="gpt-4.1-mini",
    temperature=1,
    openai_api_key=os.environ.get("OPENAI_API_KEY"),
)

async def image_checker(requirements: str, image_url: str) -> str:
    system_message = SystemMessagePromptTemplate.from_template(
        "You are an expert AI image analyzer. "
        "You receive an image in URL form and a set of requirements. "
        "Your job is to strictly check if the image fulfills all the given requirements. "
        "Do not make assumptions beyond the image. Respond only with 'true' or 'false'."
    )
    human_message = HumanMessagePromptTemplate.from_template(
        "{input}"
    )
    prompt = ChatPromptTemplate.from_messages([system_message, human_message])
    combined_input = f"Requirements:\n{requirements}\n\nImage URL:\n{image_url}"
    chain = prompt | image_llm
    result = await chain.ainvoke(combined_input)
    return result.content.strip().lower()

