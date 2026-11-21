import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// React + Tailwind CSS v4.
// base: './' → rutas relativas en la carpeta dist/, así la página funciona en
// cualquier dirección (netlify.app, dominio propio o una subcarpeta).
// Al correr `npm run dev` se abre el navegador solo.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
  },
});
