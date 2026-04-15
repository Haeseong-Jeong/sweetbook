from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import templates, books, orders

app = FastAPI(title="Sweetbook Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(templates.router)
app.include_router(books.router)
app.include_router(orders.router)

_AI_ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "AI_storybook")
app.mount("/ai-assets", StaticFiles(directory=os.path.abspath(_AI_ASSETS_DIR)), name="ai-assets")


@app.get("/health")
def read_health():
    return {"status": "ok"}
