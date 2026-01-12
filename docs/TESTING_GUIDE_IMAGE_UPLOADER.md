# Image Uploader Testing Guide

## Quick Start Testing

### Prerequisites
1. Start the development server: `npm run dev`
2. Log in as an AGENT or ADMIN user
3. Navigate to: `/agent/tours/[any-tour-id]/edit`
4. Click on the "Images" tab

---

## Test Scenarios

### Scenario 1: Upload New Images ✅

**Steps:**
1. Click "Upload New Images" button
2. Select 2-3 images from your computer
3. Wait for upload to complete

**Expected Results:**
- ✅ Upload progress shown
- ✅ Toast: "X images uploaded successfully"
- ✅ Images appear in grid immediately
- ✅ First image has "Cover" badge
- ✅ Image count updates (e.g., "3 / 10 images")

**What to Check:**
- Images are visible and not broken
- Correct number of images shown
- Toast notification appears
- No console errors

---

### Scenario 2: Drag and Drop Upload ✅

**Steps:**
1. Open file explorer
2. Select 1-2 images
3. Drag them over the drop zone
4. Drop them

**Expected Results:**
- ✅ Drop zone highlights when dragging over
- ✅ Upload starts immediately
- ✅ Images appear in grid
- ✅ Success toast notification

**What to Check:**
- Visual feedback during drag
- Upload works without clicking button
- Images appear correctly

---

### Scenario 3: Browse Media Library ✅

**Steps:**
1. Click "Browse Media Library" button
2. Dialog opens showing all Cloudinary images

**Expected Results:**
- ✅ Dialog opens full screen
- ✅ Images displayed in grid (2-4 columns)
- ✅ Thumbnails load
- ✅ Search bar visible
- ✅ Selection counter shows "0 images selected"

**What to Check:**
- All previously uploaded images visible
- Grid is responsive
- Images load properly
- No broken thumbnails

---

### Scenario 4: Search in Media Library ✅

**Steps:**
1. Open media library
2. Type in search bar (e.g., "safari" or "jpg")
3. Observe results

**Expected Results:**
- ✅ Results filter in real-time
- ✅ Matching images shown
- ✅ Non-matching images hidden
- ✅ Clear button (X) appears
- ✅ Click X to clear search

**What to Check:**
- Search is case-insensitive
- Results update as you type
- Clear button works

---

### Scenario 5: Select Images from Library ✅

**Steps:**
1. Open media library
2. Click on 3 different images
3. Observe checkmarks appear
4. Check selection counter

**Expected Results:**
- ✅ Checkbox appears on selected images
- ✅ Image border turns blue/primary
- ✅ Ring effect around selected images
- ✅ Counter updates: "3 images selected"
- ✅ "Clear selection" button appears

**What to Check:**
- Visual selection state clear
- Can select/deselect by clicking
- Counter is accurate
- Clear selection works

---

### Scenario 6: Add Selected Images ✅

**Steps:**
1. Select 2-3 images in library
2. Click "Add Selected (3)" button
3. Dialog closes

**Expected Results:**
- ✅ Dialog closes
- ✅ Images added to tour image grid
- ✅ Toast: "3 images added"
- ✅ Images merge with existing selection
- ✅ No duplicates

**What to Check:**
- All selected images appear
- Order is maintained
- Duplicates prevented
- Toast shows correct count

---

### Scenario 7: Already Selected Badge ✅

**Steps:**
1. Have some images in tour
2. Open media library
3. Look for those images

**Expected Results:**
- ✅ Images already in tour have "Selected" badge
- ✅ Badge is green with white text
- ✅ These images can still be selected
- ✅ Selecting them doesn't create duplicates

**What to Check:**
- Badge clearly visible
- Easy to identify already used images
- No errors when selecting again

---

### Scenario 8: Remove from Selection ✅

**Steps:**
1. Have 3+ images in tour
2. Hover over second image
3. Click orange X button
4. Observe

**Expected Results:**
- ✅ Image removed from grid
- ✅ Toast: "Image removed from selection"
- ✅ Image count decreases
- ✅ Other images remain
- ✅ Image still in Cloudinary (check media library)

**What to Check:**
- Only that image removed
- Image can be re-added from library
- No errors in console
- Toast appears

---

### Scenario 9: Delete from Cloudinary ✅

**Steps:**
1. Have test image in tour
2. Hover over image
3. Click red trash button
4. Confirmation dialog appears
5. Read warning message
6. Click "Delete Permanently"

**Expected Results:**
- ✅ Confirmation dialog shows
- ✅ Warning: "This action cannot be undone"
- ✅ "Cancel" and "Delete Permanently" buttons
- ✅ After confirm: Loading state
- ✅ Image removed from grid
- ✅ Toast: "Image deleted from Cloudinary"
- ✅ Image gone from media library

**What to Check:**
- Confirmation required (safety)
- Warning is clear
- Can cancel without deleting
- Image permanently deleted
- Toast notification

---

### Scenario 10: Cancel Deletion ✅

**Steps:**
1. Click red trash on image
2. Dialog appears
3. Click "Cancel"

**Expected Results:**
- ✅ Dialog closes
- ✅ Image still in grid
- ✅ No deletion occurred
- ✅ No toast notification

**What to Check:**
- Easy to cancel
- No accidental deletions
- Image unchanged

---

### Scenario 11: Max Files Limit ✅

**Steps:**
1. Upload/select 10 images (max limit)
2. Try to upload/select more

**Expected Results:**
- ✅ "Upload" and "Browse" buttons disabled
- ✅ Toast error: "You can only upload up to 10 images"
- ✅ Drop zone hidden
- ✅ Counter shows "10 / 10 images"

