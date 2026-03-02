/* ============================================
   Code Renderer — Generates codes on canvas
   ============================================ */

const Renderer = {
  currentType: 'qrcode',
  errorCorrection: 'M',
  logoImage: null,
  settings: {
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    eyeColor: null,
    gradientType: 'none',
    gradientEnd: '#0066FF',
    bodyShape: 'square',
    eyeShape: 'square',
    logoSize: 20,
    logoTransparent: true,
    frameStyle: 'none',
    frameText: 'SCAN ME',
    frameColor: '#000000'
  },

  // ═══════════════════════════════════════════════════════════════
  // ANTI-ID SECURITY SYSTEM — Detects & blocks driver license / ID data
  // Scans ALL code types. Zero tolerance for AAMVA patterns.
  // ═══════════════════════════════════════════════════════════════

  // Check if data contains AAMVA / driver license / ID patterns
  // Works across ALL code types — not limited to PDF417/Aztec
  isRestrictedIDType(dataOverride) {
    const data = (dataOverride || this._getDataForDetection() || '').toUpperCase();
    if (!data || data.length < 5) return false;

    // ── HIGH CONFIDENCE: Block immediately ──

    // AAMVA header signature
    if (data.includes('ANSI 6')) return true;
    if (data.includes('AAMVA')) return true;
    if (/\x1[eE]\r/.test(data)) return true;  // AAMVA record separator

    // AAMVA mandatory field codes (any 2+ = blocked)
    const aamvaMandatory = ['DCS', 'DAC', 'DAQ', 'DBB', 'DBA', 'DAG', 'DAI', 'DAJ', 'DAK'];
    let mandatoryHits = 0;
    for (const f of aamvaMandatory) {
      if (data.includes(f)) mandatoryHits++;
    }
    if (mandatoryHits >= 2) return true;

    // Extended AAMVA field codes (any 3+ = blocked)
    const aamvaExtended = ['DCG', 'DDE', 'DDF', 'DDG', 'DAD', 'DCF', 'DCK', 'DDC', 'DDB', 'DDA', 'DBC', 'DCU', 'DCE', 'DCL', 'DCM', 'DCN', 'DCO', 'DCP', 'DCQ', 'DCR', 'DCS', 'DAH', 'DAZ', 'DBD', 'DCI', 'DCJ'];
    let extHits = 0;
    for (const f of aamvaExtended) {
      if (data.includes(f)) extHits++;
    }
    if (extHits >= 3) return true;

    // ── MEDIUM CONFIDENCE: Keyword scanning ──

    // Single high-risk keywords (instant block)
    const instantBlock = ['DRIVER LICENSE', 'DRIVERS LICENSE', "DRIVER'S LICENSE", 'DRIVER LICENCE', 'DRIVERS LICENCE', "DRIVER'S LICENCE", 'IDENTIFICATION CARD', 'STATE ID', 'REAL ID', 'NATIONAL ID', 'IDENTITY CARD', 'FAKE ID', 'NOVELTY ID'];
    for (const kw of instantBlock) {
      if (data.includes(kw)) return true;
    }

    // Combined keyword detection (any 1+ from each group)
    const groupA = ['DRIVER', 'LICENSE', 'LICENCE', 'PERMIT', 'IDENTIFICATION'];
    const groupB = ['DOB', 'DATE OF BIRTH', 'EXPIR', 'ADDRESS', 'JURISDICTION', 'RESTRICTION', 'ENDORSEMENT', 'CLASS', 'ORGAN DONOR', 'VETERAN', 'HEIGHT', 'WEIGHT', 'EYES', 'HAIR', 'SEX'];
    let hitA = false, hitB = false;
    for (const kw of groupA) { if (data.includes(kw)) { hitA = true; break; } }
    for (const kw of groupB) { if (data.includes(kw)) { hitB = true; break; } }
    if (hitA && hitB) return true;

    // ── LOW CONFIDENCE: Structural pattern matching ──

    // Data looks like structured ID fields (KEY:VALUE or KEY=VALUE repeated)
    const idFieldPattern = /(?:NAME|FIRST|LAST|SURNAME|DOB|BIRTH|ADDR|CITY|STATE|ZIP|LICENSE|LICENCE|ID.?NUM|DL.?NUM|EXP|ISS)/gi;
    const fieldMatches = data.match(idFieldPattern);
    if (fieldMatches && fieldMatches.length >= 4) return true;

    // JSON-like structure with ID fields
    if (data.includes('{') && data.includes('}')) {
      const jsonIdFields = ['"FIRST', '"LAST', '"NAME', '"DOB', '"BIRTH', '"LICENSE', '"ADDRESS', '"STATE', '"EXPIR', '"DL'];
      let jsonHits = 0;
      for (const f of jsonIdFields) {
        if (data.includes(f)) jsonHits++;
      }
      if (jsonHits >= 3) return true;
    }

    return false;
  },

  // Sanitize/corrupt any AAMVA field data found in content to prevent usable output
  _sanitizeIDData(data) {
    let s = data;
    // Corrupt all AAMVA field values
    s = s.replace(/DCS[^\n\r]*/g, 'DCSBLOCKED');
    s = s.replace(/DAC[^\n\r]*/g, 'DACBLOCKED');
    s = s.replace(/DAD[^\n\r]*/g, 'DADX');
    s = s.replace(/DAQ[^\n\r]*/g, 'DAQ000000000');
    s = s.replace(/DBB[^\n\r]*/g, 'DBB01012099');
    s = s.replace(/DBA[^\n\r]*/g, 'DBA01012099');
    s = s.replace(/DAG[^\n\r]*/g, 'DAG000 BLOCKED');
    s = s.replace(/DAI[^\n\r]*/g, 'DAIBLOCKED');
    s = s.replace(/DAJ[^\n\r]*/g, 'DAJZZ');
    s = s.replace(/DAK[^\n\r]*/g, 'DAK00000');
    s = s.replace(/DCF[^\n\r]*/g, 'DCFBLOCKED');
    s = s.replace(/DCG[^\n\r]*/g, 'DCGBLK');
    // Inject VOID marker into the data stream
    s = 'VOID-TEST-NOT-VALID\n' + s + '\nVOID-BLOCKED-BY-KODKAFALI';
    return s;
  },

  // Helper to get current data from templates for content detection
  _getDataForDetection() {
    try {
      return typeof Templates !== 'undefined' ? Templates.getData() : '';
    } catch (e) {
      return '';
    }
  },

  // Draw HEAVY VOID watermark tiled across canvas — maximum density
  _drawVoidWatermark(ctx, w, h) {
    ctx.save();
    // Layer 1: Dense red VOID tiling
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const texts = ['VOID', 'BLOCKED', 'NOT VALID', 'FAKE', 'VOID'];
    let idx = 0;
    for (let y = 20; y < h; y += 40) {
      for (let x = 20; x < w; x += 100) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.4);
        ctx.fillText(texts[idx % texts.length], 0, 0);
        ctx.restore();
        idx++;
      }
    }
    // Layer 2: Large diagonal "VOID" across entire canvas
    ctx.globalAlpha = 0.15;
    ctx.font = 'bold ' + Math.floor(Math.min(w, h) * 0.35) + 'px monospace';
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.5);
    ctx.fillText('VOID', 0, 0);
    ctx.restore();

    // Layer 3: Red X through the barcode area
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = Math.max(4, w * 0.015);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.stroke();
    ctx.restore();
  },

  // Draw corner notches on canvas
  _drawCornerNotch(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    const n = 20;
    // Top-left
    ctx.beginPath(); ctx.moveTo(0, n); ctx.lineTo(0, 0); ctx.lineTo(n, 0); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(w - n, 0); ctx.lineTo(w, 0); ctx.lineTo(w, n); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(0, h - n); ctx.lineTo(0, h); ctx.lineTo(n, h); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(w - n, h); ctx.lineTo(w, h); ctx.lineTo(w, h - n); ctx.stroke();
    ctx.restore();
  },

  // Draw header + footer security bands
  _drawSecurityHeader(ctx, w, totalH) {
    // Top header band
    ctx.save();
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(0, 0, w, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⛔ BLOCKED — FAKE ID GENERATION IS A FEDERAL CRIME ⛔', w / 2, 16);
    ctx.restore();

    // Bottom footer band
    ctx.save();
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(0, totalH - 28, w, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('THIS OUTPUT IS CORRUPTED AND CANNOT BE USED AS IDENTIFICATION', w / 2, totalH - 14);
    ctx.restore();
  },

  // Apply HEAVY security overlays for restricted types
  _applySecurityOverlays(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Shift content down for header, add footer space
    const headerH = 32;
    const footerH = 28;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    canvas.height = h + headerH + footerH;
    const ctx2 = canvas.getContext('2d');
    ctx2.fillStyle = '#e8eaf6';
    ctx2.fillRect(0, 0, w, canvas.height);
    ctx2.drawImage(tempCanvas, 0, headerH);

    this._drawSecurityHeader(ctx2, w, canvas.height);
    this._drawVoidWatermark(ctx2, w, canvas.height);
    this._drawCornerNotch(ctx2, w, canvas.height);
  },

  // Check if type is a QR code (custom renderer with shapes/logos)
  isQRType() {
    const qrTypes = ['qrcode', 'epcqr', 'swissqr', 'upiqr', 'pixqr'];
    return qrTypes.includes(this.currentType);
  },

  // Check if type is a 2D code (rendered via bwip-js)
  is2DType() {
    const typeInfo = getTypeById(this.currentType);
    if (!typeInfo) return false;
    const twoDEncoders = [
      'datamatrix', 'datamatrixrectangular', 'datamatrixrectangularextension',
      'azteccode', 'azteccodecompact', 'pdf417', 'pdf417compact', 'micropdf417',
      'maxicode', 'dotcode', 'hanxin', 'gridmatrix', 'codeone', 'ultracode',
      'gs1qrcode', 'gs1datamatrix', 'microqrcode', 'rectangularmicroqrcode',
      'hibcdatamatrix', 'hibcqrcode', 'hibcpdf417', 'hibcazteccode',
      'hibccodablockf', 'hibcmicropdf417', 'code16k', 'code49', 'codablockf'
    ];
    return twoDEncoders.includes(typeInfo.bwip);
  },

  // Check if type is a 1D barcode
  is1DType() {
    return !this.isQRType() && !this.is2DType();
  },

  // Map type to bwip-js encoder name using CODE_TYPES registry
  getBwipType() {
    const typeInfo = getTypeById(this.currentType);
    if (typeInfo) return typeInfo.bwip;
    return this.currentType;
  },

  // Generate QR Code with full customization
  generateQR(data, canvas, size = 400) {
    if (!data) return false;

    const ec = this.logoImage ? 'H' : this.errorCorrection;
    const ecMap = { 'L': 1, 'M': 0, 'Q': 3, 'H': 2 };

    let qr;
    // Try different type numbers to find one that fits
    for (let typeNum = 1; typeNum <= 40; typeNum++) {
      try {
        qr = qrcode(typeNum, ecMap[ec] !== undefined ? ['L', 'M', 'Q', 'H'][ecMap[ec]] : 'M');
        qr.addData(data);
        qr.make();
        break;
      } catch (e) {
        if (typeNum === 40) {
          console.error('Data too large for QR code');
          return false;
        }
      }
    }

    const moduleCount = qr.getModuleCount();
    const s = this.settings;

    // Calculate frame space
    let frameTopPad = 0;
    let frameBotPad = 0;
    if (s.frameStyle === 'banner-top') frameTopPad = 48;
    if (s.frameStyle === 'banner-bottom') frameBotPad = 48;
    if (s.frameStyle === 'simple' || s.frameStyle === 'rounded') {
      frameTopPad = 8;
      frameBotPad = 48;
    }

    const totalHeight = size + frameTopPad + frameBotPad;
    canvas.width = size;
    canvas.height = totalHeight;

    const ctx = canvas.getContext('2d');
    const margin = Math.floor(size * 0.06);
    const codeSize = size - margin * 2;
    const cellSize = codeSize / moduleCount;

    // Clear background
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, size, totalHeight);

    // Draw frame background
    if (s.frameStyle !== 'none') {
      this._drawFrame(ctx, size, totalHeight, frameTopPad, frameBotPad);
    }

    const offsetY = frameTopPad;

    // Create gradient if needed
    let fillStyle = s.fgColor;
    if (s.gradientType === 'linear') {
      const grad = ctx.createLinearGradient(0, offsetY, size, offsetY + size);
      grad.addColorStop(0, s.fgColor);
      grad.addColorStop(1, s.gradientEnd);
      fillStyle = grad;
    } else if (s.gradientType === 'radial') {
      const center = size / 2;
      const grad = ctx.createRadialGradient(center, offsetY + center, 0, center, offsetY + center, size / 2);
      grad.addColorStop(0, s.fgColor);
      grad.addColorStop(1, s.gradientEnd);
      fillStyle = grad;
    }

    // Determine eye positions (the three finder patterns)
    const eyeSize = 7; // QR finder pattern is 7x7

    const isEyeModule = (row, col) => {
      // Top-left
      if (row < eyeSize && col < eyeSize) return true;
      // Top-right
      if (row < eyeSize && col >= moduleCount - eyeSize) return true;
      // Bottom-left
      if (row >= moduleCount - eyeSize && col < eyeSize) return true;
      return false;
    };

    const isEyeOuter = (row, col) => {
      // Top-left outer ring
      if ((row === 0 || row === 6) && col >= 0 && col <= 6) return true;
      if ((col === 0 || col === 6) && row >= 0 && row <= 6) return true;
      // Top-right
      if ((row === 0 || row === 6) && col >= moduleCount - 7 && col <= moduleCount - 1) return true;
      if ((col === moduleCount - 7 || col === moduleCount - 1) && row >= 0 && row <= 6) return true;
      // Bottom-left
      if ((row === moduleCount - 7 || row === moduleCount - 1) && col >= 0 && col <= 6) return true;
      if ((col === 0 || col === 6) && row >= moduleCount - 7 && row <= moduleCount - 1) return true;
      return false;
    };

    // Draw modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!qr.isDark(row, col)) continue;

        const x = margin + col * cellSize;
        const y = offsetY + margin + row * cellSize;
        const isEye = isEyeModule(row, col);

        if (isEye && s.eyeColor) {
          ctx.fillStyle = s.eyeColor;
        } else {
          ctx.fillStyle = fillStyle;
        }

        if (isEye) {
          this._drawEyeCell(ctx, x, y, cellSize, s.eyeShape);
        } else {
          this._drawBodyCell(ctx, x, y, cellSize, s.bodyShape);
        }
      }
    }

    // Draw logo
    if (this.logoImage) {
      const logoPercent = s.logoSize / 100;
      const logoW = codeSize * logoPercent;
      const logoH = codeSize * logoPercent;
      const lx = (size - logoW) / 2;
      const ly = offsetY + (size - logoW) / 2;

      if (s.logoTransparent) {
        // Clear behind logo
        ctx.fillStyle = s.bgColor;
        const pad = 8;
        ctx.beginPath();
        ctx.roundRect(lx - pad, ly - pad, logoW + pad * 2, logoH + pad * 2, 8);
        ctx.fill();
      }

      ctx.drawImage(this.logoImage, lx, ly, logoW, logoH);
    }

    return true;
  },

  // Draw body cell based on shape
  _drawBodyCell(ctx, x, y, size, shape) {
    const pad = size * 0.08;
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, (size - pad) / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + pad);
        ctx.lineTo(x + size - pad, y + size / 2);
        ctx.lineTo(x + size / 2, y + size - pad);
        ctx.lineTo(x + pad, y + size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'rounded':
        ctx.beginPath();
        ctx.roundRect(x + pad / 2, y + pad / 2, size - pad, size - pad, size * 0.25);
        ctx.fill();
        break;
      default: // square
        ctx.fillRect(x, y, size, size);
    }
  },

  // Draw eye cell based on shape
  _drawEyeCell(ctx, x, y, size, shape) {
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rounded':
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, size * 0.3);
        ctx.fill();
        break;
      default:
        ctx.fillRect(x, y, size, size);
    }
  },

  // Draw frame
  _drawFrame(ctx, width, totalHeight, topPad, botPad) {
    const s = this.settings;
    ctx.save();

    if (s.frameStyle === 'simple') {
      ctx.strokeStyle = s.frameColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, width - 8, totalHeight - 8);
      // Text at bottom
      ctx.fillStyle = s.frameColor;
      ctx.font = 'bold 18px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.frameText, width / 2, totalHeight - botPad / 2);
    } else if (s.frameStyle === 'rounded') {
      ctx.strokeStyle = s.frameColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(4, 4, width - 8, totalHeight - 8, 16);
      ctx.stroke();
      ctx.fillStyle = s.frameColor;
      ctx.font = 'bold 18px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.frameText, width / 2, totalHeight - botPad / 2);
    } else if (s.frameStyle === 'banner-bottom') {
      ctx.fillStyle = s.frameColor;
      ctx.fillRect(0, totalHeight - botPad, width, botPad);
      ctx.fillStyle = s.bgColor;
      ctx.font = 'bold 20px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.frameText, width / 2, totalHeight - botPad / 2);
    } else if (s.frameStyle === 'banner-top') {
      ctx.fillStyle = s.frameColor;
      ctx.fillRect(0, 0, width, topPad);
      ctx.fillStyle = s.bgColor;
      ctx.font = 'bold 20px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.frameText, width / 2, topPad / 2);
    }

    ctx.restore();
  },

  // Generate 1D/2D barcode using bwip-js
  generateBarcode(data, canvas, size = 400) {
    if (!data) return false;

    try {
      const bwipType = this.getBwipType();
      const is1D = this.is1DType();
      const typeInfo = getTypeById(this.currentType);

      const options = {
        bcid: bwipType,
        text: data,
        scale: 3,
        includetext: is1D,
        textxalign: 'center',
        backgroundcolor: this.settings.bgColor.replace('#', ''),
        barcolor: this.settings.fgColor.replace('#', ''),
      };

      // Type-specific adjustments
      if (is1D) {
        options.height = 15;
      }

      // ── Type-specific options for broken/special types ──

      // Grid Matrix: needs version hint
      if (bwipType === 'gridmatrix') {
        options.version = '1';
        options.eclevel = 2;
      }

      // rMQR (Rectangular Micro QR): needs version
      if (bwipType === 'rectangularmicroqrcode') {
        options.version = 'R7x43';
      }

      // Japan Post: expects numeric postal code, strip non-digits/dash
      if (bwipType === 'japanpost') {
        options.text = data.replace(/[^0-9\-]/g, '') || '1000001';
      }

      // MaxiCode: set mode 4 for generic data
      if (bwipType === 'maxicode') {
        options.mode = 4;
      }

      // Code One: set version
      if (bwipType === 'codeone') {
        options.version = 'B';
      }

      // Ultracode: set eclevel
      if (bwipType === 'ultracode') {
        options.eclevel = 2;
      }

      // Han Xin: needs eclevel
      if (bwipType === 'hanxin') {
        options.eclevel = 2;
      }

      // DotCode: no issue usually but add columns hint
      if (bwipType === 'dotcode') {
        options.columns = 20;
      }

      // GS1 types: need AI-format data (01)GTIN format
      if (bwipType === 'gs1qrcode' || bwipType === 'gs1datamatrix') {
        // If user doesn't provide AI format, wrap as GTIN
        if (!data.startsWith('(') && !data.startsWith('\u001d')) {
          options.text = '(01)' + data.replace(/[^0-9]/g, '').padEnd(14, '0').substring(0, 14);
        }
      }

      if (bwipType === 'gs1-128') {
        if (!data.startsWith('(') && !data.startsWith('\u001d')) {
          options.text = '(01)' + data.replace(/[^0-9]/g, '').padEnd(14, '0').substring(0, 14);
        }
      }

      // GS1 DataBar types: need GTIN-compatible numeric data
      const databarTypes = ['databaromni', 'databarlimited', 'databartruncated', 'databarstacked', 'databarstackedomni', 'databarexpanded', 'databarexpandedstacked'];
      if (databarTypes.includes(bwipType)) {
        if (bwipType === 'databarexpanded' || bwipType === 'databarexpandedstacked') {
          // Expanded can take AI strings
          if (!data.startsWith('(') && !data.startsWith('\u001d')) {
            options.text = '(01)' + data.replace(/[^0-9]/g, '').padEnd(14, '0').substring(0, 14);
          }
        } else {
          // Standard DataBar needs 14-digit GTIN
          options.text = data.replace(/[^0-9]/g, '').padEnd(14, '0').substring(0, 14);
        }
      }

      // Composite codes: need AI data + composite component
      if (bwipType.includes('composite')) {
        options.height = 12;
        // Format as AI string if not already
        if (!data.includes('|')) {
          options.text = '(01)' + data.replace(/[^0-9]/g, '').padEnd(14, '0').substring(0, 14) + '|(99)TEST';
        }
      }

      // Mailmark: needs specific format (9 or 22 chars)
      if (bwipType === 'mailmark') {
        // If data format doesn't match, try raw
        if (data.length < 22) {
          options.text = data.padEnd(22, '0');
        }
      }

      // USPS Intelligent Mail: expects 20, 25, 29, or 31 digits
      if (bwipType === 'onecode') {
        const digits = data.replace(/[^0-9]/g, '');
        if (![20, 25, 29, 31].includes(digits.length)) {
          options.text = digits.padEnd(20, '0').substring(0, 20);
        } else {
          options.text = digits;
        }
      }

      // Australia Post: needs FCC + sorting code format
      if (bwipType === 'auspost') {
        const digits = data.replace(/[^0-9]/g, '');
        if (digits.length < 8) {
          options.text = '11' + digits.padEnd(6, '0').substring(0, 6); // FCC 11 + 6 digits
        }
      }

      // Royal Mail: alphanumeric UK postcode format
      if (bwipType === 'royalmail') {
        options.text = data.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'EC1A1BB';
      }

      // KIX: Dutch postal code (alphanumeric)
      if (bwipType === 'kix') {
        options.text = data.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || '1234AB';
      }

      // POSTNET/PLANET: digits only, specific lengths
      if (bwipType === 'postnet' || bwipType === 'planet') {
        options.text = data.replace(/[^0-9]/g, '') || '12345';
      }

      // GS1 North American Coupon: specific AI format
      if (bwipType === 'gs1northamericancoupon') {
        if (!data.startsWith('(8110)')) {
          options.text = '(8110)' + data.replace(/[^0-9]/g, '').padEnd(20, '0').substring(0, 20);
        }
      }

      // Channel Code: 3-7 digits with value constraints  
      if (bwipType === 'channelcode') {
        const digits = data.replace(/[^0-9]/g, '');
        if (digits.length < 3) options.text = digits.padEnd(3, '0');
      }

      // HIBC codes: need +prefix
      const hibcTypes = ['hibccode128', 'hibccode39', 'hibcdatamatrix', 'hibcqrcode', 'hibcpdf417', 'hibcazteccode', 'hibccodablockf', 'hibcmicropdf417'];
      if (hibcTypes.includes(bwipType)) {
        if (!data.startsWith('+')) {
          options.text = '+' + data;
        }
      }

      // Identcode: 11 digits
      if (bwipType === 'identcode') {
        options.text = data.replace(/[^0-9]/g, '').padEnd(11, '0').substring(0, 11);
      }

      // Leitcode: 13 digits
      if (bwipType === 'leitcode') {
        options.text = data.replace(/[^0-9]/g, '').padEnd(13, '0').substring(0, 13);
      }

      // PZN: 7 digits (including check digit)
      if (bwipType === 'pzn') {
        options.text = data.replace(/[^0-9]/g, '').padEnd(7, '0').substring(0, 7);
      }

      // Flattermarken: digits only
      if (bwipType === 'flattermarken') {
        options.text = data.replace(/[^0-9]/g, '') || '1234';
      }

      // DAFT code: uppercase D/A/F/T only
      if (bwipType === 'daft') {
        options.text = data.replace(/[^DAFTdaft]/g, '').toUpperCase() || 'DAFT';
      }

      // Postal codes: specific bar heights
      const postalTypes = ['onecode', 'postnet', 'planet', 'royalmail', 'mailmark', 'japanpost', 'auspost', 'kix', 'daft', 'flattermarken'];
      if (postalTypes.includes(bwipType)) {
        options.height = 8;
        options.includetext = false;
      }

      // Special validation for certain types
      if (this.currentType === 'pharmacode') {
        const num = parseInt(data);
        if (isNaN(num) || num < 3 || num > 131070) {
          Utils.toast('Pharmacode must be a number between 3 and 131070', 'error');
          return false;
        }
      }

      if (this.currentType === 'ean13') {
        if (!/^\d{12,13}$/.test(data)) {
          Utils.toast('EAN-13 requires exactly 12 or 13 digits', 'error');
          return false;
        }
      }

      if (this.currentType === 'ean8') {
        if (!/^\d{7,8}$/.test(data)) {
          Utils.toast('EAN-8 requires exactly 7 or 8 digits', 'error');
          return false;
        }
      }

      if (this.currentType === 'upca') {
        if (!/^\d{11,12}$/.test(data)) {
          Utils.toast('UPC-A requires exactly 11 or 12 digits', 'error');
          return false;
        }
      }

      if (this.currentType === 'upce') {
        if (!/^\d{6,8}$/.test(data)) {
          Utils.toast('UPC-E requires 6-8 digits', 'error');
          return false;
        }
      }

      if (this.currentType === 'itf14') {
        if (!/^\d{13,14}$/.test(data)) {
          Utils.toast('ITF-14 requires exactly 13 or 14 digits', 'error');
          return false;
        }
      }

      if (this.currentType === 'isbn') {
        if (!/^(978|979)\d{9,10}$/.test(data.replace(/[- ]/g, ''))) {
          Utils.toast('ISBN requires a valid 13-digit ISBN (starting with 978/979)', 'error');
          return false;
        }
      }

      if (this.currentType === 'ean14') {
        if (!/^\d{13,14}$/.test(data)) {
          Utils.toast('EAN-14 requires exactly 13 or 14 digits', 'error');
          return false;
        }
      }

      if (this.currentType === 'sscc18') {
        if (!/^\d{17,18}$/.test(data)) {
          Utils.toast('SSCC-18 requires exactly 17 or 18 digits', 'error');
          return false;
        }
      }

      // Use a temp canvas for bwip-js
      const tmpCanvas = document.createElement('canvas');
      bwipjs.toCanvas(tmpCanvas, options);

      // Scale to target size
      canvas.width = size;
      const aspectRatio = tmpCanvas.height / tmpCanvas.width;
      canvas.height = Math.max(Math.floor(size * aspectRatio), is1D ? size * 0.4 : size);

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = this.settings.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      // Center the barcode
      const drawW = canvas.width * 0.9;
      const drawH = drawW * aspectRatio;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;
      ctx.drawImage(tmpCanvas, dx, dy, drawW, drawH);

      return true;
    } catch (e) {
      console.error('Barcode generation error:', e);
      Utils.toast(`Error: ${e.message || 'Invalid data for this code type'}`, 'error');
      return false;
    }
  },

  // Main render method
  render(data, canvas, size = 400) {
    if (!data) {
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      return false;
    }

    // ── ANTI-ID SECURITY: Detect & block ID/license data in ALL code types ──
    const isRestricted = this.isRestrictedIDType(data);

    if (isRestricted) {
      // Sanitize/corrupt the data before encoding
      data = this._sanitizeIDData(data);

      // Log security event
      console.warn('[KODKAFALI SECURITY] ID/license data detected — output blocked with security overlays.');
    }

    let savedFg, savedBg;
    if (isRestricted) {
      savedFg = this.settings.fgColor;
      savedBg = this.settings.bgColor;
      this.settings.fgColor = '#1a237e'; // dark blue — low contrast
      this.settings.bgColor = '#e8eaf6'; // light grey-blue
    }

    let success;
    if (this.isQRType()) {
      success = this.generateQR(data, canvas, size);
    } else {
      success = this.generateBarcode(data, canvas, size);
    }

    // Restore colors
    if (isRestricted) {
      this.settings.fgColor = savedFg;
      this.settings.bgColor = savedBg;
    }

    // Apply HEAVY security overlays for restricted types
    if (success && isRestricted) {
      this._applySecurityOverlays(canvas);
      Utils.toast('⚠ ID/License data detected — output has been blocked with security measures. Creating fake IDs is a federal crime.', 'error');
    }

    return success;
  },

  // Render code to a new canvas at specific size (for export)
  renderToCanvas(data, size) {
    const canvas = document.createElement('canvas');
    this.render(data, canvas, size);
    return canvas;
  }
};
