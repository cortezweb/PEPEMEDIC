# MediBook Cloud — SaaS Multi-Tenant PWA (Cloudflare Pages + Supabase + Railway)

Plataforma **SaaS** para **Clínicas Dentales, Centros de Fisioterapia y Consultorios Médicos** con reservas online 24/7, cobro de señas por QR/Tarjeta y recordatorios automáticos por WhatsApp.

## Estructura de la Arquitectura Híbrida

1. **`/` (Frontend PWA en Cloudflare Pages)**:
   - `/` — Landing comercial del SaaS + Onboarding para registrar nuevas clínicas (`tenants`).
   - `/c/:slug` — Portal público de reservas para pacientes (ej. `/c/sonrisa-dental`, `/c/fisio-activa`).
   - `/admin` — Panel de administración multi-tenant para gestionar agenda, señas, servicios, especialistas y monitoreo del worker en Railway.
2. **`supabase/schema.sql` (Base de Datos Multi-Tenant + RLS)**:
   - Esquema PostgreSQL completo con aislamiento por `tenant_id` mediante Row Level Security (RLS).
3. **`railway-backend/` (Backend Node.js + Express + Cron en Railway)**:
   - Incluye `railway.json` y `Dockerfile` listos para desplegar en Railway.
   - Ejecuta un Cron Job (`node-cron`) cada 15 minutos que consulta las citas de las próximas 24h/2h en Supabase y envía recordatorios automáticos por WhatsApp.

## Ejecución Local Rápida

### 1. Iniciar el Backend de Railway (Puerto 4000)
```bash
cd railway-backend
npm install
npm run dev
```

### 2. Iniciar el Frontend PWA (Puerto 5173)
```bash
npm install
npm run dev
```
