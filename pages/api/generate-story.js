export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { productName, category, style, customPrompt } = req.body;

  const system = `Eres un experto en marketing de Instagram. Generás textos creativos y cortos para Instagram Stories de productos.

REGLAS:
- Respondé SOLO con JSON válido, sin markdown ni texto adicional.
- Los textos deben ser cortos, impactantes y en español.
- El headline no puede superar los 30 caracteres.
- El subtitle no puede superar los 50 caracteres.
- El CTA (call to action) no puede superar los 20 caracteres.
- El hashtag debe ser relevante al producto.

FORMATO DE RESPUESTA:
{"headline":"texto","subtitle":"texto","cta":"texto","hashtags":"#tag1 #tag2 #tag3","gradient":["#color1","#color2"]}

Los colores del gradiente deben combinar bien y ser vibrantes para Instagram.`;

  const userMessage = `Producto: ${productName || "producto"}
Categoría: ${category || "general"}
Estilo: ${style || "moderno"}
${customPrompt ? `Instrucciones adicionales: ${customPrompt}` : ""}

Generá el texto para una Instagram Story de este producto.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      res.status(200).json(parsed);
    } catch {
      res.status(200).json({
        headline: productName || "Nuevo",
        subtitle: "Descubrí lo nuevo",
        cta: "Comprá ahora",
        hashtags: "#nuevo #tendencia",
        gradient: ["#667eea", "#764ba2"],
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
