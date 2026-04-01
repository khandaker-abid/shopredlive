# ShopRedLive - Secondhand Retail Platform for SBU

A full-featured secondhand marketplace for Stony Brook University students to buy and sell items on campus.

## Features

- **User Authentication** - Register/login with SBU email verification
- **Product Listings** - Create, edit, delete listings with image uploads
- **Messaging System** - Real-time messaging between buyers and sellers (SignalHouse integration ready)
- **Offer System** - Make, accept, or decline offers on products
- **Order Management** - Track transactions and order status
- **Notifications** - Get notified about new messages, offers, and order updates
- **Reviews & Ratings** - Rate and review sellers after transactions
- **Advanced Search** - Filter by category, condition, price range, and sort options
- **Save Items** - Save products to watch list
- **Report System** - Report suspicious listings or users

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   Make sure MongoDB is running on your system (default: mongodb://127.0.0.1:27017)

3. **Seed categories:**
   ```bash
   node server/seed_categories.js
   ```

4. **Import test data (optional):**
   ```bash
   node import_test_data.js
   ```

5. **Start the development servers:**
   - Option 1 - Separately:
     - Terminal 1 (Frontend): `npm run dev`
     - Terminal 2 (Backend): `npm run server`
   - Option 2 - Simultaneously: `npm run dev:all` (requires concurrently)

## SignalHouse Messaging Integration

The messaging system is prepared for SignalHouse integration. To enable:

1. Get your API key from [SignalHouse](https://signalhouse.io)
2. Add to `.env.local`:
   ```
   SIGNALHOUSE_API_KEY=your_api_key_here
   SIGNALHOUSE_API_URL=https://devapi.signalhouse.io
   ```
3. The service in `/server/services/signalhouse.js` handles all messaging API calls

## Environment Variables

Create a `.env.local` file:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
SIGNALHOUSE_API_KEY=your_key_here
```

## Project Structure

- `/src` - Next.js frontend application
  - `/app` - App router pages
  - `/components` - React components
  - `/context` - Auth context
- `/server` - Express.js backend
  - `/models` - MongoDB schemas
  - `/services` - External service integrations
- `/uploads` - Uploaded product images

## API Endpoints

### Products
- `GET /products` - List all products
- `GET /products/search` - Search with filters (q, category, condition, minPrice, maxPrice, sort)
- `GET /product/:id` - Get single product
- `POST /newProduct` - Create product
- `PATCH /product/:id` - Update product
- `DELETE /product/:id` - Delete product
- `POST /product/:id/view` - Increment view count

### Users
- `GET /user/:id` - Get user profile
- `PATCH /user/:id` - Update profile
- `POST /user/:id/save-product` - Save a product
- `POST /user/:id/unsave-product` - Unsave a product
- `POST /register` - Register new user
- `POST /users/verify-login` - Verify login credentials

### Messaging
- `GET /conversations/:userId` - Get user's conversations
- `POST /conversations` - Create conversation
- `GET /conversation/:id/messages` - Get messages
- `POST /conversation/:id/messages` - Send message
- `POST /conversation/:id/read` - Mark messages as read

### Offers
- `GET /offers/user/:userId` - Get user's offers
- `POST /offers` - Create offer
- `PATCH /offers/:id` - Update offer status (accept/decline)

### Orders
- `GET /orders/user/:userId` - Get user's orders
- `PATCH /orders/:id` - Update order status

### Notifications
- `GET /notifications/:userId` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

### Reviews
- `GET /reviews/user/:userId` - Get user's reviews
- `POST /reviews` - Create review

### Reports
- `POST /reports` - Create report

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category

### File Upload
- `POST /upload` - Upload images (multipart/form-data)