from sqlalchemy import Column, Integer, ForeignKey, Date, Float
from database import Base


class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount_ml = Column(Float, nullable=False)
    date = Column(Date, nullable=False)