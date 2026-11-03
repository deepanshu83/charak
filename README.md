# Charak Ayurveda

Official web application for **Charak Ayurveda** — Center for Classical Panchakarma, Skin Care, Joint Care & Infertility in Vidyavihar, Pilani, Rajasthan.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Design System with customized CSS variables
- **Icons**: Lucide React
- **Typography**: Cormorant Garamond & Jost (via `next/font/google`)

## Getting Started

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) with your browser.

## Build

To create an optimized production build:
```bash
npm run build
npm start
```

## Admin video testimonial uploads

The admin video uploader converts source videos on the Node.js server to H.264 MP4 before storing them. The server must have `ffmpeg` and `ffprobe` installed, with FFmpeg built with `libx264` and AAC support. Set `FFMPEG_PATH` or `FFPROBE_PATH` if either executable is not on the server's `PATH`.

Source videos may be up to 100 MB; converted videos must fit within 10 MB. Next.js is configured to allow the upload through its middleware. Any upstream reverse proxy must also allow request bodies of at least 105 MB and allow enough time for video conversion (up to three minutes). FFmpeg builds that include `libx264` are GPL-enabled; confirm the selected build is compatible with the deployment's licensing requirements.
