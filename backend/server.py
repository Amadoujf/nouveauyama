from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
import json
import hashlib
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt
import jwt

# PDF Generation
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image
from reportlab.lib.units import cm, mm

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'lumina-senegal-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

app = FastAPI(title="Lumina Senegal E-Commerce API")
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    role: str = "customer"
    picture: Optional[str] = None
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProductBase(BaseModel):
    name: str
    description: str
    short_description: str
    price: int  # Price in FCFA
    original_price: Optional[int] = None
    category: str
    subcategory: Optional[str] = None
    images: List[str]
    stock: int = 0
    featured: bool = False
    is_new: bool = False
    is_promo: bool = False
    is_flash_sale: bool = False
    flash_sale_end: Optional[str] = None  # ISO datetime string
    flash_sale_price: Optional[int] = None
    specs: Optional[dict] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    created_at: datetime
    updated_at: datetime

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cart_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem]
    created_at: datetime
    updated_at: datetime

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int
    image: str

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    region: str
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping: ShippingAddress
    payment_method: str
    subtotal: int
    shipping_cost: int
    total: int

class OrderStatusHistory(BaseModel):
    status: str
    timestamp: str
    note: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str
    user_id: Optional[str] = None
    items: List[OrderItem]
    shipping: ShippingAddress
    payment_method: str
    payment_status: str = "pending"
    order_status: str = "pending"
    status_history: List[OrderStatusHistory] = []
    subtotal: int
    shipping_cost: int
    total: int
    created_at: datetime

class WishlistItem(BaseModel):
    product_id: str
    added_at: datetime

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

# ============== REVIEWS MODELS ==============

class ReviewCreate(BaseModel):
    product_id: str
    rating: int  # 1-5
    title: str
    comment: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    product_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    rating: int
    title: str
    comment: str
    verified_purchase: bool = False
    helpful_count: int = 0
    created_at: datetime

# ============== NEWSLETTER MODEL ==============

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    name: Optional[str] = None

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[User]:
    # Try cookie first
    token = request.cookies.get("session_token")
    
    # Fall back to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    # Check if it's a JWT token
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id:
            user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
            if user_doc:
                if isinstance(user_doc.get('created_at'), str):
                    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
                return User(**user_doc)
    except jwt.ExpiredSignatureError:
        pass
    except jwt.InvalidTokenError:
        pass
    
    # Check session token (for Google OAuth)
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session_doc:
        expires_at = session_doc.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at > datetime.now(timezone.utc):
            user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
            if user_doc:
                if isinstance(user_doc.get('created_at'), str):
                    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
                return User(**user_doc)
    
    return None

async def require_auth(request: Request) -> User:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return user

async def require_admin(request: Request) -> User:
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_password = hash_password(user_data.password) if user_data.password else None
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "phone": user_data.phone,
        "password": hashed_password,
        "role": "customer",
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRATION_HOURS * 3600,
        path="/"
    )
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": "customer",
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    if not user_doc.get("password"):
        raise HTTPException(status_code=401, detail="Utilisez la connexion Google pour ce compte")
    
    if not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user_doc["user_id"], user_doc["email"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRATION_HOURS * 3600,
        path="/"
    )
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "role": user_doc.get("role", "customer"),
        "picture": user_doc.get("picture"),
        "token": token
    }

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process Google OAuth session_id and create user session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requis")
    
    # Fetch user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        user_data = auth_response.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": user_data["name"],
                "picture": user_data.get("picture")
            }}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "phone": None,
            "password": None,
            "role": "customer",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 3600,
        path="/"
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user_id": user_id,
        "email": user_doc["email"],
        "name": user_doc["name"],
        "role": user_doc.get("role", "customer"),
        "picture": user_doc.get("picture")
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "picture": user.picture,
        "phone": user.phone
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Déconnexion réussie"}

# ============== PRODUCTS ROUTES ==============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    is_new: Optional[bool] = None,
    is_promo: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    query = {}
    
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if is_new is not None:
        query["is_new"] = is_new
    if is_promo is not None:
        query["is_promo"] = is_promo
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for product in products:
        for field in ['created_at', 'updated_at']:
            if isinstance(product.get(field), str):
                product[field] = datetime.fromisoformat(product[field])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    for field in ['created_at', 'updated_at']:
        if isinstance(product.get(field), str):
            product[field] = datetime.fromisoformat(product[field])
    
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, user: User = Depends(require_admin)):
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    product_doc = product_data.model_dump()
    product_doc["product_id"] = product_id
    product_doc["created_at"] = now.isoformat()
    product_doc["updated_at"] = now.isoformat()
    
    await db.products.insert_one(product_doc)
    
    product_doc["created_at"] = now
    product_doc["updated_at"] = now
    
    return product_doc

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, user: User = Depends(require_admin)):
    existing = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    update_doc = product_data.model_dump()
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one(
        {"product_id": product_id},
        {"$set": update_doc}
    )
    
    updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    for field in ['created_at', 'updated_at']:
        if isinstance(updated.get(field), str):
            updated[field] = datetime.fromisoformat(updated[field])
    
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: User = Depends(require_admin)):
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return {"message": "Produit supprimé"}

