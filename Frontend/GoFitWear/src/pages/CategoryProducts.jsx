import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Pagination, Spin, Empty, Card, Row, Col, Select, Checkbox, Slider, Collapse, Button, Space, Divider } from 'antd';
import { FiHeart, FiShoppingCart, FiFilter } from 'react-icons/fi';

const { Option } = Select;
const { Panel } = Collapse;

const CategoryProducts = () => {
  const { categoryId, subcategoryId } = useParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [parentCategory, setParentCategory] = useState(null);
  
  // Filter states
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 5000000]);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  // Track if filters have been changed to trigger API call
  const [filtersChanged, setFiltersChanged] = useState(false);
  const initialDataLoaded = useRef(false);
  
  // Store all relevant category IDs (main category + subcategories)
  const [allCategoryIds, setAllCategoryIds] = useState([]);

  // Fetch category names and subcategories
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        if (subcategoryId) {
          // If we have a subcategory, fetch its details
          const subcategoryResponse = await axios.get(`http://localhost:8080/api/categories/${subcategoryId}`);
          if (subcategoryResponse.data && subcategoryResponse.data.data) {
            const subcategory = subcategoryResponse.data.data;
            setSubcategoryName(subcategory.name || '');
            setAllCategoryIds([subcategoryId]); // Only include this subcategory
            
            // Also fetch parent category details if available
            if (subcategory.parent) {
              setParentCategory(subcategory.parent);
              setCategoryName(subcategory.parent.name || '');
            }
          }
        } else if (categoryId) {
          // If we only have the main category, fetch its details and subcategories
          const categoryResponse = await axios.get(`http://localhost:8080/api/categories/${categoryId}`);
          if (categoryResponse.data && categoryResponse.data.data) {
            const category = categoryResponse.data.data;
            setCategoryName(category.name || '');
            
            // Extract subcategories from the response
            const subs = category.subcategories || [];
            setSubcategories(subs);
            
            // Collect all category IDs (main + subcategories)
            const categoryIds = [parseInt(categoryId)];
            subs.forEach(sub => categoryIds.push(sub.categoryId));
            setAllCategoryIds(categoryIds);
          }
        }
      } catch (error) {
        console.error('Error fetching category details:', error);
      }
    };

    fetchCategoryData();
  }, [categoryId, subcategoryId]);

  // Function to build filter string
  const buildFilterString = () => {
    let filterBase = '';
    
    // If we're viewing a specific subcategory, only filter by that
    if (subcategoryId) {
      filterBase = `category.categoryId:${subcategoryId}`;
    } 
    // Otherwise include all relevant category IDs
    else if (allCategoryIds.length > 0) {
      filterBase = allCategoryIds.map(id => `category.categoryId:${id}`).join(' or ');
    } 
    // Fallback to just the current category ID
    else {
      filterBase = `category.categoryId:${categoryId}`;
    }
    
    let filterString = filterBase;
    
    // Add brand filter
    if (selectedBrands.length > 0) {
      filterString = `(${filterBase}) and (brand.brandId:${selectedBrands.join(' or brand.brandId:')})`;
    }
    
    // Add price filter
    if (selectedPriceRange[0] > 0 || selectedPriceRange[1] < maxPrice) {
      filterString += ` and price>=${selectedPriceRange[0]} and price<=${selectedPriceRange[1]}`;
    }
    
    // Add specific subcategory filter if user selected some (but not on subcategory page)
    if (selectedSubcategories.length > 0 && !subcategoryId) {
      // Reset the filter string and use only selected subcategories
      filterString = `(category.categoryId:${selectedSubcategories.join(' or category.categoryId:')})`;
      
      // Re-add brand filter if needed
      if (selectedBrands.length > 0) {
        filterString += ` and (brand.brandId:${selectedBrands.join(' or brand.brandId:')})`;
      }
      
      // Re-add price filter
      if (selectedPriceRange[0] > 0 || selectedPriceRange[1] < maxPrice) {
        filterString += ` and price>=${selectedPriceRange[0]} and price<=${selectedPriceRange[1]}`;
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
        case 'price-asc':
          sort = 'price,asc';
          break;
        case 'price-desc':
          sort = 'price,desc';
          break;
        case 'name-asc':
          sort = 'name,asc';
          break;
        case 'name-desc':
          sort = 'name,desc';
          break;
        default:
          sort = 'createdAt,desc'; // newest first
      }

      // Build filter string
      const filterString = buildFilterString();
      console.log("Filter string:", filterString);

      // Fetch products with filters
      const response = await axios.get(`http://localhost:8080/api/products`, {
        params: {
          filter: filterString,
          page: currentPage,
          size: pageSize,
          sort
        }
      });

      if (response.data && response.data.statusCode === 200) {
        const productsData = response.data.data.data || [];
        setProducts(productsData);
        setTotalItems(response.data.data.meta.total || 0);
        setTotalPages(response.data.data.meta.pages || 1);
        
        // Only extract brands and max price from initial load
        if (isInitialLoad || brands.length === 0) {
          // Extract unique brands from products
          const uniqueBrands = [];
          const brandMap = {};
          
          productsData.forEach(product => {
            if (product.brand && !brandMap[product.brand.brandId]) {
              brandMap[product.brand.brandId] = true;
              uniqueBrands.push(product.brand);
            }
          });
          
          setBrands(uniqueBrands);
          
          // Find max price for slider
          if (productsData.length > 0) {
            const maxProductPrice = Math.max(...productsData.map(p => p.price || 0));
            // Round up to the nearest 100,000 for a cleaner max price
            const roundedMaxPrice = Math.ceil(maxProductPrice / 100000) * 100000;
            
            if (!initialDataLoaded.current) {
              setMaxPrice(roundedMaxPrice > 0 ? roundedMaxPrice : 5000000);
              setSelectedPriceRange([0, roundedMaxPrice > 0 ? roundedMaxPrice : 5000000]);
              initialDataLoaded.current = true;
            }
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

  const handleSubcategoryChange = (checkedValues) => {
    setSelectedSubcategories(checkedValues);
    setCurrentPage(0); // Reset to first page on filter change
    setFiltersChanged(true);
  };

  const handlePriceChange = (value) => {
    setSelectedPriceRange(value);
  };

  const handlePriceAfterChange = () => {
    setCurrentPage(0); // Reset to first page on filter change
    setFiltersChanged(true);
  };

  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedSubcategories([]);
    setSelectedPriceRange([0, maxPrice]);
    setCurrentPage(0);
    setFiltersChanged(true);
  };

  // Format price with comma as thousand separator
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Price formatter for the Slider component
  const priceFormatter = (value) => {
    return `${formatPrice(value)}₫`;
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
        {!subcategoryId && subcategories.length > 0 && (
          <Panel header={<span className="font-medium">DANH MỤC</span>} key="1">
            <Checkbox.Group 
              options={subcategories.map(sub => ({ 
                label: sub.name, 
                value: sub.categoryId 
              }))}
              value={selectedSubcategories}
              onChange={handleSubcategoryChange}
              className="flex flex-col gap-2"
            />
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
        <Panel header={<span className="font-medium">GIÁ</span>} key="3">
          <Slider
            range
            min={0}
            max={maxPrice}
            value={selectedPriceRange}
            onChange={handlePriceChange}
            onAfterChange={handlePriceAfterChange}
            tipFormatter={priceFormatter}
            className="mt-6 mb-2"
          />
          <div className="flex justify-between">
            <span>{priceFormatter(selectedPriceRange[0])}</span>
            <span>{priceFormatter(selectedPriceRange[1])}</span>
          </div>
        </Panel>
      </Collapse>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-black">Trang chủ</Link>
        <span className="mx-2">/</span>
        
        {subcategoryId && parentCategory ? (
          <>
            <Link to={`/category/${parentCategory.categoryId}`} className="text-gray-500 hover:text-black">
              {categoryName?.toUpperCase()}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium">{subcategoryName?.toUpperCase()}</span>
          </>
        ) : (
          <span className="font-medium">{categoryName?.toUpperCase() || 'Sản phẩm'}</span>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {subcategoryId ? subcategoryName?.toUpperCase() : categoryName?.toUpperCase() || 'Sản phẩm'}
        </h1>
        <p className="text-gray-500">{totalItems} sản phẩm</p>
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
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Đang tải sản phẩm..." />
            </div>
          ) : products.length === 0 ? (
            <Empty description="Không tìm thấy sản phẩm nào" />
          ) : (
            <>
              <Row gutter={[16, 24]}>
                {products.map(product => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={product.productId}>
                    <Card 
                      hoverable 
                      bodyStyle={{ padding: '12px' }}
                      cover={
                        <Link to={`/product/${product.productId}`}>
                          <div className="relative pb-[100%] overflow-hidden">
                            <img 
                              alt={product.name} 
                              src={product.imageUrl || 'https://placehold.co/300x300?text=No+Image'} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
                            />
                            {/* Display brand tag */}
                            {product.brand && (
                              <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-medium uppercase">
                                {product.brand.name}
                              </div>
                            )}
                          </div>
                        </Link>
                      }
                      actions={[
                        <FiHeart key="heart" className="text-lg" />,
                        <FiShoppingCart key="cart" className="text-lg" />
                      ]}
                    >
                      <Link to={`/product/${product.productId}`}>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                        <div className="flex items-center">
                          <span className="font-bold text-black text-base mr-2">{formatPrice(product.price)}₫</span>
                        </div>
                      </Link>
                    </Card>
                  </Col>
                ))}
              </Row>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts; 