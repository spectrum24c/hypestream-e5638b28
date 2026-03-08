import { useEffect } from 'react';

const BASE_URL = 'https://hype-stream.vercel.app';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
}

const PageSEO: React.FC<PageSEOProps> = ({ title, description, path }) => {
  useEffect(() => {
    const fullTitle = `${title} | HypeStream`;
    const canonicalUrl = `${BASE_URL}${path}`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    return () => {
      document.title = 'HypeStream - Watch Movies & TV Shows';
    };
  }, [title, description, path]);

  return null;
};

export default PageSEO;
