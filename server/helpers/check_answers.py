from pydantic import BaseModel
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
import os


class Result(BaseModel):
    score: int

llm = ChatOpenAI(
    model="gpt-4.1",  
    temperature=0,
    api_key=os.environ.get("OPENAI_API_KEY"),
).with_structured_output(Result)


async def check_answers(qaList: List[Dict[str, str]]) -> int:
    qa_string = "\n".join(
        [
            f"Question: {item['question']}\nApplicant Answer: {item['applicant_answer']}\nExpected Answer: {item['expected_answer']}"
            for item in qaList
        ]
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                "You are an interview evaluator AI. Your job is to evaluate whether applicant answers semantically satisfy the expected answers. "
                "Ignore phrasing differences and focus only on whether the meaning and requirements are correctly met."
            ),
            HumanMessagePromptTemplate.from_template(
                """Evaluate the following interview responses.

                Instructions:
                - Evaluate how closely each applicant's answer matches the expected answer.
                - Consider correctness, completeness, and semantic accuracy.
                - Ignore phrasing, synonyms, or extra explanation if the core requirement is satisfied.
                - Score the applicant out of 100 based on overall answer quality.
                - Return only the total score as an integer between 0 and 100.

                {qa_pairs}
                """
            ),
        ]
    )

    chain = prompt | llm
    result: Result = await chain.ainvoke({"qa_pairs": qa_string})
    return result.score
