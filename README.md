# rest-api-design

A RESTful API for managing a product catalog, built with Node.js, Express, and PostgreSQL using Prisma ORM.

---

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Docker](#docker)
- [CI/CD Pipeline](#cicd-pipeline)
- [Testing](#testing)
- [Swagger API Docs](#swagger-api-docs)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Example Requests](#example-requests)
- [Error Responses](#error-responses)
- [Postman Collection](#postman-collection)

---

## Features
- Add, update, delete, and retrieve products
- Pagination, filtering, and sorting support
- API versioning (v1, v2)
- Error handling and validation
- ETag and cache control support

---

## Getting Started

### 1. Clone the repository
```sh
git clone <repo-url>
cd rest-api-design
```

### 2. Install dependencies
```sh
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:nopass@1234@localhost:5432/catalog_db"
PORT=3006
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=nopass@1234
DB_NAME=catalog_db
```

### 4. Set up the database
Ensure PostgreSQL is running and the user has access. Then run:
```sh
npx prisma migrate deploy
```

### 5. Start the server
```sh
npm start
```
The API will be available at `http://localhost:3006`.

---

## Docker

This project includes a Dockerfile and docker-compose setup for easy containerization.

### Build and Run with Docker Compose
```sh
docker-compose up --build
```
The API will be available at `http://localhost:3006` and PostgreSQL at `localhost:5432`.

### Environment Variables
You can override environment variables in `docker-compose.yml` or with a `.env` file.

---

## CI/CD Pipeline

GitHub Actions is used for CI/CD. The workflow:
- Installs dependencies
- Runs migrations
- Runs all tests
- Builds and pushes a Docker image to GitHub Container Registry (GHCR)

See `.github/workflows/ci.yml` for details.

---

## Testing

Unit and API tests are written using [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest).

### Run all tests
```sh
yarn test
# or
npm test
```
Test files are located in the `test/` directory. The test suite covers all API endpoints, including success and error cases.

---

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Port for the API server
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: (Optional) Additional DB config

---

## Database
- Uses PostgreSQL
- Prisma ORM manages migrations and models
- Main model: `Product`

---

## API Endpoints

### **Product Endpoints (v1)**

#### Add a Product
- **POST** `/api/v1/products`
- **Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Product Description",
    "price": 19.99,
    "sku": "SKU001",
    "status": "PUBLISHED" // Optional: DRAFT, PUBLISHED, UNLISTED
  }
  ```
- **Response:**
  ```json
  {
    "message": "Product Created Successfully",
    "data": {
      "id": "<uuid>",
      "sku": "SKU001",
      "name": "Product Name",
      "description": "Product Description",
      "price": 19.99,
      "status": "PUBLISHED",
      "createdAt": "2024-06-01T12:00:00.000Z",
      "updatedAt": "2024-06-01T12:00:00.000Z",
      "links": {
        "self": "/products",
        "get": "/products/<uuid>",
        "update": "/products/<uuid>",
        "delete": "/products/<uuid>"
      }
    },
    "trace_id": "<trace-id>"
  }
  ```

#### Get All Products
- **GET** `/api/v1/products`
- **Query Params:**
  - `page`, `limit`, `sort`, `order`, `priceMin`, `priceMax`
- **Response:**
  ```json
  {
    "message": "Product Retrieval Successful",
    "info": "The URL '/api/v1/products' has been deprecated and we have now shifted it to '/api/v2/products.' If you want to learn more about this update, please visit our developer portal at http://developer.stackshop.com.",
    "data": [
      {
        "id": "<uuid>",
        "sku": "SKU001",
        "name": "Product Name",
        "description": "Product Description",
        "price": 19.99,
        "status": "PUBLISHED",
        "createdAt": "2024-06-01T12:00:00.000Z",
        "updatedAt": "2024-06-01T12:00:00.000Z",
        "links": {
          "self": "/products/<uuid>",
          "add-to-cart": "/cart/add"
        }
      }
      // ...more products
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPage": 1,
      "totalItems": 1,
      "links": {
        "self": "/products?page=1&limit=10",
        "first": "/products?page=1&limit=10",
        "last": "/products?page=1&limit=10",
        "prev": null,
        "next": null
      }
    }
  }
  ```

#### Get a Product by ID
- **GET** `/api/v1/products/{id}`
- **Response:**
  ```json
  {
    "message": "Product Retrieval Successful",
    "data": {
      "id": "<uuid>",
      "sku": "SKU001",
      "name": "Product Name",
      "description": "Product Description",
      "price": 19.99,
      "status": "PUBLISHED",
      "createdAt": "2024-06-01T12:00:00.000Z",
      "updatedAt": "2024-06-01T12:00:00.000Z",
      "links": {
        "self": "/products/<uuid>",
        "add-to-cart": "/cart/add"
      }
    },
    "trace_id": "<trace-id>"
  }
  ```

#### Update a Product
- **PUT** `/api/v1/products/{id}`
- **Body:** (any updatable fields)
  ```json
  {
    "name": "New Name"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Product Updated Successfully",
    "data": {
      "id": "<uuid>",
      "links": {
        "self": "/products/<uuid>",
        "get": "/products/<uuid>",
        "update": "/products/<uuid>",
        "delete": "/products/<uuid>"
      }
    },
    "trace_id": "<trace-id>"
  }
  ```

#### Delete a Product
- **DELETE** `/api/v1/products/{id}`
- **Response:**
  ```json
  {
    "message": "Product Deleted Successfully",
    "data": {
      "id": "<uuid>",
      "name": "Product Name",
      "sku": "SKU001",
      "links": {
        "self": "/products",
        "create": "/products",
        "get": "/products/<uuid>"
      }
    },
    "trace_id": "<trace-id>"
  }
  ```

---

## Error Responses

### Bad Request (Validation Error)
- **Status:** 400
- **Example:**
  ```json
  {
    "message": "Validation Error",
    "errors": [
      "\"price\" is required"
    ],
    "hints": "Please provide all the required fields",
    "trace_id": "<trace-id>"
  }
  ```

### Not Found
- **Status:** 404
- **Example:**
  ```json
  {
    "message": "Product not found",
    "errors": [
      "The product with the provided id does not exist"
    ],
    "hints": "Please provide a valid product id",
    "trace_id": "<trace-id>"
  }
  ```

### Server Error
- **Status:** 500
- **Example:**
  ```json
  {
    "message": "Something went wrong!",
    "errors": [
      "Server Error!"
    ],
    "hints": null,
    "trace_id": "<trace-id>"
  }
  ```

---

## Example Requests

### Add a Product (cURL)
```sh
curl -X POST http://localhost:3006/api/v1/products -H "Content-Type: application/json" -d '{"name":"Product 1","description":"Description 1","price":10.99,"sku":"SKU001","status":"PUBLISHED"}'
```

### Get All Products (cURL)
```sh
curl http://localhost:3006/api/v1/products
```

---

## Postman Collection
A sample Postman collection is included: `Catalog.postman_collection.json`
- Import it into Postman to test all endpoints easily.

---

## Swagger API Docs

Interactive API documentation is available via Swagger UI.

- Open [http://localhost:3006/api-docs](http://localhost:3006/api-docs) after starting the server.
- The OpenAPI spec is in `swagger.yaml`.

---

## Notes
- API v2 is available at `/api/v2/products` with similar functionality and improvements.
- For more details, see the code in `src/v1/` and `src/v2/`.

---

## License
Copyright (c) Mehedi
MIT
