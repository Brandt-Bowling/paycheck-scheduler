# Netlify Deployment Instructions

Follow these steps to deploy your site for free using Netlify:

### 1. Push Your Code to a Git Repository
- Make sure your project is hosted on a platform like GitHub, GitLab, or Bitbucket.

### 2. Sign Up for Netlify
- Go to [app.netlify.com/signup](https://app.netlify.com/signup) and create a free account. You can sign up with your Git provider account to make the process even smoother.

### 3. Create a New Site
- Log in to your Netlify dashboard.
- Click **"Add new site"** and select **"Import an existing project"**.
- Connect to your Git provider and authorize Netlify to access your repositories.

### 4. Select Your Repository
- Choose the repository you want to deploy.

### 5. Configure Build Settings
- Netlify will automatically detect the `netlify.toml` file in your project, which pre-configures the build settings.
- The `build command` should be set to `npm run build`.
- The `publish directory` should be set to `dist`.

### 6. Deploy Your Site
- Click the **"Deploy site"** button. Netlify will start the build and deployment process.
- Once the deployment is complete, you will be given a free URL where you can view your live site.

Your site is now deployed! Any time you push changes to your repository, Netlify will automatically redeploy your site with the latest updates.
