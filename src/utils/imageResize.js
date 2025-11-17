/**
 * Utility to resize images while maintaining aspect ratio
 */

/**
 * Resize image to max dimensions while maintaining aspect ratio
 * @param {Blob|File} imageBlob - Image blob to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1) for JPEG images
 * @returns {Promise<Blob>} Resized image blob
 */
export async function resizeImage(imageBlob, maxWidth = 2048, maxHeight = 2048, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(imageBlob)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      // Calculate new dimensions
      let width = img.width
      let height = img.height
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        imageBlob.type || 'image/png',
        quality
      )
    }
    
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl)
      reject(error)
    }
    
    img.src = objectUrl
  })
}

