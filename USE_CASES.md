# ShopRedLive - Master Use Case List

**Application:** ShopRedLive - Secondhand Marketplace for University Students  
**Version:** 0.1.0  
**Technology Stack:** Next.js 16, React 19, MongoDB (Mongoose 8), Express.js 5, Material-UI 7  
**Last Updated:** December 14, 2025

---

## Table of Contents

1. [Frontend Use Cases (UC-FE-001 to UC-FE-017)](#frontend-use-cases)
2. [Server/API Use Cases (UC-API-001 to UC-API-025)](#serverapi-use-cases)
3. [Database Use Cases (UC-DB-001 to UC-DB-010)](#database-use-cases)

---

## Frontend Use Cases

### UC-FE-001: User Login

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-001 |
| **Name** | User Login |
| **Description** | Allows a registered user to authenticate and access the marketplace. The user enters their email and password credentials. Upon successful validation, the user is redirected to the home page with full access to marketplace features. Includes a demo login option for testing purposes. |
| **Actors** | Registered User, Guest User (for demo login) |
| **Triggers** | User navigates to `/login` page and submits login form |
| **Preconditions** | User has a registered account (or uses demo login) |
| **Postconditions** | User session is established, user data stored in localStorage, redirect to home page |
| **Main Flow** | 1. User navigates to login page<br>2. User enters email and password<br>3. User clicks "Sign In" button<br>4. System validates credentials<br>5. System stores user data in AuthContext and localStorage<br>6. System redirects to home page |
| **Exceptions** | - Empty fields: "Please fill in all fields" error displayed<br>- Invalid credentials: Error message shown |
| **Goal** | Authenticate user and establish session for marketplace access |
| **APIs/Libraries** | React useState, useRouter (Next.js), AuthContext (custom), MUI components (Card, TextField, Button), localStorage API |
| **UML Type** | **Sequence UML** |

---

### UC-FE-002: User Registration (Sign Up)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-002 |
| **Name** | User Registration |
| **Description** | Enables new users to create an account on the marketplace. User provides full name, email, password, and password confirmation. System validates input, creates a new user session, and redirects to the home page. |
| **Actors** | Guest User |
| **Triggers** | User navigates to `/signup` page and submits registration form |
| **Preconditions** | User does not have an existing account with the email |
| **Postconditions** | New user account created, session established, user redirected to home |
| **Main Flow** | 1. User navigates to signup page<br>2. User enters name, email, password, confirm password<br>3. User submits form<br>4. System validates all fields and password match<br>5. System creates user data object<br>6. System logs user in via AuthContext<br>7. System redirects to home page |
| **Exceptions** | - Empty fields: "Please fill in all fields"<br>- Password mismatch: "Passwords do not match"<br>- Short password: "Password must be at least 6 characters" |
| **Goal** | Create new user account and grant marketplace access |
| **APIs/Libraries** | React useState, useRouter (Next.js), AuthContext, MUI components, ProtectedRoute component |
| **UML Type** | **Sequence UML** |

---

### UC-FE-003: User Logout

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-003 |
| **Name** | User Logout |
| **Description** | Allows authenticated users to terminate their session and log out of the marketplace. Clears user data from context and localStorage. |
| **Actors** | Authenticated User |
| **Triggers** | User clicks "Logout" button in the header |
| **Preconditions** | User is currently logged in |
| **Postconditions** | User session terminated, localStorage cleared, user redirected if not on home page |
| **Main Flow** | 1. User clicks logout button<br>2. System calls logout() from AuthContext<br>3. System clears user state<br>4. System removes user from localStorage<br>5. If not on home page, redirect to home |
| **Exceptions** | None |
| **Goal** | Securely terminate user session |
| **APIs/Libraries** | AuthContext (logout function), useRouter (Next.js), localStorage API |
| **UML Type** | **Activity UML** |

---

### UC-FE-004: Browse Product Listings (Home Page)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-004 |
| **Name** | Browse Product Listings |
| **Description** | Displays all active product listings on the home page in a responsive grid layout. Users can view product cards showing images, names, prices, categories, and conditions. Supports filtering by search query and category. |
| **Actors** | Authenticated User |
| **Triggers** | User navigates to home page (`/`) |
| **Preconditions** | User is authenticated |
| **Postconditions** | Product grid displayed with available listings |
| **Main Flow** | 1. User accesses home page<br>2. System checks authentication<br>3. System fetches products from `/api/products`<br>4. System renders Header, Sidebar, and ProductGrid<br>5. Products displayed in responsive grid (5 per row on large screens)<br>6. Each product shows as a clickable ProductCard |
| **Exceptions** | - Not authenticated: Redirect to login<br>- API failure: Falls back to mock data |
| **Goal** | Allow users to discover and browse available products |
| **APIs/Libraries** | Next.js App Router, Fetch API, MUI Grid/Container, ProductCard component, AuthContext |
| **UML Type** | **Sequence UML** |

---

### UC-FE-005: Search Products

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-005 |
| **Name** | Search Products |
| **Description** | Enables users to search for products by name using a debounced search input in the header. Search query is reflected in URL parameters and filters the product grid in real-time. |
| **Actors** | Authenticated User |
| **Triggers** | User types in the search field in the header |
| **Preconditions** | User is on a page with the Header component |
| **Postconditions** | URL updated with search query, product grid filtered to matching items |
| **Main Flow** | 1. User types search term in search field<br>2. 300ms debounce timeout triggered<br>3. URL query parameter `q` updated<br>4. ProductGrid filters products by name match (case-insensitive)<br>5. Filtered results displayed |
| **Exceptions** | - Empty search: Shows all products<br>- No matches: Empty grid displayed |
| **Goal** | Help users find specific products quickly |
| **APIs/Libraries** | React useState/useEffect/useRef, useSearchParams, useRouter, usePathname (Next.js), MUI TextField with SearchIcon |
| **UML Type** | **Activity UML** |

---

### UC-FE-006: Filter Products by Category

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-006 |
| **Name** | Filter Products by Category |
| **Description** | Allows users to filter product listings by selecting a category from the sidebar. Categories include: All, Electronics, Books, Furniture, Clothing, Sports, Tickets. |
| **Actors** | Authenticated User |
| **Triggers** | User clicks a category in the Sidebar component |
| **Preconditions** | User is on home page with products loaded |
| **Postconditions** | URL updated with category parameter, product grid filtered |
| **Main Flow** | 1. User views sidebar with category list<br>2. User clicks desired category<br>3. URL query parameter `category` updated<br>4. ProductGrid filters products by category match<br>5. Filtered results displayed<br>6. Selected category highlighted in sidebar |
| **Exceptions** | - "All" selected: Category filter removed, all products shown |
| **Goal** | Enable category-based product discovery |
| **APIs/Libraries** | Next.js Link, useSearchParams, MUI Paper/List/ListItemButton/Typography |
| **UML Type** | **Activity UML** |

---

### UC-FE-007: View Product Details

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-007 |
| **Name** | View Product Details |
| **Description** | Displays comprehensive information about a specific product including images, name, price, description, condition, category, seller information, listing date, and view count. Includes options like "Make Offer" and delivery preferences. |
| **Actors** | Authenticated User |
| **Triggers** | User clicks on a ProductCard from the grid |
| **Preconditions** | Product exists in the system |
| **Postconditions** | Product detail page displayed with full information |
| **Main Flow** | 1. User clicks product card<br>2. System navigates to `/listing/[id]`<br>3. ListingDetailPage extracts product ID from params<br>4. ProductDetail component fetches from `/api/products/[id]`<br>5. Full product information rendered with image/placeholder<br>6. Seller info, chips, and Make Offer button displayed |
| **Exceptions** | - Product not found: Error message shown<br>- API failure: Falls back to mock product data |
| **Goal** | Provide complete product information for purchase decision |
| **APIs/Libraries** | Next.js useParams, Fetch API, MUI Card/CardMedia/Chip/Typography/Button/Box |
| **UML Type** | **Sequence UML** |

---

### UC-FE-008: Create Product Listing (Sell Item)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-008 |
| **Name** | Create Product Listing |
| **Description** | Enables authenticated users to list items for sale. Users fill out a comprehensive form with item title, price, description, category, condition, and delivery options (negotiable, meetup, shipping). |
| **Actors** | Authenticated Seller |
| **Triggers** | User navigates to `/sell` page and submits the listing form |
| **Preconditions** | User is authenticated |
| **Postconditions** | New product created in database, form reset |
| **Main Flow** | 1. User navigates to Sell page<br>2. ProtectedRoute verifies authentication<br>3. User fills form fields (name, price, description, category, condition)<br>4. User toggles delivery options<br>5. User submits form<br>6. System POSTs to `/api/products`<br>7. Success: Alert shown, form reset<br>8. Failure: Error alert shown |
| **Exceptions** | - Not authenticated: Redirect to login<br>- Missing required fields: Validation error<br>- API error: "Error listing item" alert |
| **Goal** | Allow sellers to list items for sale on the marketplace |
| **APIs/Libraries** | React useState, Fetch API (POST), MUI TextField/Select/FormControl/Switch/Chip/Button, ProtectedRoute |
| **UML Type** | **Sequence UML** |

---

### UC-FE-009: View and Manage Messages

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-009 |
| **Name** | View and Manage Messages |
| **Description** | Provides a messaging interface for users to communicate about products. Shows conversation threads with other users, supports reading messages and sending new messages. Displays unread indicators and timestamps. |
| **Actors** | Authenticated User (Buyer/Seller) |
| **Triggers** | User navigates to `/messages` page |
| **Preconditions** | User is authenticated |
| **Postconditions** | Message threads displayed, messages can be sent |
| **Main Flow** | 1. User navigates to Messages page<br>2. ProtectedRoute verifies authentication<br>3. Thread list displayed on left<br>4. User selects a thread<br>5. Messages for thread displayed<br>6. User types and sends new message<br>7. Message added to conversation |
| **Exceptions** | - Not authenticated: Prompt to log in displayed<br>- No threads: Empty state shown |
| **Goal** | Facilitate communication between buyers and sellers |
| **APIs/Libraries** | React useState, AuthContext, MUI Paper/List/Avatar/TextField/Button/IconButton, SendIcon |
| **UML Type** | **Sequence UML** |

---

### UC-FE-010: View User Profile

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-010 |
| **Name** | View User Profile |
| **Description** | Displays the authenticated user's profile information including avatar, name, email, bio, and location. Provides navigation tabs for profile, listings, purchases, and settings. |
| **Actors** | Authenticated User |
| **Triggers** | User navigates to `/profile` page or clicks profile button in header |
| **Preconditions** | User is authenticated |
| **Postconditions** | Profile page displayed with user information |
| **Main Flow** | 1. User navigates to Profile page<br>2. ProtectedRoute verifies authentication<br>3. Profile component loads user data from AuthContext<br>4. Avatar, name, email displayed<br>5. Tab navigation available (profile, listings, purchases, settings) |
| **Exceptions** | - Not authenticated: Prompt to log in displayed |
| **Goal** | Allow users to view their account information |
| **APIs/Libraries** | React useState, AuthContext, MUI Paper/Avatar/Typography/Divider/List/TextField/Button/Grid |
| **UML Type** | **Activity UML** |

---

### UC-FE-011: Edit User Profile

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-011 |
| **Name** | Edit User Profile |
| **Description** | Allows authenticated users to edit their profile information including name, email, bio, and location. Toggle between view and edit mode. |
| **Actors** | Authenticated User |
| **Triggers** | User clicks edit button on profile page |
| **Preconditions** | User is authenticated and on profile page |
| **Postconditions** | Profile information updated |
| **Main Flow** | 1. User clicks edit icon<br>2. Form fields become editable<br>3. User modifies name, email, bio, location<br>4. User clicks save<br>5. Profile data updated<br>6. Success alert shown<br>7. View mode restored |
| **Exceptions** | - Validation errors: Form shows errors |
| **Goal** | Allow users to update their account information |
| **APIs/Libraries** | React useState, MUI TextField/Button/InputAdornment, EditIcon/EmailIcon/LocationOnIcon |
| **UML Type** | **Activity UML** |

---

### UC-FE-012: Route Protection (Authentication Guard)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-012 |
| **Name** | Route Protection |
| **Description** | Protects authenticated routes from unauthorized access and redirects logged-in users away from public-only routes (login/signup). Implements bidirectional route guarding. |
| **Actors** | System, All Users |
| **Triggers** | User attempts to access a protected or public-only route |
| **Preconditions** | None |
| **Postconditions** | User either views the page or is redirected appropriately |
| **Main Flow** | 1. User navigates to a route<br>2. ProtectedRoute checks `requireAuth` prop<br>3. If `requireAuth=true` and no user: redirect to `/login`<br>4. If `requireAuth=false` and user exists: redirect to `/`<br>5. Otherwise: render children components |
| **Exceptions** | - Loading state: Show loading spinner |
| **Goal** | Ensure proper access control throughout the application |
| **APIs/Libraries** | React useEffect, useRouter (Next.js), AuthContext, MUI Box/CircularProgress |
| **UML Type** | **Activity UML** |

---

### UC-FE-013: Persistent Authentication State

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-013 |
| **Name** | Persistent Authentication State |
| **Description** | Maintains user authentication state across page refreshes and browser sessions using localStorage. AuthContext initializes from stored data on app load. |
| **Actors** | System |
| **Triggers** | Application loads or page refreshes |
| **Preconditions** | User previously logged in |
| **Postconditions** | User remains authenticated without re-login |
| **Main Flow** | 1. App initializes AuthProvider<br>2. useEffect checks localStorage for 'user'<br>3. If found: Parse JSON and set user state<br>4. If not found: User remains null<br>5. Loading state set to false |
| **Exceptions** | - JSON parse error: Error logged, user remains null |
| **Goal** | Provide seamless user experience across sessions |
| **APIs/Libraries** | React createContext/useContext/useState/useEffect, localStorage API, JSON.parse/stringify |
| **UML Type** | **Activity UML** |

---

### UC-FE-014: Product Card Display

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-014 |
| **Name** | Product Card Display |
| **Description** | Renders individual product information in a card format with image, category chip, condition chip, name, price, and negotiable indicator. Supports image fallback and hover effects. |
| **Actors** | System |
| **Triggers** | ProductGrid maps products array |
| **Preconditions** | Product data available |
| **Postconditions** | Interactive product card rendered |
| **Main Flow** | 1. ProductCard receives product prop<br>2. Extract category name (handles object or string)<br>3. Map condition to display label<br>4. Render card with image or gradient placeholder<br>5. Display category and condition chips<br>6. Show name, price, seller info<br>7. Link to detail page on click |
| **Exceptions** | - Missing image: Show gradient placeholder with product name<br>- Image load error: Fallback to placeholder image |
| **Goal** | Provide consistent, attractive product previews |
| **APIs/Libraries** | Next.js Link, MUI Card/CardActionArea/CardContent/CardMedia/Chip/Typography/Box |
| **UML Type** | **Activity UML** |

---

### UC-FE-015: Responsive Layout with Header

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-015 |
| **Name** | Responsive Layout with Header |
| **Description** | Provides consistent navigation header across all pages with logo, search bar, and navigation buttons. Dynamically shows login/signup or profile/logout based on auth state. |
| **Actors** | All Users |
| **Triggers** | Any page load |
| **Preconditions** | None |
| **Postconditions** | Header rendered with appropriate navigation options |
| **Main Flow** | 1. Header component renders<br>2. Display ShopRedLive logo (links to home)<br>3. Render search field with debounce<br>4. Show Sell and Messages buttons<br>5. If authenticated: Show profile name and logout<br>6. If not authenticated: Show Login and Sign Up buttons |
| **Exceptions** | None |
| **Goal** | Provide consistent navigation and branding |
| **APIs/Libraries** | Next.js Link/useSearchParams/useRouter/usePathname, React useState/useEffect/useRef, AuthContext, MUI AppBar/Toolbar/Typography/TextField/Button/InputAdornment |
| **UML Type** | **Activity UML** |

---

### UC-FE-016: Theme and Styling

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-016 |
| **Name** | Theme and Styling |
| **Description** | Applies consistent dark theme styling across the application using MUI theming system and Emotion CSS-in-JS. Provides cohesive visual design with primary/secondary colors. |
| **Actors** | System |
| **Triggers** | Application initialization |
| **Preconditions** | None |
| **Postconditions** | Consistent styling applied to all components |
| **Main Flow** | 1. Theme defined in src/theme.js<br>2. Theme provider wraps application<br>3. Components access theme via sx prop<br>4. Dark mode colors (#121212, #1e1e1e) applied<br>5. Primary color (#0654ba) used for actions |
| **Exceptions** | None |
| **Goal** | Ensure visual consistency and modern aesthetics |
| **APIs/Libraries** | @mui/material, @emotion/react, @emotion/styled, @emotion/cache, @mui/material-nextjs |
| **UML Type** | **Activity UML** |

---

### UC-FE-017: Make Offer on Product

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-FE-017 |
| **Name** | Make Offer on Product |
| **Description** | Allows buyers to initiate a price offer on a product listing. Button displayed on product detail page for negotiable items. |
| **Actors** | Authenticated Buyer |
| **Triggers** | User clicks "Make Offer" button on product detail page |
| **Preconditions** | User is authenticated, product is active and negotiable |
| **Postconditions** | Offer creation flow initiated |
| **Main Flow** | 1. User views product detail<br>2. User clicks "Make Offer" button<br>3. (Future: Offer modal/form displayed)<br>4. (Future: Offer submitted to API) |
| **Exceptions** | - Product not negotiable: Button may be hidden<br>- User not authenticated: Redirect to login |
| **Goal** | Enable price negotiation between buyers and sellers |
| **APIs/Libraries** | MUI Button (styled with custom colors) |
| **UML Type** | **Sequence UML** |

---

## Server/API Use Cases

### UC-API-001: Fetch All Products

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-001 |
| **Name** | Fetch All Products |
| **Description** | Retrieves all product listings from the database with populated seller, buyer, and category information. Serves as the main data source for the product grid. |
| **Actors** | Next.js API Route, Express Server |
| **Triggers** | GET request to `/api/products` (Next.js) or `/products` (Express) |
| **Preconditions** | MongoDB connection established |
| **Postconditions** | Array of products returned as JSON |
| **Main Flow** | 1. Request received at API endpoint<br>2. Next.js route proxies to Express backend<br>3. Express queries ProductModel.find()<br>4. Populate seller, buyer, category references<br>5. Return products array as JSON |
| **Exceptions** | - Database error: 500 status with error message |
| **Goal** | Provide product data for frontend display |
| **APIs/Libraries** | Next.js NextResponse, Express, Mongoose (find, populate, exec), Fetch API |
| **UML Type** | **Sequence UML** |

---

### UC-API-002: Fetch Single Product by ID

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-002 |
| **Name** | Fetch Single Product by ID |
| **Description** | Retrieves detailed information for a specific product by its MongoDB ObjectId. Includes all product fields with populated references. |
| **Actors** | Next.js API Route, Express Server |
| **Triggers** | GET request to `/api/products/[id]` or `/product/:id` |
| **Preconditions** | Valid product ID provided |
| **Postconditions** | Product object returned or 404 error |
| **Main Flow** | 1. Extract product ID from URL params<br>2. Query ProductModel.findById(id)<br>3. Populate seller, buyer, category<br>4. Return product as JSON |
| **Exceptions** | - Product not found: 404 status<br>- Invalid ID format: 500 status<br>- Database error: 500 status |
| **Goal** | Provide detailed product data for detail page |
| **APIs/Libraries** | Next.js NextResponse/params, Express req.params, Mongoose findById/populate |
| **UML Type** | **Sequence UML** |

---

### UC-API-003: Create New Product

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-003 |
| **Name** | Create New Product |
| **Description** | Creates a new product listing in the database. Validates required fields, creates product document, and updates seller's products array. |
| **Actors** | Next.js API Route, Express Server, Authenticated Seller |
| **Triggers** | POST request to `/api/products` or `/newProduct` |
| **Preconditions** | Valid product data with name, description, and price |
| **Postconditions** | New product saved to database, seller's products updated |
| **Main Flow** | 1. Parse JSON body from request<br>2. Validate required fields (name, description, price)<br>3. Create new ProductModel instance<br>4. Set defaults for optional fields<br>5. Save product to database<br>6. Update seller's products array<br>7. Return created product (201 status) |
| **Exceptions** | - Missing required fields: 400 status<br>- Database save error: 500 status |
| **Goal** | Persist new product listings |
| **APIs/Libraries** | Next.js NextResponse, Express, Mongoose (new Model, save, updateOne), bcrypt (in server) |
| **UML Type** | **Sequence UML** |

---

### UC-API-004: Update Product

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-004 |
| **Name** | Update Product |
| **Description** | Updates an existing product's information. Only provided fields are updated, preserving other values. Includes schema validation. |
| **Actors** | Next.js API Route, Express Server, Product Owner |
| **Triggers** | PATCH request to `/api/products/[id]` or `/product/:id` |
| **Preconditions** | Valid product ID, valid update data |
| **Postconditions** | Product updated in database |
| **Main Flow** | 1. Extract product ID from params<br>2. Parse update data from body<br>3. Call findByIdAndUpdate with $set<br>4. Enable runValidators option<br>5. Return updated product |
| **Exceptions** | - Product not found: 404 status<br>- Validation error: 500 status |
| **Goal** | Allow sellers to modify their listings |
| **APIs/Libraries** | Next.js NextResponse, Express, Mongoose findByIdAndUpdate |
| **UML Type** | **Sequence UML** |

---

### UC-API-005: Delete Product

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-005 |
| **Name** | Delete Product |
| **Description** | Removes a product listing from the database and cleans up references by removing the product from the seller's products array. |
| **Actors** | Next.js API Route, Express Server, Product Owner |
| **Triggers** | DELETE request to `/api/products/[id]` or `/product/:id` |
| **Preconditions** | Valid product ID, user authorized to delete |
| **Postconditions** | Product removed from database and user's products array |
| **Main Flow** | 1. Extract product ID from params<br>2. Call findByIdAndDelete<br>3. Update seller's products array ($pull)<br>4. Return deleted product |
| **Exceptions** | - Product not found: 404 status<br>- Database error: 500 status |
| **Goal** | Allow sellers to remove their listings |
| **APIs/Libraries** | Next.js NextResponse, Express, Mongoose findByIdAndDelete/updateOne |
| **UML Type** | **Sequence UML** |

---

### UC-API-006: User Registration (Server)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-006 |
| **Name** | User Registration (Server) |
| **Description** | Creates a new user account with encrypted password. Handles profile picture, initializes karma, and sets up empty product arrays. |
| **Actors** | Express Server, New User |
| **Triggers** | POST request to `/register` |
| **Preconditions** | Valid registration data provided |
| **Postconditions** | New user saved with hashed password |
| **Main Flow** | 1. Extract user data (first, last, username, email, password, img)<br>2. Generate password hash with bcrypt (salt rounds: 10)<br>3. Create new UserModel with all fields<br>4. Set defaults (isAdmin: false, karma: 100)<br>5. Save user to database<br>6. Return success response |
| **Exceptions** | - Duplicate email/username: Error logged<br>- Database error: Error logged |
| **Goal** | Securely create new user accounts |
| **APIs/Libraries** | Express, Mongoose, bcrypt (genSalt, hash) |
| **UML Type** | **Sequence UML** |

---

### UC-API-007: User Login Verification

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-007 |
| **Name** | User Login Verification |
| **Description** | Authenticates user credentials by verifying email exists and comparing password hash using bcrypt. Returns user ID on success. |
| **Actors** | Express Server, Registered User |
| **Triggers** | POST request to `/users/verify-login` |
| **Preconditions** | User account exists |
| **Postconditions** | Authentication result returned |
| **Main Flow** | 1. Extract email and password from body<br>2. Find user by email<br>3. If not found: return validEmail: false<br>4. Compare password with stored hash<br>5. If match: return validEmail: true, validPassword: true, userId<br>6. If no match: return validPassword: false |
| **Exceptions** | - User not found: Invalid email response<br>- Wrong password: Invalid password response |
| **Goal** | Securely verify user credentials |
| **APIs/Libraries** | Express, Mongoose findOne, bcrypt.compare |
| **UML Type** | **Sequence UML** |

---

### UC-API-008: Fetch All Users

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-008 |
| **Name** | Fetch All Users |
| **Description** | Retrieves all user accounts with populated product references. Available through both Next.js API and Express endpoints. |
| **Actors** | Next.js API Route, Express Server, Admin |
| **Triggers** | GET request to `/api/users` or `/users` |
| **Preconditions** | MongoDB connection active |
| **Postconditions** | Array of user objects returned |
| **Main Flow** | 1. Query UserModel.find()<br>2. Populate products and savedProducts<br>3. Return users array as JSON |
| **Exceptions** | - Database error: 500 status |
| **Goal** | Provide user data for admin or system use |
| **APIs/Libraries** | Next.js NextResponse, Express, Mongoose find/populate |
| **UML Type** | **Sequence UML** |

---

### UC-API-009: Fetch Single User by ID

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-009 |
| **Name** | Fetch Single User by ID |
| **Description** | Retrieves detailed user information by MongoDB ObjectId including their product listings and saved products. |
| **Actors** | Express Server |
| **Triggers** | GET request to `/user/:id` |
| **Preconditions** | Valid user ID provided |
| **Postconditions** | User object returned |
| **Main Flow** | 1. Extract user ID from params<br>2. Query UserModel.findById(id)<br>3. Populate products and savedProducts<br>4. Return user as JSON |
| **Exceptions** | - User not found: null returned |
| **Goal** | Provide user profile data |
| **APIs/Libraries** | Express, Mongoose findById/populate |
| **UML Type** | **Sequence UML** |

---

### UC-API-010: Create User (API Route)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-010 |
| **Name** | Create User (API Route) |
| **Description** | Creates a new user through the Next.js API route with generated ID. Simplified version for frontend use. |
| **Actors** | Next.js API Route |
| **Triggers** | POST request to `/api/users` |
| **Preconditions** | Valid user data provided |
| **Postconditions** | User added to in-memory database |
| **Main Flow** | 1. Parse JSON body<br>2. Generate unique ID with prefix 'user'<br>3. Create user object with defaults<br>4. Push to db.users array<br>5. Return user (201 status) |
| **Exceptions** | - JSON parse error: Empty object used |
| **Goal** | Create users through API layer |
| **APIs/Libraries** | Next.js NextResponse, generateId utility, readJson utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-011: Fetch Categories

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-011 |
| **Name** | Fetch Categories |
| **Description** | Retrieves all product categories from the database for use in filtering and product creation forms. |
| **Actors** | Next.js API Route |
| **Triggers** | GET request to `/api/categories` |
| **Preconditions** | Categories exist in database |
| **Postconditions** | Array of category objects returned |
| **Main Flow** | 1. Query db.categories<br>2. Return categories array as JSON |
| **Exceptions** | None |
| **Goal** | Provide category options for UI |
| **APIs/Libraries** | Next.js NextResponse |
| **UML Type** | **Activity UML** |

---

### UC-API-012: Manage Conversations

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-012 |
| **Name** | Manage Conversations |
| **Description** | CRUD operations for conversation threads between users about products. Supports creating new conversations and retrieving existing ones. |
| **Actors** | Next.js API Route, Authenticated Users |
| **Triggers** | GET/POST requests to `/api/conversations`, GET/PATCH/DELETE to `/api/conversations/[id]` |
| **Preconditions** | Users involved exist |
| **Postconditions** | Conversation created/retrieved/updated/deleted |
| **Main Flow** | **GET all:** Return all conversations<br>**POST:** Create conversation with participants, productId, timestamp<br>**GET by ID:** Find and return specific conversation<br>**PATCH:** Update conversation properties<br>**DELETE:** Remove conversation |
| **Exceptions** | - Conversation not found: 404 status |
| **Goal** | Enable messaging between users |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-013: Manage Messages

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-013 |
| **Name** | Manage Messages |
| **Description** | Creates and retrieves messages within conversations. Each message linked to a conversation and sender. |
| **Actors** | Next.js API Route, Authenticated Users |
| **Triggers** | GET/POST requests to `/api/messages` |
| **Preconditions** | Valid conversation exists |
| **Postconditions** | Message created or messages retrieved |
| **Main Flow** | **GET:** Return all messages<br>**POST:** Create message with conversationId, senderId, body, timestamp |
| **Exceptions** | - Invalid conversation: Error handling needed |
| **Goal** | Store and retrieve conversation messages |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-014: Manage Offers

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-014 |
| **Name** | Manage Offers |
| **Description** | Full CRUD for price offers on products. Supports creating offers, viewing all offers, updating offer status (accept/decline), and withdrawing offers. |
| **Actors** | Next.js API Route, Buyers, Sellers |
| **Triggers** | GET/POST to `/api/offers`, GET/PATCH/DELETE to `/api/offers/[id]` |
| **Preconditions** | Product and users exist |
| **Postconditions** | Offer created/retrieved/updated/deleted |
| **Main Flow** | **GET all:** Return all offers<br>**POST:** Create offer with productId, buyerId, amount, status: 'pending'<br>**GET by ID:** Find specific offer<br>**PATCH:** Update offer (status changes)<br>**DELETE:** Remove offer |
| **Exceptions** | - Offer not found: 404 status |
| **Goal** | Facilitate price negotiation |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-015: Manage Orders

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-015 |
| **Name** | Manage Orders |
| **Description** | CRUD operations for orders representing completed transactions. Tracks buyer, seller, price, status (pending_meetup, completed, cancelled), and meetup details. |
| **Actors** | Next.js API Route, Buyers, Sellers |
| **Triggers** | GET/POST to `/api/orders`, GET/PATCH/DELETE to `/api/orders/[id]` |
| **Preconditions** | Offer accepted, product available |
| **Postconditions** | Order created/updated/deleted |
| **Main Flow** | **GET all:** Return all orders<br>**POST:** Create order with productId, buyerId, sellerId, price, status, meetup details<br>**GET by ID:** Find specific order<br>**PATCH:** Update order status<br>**DELETE:** Cancel/remove order |
| **Exceptions** | - Order not found: 404 status |
| **Goal** | Track completed transactions and meetups |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-016: Manage Reviews

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-016 |
| **Name** | Manage Reviews |
| **Description** | Creates and retrieves user reviews after completed transactions. Reviews include rating (1-5), comment, and link to order. |
| **Actors** | Next.js API Route, Transaction Participants |
| **Triggers** | GET/POST requests to `/api/reviews` |
| **Preconditions** | Order completed |
| **Postconditions** | Review created or reviews retrieved |
| **Main Flow** | **GET:** Return all reviews<br>**POST:** Create review with reviewerId, revieweeId, rating, comment, timestamp |
| **Exceptions** | - Invalid rating: Validation error |
| **Goal** | Build trust through user ratings |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-017: Manage Reports

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-017 |
| **Name** | Manage Reports |
| **Description** | Allows users to report other users or products for policy violations. Tracks reporter, target, reason, details, and status. |
| **Actors** | Next.js API Route, Authenticated Users |
| **Triggers** | GET/POST requests to `/api/reports` |
| **Preconditions** | User authenticated |
| **Postconditions** | Report created for admin review |
| **Main Flow** | **GET:** Return all reports<br>**POST:** Create report with reporterId, targetUserId/targetProductId, reason, details, status: 'open' |
| **Exceptions** | - Missing reason: Validation needed |
| **Goal** | Enable community moderation |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-018: Manage Notifications

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-018 |
| **Name** | Manage Notifications |
| **Description** | Creates and retrieves user notifications for system events (messages, offers, orders). Supports different notification types. |
| **Actors** | Next.js API Route, System |
| **Triggers** | GET/POST requests to `/api/notifications` |
| **Preconditions** | Recipient user exists |
| **Postconditions** | Notification created or notifications retrieved |
| **Main Flow** | **GET:** Return all notifications<br>**POST:** Create notification with recipientId, type (message/offer/order/system), title, body |
| **Exceptions** | None |
| **Goal** | Keep users informed of activity |
| **APIs/Libraries** | Next.js NextResponse, generateId utility |
| **UML Type** | **Sequence UML** |

---

### UC-API-019: Fetch Products by Date (Newest)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-019 |
| **Name** | Fetch Products by Date (Newest) |
| **Description** | Retrieves active (unsold) products sorted by posting date, newest first. Used for "New Arrivals" features. |
| **Actors** | Express Server |
| **Triggers** | GET request to `/home/new` |
| **Preconditions** | Products exist in database |
| **Postconditions** | Sorted products array returned |
| **Main Flow** | 1. Query products where soldOrNot: false<br>2. Sort by postedDate descending<br>3. Return sorted array |
| **Exceptions** | - Database error: Error status |
| **Goal** | Display newest listings first |
| **APIs/Libraries** | Express, Mongoose find/sort |
| **UML Type** | **Activity UML** |

---

### UC-API-020: Fetch Products by Date (Oldest)

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-020 |
| **Name** | Fetch Products by Date (Oldest) |
| **Description** | Retrieves active products sorted by posting date, oldest first. Useful for displaying items that have been listed longest. |
| **Actors** | Express Server |
| **Triggers** | GET request to `/home/old` |
| **Preconditions** | Products exist in database |
| **Postconditions** | Sorted products array returned |
| **Main Flow** | 1. Query products where soldOrNot: false<br>2. Sort by postedDate ascending<br>3. Return sorted array |
| **Exceptions** | - Database error: Error status |
| **Goal** | Display oldest listings first |
| **APIs/Libraries** | Express, Mongoose find/sort |
| **UML Type** | **Activity UML** |

---

### UC-API-021: Fetch Full Database

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-021 |
| **Name** | Fetch Full Database |
| **Description** | Retrieves all products and users with full population of references. Useful for debugging and admin purposes. |
| **Actors** | Express Server, Admin |
| **Triggers** | GET request to `/db` |
| **Preconditions** | Admin access or development mode |
| **Postconditions** | Complete database snapshot returned |
| **Main Flow** | 1. Fetch all products with populated references<br>2. Fetch all users with populated products<br>3. Return combined response object |
| **Exceptions** | - Database error: 500 status |
| **Goal** | Provide database overview |
| **APIs/Libraries** | Express, Mongoose find/populate |
| **UML Type** | **Sequence UML** |

---

### UC-API-022: Verify User Existence

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-022 |
| **Name** | Verify User Existence |
| **Description** | Checks if a user with given name and email combination exists in the database. Used for registration validation. |
| **Actors** | Express Server |
| **Triggers** | GET request to `/users/verify` with query params |
| **Preconditions** | Name and email provided as query params |
| **Postconditions** | Boolean result returned |
| **Main Flow** | 1. Extract name and email from query<br>2. Query UserModel.findOne with both fields<br>3. Return {ans: true} if found<br>4. Return {ans: false} if not found |
| **Exceptions** | None |
| **Goal** | Prevent duplicate registrations |
| **APIs/Libraries** | Express, Mongoose findOne |
| **UML Type** | **Activity UML** |

---

### UC-API-023: Generate Unique ID

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-023 |
| **Name** | Generate Unique ID |
| **Description** | Utility function that generates unique identifiers for database objects using random strings and timestamps. |
| **Actors** | System |
| **Triggers** | Called during entity creation |
| **Preconditions** | Prefix string provided |
| **Postconditions** | Unique ID string returned |
| **Main Flow** | 1. Generate random string (6 chars, base36)<br>2. Get timestamp in base36 (last 4 chars)<br>3. Combine: prefix-random-timestamp<br>4. Return ID string |
| **Exceptions** | None |
| **Goal** | Ensure unique identifiers for all entities |
| **APIs/Libraries** | JavaScript Math.random, Date.now, toString(36) |
| **UML Type** | **Activity UML** |

---

### UC-API-024: Parse JSON Request Body

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-024 |
| **Name** | Parse JSON Request Body |
| **Description** | Utility function that safely parses JSON from request body with error handling. Returns empty object on parse failure. |
| **Actors** | System |
| **Triggers** | POST/PATCH requests to API routes |
| **Preconditions** | Request object provided |
| **Postconditions** | Parsed JSON object or empty object returned |
| **Main Flow** | 1. Attempt to parse request.json()<br>2. Return parsed body if successful<br>3. Return empty object on error |
| **Exceptions** | - JSON parse error: Returns {} |
| **Goal** | Safe request body parsing |
| **APIs/Libraries** | JavaScript async/await, try/catch |
| **UML Type** | **Activity UML** |

---

### UC-API-025: Password Encryption

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-API-025 |
| **Name** | Password Encryption |
| **Description** | Hashes user passwords using bcrypt with salt for secure storage. Used during registration and password changes. |
| **Actors** | Express Server |
| **Triggers** | User registration or password update |
| **Preconditions** | Plain text password provided |
| **Postconditions** | Hashed password returned |
| **Main Flow** | 1. Generate salt (10 rounds)<br>2. Hash password with salt<br>3. Return hashed password |
| **Exceptions** | - bcrypt error: Error thrown |
| **Goal** | Secure password storage |
| **APIs/Libraries** | bcrypt (genSalt, hash) |
| **UML Type** | **Activity UML** |

---

## Database Use Cases

### UC-DB-001: User Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-001 |
| **Name** | User Schema |
| **Description** | Defines the MongoDB schema for user documents including authentication, profile, and relationship fields. Supports password validation and virtual URL generation. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | User document creation/update |
| **Preconditions** | Mongoose connection established |
| **Postconditions** | User document persisted with validation |
| **Schema Fields** | `name` (String, required, unique), `actualName` (String, required), `password` (String, required), `email` (String, required, unique, lowercase), `university` (String, required), `campus` (String), `phone` (String), `karma` (Number, default: 100), `isAdmin` (Boolean, default: false), `isVerifiedStudent` (Boolean, default: false), `products` (ObjectId[], ref: Product), `savedProducts` (ObjectId[], ref: Product), `profilePic` (String) |
| **Methods** | `validatePassword(x)` - bcrypt comparison |
| **Virtuals** | `url` - returns 'users/' + _id |
| **Goal** | Store user account data |
| **APIs/Libraries** | Mongoose Schema, bcrypt |
| **UML Type** | **Activity UML** |

---

### UC-DB-002: Product Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-002 |
| **Name** | Product Schema |
| **Description** | Defines the MongoDB schema for product listings with comprehensive marketplace features including condition, delivery options, and status tracking. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Product document creation/update |
| **Preconditions** | Mongoose connection established |
| **Postconditions** | Product document persisted with validation |
| **Schema Fields** | `name` (String, required, maxLength: 100), `description` (String, required, maxLength: 2000), `price` (Number, required, min: 0), `currency` (String, default: 'USD'), `seller` (ObjectId, ref: User, required), `buyer` (ObjectId, ref: User), `images` (String[]), `category` (ObjectId, ref: Category), `condition` (enum: new/like_new/good/fair/poor, default: good), `tags` (String[]), `location` ({campus, area}), `status` (enum: active/reserved/sold/removed, default: active), `negotiable` (Boolean, default: true), `allowsMeetup` (Boolean, default: true), `allowsShipping` (Boolean, default: false), `views` (Number, default: 0) |
| **Virtuals** | `url` - returns 'products/' + _id |
| **Goal** | Store product listing data |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Activity UML** |

---

### UC-DB-003: Category Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-003 |
| **Name** | Category Schema |
| **Description** | Simple schema for product categories to enable filtering and organization of listings. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Category document creation |
| **Preconditions** | Mongoose connection established |
| **Postconditions** | Category document persisted |
| **Schema Fields** | `name` (String, required, unique, trim) |
| **Virtuals** | `url` - returns 'categories/' + _id |
| **Goal** | Organize products by type |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Activity UML** |

---

### UC-DB-004: Order Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-004 |
| **Name** | Order Schema |
| **Description** | Tracks completed transactions between buyers and sellers, including meetup coordination details. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Order document creation/update |
| **Preconditions** | Product and users exist |
| **Postconditions** | Order document persisted |
| **Schema Fields** | `product` (ObjectId, ref: Product, required), `buyer` (ObjectId, ref: User, required), `seller` (ObjectId, ref: User, required), `status` (enum: pending_meetup/completed/cancelled, default: pending_meetup), `price` (Number, required, min: 0), `currency` (String, default: 'USD'), `meetup` ({time: Date, campus: String, locationDetail: String, notes: String}) |
| **Virtuals** | `url` - returns 'orders/' + _id |
| **Goal** | Track transaction lifecycle |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Sequence UML** |

---

### UC-DB-005: Conversation Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-005 |
| **Name** | Conversation Schema |
| **Description** | Groups messages between users, optionally linked to a specific product being discussed. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Conversation document creation |
| **Preconditions** | Participant users exist |
| **Postconditions** | Conversation document persisted |
| **Schema Fields** | `participants` (ObjectId[], ref: User, required), `product` (ObjectId, ref: Product), `lastMessageAt` (Date), `lastMessage` (String, trim) |
| **Virtuals** | `url` - returns 'conversations/' + _id |
| **Goal** | Group related messages |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Activity UML** |

---

### UC-DB-006: Message Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-006 |
| **Name** | Message Schema |
| **Description** | Stores individual messages within conversations with sender, body content, attachments, and read tracking. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Message document creation |
| **Preconditions** | Conversation and sender exist |
| **Postconditions** | Message document persisted |
| **Schema Fields** | `conversation` (ObjectId, ref: Conversation, required), `sender` (ObjectId, ref: User, required), `body` (String, required, trim, maxLength: 5000), `attachments` (Buffer[]), `readBy` (ObjectId[], ref: User) |
| **Virtuals** | `url` - returns 'messages/' + _id |
| **Goal** | Store message content |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Activity UML** |

---

### UC-DB-007: Offer Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-007 |
| **Name** | Offer Schema |
| **Description** | Tracks price negotiation offers on products with status workflow (pending → accepted/declined/withdrawn/expired). |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Offer document creation/status update |
| **Preconditions** | Product and buyer exist |
| **Postconditions** | Offer document persisted |
| **Schema Fields** | `product` (ObjectId, ref: Product, required), `buyer` (ObjectId, ref: User, required), `seller` (ObjectId, ref: User, required), `amount` (Number, required, min: 0), `currency` (String, default: 'USD'), `status` (enum: pending/accepted/declined/withdrawn/expired, default: pending), `message` (String, trim, maxLength: 2000), `expiresAt` (Date) |
| **Virtuals** | `url` - returns 'offers/' + _id |
| **Goal** | Manage price negotiations |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Sequence UML** |

---

### UC-DB-008: Review Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-008 |
| **Name** | Review Schema |
| **Description** | Stores user reviews/ratings after completed transactions to build trust and reputation. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | Review document creation |
| **Preconditions** | Transaction completed, both parties exist |
| **Postconditions** | Review document persisted |
| **Schema Fields** | `reviewer` (ObjectId, ref: User, required), `reviewee` (ObjectId, ref: User, required), `order` (ObjectId, ref: Order), `rating` (Number, required, min: 1, max: 5), `comment` (String, trim, maxLength: 2000) |
| **Virtuals** | `url` - returns 'reviews/' + _id |
| **Goal** | Build user trust/reputation |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Activity UML** |

---

### UC-DB-009: Notification Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-009 |
| **Name** | Notification Schema |
| **Description** | Stores system notifications for users about messages, offers, orders, and system announcements. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | System events (new message, offer, order update) |
| **Preconditions** | Recipient user exists |
| **Postconditions** | Notification document persisted |
| **Schema Fields** | `recipient` (ObjectId, ref: User, required), `type` (enum: message/offer/order/system, required), `title` (String, required, trim), `body` (String, trim), `data` (Object), `readAt` (Date) |
| **Virtuals** | `url` - returns 'notifications/' + _id |
| **Goal** | Keep users informed |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Activity UML** |

---

### UC-DB-010: Report Schema

| Attribute | Description |
|-----------|-------------|
| **ID** | UC-DB-010 |
| **Name** | Report Schema |
| **Description** | Tracks user/product reports for community moderation with status workflow for admin review. |
| **Actors** | MongoDB, Mongoose |
| **Triggers** | User submits report |
| **Preconditions** | Reporter exists, target exists |
| **Postconditions** | Report document persisted for admin review |
| **Schema Fields** | `reporter` (ObjectId, ref: User, required), `targetUser` (ObjectId, ref: User), `targetProduct` (ObjectId, ref: Product), `reason` (String, required, trim), `details` (String, trim, maxLength: 5000), `status` (enum: open/reviewing/resolved/dismissed, default: open) |
| **Virtuals** | `url` - returns 'reports/' + _id |
| **Goal** | Enable community moderation |
| **APIs/Libraries** | Mongoose Schema |
| **UML Type** | **Sequence UML** |

---

## Summary

| Category | Count | UML Types |
|----------|-------|-----------|
| Frontend Use Cases | 17 | 9 Sequence, 8 Activity |
| Server/API Use Cases | 25 | 18 Sequence, 7 Activity |
| Database Use Cases | 10 | 3 Sequence, 7 Activity |
| **Total** | **52** | **30 Sequence, 22 Activity** |

---

## Technology Stack Reference

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Component Library:** Material-UI (MUI) 7
- **CSS-in-JS:** Emotion (@emotion/react, @emotion/styled, @emotion/cache)
- **State Management:** React Context API (AuthContext)
- **Routing:** Next.js App Router, useRouter, useParams, useSearchParams
- **Storage:** localStorage (client-side session persistence)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **ORM:** Mongoose 8
- **Database:** MongoDB
- **Authentication:** bcrypt 6 (password hashing)
- **CORS:** cors package

### Development Tools
- **Package Manager:** npm
- **Concurrent Execution:** concurrently
- **Hot Reload:** nodemon
- **Linting:** ESLint 9

---

*Document generated from codebase analysis - December 14, 2025*
