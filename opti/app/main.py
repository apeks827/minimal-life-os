from fastapi import FastAPI

from .routes import router

app = FastAPI(
    title="Minimal Life OS - v0.2 Durable Task Backend",
    version="0.2.0",
    description="Backend API for durable task-state persistence",
)
app.include_router(router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
