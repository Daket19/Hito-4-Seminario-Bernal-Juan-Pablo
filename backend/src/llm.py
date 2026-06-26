import anthropic
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent.parent / ".env")

def generar_respuesta(pregunta: str, fragmentos: list[dict]) -> dict:
    """
    Manda la pregunta + contexto recuperado a Claude y retorna la respuesta.
    Si no hay fragmentos relevantes, indica que no hay información disponible.
    """
    cliente = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    # Caso: pregunta sin respuesta en documentos
    if not fragmentos or all(f["similitud"] < 0.3 for f in fragmentos):
        return {
            "respuesta": "No encontré información suficiente en los documentos disponibles para responder esta pregunta. Te recomiendo consultar directamente con la secretaría académica.",
            "fuentes": [],
            "fragmentos": []
        }
    
    # Construir contexto con los fragmentos recuperados
    contexto = ""
    for i, frag in enumerate(fragmentos, 1):
        contexto += f"\n--- Fragmento {i} (Fuente: {frag['fuente']}, Similitud: {frag['similitud']}) ---\n"
        contexto += frag["texto"] + "\n"
    
    # Prompt para Claude
    prompt = f"""Eres un asistente académico universitario. Tu función es responder preguntas de estudiantes basándote ÚNICAMENTE en la información proporcionada en los fragmentos de documentos institucionales.

REGLAS:
1. Responde solo con información presente en los fragmentos.
2. Si la información no está en los fragmentos, di claramente que no tienes esa información.
3. Cita la fuente documental al final de tu respuesta.
4. Responde en español, de forma clara y directa.

FRAGMENTOS RECUPERADOS:
{contexto}

PREGUNTA DEL ESTUDIANTE:
{pregunta}

RESPUESTA:"""

    mensaje = cliente.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    
    respuesta_texto = mensaje.content[0].text
    fuentes_unicas = list(set(f["fuente"] for f in fragmentos))
    
    return {
        "respuesta": respuesta_texto,
        "fuentes": fuentes_unicas,
        "fragmentos": fragmentos
    }