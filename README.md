# Format Converter Pro

A powerful, category-based file converter supporting images, videos, and complex document formats. It uses WebAssembly (WASM) for secure client-side image and video conversions, and a robust Node.js backend for advanced document processing.

## Features
- **Image Converter:** Resize and convert between JPG, PNG, WebP, GIF, etc. (Client-side WASM)
- **Video Converter:** Trim and convert between MP4, MKV, AVI, MOV, etc. (Client-side FFmpeg WASM)
- **Document Converter:** Convert complex formats like PDF, DOCX, XLSX, EPUB, etc. (Server-side)
- **Contact Form:** Integrated Web3Forms for seamless user support without a custom backend.
- **Modern UI:** Glassmorphic aesthetics with light/dark theme toggles.

## Project Structure
- `/frontend` - The Vite + Vanilla JS frontend.
- `/backend` - The Node.js + Express backend server.

## Local Development

### Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
The server will run on `http://localhost:3000`.

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`

## Deployment

### Frontend (Vercel)
1. Import this repository into your Vercel account.
2. Select the `frontend` folder as the Root Directory.
3. Framework Preset: `Vite`
4. In Environment Variables, set `VITE_API_URL` to your live Render backend URL (e.g., `https://format-converter-backend.onrender.com`).
5. Click **Deploy**.

### Backend (Render)
1. Import this repository into your Render account.
2. Render will automatically detect the `render.yaml` Blueprint file and set up a Web Service.
3. If setting up manually:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variable: `NODE_ENV` = `production`

## License
MIT
