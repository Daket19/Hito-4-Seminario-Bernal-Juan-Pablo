# 🎓 Asistente Académico UNAB — RAG

Asistente inteligente basado en arquitectura **RAG (Retrieval Augmented Generation)** para responder preguntas institucionales de la Universidad Andrés Bello, utilizando documentación oficial como fuente de información.

**Asignatura:** TOP 2: ARQUITECTURA DE SW  
**Carrera:** Ingeniería en Computación e Informática — Universidad Andrés Bello  
**Estudiante:** Juan Pablo Seminario Bernal  

---

## 🏗️ Arquitectura

```
Usuario
  ↓
Pregunta
  ↓
Embedding (paraphrase-multilingual-MiniLM-L12-v2)
  ↓
Base Vectorial (ChromaDB) → Búsqueda semántica
  ↓
Recuperación de Contexto (top 4 fragmentos)
  ↓
LLM (Claude API — claude-sonnet-4-6)
  ↓
Respuesta + Fuentes
```

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Backend | FastAPI + Python 3.11 |
| Frontend | React + Vite |
| Embeddings | Sentence Transformers (`paraphrase-multilingual-MiniLM-L12-v2`) |
| Base Vectorial | ChromaDB |
| LLM | Anthropic Claude API (`claude-sonnet-4-6`) |
| Lectura de PDFs | PyPDF2 |

---

## 📂 Estructura del Proyecto

```
rag_react/
├── backend/
│   ├── main.py              # FastAPI — endpoint POST /query
│   ├── indexar.py           # Script de indexación de PDFs
│   ├── requirements.txt
│   ├── .env                 # ANTHROPIC_API_KEY (no incluido en el repo)
│   ├── docs/                # PDFs institucionales indexados
│   ├── chroma_db/           # Base vectorial generada
│   └── src/
│       ├── ingesta.py       # Carga y fragmentación de documentos
│       ├── vectorial.py     # Embeddings y búsqueda semántica
│       └── llm.py           # Integración con Claude API
└── frontend/
    ├── src/
    │   ├── App.jsx          # Interfaz de chat con diseño UNAB
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 📄 Documentos Indexados

- `Reglamento-General-Universidad-Andres-Bello.pdf`
- `Reglamento-de-Conducta-para-la-Convivencia-de-la-Comunidad_.pdf`
- `reglamento-titulos-y-grados.pdf`
- `reglamento-de-alumno-de-pregrado.pdf`
- `calendario-academico-2026-Semestral-Pregrado-1225.pdf`

---

## ⚙️ Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Daket19/rag-unab.git
cd rag-unab
```

### 2. Configurar la API Key

Crear el archivo `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Instalar dependencias del backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Agregar los PDFs

Copiar los documentos institucionales en `backend/docs/`.

### 5. Indexar los documentos

```bash
py -3.11 indexar.py
```

### 6. Levantar el backend

```bash
py -3.11 -m uvicorn main:app --port 8000 --reload
```

### 7. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 8. Levantar el frontend

```bash
npm run dev
```

### 9. Abrir en el navegador

```
http://localhost:5173
```

---

## 🔧 Decisiones Técnicas

| Parámetro | Valor | Justificación |
|---|---|---|
| Chunk size | 1000 caracteres | Permite capturar artículos completos y tablas de fechas |
| Overlap | 100 caracteres | Evita cortar definiciones entre chunks consecutivos |
| Top-k fragmentos | 4 | Balance entre contexto suficiente y no saturar el prompt |
| Similitud mínima | 0.3 | Si ningún fragmento supera este umbral, el sistema indica que no tiene información |

---

## 📋 Requisitos

- Python 3.11
- Node.js 18+
- API Key de Anthropic

---

## 📝 Notas

- Los PDFs institucionales **no están incluidos** en el repositorio por derechos de uso.
- El archivo `.env` con la API Key **no está incluido** por seguridad.
- La carpeta `chroma_db/` se genera automáticamente al ejecutar `indexar.py`.
