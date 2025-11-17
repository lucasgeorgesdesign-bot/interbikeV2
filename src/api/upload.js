/**
 * Upload API client for Vercel Functions
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']

/**
 * Upload file to server
 * @param {File|Blob} file - File to upload
 * @returns {Promise<{url: string}>}
 */
export async function uploadFile(file) {
  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`)
  }

  // Create form data
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Sanitize SVG content (remove scripts)
 * @param {string} svgContent - SVG content
 * @returns {string} Sanitized SVG
 */
export function sanitizeSVG(svgContent) {
  // Remove script tags and event handlers
  let sanitized = svgContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
  
  return sanitized
}
