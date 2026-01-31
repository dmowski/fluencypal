# Security Policy

## Supported Versions

FluencyPal is an actively developed open-source project.

Security updates are provided **only for the latest version on the `main` branch**.

| Version / Branch | Supported |
| ---------------- | --------- |
| `main`           | ✅ Yes    |
| older tags       | ❌ No     |
| forks            | ❌ No     |

If you are running a self-hosted or forked version, you are responsible for keeping it up to date.

---

## Reporting a Vulnerability

We take security issues seriously and appreciate responsible disclosure.

### 🔐 How to report

If you believe you have found a security vulnerability, **please do NOT open a public GitHub issue**.

Instead, report it privately using **GitHub’s Security Advisory feature**:

👉 Go to **Security → Advisories → New draft advisory** in this repository  
or  
👉 Use GitHub’s private vulnerability reporting if enabled

This allows us to investigate and fix the issue before public disclosure.

---

### 🧭 What to include

Please include as much detail as possible:
- A clear description of the issue
- Steps to reproduce (if applicable)
- Affected components or files
- Potential impact (data exposure, auth bypass, payments, etc.)
- Screenshots or logs (redact secrets)

---

### ⏱️ Response timeline

You can expect:
- **Initial response**: within **72 hours**
- **Status update**: within **7 days**, depending on severity
- **Fix & disclosure**: as soon as reasonably possible

Critical vulnerabilities (auth, payments, data leaks) are prioritized.

---

### 🚫 Out of scope

The following are **not considered security vulnerabilities**:
- Rate limiting issues on self-hosted deployments
- Missing environment variables or misconfiguration
- Social engineering attacks
- Issues caused by third-party services (OpenAI, Stripe, Firebase) unless directly exploitable through FluencyPal
- Denial-of-service via excessive API usage using valid credentials

---

### 🙏 Thanks

We appreciate responsible security researchers and community members who help keep FluencyPal safe for everyone.

Thank you for helping improve the security of open-source software ❤️
