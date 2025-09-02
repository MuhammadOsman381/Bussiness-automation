from pydantic import BaseModel
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
import os
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)


class Result(BaseModel):
    status: str


llm = ChatGroq(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0,
    api_key=os.environ.get("GROQ_API_KEY"),
).with_structured_output(Result)


async def check_answers(qaList: List[Dict[str, str]]):
    qa_string = "\n".join(
        [f"Q: {item['question']}\nA: {item['answer']}" for item in qaList]
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                "You are a senior software developer with over 10 years of experience in reviewing technical interviews."
            ),
            HumanMessagePromptTemplate.from_template(
                """You are tasked with reviewing a list of technical interview questions and answers. If all the answers are technically correct and acceptable, return: 'Pass'. 
        Otherwise, return: 'Fail'. Make sure to evaluate the technical correctness of each answer.

        Below are the interview questions and their corresponding answers:
        
        {qa_pairs}

        Respond with either 'Pass' or 'Fail'. Do not add any other responses or explanations.
        """
            ),
        ]
    )

    chain = prompt | llm
    result: Result = await chain.ainvoke({"qa_pairs": qa_string})

    return result.status
