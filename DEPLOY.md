# CulinaMarket - Vercel Deployment Guide

## ✅ Build Status: PASSED

## 🔧 Environment Variables untuk Vercel

Buka **Vercel Dashboard → Project → Settings → Environment Variables** dan tambahkan:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lyunstahvtccahmuydob.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Anon Key (dari EXAMPLE_ENV) |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | OpenRouter API Key untuk AI Concierge |

> ⚠️ **PENTING**: Jangan gunakan `DATABASE_URL` di Vercel karena sudah menggunakan Supabase REST API.

## 🚀 Cara Deploy

### Option 1: Via Vercel CLI
```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy (dari folder project)
cd /Users/user/Desktop/project2/marketAI
vercel --prod
```

### Option 2: Via GitHub
1. Push project ke GitHub repository
2. Buka [vercel.com](https://vercel.com)
3. Import repository
4. Tambahkan Environment Variables
5. Deploy

## 📁 Files yang Sudah Disiapkan

- ✅ `vercel.json` - Konfigurasi Vercel (region Singapore)
- ✅ `next.config.ts` - Konfigurasi Next.js dengan image domains
- ✅ `.gitignore` - File yang tidak di-push

## 🖼️ Image Domains yang Diizinkan

Semua domain gambar sudah dikonfigurasi di `next.config.ts`:
- image.astronauts.cloud
- ik.imagekit.io
- culinamarket.com
- www.static-src.com
- lyunstahvtccahmuydob.supabase.co
- media.post.rvohealth.io
- cdn.pixabay.com
- commons.wikimedia.org
- img.id.my-best.com
