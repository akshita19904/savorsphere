import React, { useState, useEffect, useCallback } from 'react';
import './styles/MenuModal.css';

const RestaurantMenuModal = ({ restaurant, isOpen, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });


  const fetchReviews = useCallback(async (restaurantId) => {
    if (!restaurantId) return;

    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/reviews`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviewsError(error.message);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && restaurant) {
      setLoading(true);
      setTimeout(() => {
        const mockMenuData = generateMockMenu(restaurant.cuisine);
        setMenuItems(mockMenuData);
        setLoading(false);
      }, 500);

      if (restaurant.id) {
        fetchReviews(restaurant.id);
      }
    }
  }, [isOpen, restaurant, fetchReviews]);


  const submitReview = async (reviewData) => {
    try {
      const payload = {
        restaurant_id: restaurant.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        name: reviewData.name
      };

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required. Please log in.');

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        throw new Error('Invalid or expired token. Please log in again.');
      } else if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to submit review: ${response.status} ${errorData.message || ''}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  // Generate mock menu based on cuisine type
  const generateMockMenu = (cuisine) => {
    // Menu generation code remains the same
    const menuCategories = {
      "Seafood": [
        { category: "Appetizers", items: [
          { name: "Calamari", description: "Crispy fried calamari with lemon aioli", price: 14.95 },
          { name: "Shrimp Cocktail", description: "Jumbo shrimp with cocktail sauce", price: 16.95 },
          { name: "Crab Cakes", description: "Pan-seared crab cakes with remoulade", price: 18.95 }
        ]},
        { category: "Main Courses", items: [
          { name: "Grilled Salmon", description: "Atlantic salmon with vegetables", price: 26.95 },
          { name: "Lobster Tail", description: "Butter-poached lobster tail", price: 39.95 },
          { name: "Fish & Chips", description: "Beer-battered cod with fries", price: 22.95 }
        ]},
        { category: "Sides", items: [
          { name: "Roasted Potatoes", description: "Herb-roasted baby potatoes", price: 6.95 },
          { name: "Grilled Asparagus", description: "With lemon zest", price: 7.95 }
        ]}
      ],
      // Other cuisine types remain the same...
      "French Fine Dining": [
        { category: "Entrées", items: [
          { name: "Foie Gras", description: "Seared foie gras with brioche", price: 24.95 },
          { name: "Escargot", description: "With garlic herb butter", price: 18.95 }
        ]},
        { category: "Plats Principaux", items: [
          { name: "Coq au Vin", description: "Braised chicken with red wine sauce", price: 32.95 },
          { name: "Beef Bourguignon", description: "Slow-cooked beef stew", price: 36.95 }
        ]},
        { category: "Desserts", items: [
          { name: "Crème Brûlée", description: "Classic vanilla custard", price: 12.95 },
          { name: "Tarte Tatin", description: "Caramelized apple tart", price: 11.95 }
        ]}
      ],
      "Japanese": [
        { category: "Sushi Rolls", items: [
          { name: "California Roll", description: "Crab, avocado, cucumber", price: 9.95 },
          { name: "Dragon Roll", description: "Eel, avocado, tobiko", price: 14.95 }
        ]},
        { category: "Nigiri (2 pcs)", items: [
          { name: "Salmon", description: "Fresh Norwegian salmon", price: 6.95 },
          { name: "Tuna", description: "Bluefin tuna", price: 7.95 }
        ]},
        { category: "Hot Dishes", items: [
          { name: "Chicken Teriyaki", description: "Grilled chicken with teriyaki sauce", price: 18.95 },
          { name: "Tempura", description: "Assorted tempura vegetables and shrimp", price: 16.95 }
        ]}
      ],
      "Indian": [
        { category: "Appetizers", items: [
          { name: "Samosas", description: "Vegetable filled pastries", price: 8.95 },
          { name: "Pakoras", description: "Vegetable fritters", price: 7.95 }
        ]},
        { category: "Curries", items: [
          { name: "Butter Chicken", description: "Chicken in tomato cream sauce", price: 19.95 },
          { name: "Lamb Vindaloo", description: "Spicy lamb curry", price: 22.95 }
        ]},
        { category: "Tandoor", items: [
          { name: "Chicken Tikka", description: "Marinated and grilled chicken", price: 18.95 },
          { name: "Naan", description: "Freshly baked bread", price: 3.95 }
        ]}
      ],
      "American": [
        { category: "Burgers", items: [
          { name: "Classic Burger", description: "Beef patty with lettuce, tomato, onion", price: 14.95 },
          { name: "Bacon Cheeseburger", description: "With bacon and cheddar", price: 16.95 }
        ]},
        { category: "Sandwiches", items: [
          { name: "Club Sandwich", description: "Turkey, bacon, lettuce, tomato", price: 13.95 },
          { name: "Pulled Pork", description: "BBQ pulled pork on brioche", price: 15.95 }
        ]},
        { category: "Sides", items: [
          { name: "French Fries", description: "Hand-cut fries", price: 5.95 },
          { name: "Onion Rings", description: "Beer-battered onion rings", price: 6.95 }
        ]}
      ],
      "Mexican": [
        { category: "Starters", items: [
          { name: "Guacamole", description: "Fresh avocado dip with chips", price: 10.95 },
          { name: "Queso Fundido", description: "Melted cheese with chorizo", price: 12.95 }
        ]},
        { category: "Tacos (3)", items: [
          { name: "Carne Asada", description: "Grilled steak tacos", price: 16.95 },
          { name: "Al Pastor", description: "Marinated pork tacos", price: 15.95 }
        ]},
        { category: "Specialties", items: [
          { name: "Enchiladas", description: "Chicken enchiladas with mole sauce", price: 18.95 },
          { name: "Fajitas", description: "Sizzling steak or chicken fajitas", price: 21.95 }
        ]}
      ],
      "Italian": [
        { category: "Antipasti", items: [
          { name: "Bruschetta", description: "Toasted bread with tomatoes and basil", price: 9.95 },
          { name: "Caprese", description: "Fresh mozzarella, tomatoes, basil", price: 12.95 }
        ]},
        { category: "Pasta", items: [
          { name: "Spaghetti Carbonara", description: "With pancetta and egg", price: 18.95 },
          { name: "Fettuccine Alfredo", description: "With creamy parmesan sauce", price: 17.95 }
        ]},
        { category: "Pizzas", items: [
          { name: "Margherita", description: "Tomato, mozzarella, basil", price: 16.95 },
          { name: "Prosciutto", description: "With prosciutto and arugula", price: 19.95 }
        ]}
      ], 
      "North Indian": [
        { category: "Starters", items: [
          { name: "Paneer Tikka", description: "Cottage cheese marinated in spices and grilled", price: 220 },
          { name: "Chicken Tikka", description: "Succulent chicken pieces marinated and grilled", price: 280 },
          { name: "Aloo Tikki", description: "Spiced potato patties served with chutneys", price: 150 }
        ]},
        { category: "Main Course", items: [
          { name: "Butter Chicken", description: "Tandoori chicken in rich tomato gravy", price: 320 },
          { name: "Dal Makhani", description: "Creamy black lentils slow-cooked overnight", price: 250 },
          { name: "Rogan Josh", description: "Aromatic lamb curry from Kashmir", price: 380 },
          { name: "Palak Paneer", description: "Cottage cheese in spinach gravy", price: 260 }
        ]},
        { category: "Breads", items: [
          { name: "Butter Naan", description: "Soft leavened bread brushed with butter", price: 60 },
          { name: "Lachha Paratha", description: "Flaky layered whole wheat bread", price: 80 },
          { name: "Tandoori Roti", description: "Whole wheat bread cooked in clay oven", price: 40 }
        ]},
        { category: "Desserts", items: [
          { name: "Gulab Jamun", description: "Deep-fried milk balls in sugar syrup", price: 120 },
          { name: "Gajar Ka Halwa", description: "Carrot pudding with nuts", price: 140 }
        ]}
      ],
      "South Indian": [
        { category: "Breakfast", items: [
          { name: "Masala Dosa", description: "Crispy rice crepe with potato filling", price: 180 },
          { name: "Idli Sambar", description: "Steamed rice cakes with lentil stew", price: 120 },
          { name: "Pongal", description: "Rice and lentil porridge with ghee", price: 150 }
        ]},
        { category: "Main Course", items: [
          { name: "Chettinad Chicken", description: "Spicy chicken curry from Tamil Nadu", price: 320 },
          { name: "Fish Curry", description: "Coconut-based curry with fresh fish", price: 350 },
          { name: "Vegetable Stew", description: "Mild coconut milk based vegetable curry", price: 220 },
          { name: "Bisi Bele Bath", description: "Spicy rice dish from Karnataka", price: 200 }
        ]},
        { category: "Rice Items", items: [
          { name: "Lemon Rice", description: "Tangy rice with lemon and peanuts", price: 160 },
          { name: "Curd Rice", description: "Cooling rice with yogurt and tempering", price: 140 }
        ]},
        { category: "Desserts", items: [
          { name: "Payasam", description: "South Indian version of kheer", price: 120 },
          { name: "Mysore Pak", description: "Gram flour sweet from Karnataka", price: 100 }
        ]}
      ]
    };

    const normalizedCuisine = cuisine?.toLowerCase() || '';
    
    if (normalizedCuisine.includes('north indian')) {
      return menuCategories["North Indian"];
    } else if (normalizedCuisine.includes('south indian')) {
      return menuCategories["South Indian"];
    } else if (menuCategories[cuisine]) {
      return menuCategories[cuisine];
    }

    return menuCategories[cuisine] || [
      { category: "Popular Items", items: [
        { name: "House Special", description: "Chef's recommendation", price: 19.95 },
        { name: "Seasonal Special", description: "Featured seasonal dish", price: 22.95 }
      ]}
    ];
  };


  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: name === 'rating' ? parseFloat(value) : value
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to submit a review.');
        return;
      }

      await submitReview(newReview);
      await fetchReviews(restaurant.id);
      setNewReview({ rating: 5, comment: '', name: '' });
      alert('Thank you for your review!');
    } catch (error) {
      if (
        error.message.includes('403') ||
        error.message.includes('Invalid or expired token') ||
        error.message.toLowerCase().includes('unauthorized')
      ) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please log in again to submit a review.');
      } else {
        alert(`Failed to submit review: ${error.message}`);
      }
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full">★</span>
        ))}
        {halfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">☆</span>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="menu-modal-overlay">
      <div className="menu-modal-content">
        <div className="menu-modal-header">
          <h2>{restaurant?.name}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
          <button
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="menu-modal-body">
          {activeTab === 'menu' && (
            <>
              {loading ? (
                <div className="menu-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading menu...</p>
                </div>
              ) : (
                <div className="restaurant-menu">
                  {menuItems.map((category, idx) => (
                    <div key={idx} className="menu-category">
                      <h3>{category.category}</h3>
                      <div className="menu-items">
                        {category.items.map((item, i) => (
                          <div key={i} className="menu-item">
                            <div className="menu-item-header">
                              <h4>{item.name}</h4>
                              <span className="menu-item-price">₹{item.price.toFixed(2)}</span>
                            </div>
                            <p className="menu-item-description">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <div className="restaurant-reviews">
              <div className="reviews-list">
                <h3>Customer Reviews</h3>

                {reviewsLoading ? (
                  <div className="menu-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : reviewsError ? (
                  <div className="reviews-error">
                    <p>{reviewsError}</p>
                    <button className="retry-button" onClick={() => fetchReviews(restaurant.id)}>
                      Try Again
                    </button>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">{review.username || review.name}</span>
                        <span className="review-date">
                          {new Date(review.created_at || review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                        <span className="rating-value">{review.rating.toFixed(1)}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="add-review-section">
                <h3>Add Your Review</h3>
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newReview.name}
                      onChange={handleReviewChange}
                      required
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rating">Rating</label>
                    <select
                      id="rating"
                      name="rating"
                      value={newReview.rating}
                      onChange={handleReviewChange}
                      required
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4.5">4.5 - Very Good</option>
                      <option value="4">4 - Good</option>
                      <option value="3.5">3.5 - Above Average</option>
                      <option value="3">3 - Average</option>
                      <option value="2.5">2.5 - Below Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1.5">1.5 - Very Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comment">Your Review</label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={newReview.comment}
                      onChange={handleReviewChange}
                      required
                      placeholder="Share your experience at this restaurant"
                      rows="4"
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-review-button">
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="menu-modal-footer">
          <button className="reservation-button" onClick={() => window.location.href = `/reservation/${restaurant?.id}`}>
            Make Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuModal;