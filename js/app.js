const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzU5M7u_UEXCBD8E4GyHHwzPHrO4H3e54X6HX6_h6LLt6tP59eH8LFVX9xItN5y3OG9w/exec";

class GalleryApp {
  constructor() {
    this.mediaItems = [];
    this.filteredItems = [];
    this.currentIndex = 0;

    this.statusContainer = document.getElementById("statusContainer");
    this.galleryGrid = document.getElementById("galleryGrid");
    this.searchInput = document.getElementById("searchInput");
    this.photoCount = document.getElementById("photoCount");
    
    this.lightbox = document.getElementById("lightbox");
    this.lightboxImg = document.getElementById("lightboxImg");
    this.lightboxCaption = document.getElementById("lightboxCaption");
    this.lightboxCounter = document.getElementById("lightboxCounter");
    this.lightboxClose = document.getElementById("lightboxClose");
    this.lightboxPrev = document.getElementById("lightboxPrev");
    this.lightboxNext = document.getElementById("lightboxNext");

    this.init();
  }

  init() {
    this.setupEvents();
    this.fetchData();
  }

  async fetchData() {
    if (!this.statusContainer || !this.galleryGrid) return;

    try {
      const response = await fetch(APPS_SCRIPT_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status}`);
      }

      this.mediaItems = await response.json();
      this.filteredItems = [...this.mediaItems];

      if (!this.mediaItems || this.mediaItems.length === 0) {
        this.statusContainer.innerHTML = "<p>No memories have been uploaded yet.</p>";
        return;
      }

      this.statusContainer.style.display = "none";
      this.renderGallery();
    } catch (error) {
      console.error("Failed to load gallery:", error);
      this.statusContainer.innerHTML = "<p style='color: var(--accent-color);'>Failed to load memories. Please try again later.</p>";
    }
  }

  renderGallery() {
    if (!this.galleryGrid || !this.photoCount) return;

    this.galleryGrid.innerHTML = "";
    this.photoCount.innerText = `${this.filteredItems.length} ${this.filteredItems.length === 1 ? 'Item' : 'Items'}`;

    if (this.filteredItems.length === 0) {
      this.galleryGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;'>No matching photos found.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    this.filteredItems.forEach((item, index) => {
      const card = this.createCard(item, index);
      fragment.appendChild(card);
    });

    this.galleryGrid.appendChild(fragment);
  }

  createCard(item, index) {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.style.animationDelay = `${(index % 12) * 0.05}s`;

    card.innerHTML = `
      <div class="img-wrapper">
        <img class="gallery-img" src="${item.imageUrl}" alt="${this.escapeHtml(item.name)}" loading="lazy" referrerpolicy="no-referrer" />
        <div class="img-overlay">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
      </div>
      <div class="card-info">
        <p class="card-title">${this.escapeHtml(item.name)}</p>
      </div>
    `;

    card.addEventListener("click", () => this.openLightbox(index));
    return card;
  }

  setupEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.filteredItems = this.mediaItems.filter(item => 
          item.name.toLowerCase().includes(query)
        );
        this.renderGallery();
      });
    }

    if (!this.lightbox) return;

    this.lightboxClose?.addEventListener("click", () => this.closeLightbox());
    this.lightboxPrev?.addEventListener("click", () => this.navigateLightbox(-1));
    this.lightboxNext?.addEventListener("click", () => this.navigateLightbox(1));

    this.lightbox.addEventListener("click", (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!this.lightbox?.classList.contains("active")) return;

      if (e.key === "Escape") this.closeLightbox();
      if (e.key === "ArrowLeft") this.navigateLightbox(-1);
      if (e.key === "ArrowRight") this.navigateLightbox(1);
    });
  }

  openLightbox(index) {
    if (!this.lightbox || !this.lightboxImg || !this.lightboxCaption) return;

    this.currentIndex = index;
    this.updateLightboxContent();
    
    this.lightbox.classList.add("active");
    this.lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  updateLightboxContent() {
    const item = this.filteredItems[this.currentIndex];
    if (!item) return;

    this.lightboxImg.src = item.imageUrl;
    this.lightboxImg.alt = item.name;
    this.lightboxCaption.innerText = item.name;
    if (this.lightboxCounter) {
      this.lightboxCounter.innerText = `${this.currentIndex + 1} / ${this.filteredItems.length}`;
    }
  }

  navigateLightbox(direction) {
    if (this.filteredItems.length === 0) return;

    this.currentIndex = (this.currentIndex + direction + this.filteredItems.length) % this.filteredItems.length;
    this.updateLightboxContent();
  }

  closeLightbox() {
    if (!this.lightbox || !this.lightboxImg) return;

    this.lightbox.classList.remove("active");
    this.lightbox.setAttribute("aria-hidden", "true");
    this.lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new GalleryApp();
});