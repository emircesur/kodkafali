/* ============================================
   Export Functions — PNG, SVG, PDF, JPG, Clipboard
   ============================================ */

const Exporter = {
  dpi: 300,
  exportSize: 1024,

  getScaledSize() {
    // Cap DPI for restricted ID types (AAMVA template OR PDF417 with ID-like content)
    let effectiveDPI = this.dpi;
    if (Renderer.isRestrictedIDType()) {
      effectiveDPI = Math.min(effectiveDPI, 72);
    }
    return Math.round(this.exportSize * (effectiveDPI / 72));
  },

  // Export as PNG
  exportPNG(data) {
    if (!data) return Utils.toast('No data to export', 'error');
    const size = this.getScaledSize();
    const canvas = Renderer.renderToCanvas(data, size);
    if (!canvas) return;

    canvas.toBlob(blob => {
      if (blob) {
        Utils.downloadBlob(blob, `code-${Date.now()}.png`);
        Utils.toast('PNG exported successfully', 'success');
      }
    }, 'image/png');
  },

  // Export as JPG
  exportJPG(data) {
    if (!data) return Utils.toast('No data to export', 'error');
    const size = this.getScaledSize();
    const canvas = Renderer.renderToCanvas(data, size);
    if (!canvas) return;

    canvas.toBlob(blob => {
      if (blob) {
        Utils.downloadBlob(blob, `code-${Date.now()}.jpg`);
        Utils.toast('JPG exported successfully', 'success');
      }
    }, 'image/jpeg', 0.95);
  },

  // Export as SVG
  exportSVG(data) {
    if (!data) return Utils.toast('No data to export', 'error');
    const size = this.exportSize;
    const canvas = Renderer.renderToCanvas(data, size);
    if (!canvas) return;

    // Convert canvas to SVG using embedded image (preserves all customization)
    const dataURL = canvas.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${dataURL}"/>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    Utils.downloadBlob(blob, `code-${Date.now()}.svg`);
    Utils.toast('SVG exported successfully', 'success');
  },

  // Export as PDF
  exportPDF(data) {
    if (!data) return Utils.toast('No data to export', 'error');
    const size = this.getScaledSize();
    const canvas = Renderer.renderToCanvas(data, size);
    if (!canvas) return;

    try {
      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL('image/png');

      // Calculate PDF dimensions (in mm)
      const pxPerMM = this.dpi / 25.4;
      const widthMM = canvas.width / pxPerMM;
      const heightMM = canvas.height / pxPerMM;

      const orientation = widthMM > heightMM ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [Math.max(widthMM + 20, 50), Math.max(heightMM + 20, 50)]
      });

      pdf.addImage(imgData, 'PNG', 10, 10, widthMM, heightMM);
      pdf.save(`code-${Date.now()}.pdf`);
      Utils.toast('PDF exported successfully', 'success');
    } catch (e) {
      console.error('PDF export error:', e);
      Utils.toast('PDF export failed', 'error');
    }
  },

  // Copy to clipboard
  async exportClipboard(data) {
    if (!data) return Utils.toast('No data to export', 'error');
    const size = this.exportSize;
    const canvas = Renderer.renderToCanvas(data, size);
    if (!canvas) return;

    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      Utils.toast('Copied to clipboard!', 'success');
    } catch (e) {
      // Fallback: try selecting from a temporary image
      try {
        const dataURL = canvas.toDataURL('image/png');
        const textBlob = new Blob([dataURL], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/plain': textBlob })
        ]);
        Utils.toast('Copied as data URL to clipboard', 'info');
      } catch (e2) {
        Utils.toast('Clipboard access denied — try right-click → Copy on the preview', 'error');
      }
    }
  }
};
