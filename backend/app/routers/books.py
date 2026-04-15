import os
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from app.services import bookprint

router = APIRouter()

_AI_IMGS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "docs", "AI_storybook", "imgs")
)
_AI_IMAGE_ORDER = ["cover.png"] + [f"p{i}.png" for i in range(1, 25)]


class CreateBookRequest(BaseModel):
    title: str
    bookSpecUid: str


@router.post("/books")
def create_book(body: CreateBookRequest):
    return bookprint.create_book(body.model_dump())


@router.post("/books/{uid}/cover")
def add_cover(
    uid: str,
    templateUid: str = Form(...),
    parameters: str = Form(...),
):
    return bookprint.add_cover(uid, templateUid, parameters)


@router.post("/books/{uid}/contents")
def add_contents(
    uid: str,
    templateUid: str = Form(...),
    parameters: str = Form(...),
    breakBefore: str | None = None,
):
    return bookprint.add_contents(uid, templateUid, parameters, breakBefore)


@router.post("/books/{uid}/photos")
async def upload_photo(uid: str, file: UploadFile = File(...)):
    file_bytes = await file.read()
    return bookprint.upload_photo(uid, file_bytes, file.filename, file.content_type)


@router.get("/books/{uid}/photos")
def get_photos(uid: str):
    return bookprint.get_photos(uid)


@router.post("/books/{uid}/ai-photos/{filename}")
def upload_single_ai_photo(uid: str, filename: str):
    """AI 동화책 이미지 1장을 서버에서 읽어 업로드하고 fileName 반환"""
    from fastapi import HTTPException
    if filename not in _AI_IMAGE_ORDER:
        raise HTTPException(status_code=400, detail=f"유효하지 않은 파일명: {filename}")
    path = os.path.join(_AI_IMGS_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail=f"AI 이미지 파일 없음: {path}")
    with open(path, "rb") as f:
        result = bookprint.upload_photo(uid, f.read(), filename, "image/png")
    key = (result.get("data") or {}).get("fileName")
    if not key:
        raise HTTPException(status_code=500, detail=f"{filename} 업로드 후 fileName 없음")
    return {"data": {"fileName": key}}


@router.post("/books/{uid}/finalize")
def finalize_book(uid: str):
    return bookprint.finalize_book(uid)
