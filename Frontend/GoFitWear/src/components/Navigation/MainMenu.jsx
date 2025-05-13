import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import customizeAxios from '../../services/customizeAxios';
import './MainMenu.css';

const MainMenu = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories for dropdown data
        const allCategoriesResponse = await customizeAxios.get('/api/categories/dropdown');
        if (allCategoriesResponse.statusCode === 200) {
          setAllCategories(allCategoriesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Build tree from flat list
  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(cat => (cat.parent ? cat.parent.categoryId : null) === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.categoryId)
      }));
  };

  const categoryTree = buildCategoryTree(allCategories);
  const topLevelCategories = categoryTree;

  // Render subcategories as columns (UI cũ)
  const renderSubcategoryColumns = (subcategories, parentId) => (
    <div className="subcategories-inner">
      {subcategories.map(sub => (
        <div key={sub.categoryId} className="subcategory-column">
          <Link to={`/category/${parentId}/${sub.categoryId}`} className="subcategory-title">
            {sub.name.toUpperCase()}
          </Link>
          {/* Nếu sub có children, render tiếp bên dưới */}
          {sub.children && sub.children.length > 0 && (
            <ul className="brands-list">
              {sub.children.map(child => (
                <li key={child.categoryId}>
                  <Link to={`/category/${parentId}/${child.categoryId}`}>{child.name}</Link>
                </li>
              ))}
              <li>
                <Link to={`/category/${parentId}`} className="view-all">Xem tất cả</Link>
              </li>
            </ul>
          )}
          {/* Nếu không có children, chỉ hiện Xem tất cả */}
          {(!sub.children || sub.children.length === 0) && (
            <ul className="brands-list">
              <li>
                <Link to={`/category/${parentId}`} className="view-all">Xem tất cả</Link>
              </li>
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <nav className="main-menu-container">
      <div className="main-categories">
        {topLevelCategories.map((category) => (
          <div
            key={category.categoryId}
            className={`category-item ${activeCategory === category.categoryId ? 'active' : ''}`}
            onMouseEnter={() => setActiveCategory(category.categoryId)}
          >
            <Link to={`/category/${category.categoryId}`}>
              {category.name.toUpperCase()}
            </Link>
          </div>
        ))}
      </div>
      {/* Subcategories dropdown */}
      {activeCategory && (
        <div 
          className="subcategories-container"
          onMouseLeave={() => setActiveCategory(null)}
        >
          {renderSubcategoryColumns(
            (topLevelCategories.find(cat => cat.categoryId === activeCategory)?.children || []),
            activeCategory
          )}
        </div>
      )}
    </nav>
  );
};

export default MainMenu; 