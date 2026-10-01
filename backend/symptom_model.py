from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base


class SymptomLog(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    symptoms = Column(String, nullable=False)
    response = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)