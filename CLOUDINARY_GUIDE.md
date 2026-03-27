# Cloudinary Integration Walkthrough

I have integrated Cloudinary as the image storage bucket for your platform.

### 1. Configuration Check
I have added the following placeholders to your `.env.local` file:
```env
# Cloudinary Config -- Replace these!
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Please replace these with your actual credentials from the [Cloudinary Dashboard](https://cloudinary.com/console).

### 2. New Components & Logic
- **`src/lib/cloudinary.js`**: Core configuration for the Cloudinary SDK.
- **`src/app/api/upload/route.js`**: A dedicated API endpoint that takes a base64 image and returns a Cloudinary URL.
- **Dashboard Updates**:
    - **Events**: Adding a new event now uploads the chosen banner to `events/[sport-name]` folder.
    - **Sport Identity**: In the **Settings** tab, you can now upload/change the sport's banner image, which is stored in `sports/[sport-name]`.

### 3. Database Persistence
- The **Admin Sports API** (`src/app/api/admin/sports/route.js`) has been updated to accept and save new images when metadata is updated.

### 4. How to use
When you select an image in the "New Event" or "Sport Settings" form:
1.  The browser shows a local preview (base64).
2.  When you click **Publish** or **Update**, the application first uploads that image to Cloudinary.
3.  It then receives a secure HTTPS URL and saves *that* URL into your MongoDB database.

---
**Note:** If you haven't yet, make sure to restart your dev server (`npm run dev`) after updating `.env.local` for the changes to take effect.