# ============== REVIEWS ROUTES ==============

@api_router.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: str):
    """Get all reviews for a product"""
    reviews = await db.reviews.find(
        {"product_id": product_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Calculate average rating
    total_rating = sum(r["rating"] for r in reviews) if reviews else 0
    avg_rating = round(total_rating / len(reviews), 1) if reviews else 0
    
    # Rating distribution
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        distribution[r["rating"]] = distribution.get(r["rating"], 0) + 1
    
    return {
        "reviews": reviews,
        "total_reviews": len(reviews),
        "average_rating": avg_rating,
        "distribution": distribution
    }

@api_router.post("/products/{product_id}/reviews")
async def create_review(product_id: str, review_data: ReviewCreate, user: User = Depends(require_auth)):
    """Create a review for a product"""
    # Check if product exists
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "product_id": product_id,
        "user_id": user.user_id
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="Vous avez déjà donné votre avis sur ce produit")
    
    # Check if user purchased this product (verified purchase)
    user_orders = await db.orders.find({
        "user_id": user.user_id,
        "items.product_id": product_id,
        "payment_status": "paid"
    }).to_list(1)
    verified_purchase = len(user_orders) > 0
    
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    review_doc = {
        "review_id": review_id,
        "product_id": product_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_picture": user.picture,
        "rating": review_data.rating,
        "title": review_data.title,
        "comment": review_data.comment,
        "verified_purchase": verified_purchase,
        "helpful_count": 0,
        "created_at": now.isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    return {"message": "Avis publié avec succès", "review_id": review_id, "verified_purchase": verified_purchase}

@api_router.post("/reviews/{review_id}/helpful")
async def mark_review_helpful(review_id: str, request: Request):
    """Mark a review as helpful"""
    result = await db.reviews.update_one(
        {"review_id": review_id},
        {"$inc": {"helpful_count": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    return {"message": "Merci pour votre retour"}

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, user: User = Depends(require_auth)):
    """Delete a review (own review or admin)"""
    review = await db.reviews.find_one({"review_id": review_id}, {"_id": 0})
    if not review:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    
    if review["user_id"] != user.user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    await db.reviews.delete_one({"review_id": review_id})
    return {"message": "Avis supprimé"}

# ============== NEWSLETTER ROUTES ==============

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):
    """Subscribe to newsletter"""
    # Check if already subscribed
    existing = await db.newsletter.find_one({"email": data.email})
    if existing:
        return {"message": "Vous êtes déjà inscrit à notre newsletter", "already_subscribed": True}
    
    # Generate promo code
    promo_code = f"WELCOME{uuid.uuid4().hex[:6].upper()}"
    
    subscriber_doc = {
        "subscriber_id": f"sub_{uuid.uuid4().hex[:12]}",
        "email": data.email,
        "name": data.name,
        "promo_code": promo_code,
        "discount_percent": 10,
        "promo_used": False,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
        "active": True
    }
    
    await db.newsletter.insert_one(subscriber_doc)
    
    return {
        "message": "Inscription réussie ! Voici votre code promo",
        "promo_code": promo_code,
        "discount_percent": 10,
        "already_subscribed": False
    }

@api_router.get("/newsletter/validate/{promo_code}")
async def validate_promo_code(promo_code: str):
    """Validate a promo code"""
    subscriber = await db.newsletter.find_one({"promo_code": promo_code, "active": True}, {"_id": 0})
    if not subscriber:
        raise HTTPException(status_code=404, detail="Code promo invalide")
    
    if subscriber.get("promo_used"):
        raise HTTPException(status_code=400, detail="Ce code promo a déjà été utilisé")
    
    return {
        "valid": True,
        "discount_percent": subscriber["discount_percent"],
        "message": f"-{subscriber['discount_percent']}% sur votre commande"
    }

# ============== CART ROUTES ==============

@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_current_user(request)
    session_id = request.cookies.get("cart_session") or request.headers.get("X-Cart-Session")
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        return {"items": [], "total": 0}
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    
    # Fetch product details for each item
    enriched_items = []
    total = 0
    
    for item in cart.get("items", []):
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            enriched_items.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "name": product["name"],
                "price": product["price"],
                "image": product["images"][0] if product["images"] else "",
                "stock": product["stock"]
            })
            total += product["price"] * item["quantity"]
    
    return {"items": enriched_items, "total": total}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, request: Request, response: Response):
    user = await get_current_user(request)
    session_id = request.cookies.get("cart_session") or request.headers.get("X-Cart-Session")
    
    if not session_id:
        session_id = f"cart_{uuid.uuid4().hex[:12]}"
        response.set_cookie(
            key="cart_session",
            value=session_id,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=30 * 24 * 3600,
            path="/"
        )
    
    # Check product exists and has stock
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    if product["stock"] < item.quantity:
        raise HTTPException(status_code=400, detail="Stock insuffisant")
    
    query = {"user_id": user.user_id} if user else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    now = datetime.now(timezone.utc).isoformat()
    
    if cart:
        # Update existing cart
        items = cart.get("items", [])
        found = False
        for i, existing_item in enumerate(items):
            if existing_item["product_id"] == item.product_id:
                items[i]["quantity"] += item.quantity
                found = True
                break
        
        if not found:
            items.append({"product_id": item.product_id, "quantity": item.quantity})
        
        await db.carts.update_one(query, {"$set": {"items": items, "updated_at": now}})
    else:
        # Create new cart
        cart_doc = {
            "cart_id": f"cart_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id if user else None,
            "session_id": session_id if not user else None,
            "items": [{"product_id": item.product_id, "quantity": item.quantity}],
            "created_at": now,
            "updated_at": now
        }
        await db.carts.insert_one(cart_doc)
    
    return {"message": "Produit ajouté au panier"}

