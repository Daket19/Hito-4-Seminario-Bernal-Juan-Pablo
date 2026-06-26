import os
import PyPDF2

def cargar_pdf(ruta: str) -> str:
    """Lee un PDF y retorna su texto completo."""
    texto = ""
    with open(ruta, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for pagina in reader.pages:
            texto += pagina.extract_text() or ""
    return texto

def cargar_txt(ruta: str) -> str:
    """Lee un TXT o Markdown y retorna su texto."""
    with open(ruta, "r", encoding="utf-8") as f:
        return f.read()

def cargar_documentos(carpeta: str) -> list[dict]:
    """
    Carga todos los documentos PDF, TXT y MD de una carpeta.
    Retorna lista de dicts con 'texto' y 'fuente'.
    """
    documentos = []
    for archivo in os.listdir(carpeta):
        ruta = os.path.join(carpeta, archivo)
        if archivo.endswith(".pdf"):
            texto = cargar_pdf(ruta)
        elif archivo.endswith(".txt") or archivo.endswith(".md"):
            texto = cargar_txt(ruta)
        else:
            continue
        if texto.strip():
            documentos.append({"texto": texto, "fuente": archivo})
            print(f"  ✅ Cargado: {archivo} ({len(texto)} caracteres)")
    return documentos

def fragmentar(documentos: list[dict], chunk_size: int = 1000, overlap: int = 100) -> list[dict]:
    """
    Divide cada documento en fragmentos (chunks) con solapamiento.
    
    chunk_size=1000: fragmentos de ~1000 caracteres, mejor para capturar
    tablas, fechas y secciones completas de reglamentos.
    overlap=100: los últimos 100 caracteres del chunk anterior se repiten
    en el siguiente, para no cortar ideas o artículos a la mitad.
    """
    fragmentos = []
    for doc in documentos:
        texto = doc["texto"]
        fuente = doc["fuente"]
        inicio = 0
        idx = 0
        while inicio < len(texto):
            fin = inicio + chunk_size
            fragmento = texto[inicio:fin]
            if fragmento.strip():
                fragmentos.append({
                    "id": f"{fuente}_chunk{idx}",
                    "texto": fragmento,
                    "fuente": fuente
                })
                idx += 1
            inicio += chunk_size - overlap
    print(f"\n  📄 Total fragmentos generados: {len(fragmentos)}")
    return fragmentos