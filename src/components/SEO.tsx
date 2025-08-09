import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string; // can be relative or absolute
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const ensureMeta = (selector: string, attrs: Record<string, string>) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  } else {
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  }
  return el;
};

const SEO = ({ title, description, canonical, jsonLd }: SEOProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title });
      ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    }

    if (description) {
      ensureMeta('meta[name="description"]', { name: 'description', content: description });
      ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description });
      ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    }

    if (canonical) {
      const href = canonical.startsWith('http')
        ? canonical
        : new URL(canonical, window.location.origin).href;
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    }

    if (jsonLd) {
      const scriptId = 'ld-json-seo';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      const json = JSON.stringify(payload.length === 1 ? payload[0] : payload);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        script.text = json;
        document.head.appendChild(script);
      } else {
        script.text = json;
      }
    }
  }, [title, description, canonical, JSON.stringify(jsonLd)]);

  return null;
};

export default SEO;
