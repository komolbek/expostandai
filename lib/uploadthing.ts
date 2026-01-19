import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

// FileRouter for your app - defines the upload endpoints
export const ourFileRouter = {
  // Brand files uploader (logos, brand guidelines, etc.)
  brandFiles: f({
    image: { maxFileSize: '8MB', maxFileCount: 20 },
    pdf: { maxFileSize: '16MB', maxFileCount: 10 },
    'application/postscript': { maxFileSize: '16MB', maxFileCount: 10 }, // EPS files
  })
    .middleware(async () => {
      // Add any auth or validation here if needed
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Brand file uploaded:', file.ufsUrl)
      return { url: file.ufsUrl }
    }),

  // Previous stand photos uploader
  standPhotos: f({
    image: { maxFileSize: '8MB', maxFileCount: 20 },
  })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Stand photo uploaded:', file.ufsUrl)
      return { url: file.ufsUrl }
    }),

  // Generated stand designs uploader (for converting temporary DALL-E URLs to permanent storage)
  generatedDesigns: f({
    image: { maxFileSize: '16MB', maxFileCount: 3 },
  })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Generated design uploaded:', file.ufsUrl)
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
