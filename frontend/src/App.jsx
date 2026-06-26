import React, { useState, useRef, useEffect, useMemo } from "react";

/* ============================================================================
 * Asistente Académico UNAB — chatbot RAG (single-file React component)
 * ----------------------------------------------------------------------------
 * - Sin dependencias externas: solo React.
 * - CSS (fuente Inter + keyframes + scrollbar) inyectado por el propio componente.
 * - Estilos inline para todo lo demás, no requiere Tailwind ni config.
 *
 * Uso:
 *   import App from "./App";
 *   <App apiUrl="http://localhost:8000/query" useDemoFallback />
 * ==========================================================================*/

const COLORS = {
  ink: "#03102C", // azul institucional UNAB
  crimson: "#8B0000", // carmesí UNAB
  bg: "#F8F9FA",
  text: "#1B2533",
};

/* --- CSS global del componente (se inyecta una sola vez) ------------------ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@keyframes unabDot {0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
.unab-root *{box-sizing:border-box}
.unab-scroll::-webkit-scrollbar{width:10px}
.unab-scroll::-webkit-scrollbar-thumb{background:#D5DCE6;border-radius:8px;border:3px solid transparent;background-clip:content-box}
.unab-scroll::-webkit-scrollbar-thumb:hover{background:#C2CBD8;border:3px solid transparent;background-clip:content-box}
.unab-input::placeholder{color:#94A3B8}
`;

function useInjectCss() {
  useEffect(() => {
    const id = "unab-global-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
  }, []);
}

/* --- Respuestas demo (fallback si la API no responde) -------------------- */
function demoAnswer(q) {
  const t = q.toLowerCase();
  if (/certificad|alumno regular|constancia/.test(t)) {
    return {
      answer:
        "Puedes solicitar tu certificado de alumno regular a través del Portal del Estudiante, en la sección «Certificados en línea». El documento se emite de forma gratuita y queda disponible para descarga en formato PDF dentro de 24 horas hábiles. También puedes obtenerlo presencialmente en la Dirección de Registro Académico presentando tu cédula de identidad.",
      sources: ["Reglamento_del_Estudiante_2024.pdf", "Guia_Tramites_Academicos.pdf"],
      fragments: [
        "Art. 14 — El certificado de alumno regular acredita la condición de matrícula vigente del estudiante para el período académico en curso y podrá obtenerse a través de los canales digitales institucionales.",
        "Los certificados solicitados por vía electrónica serán emitidos en un plazo máximo de 24 horas hábiles, sin costo para el estudiante de pregrado.",
      ],
    };
  }
  if (/evaluac|asistencia|nota|aprob|examen|promoci/.test(t)) {
    return {
      answer:
        "El Reglamento de Evaluación establece que la nota mínima de aprobación de una asignatura es 4,0 en la escala de 1,0 a 7,0. Se exige un mínimo de 75% de asistencia para tener derecho a rendir el examen final; bajo ese porcentaje el estudiante reprueba por inasistencia. Las evaluaciones recuperativas proceden solo con justificación formal presentada dentro de 5 días hábiles.",
      sources: ["Reglamento_de_Evaluacion_y_Promocion.pdf"],
      fragments: [
        "Art. 22 — Se considerará aprobada una asignatura cuando el estudiante obtenga una calificación final igual o superior a 4,0 en la escala de 1,0 a 7,0.",
        "Art. 28 — El estudiante que no alcance el 75% de asistencia perderá el derecho a presentarse al examen final y será calificado como reprobado por inasistencia.",
      ],
    };
  }
  if (/posterg|congel|suspend|interrump|pausa/.test(t)) {
    return {
      answer:
        "La postergación de estudios (congelamiento) permite suspender temporalmente tu actividad académica por hasta dos semestres consecutivos. Debes presentar la solicitud en la Dirección de tu Escuela antes del último día de modificación de inscripción del semestre, adjuntando los antecedentes que la justifiquen. Durante este período conservas tu matrícula y la malla curricular vigente al momento de tu ingreso.",
      sources: ["Reglamento_Academico_2024.pdf"],
      fragments: [
        "Art. 35 — El estudiante podrá solicitar la postergación de sus estudios por un máximo de dos semestres académicos consecutivos, manteniendo su condición de alumno regular.",
        "La solicitud deberá presentarse dentro de los plazos establecidos en el calendario académico oficial de cada período.",
      ],
    };
  }
  return {
    answer:
      "Gracias por tu consulta. Según la normativa académica de la UNAB, este tipo de trámite se gestiona a través de la Dirección de Registro Académico y se rige por el Reglamento del Estudiante vigente. Te recomiendo revisar los documentos citados; si me indicas tu carrera o sede, puedo darte una respuesta más específica.",
    sources: ["Reglamento_del_Estudiante_2024.pdf"],
    fragments: [
      "Art. 3 — El presente reglamento norma la relación académica entre la Universidad y sus estudiantes regulares de pregrado en todas sus sedes y modalidades de estudio.",
    ],
  };
}

