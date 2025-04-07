import customAxios from "./customizeAxios"




const callHomeProduct = (page, size) =>{
    return  customAxios.get("/api/products", {
        params:{page, size}
     })
    
}

// Wishlist API functions
export const fetchWishlist = async (userId) => {
    try {
        const response = await customAxios.get(`/api/users/${userId}/wishlist`);
        return response;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
};

export const addToWishlist = async (userId, productId) => {
    try {
        const response = await customAxios.post(`/api/users/${userId}/wishlist`, {
            productId: productId
        });
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