/* ============================================
   Utility Functions
   ============================================ */

const Utils = {
  // Debounce helper
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Show toast notification
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // Color contrast checker (WCAG luminance)
  getLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  getContrastRatio(hex1, hex2) {
    const l1 = this.getLuminance(hex1);
    const l2 = this.getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  },

  // URL safety check (client-side heuristic)
  checkURLSafety(url) {
    if (!url || !url.match(/^https?:\/\//i)) return { safe: true };

    const suspicious = [];
    const urlLower = url.toLowerCase();

    // IP address URLs
    if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(url)) {
      suspicious.push('Uses IP address instead of domain name');
    }

    // Excessive subdomains
    try {
      const hostname = new URL(url).hostname;
      if (hostname.split('.').length > 4) {
        suspicious.push('Excessive subdomains');
      }
    } catch (e) {}

    // Common phishing keywords
    const phishingKeywords = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'paypal', 'password'];
    const domainPhishing = ['bit.do', '0rz.tw', 'bc.vc'];

    for (const kw of phishingKeywords) {
      if (urlLower.includes(kw) && urlLower.includes('@')) {
        suspicious.push(`Contains suspicious keyword: "${kw}" with @ symbol`);
        break;
      }
    }

    // @ symbol in URL (common in phishing)
    if (url.includes('@') && url.indexOf('@') > url.indexOf('://')) {
      suspicious.push('Contains @ symbol (potential redirect trick)');
    }

    // Double encoding
    if (url.includes('%25')) {
      suspicious.push('Double-encoded characters detected');
    }

    // Extremely long URL
    if (url.length > 500) {
      suspicious.push('Unusually long URL');
    }

    // Punycode / IDN
    if (urlLower.includes('xn--')) {
      suspicious.push('Uses internationalized domain (punycode) — verify domain carefully');
    }

    return {
      safe: suspicious.length === 0,
      warnings: suspicious
    };
  },

  // Download helper
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Format date for iCal
  formatICalDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
};
