from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from database import SessionLocal
from water_model import WaterLog
from auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/water")
def add_water(
    amount_ml: float,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    water = WaterLog(
        user_id=current_user.id,
        amount_ml=amount_ml,
        date=date.today()
    )

    db.add(water)
    db.commit()
    db.refresh(water)

    return {
        "message": "Water added successfully",
        "water_id": water.id,
        "amount_ml": water.amount_ml
    }


@router.get("/water")
def get_water(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    water_logs = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.date == date.today()
    ).all()

    total = sum(log.amount_ml for log in water_logs)

    return {
        "date": str(date.today()),
        "total_water_ml": total,
        "logs": water_logs
    }


@router.get("/water/history")
def get_water_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    logs = (
        db.query(WaterLog)
        .filter(WaterLog.user_id == current_user.id)
        .order_by(WaterLog.date.desc())
        .all()
    )

    history = []

    for log in logs:
        history.append({
            "id": log.id,
            "date": str(log.date),
            "amount_ml": log.amount_ml
        })

    return history