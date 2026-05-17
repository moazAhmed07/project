# Football E-Commerce Store Backend API

This document outlines the implementation plan for building a complete professional REST API for a Football E-Commerce Store using Node.js, Express.js, and MongoDB.

## User Review Required

> [!IMPORTANT]
> The provided MongoDB connection string uses specific credentials and clusters. It will be stored in the `.env` file and used directly. Please review the database models to ensure they capture all your business requirements before we begin execution.

## Open Questions

> [!WARNING]
> 1. **Payment Integration**: The requirements mention a `Payment` model. Should we integrate a specific payment gateway (like Stripe or PayPal), or should we just implement the schema and basic CRUD operations for now?
> 2. **Roles & Permissions**: Beyond a basic `admin` boolean or role string in the `User` model, are there specific permissions required for different admin levels?

## Proposed Changes

We will work in the `e:\Self Improvement\FRONTEND\Projects FRONT\New folder\New folder\fullStack\Backend` directory.

### Project Setup and Configuration

Initialize the Node.js project and set up core configuration, middleware, and database connectivity.

#### [NEW] package.json
Initialize npm project and define scripts (`start`, `dev`) and install dependencies: `express`, `mongoose`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `multer`, `express-validator`, `nodemon`.

#### [NEW] .env
Store environment variables: `MONGO_URI`, `PORT=5000`, and `JWT_SECRET`.

#### [NEW] server.js
Configure Express app, JSON middleware, CORS, global error handling, and map all routes.

#### [NEW] config/db.js
Set up MongoDB connection using Mongoose.

---

### Database Models

Create the Mongoose schemas with required fields and validations.

#### [NEW] models/User.js
Fields: name, email, password, role, createdAt.

#### [NEW] models/Product.js
Fields: name, description, price, category, images, stock, featured, brand, createdAt.

#### [NEW] models/Category.js
Fields: name, description, createdAt.

#### [NEW] models/Cart.js
Fields: user, items (product, quantity), totalPrice.

#### [NEW] models/Order.js
Fields: user, items, shippingAddress, paymentMethod, paymentResult, taxPrice, shippingPrice, totalPrice, isPaid, paidAt, isDelivered, deliveredAt.

#### [NEW] models/Payment.js
Fields: order, user, paymentMethod, transactionId, amount, status.

---

### Middleware & Utilities

Implement shared functional logic, validation, and utility wrappers.

#### [NEW] middleware/authMiddleware.js
Middleware to protect routes verifying JWT, and admin middleware to restrict access.

#### [NEW] middleware/errorMiddleware.js
Global async error handling and centralized formatting.

#### [NEW] utils/generateToken.js
Utility function for JWT token generation.

#### [NEW] utils/apiResponse.js
Utility for formatting the standard API response: `{ success: true, message: "", data: {} }`.

#### [NEW] utils/upload.js
Multer configuration for product image uploads to the `uploads/` directory.

---

### Controllers & Routes

Implement the business logic and API endpoints.

#### [NEW] controllers/authController.js & routes/authRoutes.js
Auth flows: Register, Login, Get Profile.

#### [NEW] controllers/productController.js & routes/productRoutes.js
Product flows: Get All (with pagination, search, category filtering), Get By ID, Create, Update, Delete.

#### [NEW] controllers/cartController.js & routes/cartRoutes.js
Cart flows: Get Cart, Add to Cart, Update Cart, Clear/Delete Cart.

#### [NEW] controllers/orderController.js & routes/orderRoutes.js
Order flows: Create Order, Get My Orders, Get Order by ID.

#### [NEW] controllers/adminController.js & routes/adminRoutes.js
Admin flows: Get Users, Get Orders, Create Categories, Manage Stock.

---

### Documentation and Data

#### [NEW] README.md
Detailed setup instructions, API usage, and structural explanations.

#### [NEW] seedData/seeder.js
Script and sample data to quickly populate the database with categories, products, and a default admin user.

#### [NEW] postman_collection.json
A Postman collection with API testing examples.

## Verification Plan

### Automated/Manual Verification
- **Run the Server**: `npm run dev` and ensure it connects to the provided MongoDB instance successfully.
- **API Tests**: Use Postman (or Thunder Client) to test each API endpoint (Auth, Products, Cart, Orders, Admin).
- **Validation Check**: Verify that express-validator correctly rejects invalid inputs (e.g., bad email or short password).
- **Uploads**: Verify that product image uploads are successfully saved in the `uploads/` folder and accessible statically.
- **Standard Responses**: Check that all responses follow the `{ success, message, data }` format.
