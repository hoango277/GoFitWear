import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
    const { productId } = useParams();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1>Chi tiết sản phẩm {productId}</h1>
        </div>
    );
};

export default ProductDetail; 