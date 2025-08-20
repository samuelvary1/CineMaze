# 📋 Legal Documents Deployment Guide

## ✅ What We Created

### Legal Documents

1. **Privacy Policy** (`PRIVACY_POLICY.md`) - Comprehensive privacy policy covering:

   - Data collection and usage
   - Third-party services (TMDB, App Store/Play Store)
   - User rights (GDPR/CCPA compliant)
   - Local data storage explanation
   - Contact information

2. **Terms of Service** (`TERMS_OF_SERVICE.md`) - Complete terms covering:
   - Subscription terms and billing
   - User responsibilities and acceptable use
   - Intellectual property rights
   - Liability limitations and disclaimers
   - Cancellation and refund policies

### Web Versions

Ready-to-deploy HTML versions in `/web-legal/`:

- `index.html` - Landing page with links to both documents
- `privacy.html` - Web version of privacy policy
- `terms.html` - Web version of terms of service

## 🌐 Hosting Options

### Option 1: GitHub Pages (FREE)

1. **Create GitHub Repository**:

   ```bash
   # Create new repo for legal documents
   git init cinemaze-legal
   cd cinemaze-legal
   # Copy web-legal files here
   ```

2. **Enable GitHub Pages**:

   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from branch" → "main"
   - Your documents will be available at: `https://yourusername.github.io/cinemaze-legal/`

3. **URLs for App Store**:
   - Privacy: `https://yourusername.github.io/cinemaze-legal/privacy.html`
   - Terms: `https://yourusername.github.io/cinemaze-legal/terms.html`

### Option 2: Netlify (FREE)

1. **Deploy to Netlify**:

   - Go to netlify.com
   - Drag and drop the `/web-legal/` folder
   - Get instant URL like: `https://amazing-name-123456.netlify.app/`

2. **Custom Domain** (Optional):
   - Register domain like `cinemaze.app`
   - Set up DNS to point to Netlify
   - URLs become: `https://cinemaze.app/privacy.html`

### Option 3: Vercel (FREE)

1. **Deploy to Vercel**:
   - Go to vercel.com
   - Import the `/web-legal/` folder
   - Get instant URL

### Option 4: Your Own Domain

If you have web hosting, simply upload the HTML files to your domain.

## 📱 App Store Requirements

### iOS App Store Connect

1. **Privacy Policy URL**: Required field in App Store Connect
2. **Support URL**: Can link to your main page
3. **Marketing URL**: Optional but recommended

### Google Play Console

1. **Privacy Policy**: Required in "Store listing" section
2. **Terms & Conditions**: Optional but recommended for subscriptions

## 🔧 Customization Guide

### Update Contact Information

Replace placeholder emails in the documents:

- `privacy@cinemaze.app` → Your actual email
- `legal@cinemaze.app` → Your actual email

### Update Company Information

If you have a company:

- Add company name and address
- Update governing law section
- Add business registration details

### Update URLs

Once hosted, update any placeholder URLs:

- Download links in `index.html`
- Cross-references between documents

## ⚖️ Legal Compliance Checklist

### ✅ Privacy Policy Covers:

- [x] Data collection practices
- [x] Third-party services (TMDB, Apple, Google)
- [x] User rights and choices
- [x] Children's privacy (COPPA)
- [x] GDPR/CCPA compliance
- [x] Contact information

### ✅ Terms of Service Covers:

- [x] Subscription terms and auto-renewal
- [x] Cancellation and refund policies
- [x] User responsibilities
- [x] Intellectual property rights
- [x] Limitation of liability
- [x] Dispute resolution

### ✅ App Store Compliance:

- [x] Subscription terms clearly disclosed
- [x] Auto-renewal explained
- [x] Cancellation instructions provided
- [x] Privacy practices documented

## 🚨 Important Notes

### Before Going Live:

1. **Legal Review**: Consider having a lawyer review these documents
2. **Custom Modifications**: Tailor to your specific business needs
3. **Regular Updates**: Keep documents current with app changes
4. **Compliance**: Ensure compliance with your jurisdiction's laws

### Subscription-Specific Requirements:

- **Auto-renewal disclosure**: ✅ Included
- **Cancellation instructions**: ✅ Included
- **Price and billing period**: ✅ Included
- **Free trial terms**: ✅ Covered (if offered)

### GDPR/CCPA Compliance:

- **Data minimization**: ✅ Most data stored locally
- **User rights**: ✅ Access, deletion, portability covered
- **Lawful basis**: ✅ Consent and legitimate interest explained
- **Data protection officer**: Update if required

## 📞 Next Steps

1. **Choose hosting option** and deploy the HTML files
2. **Update contact emails** to your actual addresses
3. **Test all links** and ensure documents load properly
4. **Add URLs to App Store Connect** and Google Play Console
5. **Consider legal review** before app submission

## 🔗 Quick Deploy Commands

### GitHub Pages:

```bash
# Copy files to new repo
cp -r web-legal/* /path/to/your-legal-repo/
cd /path/to/your-legal-repo/
git add .
git commit -m "Add legal documents"
git push origin main
```

### Netlify:

1. Zip the `web-legal` folder
2. Drag to netlify.com
3. Copy the generated URL

Your legal documents are now **production-ready** and **app store compliant**! 🎉
