# 🌐 GitHub Pages Setup Instructions

## ✅ Step 1: Documents Uploaded ✅

Your legal documents are now on GitHub at: https://github.com/samuelvary1/CineMaze

## 🚀 Step 2: Enable GitHub Pages

### Go to GitHub Repository Settings:

1. **Open your browser** and go to: https://github.com/samuelvary1/CineMaze
2. **Click the "Settings" tab** (at the top of the repository page)
3. **Scroll down** to the "Pages" section in the left sidebar

### Enable Pages:

1. **Source**: Select "Deploy from a branch"
2. **Branch**: Select "main"
3. **Folder**: Select "/ (root)"
4. **Click "Save"**

### Wait for Deployment:

- GitHub will show a message: "Your site is being deployed"
- Wait 2-3 minutes for processing
- Refresh the Pages settings page

## 📋 Your Legal Document URLs:

Once GitHub Pages is enabled, your documents will be available at:

### 🔗 **Main Legal Page:**

```
https://samuelvary1.github.io/CineMaze/web-legal/
```

### 🔒 **Privacy Policy:**

```
https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
```

### 📜 **Terms of Service:**

```
https://samuelvary1.github.io/CineMaze/web-legal/terms.html
```

## ✅ Next Steps After Deployment:

### 1. Test the URLs (5 minutes after enabling Pages):

- Click each URL above to verify they work
- Check that the documents display correctly
- Verify mobile responsiveness

### 2. Update App Store Connect (iOS):

- **Privacy Policy URL**: `https://samuelvary1.github.io/CineMaze/web-legal/privacy.html`
- **Support URL**: `https://samuelvary1.github.io/CineMaze/web-legal/`

### 3. Update Google Play Console (Android):

- **Privacy Policy**: `https://samuelvary1.github.io/CineMaze/web-legal/privacy.html`
- **Terms & Conditions**: `https://samuelvary1.github.io/CineMaze/web-legal/terms.html`

## 🔧 Optional: Custom Domain Setup

If you want a custom domain like `legal.cinemaze.com`:

1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **Add CNAME file** to your repository root:
   ```
   echo "legal.cinemaze.com" > CNAME
   git add CNAME && git commit -m "Add custom domain" && git push
   ```
3. **Update DNS** with your domain provider
4. **URLs become**: `https://legal.cinemaze.com/privacy.html`

## 🎯 Success Checklist:

- [ ] GitHub Pages enabled in repository settings
- [ ] Legal documents accessible via URLs
- [ ] Privacy Policy loads correctly
- [ ] Terms of Service loads correctly
- [ ] Mobile-responsive design works
- [ ] URLs ready for app store submission

## 🚨 Troubleshooting:

**If Pages don't work:**

- Make sure you selected "main" branch and "/ (root)" folder
- Wait 5-10 minutes for DNS propagation
- Check that files are in the correct `/web-legal/` folder

**If you get 404 errors:**

- Verify the exact file paths in your repository
- Make sure file names match exactly (case-sensitive)

## 📞 Need Help?

If you run into issues:

1. Check the GitHub Pages status in your repository settings
2. Look at the "Actions" tab for deployment logs
3. Verify file paths are correct

Your legal documents are now ready for app store submission! 🎉
