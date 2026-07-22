import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const product = useSelector((state) =>
    state.products.items.find((item) => item.id === Number(id)),
  );

  if (!product) {
    return <h1>Product not found!</h1>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-6xl w-full p-10">
        <img
          src={product.image}
          alt={product.title}
          className="h-96 object-contain"
        />
      </div>
      <div>
        <h1 className="text-4xl font-bold">{product.title}</h1>

        <p className="text-gray-500 mt-3 capitalize">{product.category}</p>

        <p className="text-yellow-500 mt-3">
          ⭐ {product.rating.rate} ({product.rating.count} reviews)
        </p>

        <p className="mt-5 text-gray-700 leading-7">{product.description}</p>

        <h2 className="text-4xl font-bold mt-6">₹{product.price}</h2>
        <button
          onClick={() => {
            dispatch(addToCart(product));
            toast.success(`${product.title} added to cart!`, {
              position: "top-right",
              autoClose: 1000,
            });
          }}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
