import * as pdfjsLib from 'pdfjs-dist'

// Set worker path for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface ProcessedPage {
  pageNumber: number
  blob: Blob
  dataUrl: string
}

/**
 * Process a PDF file and extract each page as an image
 * @param file PDF file to process
 * @param scale Scale factor for rendering (default: 2 for high quality)
 * @returns Array of processed pages with image blobs
 */
export async function processPDF(
  file: File,
  scale: number = 2
): Promise<ProcessedPage[]> {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages
    const pages: ProcessedPage[] = []

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })

      // Create canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not get canvas context')

      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to convert canvas to blob'))
        }, 'image/jpeg', 0.9)
      })

      // Create data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

      pages.push({
        pageNumber: pageNum,
        blob,
        dataUrl,
      })
    }

    return pages
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error('Failed to process PDF file')
  }
}

/**
 * Compress an image file and crop to A4 ratio
 * @param file Image file to compress
 * @param maxWidth Maximum width
 * @param quality JPEG quality (0-1)
 * @returns Compressed and cropped image blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // A4 ratio: 210mm x 297mm = 0.707
        const A4_RATIO = 210 / 297

        // Calculate dimensions to fit A4 ratio
        let sourceWidth = img.width
        let sourceHeight = img.height
        const sourceRatio = sourceWidth / sourceHeight

        // Determine crop dimensions (center crop)
        let cropX = 0
        let cropY = 0
        let cropWidth = sourceWidth
        let cropHeight = sourceHeight

        if (sourceRatio > A4_RATIO) {
          // Image is wider than A4 - crop width
          cropWidth = sourceHeight * A4_RATIO
          cropX = (sourceWidth - cropWidth) / 2
        } else if (sourceRatio < A4_RATIO) {
          // Image is taller than A4 - crop height
          cropHeight = sourceWidth / A4_RATIO
          cropY = (sourceHeight - cropHeight) / 2
        }

        // Calculate output dimensions
        let outputWidth = cropWidth
        let outputHeight = cropHeight

        if (outputWidth > maxWidth) {
          outputHeight = (outputHeight * maxWidth) / outputWidth
          outputWidth = maxWidth
        }

        canvas.width = outputWidth
        canvas.height = outputHeight

        // Draw cropped and resized image
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,  // Source crop
          0, 0, outputWidth, outputHeight        // Destination
        )

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to compress image'))
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

