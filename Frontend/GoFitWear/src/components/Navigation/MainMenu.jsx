import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import './MainMenu.css';

const MainMenu = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch top-level categories
        const topLevelResponse = await axios.get('http://localhost:8080/api/categories/top-level');
        
        // Fetch all categories for dropdown data
        const allCategoriesResponse = await axios.get('http://localhost:8080/api/categories/dropdown');
        
        if (topLevelResponse.data.statusCode === 200 && allCategoriesResponse.data.statusCode === 200) {
          setCategories(topLevelResponse.data.data);
          setAllCategories(allCategoriesResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  // Get subcategories for a parent category
  const getSubcategories = (parentId) => {
    return allCategories.filter(category => 
      category.parent && category.parent.categoryId === parentId
    );
  };

  // If loading, you can return a loading indicator or null
  if (loading) {
    return <div className="loading-menu">Loading menu...</div>;
  }

  return (
    <nav className="main-menu-container">
      {/* Top level categories */}
      <div className="main-categories">
        {categories.map((category) => (
          <div
            key={category.categoryId}
            className={`category-item ${activeCategory === category.categoryId ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(category.categoryId)}
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
          onMouseLeave={handleMouseLeave}
        >
          <div className="subcategories-inner">
            {getSubcategories(activeCategory).map((subcategory) => (
              <div key={subcategory.categoryId} className="subcategory-column">
                <Link to={`/category/${activeCategory}/${subcategory.categoryId}`} className="subcategory-title">
                  {subcategory.name.toUpperCase()}
                </Link>
                <ul className="brands-list">
                  {/* For now, we don't have brands in the API response, so we'll leave this empty */}
                  <li>
                    <Link to={`/category/${activeCategory}`} className="view-all">
                      Xem tất cả
                    </Link>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainMenu; 