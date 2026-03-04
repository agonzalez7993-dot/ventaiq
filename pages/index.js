import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const SUPA_URL = "https://fptqiqfrschdghctjlin.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdHFpcWZyc2NoZGdoY3RqbGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1ODIxMDIsImV4cCI6MjAyMzE1ODEwMn0.hNh9op0ogcSn8Kn-25cUp2NhMWdc88CIIITj1AbH8_I";
const TABLES = ["clientes", "listapedidos", "pedidos"];

const SUGGESTED = [
  { icon: "🏆", label: "Clientes con más pedidos",    q: "Cuáles son los clientes con más pedidos?" },
  { icon: "😴", label: "Sin actividad reciente",      q: "Qué clientes no han comprado recientemente?" },
  { icon: "📦", label: "Productos más vendidos",      q: "Cuáles son los productos más vendidos?" },
  { icon: "📊", label: "Resumen del mes",             q: "Muéstrame un resumen de ventas del mes actual" },
  { icon: "📈", label: "Comparativa mensual",         q: "Cuánto facturé este mes comparado con el anterior?" },
  { icon: "⏳", label: "Pedidos pendientes",          q: "Qué pedidos están pendientes o sin completar?" },
  { icon: "🎯", label: "Ticket promedio",             q: "Dame el ticket promedio por cliente" },
  { icon: "🗓", label: "Últimos 7 días",              q: "Qué clientes compraron en los últimos 7 días?" },
];

async function sbFetch(table) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?limit=500`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
  return r.json();
}

function parseAIResponse(text) {
  const blocks = [];
  const parts = text.split(/<<<JSON>>>/);
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      const clean = part.replace(/<<<END>>>/g, "").trim();
      if (clean) blocks.push({ type: "text", content: clean });
    } else {
      const jsonStr = part.split("<<<END>>>")[0].trim();
      try {
        const j = JSON.parse(jsonStr);
        if (j.table) blocks.push({ type: "table", data: j.table });
        if (j.metrics) blocks.push({ type: "metrics", data: j.metrics });
      } catch (_) {}
    }
  });
  return blocks;
}

function StatusBadge({ val }) {
  const lo = String(val ?? "").toLowerCase();
  const map = {
    pagado:      "bg-green-900/50 text-green-300 border-green-600/40",
    completado:  "bg-green-900/50 text-green-300 border-green-600/40",
    activo:      "bg-green-900/50 text-green-300 border-green-600/40",
    entregado:   "bg-green-900/50 text-green-300 border-green-600/40",
    pendiente:   "bg-yellow-900/50 text-yellow-300 border-yellow-600/40",
    "en proceso":"bg-yellow-900/50 text-yellow-300 border-yellow-600/40",
    enviado:     "bg-blue-900/50 text-blue-300 border-blue-600/40",
    cancelado:   "bg-red-900/50 text-red-300 border-red-600/40",
    rechazado:   "bg-red-900/50 text-red-300 border-red-600/40",
  };
  if (map[lo]) return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] border font-mono ${map[lo]}`}>{val}</span>;
  return <span className="text-white/75">{val ?? "—"}</span>;
}

