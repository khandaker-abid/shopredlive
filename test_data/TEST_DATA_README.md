# Test Data for ShopRedLive Application

This directory contains generated test data for the ShopRedLive secondhand retail platform, designed to match your MongoDB schemas.

## Files Included

- `test_data.json` - Complete dataset with users, products, and categories
- `test_users.json` - User data matching the MongoDB User schema
- `test_products.json` - Product data matching the MongoDB Product schema  
- `test_categories.json` - Category data
- `generate_test_data.py` - Python script to regenerate test data

## MongoDB Schema Compliance

### Product Schema Fields
- `name` - Product name (required, max length 100)
- `description` - Product description (required, max length 2000)
- `price` - Price (required, minimum 0)
- `currency` - Currency code (default: USD)
- `seller` - Reference to User ID (required)
- `buyer` - Reference to User ID (optional)
- `images` - Array of image URLs (replaces Buffer in test data)
- `category` - Reference to Category ID
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
- `password` - Password (required)
- `email` - Email address (required, unique, trimmed, lowercase)
- `university` - University name (required, trimmed)
- `campus` - Campus name (trimmed)
- `phone` - Phone number (trimmed)
- `karma` - Karma score (default: 100)
- `isAdmin` - Admin status (default: false)
- `isVerifiedStudent` - Student verification status (default: false)
- `profilePic` - Profile picture URL (replaces Buffer in test data)

## Image URLs

The test data includes real image URLs for:
- Product images: Wikimedia Commons and other public domain sources
- Profile pictures: RandomUser.me API

## Usage

To regenerate the test data:
```bash
python3 generate_test_data.py
```

To use this test data in your application, you can import these JSON files into your MongoDB collections or use them for frontend development and testing.

## Notes

- The test data uses string IDs that match your schema references
- Images are represented as URLs instead of Buffer objects for test data ease
- Passwords are in plain text for test purposes (in production, they would be hashed)