import { useState, useEffect } from "react";
import { callHomeProduct } from "../../services/api";
import { Link } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const NewItemsOnSale = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Format price with commas in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Fetch products when component mounts or page changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await callHomeProduct(currentPage, 8);
      console.log(response);
      setProducts(response.data.data);
      // setMeta(response.meta);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };


  const handleAddToWishlist = (e, productId) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation(); // Stop event propagation
    
    if (wishlist.includes(productId)) {
      // Remove from wishlist if already added
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      // Add to wishlist
      setWishlist([...wishlist, productId]);
    }
    
    console.log(`${wishlist.includes(productId) ? 'Removing' : 'Adding'} product ${productId} to wishlist`);
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mt-4.5 mb-8">
        <h1 className="text-3xl font-extralight">SẢN PHẨM MỚI</h1>
        <span className="text-gray-700 mb-2">Những xu hướng thời trang mới</span>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có sản phẩm nào để hiển thị
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.productId} 
                  className="relative group"
                  onMouseEnter={() => setHoveredProduct(product.productId)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Link 
                    to={`/product/${product.productId}`} 
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105 flex flex-col h-full block"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x300?text=Image+Not+Available";
                        }}
                      />
                      <button 
                        onClick={(e) => handleAddToWishlist(e, product.productId)}
                        className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 focus:outline-none transform 
                          ${hoveredProduct === product.productId || wishlist.includes(product.productId) 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-90'} 
                          ${wishlist.includes(product.productId) 
                            ? 'bg-red-100' 
                            : 'bg-white bg-opacity-80 hover:bg-opacity-100'}`}
                        aria-label="Add to wishlist"
                      >
                        {wishlist.includes(product.productId) ? (
                          <HeartSolid className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartOutline className="h-5 w-5 text-red-500" />
                        )}
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                          {product.name}
                        </h3>
                        <span className="bg-black text-white text-xs font-medium px-2 py-1 rounded">
                          {product.brand.name}
                        </span>
                      </div>
                      
                      <span className="text-xl font-bold text-black mt-auto">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}    
        </>
      )}
    </div>
    </>
  );
};

export default NewItemsOnSale;
