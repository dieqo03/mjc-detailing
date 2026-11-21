import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Check,
  Droplets,
  Wind,
  CircleDot,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

/* ==========================================================================
   DATOS DEL NEGOCIO
   ========================================================================== */

// WhatsApp: código de país + número, sin "+" ni espacios (formato wa.me).
const WHATSAPP_NUMBER = '56996180994';
const WHATSAPP_DISPLAY = '+56 9 9618 0994';
const WHATSAPP_GREETING = 'Hola MJC Detailing, quiero hacer una consulta.';

const INSTAGRAM_URL = 'https://www.instagram.com/mjc.detailing_/';
const INSTAGRAM_HANDLE = '@mjc.detailing_';

// Horario de atención. `short` se usa en el hero; `days` en el footer.
const BUSINESS_HOURS = [
  { days: 'Lunes a viernes', short: 'Lun a vie', hours: '09:00 – 18:00' },
  { days: 'Sábado', short: 'Sáb', hours: '16:00 – 20:00' },
  { days: 'Domingo', short: 'Dom', hours: '10:00 – 19:00' },
];

// Comuna de referencia: solo se muestra en el footer (sin prometer cobertura a domicilio).
const LOCATION = 'San Bernardo, Región Metropolitana, Chile';

/* ==========================================================================
   CONFIGURACIÓN
   ========================================================================== */

// Carpeta de las fotos de productos. Guarda los archivos en  public/images/
// (NO en src/assets): lo que está en public se copia tal cual a la página publicada.
// La ruta es relativa ('./images/') para que funcione en cualquier dirección:
// netlify.app, un dominio propio, una subcarpeta o abriendo index.html directo.
// Si una foto no carga, la tarjeta muestra "Foto próximamente": revisa que el
// archivo esté en public/images y que su nombre sea idéntico al del array
// (minúsculas, guiones y extensión .jpg; en internet SÍ importan las mayúsculas).
const IMAGE_BASE = './images/';

// Logo del hero: guarda el archivo en public/images/logo-principal.webp
// (PNG/WebP con fondo transparente para que se integre sin "parche" cuadrado).
const LOGO_FILE = 'logo-principal.webp';

const CART_STORAGE_KEY = 'mjc-detailing-cart-v1';
const MAX_QTY = 99;

const CATEGORIES = ['Todos', 'Llantas y Neumáticos', 'Interiores', 'Exteriores y Lavado'];

// Opciones del menú "Ordenar por" de la tienda.
const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Menor a mayor precio' },
  { value: 'precio-desc', label: 'Mayor a menor precio' },
];

/* ==========================================================================
   BASE DE DATOS DE PRODUCTOS (igual a la lista de precios oficial)

   - `options`: formatos o promociones; cada uno es un botón con su precio
                (ej. 500cc / 1 Litro, o 1 Unidad / Pack 3 por $2.000).
                `image` (opcional): foto que se muestra al elegir ese botón.
   - `price`:   precio único (sin botones). Si es `null`, la tarjeta muestra
                "Consultar precio" y un botón para preguntar por WhatsApp.
   - `brand`:   marca que aparece en azul sobre el nombre.
   - `images`:  nombres de archivo dentro de public/images (ver IMAGE_BASE).
                Con más de una foto aparecen flechas y puntos para cambiar entre ellas.
                Si el archivo no se encuentra, la tarjeta muestra "Foto próximamente".
   Para agregar un producto nuevo, copia un bloque y cambia los datos.
   ========================================================================== */

