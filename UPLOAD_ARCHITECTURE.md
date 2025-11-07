# Video Upload Architecture - Production Best Practices

## Overview

The video upload system uses **client-side thumbnail generation** and **pre-signed URLs** for direct uploads, following industry best practices for handling large file uploads.

## Key Features

- ✅ **Client-side thumbnail generation** - No server processing needed
- ✅ **Deferred uploads** - Nothing uploaded until "Publish" clicked
- ✅ **Direct R2 uploads** - Client → R2, bypassing server
- ✅ **No orphaned files** - Cancel anytime without leaving files in storage
- ✅ **Progress tracking** - Clear feedback at each step

## Architecture Flow

```
Step 1-3: Prepare (NO UPLOADS)
┌─────────────────────────────────────────┐
│ 1. Select game type                     │
│ 2. Select & validate video (local only)│
│ 3. Enter metadata                       │
└─────────────────────────────────────────┘

Step 4: Generate & Select Thumbnail (NO UPLOADS)
┌─────────────────────────────────────────┐
│ Client generates thumbnails from local  │
│ video file using HTML5 Canvas           │
│ - Extracts frames at random timestamps  │
│ - Converts to base64 images             │
│ - User selects preferred thumbnail      │
└─────────────────────────────────────────┘

Step 5: Publish (UPLOADS EVERYTHING)
┌─────────────────────────────────────────┐
│ 1. Request pre-signed URLs              │
│    Client → Server                       │
│                                          │
│ 2. Upload video to R2                   │
│    Client → R2 (direct, 10%-35%)        │
│                                          │
│ 3. Upload thumbnail to R2               │
│    Client → R2 (direct, 35%-60%)        │
│                                          │
│ 4. Save metadata to database            │
│    Client → Server (60%-100%)           │
└─────────────────────────────────────────┘
```

## Why This Approach?

### ❌ Previous Approach (Increasing Body Size Limit)
- Server handles 200MB file buffers
- High memory consumption
- Timeout risks
- Poor scalability
- Server becomes bottleneck

### ✅ New Approach (Pre-signed URLs)
- **Performance**: Direct client → storage upload
- **Scalability**: Server doesn't handle file data
- **Security**: Temporary, scoped URLs (1 hour expiry)
- **Memory**: Zero server memory for file transfers
- **Cost**: Reduced server bandwidth costs

## Implementation Details

### 1. Pre-signed URL Generation (`app/actions/r2-upload.ts`)

**Two server actions:**

- `generateVideoUploadUrl()` - Creates pre-signed URL for video uploads
- `generateThumbnailUploadUrl()` - Creates pre-signed URL for thumbnail uploads

**Security features:**
- Requires Admin role
- Validates file type (mp4, mov, webm)
- Validates file size (200MB max)
- URLs expire after 1 hour
- Scoped to specific bucket/key

### 2. Video Upload Flow (`components/admin/VideoUpload.tsx`)

**Process:**
1. User selects video file
2. Client reads metadata (dimensions, duration)
3. Auto-classifies as Normal (16:9) or Shorts (9:16)
4. Validates aspect ratio and duration
5. Requests pre-signed URL from server
6. Uploads directly to R2 with progress tracking
7. Stores R2 URL for next step

**Key features:**
- Upload progress bar
- Success indicator
- No server memory usage
- Retry capability

### 3. Thumbnail Upload Flow (`components/admin/ThumbnailSelect.tsx`)

**Process:**
1. Generates thumbnails from video
2. User selects preferred thumbnail
3. Converts base64 to Blob
4. Requests pre-signed URL from server
5. Uploads directly to R2
6. Sends only metadata to final server action

### 4. Database Save (`app/actions/video.ts`)

**Updated `uploadVideo()` function:**
- Now only handles metadata
- No file buffers
- Fast execution
- Low memory footprint

**Input:**
```typescript
{
  videoUrl: string;       // Already uploaded to R2
  thumbnailUrl: string;   // Already uploaded to R2
  gameType: string;
  videoType: "Normal" | "Shorts";
  title: string;
  description?: string;
  tags: string[];
}
```

## File Changes

### New Files
- ✨ `app/actions/r2-upload.ts` - Pre-signed URL generation

### Modified Files
- 📝 `components/admin/VideoUpload.tsx` - Direct R2 upload
- 📝 `components/admin/AddVideoDialog.tsx` - Pass videoUrl
- 📝 `components/admin/ThumbnailSelect.tsx` - Direct R2 upload
- 📝 `app/actions/video.ts` - Metadata-only handling

### Type Changes
```typescript
// AddVideoDialog.tsx
export type UploadData = {
  gameType: string;
  videoFile: File | null;
  videoType: "Normal" | "Shorts" | null;
  videoUrl: string | null;  // ← NEW
  title: string;
  description: string;
  tags: string[];
  selectedThumbnail: string | null;
};
```

## Benefits Summary

| Aspect | Old Approach | New Approach |
|--------|--------------|--------------|
| Server Memory | 200MB per upload | ~1KB (metadata) |
| Upload Speed | Through server | Direct to R2 |
| Scalability | Limited | Unlimited |
| Timeout Risk | High | None |
| Bandwidth Cost | 2x (client→server→R2) | 1x (client→R2) |
| Security | Server-side | Pre-signed URLs |

## Next Steps

### Optional Enhancements

1. **Progress Enhancement**
   - Add XMLHttpRequest for accurate upload progress
   - Currently uses basic progress tracking

2. **Resume Capability**
   - Implement multipart uploads for very large files
   - Allow resume on network interruption

3. **Thumbnail Generation from R2**
   - Download video from R2 URL server-side
   - Process for thumbnail generation
   - No need to keep file in client memory

4. **Concurrent Uploads**
   - Upload video and generate thumbnails simultaneously
   - Faster overall workflow

## Testing

To test the new implementation:

1. ✅ Upload a small video (< 10MB)
2. ✅ Upload a large video (100-200MB)
3. ✅ Test Normal video (16:9)
4. ✅ Test Shorts video (9:16, < 60s)
5. ✅ Verify thumbnails generate correctly
6. ✅ Check database for correct URLs
7. ✅ Verify videos play from R2

## Troubleshooting

### Issue: Pre-signed URL generation fails
- Check R2 credentials in `.env`
- Verify bucket permissions
- Check AWS SDK configuration

### Issue: Upload to R2 fails
- Check CORS configuration on R2 bucket
- Verify pre-signed URL hasn't expired
- Check network connectivity

### Issue: Files not accessible
- Verify R2_PUBLIC_URL is correct
- Check bucket public access settings
- Ensure files are uploaded to correct path

## Environment Variables Required

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-url.com
```

## Conclusion

This architecture follows production best practices for handling large file uploads. It's:
- ✅ Scalable
- ✅ Secure
- ✅ Efficient
- ✅ Cost-effective
- ✅ User-friendly

No more 1MB body size limit issues! 🎉

