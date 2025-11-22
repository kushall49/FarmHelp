/**
 * URI validation utilities for React Native Image components
 * Prevents open redirect vulnerabilities
 */

/**
 * Validate if a URI is safe to use in Image component
 * @param {string} uri - URI to validate
 * @returns {boolean} - True if URI is safe
 */
export const isValidImageUri = (uri) => {
  if (!uri || typeof uri !== 'string') {
    return false;
  }

  try {
    // Allow data URIs (base64)
    if (uri.startsWith('data:image/')) {
      return true;
    }

    // Allow file URIs (local files)
    if (uri.startsWith('file://')) {
      return true;
    }

    // Parse HTTP/HTTPS URIs
    const url = new URL(uri);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Optional: Add whitelist of allowed domains
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      // Add your API domain
      process.env.EXPO_PUBLIC_API_URL?.replace(/https?:\/\//, ''),
      // Add CDN domains if you use them
      'cloudinary.com',
      'amazonaws.com'
    ].filter(Boolean);

    // Check if domain is in whitelist (optional - remove if too restrictive)
    // const isAllowedDomain = allowedDomains.some(domain => 
    //   url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    // );

    return true; // or: return isAllowedDomain;
  } catch (error) {
    // Invalid URI
    return false;
  }
};

/**
 * Sanitize URI for safe use in Image component
 * @param {string} uri - URI to sanitize
 * @param {string} fallback - Fallback URI if validation fails
 * @returns {string} - Sanitized URI or fallback
 */
export const sanitizeImageUri = (uri, fallback = '') => {
  if (isValidImageUri(uri)) {
    return uri;
  }
  
  console.warn('[Security] Invalid or potentially unsafe image URI blocked:', uri);
  return fallback;
};

/**
 * Generate a safe avatar URL (for user avatars)
 * @param {string} identifier - User identifier (username, id, etc.)
 * @returns {string} - Safe avatar URL
 */
export const getSafeAvatarUrl = (identifier) => {
  if (!identifier) {
    return 'https://ui-avatars.com/api/?name=User&background=4CAF50&color=fff';
  }
  
  // Use a trusted avatar generation service
  const name = String(identifier).substring(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4CAF50&color=fff`;
};
