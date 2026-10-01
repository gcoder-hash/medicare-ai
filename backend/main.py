from fastapi import FastAPI
from auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from medicine_routes import router as medicine_router
from water_routes import router as water_router
from symptom_routes import router as symptom_router
from reminder_service import start_scheduler
from water_reminder_service import start_water_scheduler
from push_routes import router as push_router

app = FastAPI(title="MediCare AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(medicine_router)
app.include_router(water_router)
app.include_router(symptom_router)
app.include_router(auth_router)
app.include_router(push_router)
start_scheduler()
start_water_scheduler()

@app.get("/")
def home():
    return {
        "message": "MediCare AI Backend is running!"
    }