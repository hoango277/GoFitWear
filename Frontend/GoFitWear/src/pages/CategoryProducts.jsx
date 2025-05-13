import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import customizeAxios from '../services/customizeAxios';
import { Pagination, Spin, Empty, Card, Row, Col, Select, Checkbox, Collapse, Button, Divider, Input } from 'antd';
import { FiFilter } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const { Option } = Select;
const { Panel } = Collapse;

const CategoryProducts = () => {
  const { categoryId, subcategoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [sortBy, setSortBy] = useState('newest');
  const [categoryName, setCategoryName] = useState('');
  
  // Filter states
  const [brands, setBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 5000000]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  // Refs for price inputs (uncontrolled components)
  const minPriceInputRef = useRef(null);
  const maxPriceInputRef = useRef(null);
  
  // Track if filters have been changed to trigger API call
  const [filtersChanged, setFiltersChanged] = useState(false);
  const initialDataLoaded = useRef(false);
  
  // Store all relevant category IDs (main category + subcategories)
  const [allCategoryIds, setAllCategoryIds] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Parse URL search params for initial values
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    
    // Set initial values from URL if they exist
    if (minPrice && maxPriceInputRef.current) {
      minPriceInputRef.current.input.value = minPrice;
    }
    
    if (maxPrice && maxPriceInputRef.current) {
      maxPriceInputRef.current.input.value = maxPrice;
    }
  }, [location.search]);
  
  // Fetch all categories dropdown and build tree
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await customizeAxios.get('/api/categories/dropdown');
        if (response && response.data) {
          setAllCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching all categories:', error);
      }
    };
    fetchAllCategories();
  }, []);

  // Lấy tất cả categoryId con (mọi cấp) của một categoryId
  const getAllSubcategoryIds = (catId, categories) => {
    let result = [];
    const directSubs = categories.filter(cat => cat.parent && cat.parent.categoryId === Number(catId));
    directSubs.forEach(sub => {
      result.push(sub.categoryId);
      result = result.concat(getAllSubcategoryIds(sub.categoryId, categories));
    });
    return result;
  };

  // Fetch category names and subcategories
  useEffect(() => {
    if (!categoryId) return;
    const currentCat = allCategories.find(cat => cat.categoryId === Number(categoryId));
    setCategoryName(currentCat ? currentCat.name : '');
    // Build allCategoryIds (categoryId + tất cả subcategories mọi cấp)
    const categoryIds = [Number(categoryId), ...getAllSubcategoryIds(categoryId, allCategories)];
    setAllCategoryIds(categoryIds);
  }, [categoryId, allCategories]);

  // Build flat list of all subcategories (all levels) for filter
  const flatSubcategoryList = (() => {
    if (!categoryId) return [];
    const ids = getAllSubcategoryIds(categoryId, allCategories);
    return allCategories.filter(cat => ids.includes(cat.categoryId));
  })();

  // Render flat filter
  const renderFlatSubcategoryFilter = () => (
    <Checkbox.Group
      value={selectedSubcategories}
      onChange={vals => {
        setSelectedSubcategories(vals);
        setCurrentPage(0);
        setFiltersChanged(true);
      }}
      className="flex flex-col gap-2"
    >
      {flatSubcategoryList.map(sub => (
        <Checkbox key={sub.categoryId} value={sub.categoryId}>
          {sub.name}
        </Checkbox>
      ))}
    </Checkbox.Group>
  );

  // Function to build filter string
  const buildFilterString = () => {
    let filterBase = '';
    
    // If we're viewing a specific subcategory, only filter by that
    if (subcategoryId) {
      filterBase = `(category.categoryId:${subcategoryId})`;
    } 
    // Otherwise include all relevant category IDs
    else if (allCategoryIds.length > 0) {
      const categoryFilters = allCategoryIds.map(id => `category.categoryId:${id}`).join(' or ');
      filterBase = `(${categoryFilters})`;
    } 
    // Fallback to just the current category ID
    else {
      filterBase = `(category.categoryId:${categoryId})`;
    }
    
    let filterString = filterBase;
    
    // Add brand filter
    if (selectedBrands.length > 0) {
      const brandFilter = `(brand.brandId:${selectedBrands.join(' or brand.brandId:')})`;
      filterString = `${filterBase} and ${brandFilter}`;
    }
    
    // Add price filter
    if (selectedPriceRange[0] > 0 || selectedPriceRange[1] < maxPrice) {
      const priceFilter = `(price>:${selectedPriceRange[0]}) and (price<:${selectedPriceRange[1]})`;
      filterString += ` and ${priceFilter}`;
    }
    
    // Add specific subcategory filter if user selected some (but not on subcategory page)
    if (selectedSubcategories.length > 0 && !subcategoryId) {
      // Reset the filter string and use only selected subcategories
      const subCategoryFilter = `(category.categoryId:${selectedSubcategories.join(' or category.categoryId:')})`;
      filterString = subCategoryFilter;
      
      // Re-add brand filter if needed
      if (selectedBrands.length > 0) {
        const brandFilter = `(brand.brandId:${selectedBrands.join(' or brand.brandId:')})`;
        filterString += ` and ${brandFilter}`;
      }
      
      // Re-add price filter
      if (selectedPriceRange[0] > 0 || selectedPriceRange[1] < maxPrice) {
        const priceFilter = `(price>:${selectedPriceRange[0]}) and (price<:${selectedPriceRange[1]})`;
        filterString += ` and ${priceFilter}`;
      }
    }
    
    return filterString;
  };

  // Function to fetch products
  const fetchProducts = async (isInitialLoad = false) => {
    if (!categoryId && !subcategoryId) return;
    setLoading(true);
    try {
      // Build sort parameter based on selection
      let sort = '';
      switch (sortBy) {
        case 'price-asc': sort = 'price,asc'; break;
        case 'price-desc': sort = 'price,desc'; break;
        case 'name-asc': sort = 'name,asc'; break;
        case 'name-desc': sort = 'name,desc'; break;
        default: sort = 'createdAt,desc';
      }
      // Build filter string
      const filterString = buildFilterString();
      let page = currentPage;
      let result = [];
      let stop = false;
      while (result.length < pageSize && !stop) {
        const response = await customizeAxios.get(`/api/products`, {
          params: {
            filter: filterString,
            page,
            size: pageSize,
            sort
          }
        });
        const productsData = response.data.data || [];
        // Lọc bỏ sản phẩm bị ẩn
        const filtered = productsData.filter(p => !p.isDeleted);
        filtered.forEach(p => {
          if (!result.some(item => item.productId === p.productId)) {
            result.push(p);
          }
        });
        if (productsData.length < pageSize) stop = true;
        page++;
      }
      setProducts(result.slice(0, pageSize));
      setTotalItems(result.length); // hoặc response.data.meta.total nếu muốn tổng thực tế
      
      // Only extract brands and max price from initial load
      if (isInitialLoad || brands.length === 0) {
        // Extract unique brands from products
        const uniqueBrands = [];
        const brandMap = {};
        result.forEach(product => {
          if (product.brand && !brandMap[product.brand.brandId]) {
            brandMap[product.brand.brandId] = true;
            uniqueBrands.push(product.brand);
          }
        });
        setBrands(uniqueBrands);
        
        // Find max price for slider
        if (result.length > 0) {
          const maxProductPrice = Math.max(...result.map(p => p.price || 0));
          // Round up to the nearest 100,000 for a cleaner max price
          const roundedMaxPrice = Math.ceil(maxProductPrice / 100000) * 100000;
          
          if (!initialDataLoaded.current) {
            const newMaxPrice = roundedMaxPrice > 0 ? roundedMaxPrice : 5000000;
            setMaxPrice(newMaxPrice);
            setSelectedPriceRange([0, newMaxPrice]);
            
            // Set the input values if they aren't already set from URL params
            if (minPriceInputRef.current && !minPriceInputRef.current.input.value) {
              minPriceInputRef.current.input.value = "0";
            }
            if (maxPriceInputRef.current && !maxPriceInputRef.current.input.value) {
              maxPriceInputRef.current.input.value = newMaxPrice.toString();
            }
            
            initialDataLoaded.current = true;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setFiltersChanged(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if ((categoryId || subcategoryId) && allCategoryIds.length > 0) {
      fetchProducts(true);
    }
  }, [categoryId, subcategoryId, allCategoryIds]); // Re-fetch when category or allCategoryIds changes

  // Handle filter changes and pagination
  useEffect(() => {
    if (filtersChanged && (categoryId || subcategoryId)) {
      fetchProducts(false);
    }
  }, [filtersChanged]);

  // Handle pagination and sorting changes
  useEffect(() => {
    if ((categoryId || subcategoryId) && initialDataLoaded.current) {
      fetchProducts(false);
    }
  }, [currentPage, pageSize, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1); // API uses 0-based indexing
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(0); // Reset to first page on sort change
    setFiltersChanged(true);
  };

  const handleBrandChange = (checkedValues) => {
    setSelectedBrands(checkedValues);
    setCurrentPage(0); // Reset to first page on filter change
    setFiltersChanged(true);
  };

  // Only validate input is a number or empty
  const validateNumberInput = (e) => {
    // Allow backspace, delete, tab, escape, enter, and only numbers
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57))
    ) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  const handleApplyPriceFilter = () => {
    // Get values directly from the DOM references instead of state
    const minPrice = minPriceInputRef.current?.input.value || "0";
    const maxPrice = maxPriceInputRef.current?.input.value || "5000000";
    
    // Parse to integers
    const minPriceInt = minPrice === '' ? 0 : parseInt(minPrice);
    const maxPriceInt = maxPrice === '' ? 5000000 : parseInt(maxPrice);
    
    // Ensure min is less than max
    const validatedMin = Math.min(minPriceInt, maxPriceInt);
    const validatedMax = Math.max(minPriceInt, maxPriceInt);
    
    // Update the filter state (this will trigger a re-render)
    setSelectedPriceRange([validatedMin, validatedMax]);
    setCurrentPage(0); // Reset to first page on filter change
    setFiltersChanged(true);
    
    // Optionally update URL params to preserve filter state
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('minPrice', validatedMin.toString());
    searchParams.set('maxPrice', validatedMax.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedSubcategories([]);
    setSelectedPriceRange([0, maxPrice]);
    
    // Reset input fields via refs
    if (minPriceInputRef.current) {
      minPriceInputRef.current.input.value = "0";
    }
    if (maxPriceInputRef.current) {
      maxPriceInputRef.current.input.value = maxPrice.toString();
    }
    
    setCurrentPage(0);
    setFiltersChanged(true);
    
    // Clear URL params
    navigate(location.pathname, { replace: true });
  };

  // Filter components
  const FilterPanel = () => (
    <div className="filter-panel">
      {/* Reset Filters Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold m-0">BỘ LỌC</h2>
        <Button 
          type="link" 
          onClick={handleResetFilters}
          className="text-gray-500 hover:text-black"
          disabled={selectedBrands.length === 0 && selectedSubcategories.length === 0 && selectedPriceRange[0] === 0 && selectedPriceRange[1] === maxPrice}
        >
          Đặt lại
        </Button>
      </div>

      <Collapse defaultActiveKey={['1', '2', '3']} ghost>
        {/* Subcategory filter - only show if we're on a top-level category */}
        {!subcategoryId && flatSubcategoryList.length > 0 && (
          <Panel header={<span className="font-medium">DANH MỤC</span>} key="1">
            {renderFlatSubcategoryFilter()}
          </Panel>
        )}

        {/* Brand filter */}
        {brands.length > 0 && (
          <Panel header={<span className="font-medium">THƯƠNG HIỆU</span>} key="2">
            <Checkbox.Group 
              options={brands.map(brand => ({ 
                label: brand.name, 
                value: brand.brandId 
              }))}
              value={selectedBrands}
              onChange={handleBrandChange}
              className="flex flex-col gap-2"
            />
          </Panel>
        )}

        {/* Price range filter */}
        <Panel header={<span className="font-medium">KHOẢNG GIÁ</span>} key="3">
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
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-black">Trang chủ</Link>
        <span className="mx-2">/</span>
        
        {subcategoryId && categoryName ? (
          <>
            <Link to={`/category/${categoryId}`} className="text-gray-500 hover:text-black">
              {categoryName?.toUpperCase()}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium">{categoryName?.toUpperCase()}</span>
          </>
        ) : (
          <span className="font-medium">{categoryName?.toUpperCase() || 'Sản phẩm'}</span>
        )}
      </div>

      <div className="flex flex-col items-center mt-4.5 mb-8">
        <h1 className="text-3xl font-extralight">
          {subcategoryId ? categoryName?.toUpperCase() : categoryName?.toUpperCase() || 'SẢN PHẨM'}
        </h1>
        <span className="text-gray-700 mb-2">{totalItems} sản phẩm</span>
      </div>

      {/* Mobile Filters Button */}
      <div className="lg:hidden mb-4">
        <Button 
          type="default" 
          icon={<FiFilter />} 
          onClick={() => setMobileFiltersVisible(!mobileFiltersVisible)}
          className="w-full border-black text-black hover:bg-gray-100"
        >
          Lọc sản phẩm
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Section - Desktop */}
        <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
          <FilterPanel />
        </div>

        {/* Filters Section - Mobile */}
        {mobileFiltersVisible && (
          <div className="lg:hidden w-full mb-4">
            <FilterPanel />
            <Divider />
          </div>
        )}

        {/* Products Section */}
        <div className="w-full lg:w-3/4 xl:w-4/5">
          {/* Sorting */}
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center">
              <span className="mr-2">Sắp xếp theo:</span>
              <Select 
                defaultValue="newest" 
                style={{ width: 150 }} 
                onChange={handleSortChange}
                value={sortBy}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="price-asc">Giá: Thấp đến cao</Option>
                <Option value="price-desc">Giá: Cao đến thấp</Option>
                <Option value="name-asc">Tên: A-Z</Option>
                <Option value="name-desc">Tên: Z-A</Option>
              </Select>
            </div>
          </div>

          {/* Products */}
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

          {/* Pagination */}
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

export default CategoryProducts; 