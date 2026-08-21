import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createCartItem } from "../service/cart.service";
import { toast } from "react-toastify";

function ProductDetails() {
  const { id } = useParams();

  const product = useSelector((state) =>
    state.products.items.find((item) => item._id === id),
  );

  if (!product) {
    return <h1 className="text-center text-2xl mt-10">Product not found!</h1>;
  }

  const handleAddToCart = async () => {
    try {
      await createCartItem(product._id, 1);

      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 1000,
      });
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full p-10">
        {/* Product Image */}
        <div className="flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="h-96 w-full object-contain"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <span className="text-blue-500 font-medium capitalize">
            {product.category?.name}
          </span>

          <h1 className="text-4xl font-bold mt-3">{product.name}</h1>

          <p className="text-yellow-500 mt-3">⭐ {product.rating} / 5</p>

          <p className="mt-5 text-gray-700 leading-7">{product.description}</p>

          <h2 className="text-4xl font-bold mt-6">₹{product.price}</h2>

          <p className="text-gray-500 mt-3">Stock: {product.stock}</p>

          <button
            onClick={handleAddToCart}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
