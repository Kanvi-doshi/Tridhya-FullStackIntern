import { products } from "./data.js";
import { debounce, throttle } from "./utils.js";

const searchInput = document.getElementById("searchInput");
const productContainer = document.getElementById("productContainer");
const resultCount = document.getElementById("resultCount");
const status = document.getElementById("status");
let inputCount = 0;
let searchCount = 0;

const renderProducts = (products) => {
  resultCount.textContent = `${products.length} Product${
    products.length !== 1 ? "s" : ""
  } Found`;

  if (!products.length) {
    productContainer.innerHTML = `
      <div class="no-results">
        <h3>No products Found</h3>
        <p>Try searching with a different keyword.</p>
      </div>
    `;
    return;
  }

  productContainer.innerHTML = products
    .map(
      ({ name, category, brand, price }) => `
        <div class="card">
          <h3>${name}</h3>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Brand:</strong> ${brand}</p>
          <p><strong>Price:</strong> ₹${price.toLocaleString()}</p>
        </div>
      `,
    )
    .join("");
};

const searchProducts = (keyword) => {
  const search = keyword.trim().toLowerCase();

  if (!search) return [...products];

  return products.filter(({ name, category, brand }) =>
    [name, category, brand].some((value) =>
      value.toLowerCase().includes(search),
    ),
  );
};

const handleInput = () => {
  inputCount++;
  console.log(`Input Event: ${inputCount}`);
};

const handleSearch = () => {
  searchCount++;
  console.log(
    `Search Executed: ${searchCount} | Keyword: "${searchInput.value}"`,
  );
  // console.log(`Search function called: ${searchCount} time(s)`);
  const filtered = searchProducts(searchInput.value);
  renderProducts(filtered);
};

renderProducts(products);

searchInput.addEventListener("input", handleInput);

searchInput.addEventListener("input", debounce(handleSearch, 400));

window.addEventListener(
  "scroll",
  throttle(() => {
    status.textContent = "Scroll Event Triggered";
    console.log("Throttled Scroll Event");
  }, 250),
);
