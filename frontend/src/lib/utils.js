import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format price in FCFA
export function formatPrice(price) {
  if (price === null || price === undefined) return "";
  return new Intl.NumberFormat("fr-SN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + " FCFA";
}

// Generate WhatsApp link for order
export function generateWhatsAppLink(phone, message) {
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone.replace(/\s/g, "").replace(/^\+/, "");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// Generate order message for WhatsApp
export function generateOrderMessage(items, total, shipping) {
  let message = "🛒 *Nouvelle Commande - Lumina Senegal*\n\n";
  message += "*Produits:*\n";
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
  });
  
  message += `\n*Total:* ${formatPrice(total)}\n\n`;
  
  if (shipping) {
    message += "*Livraison:*\n";
    message += `Nom: ${shipping.full_name}\n`;
    message += `Téléphone: ${shipping.phone}\n`;
    message += `Adresse: ${shipping.address}\n`;
    message += `Ville: ${shipping.city}\n`;
    message += `Région: ${shipping.region}\n`;
    if (shipping.notes) {
      message += `Notes: ${shipping.notes}\n`;
    }
  }
  
  return message;
}

// Truncate text
export function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Get category display name
export function getCategoryName(categoryId) {
  const categories = {
    electronique: "Électronique",
    electromenager: "Électroménager",
    decoration: "Décoration & Mobilier",
    beaute: "Beauté & Bien-être",
  };
  return categories[categoryId] || categoryId;
}

// Get order status display
export function getOrderStatusDisplay(status) {
  const statuses = {
    pending: { label: "En attente", class: "status-pending" },
    processing: { label: "En traitement", class: "status-processing" },
    shipped: { label: "Expédié", class: "status-shipped" },
    delivered: { label: "Livré", class: "status-delivered" },
    cancelled: { label: "Annulé", class: "status-cancelled" },
  };
  return statuses[status] || { label: status, class: "" };
}

// Get payment status display
export function getPaymentStatusDisplay(status) {
  const statuses = {
    pending: { label: "En attente", class: "status-pending" },
    paid: { label: "Payé", class: "status-delivered" },
    failed: { label: "Échoué", class: "status-cancelled" },
  };
  return statuses[status] || { label: status, class: "" };
}

// Format date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-SN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Format date with time
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-SN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Local storage helpers
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${error}`);
  }
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (Senegal format)
export function isValidPhone(phone) {
  const phoneRegex = /^(\+221|221)?[7][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Calculate discount percentage
export function calculateDiscount(originalPrice, currentPrice) {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Get full image URL - handles relative and absolute URLs
// This is the SINGLE SOURCE OF TRUTH for image URL resolution
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export function getImageUrl(imageUrl, fallback = '/placeholder.jpg') {
  if (!imageUrl) return fallback;
  
  // Already a full URL (http/https) - return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Relative URL starting with /api/uploads/ - prepend API_URL
  if (imageUrl.startsWith('/api/uploads/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // Relative URL starting with /api/ - prepend API_URL
  if (imageUrl.startsWith('/api/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // Local asset paths (like /assets/images/) - return as-is
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Just a filename - assume it's in uploads
  if (!imageUrl.includes('/')) {
    return `${API_URL}/api/uploads/${imageUrl}`;
  }
  
  // Fallback - return as-is
  return imageUrl;
}

// Get array of resolved image URLs
export function getImageUrls(images, fallback = '/placeholder.jpg') {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [fallback];
  }
  return images.map(img => getImageUrl(img, fallback));
}
