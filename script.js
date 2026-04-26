const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const footerYear = document.getElementById("footerYear");
const emailButton = document.getElementById("emailButton");
const page = document.body.dataset.page || "";

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
    });
  });
}

if (footerYear) {
  footerYear.textContent = "Copyright " + new Date().getFullYear() + " Kessy Labs. All rights reserved.";
}

if (contactForm) {
  const submitMessage = (mode) => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please fill in all fields before sending your message.";
      formStatus.className = "form-status error";
      return false;
    }

    const rawMessage =
      "Hello Kessy Labs,\n\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Message: " + message;

    if (mode === "whatsapp") {
      window.open(
        "https://wa.me/2348000000000?text=" + encodeURIComponent(rawMessage),
        "_blank",
        "noopener,noreferrer"
      );
      formStatus.textContent = "Your WhatsApp message is ready to send.";
    } else {
      const recipient = contactForm.dataset.email || "hello@kessylabs.com";
      window.location.href =
        "mailto:" +
        recipient +
        "?subject=" +
        encodeURIComponent("New enquiry from " + name) +
        "&body=" +
        encodeURIComponent(rawMessage);
      formStatus.textContent = "Your email app has been opened with the message.";
    }

    formStatus.className = "form-status success";
    return true;
  };

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitMessage("whatsapp");
  });

  if (emailButton) {
    emailButton.addEventListener("click", () => {
      submitMessage("email");
    });
  }
}

function formatProductCard(product) {
  const cardCategory = product.category || "";
  return `
    <article class="content-card product-card">
      <div class="product-image">
        <div class="visual-block">${product.imageLabel}</div>
      </div>
      <div class="product-tags">
        <span class="product-badge">${product.badge || product.category}</span>
        <span class="product-category">${cardCategory}</span>
      </div>
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <div class="product-meta">
        <span>${product.price || "Price on request"}</span>
        <a class="affiliate-link" href="${product.affiliateUrl}" target="_blank" rel="noreferrer">Buy Now</a>
      </div>
    </article>
  `;
}

function formatCategoryCard(category) {
  return `
    <article class="content-card category-card">
      <p class="card-label">Category</p>
      <h3>${category.title}</h3>
      <p>${category.description}</p>
      <a class="inline-link" href="${category.link}">Open section</a>
    </article>
  `;
}

function formatToolCard(tool) {
  return `
    <article class="content-card tool-card">
      <p class="card-label">${tool.label}</p>
      <h3>${tool.title}</h3>
      <p>${tool.description}</p>
      <a class="inline-link" href="${tool.affiliateUrl}" target="_blank" rel="noreferrer">View tool</a>
    </article>
  `;
}

function formatContentCard(item) {
  return `
    <article class="content-card video-card">
      <div class="video-thumb">${item.label}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <a class="inline-link" href="${item.linkUrl}" target="_blank" rel="noreferrer">${item.linkText}</a>
    </article>
  `;
}

function renderInto(selector, items, formatter) {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }

  element.innerHTML = items.map(formatter).join("");
}

function productsBySection(section) {
  return kessyData.products.filter((product) => product.section === section);
}

function productsByIds(ids) {
  return ids
    .map((id) => kessyData.products.find((product) => product.id === id))
    .filter(Boolean);
}

function buildShopCategory(product) {
  if (product.section === "budget") {
    return "Budget Tech Picks";
  }

  if (product.section === "trending") {
    return "Trending Gadgets";
  }

  if (product.section === "value") {
    return "Best Value Deals";
  }

  return product.category;
}

function renderShopStore() {
  const filterShell = document.getElementById("shopFilters");
  const catalog = document.getElementById("shopCatalog");
  const searchInput = document.getElementById("shopSearch");
  const emptyState = document.getElementById("shopEmptyState");

  if (!filterShell || !catalog) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const requestedFilter = params.get("filter");
  let activeFilter = kessyData.shopFilters.includes(requestedFilter) ? requestedFilter : "All";
  let query = "";

  filterShell.innerHTML = kessyData.shopFilters
    .map((filter) => {
      const activeClass = filter === "All" ? " filter-chip active" : " filter-chip";
      return `<button type="button" class="${activeClass.trim()}" data-filter="${filter}">${filter}</button>`;
    })
    .join("");

  const applyFilters = () => {
    const filteredProducts = kessyData.products.filter((product) => {
      const shopCategory = buildShopCategory(product);
      const matchesFilter = activeFilter === "All" || shopCategory === activeFilter || product.category === activeFilter;
      const searchBlob = [
        product.title,
        product.description,
        product.category,
        product.badge,
        shopCategory,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || searchBlob.includes(query);
      return matchesFilter && matchesQuery;
    });

    catalog.innerHTML = filteredProducts.map(formatProductCard).join("");
    emptyState.classList.toggle("hidden", filteredProducts.length > 0);

    filterShell.querySelectorAll(".filter-chip").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === activeFilter);
    });
  };

  filterShell.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  applyFilters();
}

function setupFeaturedCarousel() {
  const track = document.getElementById("featuredProducts");
  const prevButton = document.getElementById("featuredPrev");
  const nextButton = document.getElementById("featuredNext");

  if (!track || !prevButton || !nextButton) {
    return;
  }

  const cardWidth = () => {
    const card = track.querySelector(".product-card");
    return card ? card.getBoundingClientRect().width + 16 : 320;
  };

  prevButton.addEventListener("click", () => {
    track.scrollBy({ left: -cardWidth(), behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    track.scrollBy({ left: cardWidth(), behavior: "smooth" });
  });
}

if (page === "home") {
  renderInto("#featuredProducts", productsByIds(kessyData.featuredDeals), formatProductCard);
  renderInto("#categoriesGrid", kessyData.categories, formatCategoryCard);
  renderInto("#budgetProducts", productsBySection("budget"), formatProductCard);
  renderInto("#valueProducts", productsBySection("value"), formatProductCard);
  renderInto("#trendingProducts", productsBySection("trending"), formatProductCard);
  setupFeaturedCarousel();
}

if (page === "shop") {
  renderShopStore();
}

if (page === "digital") {
  renderInto("#digitalToolsGrid", kessyData.digitalTools, formatToolCard);
}

if (page === "content") {
  renderInto("#contentGrid", kessyData.contentCards, formatContentCard);
}
function buy(link){
  window.open(link, "_blank");
}
