# 🥗 CulinaMarket

Premium grocery marketplace dengan AI Concierge yang membantu Anda menemukan resep dan bahan makanan.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)

## ✨ Fitur Utama

- 🤖 **AI Concierge** - Asisten AI yang merekomendasikan resep berdasarkan bahan yang tersedia
- 🛒 **Smart Shopping** - Tambahkan semua bahan resep ke keranjang dalam 1 klik
- 📱 **Responsive Design** - Tampilan optimal di semua perangkat
- 🔍 **Smart Search** - Cari produk dan resep dengan mudah
- 👨‍🍳 **Recipe Management** - Kelola resep dengan info nutrisi lengkap

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn
- Akun [Supabase](https://supabase.com)
- API Key [OpenRouter](https://openrouter.ai) (untuk AI)

### Installation

```bash
# Clone repository
git clone https://github.com/herlian-azis/culinaMarket.git
cd culinaMarket

# Install dependencies
npm install

# Setup environment
cp EXAMPLE_ENV .env.local
# Edit .env.local dengan credentials Anda

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `OPENROUTER_API_KEY` | API key untuk AI Concierge |

## 📁 Project Structure

```
culinaMarket/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── chat/          # AI Concierge API
│   │   ├── products/      # Products CRUD
│   │   └── recipes/       # Recipes CRUD
│   ├── admin/             # Admin dashboard
│   ├── shop/              # Product catalog
│   ├── recipes/           # Recipe pages
│   └── concierge/         # AI Chat interface
├── components/            # React components
├── lib/                   # Utilities & configs
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🤖 AI Concierge

AI Concierge menggunakan model MiMo-V2-Flash melalui OpenRouter untuk:

- **Product Query**: "Ada ayam?" → Menampilkan produk ayam
- **Recipe Query**: "Resep ayam" → Menampilkan resep dengan semua bahan
- **Bilingual**: Mendukung Bahasa Indonesia dan English

## 🌐 Deployment

### Vercel (Recommended)

1. Push ke GitHub
2. Import di [Vercel](https://vercel.com)
3. Tambahkan environment variables
4. Deploy!

Lihat [DEPLOY.md](DEPLOY.md) untuk panduan lengkap.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter (MiMo-V2-Flash)
- **Deployment**: Vercel

## 📄 License

MIT License - lihat [LICENSE](LICENSE) untuk detail.

---

Made with ❤️ by [Herlian Azis](https://github.com/herlian-azis)
