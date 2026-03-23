# DriveGram - Car Feed React App

A React application that displays a luxury car gallery using Appwrite Functions as the backend.

## Setup Instructions

### 1. Install Dependencies

```bash
cd car-feed-app
npm install
```

### 2. Configure Appwrite

Open `src/App.js` and update these variables:

```javascript
const APPWRITE_FUNCTION_URL = 'https://cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions';
const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID';
```

To find these values:
- Go to your Appwrite Console
- Navigate to **Functions** → Your Function
- Copy the **Function ID** 
- Your function URL will be: `https://cloud.appwrite.io/v1/functions/{FUNCTION_ID}/executions`
- Get your **Project ID** from the project settings

### 3. Update Appwrite Function

Make sure your Appwrite function accepts query parameters and returns JSON in this format:

```json
{
  "cars": [
    {
      "$id": "unique-id",
      "brand": "Ferrari",
      "model": "F40",
      "title": "Ferrari F40 - Icon",
      "image_url": "https://...",
      "resolution": "1920x1080"
    }
  ],
  "lastId": "last-document-id",
  "hasMore": true
}
```

### 4. Enable CORS in Appwrite (if needed)

If you get CORS errors:

1. Go to Appwrite Console → **Settings** → **Platforms**
2. Add a new **Web Platform**
3. Add your development URL: `http://localhost:3000`
4. For production, add your deployed URL

### 5. Run the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

## Features

- ✅ Infinite scroll with "Load More" button
- ✅ Lazy loading images
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Instagram-style car feed
- ✅ Direct integration with Appwrite Functions

## Project Structure

```
car-feed-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main component with car feed logic
│   ├── App.css         # Styling
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json
└── README.md
```

## Troubleshooting

### CORS Issues
Make sure your Appwrite function allows your domain in the CORS settings.

### 404 Errors
Double-check your Function ID and Project ID in `App.js`.

### No Cars Loading
Check the browser console for errors and verify your Appwrite function is returning the correct JSON format.

### Appwrite Function Response Format
If your function returns a different format, update the parsing logic in `App.js`:

```javascript
const result = typeof data.response === 'string' 
  ? JSON.parse(data.response) 
  : data.response || data;
```