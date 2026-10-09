/**
 * Apex Sports Hub — Admin Dashboard Application Logic
 * Supports unlimited product listings, instant inline price editing,
 * unlimited photo/file uploads (base64 + URL), WhatsApp configuration, and JSON backup/restore.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Current admin state
  let settings = StorageManager.getSettings();
  let products = StorageManager.getProducts();
  let editingProductId = null;
  let tempMediaList = []; // For add/edit modal photo queue

  // DOM Elements - Login
  const loginWrapper = document.getElementById('loginWrapper');
  const loginForm = document.getElementById('loginForm');
  const loginUser = document.getElementById('loginUser');
  const loginPin = document.getElementById('loginPin');
  const loginError = document.getElementById('loginError');
  const quickFillBtn = document.getElementById('quickFillBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // DOM Elements - Header & Metrics
  const adminStoreTitle = document.getElementById('adminStoreTitle');
  const kpiTotalProducts = document.getElementById('kpiTotalProducts');
  const kpiInStock = document.getElementById('kpiInStock');
  const kpiOutOfStock = document.getElementById('kpiOutOfStock');
  const kpiValuation = document.getElementById('kpiValuation');
  const kpiWhatsApp = document.getElementById('kpiWhatsApp');

  // DOM Elements - Toolbar & Table
  const adminSearch = document.getElementById('adminSearch');
  const adminCatFilter = document.getElementById('adminCatFilter');
  const productsTableBody = document.getElementById('productsTableBody');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnOpenSettingsModal = document.getElementById('btnOpenSettingsModal');
  const btnExportData = document.getElementById('btnExportData');
  const btnImportData = document.getElementById('btnImportData');
  const importFileInput = document.getElementById('importFileInput');
  const btnResetDefaults = document.getElementById('btnResetDefaults');

  // DOM Elements - Product Modal
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const productForm = document.getElementById('productForm');
  const productModalTitle = document.getElementById('productModalTitle');
  
  // Product Form Fields
  const prodNameInput = document.getElementById('prodName');
  const prodCategoryInput = document.getElementById('prodCategory');
  const prodSportInput = document.getElementById('prodSport');
  const prodPriceInput = document.getElementById('prodPrice');
  const prodOriginalPriceInput = document.getElementById('prodOriginalPrice');
  const prodStockInput = document.getElementById('prodStock');
  const prodBadgeInput = document.getElementById('prodBadge');
  const prodSkuInput = document.getElementById('prodSku');
  const prodSizesInput = document.getElementById('prodSizes');
  const prodHighlightsInput = document.getElementById('prodHighlights');
  const prodDescInput = document.getElementById('prodDesc');
  const prodFeaturedCheck = document.getElementById('prodFeatured');

  // Media Manager Form Elements
  const mediaUrlInput = document.getElementById('mediaUrlInput');
  const btnAddMediaUrl = document.getElementById('btnAddMediaUrl');
  const mediaFileInput = document.getElementById('mediaFileInput');
  const photoPreviewGrid = document.getElementById('photoPreviewGrid');

  // DOM Elements - Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const settingsCancelBtn = document.getElementById('settingsCancelBtn');
  const settingsForm = document.getElementById('settingsForm');
  const setStoreName = document.getElementById('setStoreName');
  const setPhone = document.getElementById('setPhone');
  const setWhatsapp = document.getElementById('setWhatsapp');
  const setAddress = document.getElementById('setAddress');
  const setCity = document.getElementById('setCity');
  const setTimings = document.getElementById('setTimings');
  const setAnnouncement = document.getElementById('setAnnouncement');
  const setAdminUser = document.getElementById('setAdminUser');
  const setAdminPin = document.getElementById('setAdminPin');

  // Admin Toast
  function showAdminToast(msg, icon = '⚡') {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // 1. Check Authentication
  function checkAuthentication() {
    if (StorageManager.checkAuth()) {
      if (loginWrapper) loginWrapper.style.display = 'none';
      initDashboard();
    } else {
      if (loginWrapper) loginWrapper.style.display = 'flex';
    }
  }

  // Login Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = loginUser.value.trim();
      const p = loginPin.value.trim();

      if (u === settings.adminUsername && p === settings.adminPin) {
        StorageManager.setAuth(true);
        loginError.style.display = 'none';
        loginWrapper.style.display = 'none';
        showAdminToast('Welcome back, Admin!', '👋');
        initDashboard();
      } else {
        loginError.textContent = 'Invalid username or PIN. Please try again.';
        loginError.style.display = 'block';
      }
    });
  }

  // Quick fill button for demo
  if (quickFillBtn) {
    quickFillBtn.addEventListener('click', () => {
      loginUser.value = settings.adminUsername;
      loginPin.value = settings.adminPin;
      loginError.style.display = 'none';
    });
  }

  // Logout
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      StorageManager.setAuth(false);
      loginWrapper.style.display = 'flex';
      showAdminToast('Logged out successfully.', '🔒');
    });
  }

  // 2. Initialize Dashboard
  function initDashboard() {
    settings = StorageManager.getSettings();
    products = StorageManager.getProducts();

    if (adminStoreTitle) {
      adminStoreTitle.textContent = `${settings.storeName} — Owner Console`;
    }

    renderMetrics();
    populateCategoryFilter();
    renderProductsTable();
  }

  // 3. Render KPI Metrics
  function renderMetrics() {
    const total = products.length;
    const inStock = products.filter(p => p.stock === 'In Stock').length;
    const outStock = products.filter(p => p.stock === 'Out of Stock').length;
    const valuation = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

    if (kpiTotalProducts) kpiTotalProducts.textContent = total;
    if (kpiInStock) kpiInStock.textContent = inStock;
    if (kpiOutOfStock) kpiOutOfStock.textContent = outStock;
    if (kpiValuation) kpiValuation.textContent = `${settings.currency}${valuation.toLocaleString('en-IN')}`;
    if (kpiWhatsApp) kpiWhatsApp.textContent = `+${settings.whatsappNumber}`;
  }

  // Populate Categories Filter
  function populateCategoryFilter() {
    if (!adminCatFilter) return;
    const currentVal = adminCatFilter.value;
    const categories = ['All'];
    products.forEach(p => {
      if (p.category && !categories.includes(p.category)) {
        categories.push(p.category);
      }
    });

    adminCatFilter.innerHTML = categories.map(c => `
      <option value="${c}">${c === 'All' ? 'All Sports Categories' : c}</option>
    `).join('');

    if (categories.includes(currentVal)) {
      adminCatFilter.value = currentVal;
    }
  }

  // 4. Render Products Table (With Inline Price Editing)
  function renderProductsTable() {
    if (!productsTableBody) return;

    let list = [...products];

    // Filter by Category
    const selectedCat = adminCatFilter ? adminCatFilter.value : 'All';
    if (selectedCat !== 'All') {
      list = list.filter(p => p.category === selectedCat || p.sport === selectedCat);
    }

    // Filter by Search
    const q = adminSearch ? adminSearch.value.toLowerCase().trim() : '';
    if (q) {
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.sport && p.sport.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No sports items found. Click "+ Add New Sports Gear" to list products anytime without limit!
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = list.map(prod => {
      const img = (prod.media && prod.media[0] && prod.media[0].url) 
        ? prod.media[0].url 
        : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=150&q=80';

      const waTestUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`⚡ WhatsApp Order Test: ${prod.name} (Price: ${settings.currency}${prod.price})`)}`;

      return `
        <tr data-id="${prod.id}">
          <td style="width: 60px;">
            <img src="${img}" alt="${prod.name}" class="item-thumb" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=150&q=80'">
          </td>
          <td>
            <div class="item-details">
              <span class="item-name">${prod.name}</span>
              <span class="item-meta">SKU: ${prod.sku || 'N/A'} | Sport: ${prod.sport || prod.category} | ${prod.media ? prod.media.length : 1} Photos</span>
            </div>
          </td>
          <td>
            <span class="admin-badge" style="background: rgba(0,240,255,0.15); color: #00f0ff;">${prod.category}</span>
          </td>
          <td>
            <!-- INLINE INSTANT PRICE EDITOR (CHANGE PRICE ANYTIME) -->
            <div class="price-editor-box" title="Change price directly and click checkmark or press Enter">
              <span style="font-weight: 700; color: var(--text-muted);">${settings.currency}</span>
              <input type="number" class="price-editor-input" value="${prod.price}" data-id="${prod.id}" step="1">
              <button type="button" class="price-save-btn" data-id="${prod.id}" title="Save New Price">✓</button>
            </div>
          </td>
          <td>
            <!-- INLINE STOCK STATUS SELECTOR -->
            <select class="stock-badge-select" data-id="${prod.id}">
              <option value="In Stock" ${prod.stock === 'In Stock' ? 'selected' : ''}>🟢 In Stock</option>
              <option value="Low Stock" ${prod.stock === 'Low Stock' ? 'selected' : ''}>🟡 Low Stock</option>
              <option value="Out of Stock" ${prod.stock === 'Out of Stock' ? 'selected' : ''}>🔴 Out of Stock</option>
              <option value="Pre-Order" ${prod.stock === 'Pre-Order' ? 'selected' : ''}>🔵 Pre-Order</option>
            </select>
          </td>
          <td>
            <a href="${waTestUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" title="Test direct WhatsApp order link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.971.554 1.77.851 2.781.851 3.18 0 5.767-2.587 5.768-5.768 0-3.18-2.587-5.768-5.768-5.768zm0-2.172c4.418 0 8 3.582 8 8 0 1.55-.44 3.003-1.205 4.24l1.205 4.76-4.887-1.282c-1.192.686-2.576 1.082-4.113 1.082-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z"/>
              </svg>
              <span>Test WA</span>
            </a>
          </td>
          <td>
            <div class="actions-cell">
              <button type="button" class="btn btn-outline btn-sm" data-action="edit" data-id="${prod.id}" title="Edit all product fields">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${prod.id}" title="Delete this product">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTableEvents();
  }

  // 5. Attach Table Events (Inline Price, Stock Dropdowns, Edit, Delete)
  function attachTableEvents() {
    // Inline price input changes
    document.querySelectorAll('.price-editor-input').forEach(input => {
      const id = input.getAttribute('data-id');
      const row = input.closest('tr');
      const saveBtn = row.querySelector(`.price-save-btn[data-id="${id}"]`);

      input.addEventListener('input', () => {
        if (saveBtn) saveBtn.style.display = 'inline-block';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveInlinePrice(id, input.value, saveBtn);
        }
      });

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          saveInlinePrice(id, input.value, saveBtn);
        });
      }
    });

    // Stock status dropdowns
    document.querySelectorAll('.stock-badge-select').forEach(select => {
      select.addEventListener('change', () => {
        const id = select.getAttribute('data-id');
        const newStock = select.value;
        StorageManager.updateProduct(id, { stock: newStock });
        products = StorageManager.getProducts();
        renderMetrics();
        showAdminToast(`Stock updated to "${newStock}"`, '📦');
      });
    });

    // Edit button
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditProductModal(id);
      });
    });

    // Delete button
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = products.find(p => p.id === id);
        if (confirm(`Are you sure you want to delete "${prod ? prod.name : 'this item'}"?`)) {
          StorageManager.deleteProduct(id);
          products = StorageManager.getProducts();
          renderMetrics();
          populateCategoryFilter();
          renderProductsTable();
          showAdminToast('Item deleted successfully', '🗑️');
        }
      });
    });
  }

  // Save Inline Price
  function saveInlinePrice(id, val, saveBtn) {
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid price amount.');
      return;
    }
    StorageManager.updatePrice(id, num);
    products = StorageManager.getProducts();
    if (saveBtn) saveBtn.style.display = 'none';
    renderMetrics();
    showAdminToast(`Price updated to ${settings.currency}${num.toLocaleString('en-IN')}`, '💰');
  }

  // 6. Add & Edit Product Modal Handling
  function openAddProductModal() {
    editingProductId = null;
    productModalTitle.textContent = 'Add New Sports Gear (Unlimited Listing)';
    productForm.reset();
    tempMediaList = [];
    renderPhotoPreviews();

    // Default values
    prodCategoryInput.value = 'Cricket';
    prodSportInput.value = 'Cricket';
    prodStockInput.value = 'In Stock';
    prodPriceInput.value = '';
    prodOriginalPriceInput.value = '';
    prodSkuInput.value = 'SP-' + Math.floor(1000 + Math.random() * 9000);
    prodSizesInput.value = 'Standard Size';

    productModal.classList.add('active');
  }

  function openEditProductModal(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    editingProductId = id;
    productModalTitle.textContent = `Edit Gear: ${prod.name}`;

    prodNameInput.value = prod.name || '';
    prodCategoryInput.value = prod.category || 'General Sports';
    prodSportInput.value = prod.sport || prod.category || 'General Sports';
    prodPriceInput.value = prod.price || '';
    prodOriginalPriceInput.value = prod.originalPrice || '';
    prodStockInput.value = prod.stock || 'In Stock';
    prodBadgeInput.value = prod.badge || '';
    prodSkuInput.value = prod.sku || '';
    prodSizesInput.value = prod.sizes ? prod.sizes.join(', ') : '';
    prodHighlightsInput.value = prod.highlights ? prod.highlights.join('\n') : '';
    prodDescInput.value = prod.description || '';
    prodFeaturedCheck.checked = Boolean(prod.featured);

    tempMediaList = Array.isArray(prod.media) ? [...prod.media] : [];
    renderPhotoPreviews();

    productModal.classList.add('active');
  }

  function closeProductModal() {
    productModal.classList.remove('active');
    editingProductId = null;
    tempMediaList = [];
  }

  if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', openAddProductModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeProductModal);

  // 7. Unlimited Media / Photos Manager (URL + File Upload via Base64)
  function renderPhotoPreviews() {
    if (!photoPreviewGrid) return;
    photoPreviewGrid.innerHTML = tempMediaList.map((m, index) => `
      <div class="photo-thumb-card">
        <img src="${m.url}" alt="Preview" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=150&q=80'">
        <button type="button" class="photo-remove-btn" data-index="${index}" title="Remove Photo">✕</button>
      </div>
    `).join('');

    // Attach remove handlers
    photoPreviewGrid.querySelectorAll('.photo-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        tempMediaList.splice(idx, 1);
        renderPhotoPreviews();
      });
    });
  }

  // Add Photo from URL
  if (btnAddMediaUrl) {
    btnAddMediaUrl.addEventListener('click', () => {
      const url = mediaUrlInput.value.trim();
      if (!url) {
        alert('Please enter a valid image URL.');
        return;
      }
      tempMediaList.push({ type: 'image', url: url, caption: 'Product Photo' });
      mediaUrlInput.value = '';
      renderPhotoPreviews();
      showAdminToast('Photo added to gallery', '🖼️');
    });
  }

  // Upload Multiple Photos Directly from Device (Base64)
  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      let processed = 0;
      files.forEach(file => {
        if (!file.type.startsWith('image/')) {
          processed++;
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          tempMediaList.push({
            type: 'image',
            url: event.target.result,
            caption: file.name
          });
          processed++;
          if (processed === files.length) {
            renderPhotoPreviews();
            showAdminToast(`${files.length} photo(s) uploaded successfully!`, '📸');
            mediaFileInput.value = '';
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // 8. Save Product Form Submit
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = prodNameInput.value.trim();
      const price = Number(prodPriceInput.value);
      if (!name || isNaN(price) || price < 0) {
        alert('Please provide a valid gear title and selling price.');
        return;
      }

      // Parse sizes
      const sizes = prodSizesInput.value
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Parse highlights
      const highlights = prodHighlightsInput.value
        .split('\n')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      // If no photos were added, supply high quality default
      if (tempMediaList.length === 0) {
        tempMediaList.push({
          type: 'image',
          url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80',
          caption: 'Default Sports Photo'
        });
      }

      const productPayload = {
        name: name,
        category: prodCategoryInput.value.trim() || 'Cricket',
        sport: prodSportInput.value.trim() || prodCategoryInput.value.trim(),
        price: price,
        originalPrice: Number(prodOriginalPriceInput.value) || price,
        stock: prodStockInput.value,
        badge: prodBadgeInput.value.trim(),
        sku: prodSkuInput.value.trim() || 'SKU-' + Date.now().toString().slice(-4),
        sizes: sizes.length > 0 ? sizes : ['Standard Size'],
        highlights: highlights,
        description: prodDescInput.value.trim(),
        featured: prodFeaturedCheck.checked,
        media: tempMediaList
      };

      if (editingProductId) {
        StorageManager.updateProduct(editingProductId, productPayload);
        showAdminToast(`Updated "${name}"`, '✅');
      } else {
        StorageManager.addProduct(productPayload);
        showAdminToast(`Added "${name}" to sports catalog!`, '🎉');
      }

      products = StorageManager.getProducts();
      closeProductModal();
      renderMetrics();
      populateCategoryFilter();
      renderProductsTable();
    });
  }

  // 9. Store & WhatsApp Settings Modal
  function openSettingsModal() {
    settings = StorageManager.getSettings();

    setStoreName.value = settings.storeName || '';
    setPhone.value = settings.phone || '';
    setWhatsapp.value = settings.whatsappNumber || '';
    setAddress.value = settings.address || '';
    setCity.value = settings.city || '';
    setTimings.value = settings.timings || '';
    setAnnouncement.value = settings.announcementText || '';
    setAdminUser.value = settings.adminUsername || '';
    setAdminPin.value = settings.adminPin || '';

    settingsModal.classList.add('active');
  }

  function closeSettingsModal() {
    settingsModal.classList.remove('active');
  }

  if (btnOpenSettingsModal) btnOpenSettingsModal.addEventListener('click', openSettingsModal);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettingsModal);
  if (settingsCancelBtn) settingsCancelBtn.addEventListener('click', closeSettingsModal);

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let waClean = setWhatsapp.value.replace(/[^0-9]/g, ''); // Ensure digits only for wa.me

      const updated = {
        ...settings,
        storeName: setStoreName.value.trim(),
        phone: setPhone.value.trim(),
        whatsappNumber: waClean,
        address: setAddress.value.trim(),
        city: setCity.value.trim(),
        timings: setTimings.value.trim(),
        announcementText: setAnnouncement.value.trim(),
        adminUsername: setAdminUser.value.trim() || 'admin',
        adminPin: setAdminPin.value.trim() || 'sports123'
      };

      StorageManager.saveSettings(updated);
      settings = StorageManager.getSettings();
      closeSettingsModal();
      renderMetrics();
      showAdminToast('Store & WhatsApp settings saved!', '💾');
    });
  }

  // 10. Catalog Backup (Export JSON) & Restore (Import JSON)
  if (btnExportData) {
    btnExportData.addEventListener('click', () => {
      const data = StorageManager.exportData();
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", `apex-sports-catalog-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showAdminToast('Catalog exported as JSON backup!', '📥');
    });
  }

  if (btnImportData) {
    btnImportData.addEventListener('click', () => {
      if (importFileInput) importFileInput.click();
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (confirm('Importing this file will merge/replace existing catalog data. Proceed?')) {
            StorageManager.importData(parsed);
            initDashboard();
            showAdminToast('Catalog imported successfully!', '🚀');
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
        importFileInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Reset to Factory Default Catalog
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm('Reset catalog back to default factory sports products? Custom additions will be reset.')) {
        StorageManager.resetDefaults();
        initDashboard();
        showAdminToast('Catalog reset to default sports gear!', '🔄');
      }
    });
  }

  // Toolbar Filters
  if (adminSearch) {
    adminSearch.addEventListener('input', () => {
      renderProductsTable();
    });
  }

  if (adminCatFilter) {
    adminCatFilter.addEventListener('change', () => {
      renderProductsTable();
    });
  }

  // Initialize Auth Check
  checkAuthentication();
});
