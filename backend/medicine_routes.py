from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from reminder_service import TIME_MAP

from auth import get_current_user
from database import SessionLocal
import models
from medicine_model import Medicine
from medicine_log_model import MedicineLog

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/medicines")
def add_medicine(
    name: str,
    purpose: str,
    dosage: str,
    time: str,
    food_instruction: str,
    duration: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    medicine = Medicine(
        user_id=current_user.id,
        name=name,
        purpose=purpose,
        dosage=dosage,
        time=time,
        food_instruction=food_instruction,
        duration=duration
    )

    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    return {
        "message": "Medicine added successfully",
        "medicine_id": medicine.id
    }


@router.get("/medicines")
def get_medicines(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id
    ).all()

    return medicines


@router.post("/medicines/{medicine_id}/taken")
def medicine_taken(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()

    if not medicine:
        return {
            "message": "Medicine not found"
        }

    log = MedicineLog(
        medicine_id=medicine_id,
        user_id=current_user.id,
        status="Taken"
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "message": "Medicine marked as Taken",
        "medicine_id": medicine_id,
        "status": "Taken"
    }


@router.post("/medicines/{medicine_id}/skip")
def medicine_skip(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()

    if not medicine:
        return {
            "message": "Medicine not found"
        }

    log = MedicineLog(
        medicine_id=medicine_id,
        user_id=current_user.id,
        status="Skipped"
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "message": "Medicine marked as Skipped",
        "medicine_id": medicine_id,
        "status": "Skipped"
    }

@router.get("/medicines/history")
def medicine_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    history = db.query(MedicineLog).filter(
        MedicineLog.user_id == current_user.id
    ).all()

    return [
        {
            "id": log.id,
            "medicine_id": log.medicine_id,
            "user_id": log.user_id,
            "status": log.status,
            "created_at": log.created_at
        }
        for log in history
    ]


@router.put("/medicines/{medicine_id}")
def update_medicine(
    medicine_id: int,
    name: str,
    purpose: str,
    dosage: str,
    time: str,
    food_instruction: str,
    duration: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()

    if not medicine:
        return {
            "message": "Medicine not found"
        }

    medicine.name = name
    medicine.purpose = purpose
    medicine.dosage = dosage
    medicine.time = time
    medicine.food_instruction = food_instruction
    medicine.duration = duration

    db.commit()
    db.refresh(medicine)

    return {
        "message": "Medicine updated successfully",
        "medicine_id": medicine.id
    }


@router.delete("/medicines/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()

    if not medicine:
        return {
            "message": "Medicine not found"
        }

    db.query(MedicineLog).filter(
        MedicineLog.medicine_id == medicine_id,
        MedicineLog.user_id == current_user.id
    ).delete(synchronize_session=False)

    db.delete(medicine)
    db.commit()

    return {
        "message": "Medicine deleted successfully",
        "medicine_id": medicine_id
    }
@router.get("/medicines/due")
def get_due_medicines(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    current_time = datetime.now().strftime("%H:%M")

    print("CURRENT TIME:", current_time)
    print("TIME MAP:", TIME_MAP)

    medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.active == True
    ).all()

    due_medicines = []

    for medicine in medicines:
        reminder_time = TIME_MAP.get(medicine.time)

        if reminder_time:
            current_dt = datetime.strptime(current_time, "%H:%M")
            reminder_dt = datetime.strptime(reminder_time, "%H:%M")

            difference = (current_dt - reminder_dt).total_seconds()

            if abs(difference) <= 300:
                due_medicines.append({
                    "id": medicine.id,
                    "name": medicine.name,
                    "dosage": medicine.dosage,
                    "time": medicine.time,
                    "food_instruction": medicine.food_instruction
                })

    return due_medicines