function DataTable({ headers, rows }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/[0.04]">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-mono text-[10px] tracking-widest uppercase text-white/35 whitespace-nowrap border-b border-white/10">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 whitespace-nowrap">
                  {ci === 0
                    ? <strong className="text-white/95 text-xs">{cell ?? "—"}</strong>
                    : <StatusBadge val={cell} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricsGrid({ metrics }) {
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {metrics.map((m, i) => (
        <div key={i} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">{m.label}</div>
          <div className="font-bold text-xl text-lime-400 leading-tight">{m.value}</div>
          {m.sub && <div className="text-[11px] text-white/35 mt-1">{m.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function TextBlock({ content }) {
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a3e635">$1</strong>')
    .replace(/\n/g, "<br/>");
  return <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: html }} />;
}

function AiMsg({ blocks }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-lime-400 flex-shrink-0 flex items-center justify-center text-sm mt-0.5">🤖</div>
      <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-white/10 px-4 py-3 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.04)" }}>
        {blocks.map((b, i) => {
          if (b.type === "text")    return <TextBlock key={i} content={b.content} />;
          if (b.type === "table")   return <DataTable key={i} headers={b.data.headers} rows={b.data.rows} />;
          if (b.type === "metrics") return <MetricsGrid key={i} metrics={b.data} />;
          return null;
        })}
      </div>
    </div>
  );
}

function UserMsg({ text }) {
  return (
    <div className="flex gap-3 flex-row-reverse">
      <div className="w-8 h-8 rounded-lg bg-sky-400 flex-shrink-0 flex items-center justify-center text-black text-[11px] font-bold mt-0.5">YO</div>
      <div className="max-w-[82%] rounded-2xl rounded-tr-sm border border-lime-400/20 px-4 py-3 text-right" style={{ background: "rgba(163,230,53,0.08)" }}>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 14 }}>{text}</p>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-lime-400 flex-shrink-0 flex items-center justify-center text-sm">🤖</div>
      <div className="rounded-2xl rounded-tl-sm border border-white/10 px-4 py-3 flex gap-1 items-center" style={{ background: "rgba(255,255,255,0.04)" }}>
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 inline-block" style={{ animation: `bounce 1.2s ${i*0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

export default function VentaIQ() {
  const [db, setDb]         = useState({});
  const [schema, setSchema] = useState({});
  const [connStatus, setConnStatus] = useState("connecting");
  const [messages, setMessages]     = useState([]);
  const [history, setHistory]       = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const msgsEnd = useRef(null);

  useEffect(() => {
    (async () => {
      let anyOk = false;
      const newDb = {}, newSchema = {};
      for (const t of TABLES) {
        try {
          const rows = await sbFetch(t);
          newDb[t] = rows;
          newSchema[t] = rows.length > 0 ? Object.keys(rows[0]) : [];
          anyOk = true;
        } catch { newDb[t] = []; newSchema[t] = []; }
      }
      setDb(newDb); setSchema(newSchema);
      if (anyOk) {
        setConnStatus("ok");
        setMessages([{ role:"ai", blocks:[{ type:"text",
          content:`**¡Listo!** Conectado a tu base de datos.\n\n**${newDb.clientes?.length||0}** clientes · **${newDb.pedidos?.length||0}** pedidos · **${newDb.listapedidos?.length||0}** items en listapedidos.\n\nHazme cualquier pregunta sobre tus ventas.`
        }]}]);
      } else {
        setConnStatus("error");
        setMessages([{ role:"ai", blocks:[{ type:"text",
          content:`⚠ No pude leer las tablas de Supabase.\n\nEjecutá en el **SQL Editor de Supabase**:\n\nCREATE POLICY "anon_read" ON clientes FOR SELECT TO anon USING (true);\nCREATE POLICY "anon_read" ON pedidos FOR SELECT TO anon USING (true);\nCREATE POLICY "anon_read" ON listapedidos FOR SELECT TO anon USING (true);`
        }]}]);
      }
    })();
  }, []);

  useEffect(() => { msgsEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  async function send(q) {
    const question = (q || input).trim();
    if (!question || loading) return;
    setInput("");
    setMessages(m => [...m, { role:"user", text:question }]);
    setLoading(true);

    try {
      const schemaDesc = TABLES.map(t => `Tabla "${t}" (${db[t]?.length||0} filas): columnas=[${(schema[t]||[]).join(", ")}]`).join("\n");
      const samples = TABLES.map(t => `"${t}" (muestra ${Math.min((db[t]||[]).length,40)} filas):\n${JSON.stringify((db[t]||[]).slice(0,40))}`).join("\n\n");
      const today = new Date().toLocaleDateString("es-AR",{year:"numeric",month:"long",day:"numeric"});

      const system = `Eres un asistente de ventas inteligente. Analizas datos reales de Supabase y respondes preguntas de vendedores en español.

ESQUEMA REAL DETECTADO:
${schemaDesc}

DATOS REALES:
${samples}

Hoy: ${today}

REGLAS:
- Responde siempre en español.
- Usa SOLO los nombres de columna reales del esquema.
- Para tablas usa exactamente:
<<<JSON>>>
{"table":{"headers":["Col1","Col2"],"rows":[["v1","v2"]]}}
<<<END>>>
- Para métricas clave:
<<<JSON>>>
{"metrics":[{"label":"Etiqueta","value":"$1,000","sub":"detalle"}]}
<<<END>>>
- Mezcla texto libre y bloques JSON libremente.
- Usa **negrita** para destacar datos importantes.
- Formatea montos con separadores de miles.`;

      const newHistory = [...history, { role:"user", content:question }];
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ system, messages: newHistory }),
      });
      const data = await resp.json();
      const answer = data.content?.[0]?.text || "Sin respuesta.";
      const updatedHistory = [...newHistory, { role:"assistant", content:answer }];
      setHistory(updatedHistory.slice(-24));
      setMessages(m => [...m, { role:"ai", blocks: parseAIResponse(answer) }]);
    } catch(e) {
      setMessages(m => [...m, { role:"ai", blocks:[{ type:"text", content:`⚠ Error: ${e.message}` }] }]);
    }
    setLoading(false);
  }

  const statusStyles = {
    connecting: { dot:"#facc15", text:"Conectando..." },
    ok:         { dot:"#a3e635", text:"Conectado" },
    error:      { dot:"#f87171", text:"Error de conexión" },
  }[connStatus];

  return (
    <>
      <Head>
        <title>VentaIQ</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Syne+Mono&family=Mulish:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style global jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; }
        body { background: #0d0e14; color: #e2e3f0; font-family: 'Mulish', sans-serif; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-4px);opacity:1} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2e2f44; border-radius: 2px; }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>

        {/* HEADER */}
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:56, borderBottom:"1px solid rgba(255,255,255,0.08)", background:"rgba(13,14,20,0.96)", backdropFilter:"blur(16px)", flexShrink:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, background:"#a3e635", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne Mono'", fontSize:12, fontWeight:700, color:"#0d0e14" }}>IQ</div>
            <span style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:18, letterSpacing:-0.5 }}>
              Venta<span style={{ color:"#a3e635" }}>IQ</span>
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:statusStyles.dot, display:"inline-block", boxShadow: connStatus==="ok"?"0 0 6px #a3e635":undefined }} />
              <span style={{ fontFamily:"'Syne Mono'", fontSize:11, color:"rgba(255,255,255,0.4)" }}>{statusStyles.text}</span>
            </div>
            {connStatus==="ok" && (
              <button onClick={() => setShowSchema(s=>!s)} style={{ fontFamily:"'Syne Mono'", fontSize:11, padding:"3px 12px", borderRadius:20, border:"1px solid rgba(60,200,255,0.3)", background:"rgba(60,200,255,0.06)", color:"#67e8f9", cursor:"pointer" }}>
                {showSchema ? "Ocultar" : "Ver"} esquema
              </button>
            )}
            <button onClick={() => { setMessages([]); setHistory([]); }} title="Nueva conversación" style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:18, cursor:"pointer", lineHeight:1 }}>↺</button>
          </div>
        </header>

        {/* SCHEMA PANEL */}
        {showSchema && (
          <div style={{ borderBottom:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)", padding:"14px 20px", flexShrink:0, overflowX:"auto" }}>
            <div style={{ display:"flex", gap:28, minWidth:"max-content" }}>
              {TABLES.map(t => (
                <div key={t}>
                  <div style={{ fontFamily:"'Syne Mono'", fontSize:11, color:"#67e8f9", marginBottom:8 }}>
                    ▸ {t} <span style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>({db[t]?.length||0} filas)</span>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {(schema[t]||[]).map((col,i) => (
                      <span key={col} style={{ fontFamily:"'Syne Mono'", fontSize:10, padding:"2px 8px", borderRadius:5, border:`1px solid ${i===0?"rgba(163,230,53,0.35)":"rgba(255,255,255,0.1)"}`, background:i===0?"rgba(163,230,53,0.06)":"rgba(255,255,255,0.04)", color:i===0?"#bef264":"rgba(255,255,255,0.4)" }}>{col}</span>
                    ))}
                    {schema[t]?.length===0 && <span style={{ color:"rgba(255,255,255,0.25)", fontSize:11 }}>Sin acceso / tabla vacía</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BODY */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

          {/* SIDEBAR */}
          <aside style={{ width:230, borderRight:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.01)", display:"flex", flexDirection:"column", padding:"12px 10px", gap:3, overflowY:"auto", flexShrink:0 }}>
            <p style={{ fontFamily:"'Syne Mono'", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", padding:"6px 8px 4px" }}>Sugerencias</p>
            {SUGGESTED.map(s => (
              <button key={s.q} onClick={() => send(s.q)} style={{ display:"flex", alignItems:"flex-start", gap:8, textAlign:"left", padding:"8px 10px", borderRadius:8, border:"1px solid transparent", background:"transparent", color:"rgba(255,255,255,0.55)", cursor:"pointer", fontSize:12.5, fontFamily:"'Mulish',sans-serif", lineHeight:1.4, transition:"all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(163,230,53,0.2)"; e.currentTarget.style.background="rgba(163,230,53,0.04)"; e.currentTarget.style.color="#d9f99d"; e.currentTarget.style.transform="translateX(3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; e.currentTarget.style.transform="translateX(0)"; }}>
                <span style={{ flexShrink:0, marginTop:1 }}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}

            <p style={{ fontFamily:"'Syne Mono'", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", padding:"14px 8px 4px" }}>Registros</p>
            {TABLES.map(t => (
              <div key={t} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", fontSize:12 }}>
                <span style={{ color:"rgba(255,255,255,0.4)" }}>{t}</span>
                <span style={{ fontFamily:"'Syne Mono'", color:"#a3e635", fontSize:13 }}>{db[t]?.length ?? "—"}</span>
              </div>
            ))}
          </aside>

          {/* CHAT */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:18, maxWidth:840, width:"100%", margin:"0 auto" }}>
              {messages.length === 0 && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:14, textAlign:"center" }}>
                  <div style={{ width:68, height:68, borderRadius:18, background:"linear-gradient(135deg,#a3e635,#38bdf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, boxShadow:"0 0 40px rgba(163,230,53,0.2)" }}>🤖</div>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, letterSpacing:-0.5 }}>Asistente de Ventas</h2>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, maxWidth:340, lineHeight:1.65 }}>Conectando a tu base de datos...</p>
                </div>
              )}
              {messages.map((m, i) => m.role==="user" ? <UserMsg key={i} text={m.text} /> : <AiMsg key={i} blocks={m.blocks} />)}
              {loading && <Typing />}
              <div ref={msgsEnd} />
            </div>

            {/* INPUT */}
            <div style={{ flexShrink:0, borderTop:"1px solid rgba(255,255,255,0.08)", padding:"14px 20px 18px", maxWidth:840, width:"100%", margin:"0 auto" }}>
              <div style={{ display:"flex", gap:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"10px 12px", transition:"border-color .2s" }}
                onFocus={e => e.currentTarget.style.borderColor="rgba(163,230,53,0.35)"}
                onBlur={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
                  onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,110)+"px"; }}
                  rows={1} placeholder="Preguntame sobre tus clientes, pedidos o ventas..."
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"rgba(255,255,255,0.9)", fontSize:14, fontFamily:"'Mulish',sans-serif", resize:"none", maxHeight:110, lineHeight:1.5, paddingTop:4 }} />
                <button onClick={send} disabled={loading||!input.trim()}
                  style={{ width:38, height:38, borderRadius:10, background: loading||!input.trim() ? "rgba(255,255,255,0.1)" : "#a3e635", border:"none", color:"#0d0e14", fontWeight:700, fontSize:17, cursor: loading||!input.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", alignSelf:"flex-end", flexShrink:0, transition:"all .15s" }}>↑</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