**What to Check:**
- Limit enforced
- Clear feedback
- Can't exceed limit

---

### Scenario 12: File Validation ✅

**Steps:**
1. Try to upload:
   - A .txt file
   - A 10MB image
   - A .gif file

**Expected Results:**
- ✅ Toast: "file.txt is not a valid image format"
- ✅ Toast: "large.jpg exceeds 5MB limit"
- ✅ Only valid files upload
- ✅ Invalid files rejected

**What to Check:**
- Type validation works (JPG, PNG, WebP only)
- Size validation works (5MB max)
- Clear error messages

---

### Scenario 13: Save Tour with Images ✅

**Steps:**
1. Add/remove some images
2. Scroll down
3. Click "Save Changes" button
4. Reload page

**Expected Results:**
- ✅ Toast: "Tour saved successfully"
- ✅ Images persist after reload
- ✅ Cover image updates (first image)
- ✅ All selections saved

**What to Check:**
- Changes persist
- No data loss
- Cover image correct

---

### Scenario 14: Empty State ✅

**Steps:**
1. Create new tour or remove all images
2. View images tab

**Expected Results:**
- ✅ Empty state shown
- ✅ Image icon displayed
- ✅ Text: "No images selected yet"
- ✅ Helpful message about uploading/browsing
- ✅ Upload and browse buttons visible

**What to Check:**
- Not confusing
- Clear next steps
- Buttons work

---

### Scenario 15: Responsive Design ✅

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1440px

**Expected Results:**
- ✅ Grid adjusts columns:
  - Mobile: 2 columns
  - Tablet: 3 columns
  - Desktop: 4 columns
- ✅ Buttons don't overflow
- ✅ Dialog responsive
- ✅ Images maintain aspect ratio
- ✅ Text readable

**What to Check:**
- Layout doesn't break
- Everything accessible
- Touch-friendly on mobile

---

### Scenario 16: Loading States ✅

**Steps:**
1. Upload large images (slow connection)
2. Open media library (many images)
3. Delete image

**Expected Results:**
- ✅ Upload: Spinner in drop zone
- ✅ Upload: "Uploading X images..." text
- ✅ Library: Loading skeletons
- ✅ Delete: Button shows "Deleting..."
- ✅ Delete: Button disabled during deletion

**What to Check:**
- Never left wondering what's happening
- Spinners and progress indicators
- Disabled states prevent double-clicks

---

### Scenario 17: Pagination in Library ✅

**Steps:**
1. Have 30+ images in Cloudinary
2. Open media library
3. Scroll to bottom
4. Click "Load More"

**Expected Results:**
- ✅ "Load More" button visible
- ✅ Click loads next 30 images
- ✅ Button shows loading state
- ✅ New images append to grid
- ✅ Button hides when no more images

**What to Check:**
- Smooth loading
- No duplicates
- All images eventually loadable

---

### Scenario 18: Error Handling ✅

**Steps:**
1. Turn off internet
2. Try to upload
3. Try to delete
4. Open media library

**Expected Results:**
- ✅ Toast: "Failed to upload..."
- ✅ Toast: "Failed to delete..."
- ✅ Toast: "Failed to load media library"
- ✅ No crashes
- ✅ Can retry after reconnection

**What to Check:**
- Graceful failures
- Error messages helpful
- App doesn't crash
- Can recover

---

## Quick Smoke Test (5 minutes)

If you're short on time, test these critical flows:

1. **Upload**: Upload 2 images → Check they appear ✅
2. **Library**: Open library → Select 1 image → Add ✅
3. **Remove**: Remove 1 image (orange X) ✅
4. **Delete**: Delete 1 image (red trash) → Confirm ✅
5. **Save**: Save tour → Reload page → Check images persist ✅

If all 5 pass, the feature is working correctly.

---

## Known Limitations

1. **File Format**: Only JPG, PNG, WebP (no GIF, SVG, etc.)
2. **File Size**: 5MB maximum per image
3. **Total Images**: 10 images per tour maximum
4. **Pagination**: 30 images per page in library
5. **Search**: Basic text matching (no fuzzy search)

---

## Troubleshooting

### Images Not Appearing After Upload
- Check browser console for errors
- Verify Cloudinary credentials in `.env`
- Check network tab for failed API calls
- Try uploading smaller images

### Media Library Empty
- Ensure images exist in Cloudinary account
- Check folder: `safariplus/tours`
- Verify API credentials
- Check browser console

### Delete Not Working
- Verify image is from Cloudinary (correct URL format)
- Check you have AGENT/ADMIN permissions
- Confirm API credentials
- Check network errors

### Slow Performance
- Reduce image sizes before upload
- Check internet connection
- Clear browser cache
- Use smaller images in library

---

## Success Criteria

✅ All 18 test scenarios pass
✅ No console errors
✅ No broken images
✅ Responsive on all screen sizes
✅ All toast notifications appear
✅ Confirmation dialogs work
✅ Images persist after save
✅ No TypeScript errors
✅ Build completes successfully

---

## Reporting Issues

If you find bugs, please report:
1. What you were doing (steps to reproduce)
2. What happened (actual result)
3. What should have happened (expected result)
4. Browser and screen size
5. Console errors (if any)
6. Screenshots (if helpful)

---

## Summary

The ImageUploader component has been extensively enhanced with:
- ✅ Reliable upload functionality
- ✅ Media library browsing
- ✅ Search and filter
- ✅ Multi-select
- ✅ Remove vs Delete (two options)
- ✅ Confirmations for safety
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Type safety

**Happy Testing!** 🎉
