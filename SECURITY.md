# TestForge Dashboard - Security Guide

## Current Security Measures ✅

### 1. **API Key Protection**
- ✅ Groq API key stored in `.env.local` (server-side only)
- ✅ `.env.local` is in `.gitignore` - never committed to Git
- ✅ API key only accessible from Next.js API routes (backend)
- ✅ Frontend never sees the API key

### 2. **Rate Limiting** (Production-Ready)
- ✅ Per-IP rate limiting to prevent API quota exhaustion
- ✅ Returns 429 status with retry-after header
- ✅ Proper IP extraction from proxy headers
- ✅ Automatic cleanup of stale entries
- ✅ Sliding window algorithm implementation

**Why This Matters:**
- Prevents attackers from exhausting your Groq API quota
- Protects against denial-of-service attacks
- Ensures fair usage across all users

### 3. **Input Validation** (Zod Schema)
- ✅ Validates all incoming chat requests
- ✅ Message content length limits enforced
- ✅ Conversation history size limits enforced
- ✅ Role validation (prevents prompt injection)
- ✅ All context fields validated against enums
- ✅ Returns 400 status for invalid requests

### 4. **Security Headers** (Production-Ready)
- ✅ `X-Frame-Options: DENY` - Prevents clickjacking
- ✅ `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- ✅ `Strict-Transport-Security` - Enforces HTTPS
- ✅ `Content-Security-Policy` - XSS protection via middleware
- ✅ `Referrer-Policy` - Privacy protection
- ✅ `Permissions-Policy` - Disables unnecessary features
- ✅ CORS configured for API routes

### 5. **Error Handling** (Sanitized)
- ✅ Generic error messages to clients (no implementation details)
- ✅ Detailed errors logged server-side only
- ✅ No file structure exposed
- ✅ No rate limit implementation details exposed
- ✅ No API key information leaked

---

## Groq API Free Tier Limits

**Free Tier:**
- ✅ Per-minute request limits
- ✅ Per-day request limits
- ✅ **100% FREE** - No billing required
- ✅ Super fast inference (fastest LLM API available)

**Model Used:**
- `llama-3.3-70b-versatile` - Fast and powerful with function calling
- `llama-3.1-8b-instant` - Ultra-fast for function calling

**Note:** Groq is completely free for the free tier limits. No credit card required!

---

## Set Up API Key 🔑

### Step 1: Get Your Free Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign up or log in
3. Click **"Create API Key"**
4. Name it: "TestForge Dashboard"
5. Copy the key
6. Add it to `.env.local`:

```bash
GROQ_API_KEY=gsk_your_key_here
```

### Step 2: Monitor Usage

1. Go to: https://console.groq.com/
2. Check the **"Usage"** section
3. Monitor your daily request count

**No billing setup needed** - Groq free tier is truly free!

---

## Additional Security Recommendations

### For Public Deployment

If you deploy this publicly, consider these additional protections:

#### 1. **Environment-Based Access Control**

Add authentication for production environments to restrict who can access your API endpoints.

#### 2. **CORS Restrictions**

Set the `ALLOWED_ORIGIN` environment variable in your Vercel deployment settings to restrict API access to your domain only:

```
ALLOWED_ORIGIN=https://yourdomain.vercel.app
```

#### 3. **Upgrade Rate Limiter for Production**

For production deployments with multiple server instances, consider using a distributed rate limiting solution like Upstash Redis for consistent rate limiting across all instances.

```bash
npm install @upstash/redis @upstash/ratelimit
```

#### 4. **Add Request Logging & Monitoring**

Monitor for unusual patterns:
- Excessive requests from single IPs
- Suspicious user agents
- Failed authentication attempts
- Rate limit violations

Consider using services like Sentry, LogRocket, or Vercel Analytics.

---

## Security Checklist

### Development (Current Setup)
- [x] API keys in `.env.local`
- [x] `.env.local` in `.gitignore`
- [x] Rate limiting implemented
- [x] Input validation
- [x] Error handling
- [x] Free tier - no billing concerns

### Before Public Deployment
- [x] **Rate limiting implemented** - Production-ready
- [x] **Input validation** - Zod schema validates all requests
- [x] **Security headers** - CSP, X-Frame-Options, HSTS configured
- [x] **Error sanitization** - Generic messages, no leaks
- [x] **CORS configured** - Set `ALLOWED_ORIGIN` env var
- [ ] Set `ALLOWED_ORIGIN` environment variable in Vercel
- [ ] Test rate limiting after deployment
- [ ] Monitor Groq usage dashboard for first 24 hours
- [ ] Optional: Add authentication/authorization
- [ ] Optional: Upgrade to Redis-based rate limiting (Upstash)
- [ ] Optional: Set up monitoring/alerting (Sentry, LogRocket, etc.)
- [ ] Optional: Add DDoS protection (Cloudflare)

---

## Monitoring Dashboard

Check these regularly:

1. **Groq Console - Usage**: https://console.groq.com/
2. **API Keys Management**: https://console.groq.com/keys

**Recommended Monitoring Frequency:**
- First week after deployment: Daily
- First month: Weekly
- Ongoing: Monthly

---

## Emergency Response

### If You Notice Unusual Activity:

1. **Immediately** - Rotate the API key:
   - Go to: https://console.groq.com/keys
   - Delete the compromised key
   - Generate a new one
   - Update `.env.local` with the new key
   - Redeploy to Vercel

2. **Review logs**:
   - Check Vercel function logs for suspicious patterns
   - Look for repeated requests from same IPs
   - Check for unusual request patterns

3. **Temporarily restrict access** if needed:
   - Update CORS settings to be more restrictive
   - Consider adding temporary IP blocking
   - Enable authentication if not already present

4. **Check usage**:
   - Go to https://console.groq.com/
   - Review the usage dashboard
   - Verify you're within expected limits

---

## Best Practices

✅ **DO:**
- Keep your Groq API key secret
- Use environment variables
- Review logs regularly (at least monthly)
- Rotate API keys every 90 days
- Monitor daily usage in Groq console
- Set `ALLOWED_ORIGIN` in production
- Use separate API keys for dev/staging/production

❌ **DON'T:**
- Commit `.env.local` to Git
- Share API keys in chat/email/screenshots
- Deploy without rate limiting
- Use the same API key across multiple projects
- Expose implementation details publicly
- Ignore unusual usage patterns

---

## Groq Advantages

✅ **Why Groq?**
- **100% Free** - No credit card required for free tier
- **Super Fast** - Fastest LLM inference available (~10x faster than others)
- **Generous Limits** - Suitable for personal projects and demos
- **OpenAI Compatible** - Easy to use SDK
- **Function Calling** - Full support for tool use
- **No Billing Surprises** - Free tier has hard limits, won't charge you

---

## Frequently Asked Questions

**Q: What happens if someone attacks my API?**
A: Rate limiting prevents quota exhaustion. Attackers will hit rate limits and receive 429 errors. Your Groq quota remains protected.

**Q: Can my API key be stolen?**
A: No. The API key is stored server-side only (`.env.local`) and never exposed to the browser. Only your Next.js API routes can access it.

**Q: What if I exceed the free tier limits?**
A: Groq free tier has hard limits. Requests will be rejected, but you won't be charged. Consider implementing a queue or upgrading to a paid plan if needed.

**Q: Should I worry about CORS attacks?**
A: Set `ALLOWED_ORIGIN` in your Vercel environment variables to restrict API access to your domain only. This prevents other websites from calling your API.

**Q: How do I know if someone is abusing my API?**
A: Monitor the Groq usage dashboard at https://console.groq.com/. Unusual spikes in usage indicate potential abuse.

---

## Additional Resources

- **Groq Documentation**: https://console.groq.com/docs
- **Groq Rate Limits**: https://console.groq.com/docs/rate-limits
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## Support

If you discover a security vulnerability, please:
1. **DO NOT** open a public issue
2. Contact the maintainer privately
3. Allow time for a fix before public disclosure

---

**Remember:** Security is a continuous process, not a one-time setup. Regularly review logs, rotate keys, and stay updated with best practices.
