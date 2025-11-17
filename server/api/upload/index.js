/**
 * Vercel Serverless Function for file upload
 * Handles image upload with validation and sanitization
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // In production, use @vercel/blob or S3
    // For MVP, return mock URL
    const formData = req.body

    // Validate file (in real implementation, parse multipart/form-data)
    // For now, return mock response

    // Mock: simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In production:
    // 1. Parse multipart/form-data
    // 2. Validate file size and type
    // 3. Sanitize SVG if needed
    // 4. Upload to Vercel Blob or S3
    // 5. Return public URL

    // Mock response
    const mockUrl = `/assets/uploads/${Date.now()}_uploaded.png`

    return res.status(200).json({
      url: mockUrl,
      message: 'Upload successful (mock)',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
