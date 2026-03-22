import { useState, useRef, useCallback, useEffect } from "react";
import Head from "next/head";

const TEMPLATES = [
  { id: "modern", label: "Moderno", gradient: ["#667eea", "#764ba2"], textColor: "#fff", accentColor: "#ffd700" },
  { id: "neon", label: "Neón", gradient: ["#0f0c29", "#302b63"], textColor: "#fff", accentColor: "#00ff87" },
  { id: "sunset", label: "Atardecer", gradient: ["#fa709a", "#fee140"], textColor: "#fff", accentColor: "#fff" },
  { id: "minimal", label: "Minimal", gradient: ["#fafafa", "#e8e8e8"], textColor: "#1a1a1a", accentColor: "#ff4757" },
  { id: "bold", label: "Bold", gradient: ["#f12711", "#f5af19"], textColor: "#fff", accentColor: "#fff" },
  { id: "ocean", label: "Océano", gradient: ["#2193b0", "#6dd5ed"], textColor: "#fff", accentColor: "#ffeaa7" },
  { id: "dark", label: "Dark", gradient: ["#0d0d0d", "#1a1a2e"], textColor: "#fff", accentColor: "#a3e635" },
  { id: "pastel", label: "Pastel", gradient: ["#a18cd1", "#fbc2eb"], textColor: "#fff", accentColor: "#fff" },
];

const LAYOUTS = [
  { id: "centered", label: "Centrado" },
  { id: "top", label: "Arriba" },
  { id: "bottom", label: "Abajo" },
  { id: "split", label: "Dividido" },
];

