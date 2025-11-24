# Deploying Toyota Echo to Vercel

This guide will walk you through deploying the Toyota Echo dashboard to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is fine)
2. **GitHub/GitLab/Bitbucket Account**: Your code needs to be in a Git repository
3. **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

### Step 1: Push Your Code to Git

If you haven't already, push your code to GitHub/GitLab/Bitbucket:

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/toyota-echo.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect it's a Next.js project

### Step 3: Configure Project Settings

**Root Directory**: 
- If your Next.js app is in the `echo/` folder, set **Root Directory** to `echo`
- Or leave blank if the Next.js app is in the root

**Framework Preset**: Next.js (auto-detected)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

### Step 4: Set Environment Variables

Before deploying, add your environment variables:

1. In the project settings, go to **Settings** → **Environment Variables**
2. Add the following:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `GEMINI_API_KEY` | `your_api_key_here` | Production, Preview, Development |

3. Click **Save**

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Method 2: Deploy via Vercel CLI (For Developers)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Navigate to Project Directory

```bash
cd echo
```

### Step 4: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (first time) or Yes (if updating)
- **Project name?** → `toyota-echo` (or your preferred name)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

### Step 5: Set Environment Variables

```bash
vercel env add GEMINI_API_KEY
```

When prompted:
- **Environment**: Select all (Production, Preview, Development)
- **Value**: Paste your Gemini API key

### Step 6: Deploy to Production

```bash
vercel --prod
```

## Important Configuration

### Root Directory Setup

If your Next.js app is in the `echo/` subdirectory:

1. In Vercel Dashboard → **Settings** → **General**
2. Set **Root Directory** to `echo`
3. Save and redeploy

### Model Files

Your model files in `echo/model/` will be included automatically. If they're large:

1. **Option A**: Use Git LFS (for files > 50MB)
   ```bash
   git lfs install
   git lfs track "*.pkl"
   git lfs track "*.json"
   git add .gitattributes
   ```

2. **Option B**: Store in external storage (S3, Cloud Storage) and download on first request

### API Routes

All API routes in `src/app/api/` will automatically become serverless functions:
- `/api/predict` → Serverless function
- `/api/metrics` → Serverless function
- `/api/ask` → Serverless function
- `/api/upload` → Serverless function

## Post-Deployment Checklist

- [ ] Verify the app loads at your Vercel URL
- [ ] Test the Predictions tab (load dataset)
- [ ] Test the Analysis tab (check metrics)
- [ ] Test the Insights tab (ask a question)
- [ ] Verify Gemini API is working (check for API key errors)
- [ ] Check Vercel logs for any errors

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Build timeout"**
- Large model files might cause timeouts
- Consider using Git LFS or external storage

### API Routes Not Working

**Error: "Function timeout"**
- Check Vercel function logs
- API routes have a 10-second timeout on free tier
- Consider optimizing model loading

**Error: "Gemini API key not configured"**
- Verify environment variable is set in Vercel dashboard
- Make sure it's set for the correct environment (Production/Preview)
- Redeploy after adding environment variables

### Model Files Not Found

**Error: "Model file not found"**
- Verify model files are committed to Git
- Check file paths in API routes
- Ensure files are in `echo/model/` directory

### CORS Issues

Vercel automatically handles CORS for API routes. If you see CORS errors:
- Check that requests are going to the correct domain
- Verify API routes are in `src/app/api/` directory

## Updating Your Deployment

### Via Dashboard
1. Push changes to Git
2. Vercel automatically redeploys (if connected to Git)
3. Or manually trigger redeploy in Vercel dashboard

### Via CLI
```bash
cd echo
vercel --prod
```

## Environment Variables

### Required
- `GEMINI_API_KEY` - Your Google Gemini API key

### Optional (if needed)
- `NODE_ENV` - Set to `production` (auto-set by Vercel)

## Vercel Limits (Free Tier)

- **Build Time**: 45 minutes/month
- **Function Execution**: 100GB-hours/month
- **Function Timeout**: 10 seconds (Hobby), 60 seconds (Pro)
- **Bandwidth**: 100GB/month
- **Deployments**: Unlimited

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

## Monitoring

- **Logs**: View in Vercel Dashboard → **Deployments** → Click on deployment → **Functions** tab
- **Analytics**: Available in Vercel Dashboard
- **Real-time**: View logs in real-time during deployment

## Quick Deploy Commands

```bash
# First time setup
cd echo
vercel login
vercel
vercel env add GEMINI_API_KEY

# Production deploy
vercel --prod

# Preview deploy (for testing)
vercel

# View logs
vercel logs
```

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Support](https://vercel.com/support)

---

**Your app will be live at**: `https://your-project-name.vercel.app`

