from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
import os

shared_memory = ConversationBufferMemory(
    memory_key="chat_history",
    input_key="content",
    return_messages=True,
)

text_llm = ChatOpenAI(
    model="gpt-4.1",
    temperature=1,
    api_key=os.environ.get("OPENAI_API_KEY"),
)

async def ai_document_checker(requirements: str, text: str) -> bool:
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                "You are an AI document checker. "
                "Compare the requirements against the provided document text. "
                "If ALL requirements are clearly satisfied, return 'true'. "
                "If ANY requirement is missing or not satisfied, return 'false'. "
                "Ignore unrelated details (like dates or formatting) unless explicitly asked. "
                "Output must be exactly 'true' or 'false', nothing else."
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{content}"),
        ]
    )

    chain = LLMChain(
        llm=text_llm,
        prompt=prompt,
        memory=shared_memory,
        verbose=True,
    )

    content = f"Requirements:\n{requirements}\n\nDocument Text:\n{text}"
    result = await chain.ainvoke({"content": content})
    return result["text"].strip().lower()
