import customAxios from "./customizeAxios"




const callHomeProduct = (page, size) =>{
    return  customAxios.get("/api/products", {
        params:{page, size}
     })
    
}

// Wishlist API functions
export const fetchWishlist = async (userId, page = 0, size = 10) => {
  try {
    console.log(`Making API call to fetch wishlist for user ${userId}, page=${page}, size=${size}`);
    const response = await customAxios.get(`/api/users/${userId}/wishlist`, {
      params: {
        page,
        size
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (userId, productId) => {
  try {
    const response = await customAxios.post(`/api/users/${userId}/wishlist`, { productId });
    return response;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, wishlistItemId) => {
  try {
    const response = await customAxios.delete(`/api/users/${userId}/wishlist/${wishlistItemId}`);
    return response;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export {
    callHomeProduct
}