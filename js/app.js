/* ============================================
   Main Application — Event Bindings & State
   ============================================ */

(function () {
  'use strict';

  // ---- Initialize Lucide Icons ----
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    init();
  });

  function init() {
    buildTypeUI();
    populateBatchDropdown();
    populateAboutTable();
    bindNavigation();
    bindCodeTypeButtons();
    bindTemplateSelector();
    bindCustomizationTabs();
    bindColorInputs();
    bindShapeButtons();
    bindLogoUpload();
    bindErrorCorrection();
    bindExportButtons();
    bindDPIButtons();
    bindFrameControls();
    bindInvertToggle();
    bindThemeToggle();
    bindLivePreview();
    bindTypeSearch();
    Batch.init();

    // Set badge text
    const badge = document.getElementById('typeBadge');
    if (badge) badge.textContent = getTotalCount() + '+ Types';
    const countBadge = document.getElementById('typeCountBadge');
    if (countBadge) countBadge.textContent = getTotalCount() + ' Types';

    // Initial render
    scheduleRender();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ---- Build Dynamic Type UI ----
  function buildTypeUI() {
    // Popular quick access
    const popularContainer = document.getElementById('popularTypeButtons');
    const popularTypes = getPopularTypes();
    popularTypes.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'type-btn' + (t.id === 'qrcode' ? ' active' : '');
      btn.dataset.type = t.id;
      btn.textContent = t.name;
      btn.title = t.desc;
      popularContainer.appendChild(btn);
    });

    // Featured quick access
    const featuredContainer = document.getElementById('featuredTypeButtons');
    const featuredTypes = getFeaturedTypes();
    featuredTypes.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'type-btn';
      btn.dataset.type = t.id;
      btn.textContent = t.name;
      btn.title = t.desc;
      featuredContainer.appendChild(btn);
    });

    // All categories (collapsible)
    const allCat = document.getElementById('allCategories');
    for (const [catKey, cat] of Object.entries(CODE_TYPES)) {
      const section = document.createElement('div');
      section.className = 'category-section';
      section.dataset.category = catKey;

      const header = document.createElement('button');
      header.className = 'category-header';
      header.innerHTML = `
        <i data-lucide="${cat.icon}"></i>
        <span class="cat-label">${cat.label}</span>
        <span class="badge ${cat.badge}">${cat.types.length}</span>
        <span class="cat-count">${cat.description}</span>
        <svg class="cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      `;
      header.addEventListener('click', () => {
        section.classList.toggle('open');
      });

      const body = document.createElement('div');
      body.className = 'category-body';
      const btns = document.createElement('div');
      btns.className = 'type-buttons';
      cat.types.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'type-btn';
        btn.dataset.type = t.id;
        btn.textContent = t.name;
        btn.title = t.desc;
        btns.appendChild(btn);
      });
      body.appendChild(btns);
      section.appendChild(header);
      section.appendChild(body);
      allCat.appendChild(section);
    }
  }

  // ---- Populate batch dropdown ----
  function populateBatchDropdown() {
    const sel = document.getElementById('batchCodeType');
    if (!sel) return;
    for (const [catKey, cat] of Object.entries(CODE_TYPES)) {
      const group = document.createElement('optgroup');
      group.label = cat.label;
      cat.types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        if (t.id === 'qrcode') opt.selected = true;
        group.appendChild(opt);
      });
      sel.appendChild(group);
    }
  }

  // ---- Populate about table ----
  function populateAboutTable() {
    const container = document.getElementById('aboutCodesTable');
    const countEl = document.getElementById('aboutTypeCount');
    if (!container) return;
    if (countEl) countEl.textContent = getTotalCount();

    let html = '<table><thead><tr><th>Category</th><th>Count</th><th>Code Types</th></tr></thead><tbody>';
    for (const [catKey, cat] of Object.entries(CODE_TYPES)) {
      html += `<tr>
        <td><span class="badge ${cat.badge}">${cat.label}</span></td>
        <td>${cat.types.length}</td>
        <td>${cat.types.map(t => t.name).join(', ')}</td>
      </tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ---- Type Search ----
  function bindTypeSearch() {
    const input = document.getElementById('typeSearch');
    const countEl = document.getElementById('typeSearchCount');
    if (!input) return;

    input.addEventListener('input', Utils.debounce(() => {
      const query = input.value.toLowerCase().trim();
      const allBtns = document.querySelectorAll('.all-categories .type-btn');
      const allSections = document.querySelectorAll('.category-section');

      if (!query) {
        allBtns.forEach(btn => btn.style.display = '');
        allSections.forEach(sec => sec.style.display = '');
        countEl.textContent = '';
        return;
      }

      let visibleCount = 0;
      allSections.forEach(sec => {
        const btns = sec.querySelectorAll('.type-btn');
        let sectionVisible = false;
        btns.forEach(btn => {
          const name = btn.textContent.toLowerCase();
          const title = (btn.title || '').toLowerCase();
          const match = name.includes(query) || title.includes(query);
          btn.style.display = match ? '' : 'none';
          if (match) { sectionVisible = true; visibleCount++; }
        });
        sec.style.display = sectionVisible ? '' : 'none';
        if (sectionVisible && query) sec.classList.add('open');
      });
      countEl.textContent = visibleCount + ' found';
    }, 100));
  }

  // ---- Navigation ----
  function bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const section = btn.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(section + 'Section').classList.add('active');
      });
    });
  }

  // ---- Code Type ----
  function bindCodeTypeButtons() {
    // Use event delegation on the controls panel for all type buttons
    const panel = document.querySelector('.controls-panel');
    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('.type-btn');
      if (!btn || !btn.dataset.type) return;

      // Deactivate all type buttons everywhere
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      // Activate all buttons with matching type (popular + category + featured)
      document.querySelectorAll(`.type-btn[data-type="${btn.dataset.type}"]`).forEach(b => b.classList.add('active'));

      Renderer.currentType = btn.dataset.type;

      // Update type name display
      const typeInfo = getTypeById(btn.dataset.type);
      const nameEl = document.getElementById('currentTypeName');
      if (nameEl && typeInfo) nameEl.textContent = typeInfo.name;

      // Auto-select matching template for payment types
      if (typeInfo && typeInfo.template) {
        const tmplSelect = document.getElementById('dataTemplate');
        tmplSelect.value = typeInfo.template;
        tmplSelect.dispatchEvent(new Event('change'));
      }

      updateCustomizationVisibility();
      scheduleRender();
    });
  }

  function updateCustomizationVisibility() {
    const isQR = Renderer.isQRType();
    const custPanel = document.getElementById('qrCustomization');
    const ecPanel = document.getElementById('ecPanel');

    if (isQR) {
      custPanel.classList.remove('hidden');
      ecPanel.classList.remove('hidden');
    } else {
      custPanel.classList.add('hidden');
      ecPanel.classList.add('hidden');
    }
  }

  // ---- Template Selector ----
  function bindTemplateSelector() {
    const sel = document.getElementById('dataTemplate');
    sel.addEventListener('change', () => {
      document.querySelectorAll('.template-fields').forEach(f => f.classList.remove('active'));
      document.getElementById('tmpl-' + sel.value).classList.add('active');
      scheduleRender();
    });
  }

  // ---- Customization Tabs ----
  function bindCustomizationTabs() {
    document.querySelectorAll('.cust-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.cust-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.cust-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      });
    });
  }

  // ---- Color Inputs ----
  function bindColorInputs() {
    const pairs = [
      ['fgColor', 'fgColorText', 'fgColor'],
      ['bgColor', 'bgColorText', 'bgColor'],
      ['eyeColor', 'eyeColorText', 'eyeColor'],
      ['gradientEnd', 'gradientEndText', 'gradientEnd'],
      ['frameColor', 'frameColorText', 'frameColor']
    ];

    pairs.forEach(([colorId, textId, settingKey]) => {
      const colorEl = document.getElementById(colorId);
      const textEl = document.getElementById(textId);
      if (!colorEl || !textEl) return;

      colorEl.addEventListener('input', () => {
        textEl.value = colorEl.value.toUpperCase();
        if (settingKey === 'eyeColor') {
          if (document.getElementById('eyeColorEnabled').checked) {
            Renderer.settings.eyeColor = colorEl.value;
          }
        } else if (settingKey === 'frameColor') {
          Renderer.settings.frameColor = colorEl.value;
        } else {
          Renderer.settings[settingKey] = colorEl.value;
        }
        checkContrast();
        scheduleRender();
      });

      textEl.addEventListener('change', () => {
        let val = textEl.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
          colorEl.value = val;
          colorEl.dispatchEvent(new Event('input'));
        }
      });
    });

    // Eye color toggle
    const eyeEnabled = document.getElementById('eyeColorEnabled');
    if (eyeEnabled) {
      eyeEnabled.addEventListener('change', () => {
        Renderer.settings.eyeColor = eyeEnabled.checked ? document.getElementById('eyeColor').value : null;
        scheduleRender();
      });
    }

    // Gradient type
    const gradientType = document.getElementById('gradientType');
    gradientType.addEventListener('change', () => {
      Renderer.settings.gradientType = gradientType.value;
      document.getElementById('gradientColors').classList.toggle('hidden', gradientType.value === 'none');
      scheduleRender();
    });
  }

  function checkContrast() {
    const ratio = Utils.getContrastRatio(Renderer.settings.fgColor, Renderer.settings.bgColor);
    const warning = document.getElementById('contrastWarning');
    if (ratio < 3) {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }

  // ---- Shape Buttons ----
  function bindShapeButtons() {
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Renderer.settings.bodyShape = btn.dataset.shape;
        scheduleRender();
      });
    });

    document.querySelectorAll('.eye-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.eye-shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Renderer.settings.eyeShape = btn.dataset.eyeShape;
        scheduleRender();
      });
    });
  }

  // ---- Logo Upload ----
  function bindLogoUpload() {
    const uploadArea = document.getElementById('logoUploadArea');
    const input = document.getElementById('logoInput');
    const preview = document.getElementById('logoPreview');
    const container = document.getElementById('logoPreviewContainer');
    const removeBtn = document.getElementById('removeLogo');
    const sizeSlider = document.getElementById('logoSize');
    const sizeValue = document.getElementById('logoSizeValue');
    const transparentCheck = document.getElementById('logoTransparent');

    uploadArea.addEventListener('click', () => input.click());
    uploadArea.addEventListener('dragover', e => e.preventDefault());
    uploadArea.addEventListener('drop', e => {
      e.preventDefault();
      if (e.dataTransfer.files.length) handleLogoFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', () => {
      if (input.files.length) handleLogoFile(input.files[0]);
    });

    removeBtn.addEventListener('click', () => {
      Renderer.logoImage = null;
      container.classList.add('hidden');
      uploadArea.classList.remove('hidden');
      scheduleRender();
    });

    sizeSlider.addEventListener('input', () => {
      sizeValue.textContent = sizeSlider.value;
      Renderer.settings.logoSize = parseInt(sizeSlider.value);
      scheduleRender();
    });

    transparentCheck.addEventListener('change', () => {
      Renderer.settings.logoTransparent = transparentCheck.checked;
      scheduleRender();
    });

    function handleLogoFile(file) {
      if (!file.type.startsWith('image/')) {
        Utils.toast('Please upload an image file', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          Renderer.logoImage = img;
          preview.src = e.target.result;
          container.classList.remove('hidden');
          uploadArea.classList.add('hidden');

          // Auto-bump EC to High
          Renderer.errorCorrection = 'H';
          document.querySelectorAll('.ec-btn').forEach(b => b.classList.remove('active'));
          document.querySelector('.ec-btn[data-ec="H"]').classList.add('active');

          scheduleRender();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ---- Error Correction ----
  function bindErrorCorrection() {
    document.querySelectorAll('.ec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ec-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Renderer.errorCorrection = btn.dataset.ec;
        scheduleRender();
      });
    });
  }

  // ---- Export Buttons ----
  function bindExportButtons() {
    document.getElementById('exportPNG').addEventListener('click', () => {
      Exporter.exportPNG(Templates.getData());
    });
    document.getElementById('exportJPG').addEventListener('click', () => {
      Exporter.exportJPG(Templates.getData());
    });
    document.getElementById('exportSVG').addEventListener('click', () => {
      Exporter.exportSVG(Templates.getData());
    });
    document.getElementById('exportPDF').addEventListener('click', () => {
      Exporter.exportPDF(Templates.getData());
    });
    document.getElementById('exportClipboard').addEventListener('click', () => {
      Exporter.exportClipboard(Templates.getData());
    });

    // Export size
    document.getElementById('exportSize').addEventListener('change', e => {
      Exporter.exportSize = parseInt(e.target.value) || 1024;
    });
  }

  // ---- DPI Buttons ----
  function bindDPIButtons() {
    document.querySelectorAll('.dpi-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dpi-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Exporter.dpi = parseInt(btn.dataset.dpi);
      });
    });
  }

  // ---- Frame Controls ----
  function bindFrameControls() {
    const frameStyle = document.getElementById('frameStyle');
    const frameText = document.getElementById('frameText');

    frameStyle.addEventListener('change', () => {
      Renderer.settings.frameStyle = frameStyle.value;
      scheduleRender();
    });

    frameText.addEventListener('input', () => {
      Renderer.settings.frameText = frameText.value;
      scheduleRender();
    });
  }

  // ---- Invert Toggle ----
  function bindInvertToggle() {
    document.getElementById('invertToggle').addEventListener('click', () => {
      document.getElementById('previewArea').classList.toggle('inverted');
    });
  }

  // ---- Theme Toggle ----
  function bindThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const saved = localStorage.getItem('theme');

    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      icon.setAttribute('data-lucide', 'sun');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        icon.setAttribute('data-lucide', 'moon');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.setAttribute('data-lucide', 'sun');
        localStorage.setItem('theme', 'light');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // ---- Live Preview ----
  function bindLivePreview() {
    // Listen to all inputs in templates
    const templateContainer = document.querySelector('.controls-panel');
    templateContainer.addEventListener('input', Utils.debounce(() => {
      scheduleRender();
    }, 150));

    templateContainer.addEventListener('change', () => {
      scheduleRender();
    });
  }

  // ---- Render Scheduler ----
  let renderRAF = null;
  function scheduleRender() {
    if (renderRAF) cancelAnimationFrame(renderRAF);
    renderRAF = requestAnimationFrame(() => {
      doRender();
      renderRAF = null;
    });
  }

  function doRender() {
    const data = Templates.getData();
    const canvas = document.getElementById('previewCanvas');
    const placeholder = document.getElementById('previewPlaceholder');

    if (!data) {
      placeholder.classList.remove('hidden');
      canvas.classList.add('hidden');
      return;
    }

    placeholder.classList.add('hidden');
    canvas.classList.remove('hidden');

    const success = Renderer.render(data, canvas, 400);

    if (!success) {
      placeholder.classList.remove('hidden');
      canvas.classList.add('hidden');
    }

    // URL safety check
    checkURLSafety(data);
  }

  function checkURLSafety(data) {
    const warning = document.getElementById('urlWarning');
    if (data.match(/^https?:\/\//i)) {
      const result = Utils.checkURLSafety(data);
      if (!result.safe) {
        warning.classList.remove('hidden');
        warning.querySelector('span').textContent = 'Warning: ' + result.warnings.join('. ');
      } else {
        warning.classList.add('hidden');
      }
    } else {
      warning.classList.add('hidden');
    }
  }

})();
