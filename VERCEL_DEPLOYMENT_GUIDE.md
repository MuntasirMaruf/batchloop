# Vercel Free Hosting Guide — BatchLoop

This guide walks you step-by-step through deploying the **BatchLoop** B2B Wholesale Marketplace to **Vercel** for free on the **Hobby Plan**, complete with automatic continuous deployment (CI/CD) and Supabase production authentication configuration.

---

## Prerequisites
- A **GitHub** account with your code pushed to repository: `https://github.com/MuntasirMaruf/batchloop`
- A **Vercel** account (free Hobby tier): [vercel.com](https://vercel.com)
- Your **Supabase Project** dashboard: [supabase.com/dashboard](https://supabase.com/dashboard)

---

## Step 1: Connect Vercel to GitHub (Security Best Practice)

1. Log in to [vercel.com](https://vercel.com) using your GitHub account (`MuntasirMaruf`).
2. On your Vercel Dashboard, click **Add New...** (top-right) ➔ **Project**.
3. Under **Import Git Repository**, click the **Install** button with the GitHub icon.
4. On the GitHub authorization window (*Install Vercel*):
   * Select: **"Only select repositories"** (Recommended for security).
   * Open the repository dropdown and choose: **`batchloop`**.
   * Click the green **Install** button.
5. GitHub will authorize Vercel and redirect you back to the Vercel dashboard.

---

## Step 2: Import the `batchloop` Project

1. Under **Import Git Repository**, you will now see **`batchloop`** in the list.
2. Click the **Import** button next to `batchloop`.

---

## Step 3: Configure Project Settings

Vercel automatically detects Next.js:

* **Project Name**: `batchloop` *(or your preferred custom subdomain)*
* **Framework Preset**: `Next.js` *(auto-detected)*
* **Root Directory**: `./` *(default)*
* **Build Command**: `next build` *(default)*
* **Output Directory**: `.next` *(default)*

---

## Step 4: Add Environment Variables

Before clicking Deploy, click to expand the **Environment Variables** accordion and add the following keys:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yjftqolokilzpxthzzdh.supabase.co` | Your live Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_OYJfeFnuReY4TIWm_liAkg_dNHyDrb2` | Safe client-side API key |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Will be updated once NestJS backend is deployed |

> [!IMPORTANT]
> Make sure there are no trailing spaces or quotes around the values when pasting into the Vercel inputs.

---

## Step 5: Deploy

1. Click the blue **Deploy** button.
2. Vercel will:
   * Clone the repo
   * Install packages via `npm install`
   * Run TypeScript validation & Next.js production build (`next build`)
   * Optimize all static and dynamic routes
3. In ~45 seconds, the confetti celebration screen will appear with your live URL:  
   👉 `https://batchloop.vercel.app` *(or `https://batchloop-muntasirmaruf.vercel.app`)*

---

## Step 6: Configure Supabase Production Auth URLs (Critical!)

By default, Supabase Auth redirects only to `http://localhost:3000`. To ensure authentication redirects, invitations, and session cookies work seamlessly in production:

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project: `yjftqolokilzpxthzzdh`.
3. In the left navigation, go to **Authentication** ➔ **URL Configuration**.
4. Update **Site URL**:
   * Change from `http://localhost:3000` to your Vercel URL (e.g. `https://batchloop.vercel.app`).
5. Under **Redirect URLs**, click **Add URL**:
   * Add: `https://batchloop.vercel.app/**`
   * *(Keep `http://localhost:3000/**` in the list so local development continues to work).*
6. Click **Save Changes**.

---

## Step 7: Automatic Continuous Deployment (CI/CD)

Whenever you push code updates in the future, Vercel will automatically build and deploy them:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

* **Production Deployments**: Every commit pushed to `main` automatically updates your live site.
* **Preview Deployments**: If you create a git branch or pull request, Vercel gives you a unique preview URL to test before merging.

---

## Troubleshooting & Tips

### 1. Build Fails on Vercel
* Run local verification before pushing:
  ```bash
  npm run lint
  npx tsc --noEmit
  npm run build
  ```
  If this passes locally with 0 errors, it will pass on Vercel.

### 2. Custom Domain (Optional & Free)
If you own a custom domain (e.g., `batchloop.com` or `app.batchloop.com`):
1. In Vercel, go to your project ➔ **Settings** ➔ **Domains**.
2. Enter your domain.
3. Add the provided CNAME / A records in your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.).
4. Vercel issues free, auto-renewing SSL certificates automatically.
