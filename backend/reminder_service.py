from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from database import SessionLocal
from medicine_model import Medicine

scheduler = BackgroundScheduler()

TIME_MAP = {
    "Morning": "08:00",
    "Afternoon": "13:00",
    "Evening": "23:45",
    "Night": "21:00",
    "9:00 am": "09:00",
}

def medicine_reminder():
    current_time = datetime.now().strftime("%H:%M")

    print(f"🔎 Checking reminders at: {current_time}")

    db = SessionLocal()

    try:
        medicines = db.query(Medicine).filter(
            Medicine.active == True
        ).all()

        print(f"💊 Active medicines found: {len(medicines)}")

        for medicine in medicines:
            reminder_time = TIME_MAP.get(medicine.time)

            print(
                f"Medicine: {medicine.name} | "
                f"Saved time: {medicine.time} | "
                f"Reminder time: {reminder_time}"
            )

            if reminder_time == current_time:
                print(
                    f"🔔 MEDICINE DUE: {medicine.name} "
                    f"({medicine.time})"
                )

    finally:
        db.close()


def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            medicine_reminder,
            "interval",
            minutes=1,
            id="medicine_reminder",
            replace_existing=True
        )

        scheduler.start()
        print("✅ Reminder scheduler started")