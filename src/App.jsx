import React, { useEffect, useMemo, useRef } from 'react';
import homeHtml from './pages/home.html?raw';
import catalogueHtml from './pages/catalogue.html?raw';
import aboutHtml from './pages/about.html?raw';
import product01Html from './pages/product01.html?raw';
import product02Html from './pages/product02.html?raw';
import product03Html from './pages/product03.html?raw';
import product04Html from './pages/product04.html?raw';
import product05Html from './pages/product05.html?raw';
import product06Html from './pages/product06.html?raw';
import product07Html from './pages/product07.html?raw';
import product08Html from './pages/product08.html?raw';
import product09Html from './pages/product09.html?raw';

const pageMap = {
  'index.html': { html: homeHtml, title: "Home" },
  'product-catalogue.html': { html: catalogueHtml, title: "Catalogue" },
  'about.html': { html: aboutHtml, title: "About" },
  'product01.html': { html: product01Html, title: "Product01" },
  'product02.html': { html: product02Html, title: "Product02" },
  'product03.html': { html: product03Html, title: "Product03" },
  'product04.html': { html: product04Html, title: "Product04" },
  'product05.html': { html: product05Html, title: "Product05" },
  'product06.html': { html: product06Html, title: "Product06" },
  'product07.html': { html: product07Html, title: "Product07" },
  'product08.html': { html: product08Html, title: "Product08" },
  'product09.html': { html: product09Html, title: "Product09" },
};

function getCurrentPage() {
  const pathname = window.location.pathname;
  const file = pathname.split('/').filter(Boolean).pop()?.toLowerCase() || 'index.html';
  return pageMap[file] || pageMap['index.html'];
}

function preparePage(markup) {
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  const body = parsed.body;
  const html = body.innerHTML;

  // Remove old page-level script tags; the legacy interactions are loaded once
  // after React has inserted the page markup.
  const holder = document.createElement('div');
  holder.innerHTML = html;
  holder.querySelectorAll('script').forEach((node) => node.remove());

  // Make asset paths work from every React page URL.
  holder.querySelectorAll('[src]').forEach((node) => {
    const value = node.getAttribute('src');
    if (value?.startsWith('./assets/')) node.setAttribute('src', value.replace('./assets/', '/assets/'));
    if (value?.startsWith('./image/')) node.setAttribute('src', value.replace('./image/', '/image/'));
  });
  holder.querySelectorAll('[href]').forEach((node) => {
    const value = node.getAttribute('href');
    if (value?.startsWith('./assets/')) node.setAttribute('href', value.replace('./assets/', '/assets/'));
    if (value?.startsWith('./image/')) node.setAttribute('href', value.replace('./image/', '/image/'));
  });

  return { html: holder.innerHTML, bodyId: body.id || '' };
}

export default function App() {
  const pageRef = useRef(null);
  const page = useMemo(() => getCurrentPage(), []);

  useEffect(() => {
    const prepared = preparePage(page.html);
    document.body.id = prepared.bodyId;
    document.title = 'The Palash | Custom Gifts, Printing, Design & Branding';
    if (pageRef.current) pageRef.current.innerHTML = prepared.html;

    let cancelled = false;
    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

    // The source project's JS is retained to preserve its existing interactions.
    (async () => {
      try {
        await loadScript('/assets/js/script.js');
        await loadScript('/navbar.js');
        if (!cancelled) {
          document.dispatchEvent(new Event('DOMContentLoaded'));
        }
      } catch (error) {
        console.error('Could not initialize the original page interactions:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [page]);

  return <main ref={pageRef} />;
}
