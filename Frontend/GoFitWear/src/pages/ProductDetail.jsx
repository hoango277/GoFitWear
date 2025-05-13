import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Spin, Button, message, Breadcrumb, Tabs, Select, InputNumber } from 'antd';
import { HeartOutlined, HeartFilled, LoadingOutlined } from '@ant-design/icons';
import customizeAxios from '../services/customizeAxios';

const { TabPane } = Tabs;

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [hoverImage, setHoverImage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const userInfoStr = localStorage.getItem('user');
    if (userInfoStr) {
      const parsedUserInfo = JSON.parse(userInfoStr);
      setUserInfo(parsedUserInfo);
    }
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await customizeAxios.get(`/api/products/${productId}`);
        const productData = productResponse.data;
        setProduct(productData);

        // Fetch product variants
        const variantsResponse = await customizeAxios.get(`/api/product-variants/product/${productId}?page=0&size=20`);
        console.log(variantsResponse);
        const variantData = variantsResponse.data.data;
        setVariants(variantData);

        // Extract unique sizes and colors
        const sizes = [...new Set(variantData.map(variant => variant.size))];
        const colors = [...new Set(variantData.map(variant => variant.color))];
        
        setAvailableSizes(sizes);
        setAvailableColors(colors);
        
        // Set default selections
        if (sizes.length > 0) setSelectedSize(sizes[0]);
        if (colors.length > 0) setSelectedColor(colors[0]);
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        message.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Fetch wishlist items when user info is available
  useEffect(() => {
    if (userInfo?.token) {
      fetchWishlistItems();
    }
  }, [userInfo, productId]);

  // Check if the current product is in the wishlist
  useEffect(() => {
    if (wishlistItems.length > 0 && product) {
      const isInWishlist = wishlistItems.some(item => item.productId === parseInt(productId));
      setInWishlist(isInWishlist);
    }
  }, [wishlistItems, product, productId]);

  // Update selected variant when size or color changes
  useEffect(() => {
    if (selectedSize && selectedColor && variants.length > 0) {
      const variant = variants.find(
        v => v.size === selectedSize && v.color === selectedColor
      );
      setSelectedVariant(variant);
    }
  }, [selectedSize, selectedColor, variants]);

  const fetchWishlistItems = async () => {
    if (!userInfo?.token) return;
    
    try {
      const response = await customizeAxios.get('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      
      if (response.data.statusCode === 200) {
        setWishlistItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const increaseQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!userInfo) {
      message.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (!selectedVariant) {
      message.warning('Vui lòng chọn kích thước và màu sắc');
      return;
    }

    try {
      const response = await customizeAxios.post(
        `/api/users/${userInfo.userId}/cart/items`,
        {
          variantId: selectedVariant.variantId,
          quantity: quantity
        }
      );
      console.log(response);

      if (response.statusCode === 200) {
        message.success('Đã thêm sản phẩm vào giỏ hàng');
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const toggleWishlist = async () => {
    if (!userInfo?.token) {
      message.warning('Vui lòng đăng nhập để sử dụng chức năng yêu thích');
      return;
    }

    setLoadingWishlist(true);
    
    try {
      if (inWishlist) {
        // Remove from wishlist
        await customizeAxios.delete(`/api/wishlist/product/${productId}`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        setInWishlist(false);
        message.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        // Add to wishlist
        await customizeAxios.post('/api/wishlist', 
          { productId: parseInt(productId) },
          {
            headers: {
              'Authorization': `Bearer ${userInfo.token}`
            }
          }
        );
        setInWishlist(true);
        message.success('Đã thêm vào danh sách yêu thích');
      }
      
      // Refresh wishlist
      fetchWishlistItems();
    } catch (error) {
      console.error('Error updating wishlist:', error);
      message.error('Không thể cập nhật danh sách yêu thích');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleImageHover = (imageUrl) => {
    setHoverImage(imageUrl);
  };

  const handleImageLeave = () => {
    setHoverImage(null);
  };

  const handleVariantChange = (variantId) => {
    const variant = product.variants.find(v => v.variantId === variantId);
    setSelectedVariant(variant);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  // Get current variant image
  const currentImage = hoverImage || (selectedVariant ? selectedVariant.imageUrl : product.imageUrl);
  const isOutOfStock = selectedVariant ? selectedVariant.stockQuantity <= 0 : false;
  
  return (
    <div className="container mx-auto px-4 py-8 font-montserrat" style={{ maxWidth: '80%' }}>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">Trang chủ</Link>
        </Breadcrumb.Item>
        {product.category?.parent && (
          <Breadcrumb.Item>
            <Link to={`/category/${product.category.parent.categoryId}`}>
              {product.category.parent.name}
            </Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>
          <Link to={`/category/${product.category?.categoryId}`}>
            {product.category?.name}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="overflow-hidden border border-gray-200">
          <img 
            src={currentImage} 
            alt={product.name} 
            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-medium mb-2 uppercase">{product.name}</h1>
          <p className="text-sm text-gray-600 mb-4">Mã sản phẩm: {product.productId}</p>
          
          <div className="mb-6">
            <p className="text-xl">
              <span className="mr-2">Giá:</span>
              <span className="text-lg font-bold">{formatPrice(product.price)} <sup>đ</sup></span>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-base mb-2">Màu</h3>
            <div className="flex space-x-2">
              {availableColors.map(color => (
                <div 
                  key={color} 
                  className={`cursor-pointer w-16 h-16 border ${selectedColor === color ? 'border-black' : 'border-gray-300'}`}
                  onClick={() => handleColorChange(color)}
                  onMouseEnter={() => handleImageHover(variants.find(v => v.color === color)?.imageUrl)}
                  onMouseLeave={handleImageLeave}
                >
                  <img 
                    src={variants.find(v => v.color === color)?.imageUrl}
                    alt={color}
                    className="w-full h-full object-cover"
                  />
                  {selectedColor === color && (
                    <div className="relative">
                      <div className="absolute -top-2 -right-2 h-5 w-5 bg-black rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base mb-2">Kích thước</h3>
            <div className="flex space-x-2">
              {availableSizes.map(size => (
                <div 
                  key={size} 
                  className={`w-16 h-8 flex items-center justify-center cursor-pointer border ${selectedSize === size ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base mb-2">Số lượng</h3>
            <div className="flex items-center border border-gray-300 inline-flex">
              <button 
                className="w-8 h-8 flex items-center justify-center border-r border-gray-300"
                onClick={decreaseQuantity}
              >
                -
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button 
                className="w-8 h-8 flex items-center justify-center border-l border-gray-300"
                onClick={increaseQuantity}
              >
                +
              </button>
            </div>
            {selectedVariant && (
              <p className="text-sm text-gray-500 mt-2">
                Còn {selectedVariant.stockQuantity} sản phẩm
              </p>
            )}
          </div>

          <div className="mb-8">
            {isOutOfStock ? (
              <button 
                className="w-full py-3 bg-black text-white text-sm uppercase font-medium cursor-not-allowed opacity-70"
                disabled
              >
                Hết hàng
              </button>
            ) : (
              <Button 
                type="primary"
                size="large"
                className="w-full bg-black hover:bg-gray-800"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
            )}
          </div>

          <div className="mb-8">
            <Button 
              size="large" 
              icon={loadingWishlist ? <LoadingOutlined /> : (inWishlist ? <HeartFilled className="text-red-500" /> : <HeartOutlined />)}
              onClick={toggleWishlist}
              className="flex items-center border rounded-md px-4"
              disabled={loadingWishlist}
            >
              {inWishlist ? "Đã yêu thích" : "Yêu thích"}
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-medium mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center">
              <span className="mr-2">🚚</span>
              <span className="uppercase font-medium">Giao hàng nhanh chóng - Thanh toán cod</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🏷️</span>
              <span className="uppercase font-medium">Chính sách bảo hành uy tín, tin cậy</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🔄</span>
              <span className="uppercase font-medium">Đổi trả hàng trong vòng 3 ngày tính từ ngày nhận hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Chi tiết sản phẩm" key="1">
            <div className="p-6 border border-gray-200 rounded">
              <h3 className="font-medium mb-4">Thông tin chi tiết</h3>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium w-1/4">Thương hiệu</td>
                    <td className="py-2">{product.brand?.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">Danh mục</td>
                    <td className="py-2">{product.category?.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">Chất liệu</td>
                    <td className="py-2">100% cotton</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Xuất xứ</td>
                    <td className="py-2">Việt Nam</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabPane>
          <TabPane tab="Đánh giá" key="2">
            <div className="p-6 border border-gray-200 rounded">
              <h3 className="font-medium mb-4">Đánh giá từ khách hàng</h3>
              <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail; 