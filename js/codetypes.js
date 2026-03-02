/* ============================================
   Code Types Registry — 100+ Barcode & QR Types
   Organized by category with bwip-js encoder names
   ============================================ */

const CODE_TYPES = {
  // ─── 2D Matrix Codes ─────────────────────────────────
  '2d': {
    label: '2D Matrix',
    icon: 'grid-3x3',
    badge: 'purple',
    description: 'High data density, electronics, boarding passes, packaging',
    types: [
      { id: 'qrcode', name: 'QR Code', bwip: 'qrcode', popular: true, desc: 'Universal 2D code' },
      { id: 'microqrcode', name: 'Micro QR', bwip: 'microqrcode', desc: 'Smaller QR variant for tight spaces' },
      { id: 'rectangularmicroqrcode', name: 'rMQR', bwip: 'rectangularmicroqrcode', desc: 'Rectangular Micro QR for narrow areas', featured: true },
      { id: 'datamatrix', name: 'Data Matrix', bwip: 'datamatrix', popular: true, desc: 'Compact 2D for industrial/electronics' },
      { id: 'datamatrixrectangular', name: 'Data Matrix Rect.', bwip: 'datamatrixrectangular', desc: 'Rectangular Data Matrix variant' },
      { id: 'datamatrixrectangularextension', name: 'DMRE', bwip: 'datamatrixrectangularextension', desc: 'Data Matrix Rectangular Extension' },
      { id: 'azteccode', name: 'Aztec Code', bwip: 'azteccode', popular: true, desc: 'Used on boarding passes' },
      { id: 'azteccodecompact', name: 'Aztec Compact', bwip: 'azteccodecompact', desc: 'Smaller Aztec variant' },
      { id: 'pdf417', name: 'PDF417', bwip: 'pdf417', popular: true, desc: 'IDs, boarding passes, shipping' },
      { id: 'pdf417compact', name: 'PDF417 Compact', bwip: 'pdf417compact', desc: 'Truncated PDF417 variant' },
      { id: 'micropdf417', name: 'Micro PDF417', bwip: 'micropdf417', desc: 'Micro variant for small items' },
      { id: 'maxicode', name: 'MaxiCode', bwip: 'maxicode', popular: true, desc: 'UPS bullseye code for shipping', featured: true },
      { id: 'dotcode', name: 'DotCode', bwip: 'dotcode', desc: 'High-speed industrial printing', featured: true },
      { id: 'hanxin', name: 'Han Xin', bwip: 'hanxin', desc: 'Chinese national 2D standard' },
      { id: 'gridmatrix', name: 'Grid Matrix', bwip: 'gridmatrix', desc: 'Chinese Grid Matrix code' },
      { id: 'codeone', name: 'Code One', bwip: 'codeone', desc: 'High-density 2D matrix' },
      { id: 'ultracode', name: 'Ultracode', bwip: 'ultracode', desc: 'Color-capable 2D code' },
    ]
  },

  // ─── GS1 Standards ───────────────────────────────────
  'gs1': {
    label: 'GS1 Standards',
    icon: 'globe',
    badge: 'cyan',
    description: 'Global supply chain standards, Digital Link (2027 standard)',
    types: [
      { id: 'gs1qrcode', name: 'GS1 QR Code', bwip: 'gs1qrcode', popular: true, desc: 'GS1 Application Identifier QR', featured: true },
      { id: 'gs1datamatrix', name: 'GS1 Data Matrix', bwip: 'gs1datamatrix', desc: 'GS1 Data Matrix for supply chain' },
      { id: 'gs1-128', name: 'GS1-128', bwip: 'gs1-128', popular: true, desc: 'Logistics & supply chain' },
      { id: 'gs1northamericancoupon', name: 'GS1 NA Coupon', bwip: 'gs1northamericancoupon', desc: 'North American coupon code' },
      { id: 'gs1dlqrcode', name: 'GS1 Digital Link QR', bwip: 'gs1qrcode', desc: '2027 UPC replacement standard', featured: true },
      { id: 'databaromni', name: 'GS1 DataBar Omni', bwip: 'databaromni', desc: 'Omnidirectional DataBar' },
      { id: 'databarlimited', name: 'GS1 DataBar Limited', bwip: 'databarlimited', desc: 'Limited DataBar for small items' },
      { id: 'databartruncated', name: 'GS1 DataBar Truncated', bwip: 'databartruncated', desc: 'Truncated variant' },
      { id: 'databarstacked', name: 'GS1 DataBar Stacked', bwip: 'databarstacked', desc: 'Stacked variant for produce' },
      { id: 'databarstackedomni', name: 'GS1 DataBar Stacked Omni', bwip: 'databarstackedomni', desc: 'Stacked omnidirectional' },
      { id: 'databarexpanded', name: 'GS1 DataBar Expanded', bwip: 'databarexpanded', desc: 'Extended DataBar for coupons' },
      { id: 'databarexpandedstacked', name: 'GS1 DataBar Exp. Stacked', bwip: 'databarexpandedstacked', desc: 'Expanded stacked variant' },
    ]
  },

  // ─── Retail & EAN/UPC ────────────────────────────────
  'retail': {
    label: 'Retail & EAN/UPC',
    icon: 'shopping-cart',
    badge: 'green',
    description: 'Consumer products, groceries, books, magazines',
    types: [
      { id: 'upca', name: 'UPC-A', bwip: 'upca', popular: true, desc: 'US/Canada retail products' },
      { id: 'upce', name: 'UPC-E', bwip: 'upce', desc: 'Compressed UPC for small items' },
      { id: 'ean13', name: 'EAN-13', bwip: 'ean13', popular: true, desc: 'International retail products' },
      { id: 'ean8', name: 'EAN-8', bwip: 'ean8', popular: true, desc: 'Short EAN for small products' },
      { id: 'ean2', name: 'EAN-2 Add-on', bwip: 'ean2', desc: 'Periodical issue number' },
      { id: 'ean5', name: 'EAN-5 Add-on', bwip: 'ean5', desc: 'Suggested retail price' },
      { id: 'ean14', name: 'EAN-14', bwip: 'ean14', desc: 'Outer packaging / cartons' },
      { id: 'isbn', name: 'ISBN (Bookland)', bwip: 'isbn', popular: true, desc: 'International Standard Book Number' },
      { id: 'ismn', name: 'ISMN', bwip: 'ismn', desc: 'International Standard Music Number' },
      { id: 'issn', name: 'ISSN', bwip: 'issn', desc: 'International Standard Serial Number' },
      { id: 'sscc18', name: 'SSCC-18', bwip: 'sscc18', desc: 'Serial Shipping Container Code' },
    ]
  },

  // ─── Composite Codes ─────────────────────────────────
  'composite': {
    label: 'Composite Codes',
    icon: 'layers',
    badge: 'teal',
    description: '1D + 2D hybrid codes for enhanced data capacity',
    types: [
      { id: 'ean13composite', name: 'EAN-13 Composite', bwip: 'ean13composite', desc: 'EAN-13 with 2D component' },
      { id: 'ean8composite', name: 'EAN-8 Composite', bwip: 'ean8composite', desc: 'EAN-8 with 2D component' },
      { id: 'upcacomposite', name: 'UPC-A Composite', bwip: 'upcacomposite', desc: 'UPC-A with 2D component' },
      { id: 'upcecomposite', name: 'UPC-E Composite', bwip: 'upcecomposite', desc: 'UPC-E with 2D component' },
      { id: 'gs1-128composite', name: 'GS1-128 Composite', bwip: 'gs1-128composite', desc: 'GS1-128 with 2D component' },
      { id: 'databarexpandedcomposite', name: 'DataBar Exp. Composite', bwip: 'databarexpandedcomposite', desc: 'DataBar Expanded + 2D' },
      { id: 'databaromnicomposite', name: 'DataBar Omni Composite', bwip: 'databaromnicomposite', desc: 'DataBar Omni + 2D' },
      { id: 'databarstackedcomposite', name: 'DataBar Stacked Composite', bwip: 'databarstackedcomposite', desc: 'DataBar Stacked + 2D' },
    ]
  },

  // ─── Logistics & Industrial ──────────────────────────
  'logistics': {
    label: 'Logistics & Industrial',
    icon: 'truck',
    badge: 'blue',
    description: 'Shipping labels, warehouse tracking, industrial use',
    types: [
      { id: 'code128', name: 'Code 128', bwip: 'code128', popular: true, desc: 'High-density alphanumeric' },
      { id: 'code39', name: 'Code 39', bwip: 'code39', popular: true, desc: 'Alphanumeric, widely used' },
      { id: 'code39ext', name: 'Code 39 Extended', bwip: 'code39ext', desc: 'Full ASCII Code 39' },
      { id: 'code93', name: 'Code 93', bwip: 'code93', desc: 'Compact Code 39 alternative', featured: true },
      { id: 'code93ext', name: 'Code 93 Extended', bwip: 'code93ext', desc: 'Full ASCII Code 93' },
      { id: 'code11', name: 'Code 11', bwip: 'code11', desc: 'Telecoms equipment tracking' },
      { id: 'itf14', name: 'ITF-14', bwip: 'itf14', popular: true, desc: 'Shipping cartons' },
      { id: 'interleaved2of5', name: 'Interleaved 2 of 5', bwip: 'interleaved2of5', desc: 'Warehouse and distribution' },
      { id: 'industrial2of5', name: 'Industrial 2 of 5', bwip: 'industrial2of5', desc: 'Industrial applications' },
      { id: 'matrix2of5', name: 'Matrix 2 of 5', bwip: 'matrix2of5', desc: 'Warehouse sorting' },
      { id: 'iata2of5', name: 'IATA 2 of 5', bwip: 'iata2of5', desc: 'Airline ticket numbering' },
      { id: 'coop2of5', name: 'COOP 2 of 5', bwip: 'coop2of5', desc: 'Retail cooperative use' },
      { id: 'datalogic2of5', name: 'Datalogic 2 of 5', bwip: 'datalogic2of5', desc: 'Datalogic scanners' },
      { id: 'code16k', name: 'Code 16K', bwip: 'code16k', desc: 'Stacked Code 128 variant' },
      { id: 'code49', name: 'Code 49', bwip: 'code49', desc: 'Multi-row Code 39 variant' },
      { id: 'codablockf', name: 'Codablock F', bwip: 'codablockf', desc: 'Stacked Code 128 for large data' },
      { id: 'channelcode', name: 'Channel Code', bwip: 'channelcode', desc: 'Space-efficient numeric' },
      { id: 'bc412', name: 'BC412', bwip: 'bc412', desc: 'Semiconductor industry wafer tracking' },
    ]
  },

  // ─── Postal & Mail ───────────────────────────────────
  'postal': {
    label: 'Postal & Mail',
    icon: 'mail',
    badge: 'red',
    description: 'National postal services, mail sorting and tracking',
    types: [
      { id: 'onecode', name: 'USPS Intelligent Mail', bwip: 'onecode', popular: true, desc: 'US Postal (IMb) tracking', featured: true },
      { id: 'postnet', name: 'USPS POSTNET', bwip: 'postnet', desc: 'US postal ZIP routing' },
      { id: 'planet', name: 'USPS PLANET', bwip: 'planet', desc: 'US postal confirmation' },
      { id: 'royalmail', name: 'Royal Mail (RM4SCC)', bwip: 'royalmail', popular: true, desc: 'UK postal routing', featured: true },
      { id: 'mailmark', name: 'Royal Mail Mailmark', bwip: 'mailmark', desc: 'Modern UK postal barcode' },
      { id: 'japanpost', name: 'Japan Post', bwip: 'japanpost', popular: true, desc: 'Japanese postal routing', featured: true },
      { id: 'auspost', name: 'Australia Post', bwip: 'auspost', desc: 'Australian postal routing' },
      { id: 'kix', name: 'KIX (Netherlands)', bwip: 'kix', desc: 'Dutch postal routing code' },
      { id: 'identcode', name: 'Deutsche Post Identcode', bwip: 'identcode', desc: 'German parcel identification' },
      { id: 'leitcode', name: 'Deutsche Post Leitcode', bwip: 'leitcode', desc: 'German routing code' },
      { id: 'flattermarken', name: 'Flattermarken', bwip: 'flattermarken', desc: 'Newspaper distribution sorting' },
    ]
  },

  // ─── Medical & Pharmaceutical ────────────────────────
  'medical': {
    label: 'Medical & Pharma',
    icon: 'heart-pulse',
    badge: 'pink',
    description: 'Pharmaceutical packaging, medical devices, hospital tracking',
    types: [
      { id: 'pharmacode', name: 'Pharmacode', bwip: 'pharmacode', popular: true, desc: 'Pharmaceutical binary code' },
      { id: 'pharmacode2', name: 'Pharmacode Two-Track', bwip: 'pharmacode2', desc: 'Two-track pharma verification' },
      { id: 'pzn', name: 'PZN', bwip: 'pzn', desc: 'Pharmazentralnummer (German pharma)' },
      { id: 'hibccode128', name: 'HIBC Code 128', bwip: 'hibccode128', desc: 'Health Industry BC (Code 128)' },
      { id: 'hibccode39', name: 'HIBC Code 39', bwip: 'hibccode39', desc: 'Health Industry BC (Code 39)' },
      { id: 'hibcdatamatrix', name: 'HIBC Data Matrix', bwip: 'hibcdatamatrix', desc: 'Health Industry BC (Data Matrix)' },
      { id: 'hibcqrcode', name: 'HIBC QR Code', bwip: 'hibcqrcode', desc: 'Health Industry BC (QR Code)' },
      { id: 'hibcpdf417', name: 'HIBC PDF417', bwip: 'hibcpdf417', desc: 'Health Industry BC (PDF417)' },
      { id: 'hibcazteccode', name: 'HIBC Aztec', bwip: 'hibcazteccode', desc: 'Health Industry BC (Aztec)' },
      { id: 'hibccodablockf', name: 'HIBC Codablock F', bwip: 'hibccodablockf', desc: 'Health Industry BC (Codablock)' },
      { id: 'hibcmicropdf417', name: 'HIBC MicroPDF417', bwip: 'hibcmicropdf417', desc: 'Health Industry BC (MicroPDF)' },
    ]
  },

  // ─── Specialty & Legacy ──────────────────────────────
  'specialty': {
    label: 'Specialty & Legacy',
    icon: 'archive',
    badge: 'orange',
    description: 'Libraries, telecoms, legacy systems, specialized use',
    types: [
      { id: 'codabar', name: 'Codabar', bwip: 'rationalizedCodabar', popular: true, desc: 'Libraries, blood banks, legacy' },
      { id: 'plessey', name: 'Plessey UK', bwip: 'plessey', desc: 'UK retail shelf labels' },
      { id: 'msi', name: 'MSI Plessey', bwip: 'msi', desc: 'Inventory control, warehouse', featured: true },
      { id: 'telepen', name: 'Telepen', bwip: 'telepen', desc: 'UK library coding system' },
      { id: 'telepennumeric', name: 'Telepen Numeric', bwip: 'telepennumeric', desc: 'Double-density Telepen' },
      { id: 'posicode', name: 'PosiCode', bwip: 'posicode', desc: 'High-density position-based code' },
      { id: 'raw', name: 'Raw Barcode', bwip: 'raw', desc: 'Manual bar/space pattern input' },
      { id: 'symbol', name: 'Symbol Code', bwip: 'symbol', desc: 'Symbol technology format' },
      { id: 'daft', name: 'DAFT Code', bwip: 'daft', desc: '4-state height-encoded code' },
    ]
  },

  // ─── Payment QR Standards ────────────────────────────
  'payment': {
    label: 'Payment QR Standards',
    icon: 'credit-card',
    badge: 'emerald',
    description: 'Regional payment standards — EPC, Swiss QR, UPI, PIX',
    types: [
      { id: 'epcqr', name: 'EPC QR (SEPA)', bwip: 'qrcode', popular: true, desc: 'European bank transfers', featured: true, template: 'epcqr' },
      { id: 'swissqr', name: 'Swiss QR-Bill', bwip: 'qrcode', popular: true, desc: 'Swiss invoice payment standard', featured: true, template: 'swissqr' },
      { id: 'upiqr', name: 'UPI QR (India)', bwip: 'qrcode', desc: 'Unified Payments Interface', featured: true, template: 'upiqr' },
      { id: 'pixqr', name: 'PIX QR (Brazil)', bwip: 'qrcode', desc: 'Brazilian instant payments', featured: true, template: 'pixqr' },
    ]
  },
};

/* Total type count tracker */
const getAllTypes = () => {
  const all = [];
  for (const cat of Object.values(CODE_TYPES)) {
    for (const t of cat.types) {
      all.push({ ...t, category: cat.label });
    }
  }
  return all;
};

const getTypeById = (id) => {
  for (const cat of Object.values(CODE_TYPES)) {
    const found = cat.types.find(t => t.id === id);
    if (found) return { ...found, category: cat.label, badge: cat.badge };
  }
  return null;
};

const getPopularTypes = () => getAllTypes().filter(t => t.popular);
const getFeaturedTypes = () => getAllTypes().filter(t => t.featured);
const getTotalCount = () => getAllTypes().length;