/* --- Iconos --------------------------------------------------------------- */
function PaperPlane() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"
        fill="#fff"
      />
    </svg>
  );
}

/* --- Badges de fuentes ---------------------------------------------------- */
function SourceBadges({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 13 }}>
      {sources.map((src, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#EEF2F8",
            color: COLORS.ink,
            border: "1px solid #DEE6F1",
            borderRadius: 999,
            padding: "4px 11px 4px 9px",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 12 }}>📄</span>
          {src}
        </span>
      ))}
    </div>
  );
}

/* --- Sección colapsable de fragmentos ------------------------------------ */
function Fragments({ fragments }) {
  const [open, setOpen] = useState(false);
  if (!fragments || fragments.length === 0) return null;
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 13,
          padding: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.ink,
        }}
      >
        <span style={{ fontSize: 10, display: "inline-block", width: 10 }}>{open ? "▾" : "▸"}</span>
        {open ? "Ocultar fragmentos recuperados" : "Ver fragmentos recuperados"}
      </button>
      {open && (
        <div
          style={{
            marginTop: 11,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            borderLeft: `3px solid ${COLORS.crimson}`,
            background: COLORS.bg,
            borderRadius: "0 10px 10px 0",
            padding: "13px 16px",
          }}
        >
          {fragments.map((tx, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#94A3B8",
                }}
              >
                Fragmento {i + 1}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>{tx}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* --- Burbuja de mensaje --------------------------------------------------- */
function Bubble({ msg }) {
  const isBot = msg.role === "bot";
  const bubbleBase = { padding: "14px 18px", maxWidth: "78%", fontSize: 15, lineHeight: 1.6 };
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        width: "100%",
        flexDirection: isBot ? "row" : "row-reverse",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          background: isBot ? COLORS.ink : "#E5E9F0",
          color: isBot ? "#fff" : COLORS.ink,
        }}
      >
        {isBot ? "AA" : "Tú"}
      </div>
      <div
        style={
          isBot
            ? {
                ...bubbleBase,
                background: "#fff",
                color: COLORS.text,
                borderRadius: "4px 16px 16px 16px",
                boxShadow: "0 2px 10px rgba(3,16,44,0.08)",
                border: "1px solid #EDF1F6",
              }
            : {
                ...bubbleBase,
                background: COLORS.ink,
                color: "#fff",
                borderRadius: "16px 4px 16px 16px",
                boxShadow: "0 2px 12px rgba(3,16,44,0.20)",
              }
        }
      >
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
        {isBot && <SourceBadges sources={msg.sources} />}
        {isBot && <Fragments fragments={msg.fragments} />}
      </div>
    </div>
  );
}

/* --- Indicador de escritura (3 puntos) ----------------------------------- */
function TypingIndicator() {
  const dot = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: COLORS.ink,
    animation: "unabDot 1.3s infinite ease-in-out",
  };
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: COLORS.ink,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        AA
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #EDF1F6",
          borderRadius: "4px 16px 16px 16px",
          boxShadow: "0 2px 10px rgba(3,16,44,0.08)",
          padding: "16px 18px",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        <span style={dot} />
        <span style={{ ...dot, animationDelay: "0.18s" }} />
        <span style={{ ...dot, animationDelay: "0.36s" }} />
      </div>
    </div>
  );
}

/* --- Pantalla de bienvenida ---------------------------------------------- */
const SUGGESTIONS = [
  "¿Cómo solicito un certificado de alumno regular?",
  "¿Cuál es el reglamento de evaluación y asistencia?",
  "¿Qué debo hacer para postergar mis estudios?",
];

