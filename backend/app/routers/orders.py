from fastapi import APIRouter
from pydantic import BaseModel
from app.services import bookprint

router = APIRouter()


class OrderItem(BaseModel):
    bookUid: str
    quantity: int


class ShippingInfo(BaseModel):
    recipientName: str
    recipientPhone: str
    postalCode: str
    address1: str
    address2: str | None = None
    memo: str | None = None


class EstimateRequest(BaseModel):
    items: list[OrderItem]


class OrderRequest(BaseModel):
    items: list[OrderItem]
    shipping: ShippingInfo


@router.post("/orders/estimate")
def estimate_order(body: EstimateRequest):
    return bookprint.estimate_order(body.model_dump())


@router.post("/orders")
def create_order(body: OrderRequest):
    return bookprint.create_order(body.model_dump())


@router.get("/orders/{uid}")
def get_order(uid: str):
    return bookprint.get_order(uid)
