"""
Script para indexar los documentos por primera vez.
Ejecutar UNA sola vez antes de usar el asistente:
    python indexar.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.ingesta import cargar_documentos, fragmentar
from src.vectorial import inicializar_modelo, inicializar_base_vectorial, indexar_fragmentos

def main():
    print("=" * 50)
    print("  INDEXACIÓN DE DOCUMENTOS - Asistente Académico")
    print("=" * 50)
    
    carpeta_docs = "./docs"
    
    if not os.path.exists(carpeta_docs):
        os.makedirs(carpeta_docs)
        print(f"\n⚠️  Carpeta '{carpeta_docs}' creada.")
        print("   Agrega tus PDFs ahí y vuelve a ejecutar este script.")
        return
    
    archivos = [f for f in os.listdir(carpeta_docs) if f.endswith((".pdf", ".txt", ".md"))]
    if not archivos:
        print(f"\n⚠️  No hay documentos en '{carpeta_docs}'.")
        print("   Agrega PDFs de reglamentos UNAB y vuelve a ejecutar.")
        return
    
    print(f"\n📂 Cargando documentos desde '{carpeta_docs}'...")
    documentos = cargar_documentos(carpeta_docs)
    
    print(f"\n✂️  Fragmentando documentos (chunk=1000, overlap=100)...")
    fragmentos = fragmentar(documentos, chunk_size=1000, overlap=100)
    
    print(f"\n🧠 Inicializando modelo de embeddings...")
    modelo = inicializar_modelo()
    
    print(f"\n🗄️  Inicializando base vectorial ChromaDB...")
    coleccion = inicializar_base_vectorial()
    
    print(f"\n📥 Indexando fragmentos en ChromaDB...")
    indexar_fragmentos(fragmentos, modelo, coleccion)
    
    print("\n" + "=" * 50)
    print("  ✅ Indexación completada exitosamente")
    print("  Ahora ejecuta: streamlit run app.py")
    print("=" * 50)

if __name__ == "__main__":
    main()