const PRODUCTS = [
  /* ---------------------------- Llantas y Neumáticos ---------------------------- */
  {
    id: 'ferrico-xxx',
    name: 'Férrico XXX',
    brand: 'Motor Clean',
    category: 'Llantas y Neumáticos',
    options: [
      { label: '500cc', price: 12000 },
      { label: '1 Litro', price: 20000 },
    ],
    images: ['ferrico-xxx-500cc-1l.jpg', 'ferrico-xxx-spray-1l.jpg'],
  },
  {
    id: 'renov',
    name: 'Renov',
    brand: 'Motor Clean',
    category: 'Llantas y Neumáticos',
    options: [{ label: '500cc', price: 12000 }],
    images: ['renov.jpg'],
  },
  {
    id: 'renovador-neumaticos',
    name: 'Renovador de Neumáticos',
    brand: 'Ciclón',
    category: 'Llantas y Neumáticos',
    options: [
      { label: '1 Litro', price: 4000 },
      { label: '5 Litros', price: 9000 },
    ],
    images: ['renovador-neumaticos-ciclon.jpg'],
  },
  {
    id: 'cepillo-llantas-mango-corto',
    name: 'Cepillo de llantas (Mango corto)',
    category: 'Llantas y Neumáticos',
    price: 4500,
    images: ['cepillo-llantas-mango-corto.jpg'],
  },
  {
    id: 'cepillo-llantas-azul',
    name: 'Cepillo de llantas (Azul)',
    category: 'Llantas y Neumáticos',
    price: 3500,
    images: ['cepillo-llantas-azul.jpg'],
  },
  {
    id: 'aplicadores-neumaticos-esponja',
    name: 'Aplicadores de neumáticos (Esponja)',
    category: 'Llantas y Neumáticos',
    price: 1500,
    images: ['aplicador-neumaticos-esponja.jpg'],
  },

  /* --------------------------------- Interiores --------------------------------- */
  {
    id: 'eco-apc',
    name: 'Eco APC / APC',
    brand: 'Motor Clean',
    category: 'Interiores',
    options: [
      { label: '500cc', price: 6000 },
      { label: '1 Litro', price: 7000 },
      { label: '5 Litros', price: 23000 },
    ],
    images: ['eco-apc.jpg'],
  },
  {
    id: 'tapiz',
    name: 'Tapiz',
    brand: 'Motor Clean',
    category: 'Interiores',
    options: [
      { label: '1 Litro', price: 8000 },
      { label: '5 Litros', price: 25000 },
    ],
    images: ['tapiz.jpg'],
  },
  {
    id: 'plastic-1',
    name: 'Plastic 1',
    brand: 'Motor Clean',
    category: 'Interiores',
    options: [
      { label: '1 Litro', price: 10000 },
      { label: '5 Litros', price: 35000 },
    ],
    images: ['plastic-1.jpg'],
  },
  {
    id: 'perfumes-mc-fresh',
    name: 'Perfumes MC Fresh',
    brand: 'Motor Clean',
    category: 'Interiores',
    options: [
      { label: 'Aromatizantes (MC Fresh / Elegance)', price: 6000, image: 'perfume-black-car-fresh.jpg' },
      { label: 'Luxury Perfume (Envase oscuro 100ml)', price: 10490, image: 'perfume-lema.jpg' },
    ],
    images: [
      'perfume-black-car-fresh.jpg',
      'perfume-elegance-fresh.jpg',
      'perfume-vip-men-fresh.jpg',
      'perfume-lema.jpg',
      'perfume-nuit.jpg',
    ],
  },
  {
    id: 'aromatizantes-cicston',
    name: 'Aromatizantes Cicston',
    category: 'Interiores',
    price: 4000,
    images: ['aromatizantes-cicston.jpg'],
  },
  {
    id: 'aromatizantes-ciclon-540ml',
    name: 'Aromatizantes Ciclón',
    category: 'Interiores',
    options: [{ label: '540ml', price: 4000 }],
    images: ['aromatizantes-ciclon-540ml.jpg'],
  },
  {
    id: 'pinitos-aromaticos',
    name: 'Pinitos Aromáticos',
    category: 'Interiores',
    options: [
      { label: '1 Unidad', price: 800 },
      { label: 'Pack 3 por $2.000', price: 2000 },
    ],
    images: ['pinitos-aromaticos.jpg'],
  },
  {
    id: 'pack-3-cepillos-interiores',
    name: 'Pack 3 Cepillos para Interiores',
    brand: 'Cicston',
    category: 'Interiores',
    price: 6000,
    images: ['pack-cepillos-interiores.jpg'],
  },
  {
    id: 'scrub-pad-soft',
    name: 'Scrub Pad Soft',
    category: 'Interiores',
    options: [
      { label: '1 Unidad', price: 2000 },
      { label: 'Pack 2 por $3.000', price: 3000 },
    ],
    images: ['scrub-pad-soft.jpg'],
  },

  /* ------------------------------ Exteriores y Lavado ------------------------------ */
  {
    id: 'rose-snow-foam',
    name: 'Rose Snow Foam',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 12000 },
      { label: '5 Litros', price: 40000 },
    ],
    images: ['rose-snow-foam.jpg'],
  },
  {
    id: 'ceramic-wash-snow-foam',
    name: 'Ceramic Wash Snow Foam',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 12000 },
      { label: '5 Litros', price: 40000 },
    ],
    images: ['ceramic-wash-snow-foam.jpg'],
  },
  {
    id: 'fluor-snow-foam',
    name: 'Flúor Snow Foam',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 10000 },
      { label: '5 Litros', price: 35000 },
    ],
    images: ['fluor-snow-foam.jpg'],
  },
  {
    id: 'sweet-purple',
    name: 'Sweet Purple',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 8000 },
      { label: '5 Litros', price: 30000 },
    ],
    images: ['sweet-purple.jpg'],
  },
  {
    id: 'car-wash',
    name: 'Car Wash',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 8000 },
      { label: '5 Litros', price: 25000 },
    ],
    images: ['car-wash.jpg'],
  },
  {
    id: 'citric-foam',
    name: 'Citric Foam',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [{ label: '1 Litro', price: 10000 }],
    images: ['citric-foam.jpg'],
  },
  {
    id: 'shampoo-concentrado-ciclon',
    name: 'Shampoo Concentrado Snow Foam',
    brand: 'Ciclón',
    category: 'Exteriores y Lavado',
    options: [{ label: '5 Litros', price: 10000 }],
    images: ['shampoo-concentrado-ciclon.jpg'],
  },
  {
    id: 'quick-detailer',
    name: 'Quick Detailer',
    brand: 'Motor Clean',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 12000 },
      { label: '5 Litros', price: 40000 },
    ],
    images: ['quick-detailer.jpg'],
  },
  {
    id: 'desengrasante-motor-ciclon',
    name: 'Desengrasante de Motor',
    brand: 'Ciclón',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Litro', price: 4000 },
      { label: '5 Litros', price: 10000 },
    ],
    images: ['desengrasante-motor-ciclon.jpg'],
  },
  {
    id: 'cera-carnauba-ciclon',
    name: 'Cera Carnauba',
    brand: 'Ciclón',
    category: 'Exteriores y Lavado',
    options: [{ label: '500ml', price: 4000 }],
    images: ['cera-carnauba-ciclon.jpg'],
  },
  {
    id: 'lanza-snow-foam',
    name: 'Lanza Snow Foam',
    category: 'Exteriores y Lavado',
    price: 21990,
    images: ['lanza-snow-foam.jpg'],
  },
  {
    id: 'toalla-secado-microfibra',
    name: 'Toalla de Secado Microfibra',
    brand: 'Cicston',
    category: 'Exteriores y Lavado',
    price: 20000,
    images: ['toalla-secado-microfibra.jpg'],
  },
  {
    id: 'mopa-microfibra',
    name: 'Mopa de Microfibra',
    category: 'Exteriores y Lavado',
    price: 14990,
    images: ['mopa-microfibra-telescopica.jpg'],
  },
  {
    id: 'guantes-microfibra',
    name: 'Guantes de Microfibra',
    category: 'Exteriores y Lavado',
    price: 4000,
    images: ['guantes-microfibra-doble-cara.jpg'],
  },
  {
    id: 'manopla-microfibra',
    name: 'Manopla de Microfibra',
    brand: 'Cicston',
    category: 'Exteriores y Lavado',
    price: 3500,
    images: ['manopla-microfibra.jpg'],
  },
  {
    id: 'microfibras-cicston',
    name: 'Microfibras',
    brand: 'Cicston',
    category: 'Exteriores y Lavado',
    options: [
      { label: '1 Unidad', price: 1300 },
      { label: 'Pack 2 por $2.200', price: 2200 },
      { label: 'Pack 5 por $5.000', price: 5000 },
    ],
    images: ['panos-microfibra-cicston.jpg'],
  },
  {
    id: 'aplicadores-microfibra',
    name: 'Aplicadores de Microfibra',
    category: 'Exteriores y Lavado',
    options: [
      { label: 'Azul (cerámico)', price: 1700, image: 'aplicador-microfibra-bicolor.jpg' },
      { label: 'Gris (estándar)', price: 1800, image: 'aplicador-microfibra-gris.jpg' },
      { label: 'Pack 2 por $3.000', price: 3000 },
    ],
    images: ['aplicador-microfibra-bicolor.jpg', 'aplicador-microfibra-gris.jpg'],
  },
];

