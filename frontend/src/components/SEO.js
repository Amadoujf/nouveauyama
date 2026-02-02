import { Helmet } from 'react-helmet-async';

const SITE_NAME = "GROUPE YAMA+";
const SITE_URL = "https://groupeyamaplus.com";
const DEFAULT_IMAGE = "https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/xs5g0hsy_IMG_0613.png";
const DEFAULT_DESCRIPTION = "GROUPE YAMA+ - Votre boutique premium au Sénégal. Électronique, électroménager, décoration et beauté. Livraison rapide à Dakar et régions. Paiement Wave, Orange Money, Free Money.";

export default function SEO({ 
  title, 
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  product = null,
  noIndex = false
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Le shopping, autrement`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  
  // Product structured data
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.[0] || DEFAULT_IMAGE,
    "sku": product.product_id,
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME
    },
    "offers": {
      "@type": "Offer",
      "url": fullUrl,
      "priceCurrency": "XOF",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": SITE_NAME
      }
    }
  } : null;

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": DEFAULT_IMAGE,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+221-78-382-75-75",
      "contactType": "customer service",
      "email": "contact@groupeyamaplus.com",
      "areaServed": "SN",
      "availableLanguage": "French"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Fass Paillote",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    },
    "sameAs": [
      "https://facebook.com/groupeyamaplus",
      "https://instagram.com/groupeyamaplus"
    ]
  };

  // E-commerce website structured data
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_SN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta */}
      <meta name="author" content={SITE_NAME} />
      <meta name="geo.region" content="SN-DK" />
      <meta name="geo.placename" content="Dakar" />
      <meta name="language" content="French" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
}

// Category-specific SEO data
export const categoryMeta = {
  electronique: {
    title: "Électronique",
    description: "Découvrez notre sélection premium d'électronique au Sénégal. iPhone, Samsung, MacBook, tablettes et accessoires. Livraison rapide à Dakar."
  },
  electromenager: {
    title: "Électroménager",
    description: "Électroménager de qualité au Sénégal. Réfrigérateurs, climatiseurs, machines à laver et petit électroménager. Prix compétitifs, livraison Dakar."
  },
  decoration: {
    title: "Décoration & Mobilier",
    description: "Transformez votre intérieur avec notre collection décoration. Mobilier moderne, luminaires, accessoires déco. Livraison à Dakar et régions."
  },
  beaute: {
    title: "Beauté & Bien-être",
    description: "Produits de beauté premium au Sénégal. Soins visage, maquillage, soins corps et accessoires beauté. Marques authentiques, qualité garantie."
  }
};
