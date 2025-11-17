/**
 * OffscreenComposer - Composes textures offscreen using Fabric.js
 * Handles base color, UV overlays, logos, text, and numbers
 */

// Font loading cache
const fontCache = new Map()

/**
 * Load font using FontFace API
 * @param {string} fontFamily - Font family name
 * @param {string} fontUrl - Font file URL
 * @returns {Promise<void>}
 */
async function loadFont(fontFamily, fontUrl) {
  if (fontCache.has(fontFamily)) {
    return fontCache.get(fontFamily)
  }

  const promise = (async () => {
    try {
      const font = new FontFace(fontFamily, `url(${fontUrl})`)
      await font.load()
      document.fonts.add(font)
      fontCache.set(fontFamily, Promise.resolve())
      return Promise.resolve()
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}:`, error)
      // Fallback to system font
      fontCache.set(fontFamily, Promise.resolve())
      return Promise.resolve()
    }
  })()

  fontCache.set(fontFamily, promise)
  return promise
}

/**
 * Wait for font to be loaded
 * @param {string} fontFamily - Font family name
 * @returns {Promise<void>}
 */
async function waitForFont(fontFamily) {
  if (fontCache.has(fontFamily)) {
    await fontCache.get(fontFamily)
  }
  
  // Wait for document.fonts to be ready
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }
}

/**
 * Composes a texture for a part
 * @param {Object} partCfg - Part configuration
 * @param {string} partCfg.color - Base color (hex)
 * @param {string} partCfg.imageUrl - Optional background image URL
 * @param {string} partCfg.logoId - Optional logo ID
 * @param {Object} partCfg.text - Optional text config {value, fontFamily, fontSize, color, stroke, xPercent, yPercent}
 * @param {Object} partCfg.number - Optional number config {value, fontFamily, size, color, positionKey}
 * @param {Array} partCfg.repeat - Optional repeat [x, y]
 * @param {Array} partCfg.offset - Optional offset [x, y]
 * @param {string} uvOverlay - UV overlay image URL (optional)
 * @param {Object} options - Options {width, height, quality}
 * @returns {Promise<{blob: Blob, canvas: HTMLCanvasElement}>}
 */
export async function composePart(partCfg, uvOverlay = null, options = {}) {
  const { fabric } = await import('fabric')
  
  const width = options.width || 1024
  const height = options.height || 1024
  const quality = options.quality || 1

  // Create canvas element
  const canvasEl = document.createElement('canvas')
  canvasEl.width = width
  canvasEl.height = height
  
  const canvas = new fabric.Canvas(canvasEl, {
    width,
    height,
    enableRetinaScaling: false,
  })

  // Step 1: Fill with base color
  canvas.backgroundColor = partCfg.color || '#ffffff'
  canvas.renderAll()

  // Step 2: Draw background texture/image if any (base texture from design or user image)
  const backgroundImageUrl = partCfg.textureUrl || partCfg.imageUrl
  if (backgroundImageUrl) {
    console.log('🖼️ Loading background texture:', backgroundImageUrl)
    try {
      // First, verify the image exists by trying to fetch it
      const imageExists = await fetch(backgroundImageUrl, { method: 'HEAD' })
        .then(res => res.ok)
        .catch(() => false)
      
      if (!imageExists) {
        console.warn(`⚠️ Background image not found: ${backgroundImageUrl}`)
        // Try alternative path (without leading slash)
        const altPath = backgroundImageUrl.startsWith('/') 
          ? backgroundImageUrl.substring(1) 
          : `/${backgroundImageUrl}`
        console.log(`   Trying alternative path: ${altPath}`)
      }
      
      const bgImg = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Background image load timeout after 10s: ${backgroundImageUrl}`))
        }, 10000) // Increased timeout
        
        fabric.Image.fromURL(
          backgroundImageUrl,
          (img) => {
            clearTimeout(timeout)
            if (!img) {
              reject(new Error('Failed to load background image - fabric returned null'))
              return
            }
            
            console.log('✅ Background image loaded successfully:', {
              width: img.width,
              height: img.height,
              url: backgroundImageUrl,
              element: img.getElement(),
            })
            
            // Apply repeat if specified
            if (partCfg.repeat) {
              // Fabric doesn't support repeat directly, we'll tile manually
              const tileWidth = img.width || width
              const tileHeight = img.height || height
              
              for (let x = 0; x < width; x += tileWidth) {
                for (let y = 0; y < height; y += tileHeight) {
                  const tile = new fabric.Image(img.getElement(), {
                    left: x + (partCfg.offset?.[0] || 0),
                    top: y + (partCfg.offset?.[1] || 0),
                  })
                  canvas.add(tile)
                }
              }
            } else {
              // Single image, scale to fit canvas exactly
              const scaleX = width / (img.width || width)
              const scaleY = height / (img.height || height)
              
              img.set({
                left: 0,
                top: 0,
                scaleX: scaleX,
                scaleY: scaleY,
                originX: 'left',
                originY: 'top',
              })
              
              canvas.add(img)
              canvas.sendToBack(img) // Ensure background is behind everything
              
              console.log('✅ Background image positioned:', {
                left: img.left,
                top: img.top,
                scaleX: img.scaleX,
                scaleY: img.scaleY,
                width: img.width * img.scaleX,
                height: img.height * img.scaleY,
              })
            }
            
            canvas.renderAll()
            resolve(img)
          },
          { 
            crossOrigin: 'anonymous',
            // Add error callback
          }
        )
      })
      console.log('✅ Background texture added to canvas')
    } catch (error) {
      console.error('❌ Failed to load background image:', {
        error: error.message,
        url: backgroundImageUrl,
        stack: error.stack,
      })
      // Don't fail completely, continue without background
      // But log the error clearly
    }
  } else {
    console.log('ℹ️ No background texture URL for this part')
  }

  // Step 3: Draw logo if provided (user-uploaded logo, not base texture)
  // Only draw logo if it's not the same as the background texture
  if (partCfg.logoId || (partCfg.imageUrl && partCfg.imageUrl !== backgroundImageUrl)) {
    const logoUrl = partCfg.imageUrl || `/assets/logos_catalog/${partCfg.logoId}.svg`
    
    try {
      const logoImg = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(
          logoUrl,
          (img) => {
            if (!img) {
              reject(new Error('Failed to load logo'))
              return
            }
            
            // Center logo (can be customized)
            const scale = 0.3
            img.set({
              left: width / 2,
              top: height / 2,
              scaleX: scale,
              scaleY: scale,
              originX: 'center',
              originY: 'center',
            })
            
            canvas.add(img)
            canvas.renderAll()
            resolve(img)
          },
          { crossOrigin: 'anonymous' }
        )
      })
    } catch (error) {
      console.warn('Failed to load logo:', error)
    }
  }

  // Step 4: Draw text if provided
  if (partCfg.text && partCfg.text.value) {
    const textCfg = partCfg.text
    console.log('📝 Composing text:', textCfg.value, 'at', textCfg.xPercent, textCfg.yPercent)
    
    // Load font if specified
    if (textCfg.fontFamily && textCfg.fontFamily !== 'Arial') {
      const fontUrl = `/assets/fonts/${textCfg.fontFamily}.woff2`
      await loadFont(textCfg.fontFamily, fontUrl)
      await waitForFont(textCfg.fontFamily)
    }
    
    // Clamp xPercent and yPercent to valid range [0, 100]
    const clampedXPercent = Math.max(0, Math.min(100, textCfg.xPercent || 50))
    const clampedYPercent = Math.max(0, Math.min(100, textCfg.yPercent || 50))
    
    if (textCfg.xPercent !== clampedXPercent || textCfg.yPercent !== clampedYPercent) {
      console.warn('⚠️ Text position out of range, clamped:', {
        original: { x: textCfg.xPercent, y: textCfg.yPercent },
        clamped: { x: clampedXPercent, y: clampedYPercent },
      })
    }
    
    const text = new fabric.Text(textCfg.value, {
      left: clampedXPercent * width / 100,
      top: clampedYPercent * height / 100,
      fontSize: textCfg.fontSize || 48,
      fill: textCfg.color || '#000000',
      fontFamily: textCfg.fontFamily || 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    
    // Add stroke if specified
    if (textCfg.stroke) {
      text.set({
        stroke: textCfg.stroke.color || '#000000',
        strokeWidth: textCfg.stroke.width || 2,
      })
    }
    
    canvas.add(text)
    canvas.renderAll()
    console.log('✅ Text added to canvas')
  }

  // Step 5: Draw number if provided
  if (partCfg.number && partCfg.number.value) {
    const numCfg = partCfg.number
    console.log('🔢 Composing number:', numCfg.value, 'at', numCfg.xPercent, numCfg.yPercent)
    
    // Use UV coordinates if provided, otherwise use default position
    // Clamp to valid range [0, 100]
    const rawXPercent = numCfg.xPercent !== undefined ? numCfg.xPercent : 50
    const rawYPercent = numCfg.yPercent !== undefined ? numCfg.yPercent : 50
    const xPercent = Math.max(0, Math.min(100, rawXPercent))
    const yPercent = Math.max(0, Math.min(100, rawYPercent))
    
    if (rawXPercent !== xPercent || rawYPercent !== yPercent) {
      console.warn('⚠️ Number position out of range, clamped:', {
        original: { x: rawXPercent, y: rawYPercent },
        clamped: { x: xPercent, y: yPercent },
      })
    }
    
    // Load font if specified
    if (numCfg.fontFamily && numCfg.fontFamily !== 'Arial') {
      const fontUrl = `/assets/fonts/${numCfg.fontFamily}.woff2`
      await loadFont(numCfg.fontFamily, fontUrl)
      await waitForFont(numCfg.fontFamily)
    }
    
    const number = new fabric.Text(numCfg.value.toString(), {
      left: xPercent * width / 100,
      top: yPercent * height / 100,
      fontSize: numCfg.size || 72,
      fill: numCfg.color || '#000000',
      fontFamily: numCfg.fontFamily || 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold',
    })
    
    canvas.add(number)
    canvas.renderAll()
    console.log('✅ Number added to canvas')
  }

  // Step 6: Apply UV overlay (optional, for debug only)
  // UV overlays are completely optional and only used for visual debugging
  if (uvOverlay && typeof uvOverlay === 'string' && uvOverlay.trim() !== '') {
    try {
      // Try to load UV overlay, but don't fail if it doesn't exist
      const overlayImg = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('UV overlay load timeout'))
        }, 2000) // 2 second timeout
        
        fabric.Image.fromURL(
          uvOverlay,
          (img) => {
            clearTimeout(timeout)
            if (!img) {
              reject(new Error('Failed to load UV overlay'))
              return
            }
            img.set({
              left: 0,
              top: 0,
              scaleX: width / (img.width || width),
              scaleY: height / (img.height || height),
              opacity: 0.3, // Semi-transparent for debug
            })
            canvas.add(img)
            canvas.renderAll()
            resolve(img)
          },
          { crossOrigin: 'anonymous' }
        )
      })
    } catch (error) {
      // UV overlay is optional, just skip it silently
      // Don't log as error since it's expected that overlays may not exist
    }
  }

  // Convert to blob
  // Fabric.js canvas doesn't have toBlob directly, use getElement() to get native canvas
  const blob = await new Promise((resolve, reject) => {
    const nativeCanvas = canvas.getElement()
    if (nativeCanvas && nativeCanvas.toBlob) {
      nativeCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/png',
        quality
      )
    } else {
      // Fallback: use toDataURL and convert to blob
      const dataUrl = canvas.toDataURL('image/png', quality)
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => resolve(blob))
        .catch(err => reject(err))
    }
  })

  return { blob, canvas: canvas.getElement() }
}