function StoryCanvas({ image, template, layout, headline, subtitle, cta, hashtags, logo, sticker, canvasRef }) {
  const tpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];

  const layoutStyles = {
    centered: { justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px 30px" },
    top: { justifyContent: "flex-start", alignItems: "center", textAlign: "center", padding: "60px 30px 30px" },
    bottom: { justifyContent: "flex-end", alignItems: "center", textAlign: "center", padding: "30px 30px 80px" },
    split: { justifyContent: "flex-end", alignItems: "flex-start", textAlign: "left", padding: "30px 30px 80px" },
  };

  const ls = layoutStyles[layout] || layoutStyles.centered;

  return (
    <div
      ref={canvasRef}
      style={{
        width: 360,
        height: 640,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(135deg, ${tpl.gradient[0]}, ${tpl.gradient[1]})`,
        flexShrink: 0,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}
    >
      {image && (
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={image}
            alt="product"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              ...(layout === "split" ? { objectPosition: "center top" } : {}),
            }}
            crossOrigin="anonymous"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                layout === "bottom" || layout === "split"
                  ? `linear-gradient(to top, ${tpl.gradient[0]}ee 0%, ${tpl.gradient[0]}99 35%, transparent 70%)`
                  : layout === "top"
                  ? `linear-gradient(to bottom, ${tpl.gradient[0]}ee 0%, ${tpl.gradient[0]}99 35%, transparent 70%)`
                  : `linear-gradient(135deg, ${tpl.gradient[0]}cc, ${tpl.gradient[1]}cc)`,
            }}
          />
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          ...ls,
          gap: 12,
        }}
      >
        {logo && (
          <img
            src={logo}
            alt="logo"
            style={{
              width: 60,
              height: 60,
              objectFit: "contain",
              marginBottom: 8,
              ...(layout === "bottom" || layout === "split" ? { position: "absolute", top: 30, left: 30 } : {}),
            }}
            crossOrigin="anonymous"
          />
        )}

        {headline && (
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: tpl.textColor,
              lineHeight: 1.1,
              textShadow: tpl.id === "minimal" ? "none" : "0 2px 20px rgba(0,0,0,0.3)",
              letterSpacing: -0.5,
            }}
          >
            {headline}
          </h1>
        )}

        {subtitle && (
          <p
            style={{
              fontSize: 16,
              color: tpl.textColor,
              opacity: 0.85,
              lineHeight: 1.4,
              fontFamily: "'Mulish', sans-serif",
              fontWeight: 500,
              textShadow: tpl.id === "minimal" ? "none" : "0 1px 10px rgba(0,0,0,0.2)",
              maxWidth: 280,
            }}
          >
            {subtitle}
          </p>
        )}

        {cta && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 24px",
              borderRadius: 50,
              background: tpl.accentColor,
              color: tpl.id === "minimal" ? "#fff" : "#0d0e14",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              marginTop: 8,
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              alignSelf: ls.textAlign === "center" ? "center" : "flex-start",
            }}
          >
            {cta} <span style={{ fontSize: 16 }}>→</span>
          </div>
        )}

        {sticker && (
          <div style={{ fontSize: 48, marginTop: 8 }}>{sticker}</div>
        )}

        {hashtags && (
          <p
            style={{
              fontSize: 11,
              color: tpl.textColor,
              opacity: 0.5,
              fontFamily: "'Syne Mono', monospace",
              marginTop: 8,
              ...(layout === "bottom" || layout === "split" ? {} : { position: "absolute", bottom: 30, left: 30, right: 30, textAlign: "center" }),
            }}
          >
            {hashtags}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Stories() {
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [template, setTemplate] = useState("modern");
  const [layout, setLayout] = useState("centered");
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [logo, setLogo] = useState(null);
  const [sticker, setSticker] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const STICKERS = ["", "🔥", "⭐", "💎", "🛍️", "💯", "✨", "🎯", "💥", "❤️", "🆕"];

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (currentImage >= idx && currentImage > 0) setCurrentImage(currentImage - 1);
  };

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName || "producto",
          category,
          style: template,
          customPrompt,
        }),
      });
      const data = await resp.json();
      if (data.headline) setHeadline(data.headline);
      if (data.subtitle) setSubtitle(data.subtitle);
      if (data.cta) setCta(data.cta);
      if (data.hashtags) setHashtags(data.hashtags);
      if (data.gradient) {
        const match = TEMPLATES.find(
          (t) => t.gradient[0] === data.gradient[0] && t.gradient[1] === data.gradient[1]
        );
        if (!match) {
          TEMPLATES[0] = { ...TEMPLATES[0], gradient: data.gradient };
        }
      }
    } catch (e) {
      console.error("Error generating:", e);
    }
    setGenerating(false);
  };

  const downloadStory = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        width: 360,
        height: 640,
      });
      const link = document.createElement("a");
      link.download = `story-${productName || "producto"}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download error:", e);
    }
    setDownloading(false);
  };

  const downloadAllStories = async () => {
    if (!images.length) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      for (let i = 0; i < images.length; i++) {
        setCurrentImage(i);
        await new Promise((r) => setTimeout(r, 300));
        const canvas = await html2canvas(canvasRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
          width: 360,
          height: 640,
        });
        const link = document.createElement("a");
        link.download = `story-${productName || "producto"}-${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (e) {
      console.error("Download error:", e);
    }
    setDownloading(false);
  };

  return (
    <>
      <Head>
        <title>VentaIQ — Story Generator</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Syne+Mono&family=Mulish:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <style global jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; }
        body { background: #0d0e14; color: #e2e3f0; font-family: 'Mulish', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2e2f44; border-radius: 2px; }
        input, textarea, select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fff;
          font-family: 'Mulish', sans-serif;
          font-size: 13px;
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(163,230,53,0.5);
        }
        select option { background: #1a1a2e; color: #fff; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 56,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(13,14,20,0.96)",
            backdropFilter: "blur(16px)",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#a3e635",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Syne Mono'",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0d0e14",
                }}
              >
                IQ
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
                Venta<span style={{ color: "#a3e635" }}>IQ</span>
              </span>
            </a>
            <span
              style={{
                fontFamily: "'Syne Mono'",
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                marginLeft: 8,
                padding: "3px 10px",
                background: "rgba(163,230,53,0.1)",
                borderRadius: 6,
                border: "1px solid rgba(163,230,53,0.2)",
              }}
            >
              Story Generator
            </span>
          </div>
          <a
            href="/"
            style={{
              fontFamily: "'Syne Mono'",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.2s",
            }}
          >
            ← Asistente
          </a>
        </header>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel - Controls */}
          <aside
            style={{
              width: 340,
              borderRight: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.01)",
              overflowY: "auto",
              padding: 20,
              flexShrink: 0,
            }}
          >
            {/* Upload Images */}
            <Section title="Imágenes de producto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button onClick={() => fileInputRef.current?.click()} style={btnOutline}>
                + Subir imágenes
              </button>
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: currentImage === i ? "2px solid #a3e635" : "2px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#f87171",
                          border: "2px solid #0d0e14",
                          color: "#fff",
                          fontSize: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* AI Generation */}
            <Section title="Generar con IA">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nombre del producto"
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Categoría</option>
                  <option value="ropa">Ropa</option>
                  <option value="calzado">Calzado</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="tecnología">Tecnología</option>
                  <option value="belleza">Belleza</option>
                  <option value="hogar">Hogar</option>
                  <option value="alimentos">Alimentos</option>
                </select>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Instrucciones adicionales (opcional)&#10;Ej: Incluir precio $5.990, tono juvenil..."
                rows={2}
                style={{ marginTop: 8, resize: "vertical" }}
              />
              <button onClick={generateWithAI} disabled={generating} style={{ ...btnPrimary, marginTop: 8 }}>
                {generating ? "Generando..." : "Generar textos con IA"}
              </button>
            </Section>

            {/* Template */}
            <Section title="Plantilla">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: 10,
                      border: template === t.id ? "2px solid #a3e635" : "2px solid rgba(255,255,255,0.1)",
                      background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})`,
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        bottom: 3,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: 8,
                        color: t.textColor,
                        fontFamily: "'Syne Mono'",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Layout */}
            <Section title="Disposición">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 8,
                      border: layout === l.id ? "1px solid #a3e635" : "1px solid rgba(255,255,255,0.1)",
                      background: layout === l.id ? "rgba(163,230,53,0.1)" : "rgba(255,255,255,0.04)",
                      color: layout === l.id ? "#a3e635" : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "'Syne Mono'",
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Texts */}
            <Section title="Textos">
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Título principal" />
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Subtítulo"
                style={{ marginTop: 8 }}
              />
              <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Botón CTA (ej: Comprá ahora)" style={{ marginTop: 8 }} />
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#hashtags"
                style={{ marginTop: 8 }}
              />
            </Section>

            {/* Logo */}
            <Section title="Logo (opcional)">
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => logoInputRef.current?.click()} style={btnOutline}>
                  {logo ? "Cambiar logo" : "+ Subir logo"}
                </button>
                {logo && (
                  <button onClick={() => setLogo(null)} style={{ ...btnOutline, borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
                    Quitar
                  </button>
                )}
              </div>
              {logo && (
                <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: "contain", marginTop: 8, borderRadius: 6 }} />
              )}
            </Section>

            {/* Stickers */}
            <Section title="Sticker">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STICKERS.map((s) => (
                  <button
                    key={s || "none"}
                    onClick={() => setSticker(s)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: sticker === s ? "2px solid #a3e635" : "1px solid rgba(255,255,255,0.1)",
                      background: sticker === s ? "rgba(163,230,53,0.1)" : "rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      fontSize: s ? 18 : 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {s || "—"}
                  </button>
                ))}
              </div>
            </Section>
          </aside>

          {/* Center - Preview */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: 30,
              overflow: "auto",
            }}
          >
            <StoryCanvas
              image={images[currentImage] || null}
              template={template}
              layout={layout}
              headline={headline}
              subtitle={subtitle}
              cta={cta}
              hashtags={hashtags}
              logo={logo}
              sticker={sticker}
              canvasRef={canvasRef}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={downloadStory} disabled={downloading} style={btnPrimary}>
                {downloading ? "Exportando..." : "Descargar Story (1080×1920)"}
              </button>
              {images.length > 1 && (
                <button onClick={downloadAllStories} disabled={downloading} style={btnOutline}>
                  Descargar todas ({images.length})
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
                  disabled={currentImage === 0}
                  style={{ ...btnSmall, opacity: currentImage === 0 ? 0.3 : 1 }}
                >
                  ←
                </button>
                <span style={{ fontFamily: "'Syne Mono'", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {currentImage + 1} / {images.length}
                </span>
                <button
                  onClick={() => setCurrentImage(Math.min(images.length - 1, currentImage + 1))}
                  disabled={currentImage === images.length - 1}
                  style={{ ...btnSmall, opacity: currentImage === images.length - 1 ? 0.3 : 1 }}
                >
                  →
                </button>
              </div>
            )}

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'Syne Mono'", textAlign: "center" }}>
              Formato: 1080 × 1920px (9:16) — Optimizado para Instagram Stories
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p
        style={{
          fontFamily: "'Syne Mono'",
          fontSize: 9,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          marginBottom: 10,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

const btnPrimary = {
  padding: "10px 20px",
  borderRadius: 10,
  background: "#a3e635",
  border: "none",
  color: "#0d0e14",
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  width: "100%",
  transition: "all 0.2s",
};

const btnOutline = {
  padding: "10px 16px",
  borderRadius: 10,
  background: "transparent",
  border: "1px solid rgba(163,230,53,0.3)",
  color: "#a3e635",
  fontFamily: "'Syne Mono'",
  fontSize: 12,
  cursor: "pointer",
  width: "100%",
  transition: "all 0.2s",
};

const btnSmall = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