const PRODUCT_MAP = PRODUCTS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

/* ==========================================================================
   SERVICIOS Y GALERÍA
   ========================================================================== */

const SERVICES = [
  {
    id: 'basico',
    name: 'Pack Básico',
    price: 20000,
    summary: 'Para mantener el auto limpio entre detallados.',
    features: ['Lavado exterior', 'Aspirado', 'Limpieza de llantas', 'Limpieza de vidrios'],
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    price: 45000,
    summary: 'Limpieza completa, por dentro y por fuera.',
    features: [
      'Todo lo del Pack Básico',
      'Limpieza de tapiz básica',
      'Acondicionado de plásticos interiores',
      'Cera exterior',
    ],
    highlight: true,
  },
  {
    id: 'abrillantado',
    name: 'Abrillantado',
    price: 60000,
    priceNote: 'Precio referencial',
    summary: 'Devuelve el brillo y la profundidad a la pintura.',
    features: ['Lavado exterior', 'Descontaminado', 'Pulido de un paso'],
    highlight: false,
  },
  {
    id: 'ceramico',
    name: 'Tratamiento Cerámico',
    price: 90000,
    summary: 'Protección de largo plazo para la pintura.',
    features: [
      'Descontaminado de pintura',
      'Corrección de pintura 1 paso',
      'Sellado cerámico con duración de 1 año',
    ],
    highlight: false,
  },
];

