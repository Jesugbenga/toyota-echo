# Gemini AI Insights Setup Guide

## What's Required

To get the AI Insights tab working, you need:

1. ✅ **Gemini API Key** (from Google)
2. ✅ **Environment Variable** (`GEMINI_API_KEY`)
3. ✅ **Data loaded** (telemetry, predictions, or metrics)

## Step-by-Step Setup

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Or visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)

### Step 2: Set Environment Variable

#### For Local Development

1. Create `.env.local` file in the project root:
   ```bash
   # In echo/ directory
   touch .env.local
   ```

2. Add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Important**: Restart your dev server:
   ```bash
   npm run dev
   ```

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your API key
   - **Environment**: Production, Preview, Development (select all)
4. **Redeploy** your application

### Step 3: Verify It Works

1. **Load some data** in the Predictions tab
2. Go to **Insights** tab
3. Type a question like: "What are the key performance insights?"
4. Click **Send** or press Enter
5. You should see AI-generated insights!

## Current Implementation

The `/api/ask` endpoint:
- ✅ Uses Gemini 1.5 Flash model (fast and free tier)
- ✅ Sends your question + telemetry data + predictions + metrics
- ✅ Returns formatted insights with key findings

## Troubleshooting

### Error: "Gemini API key not configured"

**Solution:**
- Check `.env.local` exists and has `GEMINI_API_KEY=...`
- Restart dev server after adding env variable
- For Vercel: Check environment variables in dashboard

### Error: "Gemini API error: 400"

**Possible causes:**
- Invalid API key
- API key not activated
- Quota exceeded

**Solution:**
- Verify API key is correct (no extra spaces)
- Check [Google AI Studio](https://aistudio.google.com/) for quota status
- Try generating a new API key

### Error: "No response from Gemini API"

**Possible causes:**
- Network issue
- API temporarily unavailable
- Invalid request format

**Solution:**
- Check internet connection
- Try again in a few moments
- Check browser console for detailed error

### Insights Tab Shows Loading Forever

**Possible causes:**
- API key not set
- Network timeout
- Invalid data format

**Solution:**
- Check browser console (F12) for errors
- Verify API key is set correctly
- Try with simpler question first

## API Usage & Costs

- **Gemini 1.5 Flash**: Free tier available
- **Rate limits**: Check [Google AI Studio](https://aistudio.google.com/) for current limits
- **Cost**: Free tier is generous for development/testing

## Testing Without API Key

If you want to test the UI without an API key:
- The Insights tab will show an error message
- You can still see the interface and test the flow
- But you won't get actual AI responses

## Example Questions to Try

Once set up, try asking:
- "What are the key performance insights?"
- "How can I improve my lap time?"
- "What does the braking data tell us?"
- "Compare my throttle usage to optimal racing"
- "What are the main areas for improvement?"

## Code Reference

- **API Route**: `src/app/api/ask/route.js`
- **Frontend Component**: `src/components/insights/InsightsConsole.jsx`
- **Environment Variable**: `GEMINI_API_KEY`

## Next Steps

After setup:
1. ✅ Test with a simple question
2. ✅ Try with loaded telemetry data
3. ✅ Test with predictions and metrics
4. ✅ Deploy to Vercel with env variable set

