# FreelanceHub API

A RESTful backend API for a freelance marketplace where users can discover and manage job opportunities. Built with **Node.js**, **Express.js**, and **PostgreSQL**.

This project is being developed incrementally to practice backend development by applying each new concept directly to a real-world API.

## Project Goal

The purpose of this project is to build practical backend development skills by creating a production-inspired REST API from the ground up.

The project focuses on:

* RESTful API design
* Database integration
* Authentication and authorization
* MVC architecture
* Input validation
* Error handling
* Filtering, pagination, and sorting
* API testing with Postman

## Implemented Features

* User registration
* User login
* JWT authentication
* Role-based authorization
* Job CRUD operations
* Job ownership authorization
* PostgreSQL database integration
* Job filtering by location, company, and minimum salary
* Pagination
* Sorting by supported job fields
* Input validation
* Centralized error handling
* Global 404 handling
* Environment variables for configuration

## API Endpoints

### Authentication

| Method | Endpoint       | Description                              | Authentication |
| ------ | -------------- | ---------------------------------------- | -------------- |
| POST   | `/auth/signup` | Register a new user                      | No             |
| POST   | `/auth/login`  | Login and receive JWT                    | No             |
| GET    | `/auth/me`     | Get the authenticated user's information | Yes            |

### Jobs

| Method | Endpoint    | Description                                      | Authentication    |
| ------ | ----------- | ------------------------------------------------ | ----------------- |
| GET    | `/jobs`     | Get jobs with filtering, pagination, and sorting | No                |
| GET    | `/jobs/:id` | Get a single job                                 | No                |
| POST   | `/jobs`     | Create a job                                     | NGO / Admin       |
| PUT    | `/jobs/:id` | Update a job                                     | Owner NGO / Admin |
| DELETE | `/jobs/:id` | Delete a job                                     | Owner NGO / Admin |

## Job Filtering, Pagination & Sorting

The `GET /jobs` endpoint supports query parameters.

### Filtering

```text
/jobs?location=Addis Ababa
/jobs?company=OpenTech
/jobs?minSalary=50000
```

Filters can also be combined:

```text
/jobs?location=Addis Ababa&minSalary=50000
```

### Pagination

```text
/jobs?page=1&limit=10
/jobs?page=2&limit=10
```

The response includes:

```json
{
  "jobs": [],
  "total": 7,
  "totalPages": 1
}
```

### Sorting

Supported fields:

* `id`
* `title`
* `company`
* `location`
* `salary`

Example:

```text
/jobs?sortBy=salary&order=desc
/jobs?sortBy=title&order=asc
```

## Authentication

Protected endpoints use a JWT in the `Authorization` header:

```text
Authorization: Bearer <token>
```

JWT authentication identifies the user, while authorization determines whether the user's role and ownership allow the requested action.

## Authorization Rules

* Unauthenticated users can view jobs.
* Normal users can view jobs.
* NGOs can create jobs.
* NGOs can update and delete their own jobs.
* Admins can create, update, and delete any job.

## Tech Stack

* Node.js
* Express.js
* JavaScript
* PostgreSQL
* pg
* JWT
* bcrypt
* npm
* Git & GitHub
* Postman

## Project Status

🚧 **Under development**

The core REST API, database integration, authentication, authorization, job management, filtering, pagination, sorting, and error handling have been implemented.

Additional features may be added as the backend learning journey continues.

## Author

**Surra**

GitHub: https://github.com/Surra1960
