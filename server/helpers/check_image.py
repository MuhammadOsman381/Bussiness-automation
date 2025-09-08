from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,  # 👈 this is needed
)
from langchain_openai import ChatOpenAI
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory
import os

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

image_llm = ChatOpenAI(
    model_name="gpt-4.1-mini",
    temperature=1,
    openai_api_key=os.environ.get("OPENAI_API_KEY"),
)

async def image_checker(requirements: str, image_url: str, session_id: str = "default") -> str:
    system_message = SystemMessagePromptTemplate.from_template(
        "You are an expert AI image analyzer. "
        "You receive an image in URL form and a set of requirements. "
        "Your job is to strictly check if the image fulfills all the given requirements. "
        "Do not make assumptions beyond the image. Respond only with 'true' or 'false'."
    )
    prompt = ChatPromptTemplate.from_messages([
        system_message,
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{input}")
    ])
    chain = RunnableWithMessageHistory(
        runnable=(prompt | image_llm),
        get_session_history=get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
    )
    combined_input = {
        "input": f"Requirements:\n{requirements}\n\nImage URL:\n{image_url}"
    }
    result = await chain.ainvoke(
        combined_input,
        config={"configurable": {"session_id": session_id}}
    )

    return result.content.strip().lower()
