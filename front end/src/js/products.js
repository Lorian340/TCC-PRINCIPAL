let allProducts = [];

let currentFilters = {
  query: "",
  brand: null,
  category: null,
  extra: null,
};

let currentPage = 1;
const ITEMS_PER_PAGE = 12;

async function loadProducts() {
  try {
    const response = await fetch("/test,json");
    allProducts = await response.json();

    applyFilters();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

function getColorClass(color) {
  const map = {
    "Preto": "background: #222; color: #fff;",
    "Branco": "background: #f3f3f3; color: #222; border: 1px solid #ddd;",
    "Cinza": "background: #bdbdbd; color: #222;",
    "Azul": "background: #2563eb; color: #fff;",
    "Verde": "background: #22c55e; color: #fff;",
    "Vermelho": "background: #dc2626; color: #fff;",
    "Prata": "background: #e5e7eb; color: #222;",
    "Amarelo": "background: #fde047; color: #222;",
    "Rosa": "background: #f472b6; color: #fff;",
    "Laranja": "background: #fb923c; color: #fff;",
  };
  return map[color] || "background: #e5e7eb; color: #222;";
}
function renderProducts(products) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  if (currentPage > totalPages) currentPage = 1;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginated = products.slice(start, end);

  paginated.sort((a, b) => {
    if (a.isHot && !b.isHot) return -1;
    if (!a.isHot && b.isHot) return 1;
    return 0;
  });

  paginated.forEach((p) => {
    let badges = [];
    if (p.isHot) badges.push(`<span class='bg-orange-600 text-white text-sm font-bold px-2 py-1 rounded z-10'>HOT</span>`);
    if (p.isNew) badges.push(`<span class='bg-green-600 text-white text-sm font-bold px-2 py-1 rounded z-10'>NOVO</span>`);
    if (p.isCollection) badges.push(`<span class='bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded z-10'>COLEÇÃO PREMIUM</span>`);

    const colorStyle = getColorClass(p.color);

    const limitedTag = p.isLimited
      ? `<span class="text-sm px-2 py-1 rounded bg-red-600 text-white font-bold align-middle">Edição Limitada</span>`
      : "";

    const fullName = `${p.brand} ${p.name}`;
    const displayName = fullName.length > 30 ? fullName.slice(0, 30) + "..." : fullName;

    const card = document.createElement("div");
    card.className = `bg-white rounded-md shadow hover:shadow-xl overflow-hidden transition-transform hover:-translate-y-1`;

    card.innerHTML = `
      <div class="relative min-h-0">
        <div class="absolute top-2 right-2 flex items-end gap-1 z-10">
          ${badges.join("")}
        </div>
        <img src="${p.image}" alt="${p.name}" class="w-full h-64 object-cover">
      </div>
      <div class="p-4">
        <p class="text-lg font-semibold" title="${fullName}">${displayName}</p>
        <p class="text-red-600 font-bold text-xl">R$${p.price.toFixed(2)}</p>
        <div class="flex flex-wrap gap-2 py-2 items-center">
          <span class="text-sm px-2 py-1 rounded" style="${colorStyle}">${p.color}</span>
          ${p.type ? `<span class="text-sm bg-gray-200 px-2 py-1 rounded">${p.type}</span>` : ""}
          ${limitedTag}
        </div>
        <button class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mt-2 w-full">
          Ver Detalhes
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  let pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    pagination.className = "flex justify-center items-center gap-2 mt-8";
    const parent = document.getElementById("product-list").parentElement;
    parent.appendChild(pagination);
  }
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    pagination.style.display = "none";
    return;
  }
  pagination.style.display = "flex";

  const prev = document.createElement("button");
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prev.className = "px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50";
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts(getFilteredProducts());
      window.scrollTo({ top: document.getElementById("product-list").offsetTop - 80, behavior: "smooth" });
    }
  };
  pagination.appendChild(prev);

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className =
      "px-3 py-1 rounded " +
      (i === currentPage
        ? "bg-red-600 text-white font-bold"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300 transition");
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      currentPage = i;
      renderProducts(getFilteredProducts());
      window.scrollTo({ top: document.getElementById("product-list").offsetTop - 80, behavior: "smooth" });
    };
    pagination.appendChild(btn);
  }

  const next = document.createElement("button");
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  next.className = "px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50";
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(getFilteredProducts());
      window.scrollTo({ top: document.getElementById("product-list").offsetTop - 80, behavior: "smooth" });
    }
  };
  pagination.appendChild(next);
}

function getFilteredProducts() {
  let filtered = allProducts;

  if (currentFilters.query) {
    const query = currentFilters.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.type && p.type.toLowerCase().includes(query)) ||
        (p.color && p.color.toLowerCase().includes(query))
    );
  }
  if (currentFilters.brand) {
    filtered = filtered.filter((p) => p.brand === currentFilters.brand);
  }
  if (currentFilters.category) {
    filtered = filtered.filter((p) => p.category === currentFilters.category);
  }
  if (currentFilters.extra) {
    if (currentFilters.extra === "Edição Limitada") {
      filtered = filtered.filter((p) => p.isLimited);
    } else if (currentFilters.extra === "Hot") {
      filtered = filtered.filter((p) => p.isHot);
    } else if (currentFilters.extra === "Novo") {
      filtered = filtered.filter((p) => p.isNew);
    } else if (currentFilters.extra === "Coleção") {
      filtered = filtered.filter((p) => p.isCollection);
    }
  }
  return filtered;
}

function applyFilters() {
  currentPage = 1;
  renderActiveFilters();
  renderProducts(getFilteredProducts());
}

function renderActiveFilters() {
  const container = document.getElementById("active-filters");
  if (!container) return;
  container.innerHTML = "";

  let hasAny = false;

  if (currentFilters.query) {
    hasAny = true;
    const el = document.createElement("span");
    el.className = "bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-2";
    el.innerHTML = `<span>Busca: <b>${currentFilters.query}</b></span>
      <button class="ml-2 text-red-600 hover:text-red-800" title="Remover busca" data-filter="query">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    container.appendChild(el);
  }
  if (currentFilters.brand) {
    hasAny = true;
    const el = document.createElement("span");
    el.className = "bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-2";
    el.innerHTML = `<span>Marca: <b>${currentFilters.brand}</b></span>
      <button class="ml-2 text-red-600 hover:text-red-800" title="Remover marca" data-filter="brand">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    container.appendChild(el);
  }
  if (currentFilters.category) {
    hasAny = true;
    const el = document.createElement("span");
    el.className = "bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-2";
    el.innerHTML = `<span>Categoria: <b>${currentFilters.category}</b></span>
      <button class="ml-2 text-red-600 hover:text-red-800" title="Remover categoria" data-filter="category">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    container.appendChild(el);
  }
  if (currentFilters.extra) {
    hasAny = true;
    const el = document.createElement("span");
    el.className = "bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-2";
    el.innerHTML = `<span>Extra: <b>${currentFilters.extra}</b></span>
      <button class="ml-2 text-red-600 hover:text-red-800" title="Remover extra" data-filter="extra">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    container.appendChild(el);
  }

  if (hasAny) {
    const clearBtn = document.createElement("button");
    clearBtn.className = "bg-green-600 text-white px-4 py-1 rounded ml-2 hover:bg-green-700 flex items-center gap-2";
    clearBtn.innerHTML = `<i class="fa-solid fa-broom"></i> Limpar filtros`;
    clearBtn.onclick = () => {
      currentFilters = { query: "", brand: null, category: null, extra: null };
      applyFilters();
    };
    container.appendChild(clearBtn);
  }

  container.querySelectorAll("button[data-filter]").forEach((btn) => {
    btn.onclick = () => {
      const key = btn.getAttribute("data-filter");
      currentFilters[key] = key === "query" ? "" : null;
      applyFilters();
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  const headerInput = document.querySelector("header input[type='text']");
  const headerBtn = document.querySelector("header button");
  if (headerBtn && headerInput) {
    headerBtn.addEventListener("click", () => {
      currentFilters.query = headerInput.value.trim();
      applyFilters();
    });
    headerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        currentFilters.query = headerInput.value.trim();
        applyFilters();
      }
    });
  }

  const mainInput = document.querySelector("main input[type='text']");
  const mainBtn = document.querySelector("main button");
  if (mainBtn && mainInput) {
    mainBtn.addEventListener("click", () => {
      currentFilters.query = mainInput.value.trim();
      applyFilters();
    });
    mainInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        currentFilters.query = mainInput.value.trim();
        applyFilters();
      }
    });
  }
  document.querySelectorAll("nav button, .marcas-list button").forEach((el) => {
    el.addEventListener("click", () => {
      currentFilters.brand = el.textContent.trim();
      applyFilters();
    });
  });

  document.querySelectorAll(".categorias-list button").forEach((el) => {
    el.addEventListener("click", () => {
      currentFilters.category = el.textContent.trim();
      applyFilters();
    });
  });

  document.querySelectorAll(".extras-list button").forEach((el) => {
    el.addEventListener("click", () => {
      currentFilters.extra = el.textContent.trim();
      applyFilters();
    });
  });
});
