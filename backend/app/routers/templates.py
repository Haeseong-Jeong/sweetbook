from fastapi import APIRouter
from app.services.bookprint import get_templates, get_template, get_book_specs, get_credits_balance

router = APIRouter()


@router.get("/templates")
def templates():
    return get_templates()


@router.get("/templates/{templateUid}")
def template_detail(templateUid: str):
    return get_template(templateUid)


@router.get("/book-specs")
def book_specs():
    return get_book_specs()


@router.get("/credits")
def credits_balance():
    return get_credits_balance()
