# Testing Transcript API

## Endpoint Information

- **Path**: `POST /api/transcript`
- **Authentication**: Required (Bearer Token)
- **Content-Type**: `multipart/form-data`
- **Field Name**: `audio`
- **Supported Formats**: MP3, WAV, M4A, etc.

## Prerequisites

1. Start the server: `node app.js`
2. Get a valid JWT token by logging in

## Testing Methods

### 1. Using cURL

```bash
# First, login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Copy the token from response, then upload audio
curl -X POST http://localhost:3000/api/transcript \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "audio=@/path/to/your/audio.mp3"
```

### 2. Using Postman

1. **Login First**:
   - Method: `POST`
   - URL: `http://localhost:3000/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "Test123!@#"
     }
     ```
   - Copy the `token` from response

2. **Upload Audio**:
   - Method: `POST`
   - URL: `http://localhost:3000/api/transcript`
   - Headers:
     - `Authorization`: `Bearer YOUR_JWT_TOKEN`
   - Body:
     - Type: `form-data`
     - Key: `audio` (type: File)
     - Value: Select your audio file

### 3. Using JavaScript/Fetch

```javascript
// Login first
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!@#'
  })
});
const { token } = await loginResponse.json();

// Upload audio
const formData = new FormData();
formData.append('audio', audioFile); // audioFile is a File object

const response = await fetch('http://localhost:3000/api/transcript', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

## Expected Request

```
POST /api/transcript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

audio: [audio file]
```

## Expected Response

```json
{
  "success": true,
  "transcription": "This is the transcribed text from your audio...",
  "metadata": {
    "duration": 120.5,
    "language": "en",
    "confidence": 0.95
  }
}
```

## Common Errors

- **401 Unauthorized**: Missing or invalid token
- **400 Bad Request**: No audio file provided or invalid format
- **413 Payload Too Large**: File exceeds 10MB limit
- **429 Too Many Requests**: Rate limit exceeded

## Testing Tips

1. Use a small audio file (< 10MB) for testing
2. Ensure you have a valid token before making the request
3. Check server logs for detailed error messages
4. Verify your API key for the transcription service is set in `.env`
