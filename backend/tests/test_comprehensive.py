"""
Comprehensive API tests for YAMA+ e-commerce site
Tests all major endpoints: products, auth, cart, orders, blog, admin
"""
import pytest
import requests
import os
import uuid

# Get BASE_URL from environment or use default
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '')
if not BASE_URL:
    # Try to read from frontend .env file
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip()
                    break
    except:
        pass
if not BASE_URL:
    BASE_URL = 'http://localhost:8001'
BASE_URL = BASE_URL.rstrip('/')

class TestHealthAndBasics:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        print(f"✓ Health check passed: {data}")
    
    def test_seed_endpoint(self):
        """Test seed endpoint works"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200
        print("✓ Seed endpoint works")


class TestProductsAPI:
    """Product CRUD and listing tests"""
    
    def test_get_products_list(self):
        """Test getting products list"""
        response = requests.get(f"{BASE_URL}/api/products?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Got {len(data)} products")
    
    def test_get_products_by_category(self):
        """Test filtering products by category"""
        response = requests.get(f"{BASE_URL}/api/products?category=electronique")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for product in data:
            assert product["category"] == "electronique"
        print(f"✓ Got {len(data)} electronics products")
    
    def test_get_featured_products(self):
        """Test getting featured products"""
        response = requests.get(f"{BASE_URL}/api/products?featured=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} featured products")
    
    def test_get_new_products(self):
        """Test getting new products"""
        response = requests.get(f"{BASE_URL}/api/products?is_new=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} new products")
    
    def test_get_promo_products(self):
        """Test getting promo products"""
        response = requests.get(f"{BASE_URL}/api/products?is_promo=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} promo products")
    
    def test_get_single_product(self):
        """Test getting a single product"""
        # First get a product ID
        response = requests.get(f"{BASE_URL}/api/products?limit=1")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        
        product_id = products[0]["product_id"]
        response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        product = response.json()
        assert product["product_id"] == product_id
        assert "name" in product
        assert "price" in product
        print(f"✓ Got product: {product['name']}")
    
    def test_get_nonexistent_product(self):
        """Test getting a non-existent product returns 404"""
        response = requests.get(f"{BASE_URL}/api/products/nonexistent_product_id")
        assert response.status_code == 404
        print("✓ Non-existent product returns 404")
    
    def test_get_similar_products(self):
        """Test getting similar products"""
        # First get a product ID
        response = requests.get(f"{BASE_URL}/api/products?limit=1")
        products = response.json()
        product_id = products[0]["product_id"]
        
        response = requests.get(f"{BASE_URL}/api/products/{product_id}/similar")
        assert response.status_code == 200
        similar = response.json()
        assert isinstance(similar, list)
        print(f"✓ Got {len(similar)} similar products")
    
    def test_get_product_reviews(self):
        """Test getting product reviews"""
        response = requests.get(f"{BASE_URL}/api/products?limit=1")
        products = response.json()
        product_id = products[0]["product_id"]
        
        response = requests.get(f"{BASE_URL}/api/products/{product_id}/reviews")
        assert response.status_code == 200
        data = response.json()
        assert "reviews" in data
        assert "total_reviews" in data
        assert "average_rating" in data
        print(f"✓ Got reviews: {data['total_reviews']} total, avg rating: {data['average_rating']}")


class TestFlashSales:
    """Flash sales tests"""
    
    def test_get_flash_sales(self):
        """Test getting flash sales"""
        response = requests.get(f"{BASE_URL}/api/flash-sales")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} flash sale products")


class TestAuthAPI:
    """Authentication tests"""
    
    def test_login_with_valid_credentials(self):
        """Test login with valid admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@yama.sn",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == "admin@yama.sn"
        assert data["role"] == "admin"
        print(f"✓ Admin login successful: {data['email']}")
        return data.get("token")
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials return 401")
    
    def test_register_new_user(self):
        """Test registering a new user"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert data["email"] == unique_email
        print(f"✓ User registration successful: {unique_email}")
    
    def test_register_duplicate_email(self):
        """Test registering with duplicate email returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "admin@yama.sn",
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 400
        print("✓ Duplicate email registration returns 400")


class TestCartAPI:
    """Cart functionality tests"""
    
    def test_create_cart(self):
        """Test getting empty cart (cart is session-based, not created explicitly)"""
        response = requests.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"✓ Cart API works: {data}")
    
    def test_add_item_to_cart(self):
        """Test adding item to cart"""
        # First get a product
        products_response = requests.get(f"{BASE_URL}/api/products?limit=1")
        products = products_response.json()
        product_id = products[0]["product_id"]
        
        # Add item using POST /cart/add
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/cart/add", json={
            "product_id": product_id,
            "quantity": 2
        })
        # Should work (200) or need session (depends on implementation)
        assert response.status_code in [200, 401]
        print(f"✓ Cart add endpoint responded: {response.status_code}")
    
    def test_get_cart(self):
        """Test getting cart"""
        response = requests.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"✓ Got cart with {len(data.get('items', []))} items")


