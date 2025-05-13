import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import customizeAxios from '../services/customizeAxios';
import { Pagination, Button, Collapse, Input } from 'antd';
import ProductCard from '../components/ProductCard';

const { Panel } = Collapse;

// Hàm loại bỏ dấu tiếng Việt và chuyển về thường
function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const AllProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 5000000]);
  const minPriceInputRef = useRef(null);
  const maxPriceInputRef = useRef(null);
  const [filtersChanged, setFiltersChanged] = useState(false);
  const initialDataLoaded = useRef(false);

  // Lấy từ khóa search từ URL
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get('search') || '';

  // Only validate input is a number or empty
  const validateNumberInput = (e) => {
    const charCode = e.which ? e.which : e.keyCode;
    if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  const handleApplyPriceFilter = () => {
    const minPrice = minPriceInputRef.current?.input.value || "0";
    const maxPrice = maxPriceInputRef.current?.input.value || "5000000";
    const minPriceInt = minPrice === '' ? 0 : parseInt(minPrice);
    const maxPriceInt = maxPrice === '' ? 5000000 : parseInt(maxPrice);
    const validatedMin = Math.min(minPriceInt, maxPriceInt);
    const validatedMax = Math.max(minPriceInt, maxPriceInt);
    setSelectedPriceRange([validatedMin, validatedMax]);
    setCurrentPage(0);
    setFiltersChanged(true);
    // Giữ lại search param khi filter giá
    const params = new URLSearchParams(location.search);
    params.set('minPrice', validatedMin.toString());
    params.set('maxPrice', validatedMax.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleResetFilters = () => {
    setSelectedPriceRange([0, maxPrice]);
    if (minPriceInputRef.current) {
      minPriceInputRef.current.input.value = "0";
    }
    if (maxPriceInputRef.current) {
      maxPriceInputRef.current.input.value = maxPrice.toString();
    }
    setCurrentPage(0);
    setFiltersChanged(true);
    // Giữ lại search param khi reset filter
    const params = new URLSearchParams(location.search);
    params.delete('minPrice');
    params.delete('maxPrice');
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Fetch products (lọc FE nếu có search)
  const fetchProducts = async (isInitialLoad = false) => {
    setLoading(true);
    try {
      let filterString = '';
      if (selectedPriceRange[0] > 0 || selectedPriceRange[1] < maxPrice) {
        filterString = `(price>:${selectedPriceRange[0]}) and (price<:${selectedPriceRange[1]})`;
      }
      let page = 0;
      let result = [];
      let stop = false;
      // Nếu có search, fetch nhiều page để lọc FE
      const maxFetchPages = searchKeyword ? 10 : 3; // tối đa 80 sản phẩm khi search, 24 khi không search
      while (result.length < (searchKeyword ? 80 : pageSize) && !stop && page < maxFetchPages) {
        const response = await customizeAxios.get(`/api/products`, {
          params: {
            filter: filterString,
            page,
            size: pageSize,
            sort: 'createdAt,desc',
          }
        });
        const productsData = response.data.data || [];
        const filtered = productsData.filter(p => !p.isDeleted);
        filtered.forEach(p => {
          if (!result.some(item => item.productId === p.productId)) {
            result.push(p);
          }
        });
        if (productsData.length < pageSize) stop = true;
        page++;
      }
      // Nếu có search, lọc FE theo tên sản phẩm
      let filteredResult = result;
      if (searchKeyword) {
        const normKeyword = normalizeString(searchKeyword);
        filteredResult = result.filter(p => normalizeString(p.name).includes(normKeyword));
      }
      setProducts(filteredResult.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
      setTotalItems(filteredResult.length);
      if (isInitialLoad && result.length > 0) {
        const maxProductPrice = Math.max(...result.map(p => p.price || 0));
        const roundedMaxPrice = Math.ceil(maxProductPrice / 100000) * 100000;
        const newMaxPrice = roundedMaxPrice > 0 ? roundedMaxPrice : 5000000;
        setMaxPrice(newMaxPrice);
        setSelectedPriceRange([0, newMaxPrice]);
        if (minPriceInputRef.current && !minPriceInputRef.current.input.value) {
          minPriceInputRef.current.input.value = "0";
        }
        if (maxPriceInputRef.current && !maxPriceInputRef.current.input.value) {
          maxPriceInputRef.current.input.value = newMaxPrice.toString();
        }
        initialDataLoaded.current = true;
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setFiltersChanged(false);
    }
  };

  // Khi searchKeyword, filter, page thay đổi thì fetch lại
  useEffect(() => {
    fetchProducts(true);
    // eslint-disable-next-line
  }, [searchKeyword]);

  useEffect(() => {
    if (filtersChanged) {
      fetchProducts(false);
    }
    // eslint-disable-next-line
  }, [filtersChanged]);

  useEffect(() => {
    if (initialDataLoaded.current) {
      fetchProducts(false);
    }
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  // Filter panel
  const FilterPanel = () => (
    <div className="filter-panel">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold m-0">BỘ LỌC</h2>
        <Button 
          type="link" 
          onClick={handleResetFilters}
          className="text-gray-500 hover:text-black"
          disabled={selectedPriceRange[0] === 0 && selectedPriceRange[1] === maxPrice}
        >
          Đặt lại
        </Button>
      </div>
      <Collapse defaultActiveKey={['1']} ghost>
        <Panel header={<span className="font-medium">KHOẢNG GIÁ</span>} key="1">
          <div className="price-range-filter mt-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="TỪ"
                  prefix="đ"
                  defaultValue="0"
                  className="flex-1"
                  ref={minPriceInputRef}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyPress={validateNumberInput}
                />
                <span className="text-gray-400">—</span>
                <Input
                  placeholder="ĐẾN"
                  prefix="đ"
                  defaultValue={maxPrice}
                  className="flex-1"
                  ref={maxPriceInputRef}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyPress={validateNumberInput}
                />
              </div>
              <Button 
                type="primary" 
                onClick={handleApplyPriceFilter}
                className="w-full bg-orange-500 hover:bg-orange-600 border-none"
              >
                ÁP DỤNG
              </Button>
            </div>
          </div>
        </Panel>
      </Collapse>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mt-4.5 mb-8">
        <h1 className="text-3xl font-extralight">TẤT CẢ SẢN PHẨM</h1>
        <span className="text-gray-700 mb-2">{totalItems} sản phẩm</span>
        {searchKeyword && (
          <span className="text-base text-orange-600 mt-2">Kết quả cho từ khóa: <b>{searchKeyword}</b></span>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
          <FilterPanel />
        </div>
        <div className="w-full lg:w-3/4 xl:w-4/5">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có sản phẩm nào để hiển thị
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}
          <div className="flex justify-center mt-10">
            <Pagination 
              current={currentPage + 1} 
              total={totalItems} 
              pageSize={pageSize} 
              onChange={handlePageChange}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setCurrentPage(0);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts; 