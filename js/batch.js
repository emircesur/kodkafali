/* ============================================
   Batch Generation — CSV/XLSX → ZIP of codes
   Uses main thread (Web Workers can't access DOM)
   ============================================ */

const Batch = {
  fileData: null,
  rows: [],

  init() {
    const uploadArea = document.getElementById('batchUploadArea');
    const fileInput = document.getElementById('batchFileInput');
    const generateBtn = document.getElementById('batchGenerate');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--accent)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
    });
    uploadArea.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      if (e.dataTransfer.files.length) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files.length) {
        this.handleFile(e.target.files[0]);
      }
    });

    generateBtn.addEventListener('click', () => this.generate());
  },

  handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = e => {
        this.parseCSV(e.target.result);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = e => {
        this.parseXLSX(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    } else {
      Utils.toast('Please upload a CSV or XLSX file', 'error');
    }
  },

  parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      Utils.toast('CSV must have a header row and at least one data row', 'error');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const dataIdx = headers.indexOf('data');

    if (dataIdx === -1) {
      // If no "data" column, use first column
      this.rows = lines.slice(1).map(line => {
        const cells = line.split(',').map(c => c.trim().replace(/"/g, ''));
        return cells[0] || '';
      }).filter(Boolean);
    } else {
      this.rows = lines.slice(1).map(line => {
        const cells = line.split(',').map(c => c.trim().replace(/"/g, ''));
        return cells[dataIdx] || '';
      }).filter(Boolean);
    }

    this.showPreview();
  },

  parseXLSX(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (json.length < 2) {
        Utils.toast('Sheet must have a header row and at least one data row', 'error');
        return;
      }

      const headers = json[0].map(h => String(h).trim().toLowerCase());
      const dataIdx = headers.indexOf('data');

      this.rows = json.slice(1).map(row => {
        const val = dataIdx >= 0 ? row[dataIdx] : row[0];
        return val ? String(val).trim() : '';
      }).filter(Boolean);

      this.showPreview();
    } catch (e) {
      Utils.toast('Failed to parse XLSX file', 'error');
    }
  },

  showPreview() {
    const previewDiv = document.getElementById('batchPreview');
    const tableDiv = document.getElementById('batchPreviewTable');
    const generateBtn = document.getElementById('batchGenerate');

    if (this.rows.length === 0) {
      Utils.toast('No data found in file', 'error');
      return;
    }

    const preview = this.rows.slice(0, 5);
    let html = '<table><thead><tr><th>#</th><th>Data</th></tr></thead><tbody>';
    preview.forEach((row, i) => {
      html += `<tr><td>${i + 1}</td><td>${row}</td></tr>`;
    });
    if (this.rows.length > 5) {
      html += `<tr><td colspan="2" style="text-align:center;color:var(--text-muted)">... and ${this.rows.length - 5} more rows</td></tr>`;
    }
    html += '</tbody></table>';

    tableDiv.innerHTML = html;
    previewDiv.classList.remove('hidden');
    generateBtn.disabled = false;

    Utils.toast(`Loaded ${this.rows.length} rows`, 'success');
  },

  async generate() {
    if (!this.rows.length) return;

    const codeType = document.getElementById('batchCodeType').value;
    const progressDiv = document.getElementById('batchProgress');
    const progressFill = document.getElementById('batchProgressFill');
    const progressText = document.getElementById('batchProgressText');
    const generateBtn = document.getElementById('batchGenerate');

    progressDiv.classList.remove('hidden');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i data-lucide="loader"></i> Generating...';

    const zip = new JSZip();
    const total = this.rows.length;

    // Save current type and restore after
    const prevType = Renderer.currentType;
    Renderer.currentType = codeType;

    for (let i = 0; i < total; i++) {
      const data = this.rows[i];
      const canvas = document.createElement('canvas');
      const success = Renderer.render(data, canvas, 512);

      if (success) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const padded = String(i + 1).padStart(String(total).length, '0');
        zip.file(`code_${padded}.png`, blob);
      }

      const pct = Math.round(((i + 1) / total) * 100);
      progressFill.style.width = pct + '%';
      progressText.textContent = `${i + 1} / ${total}`;

      // Yield to browser every 10 items
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    Renderer.currentType = prevType;

    // Generate ZIP
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      Utils.downloadBlob(content, `batch-codes-${Date.now()}.zip`);
      Utils.toast(`Downloaded ${total} codes as ZIP`, 'success');
    } catch (e) {
      Utils.toast('Failed to create ZIP file', 'error');
    }

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i data-lucide="zap"></i> Generate & Download ZIP';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
};
