import chromadb
from sentence_transformers import SentenceTransformer

# Modelo de embeddings: convierte texto en vectores numéricos
# paraphrase-multilingual-MiniLM-L12-v2 → soporta español perfectamente
MODELO_EMBEDDINGS = "paraphrase-multilingual-MiniLM-L12-v2"

def inicializar_modelo():
    """Carga el modelo de embeddings."""
    print("  🔄 Cargando modelo de embeddings...")
    modelo = SentenceTransformer(MODELO_EMBEDDINGS)
    print("  ✅ Modelo cargado")
    return modelo

def inicializar_base_vectorial(ruta: str = "./chroma_db"):
    """Inicializa ChromaDB en disco."""
    cliente = chromadb.PersistentClient(path=ruta)
    coleccion = cliente.get_or_create_collection(
        name="asistente_academico",
        metadata={"hnsw:space": "cosine"}  # similitud coseno para textos
    )
    return coleccion

def indexar_fragmentos(fragmentos: list[dict], modelo, coleccion):
    """
    Genera embeddings para cada fragmento y los guarda en ChromaDB.
    """
    print(f"\n  🔄 Indexando {len(fragmentos)} fragmentos...")
    
    textos = [f["texto"] for f in fragmentos]
    ids = [f["id"] for f in fragmentos]
    metadatos = [{"fuente": f["fuente"]} for f in fragmentos]
    
    # Generar embeddings (vectores) para todos los fragmentos
    embeddings = modelo.encode(textos, show_progress_bar=True).tolist()
    
    # Guardar en ChromaDB en lotes
    batch_size = 100
    for i in range(0, len(textos), batch_size):
        coleccion.add(
            ids=ids[i:i+batch_size],
            documents=textos[i:i+batch_size],
            embeddings=embeddings[i:i+batch_size],
            metadatas=metadatos[i:i+batch_size]
        )
    
    print(f"  ✅ Indexación completa: {coleccion.count()} fragmentos en la base vectorial")

def buscar_fragmentos(pregunta: str, modelo, coleccion, top_k: int = 4) -> list[dict]:
    """
    Convierte la pregunta en embedding y busca los fragmentos más similares.
    Retorna los top_k más relevantes.
    """
    embedding_pregunta = modelo.encode([pregunta]).tolist()
    
    resultados = coleccion.query(
        query_embeddings=embedding_pregunta,
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )
    
    fragmentos_relevantes = []
    for i in range(len(resultados["documents"][0])):
        fragmentos_relevantes.append({
            "texto": resultados["documents"][0][i],
            "fuente": resultados["metadatas"][0][i]["fuente"],
            "similitud": round(1 - resultados["distances"][0][i], 3)
        })
    
    return fragmentos_relevantes
