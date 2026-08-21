import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCartItem } from "../service/cart.service";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { setCartItems } from "../redux/cartSlice";
import { fetchProducts } from "../redux/productSlice";
import { fetchUserCart } from "../service/cart.service";

function ProductList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { items, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: 1,
        limit: 10,
        search,
        category,
      }),
    );
  }, [dispatch, search, category]);

  if (loading) {
    return <h1 className="text-center text-2xl mt-10">Loading...</h1>;
  }

  if (error) {
    return <h1 className="text-center text-red-500 text-xl mt-10">{error}</h1>;
  }

  return (
    <div className="bg-white p-8 rounded-2xl w-full">
      <h2 className="text-4xl font-bold text-center text-slate-800 mb-10">
        Our Products
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </h2>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-lg flex-1"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="All">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
          <option value="home-kitchen">Home & Kitchen</option>
        </select>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((product) => (
          <div
            key={product._id}
            onClick={() => navigate(`/products/${product._id}`)}
            className="border rounded-xl p-4 shadow-md hover:shadow-xl transition duration-300 min-h-[500px] flex flex-col cursor-pointer justify-around"
          >
            <span className="border-l-4 border-blue-500 pl-2 font-medium capitalize">
              {product.category?.name}
            </span>

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-scale-down rounded-lg "
            />

            <div className="mt-9">
              <h3 className="font-bold text-xl line-clamp-1">{product.name}</h3>

              <p className="text-gray-600 mt-2 text-sm line-clamp-1">
                {product.description}
              </p>

              <p className="text-2xl font-semibold mt-3">₹{product.price}</p>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await createCartItem(product._id, 1);
                    const updatedCart = await fetchUserCart();

                    dispatch(setCartItems(updatedCart.cart.items));

                    toast.success(`${product.name} added to cart!`, {
                      position: "top-right",
                      autoClose: 1000,
                    });
                  } catch (error) {
                    toast.error(
                      error.message || "Failed to add product to cart",
                    );
                  }
                }}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Add To Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Products */}
      {items.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No products found.</p>
      )}
    </div>
  );
}

export default ProductList;
