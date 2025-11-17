/**
 * Utility to create ImageBitmap from Blob with fallback
 * Uses createImageBitmap when available, falls back to Image + Promise
 */

export async function createImageBitmapFromBlob(blob) {
  if (typeof createImageBitmap !== 'undefined') {
    try {
      return await createImageBitmap(blob)
    } catch (error) {
      console.warn('createImageBitmap failed, using fallback:', error)
    }
  }

  // Fallback: create Image and convert to ImageBitmap-like object
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(blob)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      // Create canvas to get ImageData
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      // Return object with ImageBitmap-like interface
      resolve({
        width: img.width,
        height: img.height,
        close: () => {},
        // For Three.js, we'll use the canvas directly
        _canvas: canvas,
      })
    }
    
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl)
      reject(error)
    }
    
    img.src = objectUrl
  })
}

