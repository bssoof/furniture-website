import { useEffect } from 'react';

export const useSEO = (title, description, keywords, ogImage) => {
  useEffect(() => {
    // Update meta tags
    document.title = title || 'بيتزا الشام';
    
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: ogImage }
    ];

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (tag.property) {
          element.setAttribute('property', tag.property);
        } else {
          element.setAttribute('name', tag.name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', tag.content);
    });
  }, [title, description, keywords, ogImage]);
};

export const SEOHelpers = {
  // Structured Data for Schema.org
  generateRestaurantSchema: () => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': 'بيتزا الشام',
    'image': 'https://example.com/pizza.jpg',
    'description': 'أفضل بيتزا في المدينة',
    'telephone': '+972569906492',
    'url': 'https://pizza-al-sham.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'شارع الملك فهد',
      'addressLocality': 'الرياض',
      'addressCountry': 'SA'
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      'opens': '11:00',
      'closes': '00:00'
    },
    'priceRange': '$$'
  }),

  // Generate sitemap
  generateSitemap: () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pizza-al-sham.com/</loc>
    <lastmod>2024-01-17</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pizza-al-sham.com/menu</loc>
    <lastmod>2024-01-17</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pizza-al-sham.com/contact</loc>
    <lastmod>2024-01-17</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`,

  // Generate robots.txt
  generateRobotsTxt: () => `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /.env

Sitemap: https://pizza-al-sham.com/sitemap.xml`
};
