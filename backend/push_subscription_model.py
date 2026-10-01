from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    endpoint = Column(String, nullable=False)

    p256dh = Column(String, nullable=False)

    auth = Column(String, nullable=False)