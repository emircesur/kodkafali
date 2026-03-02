# KODKAFALI — Ultimate Scannable Code Generator

A powerful, privacy-first web application that generates **QR codes, barcodes, and scannable codes** entirely in the browser. No server, no tracking, no data leaves your device. 
**[Live Demo](https://emircesur.github.io/kodkafali/)**

## Features

### Supported Code Types
| Type | Formats | Best For |
|------|---------|----------|
| **2D Matrix** | QR Code, Data Matrix, Aztec, PDF417 | High data density, electronics, boarding passes |
| **Retail (1D)** | UPC-A, EAN-13, EAN-8 | Consumer products, groceries |
| **Logistics** | Code 128, Code 39, ITF-14 | Shipping labels, warehouse, industrial |
| **Specialty** | Pharmacode, Codabar | Medical packaging, library systems |

### High-Fidelity QR Customization
- **Body Shapes**: Square, Circle, Diamond, Rounded
- **Eye Styling**: Independent color and shape for corner patterns
- **Logo Integration**: Auto Error Correction bump to High (30%)
- **Gradients**: Linear and radial with contrast checker
- **Frames & CTAs**: "SCAN ME" banners and borders

### Data Templates
- Plain Text / URL
- WiFi Network (`WIFI:S:...`)
- vCard (Contact Card)
- Calendar Event (iCal)
- Email, SMS, Phone
- Cryptocurrency (Bitcoin/Ethereum)
- Geolocation

### Export Options
- **PNG/JPG** with selectable DPI (72, 300, 600)
- **SVG** for vector scaling
- **PDF** via jsPDF for print
- **Clipboard** via ClipboardItem API

### Batch Generation
- Upload CSV or XLSX
- Generates ZIP of unique codes
- Progress tracking with no browser freezing

### Privacy & Security
- 100% client-side — zero server calls
- URL safety scanner for phishing detection
- Theme toggle (dark/light)
- Open source and auditable

## Tech Stack
- Pure HTML/CSS/JS (no framework)
- [bwip-js](https://github.com/metafloor/bwip-js) — 1D & 2D barcode rendering
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) — QR code generation
- [JSZip](https://stuk.github.io/jszip/) — Batch ZIP downloads
- [jsPDF](https://github.com/parallax/jsPDF) — PDF export
- [SheetJS](https://sheetjs.com/) — XLSX parsing
- [Lucide](https://lucide.dev/) — Icons


## License
MIT