@api_router.put("/cart/update")
async def update_cart_item(item: CartItem, request: Request):
    user = await get_current_user(request)
    session_id = request.cookies.get("cart_session") or request.headers.get("X-Cart-Session")
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Panier non trouvé")
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Panier non trouvé")
    
    items = cart.get("items", [])
    
    if item.quantity <= 0:
        items = [i for i in items if i["product_id"] != item.product_id]
    else:
        for i, existing_item in enumerate(items):
            if existing_item["product_id"] == item.product_id:
                items[i]["quantity"] = item.quantity
                break
    
    await db.carts.update_one(
        query,
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Panier mis à jour"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, request: Request):
    user = await get_current_user(request)
    session_id = request.cookies.get("cart_session") or request.headers.get("X-Cart-Session")
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Panier non trouvé")
    
    await db.carts.update_one(
        query,
        {"$pull": {"items": {"product_id": product_id}}}
    )
    
    return {"message": "Produit retiré du panier"}

@api_router.delete("/cart/clear")
async def clear_cart(request: Request):
    user = await get_current_user(request)
    session_id = request.cookies.get("cart_session") or request.headers.get("X-Cart-Session")
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    
    if query:
        await db.carts.delete_one(query)
    
    return {"message": "Panier vidé"}

# ============== WISHLIST ROUTES ==============

@api_router.get("/wishlist")
async def get_wishlist(user: User = Depends(require_auth)):
    wishlist = await db.wishlists.find_one({"user_id": user.user_id}, {"_id": 0})
    if not wishlist:
        return {"items": []}
    
    # Fetch product details
    enriched_items = []
    for item in wishlist.get("items", []):
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            enriched_items.append({
                "product_id": item["product_id"],
                "added_at": item["added_at"],
                "name": product["name"],
                "price": product["price"],
                "image": product["images"][0] if product["images"] else "",
                "stock": product["stock"]
            })
    
    return {"items": enriched_items}

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, user: User = Depends(require_auth)):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await db.wishlists.update_one(
        {"user_id": user.user_id},
        {
            "$addToSet": {"items": {"product_id": product_id, "added_at": now}},
            "$setOnInsert": {"created_at": now}
        },
        upsert=True
    )
    
    return {"message": "Produit ajouté à la liste de souhaits"}

