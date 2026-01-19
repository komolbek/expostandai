import { UTApi } from 'uploadthing/server'

// Initialize UploadThing server API
const utapi = new UTApi()

/**
 * Download an image from a URL and upload it to UploadThing for permanent storage
 * Used to convert temporary DALL-E URLs to permanent URLs when user submits the form
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  filename?: string
): Promise<string> {
  console.log('[Upload] Downloading image from URL:', imageUrl.substring(0, 100))

  try {
    // Download image from temporary URL
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    console.log('[Upload] Downloaded image:', {
      size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
      type: blob.type,
    })

    // Generate filename if not provided
    const finalFilename = filename || `generated-design-${Date.now()}.png`

    // Convert blob to File object
    const file = new File([blob], finalFilename, { type: blob.type })

    // Upload to UploadThing
    console.log('[Upload] Uploading to UploadThing...')
    const uploadResult = await utapi.uploadFiles(file)

    if (uploadResult.error) {
      throw new Error(`UploadThing error: ${uploadResult.error.message}`)
    }

    const permanentUrl = uploadResult.data?.url
    if (!permanentUrl) {
      throw new Error('No URL returned from UploadThing')
    }

    console.log('[Upload] Successfully uploaded to permanent storage:', permanentUrl)
    return permanentUrl
  } catch (error) {
    console.error('[Upload] Failed to upload image from URL:', error)
    throw error
  }
}

/**
 * Upload multiple images from URLs in parallel
 */
export async function uploadMultipleImagesFromUrls(
  imageUrls: string[]
): Promise<string[]> {
  console.log(`[Upload] Uploading ${imageUrls.length} images to permanent storage...`)

  const uploadPromises = imageUrls.map((url, index) =>
    uploadImageFromUrl(url, `generated-design-${Date.now()}-${index}.png`)
  )

  const results = await Promise.allSettled(uploadPromises)

  const successfulUrls: string[] = []
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulUrls.push(result.value)
    } else {
      console.error(`[Upload] Failed to upload image ${index}:`, result.reason)
    }
  })

  console.log(`[Upload] Successfully uploaded ${successfulUrls.length}/${imageUrls.length} images`)
  return successfulUrls
}

/**
 * Delete files from UploadThing storage by their URLs
 */
export async function deleteImagesFromUrls(imageUrls: string[]): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) {
    console.log('[Upload] No images to delete')
    return
  }

  console.log(`[Upload] Deleting ${imageUrls.length} images from storage...`)

  try {
    // Extract file keys from URLs
    // UploadThing URLs are like: https://utfs.io/f/{fileKey}
    const fileKeys = imageUrls
      .filter((url) => url && url.includes('utfs.io/f/'))
      .map((url) => {
        const parts = url.split('utfs.io/f/')
        return parts[1] || ''
      })
      .filter((key) => key.length > 0)

    if (fileKeys.length === 0) {
      console.log('[Upload] No valid UploadThing URLs found to delete')
      return
    }

    await utapi.deleteFiles(fileKeys)
    console.log(`[Upload] Successfully deleted ${fileKeys.length} images from storage`)
  } catch (error) {
    console.error('[Upload] Failed to delete images:', error)
    throw error
  }
}
