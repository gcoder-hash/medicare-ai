from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from auth import get_current_user
from push_subscription_model import PushSubscription

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/push/subscribe")
def subscribe_push(
    endpoint: str,
    p256dh: str,
    auth: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == endpoint
    ).first()

    if existing:
        existing.p256dh = p256dh
        existing.auth = auth
    else:
        subscription = PushSubscription(
            user_id=current_user.id,
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth
        )

        db.add(subscription)

    db.commit()

    return {
        "message": "Push subscription saved successfully"
    }