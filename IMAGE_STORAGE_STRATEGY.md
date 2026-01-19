# Image Storage Strategy

## Overview

This document explains how we handle AI-generated exhibition stand images efficiently to optimize storage costs while ensuring permanent availability of selected designs.

## The Problem

DALL-E 3 generates images with **temporary URLs that expire after 2 hours**. This creates two issues:

1. **Expiration**: URLs become invalid after 2 hours, making images inaccessible
2. **Timeout**: Next.js Image Optimization can timeout (7s) when fetching large HD images (1792x1024)

## Our Optimized Solution

We use a **lazy upload strategy** that only stores images when they're actually needed:

### Generation Phase (Temporary Storage)
- DALL-E 3 generates images and returns temporary URLs (valid for 2 hours)
- These URLs are sent directly to the frontend for preview
- No upload happens at this stage
- Users can regenerate designs without wasting storage

### Submission Phase (Permanent Storage)
- When user submits the inquiry form with a selected design
- Backend uploads **only the selected image** to UploadThing
- Temporary DALL-E URL is replaced with permanent UploadThing URL
- Database stores the permanent URL

## Benefits

✅ **Cost Efficient**: Only pay for storage of designs users actually want
✅ **No Waste**: Regenerated/abandoned designs don't consume storage
✅ **Permanent**: Selected images never expire
✅ **Fast**: No upload delays during generation phase

## Implementation Details

### File: `lib/upload-from-url.ts`
- Downloads image from temporary DALL-E URL
- Uploads to UploadThing for permanent storage
- Returns permanent URL

### File: `app/api/inquiry/route.ts`
- Checks if selected image is from DALL-E (temporary URL)
- Uploads to permanent storage when form is submitted
- Replaces temporary URL with permanent URL before saving to database

### File: `lib/uploadthing.ts`
- Configured `generatedDesigns` endpoint for AI-generated images
- Max 3 images per upload (base, alternative, premium variations)
- 16MB max file size for HD quality images

## URL Detection

We detect temporary DALL-E URLs by checking if they contain:
```
oaidalleapiprodscus.blob.core.windows.net
```

If found, the image is uploaded to permanent storage.

## Workflow Example

1. **User generates designs** → 3 temporary DALL-E URLs created
2. **User doesn't like them** → Clicks regenerate
3. **New designs generated** → Previous URLs expire, new temporary URLs created
4. **No storage wasted** → Old images not uploaded to UploadThing
5. **User selects design #2** → Submits form
6. **Backend uploads design #2** → Gets permanent UploadThing URL
7. **Database saves permanent URL** → Image never expires

## Next.js Image Optimization

- Configured to allow DALL-E and UploadThing domains
- Short cache TTL (60s) for temporary preview URLs
- Full optimization enabled for permanent UploadThing URLs

## Error Handling

If upload to permanent storage fails:
- Error is logged but doesn't block inquiry submission
- Database stores original temporary URL
- Better to have the inquiry with expiring image than to lose the lead

## Future Improvements

Consider implementing:
- Batch upload all 3 variations if user might want alternatives later
- Background job to cleanup expired temporary URLs from database
- CDN caching for permanent UploadThing URLs
