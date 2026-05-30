# CRM Ticket System

A simple CRM-style ticket management system built with FastAPI, SQLite, HTML, CSS, and JavaScript. The application allows users to create, manage, update, and track support tickets through a clean web interface.

## Live Demo

**Application:** https://crm-ticket-system-a2ub.vercel.app/#/

## Features

* Create support tickets
* View all tickets
* Update ticket details
* Change ticket status
* Add and manage notes
* Ticket history tracking
* Responsive user interface
* REST API powered by FastAPI

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* FastAPI
* Python

### Database

* SQLite

### Deployment

* Frontend: Vercel
* Backend: Railway

## Project Structure

```text
crm-ticket-system/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

## API Endpoints

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | /tickets      | Get all tickets  |
| GET    | /tickets/{id} | Get ticket by ID |
| POST   | /tickets      | Create a ticket  |
| PUT    | /tickets/{id} | Update a ticket  |
| DELETE | /tickets/{id} | Delete a ticket  |

## Running Locally

### Clone the Repository

```bash
git clone https://github.com/ibishairin/crm-ticket-system.git
cd crm-ticket-system
```

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run on:

```text
http://localhost:8000
```

### Frontend Setup

Open `index.html` directly in your browser or use a local server.

Example:

```bash
python -m http.server 5500
```

## Challenges Faced

* Configuring communication between the deployed frontend and backend
* Managing API endpoint changes between local and production environments
* Ensuring ticket updates and notes persisted correctly after deployment

## Future Improvements

* PostgreSQL integration
* User authentication and authorization
* Pagination and filtering
* Improved error handling
* Admin dashboard and analytics
* Enhanced mobile experience

## Author

**Ibisha Irin**

GitHub: https://github.com/ibishairin
