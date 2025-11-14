# ShopRedLive - Secondhand Retail Platform

This is a Next.js web application with MongoDB backend for a secondhand retail platform.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   Make sure MongoDB is running on your system (default: mongodb://127.0.0.1:27017)

3. **Import test data:**
   ```bash
   node import_test_data.js
   ```

4. **Start the development servers:**
   - Option 1 - Separately:
     - Terminal 1 (Frontend): `npm run dev`
     - Terminal 2 (Backend): `npm run server`
   - Option 2 - Simultaneously: `npm run dev:all` (requires concurrently)

## Project Structure

- `/` - Main Next.js application
- `/server` - Express.js/MongoDB backend server
- `/test_data` - Generated test data files and scripts

## Dependencies Consolidation

All server dependencies (Express, Mongoose, Bcrypt, etc.) have been moved to the main package.json for better organization:
- Frontend: Next.js, React, Material-UI
- Backend: Express, Mongoose, Bcrypt, Cors
- Dev tools: Concurrently (for running both servers simultaneously)

## Test Data Generation

The project includes a Python script to generate realistic test data:

- `test_data/generate_test_data.py` - Generates comprehensive test data matching MongoDB schemas
- Includes 20 users, 50 products, and 11 categories
- Uses real image URLs from Wikimedia Commons and RandomUser.me
- All data fields match the MongoDB schema requirements

### Generated Files (in /test_data/):
- `test_data.json` - Complete dataset
- `test_users.json` - User data only
- `test_products.json` - Product data only
- `test_categories.json` - Category data only

## MongoDB Schema Compliance

### Product Schema Fields
- `name` - Product name (required, max length 100)
- `description` - Product description (required, max length 2000)
- `price` - Price (required, minimum 0)
- `currency` - Currency code (default: USD)
- `seller` - Reference to User ID (required)
- `buyer` - Reference to User ID (optional)
- `images` - Array of image URLs
- `category` - Reference to Category ID (optional)
- `condition` - Condition enum (new, like_new, good, fair, poor)
- `tags` - Array of tags
- `location` - Nested object with campus and area
- `status` - Status enum (active, reserved, sold, removed)
- `negotiable` - Boolean (default: true)
- `allowsMeetup` - Boolean (default: true)
- `allowsShipping` - Boolean (default: false)
- `views` - Number of views (default: 0)
- `createdAt` - Timestamp (added by schema)
- `updatedAt` - Timestamp (added by schema)

### User Schema Fields
- `name` - Username (required, unique, trimmed)
- `actualName` - Full name (required, trimmed)
- `password` - Password (required, hashed)
- `email` - Email address (required, unique, trimmed, lowercase)
- `university` - University name (required, trimmed)
- `campus` - Campus name (trimmed)
- `phone` - Phone number (trimmed)
- `karma` - Karma score (default: 100)
- `isAdmin` - Admin status (default: false)
- `isVerifiedStudent` - Student verification status (default: false)
- `products` - Array of Product references
- `savedProducts` - Array of Product references
- `profilePic` - Profile picture URL
- `createdAt` - Timestamp (added by schema)
- `updatedAt` - Timestamp (added by schema)

## Frontend Updates

Updated components to handle the complete schema:

1. **ProductGrid.js** - Now fetches real data from backend API instead of using mock data
2. **ProductCard.js** - Displays additional fields like condition, negotiability
3. **ProductDetail.js** - Shows comprehensive product information
4. **SellForm.js** - Includes all schema fields for product creation

## API Integration

The frontend now connects to the backend server:

- `src/app/api/products/...` - Routes that proxy to backend server
- Backend endpoints in `/server/server.js` handle database operations
- Uses environment variable `BACKEND_URL` to specify backend location

## Server-Side Routes

The backend server (in `/server/server.js`) includes the following endpoints:
- `GET /db` - Returns all products and users with populated references
- `GET /products` - Returns all products with seller/buyer populated
- `GET /product/:id` - Returns specific product with populated references
- `POST /newProduct` - Creates new products with full schema support
- `PATCH /product/:id` - Updates specific product fields
- `DELETE /product/:id` - Deletes products
- `GET /users` - Returns all users with products/savedProducts populated
- `GET /user/:id` - Returns specific user with populated references
- `POST /register` - Register new users
- `POST /users/verify-login` - User login verification