import requests
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from symptom_model import SymptomLog
from auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class SymptomRequest(BaseModel):
    symptoms: str


@router.post("/symptoms")
def analyze_symptoms(
    request: SymptomRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    prompt = f"""
You are MediCare AI, a friendly and calm health guidance assistant.

User message:
{request.symptoms}

Reply naturally, like a helpful health assistant having a conversation.

FORMAT:
- Use short paragraphs.
- Use simple language.
- Do not use Markdown.
- Do not use asterisks (*).
- Do not use hashtags (#).
- Do not use numbered lists.
- Do not use long blocks of text.
- Use simple headings only when they genuinely help.
- Keep the response around 60 to 100 words.
- End with one short question if more information would help.

CONTENT:
- Briefly acknowledge what the user is experiencing.
- Explain a few common possible reasons without diagnosing.
- Give a few safe, practical things the user can try.
- Mention warning signs only when relevant.
- Explain when professional medical help should be considered.

SAFETY:
- This is general health information, not a medical diagnosis.
- Never say the user definitely has a disease.
- Never prescribe medication.
- Never tell the user to start, stop, or change prescription medication.
- If symptoms could be an emergency, clearly recommend urgent medical care.
- Do not recommend or suggest any medication, including over-the-counter pain relievers.
- Do not unnecessarily frighten the user.

Respond only with the final answer to the user.
"""

    result = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "gemma3",
            "prompt": prompt,
            "stream": False
        }
    )

    result.raise_for_status()

    response = result.json()["response"]

    symptom_log = SymptomLog(
        user_id=current_user.id,
        symptoms=request.symptoms,
        response=response
    )

    db.add(symptom_log)
    db.commit()

    return {
        "message": "Symptoms analyzed successfully",
        "symptoms": request.symptoms,
        "guidance": response
    }
@router.get("/symptoms")
def get_symptoms(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    symptoms = db.query(SymptomLog).filter(
        SymptomLog.user_id == current_user.id
    ).all()

    return [
        {
            "id": item.id,
            "symptoms": item.symptoms,
            "response": item.response,
            "created_at": item.created_at
        }
        for item in symptoms
    ]