function Welcome({ onPick }) {
  const [hover, setHover] = useState(-1);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 36 }}>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          background: "#f21e00",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.04em",
          boxShadow: "0 8px 24px rgba(3,16,44,0.22)",
        }}
      >
        UNAB
      </div>
      <h2 style={{ margin: "22px 0 0", fontSize: 23, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.text }}>
        ¿En qué puedo ayudarte hoy?
      </h2>
      <p style={{ margin: "10px 0 0", maxWidth: 460, fontSize: 15, lineHeight: 1.6, color: "#64748B" }}>
        Consulta reglamentos, normativas y trámites académicos
        <br />
        &nbsp;Te respondo citando los documentos oficiales
      </p>
      <div
        style={{
          marginTop: 32,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 12,
        }}
      >
        {SUGGESTIONS.map((text, i) => (
          <button
            key={i}
            onClick={() => onPick(text)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(-1)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
              padding: 16,
              background: "#fff",
              border: `1px solid ${hover === i ? COLORS.crimson : "#EDF1F6"}`,
              borderRadius: 14,
              boxShadow: hover === i ? "0 10px 24px rgba(139,0,0,0.12)" : "0 1px 3px rgba(3,16,44,0.04)",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
              transform: hover === i ? "translateY(-2px)" : "none",
              transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "rgba(139,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              📄
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.45, color: COLORS.text }}>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= *
 * COMPONENTE PRINCIPAL
 * ========================================================================= */
export default function App({ apiUrl = "http://localhost:8000/query", useDemoFallback = true }) {
  useInjectCss();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendHover, setSendHover] = useState(false);
  const chatRef = useRef(null);

  // auto-scroll al final
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function query(q) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      addBot(data.answer, data.sources, data.fragments);
    } catch (e) {
      if (!useDemoFallback) {
        addBot(
          "No fue posible conectar con el servicio de consultas en este momento. Verifica que el servidor esté disponible e inténtalo nuevamente.",
          [],
          []
        );
        return;
      }
      const demo = demoAnswer(q);
      setTimeout(() => addBot(demo.answer, demo.sources, demo.fragments), 850);
    }
  }

  function addBot(text, sources, fragments) {
    setMessages((m) => [
      ...m,
      { id: "b" + Date.now(), role: "bot", text, sources: sources || [], fragments: fragments || [] },
    ]);
    setLoading(false);
  }

  function send(question) {
    const q = (question != null ? question : input).trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { id: "u" + Date.now(), role: "user", text: q }]);
    setInput("");
    setLoading(true);
    query(q);
  }

  return (
    <div
      className="unab-root"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: COLORS.bg,
        color: COLORS.text,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 24px",
          background: COLORS.ink,
          color: "#fff",
          boxShadow: "0 2px 16px rgba(3,16,44,0.22)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.06em",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          UNAB
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>Asistente Académico UNAB</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", fontWeight: 400 }}>
            Consulta reglamentos y normativas
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.10)",
            padding: "6px 13px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#1a8b00",
              boxShadow: "0 0 0 3px rgba(139,0,0,0.24)",
            }}
          />
          En línea
        </div>
      </header>

      {/* CHAT */}
      <main className="unab-scroll" ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {messages.length === 0 && <Welcome onPick={(t) => send(t)} />}
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {loading && <TypingIndicator />}
        </div>
      </main>

      {/* INPUT */}
      <footer
        style={{
          background: "#fff",
          borderTop: "1px solid #EDF1F6",
          padding: "16px 0 18px",
          boxShadow: "0 -2px 14px rgba(3,16,44,0.04)",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: COLORS.bg,
              border: "1px solid #E2E8F0",
              borderRadius: 26,
              padding: "5px 6px 5px 20px",
            }}
          >
            <input
              className="unab-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Escribe tu consulta sobre reglamentos…"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                background: "transparent",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 15,
                color: COLORS.text,
                padding: "11px 0",
              }}
            />
            <button
              onClick={() => send()}
              onMouseEnter={() => setSendHover(true)}
              onMouseLeave={() => setSendHover(false)}
              aria-label="Enviar"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: sendHover ? "#1A2D52" : COLORS.ink,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background .16s ease",
              }}
            >
              <PaperPlane />
            </button>
          </div>
          <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 11.5, color: "#94A3B8" }}>
            Las respuestas se basan en los reglamentos oficiales vigentes. Verifica siempre con tu unidad académica.
          </p>
        </div>
      </footer>
    </div>
  );
}
