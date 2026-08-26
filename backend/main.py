"""
Starlette main — WebSocket hub + REST control API.
"""
from __future__ import annotations
import asyncio
import json
from contextlib import asynccontextmanager
from typing import Set
from dataclasses import asdict

from starlette.applications import Starlette
from starlette.websockets import WebSocket, WebSocketDisconnect
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from simulation.engine import engine


# ── WebSocket connection manager ──────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.add(ws)

    def disconnect(self, ws: WebSocket):
        self.active.discard(ws)

    async def broadcast(self, message: str):
        dead = set()
        for ws in list(self.active):
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        self.active -= dead


manager = ConnectionManager()


# ── Lifespan: start simulation on startup ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: Starlette):
    engine.set_broadcast(manager.broadcast)
    engine.start()
    yield
    engine.stop()


middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
]

from starlette.routing import Route, WebSocketRoute

# ── WebSocket endpoint ────────────────────────────────────────────────────────
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send current state immediately on connect
    await websocket.send_text(engine.state.to_json())
    try:
        while True:
            # Receive control commands from client
            raw = await websocket.receive_text()
            try:
                cmd = json.loads(raw)
                if cmd.get("type") == "control":
                    engine.apply_controls(cmd.get("payload", {}))
                elif cmd.get("type") == "acknowledge":
                    engine.alarm_engine.acknowledge(cmd.get("alarm_id", ""))
                elif cmd.get("type") == "acknowledge_all":
                    engine.alarm_engine.acknowledge_all()
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── REST endpoints ────────────────────────────────────────────────────────────
async def post_control(request):
    data = await request.json()
    engine.apply_controls(data.get("payload", {}))
    return JSONResponse({"ok": True})


async def acknowledge_alarm(request):
    alarm_id = request.path_params["alarm_id"]
    ok = engine.alarm_engine.acknowledge(alarm_id)
    return JSONResponse({"ok": ok})


async def acknowledge_all(request):
    engine.alarm_engine.acknowledge_all()
    return JSONResponse({"ok": True})


async def get_history(request):
    return JSONResponse({"history": engine.get_history()})


async def get_alarm_history(request):
    history = engine.alarm_engine.get_history()
    return JSONResponse({"history": [asdict(a) for a in history]})


async def get_state(request):
    return JSONResponse(engine.state.to_dict())


async def health(request):
    return JSONResponse({"status": "ok", "tick": engine.state.tick})


from starlette.staticfiles import StaticFiles

routes = [
    WebSocketRoute("/ws", websocket_endpoint),
    Route("/api/control", post_control, methods=["POST"]),
    Route("/api/acknowledge/{alarm_id}", acknowledge_alarm, methods=["POST"]),
    Route("/api/acknowledge-all", acknowledge_all, methods=["POST"]),
    Route("/api/history", get_history, methods=["GET"]),
    Route("/api/alarms/history", get_alarm_history, methods=["GET"]),
    Route("/api/state", get_state, methods=["GET"]),
    Route("/api/health", health, methods=["GET"]),
]

app = Starlette(debug=True, lifespan=lifespan, middleware=middleware, routes=routes)

# Mount frontend dist
import os
dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")
else:
    print(f"Warning: frontend dist not found at {dist_dir}. Please run 'npm run build' in frontend/")

