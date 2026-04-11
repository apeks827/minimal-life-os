from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pathlib

from .routes import router

app = FastAPI(
    title="Minimal Life OS - v0.2 Durable Task Backend",
    version="0.2.0",
    description="Backend API for durable task-state persistence",
)
app.include_router(router)

STATIC_DIR = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
