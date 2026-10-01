from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

scheduler = BackgroundScheduler()


def water_reminder():
    current_time = datetime.now().strftime("%H:%M")

    print("💧 WATER REMINDER CHECK:", current_time)


def start_water_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            water_reminder,
            "interval",
            minutes=1,
            id="water_reminder",
            replace_existing=True
        )

        scheduler.start()

        print("✅ Water reminder scheduler started")