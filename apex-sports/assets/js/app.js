/**
 * Apex Sports Hub — Storefront Application Logic
 * Implements 1-Click WhatsApp Ordering, Dynamic Product Catalog, Cart Drawer, and Quick View
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    settings: StorageManager.getSettings(),
    products: StorageManager.getProducts(),
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'featured',
    onlyInStock: false,
    selectedVariants: {}, // productId -> selectedSize
    cart: StorageManager.getCart()
  };

  // DOM Elements
  const productsGrid = document.getElementById('productsGrid');
  const productsCountEl = document.getElementById('productsCount');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const stockToggle = document.getElementById('stockToggle');
  const categoryChipsContainer = document.getElementById('categoryChips');
  
  // Cart DOM
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBtn = document.getElementById('cartBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartBadgeCount = document.getElementById('cartBadgeCount');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');
  const btnCheckoutWhatsApp = document.getElementById('btnCheckoutWhatsApp');
  const customerNameInput = document.getElementById('customerName');
  const customerAddressInput = document.getElementById('customerAddress');

  // Quick View Modal DOM
  const quickViewModal = document.getElementById('quickViewModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  // Sync Store Settings to UI (Phone, WhatsApp links, Banner)
  function applyStoreSettings() {
    const s = state.settings;
    
    // Announcement
    const marqueeBanner = document.getElementById('marqueeBanner');
    if (marqueeBanner && s.announcementText) {
      marqueeBanner.innerHTML = `
        <div class="marquee-item"><span>⚡</span> <span>${s.announcementText}</span></div>
        <div class="marquee-item"><span>📞</span> <span>WhatsApp Direct Orders: <strong>${s.phone}</strong></span></div>
        <div class="marquee-item"><span class="highlight">1-CLICK WHATSAPP ORDERING ACTIVE</span></div>
        <div class="marquee-item"><span>⚡</span> <span>${s.announcementText}</span></div>
        <div class="marquee-item"><span>📞</span> <span>WhatsApp Direct Orders: <strong>${s.phone}</strong></span></div>
      `;
    }

    // Direct WhatsApp Buttons / Links
    const waDirectLinks = document.querySelectorAll('.js-wa-direct');
    waDirectLinks.forEach(link => {
      const defaultText = encodeURIComponent(`Hello ${s.storeName}! I have an inquiry about your sports equipment.`);
      link.href = `https://wa.me/${s.whatsappNumber}?text=${defaultText}`;
    });

    // Address & Info elements
    const storeAddressEl = document.getElementById('storeAddress');
    if (storeAddressEl) {
      storeAddressEl.innerHTML = `<strong>${s.address}</strong><br>${s.city}<br><span class="text-volt">Timings: ${s.timings}</span>`;
    }

    const footerPhone = document.getElementById('footerPhone');
    if (footerPhone) footerPhone.textContent = s.phone;
  }

  // Generate WhatsApp Direct Order Link for a Single Product
  function getProductWhatsAppUrl(product, chosenSize) {
    const s = state.settings;
    const sizeStr = chosenSize ? ` (Selected: ${chosenSize})` : '';
    const message = `⚡ *1-CLICK SPORTS ORDER — ${s.storeName}* ⚡\n\n` +
      `Hey! I want to order the following item:\n` +
      `👉 *${product.name}*${sizeStr}\n` +
      `🏷️ *Price:* ${s.currency}${Number(product.price).toLocaleString('en-IN')}\n` +
      `📦 *SKU:* ${product.sku || 'N/A'}\n` +
      `📌 *Category:* ${product.category}\n\n` +
      `Is this ready for immediate store pickup or home delivery? Please confirm. Thank you!`;

    return `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  // Toast Notification
  function showToast(message, icon = '⚡') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Render Category Chips
  function renderCategoryChips() {
    if (!categoryChipsContainer) return;
    
    // Extract unique sports & categories
    const categories = ['All'];
    state.products.forEach(p => {
      if (p.category && !categories.includes(p.category)) {
        categories.push(p.category);
      }
    });

    categoryChipsContainer.innerHTML = categories.map(cat => `
      <button class="cat-chip ${state.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat === 'All' ? '🔥 All Equipment' : cat}
      </button>
    `).join('');

    // Attach click events
    categoryChipsContainer.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        state.selectedCategory = chip.getAttribute('data-cat');
        renderCategoryChips();
        renderProducts();
      });
    });
  }

  // Render Product Catalog
  function renderProducts() {
    if (!productsGrid) return;

    // Filter by category
    let list = [...state.products];
    if (state.selectedCategory !== 'All') {
      list = list.filter(p => p.category === state.selectedCategory || p.sport === state.selectedCategory);
    }

    // Filter by stock
    if (state.onlyInStock) {
      list = list.filter(p => p.stock === 'In Stock');
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.sport && p.sport.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    // Sort list
    if (state.sortBy === 'price-low') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (state.sortBy === 'price-high') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (state.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else {
      // Featured / default
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Update count
    if (productsCountEl) {
      productsCountEl.innerHTML = `Showing <strong>${list.length}</strong> Gear Items`;
    }

    if (list.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 8px;">NO SPORTS GEAR FOUND</h3>
          <p>No gear matched "${state.searchQuery}" in this category. Try searching another sport or clear filters.</p>
          <button class="btn btn-outline" style="margin-top: 18px;" id="resetFilterBtn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.searchQuery = '';
          if (searchInput) searchInput.value = '';
          state.selectedCategory = 'All';
          state.onlyInStock = false;
          if (stockToggle) stockToggle.checked = false;
          renderCategoryChips();
          renderProducts();
        });
      }
      return;
    }

    const s = state.settings;

    productsGrid.innerHTML = list.map(prod => {
      const mainImg = (prod.media && prod.media[0] && prod.media[0].url) 
        ? prod.media[0].url 
        : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80';
      
      const defaultSize = (prod.sizes && prod.sizes.length > 0) ? prod.sizes[0] : 'Standard';
      const selectedSize = state.selectedVariants[prod.id] || defaultSize;
      
      const originalPrice = prod.originalPrice ? Number(prod.originalPrice) : 0;
      const price = Number(prod.price) || 0;
      const discount = (originalPrice > price) ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      let stockBadgeClass = 'stock-in';
      if (prod.stock === 'Low Stock') stockBadgeClass = 'stock-low';
      if (prod.stock === 'Out of Stock') stockBadgeClass = 'stock-out';

      const waBuyUrl = getProductWhatsAppUrl(prod, selectedSize);

      return `
        <article class="product-card" data-id="${prod.id}">
          <div class="card-img-wrapper" data-action="quickview" data-id="${prod.id}">
            <img src="${mainImg}" alt="${prod.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'">
            <div class="card-badges">
              ${prod.badge ? `<span class="badge-tag pro">${prod.badge}</span>` : ''}
              ${discount > 0 ? `<span class="badge-tag hot">SAVE ${discount}%</span>` : ''}
            </div>
            <button class="card-quick-view" data-action="quickview" data-id="${prod.id}">⚡ Quick View</button>
          </div>

          <div class="card-content">
            <div class="card-category-row">
              <span class="card-sport">${prod.sport || prod.category}</span>
              <span class="card-stock ${stockBadgeClass}">
                <span class="stock-dot"></span> ${prod.stock || 'In Stock'}
              </span>
            </div>

            <h3 class="card-title" data-action="quickview" data-id="${prod.id}">${prod.name}</h3>
            <p class="card-desc">${prod.description || 'Professional athletic grade sports equipment designed for durability and performance.'}</p>

            ${(prod.sizes && prod.sizes.length > 0) ? `
              <div class="card-sizes">
                ${prod.sizes.map(size => `
                  <button type="button" class="size-pill ${selectedSize === size ? 'selected' : ''}" data-action="select-size" data-id="${prod.id}" data-size="${size}">
                    ${size}
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <div class="card-price-row">
              <span class="current-price">${s.currency}${price.toLocaleString('en-IN')}</span>
              ${originalPrice > price ? `<span class="original-price">${s.currency}${originalPrice.toLocaleString('en-IN')}</span>` : ''}
              ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
            </div>

            <div class="card-actions">
              <!-- PROMINENT 1-CLICK WHATSAPP ORDER BUTTON -->
              <a href="${waBuyUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-oneclick btn-wa-order" data-id="${prod.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.971.554 1.77.851 2.781.851 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.768-5.768zm0-2.172c4.418 0 8 3.582 8 8 0 1.55-.44 3.003-1.205 4.24l1.205 4.76-4.887-1.282c-1.192.686-2.576 1.082-4.113 1.082-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z"/>
                </svg>
                <span>1-Click WhatsApp Order</span>
              </a>

              <button type="button" class="btn btn-dark btn-sm" data-action="add-cart" data-id="${prod.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Add to Bag</span>
              </button>

              <button type="button" class="btn btn-outline btn-sm" data-action="quickview" data-id="${prod.id}">
                <span>Specs & Info</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachCardEventListeners();
  }

  // Attach Card Event Listeners
  function attachCardEventListeners() {
    // Size pills
    document.querySelectorAll('[data-action="select-size"]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = pill.getAttribute('data-id');
        const size = pill.getAttribute('data-size');
        state.selectedVariants[id] = size;
        
        // Update styling of pills in this card
        const card = pill.closest('.product-card');
        card.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');

        // Update the 1-Click WhatsApp button URL immediately with selected size!
        const prod = state.products.find(p => p.id === id);
        if (prod) {
          const waBtn = card.querySelector('.btn-wa-oneclick');
          if (waBtn) {
            waBtn.href = getProductWhatsAppUrl(prod, size);
          }
        }
      });
    });

    // Quick view clicks
    document.querySelectorAll('[data-action="quickview"]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        openQuickViewModal(id);
      });
    });

    // Add to cart clicks
    document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        addToCart(id);
      });
    });
  }

  // Quick View Modal
  function openQuickViewModal(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    const s = state.settings;
    const defaultSize = (prod.sizes && prod.sizes.length > 0) ? prod.sizes[0] : 'Standard';
    let chosenSize = state.selectedVariants[prod.id] || defaultSize;

    const mediaList = (prod.media && prod.media.length > 0) ? prod.media : [
      { url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80', caption: 'Default Image' }
    ];

    const price = Number(prod.price) || 0;
    const originalPrice = prod.originalPrice ? Number(prod.originalPrice) : 0;
    const discount = (originalPrice > price) ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    modalBody.innerHTML = `
      <div class="modal-grid">
        <div class="modal-media-col">
          <img src="${mediaList[0].url}" alt="${prod.name}" id="modalMainImg" class="modal-main-img" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'">
          ${mediaList.length > 1 ? `
            <div class="modal-thumb-strip">
              ${mediaList.map((m, idx) => `
                <img src="${m.url}" class="${idx === 0 ? 'active' : ''}" data-src="${m.url}" alt="${m.caption || 'Thumbnail'}">
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="modal-info-col">
          <div>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span class="badge-tag pro">${prod.sport || prod.category}</span>
              ${prod.badge ? `<span class="badge-tag new">${prod.badge}</span>` : ''}
              <span class="stock-in" style="font-size: 0.8rem; font-weight: 700; margin-left: auto;">🟢 ${prod.stock}</span>
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 900; line-height: 1.1; margin-bottom: 8px;">${prod.name}</h2>
            <div style="font-size: 0.8rem; color: var(--text-dim);">SKU: ${prod.sku || 'N/A'} | Rating: ⭐ ${prod.rating || 5.0} (${prod.reviewsCount || 20}+ reviews)</div>
          </div>

          <div style="display: flex; align-items: baseline; gap: 12px;">
            <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: var(--volt-primary);">${s.currency}${price.toLocaleString('en-IN')}</span>
            ${originalPrice > price ? `<span style="text-decoration: line-through; color: var(--text-dim); font-size: 1.1rem;">${s.currency}${originalPrice.toLocaleString('en-IN')}</span>` : ''}
            ${discount > 0 ? `<span class="discount-badge" style="font-size: 0.85rem;">SAVE ${discount}%</span>` : ''}
          </div>

          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6;">${prod.description}</p>

          ${(prod.highlights && prod.highlights.length > 0) ? `
            <div style="background: var(--bg-card-light); padding: 12px 16px; border-radius: var(--radius-sm);">
              <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--cyan-accent); margin-bottom: 6px; letter-spacing: 0.5px;">Pro Features & Specs:</h4>
              <ul style="padding-left: 18px; font-size: 0.82rem; color: var(--text-white); display: flex; flex-direction: column; gap: 4px;">
                ${prod.highlights.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${(prod.sizes && prod.sizes.length > 0) ? `
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">Select Variant / Weight / Size:</label>
              <div class="card-sizes" id="modalSizesContainer">
                ${prod.sizes.map(size => `
                  <button type="button" class="size-pill ${chosenSize === size ? 'selected' : ''}" data-modalsize="${size}">
                    ${size}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <a id="modalWaBuyBtn" href="${getProductWhatsAppUrl(prod, chosenSize)}" target="_blank" rel="noopener noreferrer" class="btn-wa-oneclick" style="font-size: 1rem; padding: 14px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.971.554 1.77.851 2.781.851 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.768-5.768zm0-2.172c4.418 0 8 3.582 8 8 0 1.55-.44 3.003-1.205 4.24l1.205 4.76-4.887-1.282c-1.192.686-2.576 1.082-4.113 1.082-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z"/>
              </svg>
              <span>Instant 1-Click WhatsApp Order</span>
            </a>

            <button type="button" id="modalAddBagBtn" class="btn btn-volt" style="padding: 13px;">
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Thumbnail switcher
    const mainImgEl = document.getElementById('modalMainImg');
    modalBody.querySelectorAll('.modal-thumb-strip img').forEach(thumb => {
      thumb.addEventListener('click', () => {
        mainImgEl.src = thumb.getAttribute('data-src');
        modalBody.querySelectorAll('.modal-thumb-strip img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Modal size switcher
    modalBody.querySelectorAll('[data-modalsize]').forEach(btn => {
      btn.addEventListener('click', () => {
        chosenSize = btn.getAttribute('data-modalsize');
        state.selectedVariants[prod.id] = chosenSize;
        modalBody.querySelectorAll('[data-modalsize]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // Update Modal WA link
        const waLink = document.getElementById('modalWaBuyBtn');
        if (waLink) waLink.href = getProductWhatsAppUrl(prod, chosenSize);
      });
    });

    // Modal Add To Bag
    const modalAddBagBtn = document.getElementById('modalAddBagBtn');
    if (modalAddBagBtn) {
      modalAddBagBtn.addEventListener('click', () => {
        addToCart(prod.id, chosenSize);
        closeQuickViewModal();
      });
    }

    quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickViewModal() {
    quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeQuickViewModal);
  if (quickViewModal) {
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) closeQuickViewModal();
    });
  }

  // Cart Operations
  function addToCart(productId, customSize = null) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    const defaultSize = (prod.sizes && prod.sizes.length > 0) ? prod.sizes[0] : 'Standard';
    const size = customSize || state.selectedVariants[productId] || defaultSize;

    // Check if item with this id and size already in cart
    const existingIndex = state.cart.findIndex(item => item.id === productId && item.size === size);

    if (existingIndex > -1) {
      state.cart[existingIndex].qty += 1;
    } else {
      const img = (prod.media && prod.media[0] && prod.media[0].url) ? prod.media[0].url : '';
      state.cart.push({
        id: prod.id,
        name: prod.name,
        price: Number(prod.price),
        sku: prod.sku,
        size: size,
        image: img,
        qty: 1
      });
    }

    StorageManager.saveCart(state.cart);
    updateCartUI();
    showToast(`Added "${prod.name}" (${size}) to Bag!`, '🛒');
  }

  function updateCartUI() {
    // Total count
    const totalCount = state.cart.reduce((acc, item) => acc + item.qty, 0);
    if (cartBadgeCount) {
      cartBadgeCount.textContent = totalCount;
      cartBadgeCount.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    // Mobile badge if exists
    const mobBadge = document.getElementById('mobCartCount');
    if (mobBadge) {
      mobBadge.textContent = totalCount;
      mobBadge.style.display = totalCount > 0 ? 'inline-block' : 'none';
    }

    // Render items
    if (!cartItemsList) return;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 6px;">Your Bag is Empty</h4>
          <p style="font-size: 0.85rem;">Discover pro cricket bats, footballs, gym dumbbells, and footwear to start ordering.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = `${state.settings.currency}0`;
      if (cartTotalEl) cartTotalEl.textContent = `${state.settings.currency}0`;
      if (btnCheckoutWhatsApp) btnCheckoutWhatsApp.disabled = true;
      return;
    }

    if (btnCheckoutWhatsApp) btnCheckoutWhatsApp.disabled = false;

    const s = state.settings;
    let subtotal = 0;

    cartItemsList.innerHTML = state.cart.map((item, index) => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=150&q=80'">
          <div class="cart-item-info">
            <div>
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-meta">Size / Variant: ${item.size}</div>
            </div>
            <div class="cart-item-bottom">
              <div class="cart-qty-ctrl">
                <button type="button" class="qty-btn" data-action="cart-minus" data-index="${index}">-</button>
                <span class="qty-val">${item.qty}</span>
                <button type="button" class="qty-btn" data-action="cart-plus" data-index="${index}">+</button>
              </div>
              <span class="cart-item-price">${s.currency}${itemTotal.toLocaleString('en-IN')}</span>
              <button type="button" class="cart-item-remove" data-action="cart-remove" data-index="${index}" title="Remove item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (cartSubtotalEl) cartSubtotalEl.textContent = `${s.currency}${subtotal.toLocaleString('en-IN')}`;
    if (cartTotalEl) cartTotalEl.textContent = `${s.currency}${subtotal.toLocaleString('en-IN')}`;

    // Attach cart item events
    cartItemsList.querySelectorAll('[data-action="cart-minus"]').forEach(b => {
      b.addEventListener('click', () => {
        const idx = Number(b.getAttribute('data-index'));
        if (state.cart[idx].qty > 1) {
          state.cart[idx].qty -= 1;
        } else {
          state.cart.splice(idx, 1);
        }
        StorageManager.saveCart(state.cart);
        updateCartUI();
      });
    });

    cartItemsList.querySelectorAll('[data-action="cart-plus"]').forEach(b => {
      b.addEventListener('click', () => {
        const idx = Number(b.getAttribute('data-index'));
        state.cart[idx].qty += 1;
        StorageManager.saveCart(state.cart);
        updateCartUI();
      });
    });

    cartItemsList.querySelectorAll('[data-action="cart-remove"]').forEach(b => {
      b.addEventListener('click', () => {
        const idx = Number(b.getAttribute('data-index'));
        state.cart.splice(idx, 1);
        StorageManager.saveCart(state.cart);
        updateCartUI();
      });
    });
  }

  // Open / Close Cart Drawer
  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Cart WhatsApp Order Checkout
  if (btnCheckoutWhatsApp) {
    btnCheckoutWhatsApp.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your bag is empty!', '⚠️');
        return;
      }

      const s = state.settings;
      const custName = customerNameInput ? (customerNameInput.value.trim() || 'Valued Customer') : 'Valued Customer';
      const custAddress = customerAddressInput ? (customerAddressInput.value.trim() || 'Store Pickup / Contact via WhatsApp') : 'Store Pickup';
      
      const fulfillmentRadio = document.querySelector('input[name="deliveryMode"]:checked');
      const fulfillment = fulfillmentRadio ? fulfillmentRadio.value : 'Pickup from Store';

      let totalAmount = 0;
      let itemsListStr = '';

      state.cart.forEach((item, i) => {
        const itemTot = item.price * item.qty;
        totalAmount += itemTot;
        itemsListStr += `${i + 1}. *${item.name}*\n   • Option: ${item.size}\n   • Qty: ${item.qty} × ${s.currency}${item.price.toLocaleString('en-IN')} = ${s.currency}${itemTot.toLocaleString('en-IN')}\n\n`;
      });

      const orderMsg = 
        `🛒 *OFFICIAL ORDER REQUEST — ${s.storeName}*\n` +
        `═══════════════════════════════\n` +
        `👤 *Customer Name:* ${custName}\n` +
        `🚚 *Fulfillment:* ${fulfillment}\n` +
        `📍 *Address/Note:* ${custAddress}\n` +
        `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n` +
        `═══════════════════════════════\n\n` +
        `*ORDERED ITEMS:*\n\n` +
        itemsListStr +
        `═══════════════════════════════\n` +
        `💰 *TOTAL PAYABLE:* ${s.currency}${totalAmount.toLocaleString('en-IN')}\n` +
        `═══════════════════════════════\n\n` +
        `Please confirm this order and provide payment / dispatch confirmation! Thank you!`;

      const finalWaUrl = `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(orderMsg)}`;

      // Open WhatsApp in new tab
      window.open(finalWaUrl, '_blank');
      showToast('Opening WhatsApp to send order...', '🚀');
    });
  }

  // Filter & Search Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });
  }

  if (stockToggle) {
    stockToggle.addEventListener('change', (e) => {
      state.onlyInStock = e.target.checked;
      renderProducts();
    });
  }

  // Listen to storage events (if modified from admin tab!)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.PRODUCTS || e.key === STORAGE_KEYS.SETTINGS) {
      state.products = StorageManager.getProducts();
      state.settings = StorageManager.getSettings();
      applyStoreSettings();
      renderCategoryChips();
      renderProducts();
      updateCartUI();
      showToast('Catalog updated in real time!', '🔄');
    }
  });

  // Mobile navigation drawer / bottom bar triggers
  const mobNavCart = document.getElementById('mobNavCart');
  if (mobNavCart) mobNavCart.addEventListener('click', openCart);

  // Initialize
  applyStoreSettings();
  renderCategoryChips();
  renderProducts();
  updateCartUI();
});
