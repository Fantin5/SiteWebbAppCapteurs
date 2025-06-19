import serial, threading, time, datetime, re, atexit
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

PORT, BAUD = "COM6", 9600
ENVOI_INTERVALLE = 10

app = FastAPI()

origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

lock = threading.Lock()
try:
    ser = serial.Serial(PORT, BAUD, timeout=1)
    print(f"⚡ Port série ouvert sur {PORT} à {BAUD} baud")
except serial.SerialException as e:
    print(f"❌ Impossible d’ouvrir le port série : {e}")
    ser = None

class FanCmd(BaseModel):
    state: str

@app.post("/fan")
def switch_fan(cmd: FanCmd):
    if ser is None:
        return {"ok": False, "msg": "Port série non disponible"}

    state = cmd.state.lower()
    if state not in {"on", "off"}:
        return {"ok": False, "msg": "state must be 'on' or 'off'"}

    message = "FAN:ON" if state == "on" else "FAN:OFF"
    with lock:
        ser.write((message + "\n").encode())
        print(f"📤 Commande envoyée au port série : {message}")

    return {"ok": True, "msg": f"Commande envoyée : {message}"}

@app.websocket("/measure")
async def mesure_stream(ws: WebSocket):
    if ser is None:
        await ws.close()
        return

    await ws.accept()
    last_send = time.time()

    try:
        while True:
            if ser.in_waiting:
                raw = ser.readline().decode(errors="replace").strip()
                if re.fullmatch(r"-?\d+", raw):
                    await ws.send_json({
                        "value": int(raw),
                        "timestamp": datetime.datetime.now().isoformat()
                    })
                    if time.time() - last_send < 0.1:
                        await ws.receive_text()
                    last_send = time.time()
    except Exception as e:
        print(f"❌ Erreur WebSocket : {e}")
    finally:
        await ws.close()

@atexit.register
def close_serial():
    if ser and ser.is_open:
        ser.close()
        print("🔌 Port série fermé proprement")
