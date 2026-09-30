# Fresh Mart — Grocery E-Commerce Web Application

Fresh Mart is a **full-stack grocery e-commerce web application developed as an academic/class project** to practice modern web development, REST API development, database integration, authentication, and e-commerce functionality.

The project includes a React-based frontend and a Node.js/Express backend connected to MongoDB.

## Features

### Customer Features

* Browse grocery products and categories
* Search and view product information
* Add products to a shopping cart
* Manage cart items and quantities
* User registration and authentication
* Place orders
* View order information and status
* Guest and authenticated shopping flows
* Checkout and payment options

### Admin Features

* Admin authentication
* Product management
* Category management
* Order management
* User management
* Stock monitoring
* Order tracking and reporting

### Payment

* Stripe payment integration
* Cash on Delivery (COD) option

## Technologies Used

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Axios

### Backend

* Node.js
* Express.js
* Mongoose
* REST APIs
* Authentication and authorization

### Database

* MongoDB

### Development Tools

* Git
* GitHub
* Visual Studio Code
* npm

## Project Structure

```text
fresh-mart-ecommerce/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Architecture

The application follows a frontend-backend architecture:

```text
React + TypeScript
       │
       │ REST API
       ▼
Node.js + Express
       │
       ▼
MongoDB
```

The frontend communicates with the backend through REST APIs. The backend handles authentication, business logic, product and order management, and database operations.

## Academic Project

Fresh Mart was developed as a **class/academic project** to gain practical experience in full-stack software development.

The project provided hands-on experience with:

* Frontend development
* Backend development
* REST API design
* Database modeling
* Authentication and authorization
* API integration
* E-commerce workflows
* Git and GitHub
* Debugging and troubleshooting

## Running the Project Locally

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB or access to a MongoDB database

### Backend

```bash
cd backend
npm install
```

Create a `.env` file based on the provided `.env.example` file and configure the required environment variables.

Then start the backend:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend and backend configuration may vary depending on the local development environment.

## Environment Variables

Environment variables are required for services such as the database connection, authentication, and payment integration.

For security, actual credentials and secrets are **not included in this repository**.

Use the provided `.env.example` files as a reference when configuring the application locally.

## Current Project Status

The application is currently maintained as an academic portfolio project.

Some external services may require additional configuration before the application can be demonstrated as a fully deployed production system.

## What I Practiced Through This Project

This project helped me strengthen my understanding of:

* React and TypeScript
* Node.js and Express
* MongoDB and Mongoose
* REST API development
* Authentication and authorization
* Frontend-backend integration
* Database operations
* Payment API integration
* Git/GitHub workflows
* Debugging full-stack applications

## Author

**Abyssinia Getachew**

BSc Computer Science Graduate
Unity University

GitHub: [@abyssiniagetachew4-cmyk](https://github.com/abyssiniagetachew4-cmyk)
