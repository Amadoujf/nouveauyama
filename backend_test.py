#!/usr/bin/env python3
"""
Lumina Senegal E-Commerce Backend API Test Suite
Tests all backend endpoints for the premium e-commerce site
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class LuminaAPITester:
    def __init__(self, base_url="https://yama-market.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_product_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials
        self.admin_email = "admin@lumina.sn"
        self.admin_password = "admin123"

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"name": name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, expected_status: int = 200) -> tuple:
        """Make HTTP request and return success status and response"""
        url = f"{self.base_url}/api{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=default_headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=default_headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=default_headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=default_headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}
            
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health & Basic Endpoints...")
        
        # Root endpoint
        success, data = self.make_request('GET', '/')
        self.log_test("Root endpoint", success, 
                     f"Response: {data.get('message', 'No message')}" if success else f"Error: {data}")
        
        # Health check
        success, data = self.make_request('GET', '/health')
        self.log_test("Health check", success,
                     f"Status: {data.get('status', 'Unknown')}" if success else f"Error: {data}")

    def test_database_seeding(self):
        """Test database seeding"""
        print("\n🌱 Testing Database Seeding...")
        
        success, data = self.make_request('POST', '/seed')
        self.log_test("Database seeding", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")

    def test_categories(self):
        """Test categories endpoint"""
        print("\n📂 Testing Categories...")
        
        success, data = self.make_request('GET', '/categories')
        self.log_test("Get categories", success,
                     f"Found {len(data)} categories" if success and isinstance(data, list) else f"Error: {data}")

    def test_products(self):
        """Test product endpoints"""
        print("\n📦 Testing Products...")
        
        # Get all products
        success, data = self.make_request('GET', '/products')
        if success and isinstance(data, list) and len(data) > 0:
            self.test_product_id = data[0]['product_id']
            self.log_test("Get all products", True, f"Found {len(data)} products")
        else:
            self.log_test("Get all products", False, f"Error: {data}")
            return
        
        # Get products by category
        success, data = self.make_request('GET', '/products?category=electronique')
        self.log_test("Get products by category", success,
                     f"Found {len(data)} electronics" if success and isinstance(data, list) else f"Error: {data}")
        
        # Get featured products
        success, data = self.make_request('GET', '/products?featured=true')
        self.log_test("Get featured products", success,
                     f"Found {len(data)} featured products" if success and isinstance(data, list) else f"Error: {data}")
        
        # Get new products
        success, data = self.make_request('GET', '/products?is_new=true')
        self.log_test("Get new products", success,
                     f"Found {len(data)} new products" if success and isinstance(data, list) else f"Error: {data}")
        
        # Get promo products
        success, data = self.make_request('GET', '/products?is_promo=true')
        self.log_test("Get promo products", success,
                     f"Found {len(data)} promo products" if success and isinstance(data, list) else f"Error: {data}")
        
        # Search products
        success, data = self.make_request('GET', '/products?search=iPhone')
        self.log_test("Search products", success,
                     f"Found {len(data)} iPhone products" if success and isinstance(data, list) else f"Error: {data}")
        
        # Get single product
        if self.test_product_id:
            success, data = self.make_request('GET', f'/products/{self.test_product_id}')
            self.log_test("Get single product", success,
                         f"Product: {data.get('name', 'Unknown')}" if success else f"Error: {data}")

    def test_auth_registration(self):
        """Test user registration"""
        print("\n👤 Testing User Registration...")
        
        test_user = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test User",
            "phone": "+221771234567",
            "password": "testpass123"
        }
        
        success, data = self.make_request('POST', '/auth/register', test_user)
        if success:
            self.user_token = data.get('token')
            self.test_user_id = data.get('user_id')
            self.log_test("User registration", True, f"User ID: {self.test_user_id}")
        else:
            self.log_test("User registration", False, f"Error: {data}")

    def test_auth_login(self):
        """Test admin login"""
        print("\n🔐 Testing Authentication...")
        
        # Admin login
        login_data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        success, data = self.make_request('POST', '/auth/login', login_data)
        if success:
            self.admin_token = data.get('token')
            self.log_test("Admin login", True, f"Role: {data.get('role', 'Unknown')}")
        else:
            self.log_test("Admin login", False, f"Error: {data}")

    def test_auth_me(self):
        """Test get current user"""
        if not self.admin_token:
            self.log_test("Get current user", False, "No admin token available")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, data = self.make_request('GET', '/auth/me', headers=headers)
        self.log_test("Get current user", success,
                     f"User: {data.get('name', 'Unknown')}" if success else f"Error: {data}")

    def test_cart_operations(self):
        """Test cart functionality"""
        print("\n🛒 Testing Cart Operations...")
        
        if not self.test_product_id:
            self.log_test("Cart operations", False, "No test product available")
            return
        
        # Get empty cart
        success, data = self.make_request('GET', '/cart')
        self.log_test("Get empty cart", success,
                     f"Items: {len(data.get('items', []))}" if success else f"Error: {data}")
        
        # Add to cart
        cart_item = {
            "product_id": self.test_product_id,
            "quantity": 2
        }
        success, data = self.make_request('POST', '/cart/add', cart_item)
        self.log_test("Add to cart", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")
        
        # Get cart with items
        success, data = self.make_request('GET', '/cart')
        self.log_test("Get cart with items", success,
                     f"Items: {len(data.get('items', []))}, Total: {data.get('total', 0)}" if success else f"Error: {data}")
        
        # Update cart item
        update_item = {
            "product_id": self.test_product_id,
            "quantity": 1
        }
        success, data = self.make_request('PUT', '/cart/update', update_item)
        self.log_test("Update cart item", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")
        
        # Remove from cart
        success, data = self.make_request('DELETE', f'/cart/remove/{self.test_product_id}')
        self.log_test("Remove from cart", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")

    def test_wishlist_operations(self):
        """Test wishlist functionality"""
        print("\n❤️ Testing Wishlist Operations...")
        
        if not self.user_token or not self.test_product_id:
            self.log_test("Wishlist operations", False, "No user token or test product available")
            return
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Get empty wishlist
        success, data = self.make_request('GET', '/wishlist', headers=headers)
        self.log_test("Get empty wishlist", success,
                     f"Items: {len(data.get('items', []))}" if success else f"Error: {data}")
        
        # Add to wishlist
        success, data = self.make_request('POST', f'/wishlist/add/{self.test_product_id}', headers=headers)
        self.log_test("Add to wishlist", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")
        
        # Get wishlist with items
        success, data = self.make_request('GET', '/wishlist', headers=headers)
        self.log_test("Get wishlist with items", success,
                     f"Items: {len(data.get('items', []))}" if success else f"Error: {data}")
        
        # Remove from wishlist
        success, data = self.make_request('DELETE', f'/wishlist/remove/{self.test_product_id}', headers=headers)
        self.log_test("Remove from wishlist", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")

    def test_order_creation(self):
        """Test order creation"""
        print("\n📋 Testing Order Creation...")
        
        if not self.test_product_id:
            self.log_test("Order creation", False, "No test product available")
            return
        
        # First add item to cart
        cart_item = {
            "product_id": self.test_product_id,
            "quantity": 1
        }
        self.make_request('POST', '/cart/add', cart_item)
        
        # Create order
        order_data = {
            "items": [
                {
                    "product_id": self.test_product_id,
                    "name": "Test Product",
                    "price": 100000,
                    "quantity": 1,
                    "image": "test.jpg"
                }
            ],
            "shipping": {
                "full_name": "Test Customer",
                "phone": "+221771234567",
                "address": "123 Test Street",
                "city": "Dakar",
                "region": "Dakar",
                "notes": "Test order"
            },
            "payment_method": "wave",
            "subtotal": 100000,
            "shipping_cost": 2500,
            "total": 102500
        }
        
        success, data = self.make_request('POST', '/orders', order_data)
        if success:
            self.test_order_id = data.get('order_id')
            self.log_test("Create order", True, f"Order ID: {self.test_order_id}")
        else:
            self.log_test("Create order", False, f"Error: {data}")

    def test_admin_operations(self):
        """Test admin-only operations"""
        print("\n👑 Testing Admin Operations...")
        
        if not self.admin_token:
            self.log_test("Admin operations", False, "No admin token available")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Get admin stats
        success, data = self.make_request('GET', '/admin/stats', headers=headers)
        self.log_test("Get admin stats", success,
                     f"Orders: {data.get('total_orders', 0)}, Products: {data.get('total_products', 0)}" if success else f"Error: {data}")
        
        # Get all orders (admin)
        success, data = self.make_request('GET', '/admin/orders', headers=headers)
        self.log_test("Get all orders (admin)", success,
                     f"Found {len(data.get('orders', []))} orders" if success else f"Error: {data}")
        
        # Get all users (admin)
        success, data = self.make_request('GET', '/admin/users', headers=headers)
        self.log_test("Get all users (admin)", success,
                     f"Found {len(data.get('users', []))} users" if success else f"Error: {data}")
        
        # Update order status
        if self.test_order_id:
            update_data = {
                "order_status": "processing",
                "payment_status": "paid"
            }
            success, data = self.make_request('PUT', f'/admin/orders/{self.test_order_id}/status', 
                                            update_data, headers=headers)
            self.log_test("Update order status", success,
                         f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n📧 Testing Contact Form...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+221771234567",
            "subject": "Test Message",
            "message": "This is a test message from the API test suite."
        }
        
        success, data = self.make_request('POST', '/contact', contact_data)
        self.log_test("Submit contact form", success,
                     f"Message: {data.get('message', 'No message')}" if success else f"Error: {data}")

    def test_pdf_invoice_generation(self):
        """Test PDF invoice generation with YAMA+ logo"""
        print("\n📄 Testing PDF Invoice Generation...")
        
        # Test with existing order ID from the review request
        test_order_ids = ["ORD-F1215A06", "ORD-2C32A04F", "ORD-34DD43CC"]
        
        for order_id in test_order_ids:
            try:
                # Test invoice endpoint
                url = f"{self.base_url}/api/orders/{order_id}/invoice"
                response = self.session.get(url)
                
                if response.status_code == 200:
                    # Check if response is PDF
                    content_type = response.headers.get('content-type', '')
                    if 'application/pdf' in content_type:
                        # Check PDF content for YAMA+ branding
                        pdf_content = response.content
                        
                        # Basic check - PDF should contain YAMA+ text
                        if b'GROUPE YAMA+' in pdf_content or b'YAMA+' in pdf_content:
                            self.log_test(f"PDF Invoice Generation - {order_id}", True, 
                                        f"PDF generated successfully with YAMA+ branding (Size: {len(pdf_content)} bytes)")
                            
                            # Save a sample PDF for manual verification
                            with open(f"/tmp/test_invoice_{order_id}.pdf", "wb") as f:
                                f.write(pdf_content)
                            print(f"    Sample PDF saved to /tmp/test_invoice_{order_id}.pdf")
                            break
                        else:
                            self.log_test(f"PDF Invoice Generation - {order_id}", False, 
                                        "PDF generated but may not contain YAMA+ branding")
                    else:
                        self.log_test(f"PDF Invoice Generation - {order_id}", False, 
                                    f"Response is not PDF format: {content_type}")
                elif response.status_code == 404:
                    print(f"    Order {order_id} not found, trying next...")
                    continue
                else:
                    self.log_test(f"PDF Invoice Generation - {order_id}", False, 
                                f"HTTP {response.status_code}: {response.text[:100]}")
                    
            except Exception as e:
                self.log_test(f"PDF Invoice Generation - {order_id}", False, f"Exception: {str(e)}")
        
        # If no existing orders work, try with our test order
        if self.test_order_id:
            try:
                url = f"{self.base_url}/api/orders/{self.test_order_id}/invoice"
                response = self.session.get(url)
                
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/pdf' in content_type:
                        pdf_content = response.content
                        if b'GROUPE YAMA+' in pdf_content or b'YAMA+' in pdf_content:
                            self.log_test(f"PDF Invoice Generation - {self.test_order_id}", True, 
                                        f"PDF generated successfully with YAMA+ branding (Size: {len(pdf_content)} bytes)")
                        else:
                            self.log_test(f"PDF Invoice Generation - {self.test_order_id}", False, 
                                        "PDF generated but may not contain YAMA+ branding")
                    else:
                        self.log_test(f"PDF Invoice Generation - {self.test_order_id}", False, 
                                    f"Response is not PDF format: {content_type}")
                else:
                    self.log_test(f"PDF Invoice Generation - {self.test_order_id}", False, 
                                f"HTTP {response.status_code}: {response.text[:100]}")
                    
            except Exception as e:
                self.log_test(f"PDF Invoice Generation - {self.test_order_id}", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Lumina Senegal Backend API Tests")
        print("=" * 60)
        
        # Run tests in order
        self.test_health_check()
        self.test_database_seeding()
        self.test_categories()
        self.test_products()
        self.test_auth_registration()
        self.test_auth_login()
        self.test_auth_me()
        self.test_cart_operations()
        self.test_wishlist_operations()
        self.test_order_creation()
        self.test_admin_operations()
        self.test_contact_form()
        self.test_pdf_invoice_generation()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test runner"""
    tester = LuminaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())