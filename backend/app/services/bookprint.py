import os
import httpx
from fastapi import HTTPException


def _get_client() -> httpx.Client:
    api_key = os.getenv("BOOKPRINT_API_KEY")
    base_url = os.getenv("BOOKPRINT_API_BASE_URL", "https://api.sweetbook.com")
    if not api_key:
        raise HTTPException(status_code=500, detail="BOOKPRINT_API_KEY가 설정되지 않았습니다.")
    return httpx.Client(
        base_url=base_url,
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=10.0,
        follow_redirects=True,
    )


def _raise(response: httpx.Response) -> None:
    if response.is_error:
        raise HTTPException(status_code=response.status_code, detail=response.text)


def get_templates() -> dict:
    with _get_client() as client:
        response = client.get("/templates")
        _raise(response)
        return response.json()


def get_template(template_uid: str) -> dict:
    with _get_client() as client:
        response = client.get(f"/templates/{template_uid}")
        _raise(response)
        return response.json()


def get_book_specs() -> dict:
    with _get_client() as client:
        response = client.get("/book-specs")
        _raise(response)
        return response.json()


def get_credits_balance() -> dict:
    with _get_client() as client:
        response = client.get("/credits")
        _raise(response)
        return response.json()


def create_book(payload: dict) -> dict:
    with _get_client() as client:
        response = client.post("/books", json=payload)
        _raise(response)
        return response.json()


def finalize_book(uid: str) -> dict:
    with _get_client() as client:
        response = client.post(f"/books/{uid}/finalization")
        _raise(response)
        return response.json()


def estimate_order(payload: dict) -> dict:
    with _get_client() as client:
        response = client.post("/orders/estimate", json=payload)
        _raise(response)
        return response.json()


def create_order(payload: dict) -> dict:
    with _get_client() as client:
        response = client.post("/orders", json=payload)
        _raise(response)
        return response.json()


def get_order(uid: str) -> dict:
    with _get_client() as client:
        response = client.get(f"/orders/{uid}")
        _raise(response)
        return response.json()


def upload_photo(uid: str, file_bytes: bytes, filename: str, content_type: str) -> dict:
    with _get_client() as client:
        response = client.post(
            f"/books/{uid}/photos",
            files=[("file", (filename, file_bytes, content_type))],
        )
        _raise(response)
        return response.json()


def get_photos(uid: str) -> dict:
    with _get_client() as client:
        response = client.get(f"/books/{uid}/photos")
        _raise(response)
        return response.json()


def add_cover(uid: str, template_uid: str, parameters: str) -> dict:
    with _get_client() as client:
        response = client.post(
            f"/books/{uid}/cover",
            files=[
                ("templateUid", (None, template_uid)),
                ("parameters", (None, parameters)),
            ],
        )
        _raise(response)
        return response.json()


def add_contents(uid: str, template_uid: str, parameters: str, break_before: str | None = None) -> dict:
    with _get_client() as client:
        params = {"breakBefore": break_before} if break_before else None
        response = client.post(
            f"/books/{uid}/contents",
            params=params,
            files=[
                ("templateUid", (None, template_uid)),
                ("parameters", (None, parameters)),
            ],
        )
        _raise(response)
        return response.json()