// Fotos REALES de trabajos terminados. Mientras esté vacío, la sección Galería
// muestra un acceso directo al Instagram del negocio (donde están los trabajos).
// Para sumar una foto: guárdala en public/images y agrega una línea, por ejemplo:
//   { file: 'trabajo-suv-abrillantado.jpg', title: 'SUV gris', detail: 'Abrillantado' },
const GALLERY_PHOTOS = [];

/* ==========================================================================
   UTILIDADES
   ========================================================================== */

// $12.000 — formato chileno, sin depender de Intl/ICU.
const formatCLP = (n) => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const buildWhatsAppUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const openWhatsApp = (text) => {
  window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
};

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const getUnitPrice = (product, format) => {
  if (product.options && product.options.length) {
    const opt = product.options.find((o) => o.label === format);
    return opt ? opt.price : null;
  }
  return typeof product.price === 'number' ? product.price : null;
};

// Precio "desde" de un producto: el formato más barato, o su precio único.
// Es el mismo que muestra la tarjeta por defecto, así el orden coincide con lo que se ve.
// Devuelve null si el precio aún no está definido (ej. la mopa).
const getSortPrice = (product) => {
  if (product.options && product.options.length) return Math.min(...product.options.map((o) => o.price));
  return typeof product.price === 'number' ? product.price : null;
};

// Comparador para ordenar por precio; los productos sin precio quedan siempre al final.
const byPrice = (dir) => (a, b) => {
  const pa = getSortPrice(a);
  const pb = getSortPrice(b);
  if (pa === null) return pb === null ? 0 : 1;
  if (pb === null) return -1;
  return dir * (pa - pb);
};

// Lee el carrito guardado y lo valida contra el catálogo actual.
const loadCart = () => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && PRODUCT_MAP[l.productId])
      .map((l) => ({
        productId: l.productId,
        format: typeof l.format === 'string' ? l.format : null,
        qty: Math.min(MAX_QTY, Math.max(1, parseInt(l.qty, 10) || 1)),
      }))
      .filter((l) => getUnitPrice(PRODUCT_MAP[l.productId], l.format) !== null);
  } catch (e) {
    return [];
  }
};

/* ==========================================================================
   ESTILOS GLOBALES (animaciones puntuales)
   Las fuentes Inter y Sora se cargan en index.html (<link> en el <head>), así
   llegan en paralelo con el código y el texto no "salta" al cargar la página.
   ========================================================================== */

const GlobalStyles = () => (
  <style>{`
    html { scroll-behavior: smooth; background: #ffffff; }
    body { background: #ffffff; margin: 0; }
    .mjc-root { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
    .mjc-display { font-family: 'Sora', 'Inter', ui-sans-serif, system-ui, sans-serif; }
    .mjc-rise { animation: mjc-rise .9s cubic-bezier(.2,.7,.2,1) .15s both; }
    @keyframes mjc-rise { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: none; } }
    .mjc-pop { animation: mjc-pop .35s ease-out; }
    @keyframes mjc-pop { 0% { transform: scale(.6); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
    .mjc-drawer { animation: mjc-drawer .25s ease-out; }
    @keyframes mjc-drawer { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .mjc-fade { animation: mjc-fade .2s ease-out; }
    @keyframes mjc-fade { from { opacity: 0; } to { opacity: 1; } }
    .mjc-scroll-x { scrollbar-width: none; }
    .mjc-scroll-x::-webkit-scrollbar { display: none; }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .mjc-rise, .mjc-pop, .mjc-drawer, .mjc-fade { animation: none; }
      .mjc-root * { transition-duration: .01ms !important; }
    }
  `}</style>
);

/* ==========================================================================
   LOGOS E ÍCONOS PROPIOS
   ========================================================================== */

// Mini-logo tipográfico para el header y el footer.
function MiniLogo() {
  return (
    <span
      aria-hidden="true"
      className="inline-block -skew-x-12 rounded-[3px] bg-blue-600 px-2.5 py-0.5 shadow-sm shadow-blue-600/20"
    >
      <span className="mjc-display block text-[15px] font-extrabold leading-6 tracking-tight text-white">MJC</span>
    </span>
  );
}

// Ícono de Instagram en SVG propio (lucide-react ya no incluye íconos de marcas).
function InstagramIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/* ==========================================================================
   IMAGEN DE PRODUCTO (con placeholder y galería)
   ========================================================================== */

const CATEGORY_ICON = {
  'Llantas y Neumáticos': CircleDot,
  Interiores: Wind,
  'Exteriores y Lavado': Droplets,
};

