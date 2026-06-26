from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
from src.vectorial import inicializar_modelo, inicializar_base_vectorial, buscar_fragmentos
from src.llm import generar_respuesta

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

modelo = None
coleccion = None

@app.on_event("startup")
async def startup():
    global modelo, coleccion
    modelo = inicializar_modelo()
    coleccion = inicializar_base_vectorial()
    print(f"✅ Sistema listo · {coleccion.count()} fragmentos")

class Query(BaseModel):
    question: str

@app.post("/query")
def query(body: Query):
    if not modelo or not coleccion:
        raise HTTPException(503, "Sistema no inicializado")
    fragmentos = buscar_fragmentos(body.question, modelo, coleccion, top_k=4)
    resultado = generar_respuesta(body.question, fragmentos)
    return {
        "answer": resultado["respuesta"],
        "sources": resultado["fuentes"],
        "fragments": [f["texto"] for f in resultado["fragmentos"]]
    }

@app.get("/status")
def status():
    return {"fragmentos": coleccion.count() if coleccion else 0}
