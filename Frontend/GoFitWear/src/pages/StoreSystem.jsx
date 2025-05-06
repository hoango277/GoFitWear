import React from 'react';

const StoreSystem = () => {
    return (
        <div className="container mx-auto px-4 py-8 font-montserrat" style={{ maxWidth: '85%' }}>
            <h1 className="text-3xl font-extralight mb-8">HỆ THỐNG CỬA HÀNG TOÀN QUỐC</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Store Information */}
                <div className="md:col-span-1">
                    <div className="border border-black h-full">
                        <div className="bg-white px-4 py-2 border-b border-black">
                            <span className="font-medium">Hệ thống cửa hàng</span>
                        </div>
                        <div className="p-4">
                            <h2 className="text-xl font-extralight text-red-500 mb-4">HÀ NỘI</h2>
                            <div className="space-y-4 ml-2">
                                <div className='border-b border-black'>
                                    <h3 className="font-semibold mb-2">Chi Nhánh - GoFitWear - 180 Hồng Bàng</h3>
                                    <p className="flex items-center mb-1">
                                        <span className="mr-2">►</span>
                                        180 Hồng Bàng - Hoàn Kiếm - Hà Nội
                                    </p>
                                    <p className="flex items-center text-sm mb-2">
                                        <span className="mr-2">📲</span>
                                        Hotline: 093.223.5152
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="md:col-span-2">
                    <div className="border border-black overflow-hidden">
                        <div className="bg-white px-4 py-2 border-b border-black">
                            <span className="font-medium">Địa chỉ TOÀN QUỐC - Hotline: 0366469999</span>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096947685738!2d105.84772067499449!3d21.02800328062254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x1babf6bb4f9a00f!2zMTgwIFAuIEjhu5NuZyBCw6BuZywgQ-G7rWEgxJDDtG5nLCBIb8OgbiBLaeG6v20sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1709826899801!5m2!1svi!2s"
                            width="100%"
                            height="600"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreSystem; 