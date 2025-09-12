from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
import os
from langchain.chains import LLMChain

shared_memory = ConversationBufferMemory(
    memory_key="chat_history", return_messages=True, input_key="content"
)

image_llm = ChatOpenAI(
    model_name="gpt-4o-mini",
    temperature=0,
    api_key=os.environ.get("OPENAI_API_KEY"),
)

async def image_checker(requirements: str, image_url: str) -> str:
    if not requirements or not image_url:
        return "false"

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                "You are an expert AI image analyzer. "
                "You receive an image in URL form and a set of requirements. "
                "Your job is to strictly check if the image fulfills all the given requirements. "
                "Do not make assumptions beyond the image. Respond ONLY with 'true' or 'false'."
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{content}"),
        ]
    )

    chain = LLMChain(
        llm=image_llm,
        prompt=prompt,
        memory=shared_memory,
        verbose=True,
    )

    input_data = f"Requirements: {requirements}\nImage URL: {image_url}"
    result = await chain.ainvoke({"content": input_data}) 
    return result["text"].strip().lower()
