# VentaIQ — Asistente de Ventas con IA

App web para vendedores que consulta datos de Supabase usando lenguaje natural, potenciado por Claude AI.

## Deploy en Vercel (5 pasos)

### 1. Subí el proyecto a GitHub
- Creá un repo nuevo en github.com
- Subí todos estos archivos

### 2. Importá en Vercel
- Entrá a vercel.com → "Add New Project"
- Conectá tu repo de GitHub
- Vercel detecta Next.js automáticamente → clic en Deploy

### 3. Agregá tu API Key de Anthropic
En Vercel → tu proyecto → **Settings → Environment Variables**:
```
ANTHROPIC_API_KEY = sk-ant-tu-clave-aqui
```
Podés obtener tu API key en: console.anthropic.com

### 4. Configurá RLS en Supabase
En el **SQL Editor** de tu proyecto Supabase, ejecutá:
```sql
CREATE POLICY "anon_read" ON clientes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON pedidos FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON listapedidos FOR SELECT TO anon USING (true);
```

### 5. Redesplegá
En Vercel → Deployments → "Redeploy" (para que tome la nueva variable de entorno)

¡Listo! Vercel te da una URL pública que podés compartir con cualquier persona.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
# Editá .env.local con tu API key
npm run dev
```

Abrí http://localhost:3000
