let products = JSON.parse(localStorage.getItem("products")) || [];
let editId = null;

const productNameInput = document.querySelector('input[placeholder="e.g. Headphones"]');
const categorySelect = document.querySelector('select');
const priceInput = document.querySelector('input[type="number"]');
const addBtn = document.querySelector('.btn');
const searchInput = document.querySelector('.search input');
const filterSelects = document.querySelectorAll('.filters select');
const countEl = document.querySelector('.count');

const container = document.querySelector("#productTableBody");
function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
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
            createdAt: new Date()
        });
    }
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

  countEl.textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );

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

    renderProducts(products.filter(product =>
        (price === "All Prices" ||
        (price === "100-1000" && product.price >= 100 && product.price <= 1000) ||
        (price === "1000-5000" && product.price > 1000 && product.price <= 5000) ||
        (price === "5000+" && product.price > 5000))
        &&
        (category === "Category" ||
        product.category.toLowerCase() === category.toLowerCase())
    ));
  renderProducts();
}
renderProducts();