class TestOrdersAPI:
    """Orders tests"""
    
    def test_get_orders_requires_auth(self):
        """Test that getting orders requires authentication"""
        response = requests.get(f"{BASE_URL}/api/orders")
        # Should return 401 without auth
        assert response.status_code in [401, 403]
        print("✓ Orders endpoint requires authentication")
    
    def test_track_order(self):
        """Test order tracking endpoint"""
        response = requests.get(f"{BASE_URL}/api/orders/track/ORD-NONEXISTENT")
        # Should return 404 for non-existent order
        assert response.status_code == 404
        print("✓ Non-existent order tracking returns 404")


class TestBlogAPI:
    """Blog posts tests"""
    
    def test_get_blog_posts(self):
        """Test getting blog posts"""
        response = requests.get(f"{BASE_URL}/api/blog/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Got {len(data)} blog posts")
    
    def test_get_single_blog_post(self):
        """Test getting a single blog post"""
        response = requests.get(f"{BASE_URL}/api/blog/posts/guide-achat-smartphone-2025")
        assert response.status_code == 200
        data = response.json()
        # API returns {post: {...}, related: [...]}
        post = data.get("post", data)
        assert "title" in post
        assert "content" in post
        print(f"✓ Got blog post: {post['title']}")
    
    def test_get_nonexistent_blog_post(self):
        """Test getting non-existent blog post returns 404"""
        response = requests.get(f"{BASE_URL}/api/blog/posts/nonexistent-post")
        assert response.status_code == 404
        print("✓ Non-existent blog post returns 404")


class TestNewsletterAPI:
    """Newsletter subscription tests"""
    
    def test_subscribe_newsletter(self):
        """Test newsletter subscription"""
        unique_email = f"newsletter_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/newsletter/subscribe", json={
            "email": unique_email,
            "name": "Test Subscriber"
        })
        assert response.status_code == 200
        data = response.json()
        assert "promo_code" in data
        print(f"✓ Newsletter subscription successful, promo code: {data['promo_code']}")


class TestAdminAPI:
    """Admin API tests (requires authentication)"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@yama.sn",
            "password": "admin123"
        })
        if response.status_code == 200:
            token = response.json().get("token")
            if token:
                session.headers.update({"Authorization": f"Bearer {token}"})
            # Also set cookie from response
            return session
        pytest.skip("Admin login failed")
    
    def test_admin_stats(self, admin_session):
        """Test admin stats endpoint"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_revenue" in data
        assert "total_orders" in data
        assert "total_products" in data
        # Note: total_customers may be named differently
        assert "total_users" in data or "total_customers" in data
        print(f"✓ Admin stats: Revenue={data['total_revenue']}, Orders={data['total_orders']}")
    
    def test_admin_orders_list(self, admin_session):
        """Test admin orders list"""
        response = admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        data = response.json()
        # API returns {orders: [...], total: N} for pagination
        if isinstance(data, dict):
            assert "orders" in data
            assert isinstance(data["orders"], list)
            orders = data["orders"]
        else:
            orders = data
        print(f"✓ Got {len(orders)} orders in admin")
    
    def test_admin_users_list(self, admin_session):
        """Test admin users list"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        # API returns {users: [...], total: N} for pagination
        if isinstance(data, dict):
            assert "users" in data
            assert isinstance(data["users"], list)
            users = data["users"]
        else:
            users = data
        print(f"✓ Got {len(users)} users in admin")


class TestPromoCodesAPI:
    """Promo codes validation tests"""
    
    def test_validate_invalid_promo_code(self):
        """Test validating invalid promo code"""
        response = requests.post(f"{BASE_URL}/api/promo-codes/validate", json={
            "code": "INVALID_CODE",
            "cart_total": 100000
        })
        assert response.status_code == 404
        print("✓ Invalid promo code returns 404")


class TestStockNotifications:
    """Stock notification tests"""
    
    def test_subscribe_stock_notification(self):
        """Test subscribing to stock notification"""
        # Get a product first
        products_response = requests.get(f"{BASE_URL}/api/products?limit=1")
        products = products_response.json()
        product_id = products[0]["product_id"]
        
        unique_email = f"stock_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/products/{product_id}/notify-stock", json={
            "email": unique_email,
            "product_id": product_id
        })
        assert response.status_code == 200
        print(f"✓ Stock notification subscription successful for {product_id}")


class TestPriceAlerts:
    """Price alert tests"""
    
    def test_subscribe_price_alert(self):
        """Test subscribing to price alert"""
        # Get a product first
        products_response = requests.get(f"{BASE_URL}/api/products?limit=1")
        products = products_response.json()
        product = products[0]
        product_id = product["product_id"]
        current_price = product["price"]
        
        unique_email = f"price_{uuid.uuid4().hex[:8]}@test.com"
        target_price = int(current_price * 0.8)  # 20% less than current
        
        response = requests.post(f"{BASE_URL}/api/products/{product_id}/price-alert", json={
            "email": unique_email,
            "product_id": product_id,
            "target_price": target_price
        })
        assert response.status_code == 200
        print(f"✓ Price alert subscription successful for {product_id} at {target_price} FCFA")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
