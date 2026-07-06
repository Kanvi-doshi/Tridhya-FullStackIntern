let products = JSON.parse(localStorage.getItem("products")) || [];

const productCounter= createCounter(products.length);
const filterCache = createCache();
let editId = null;

const productNameInput = document.querySelector('input[placeholder="e.g. Headphones"]');
const categorySelect = document.querySelector('select');
const priceInput = document.querySelector('input[type="number"]');
const searchInput = document.querySelector('.search input');
const filterSelects = document.querySelectorAll('.filters select');
const countEl = document.querySelector('.count');
const addBtn = document.querySelector('.btn');
const clearBtn = document.querySelector('.clear-btn');

const container = document.querySelector("#productTableBody");
function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

function createCounter(initialValue = 0) {
    let count = initialValue;
    return {
        increment() {
            count++;
        },
        decrement() {
            if (count > 0) count--;
        },
        reset() {
            count = 0;
        },
        set(value) {
            count = value;
        },
        getValue() {
            return count;
        }
    };
}

function createCache() {
    const cache = {};
    return {
        get(key) {
            return cache[key];
        },
        set(key, value) {
            cache[key] = value;
        },
        has(key) {
            return key in cache;
        },
        clear() {
            for (const key in cache) {
                delete cache[key];
            }
        }
    };
}


addBtn.addEventListener("click", () => {
  const name = productNameInput.value.trim();
  const category = categorySelect.value;
  const price = Number(priceInput.value);
  
  if (!name || category === "-- Select --" || price < 0) return;

  if (editId !== null) {
        const product = products.find(p => p.id === editId);
        product.name = name;
        product.category = category;
        product.price = price;
        editId = null;
        addBtn.textContent = "+ Add Product";

    } else {
        products.push({
            id: Date.now(),
            name,
            category,
            price,
            createdAt: new Date(),
        });
        productCounter.increment();
    }
  filterCache.clear();
  saveProducts();
  clearInputs();
  renderProducts();
});

function clearInputs() {
  productNameInput.value = "";
  categorySelect.value = "-- Select --";
  priceInput.value = "";
  editId = null;
  addBtn.textContent = "+ Add Product";
}

function clearAllProducts() {
    products = [];

    productCounter.reset();
    filterCache.clear();

    saveProducts();
    renderProducts();
}
clearBtn.addEventListener("click", clearAllProducts);

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    productNameInput.value = product.name;
    categorySelect.value = product.category;
    priceInput.value = product.price;
    editId = id;
    addBtn.textContent = "Update Product";
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  productCounter.decrement();
  filterCache.clear();
  saveProducts();
  renderProducts();
}

function renderProducts(list = products) {
  container.innerHTML = "";

  list.forEach(product => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price}</td>
            <td>
                <button class="edit-btn" onclick="editProduct(${product.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        `;

    container.appendChild(row);
  });

  countEl.textContent = `${productCounter.getValue()} product${productCounter.getValue() !== 1 ? "s" : ""}`;
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  const cacheKey = `search-${value}`;
  if (filterCache.has(cacheKey)) {
      renderProducts(filterCache.get(cacheKey));
      return;
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );
  filterCache.set(cacheKey, filtered);
  renderProducts(filtered);
});

filterSelects.forEach(select => {
  select.addEventListener("change", () => {
    applyFilters();
  });
});

function applyFilters() {
    const price = filterSelects[0].value;
    const category = filterSelects[1].value;

    const cacheKey = `filter-${price}-${category}`;

     if (filterCache.has(cacheKey)) {
        renderProducts(filterCache.get(cacheKey));
        return;
    }
    const filtered =products.filter(product =>
        (price === "All Prices" ||
        (price === "100-1000" && product.price >= 100 && product.price <= 1000) ||
        (price === "1000-5000" && product.price > 1000 && product.price <= 5000) ||
        (price === "5000+" && product.price > 5000))
        &&
        (category === "Category" ||
        product.category.toLowerCase() === category.toLowerCase())
    );
  filterCache.set(cacheKey, filtered);
  renderProducts(filtered);
}
renderProducts();
