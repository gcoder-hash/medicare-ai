from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    purpose = Column(String)
    dosage = Column(String)
    time = Column(String)
    food_instruction = Column(String)
    duration = Column(String)
    active = Column(Boolean, default=True)