@api_router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, user: User = Depends(require_auth)):
    await db.wishlists.update_one(
        {"user_id": user.user_id},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Produit retiré de la liste de souhaits"}

# ============== ORDERS ROUTES ==============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, request: Request):
    user = await get_current_user(request)
    
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc)
    
    order_doc = order_data.model_dump()
    order_doc["order_id"] = order_id
    order_doc["user_id"] = user.user_id if user else None
    order_doc["payment_status"] = "pending"
    order_doc["order_status"] = "pending"
    order_doc["created_at"] = now.isoformat()
    
    # Update stock for each product
    for item in order_data.items:
        await db.products.update_one(
            {"product_id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    await db.orders.insert_one(order_doc)
    
    # Clear user's cart
    if user:
        await db.carts.delete_one({"user_id": user.user_id})
    
    order_doc["created_at"] = now
    return order_doc

@api_router.get("/orders")
async def get_user_orders(user: User = Depends(require_auth)):
    orders = await db.orders.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_current_user(request)
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    # Check access
    if user and user.role != "admin" and order.get("user_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order

# ============== PAYTECH PAYMENT INTEGRATION ==============

PAYTECH_API_URL = "https://paytech.sn/api/payment/request-payment"
PAYTECH_CHECKOUT_URL = "https://paytech.sn/payment/checkout/"

class PaymentRequest(BaseModel):
    order_id: str
    success_url: str
    cancel_url: str

class PaytechIPN(BaseModel):
    type_event: str
    custom_field: str
    payment_method: Optional[str] = None
    api_key_sha256: Optional[str] = None
    api_secret_sha256: Optional[str] = None

@api_router.post("/payments/paytech/initiate")
async def initiate_paytech_payment(payment: PaymentRequest):
    """Initiate a PayTech payment (Wave, Orange Money, Free Money, Card)"""
    
    # Get PayTech credentials
    api_key = os.environ.get('PAYTECH_API_KEY', '')
    api_secret = os.environ.get('PAYTECH_API_SECRET', '')
    env = os.environ.get('PAYTECH_ENV', 'test')
    
    if not api_key or api_key == 'votre_cle_api':
        raise HTTPException(status_code=500, detail="PayTech API non configurée. Veuillez ajouter vos clés API PayTech.")
    
    # Get order details
    order = await db.orders.find_one({"order_id": payment.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    # Prepare item names
    items = order.get('items', order.get('products', []))
    item_names = ", ".join([item.get('name', 'Produit')[:30] for item in items[:3]])
    if len(items) > 3:
        item_names += f" +{len(items) - 3} autres"
    
    # Build IPN URL (webhook for payment confirmation)
    # In production, this should be your actual domain
    frontend_url = os.environ.get('FRONTEND_URL', payment.success_url.rsplit('/', 1)[0])
    ipn_url = f"{frontend_url}/api/payments/paytech/ipn"
    
    # Prepare PayTech request data
    paytech_data = {
        "item_name": item_names or "Commande YAMA+",
        "item_price": str(int(order.get('total', 0))),
        "currency": "XOF",
        "ref_command": f"{payment.order_id}_{int(datetime.now().timestamp())}",
        "command_name": f"Paiement de {order.get('total', 0):,.0f} FCFA - YAMA+".replace(',', ' '),
        "env": env,
        "success_url": payment.success_url,
        "cancel_url": payment.cancel_url,
        "ipn_url": ipn_url,
        "custom_field": json.dumps({
            "order_id": payment.order_id,
            "amount": order.get('total', 0)
        })
    }
    
    # Make request to PayTech
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                PAYTECH_API_URL,
                data=paytech_data,
                headers={
                    "API_KEY": api_key,
                    "API_SECRET": api_secret,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout=30.0
            )
            
            result = response.json()
            
            if 'token' in result:
                checkout_url = f"{PAYTECH_CHECKOUT_URL}{result['token']}"
                
                # Store payment reference
                await db.orders.update_one(
                    {"order_id": payment.order_id},
                    {"$set": {
                        "paytech_token": result['token'],
                        "paytech_ref": paytech_data['ref_command'],
                        "payment_initiated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                return {
                    "success": True,
                    "checkout_url": checkout_url,
                    "token": result['token']
                }
            else:
                error_msg = result.get('error', [result.get('message', 'Erreur inconnue')])
                if isinstance(error_msg, list):
                    error_msg = error_msg[0] if error_msg else 'Erreur PayTech'
                raise HTTPException(status_code=400, detail=f"Erreur PayTech: {error_msg}")
                
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Erreur de connexion à PayTech: {str(e)}")


@api_router.post("/payments/paytech/ipn")
async def paytech_ipn_webhook(request: Request):
    """Handle PayTech IPN (Instant Payment Notification) webhook"""
    
    try:
        form_data = await request.form()
        data = dict(form_data)
        
        type_event = data.get('type_event')
        
        if type_event == 'sale_complete':
            # Verify API keys hash
            api_key = os.environ.get('PAYTECH_API_KEY', '')
            api_secret = os.environ.get('PAYTECH_API_SECRET', '')
            
            import hashlib
            expected_api_hash = hashlib.sha256(api_key.encode()).hexdigest()
            expected_secret_hash = hashlib.sha256(api_secret.encode()).hexdigest()
            
            received_api_hash = data.get('api_key_sha256', '')
            received_secret_hash = data.get('api_secret_sha256', '')
            
            if expected_api_hash != received_api_hash or expected_secret_hash != received_secret_hash:
                return JSONResponse(content={"status": "error", "message": "Invalid signature"}, status_code=401)
            
            # Parse custom field
            custom_field = json.loads(data.get('custom_field', '{}'))
            order_id = custom_field.get('order_id')
            payment_method = data.get('payment_method', 'PayTech')
            
            if order_id:
                # Update order status
                await db.orders.update_one(
                    {"order_id": order_id},
                    {"$set": {
                        "payment_status": "paid",
                        "order_status": "processing",
                        "payment_method_used": payment_method,
                        "paid_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                return JSONResponse(content={"status": "OK"})
        
        return JSONResponse(content={"status": "ignored"})
        
    except Exception as e:
        logging.error(f"PayTech IPN error: {str(e)}")
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@api_router.get("/payments/paytech/verify/{order_id}")
async def verify_paytech_payment(order_id: str):
    """Check payment status for an order"""
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    return {
        "order_id": order_id,
        "payment_status": order.get('payment_status', 'pending'),
        "order_status": order.get('order_status', 'pending'),
        "payment_method": order.get('payment_method_used'),
        "paid_at": order.get('paid_at')
    }

# ============== ADMIN ROUTES ==============

@api_router.get("/admin/orders")
async def get_all_orders(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    user: User = Depends(require_admin)
):
    query = {}
    if status:
        query["order_status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    total = await db.orders.count_documents(query)
    
    return {"orders": orders, "total": total}

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    request: Request,
    user: User = Depends(require_admin)
):
    body = await request.json()
    order_status = body.get("order_status")
    payment_status = body.get("payment_status")
    note = body.get("note", "")
    
    update_doc = {}
    if order_status:
        update_doc["order_status"] = order_status
    if payment_status:
        update_doc["payment_status"] = payment_status
    
    if not update_doc:
        raise HTTPException(status_code=400, detail="Aucune mise à jour fournie")
    
    # Add to status history
    history_entry = {
        "status": order_status or payment_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": note
    }
    
    result = await db.orders.update_one(
        {"order_id": order_id}, 
        {
            "$set": update_doc,
            "$push": {"status_history": history_entry}
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    return {"message": "Statut mis à jour"}

# ============== INVOICE GENERATION ==============

def generate_invoice_pdf(order: dict) -> io.BytesIO:
    """Generate a professional PDF invoice for an order with logo and product images"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=1.5*cm, bottomMargin=2*cm)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        spaceAfter=5,
        textColor=colors.HexColor('#0B0B0B'),
        fontName='Helvetica-Bold'
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666')
    )
    
    # Add logo header
    logo_path = ROOT_DIR / "logo_yama.png"
    logging.info(f"Invoice logo path: {logo_path}, exists: {logo_path.exists()}")
    
    if logo_path.exists():
        try:
            # Create header with YAMA+ logo
            logo_img = Image(str(logo_path), width=3.5*cm, height=3.5*cm)
            header_data = [[logo_img, Paragraph("<b>GROUPE YAMA+</b><br/><font size='9' color='#666666'>Votre boutique premium au Sénégal</font>", styles['Normal'])]]
            header_table = Table(header_data, colWidths=[4.5*cm, 12*cm])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ]))
            elements.append(header_table)
            logging.info("Logo added to invoice successfully")
        except Exception as e:
            logging.error(f"Error adding logo to invoice: {e}")
            elements.append(Paragraph("GROUPE YAMA+", title_style))
            elements.append(Paragraph("Votre boutique premium au Sénégal", header_style))
    else:
        logging.warning(f"Logo file not found at {logo_path}")
        elements.append(Paragraph("GROUPE YAMA+", title_style))
        elements.append(Paragraph("Votre boutique premium au Sénégal", header_style))
    
    elements.append(Paragraph("Email: contact@yama.sn | WhatsApp: +221 77 000 00 00", header_style))
    elements.append(Spacer(1, 15))
    
    # Divider line
    divider = Table([['']], colWidths=[17*cm])
    divider.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 1, colors.HexColor('#0B0B0B')),
    ]))
    elements.append(divider)
    elements.append(Spacer(1, 15))
    
    # Invoice Title
    elements.append(Paragraph(f"<b>FACTURE N° {order['order_id'].upper()}</b>", ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=15
    )))
    
    # Order Date
    order_date = order.get('created_at', datetime.now(timezone.utc))
    if isinstance(order_date, str):
        order_date = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
    
    elements.append(Paragraph(f"<b>Date:</b> {order_date.strftime('%d/%m/%Y à %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 15))
    
    # Customer Info
    shipping = order.get('shipping', {})
    elements.append(Paragraph("<b>FACTURER À:</b>", styles['Heading3']))
    elements.append(Paragraph(f"{shipping.get('full_name', 'Client')}", styles['Normal']))
    elements.append(Paragraph(f"{shipping.get('address', '')}", styles['Normal']))
    elements.append(Paragraph(f"{shipping.get('city', '')}, {shipping.get('region', 'Dakar')}", styles['Normal']))
    elements.append(Paragraph(f"Tél: {shipping.get('phone', '')}", styles['Normal']))
    if shipping.get('email'):
        elements.append(Paragraph(f"Email: {shipping.get('email')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Products with Images
    elements.append(Paragraph("<b>ARTICLES COMMANDÉS:</b>", styles['Heading3']))
    elements.append(Spacer(1, 10))
    
    # Products Table with Image column
    table_data = [['', 'Produit', 'Qté', 'Prix Unit.', 'Total']]
    
    for item in order.get('products', []):
        name = item.get('name', 'Produit')[:35]
        qty = item.get('quantity', 1)
        price = item.get('price', 0)
        total_price = price * qty
        
        # Try to get product image
        img_cell = ''
        try:
            img_url = item.get('image', '')
            if img_url and img_url.startswith('http'):
                import urllib.request
                import tempfile
                img_path = f"/tmp/prod_{item.get('product_id', 'temp')}.jpg"
                urllib.request.urlretrieve(img_url, img_path)
                img_cell = Image(img_path, width=1.2*cm, height=1.2*cm)
        except:
            img_cell = ''
        
        table_data.append([
            img_cell,
            name,
            str(qty),
            f"{price:,.0f} FCFA".replace(',', ' '),
            f"{total_price:,.0f} FCFA".replace(',', ' ')
        ])
    
    # Create table with image column
    table = Table(table_data, colWidths=[1.5*cm, 7*cm, 1.5*cm, 3.5*cm, 3.5*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B0B0B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F5F5F7')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Totals
    subtotal = order.get('subtotal', sum(p.get('price', 0) * p.get('quantity', 1) for p in order.get('products', [])))
    shipping_cost = order.get('shipping_cost', 2500)
    discount = order.get('discount', 0)
    total = order.get('total', subtotal + shipping_cost - discount)
    
    totals_data = [
        ['Sous-total:', f"{subtotal:,.0f} FCFA".replace(',', ' ')],
        ['Livraison:', f"{shipping_cost:,.0f} FCFA".replace(',', ' ')],
    ]
    
    if discount > 0:
        totals_data.append(['Réduction:', f"-{discount:,.0f} FCFA".replace(',', ' ')])
    
    totals_data.append(['TOTAL:', f"{total:,.0f} FCFA".replace(',', ' ')])
    
    totals_table = Table(totals_data, colWidths=[13.5*cm, 3.5*cm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.HexColor('#0B0B0B')),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 30))
    
    # Payment Info
    payment_method = order.get('payment_method', 'Non spécifié')
    payment_labels = {
        'wave': 'Wave',
        'orange_money': 'Orange Money',
        'card': 'Carte Bancaire',
        'cash': 'Paiement à la livraison'
    }
    elements.append(Paragraph(f"<b>Mode de paiement:</b> {payment_labels.get(payment_method, payment_method)}", styles['Normal']))
    
    payment_status = order.get('payment_status', 'pending')
    status_labels = {
        'pending': '⏳ En attente',
        'paid': '✅ Payé',
        'failed': '❌ Échoué'
    }
    elements.append(Paragraph(f"<b>Statut du paiement:</b> {status_labels.get(payment_status, payment_status)}", styles['Normal']))
    elements.append(Spacer(1, 40))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#999999'),
        alignment=1  # Center
    )
    elements.append(Paragraph("Merci pour votre achat chez YAMA+ !", footer_style))
    elements.append(Paragraph("Pour toute question, contactez-nous sur WhatsApp: +221 77 000 00 00", footer_style))
    elements.append(Paragraph("www.yama.sn", footer_style))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer


@api_router.get("/orders/{order_id}/invoice")
async def get_order_invoice(order_id: str, request: Request):
    """Generate and download invoice PDF for an order"""
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    # Generate PDF
    pdf_buffer = generate_invoice_pdf(order)
    
    # Return as downloadable file
    filename = f"facture_{order_id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@api_router.get("/admin/orders/{order_id}/invoice")
async def get_admin_order_invoice(order_id: str, user: User = Depends(require_admin)):
    """Generate and download invoice PDF for an order (admin)"""
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    # Generate PDF
    pdf_buffer = generate_invoice_pdf(order)
    
    # Return as downloadable file
    filename = f"facture_{order_id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@api_router.get("/admin/stats")
async def get_admin_stats(user: User = Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({})
    
    # Calculate revenue
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_products": total_products,
        "total_users": total_users,
        "total_revenue": total_revenue
    }

@api_router.get("/admin/users")
async def get_all_users(
    limit: int = 50,
    skip: int = 0,
    user: User = Depends(require_admin)
):
    users = await db.users.find({}, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total}

# ============== CONTACT ROUTES ==============

@api_router.post("/contact")
async def send_contact_message(message: ContactMessage):
    message_doc = message.model_dump()
    message_doc["message_id"] = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    message_doc["read"] = False
    
    await db.contact_messages.insert_one(message_doc)
    
    return {"message": "Message envoyé avec succès"}

@api_router.get("/admin/messages")
async def get_contact_messages(user: User = Depends(require_admin)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

# ============== CATEGORIES ==============

@api_router.get("/categories")
async def get_categories():
    return [
        {"id": "electronique", "name": "Électronique", "icon": "Smartphone"},
        {"id": "electromenager", "name": "Électroménager", "icon": "Refrigerator"},
        {"id": "decoration", "name": "Décoration & Mobilier", "icon": "Sofa"},
        {"id": "beaute", "name": "Beauté & Bien-être", "icon": "Sparkles"}
    ]

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with sample products and admin user"""
    
    # Check if already seeded
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Base de données déjà initialisée", "count": existing}
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create default admin user
    admin_exists = await db.users.find_one({"email": "admin@yama.sn"})
    if not admin_exists:
        admin_doc = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": "admin@yama.sn",
            "name": "Admin YAMA+",
            "phone": "+221770000000",
            "password": hash_password("admin123"),
            "role": "admin",
            "picture": None,
            "created_at": now
        }
        await db.users.insert_one(admin_doc)
    
    products = [
        # Électronique
        {
            "product_id": "prod_iphone15pro",
            "name": "iPhone 15 Pro Max",
            "description": "Le smartphone le plus avancé. Puce A17 Pro, système de caméra révolutionnaire, design en titane. Une puissance inégalée pour créer, jouer et travailler.",
            "short_description": "Puce A17 Pro. Titane. Caméra 48MP.",
            "price": 1299000,
            "original_price": None,
            "category": "electronique",
            "subcategory": "smartphones",
            "images": [
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"
            ],
            "stock": 15,
            "featured": True,
            "is_new": True,
            "is_promo": False,
            "specs": {"storage": "256GB", "color": "Titane Naturel", "display": "6.7\""},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_macbook_air",
            "name": "MacBook Air M3",
            "description": "Fin. Léger. Puissant. Le MacBook Air avec puce M3 offre une autonomie exceptionnelle et des performances révolutionnaires dans un design silencieux sans ventilateur.",
            "short_description": "Puce M3. 18h d'autonomie. Silencieux.",
            "price": 1149000,
            "original_price": None,
            "category": "electronique",
            "subcategory": "ordinateurs",
            "images": [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"
            ],
            "stock": 10,
            "featured": True,
            "is_new": True,
            "is_promo": False,
            "specs": {"ram": "8GB", "storage": "256GB SSD", "display": "13.6\" Liquid Retina"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_airpods_pro",
            "name": "AirPods Pro 2",
            "description": "Son immersif. Réduction de bruit active. Transparence adaptative. Audio spatial personnalisé. L'expérience audio ultime.",
            "short_description": "ANC. Audio Spatial. USB-C.",
            "price": 189000,
            "original_price": 219000,
            "category": "electronique",
            "subcategory": "audio",
            "images": [
                "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"
            ],
            "stock": 30,
            "featured": True,
            "is_new": False,
            "is_promo": True,
            "specs": {"battery": "6h (30h avec boîtier)", "noise_cancellation": "Active"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_samsung_tv",
            "name": "Samsung Neo QLED 65\"",
            "description": "Vivez une expérience visuelle extraordinaire. Technologie Quantum Matrix, processeur Neural Quantum 4K, design ultra-fin. Le summum du divertissement.",
            "short_description": "4K. 120Hz. HDR10+. Smart TV.",
            "price": 1599000,
            "original_price": 1899000,
            "category": "electronique",
            "subcategory": "tv",
            "images": [
                "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"
            ],
            "stock": 5,
            "featured": True,
            "is_new": False,
            "is_promo": True,
            "specs": {"resolution": "4K", "refresh": "120Hz", "hdr": "HDR10+"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_galaxy_watch",
            "name": "Galaxy Watch 6 Classic",
            "description": "La montre connectée premium. Lunette rotative iconique, suivi santé avancé, design intemporel. Votre compagnon intelligent au quotidien.",
            "short_description": "Lunette rotative. Suivi santé complet.",
            "price": 279000,
            "original_price": None,
            "category": "electronique",
            "subcategory": "montres",
            "images": [
                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"
            ],
            "stock": 20,
            "featured": False,
            "is_new": True,
            "is_promo": False,
            "specs": {"size": "47mm", "battery": "40h", "water_resistance": "5ATM"},
            "created_at": now,
            "updated_at": now
        },
        # Électroménager
        {
            "product_id": "prod_dyson_v15",
            "name": "Dyson V15 Detect",
            "description": "L'aspirateur le plus intelligent. Laser révélateur de poussière, capteur piézo, écran LCD. Une propreté scientifiquement prouvée.",
            "short_description": "Laser. 60min d'autonomie. Sans fil.",
            "price": 549000,
            "original_price": None,
            "category": "electromenager",
            "subcategory": "aspirateurs",
            "images": [
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800"
            ],
            "stock": 12,
            "featured": True,
            "is_new": False,
            "is_promo": False,
            "specs": {"battery": "60min", "power": "240AW", "weight": "3kg"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_nespresso",
            "name": "Nespresso Vertuo Next",
            "description": "Le café parfait en un geste. Technologie Centrifusion, reconnaissance des capsules, design compact. L'art du café à la maison.",
            "short_description": "Centrifusion. 5 tailles de tasse.",
            "price": 119000,
            "original_price": 149000,
            "category": "electromenager",
            "subcategory": "cafe",
            "images": [
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800"
            ],
            "stock": 25,
            "featured": False,
            "is_new": False,
            "is_promo": True,
            "specs": {"pressure": "19 bars", "water_tank": "1.1L", "heat_time": "15s"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_samsung_fridge",
            "name": "Samsung Family Hub",
            "description": "Le réfrigérateur connecté. Écran tactile 21\", caméras internes, gestion des courses intelligente. La cuisine du futur, aujourd'hui.",
            "short_description": "Écran 21\". Caméras internes. WiFi.",
            "price": 2499000,
            "original_price": None,
            "category": "electromenager",
            "subcategory": "refrigerateurs",
            "images": [
                "https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?w=800"
            ],
            "stock": 3,
            "featured": True,
            "is_new": True,
            "is_promo": False,
            "specs": {"capacity": "614L", "class": "A++", "features": "Family Hub"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_airfryer",
            "name": "Philips Airfryer XXL",
            "description": "Cuisinez sain sans compromis. Technologie Twin TurboStar, grande capacité, résultats croustillants. Le plaisir de la friture sans huile.",
            "short_description": "XXL. 90% moins de graisse.",
            "price": 159000,
            "original_price": None,
            "category": "electromenager",
            "subcategory": "cuisine",
            "images": [
                "https://images.unsplash.com/photo-1648145765181-2e5ccaee0ad2?w=800"
            ],
            "stock": 18,
            "featured": False,
            "is_new": False,
            "is_promo": False,
            "specs": {"capacity": "1.4kg", "power": "2225W", "programs": "5"},
            "created_at": now,
            "updated_at": now
        },
        # Décoration & Mobilier
        {
            "product_id": "prod_sofa_scandinave",
            "name": "Canapé Oslo 3 Places",
            "description": "L'élégance scandinave. Lignes épurées, confort optimal, pieds en bois massif. Un classique intemporel pour votre salon.",
            "short_description": "Design scandinave. Tissu premium.",
            "price": 459000,
            "original_price": 549000,
            "category": "decoration",
            "subcategory": "canapes",
            "images": [
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
            ],
            "stock": 6,
            "featured": True,
            "is_new": False,
            "is_promo": True,
            "specs": {"seats": "3", "material": "Tissu", "color": "Gris"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_lampe_arc",
            "name": "Lampe Arc Design",
            "description": "Lumière sculpturale. Arc élégant en acier brossé, base marbre, éclairage d'ambiance. Une pièce maîtresse pour votre intérieur.",
            "short_description": "Arc 180cm. Base marbre.",
            "price": 189000,
            "original_price": None,
            "category": "decoration",
            "subcategory": "luminaires",
            "images": [
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"
            ],
            "stock": 10,
            "featured": False,
            "is_new": True,
            "is_promo": False,
            "specs": {"height": "180cm", "material": "Acier/Marbre", "bulb": "E27"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_table_basse",
            "name": "Table Basse Minimaliste",
            "description": "Simplicité raffinée. Plateau en verre trempé, structure en chêne massif, design épuré. L'essentiel, magnifié.",
            "short_description": "Verre & chêne. 120x60cm.",
            "price": 279000,
            "original_price": None,
            "category": "decoration",
            "subcategory": "tables",
            "images": [
                "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800"
            ],
            "stock": 8,
            "featured": False,
            "is_new": False,
            "is_promo": False,
            "specs": {"dimensions": "120x60x40cm", "material": "Verre/Chêne"},
            "created_at": now,
            "updated_at": now
        },
        # Beauté & Bien-être
        {
            "product_id": "prod_dyson_airwrap",
            "name": "Dyson Airwrap Complete",
            "description": "Coiffure réinventée. Effet Coanda pour des boucles et du volume sans chaleur extrême. Tous les styles, zéro dommage.",
            "short_description": "Effet Coanda. 6 accessoires.",
            "price": 449000,
            "original_price": None,
            "category": "beaute",
            "subcategory": "cheveux",
            "images": [
                "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800"
            ],
            "stock": 14,
            "featured": True,
            "is_new": False,
            "is_promo": False,
            "specs": {"attachments": "6", "heat": "150°C max", "voltage": "220V"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_serum_visage",
            "name": "Sérum Éclat Vitamine C",
            "description": "Révélez votre éclat. Vitamine C stabilisée 15%, acide hyaluronique, antioxydants. Une peau lumineuse et protégée.",
            "short_description": "Vitamine C 15%. Anti-âge.",
            "price": 45000,
            "original_price": 55000,
            "category": "beaute",
            "subcategory": "soins",
            "images": [
                "https://images.pexels.com/photos/3762882/pexels-photo-3762882.jpeg?w=800"
            ],
            "stock": 40,
            "featured": False,
            "is_new": True,
            "is_promo": True,
            "specs": {"volume": "30ml", "key_ingredient": "Vitamine C 15%"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_massage_gun",
            "name": "Pistolet Massage Theragun",
            "description": "Récupération professionnelle. Thérapie percussive puissante, 6 têtes interchangeables, application connectée. Soulagez vos muscles en profondeur.",
            "short_description": "2400 percussions/min. 6 têtes.",
            "price": 299000,
            "original_price": None,
            "category": "beaute",
            "subcategory": "massage",
            "images": [
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
            ],
            "stock": 16,
            "featured": False,
            "is_new": False,
            "is_promo": False,
            "specs": {"speed": "2400rpm", "battery": "150min", "noise": "Silencieux"},
            "created_at": now,
            "updated_at": now
        },
        {
            "product_id": "prod_parfum_luxe",
            "name": "Eau de Parfum Prestige",
            "description": "Signature olfactive. Notes de bergamote, jasmin et bois de santal. Une fragrance raffinée qui laisse une empreinte mémorable.",
            "short_description": "100ml. Unisexe. Premium.",
            "price": 129000,
            "original_price": None,
            "category": "beaute",
            "subcategory": "parfums",
            "images": [
                "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"
            ],
            "stock": 22,
            "featured": True,
            "is_new": True,
            "is_promo": False,
            "specs": {"volume": "100ml", "type": "Eau de Parfum", "gender": "Unisexe"},
            "created_at": now,
            "updated_at": now
        }
    ]
    
    await db.products.insert_many(products)
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@lumina.sn"})
    if not admin_exists:
        admin_doc = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": "admin@lumina.sn",
            "name": "Admin Lumina",
            "phone": "+221 77 000 00 00",
            "password": hash_password("admin123"),
            "role": "admin",
            "picture": None,
            "created_at": now
        }
        await db.users.insert_one(admin_doc)
    
    return {"message": "Base de données initialisée", "products": len(products)}

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Lumina Senegal", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
