import products from "../data/product";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchProducts } from "../redux/productSlice";

function ProductList() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();

  const { items, loading, error } = useSelector((state) => state.products);
  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  const filteredProducts = items.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white p-8 rounded-2xl w-full">
      <h2 className="text-4xl font-bold text-center text-slate-800 mb-10">
        Our Products
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </h2>
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
          <option value="Electronics">Electronics</option>
          <option value="men's clothing">men </option>
          <option value="women's clothing">women</option>
          <option value="jewelery">jewelery</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            className="border rounded-xl p-4 shadow-md hover:shadow-xl transition duration-300 min-h-[500px] flex flex-col"
          >
            <span className="border-l-4 border-blue-500 pl-2 font-medium capitalize ">
              {product.category}
            </span>
            <img  
              src={product.image}
              alt={product.title}
              className="w-full h-48 object-scale-down rounded-lg"
              onClick={() => navigate(`/products/${product.id}`)}
            />

            <div className="mt-8">
              <h3
                className="font-bold text-xl line-clamp-1"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {product.title}
              </h3>

              <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                {product.description}
              </p>

              <p className="text-2xl font-semibold mt-3">₹{product.price}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(addToCart(product));
                  toast.success(`${product.title} added to cart!`, {
                    position: "top-right",
                    autoClose: 1000,
                  });
                }}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Add To Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