// `activeImage`: foto del formato elegido (option.image). Al cambiar de botón,
// la galería salta a esa foto; las flechas siguen permitiendo ver todas.
function ProductImage({ product, activeImage }) {
  const images = product.images || [];
  const [idx, setIdx] = useState(() => Math.max(0, images.indexOf(activeImage)));
  const [failed, setFailed] = useState({});

  useEffect(() => {
    const i = images.indexOf(activeImage);
    if (i >= 0) setIdx(i);
  }, [activeImage, product.images]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = images[idx];
  const showPlaceholder = !current || failed[current];
  const Icon = CATEGORY_ICON[product.category] || Droplets;
  const go = (delta) => setIdx((i) => (i + delta + images.length) % images.length);

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white sm:aspect-square">
      {showPlaceholder ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50"
          role="img"
          aria-label={`${product.name}: foto próximamente`}
        >
          <div className="rounded-full bg-blue-50 p-4 text-blue-600">
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
          <span className="text-xs font-medium text-gray-500">Foto próximamente</span>
        </div>
      ) : (
        <img
          src={IMAGE_BASE + current}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed((f) => ({ ...f, [current]: true }))}
          className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {images.length > 1 && !showPlaceholder && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow ring-1 ring-black/5 transition-opacity hover:bg-white focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
            className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow ring-1 ring-black/5 transition-opacity hover:bg-white focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                aria-current={i === idx}
                className="rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span
                  className={`block h-2 w-2 rounded-full transition-colors ${
                    i === idx ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ==========================================================================
   TARJETA DE PRODUCTO
   ========================================================================== */

function ProductCard({ product, onAdd }) {
  const hasOptions = Array.isArray(product.options) && product.options.length > 0;
  const multiOptions = hasOptions && product.options.length > 1;
  const [optIdx, setOptIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const option = hasOptions ? product.options[optIdx] : null;
  const unitPrice = option ? option.price : product.price;
  // Sin precio definido (price: null) la tarjeta pasa a modo "Consultar precio".
  const priceKnown = typeof unitPrice === 'number';

  const handleAdd = () => {
    onAdd(product.id, option ? option.label : null, qty);
    setAdded(true);
    setQty(1);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="flex flex-col">
      <ProductImage product={product} activeImage={option ? option.image : undefined} />

      <div className="mt-4 flex flex-1 flex-col">
        {product.brand && <p className="text-xs font-semibold text-blue-600">{product.brand}</p>}
        <h3 className="mt-0.5 text-base font-semibold leading-snug text-slate-900">{product.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{product.category}</p>

        {/* Selector de formato */}
        {hasOptions && (
          <div className="mt-4">
            {multiOptions ? (
              <div role="group" aria-label={`Formato de ${product.name}`} className="flex flex-wrap gap-2">
                {product.options.map((opt, i) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setOptIdx(i)}
                    aria-pressed={i === optIdx}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      i === optIdx
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-slate-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="inline-block rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                {option.label}
              </span>
            )}
          </div>
        )}

        {/* Precio + cantidad */}
        {priceKnown ? (
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="mjc-display text-2xl font-bold text-slate-900" aria-live="polite">
                {formatCLP(unitPrice)}
              </p>
              {qty > 1 && <p className="text-xs text-slate-500">Subtotal {formatCLP(unitPrice * qty)}</p>}
            </div>

            <div className="flex items-center rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label={`Restar una unidad de ${product.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-slate-900" aria-label={`Cantidad: ${qty}`}>
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                disabled={qty >= MAX_QTY}
                aria-label={`Sumar una unidad de ${product.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-5">
            <p className="mjc-display text-xl font-bold text-slate-900">Consultar precio</p>
          </div>
        )}

        {!priceKnown ? (
          <button
            type="button"
            onClick={() => openWhatsApp(`Hola MJC Detailing, quiero consultar el precio de: ${product.name}.`)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Consultar por WhatsApp
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              added ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Añadido
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Añadir al carrito
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

/* ==========================================================================
   HEADER
   ========================================================================== */

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'tienda', label: 'Tienda' },
  { id: 'galeria', label: 'Galería' },
  { id: 'contacto', label: 'Contacto' },
];

function Header({ totalItems, onOpenCart }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú móvil con la tecla Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const go = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a
          href="#inicio"
          onClick={(e) => go(e, 'inicio')}
          aria-label="MJC Detailing, ir al inicio"
          className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <MiniLogo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Redes primero: son el canal que cierra ventas */}
          <a
            href={buildWhatsAppUrl(WHATSAPP_GREETING)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escríbenos por WhatsApp al ${WHATSAPP_DISPLAY}`}
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-lg bg-green-500 text-sm font-semibold text-gray-950 transition-colors hover:bg-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 sm:w-auto sm:px-4"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram ${INSTAGRAM_HANDLE}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-900 transition-colors hover:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="mjc-pop absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white ring-2 ring-white"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-900 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Menú móvil flotante: se superpone a la página en vez de empujarla, así al
          elegir una sección el desplazamiento llega justo al título de esa sección. */}
      {menuOpen && (
        <nav
          aria-label="Móvil"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-y border-gray-100 bg-white shadow-lg shadow-slate-900/10 md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => go(e, l.id)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-gray-50"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mt-1 border-t border-gray-100 pt-1">
              <a
                href={buildWhatsAppUrl(WHATSAPP_GREETING)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-gray-50"
              >
                <MessageCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-gray-50"
              >
                <InstagramIcon className="h-5 w-5 text-blue-600" />
                {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/* ==========================================================================
   HERO (logo recortado integrado sobre fondo blanco)
   ========================================================================== */

function Hero() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <section id="inicio" className="relative overflow-hidden bg-white">
      {/* Resplandor azul suave detrás del logo */}
      <div
        className="pointer-events-none absolute -right-48 top-1/2 hidden h-[780px] w-[780px] -translate-y-1/2 lg:block"
        style={{ background: 'radial-gradient(closest-side, rgba(37,99,235,0.13), rgba(37,99,235,0) 72%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:pt-20 lg:pb-28 lg:pt-28">
        <div className="relative z-10 max-w-xl lg:max-w-[35rem]">
          <h1 className="mjc-display text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
            Expertos en Estética Automotriz y Car Care
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
            Cuidado profesional para tu auto, por dentro y por fuera. Encuentra también los mejores productos de car care.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => scrollToId('servicios')}
              className="rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Agendar Lavado
            </button>
            <button
              type="button"
              onClick={() => scrollToId('tienda')}
              className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Ver Catálogo
            </button>
          </div>

          {/* Contacto rápido: WhatsApp e Instagram a primera vista */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl(WHATSAPP_GREETING)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${WHATSAPP_DISPLAY}`}
              className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-slate-700 transition-colors hover:border-green-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${INSTAGRAM_HANDLE}`}
              className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-slate-700 transition-colors hover:border-blue-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <InstagramIcon className="h-4 w-4" />
              </span>
              {INSTAGRAM_HANDLE}
            </a>
          </div>

          {/* Horario de atención */}
          <div className="mt-5 flex items-start gap-2.5 text-sm text-slate-600">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <p>
              <span className="font-semibold text-slate-900">Horario de atención: </span>
              {BUSINESS_HOURS.map((h, i) => (
                <React.Fragment key={h.days}>
                  {i > 0 && (
                    <>
                      <span className="ml-1 mr-0.5 text-slate-300" aria-hidden="true">
                        ·
                      </span>{' '}
                    </>
                  )}
                  <span className="whitespace-nowrap">
                    <abbr title={h.days} className="no-underline">
                      {h.short}
                    </abbr>{' '}
                    {h.hours}
                  </span>
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>

        {!logoFailed && (
          <img
            src={IMAGE_BASE + LOGO_FILE}
            alt="MJC Detailing"
            onError={() => setLogoFailed(true)}
            className="mjc-rise mx-auto mt-12 w-full max-w-sm sm:max-w-md lg:absolute lg:right-2 lg:top-1/2 lg:mt-0 lg:w-[42vw] lg:max-w-[560px] lg:-translate-y-1/2"
            style={{ filter: 'drop-shadow(0 24px 32px rgba(15,23,42,0.22))' }}
          />
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   SERVICIOS
   ========================================================================== */

function Services() {
  const quote = (s) =>
    openWhatsApp(
      `Hola MJC Detailing, quiero cotizar el servicio ${s.name} (${s.priceNote ? `${s.priceNote.toLowerCase()} ` : ''}${formatCLP(s.price)}). ¿Qué disponibilidad tienen?`
    );

  return (
    <section id="servicios" className="scroll-mt-16 border-t border-gray-100 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2 className="mjc-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Packs de lavado</h2>
          <p className="mt-4 text-lg text-slate-600">
            Elige el nivel de detalle para tu auto. Trabajamos con productos profesionales.
          </p>
        </div>

        {/* 4 tarjetas: 1 columna en móvil, 2 en tablet, 4 en escritorio */}
        <div className="mt-14 grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:gap-6">
          {SERVICES.map((s) => (
            <article
              key={s.id}
              className={`relative flex h-full flex-col rounded-2xl bg-white p-7 lg:p-6 xl:p-7 ${
                s.highlight
                  ? 'z-10 border-2 border-blue-600 shadow-2xl shadow-blue-600/15 lg:scale-105 lg:py-10'
                  : 'border border-gray-200'
              }`}
            >
              {s.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                  Recomendado
                </span>
              )}
              <h3 className="mjc-display text-xl font-bold text-slate-900">{s.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.summary}</p>
              <p className="mjc-display mt-6 text-4xl font-extrabold text-slate-900">{formatCLP(s.price)}</p>
              {s.priceNote && <p className="mt-1 text-xs font-medium text-slate-500">{s.priceNote}</p>}

              <ul className="mt-6 flex-1 space-y-3">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => quote(s)}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  s.highlight
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
                    : 'border border-gray-300 bg-white text-slate-900 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Cotizar
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   TIENDA
   ========================================================================== */

function Shop({ onAdd }) {
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('relevancia');

  const counts = useMemo(() => {
    const c = { Todos: PRODUCTS.length };
    CATEGORIES.slice(1).forEach((cat) => {
      c[cat] = PRODUCTS.filter((p) => p.category === cat).length;
    });
    return c;
  }, []);

  const visible = useMemo(() => {
    const list = category === 'Todos' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
    if (sort === 'precio-asc') return [...list].sort(byPrice(1));
    if (sort === 'precio-desc') return [...list].sort(byPrice(-1));
    return list; // "Relevancia": orden original del catálogo
  }, [category, sort]);

  return (
    <section id="tienda" className="scroll-mt-16 border-t border-gray-100 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2 className="mjc-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Tienda de insumos</h2>
          <p className="mt-4 text-lg text-slate-600">
            Productos de car care para lavar, proteger y renovar tu auto. Arma tu pedido y envíalo por WhatsApp.
          </p>
        </div>

        {/* Filtros por categoría + orden por precio */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filtrar por categoría"
            className="mjc-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 lg:pb-0"
          >
            {CATEGORIES.map((cat) => {
              const active = cat === category;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-slate-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                  <span
                    className={`rounded-full px-1.5 text-xs ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-slate-500'}`}
                  >
                    {counts[cat]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <label htmlFor="mjc-sort" className="shrink-0 text-sm font-medium text-slate-500">
              Ordenar por
            </label>
            <div className="relative w-full sm:w-auto">
              <select
                id="mjc-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-2 pl-4 pr-10 text-base font-medium text-slate-700 transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   GALERÍA
   ========================================================================== */

function Gallery() {
  const hasPhotos = GALLERY_PHOTOS.length > 0;

  return (
    <section id="galeria" className="scroll-mt-16 border-t border-gray-100 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2 className="mjc-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Galería</h2>
          <p className="mt-4 text-lg text-slate-600">
            {hasPhotos ? 'Algunos de nuestros trabajos terminados.' : 'Mira nuestros trabajos más recientes en Instagram.'}
          </p>
        </div>

        {/* Fotos reales (solo si se agregaron en GALLERY_PHOTOS) */}
        {hasPhotos && (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {GALLERY_PHOTOS.map((g) => (
              <figure key={g.file} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={IMAGE_BASE + g.file}
                  alt={[g.title, g.detail].filter(Boolean).join(': ') || 'Trabajo de MJC Detailing'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {(g.title || g.detail) && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-12">
                    {g.title && <p className="font-semibold text-white">{g.title}</p>}
                    {g.detail && <p className="text-sm text-gray-200">{g.detail}</p>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Acceso directo al Instagram, donde están los trabajos del negocio */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <InstagramIcon className="h-7 w-7" />
            </span>
            <span>
              <span className="block text-lg font-semibold text-slate-900">{INSTAGRAM_HANDLE}</span>
              <span className="mt-0.5 block text-sm text-slate-500">Fotos y videos de nuestros trabajos.</span>
            </span>
          </span>
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-blue-700 sm:w-auto">
            Ver trabajos en Instagram
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>
      </div>
    </section>
  );
}

/* ==========================================================================
   CARRITO (sidebar) + CHECKOUT POR WHATSAPP
   ========================================================================== */

function CartDrawer({ open, lines, total, onClose, onUpdateQty, onRemove, onClear, onCheckout }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Con el teclado, el foco se mantiene dentro del carrito mientras está abierto.
      if (e.key === 'Tab' && panelRef.current) {
        const items = panelRef.current.querySelectorAll('button:not([disabled]), a[href]');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Al cerrar, el foco vuelve al botón que abrió el carrito.
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="mjc-fade absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className="mjc-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="mjc-display text-lg font-bold text-slate-900">Tu carrito</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-slate-400">
              <ShoppingCart className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-5 text-lg font-semibold text-slate-900">Tu carrito está vacío</p>
            <p className="mt-1 text-slate-500">Agrega productos desde la tienda para armar tu pedido.</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => scrollToId('tienda'), 50);
              }}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3 py-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                    {l.image ? (
                      <img
                        src={IMAGE_BASE + l.image}
                        alt=""
                        className="h-full w-full object-contain p-0.5 mix-blend-multiply"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-slate-400">
                        <Droplets className="h-6 w-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug text-slate-900">{l.name}</p>
                        {l.format && (
                          <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {l.format}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(l.key)}
                        aria-label={`Eliminar ${l.name}${l.format ? ` (${l.format})` : ''} del carrito`}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(l.key, -1)}
                          disabled={l.qty <= 1}
                          aria-label="Restar una unidad"
                          className="flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-900">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(l.key, 1)}
                          disabled={l.qty >= MAX_QTY}
                          aria-label="Sumar una unidad"
                          className="flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatCLP(l.subtotal)}</p>
                        {l.qty > 1 && <p className="text-xs text-slate-500">{formatCLP(l.unitPrice)} c/u</p>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 bg-white px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500">Total</span>
                <span className="mjc-display text-2xl font-extrabold text-slate-900">{formatCLP(total)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-base font-bold text-gray-950 shadow-lg shadow-green-500/25 transition-colors hover:bg-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Completar pedido por WhatsApp
              </button>
              <button
                type="button"
                onClick={onClear}
                className="mt-3 w-full rounded-lg py-2 text-sm text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ==========================================================================
   FOOTER
   ========================================================================== */

function Footer() {
  return (
    <footer id="contacto" className="scroll-mt-16 border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_1fr] lg:gap-8">
        <div>
          <div className="flex items-center gap-3">
            <MiniLogo />
            <span className="mjc-display text-lg font-bold text-slate-900">Detailing</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">Estética automotriz y venta de insumos.</p>
        </div>

        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2 sm:flex-col">
          {NAV_LINKS.filter((l) => l.id !== 'contacto').map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(l.id);
              }}
              className="text-sm text-slate-600 transition-colors hover:text-blue-600"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-slate-900">Contacto</p>
          <a
            href={buildWhatsAppUrl(WHATSAPP_GREETING)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-blue-600"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
            {WHATSAPP_DISPLAY}
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-blue-600"
          >
            <InstagramIcon className="h-4 w-4 shrink-0 text-blue-600" />
            {INSTAGRAM_HANDLE}
          </a>
          {/* Ubicación solo como referencia, sin promesa de cobertura */}
          <p className="inline-flex items-start gap-2 text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            {LOCATION}
          </p>
        </div>

        <div className="text-sm">
          <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
            <Clock className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            Horario de atención
          </p>
          <dl className="mt-3 max-w-xs space-y-2">
            {BUSINESS_HOURS.map((h) => (
              <div key={h.days} className="flex justify-between gap-6">
                <dt className="text-slate-600">{h.days}</dt>
                <dd className="font-medium tabular-nums text-slate-900">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="border-t border-gray-100 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MJC Detailing. Todos los derechos reservados.
      </div>
    </footer>
  );
}

/* ==========================================================================
   APP
   ========================================================================== */

export default function App() {
  const [cart, setCart] = useState(loadCart); // [{ productId, format, qty }]
  const [cartOpen, setCartOpen] = useState(false);

  // Persistencia (con try/catch: puede fallar en modo privado o en vistas previas).
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* sin almacenamiento disponible: el carrito sigue funcionando en memoria */
    }
  }, [cart]);

  // Líneas del carrito derivadas del catálogo (nombre, precio y foto siempre actuales).
  const lines = useMemo(
    () =>
      cart
        .map((l) => {
          const product = PRODUCT_MAP[l.productId];
          if (!product) return null;
          const unitPrice = getUnitPrice(product, l.format);
          if (unitPrice === null) return null;
          // Foto del formato elegido si tiene una propia; si no, la primera del producto.
          const opt = product.options ? product.options.find((o) => o.label === l.format) : null;
          return {
            key: `${l.productId}|${l.format || ''}`,
            productId: l.productId,
            name: product.name,
            format: l.format,
            qty: l.qty,
            unitPrice,
            subtotal: unitPrice * l.qty,
            image: (opt && opt.image) || (product.images && product.images.length ? product.images[0] : null),
          };
        })
        .filter(Boolean),
    [cart]
  );

  const totalItems = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.subtotal, 0), [lines]);

  const addToCart = useCallback((productId, format, qty) => {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === productId && l.format === format);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(MAX_QTY, next[i].qty + qty) };
        return next;
      }
      return [...prev, { productId, format, qty: Math.min(MAX_QTY, qty) }];
    });
  }, []);

  const keyOf = (l) => `${l.productId}|${l.format || ''}`;

  const updateQty = useCallback((key, delta) => {
    setCart((prev) =>
      prev.map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(MAX_QTY, Math.max(1, l.qty + delta)) } : l))
    );
  }, []);

  const removeLine = useCallback((key) => {
    setCart((prev) => prev.filter((l) => keyOf(l) !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const handleCheckout = () => {
    if (lines.length === 0) return;
    const items = lines.map(
      (l) => `${l.qty}x ${l.name}${l.format ? ` (${l.format})` : ''} - ${formatCLP(l.subtotal)}`
    );
    const message =
      'Hola MJC Detailing, quiero hacer este pedido:\n\n' + items.join('\n') + `\n\nTOTAL: ${formatCLP(total)}`;
    openWhatsApp(message);
  };

  return (
    <div className="mjc-root min-h-screen bg-white text-slate-900 antialiased">
      <GlobalStyles />
      <Header totalItems={totalItems} onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Services />
        <Shop onAdd={addToCart} />
        <Gallery />
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        lines={lines}
        total={total}
        onClose={closeCart}
        onUpdateQty={updateQty}
        onRemove={removeLine}
        onClear={clearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
