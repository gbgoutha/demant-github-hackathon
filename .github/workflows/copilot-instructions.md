# Copilot Instructions — Retail Store App

> Copy this file to `.github/copilot-instructions.md` in your target repository.
> Copilot will automatically load these instructions for every chat session.

---

You are building a **Retail Store Application** — a full-stack web app for managing customers, products, and purchase orders.

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn
- **ORM:** SQLAlchemy with SQLite
- **Validation:** Pydantic
- **Frontend:** React 18, React Router DOM, Axios
- **Testing:** pytest + httpx (backend), React Testing Library + Jest (frontend)
- **CI/CD:** GitHub Actions
- **Export:** openpyxl (Excel), reportlab (PDF)

## Project Structure

This is a monorepo. Create the following structure:

```
├── retail-store-api/              # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app, CORS config, router registration
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── database.py            # Engine, session, Base, get_db dependency
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── customers.py       # /customers endpoints
│   │   │   ├── products.py        # /products endpoints
│   │   │   └── orders.py          # /orders endpoints
│   │   └── services/
│   │       └── export_service.py  # Excel/PDF export functions
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py            # Test DB fixture, test client
│   │   ├── test_customers.py
│   │   ├── test_products.py
│   │   └── test_orders.py
│   └── requirements.txt
├── retail-store-ui/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Customers/         # CustomerList, CustomerForm, CustomerDetail
│   │   │   ├── Products/          # ProductList, ProductForm, ProductSearch, ProductDetail
│   │   │   └── Orders/            # OrderList, OrderForm, OrderDetail
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + API functions
│   │   ├── App.js                 # Router setup
│   │   └── index.js
│   └── package.json
├── .github/workflows/python-ci.yml
├── DOCS.md
└── README.md
```

---

## Data Models

### Customer (SQLAlchemy model in `models.py`)
- `id`: Integer, primary key, auto-increment
- `name`: String(100), not null
- `surname`: String(100), not null
- `address`: String(255), nullable
- `birth_date`: Date, nullable
- `email`: String(150), not null, unique

### Product
- `id`: Integer, primary key, auto-increment
- `name`: String(150), not null
- `description`: Text, nullable
- `price`: Float, not null, must be > 0

### PurchaseOrder
- `id`: Integer, primary key, auto-increment
- `order_number`: String(50), not null, unique
- `purchase_date`: DateTime, not null, default to utcnow
- `customer_id`: Integer, foreign key → customers.id, not null

### Relationships
- PurchaseOrder → Customer: many-to-one (`customer = relationship("Customer")`)
- PurchaseOrder ↔ Product: many-to-many via `order_products` junction table

### Pydantic Schemas (in `schemas.py`)
- `CustomerCreate`, `CustomerUpdate`, `CustomerResponse` — validate `email` as `EmailStr`
- `ProductCreate`, `ProductUpdate`, `ProductResponse` — validate `price > 0`
- `OrderCreate`, `OrderUpdate`, `OrderResponse` — `product_ids: List[int]` for input, nested objects for response

---

## API Endpoints

### Customers — prefix `/customers`
| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/customers` | List all | 200 |
| GET | `/customers/{id}` | Get by ID | 200/404 |
| POST | `/customers` | Create | 201/409/422 |
| PUT | `/customers/{id}` | Update | 200/404 |
| DELETE | `/customers/{id}` | Delete | 200/404 |
| GET | `/customers/export/excel` | Export to .xlsx | 200 |
| GET | `/customers/export/pdf` | Export to .pdf | 200 |

### Products — prefix `/products`
| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/products` | List all | 200 |
| GET | `/products/{id}` | Get by ID | 200/404 |
| GET | `/products/search?q=` | Search by name (case-insensitive) | 200 |
| POST | `/products` | Create | 201/422 |
| PUT | `/products/{id}` | Update | 200/404 |
| DELETE | `/products/{id}` | Delete | 200/404 |

### Orders — prefix `/orders`
| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/orders` | List all (with nested customer & products) | 200 |
| GET | `/orders/{id}` | Get by ID | 200/404 |
| GET | `/orders/search?q=` | Search by order_number or customer name | 200 |
| POST | `/orders` | Create (validate customer_id & product_ids exist) | 201/404/409 |
| PUT | `/orders/{id}` | Update | 200/404 |
| DELETE | `/orders/{id}` | Delete | 200/404 |
| GET | `/orders/export/excel` | Export to .xlsx | 200 |
| GET | `/orders/export/pdf` | Export to .pdf | 200 |

### Error responses
Return `{"detail": "<message>"}` for all errors. Use 404 for not found, 409 for conflicts (duplicate email/order_number), 422 for validation errors.

---

## Backend Implementation Rules

1. **Database:** Use SQLite via SQLAlchemy. Create `database.py` with engine, SessionLocal, Base, and `get_db()` dependency.
2. **CORS:** Allow `http://localhost:3000` in `main.py`.
3. **Routers:** One file per resource in `app/routers/`. Register in `main.py` with `app.include_router()`.
4. **Export service:** Create `app/services/export_service.py` with functions that return `BytesIO` objects. Use `openpyxl` for Excel, `reportlab` for PDF. Return via `StreamingResponse`.
5. **Startup:** Call `Base.metadata.create_all(bind=engine)` in `main.py` to auto-create tables.

---

## Frontend Implementation Rules

1. **SPA:** Single-page app with React Router for navigation.
2. **API layer:** All HTTP calls go through `src/services/api.js` using Axios with `baseURL: "http://localhost:8000"`.
3. **Components:** Organized by resource (Customers/, Products/, Orders/) with List, Form, and Detail components each.
4. **Navigation:** Navbar with links to Customers, Products, Orders on every page.
5. **Forms:** Client-side validation (required fields, email format, price > 0). Show validation errors inline.
6. **Export buttons:** On CustomerList and OrderList — trigger blob download for Excel/PDF.
7. **Search:** ProductSearch component with text input. OrderList with search input. Use API search endpoints.
8. **Responsive:** Layout should work on desktop and tablet viewports.

---

## Testing

### Backend (pytest)
- Create `tests/conftest.py` with test database fixture (separate SQLite DB) and TestClient.
- Test all CRUD endpoints for each resource.
- Test validation errors (invalid email, negative price, missing required fields).
- Test edge cases (not found, duplicate conflicts).
- Run: `cd retail-store-api && pytest --cov=app tests/ -v`
- Target: >80% coverage.

### Frontend (Jest + React Testing Library)
- Test component rendering, form validation, data display.
- Mock Axios calls.
- Run: `cd retail-store-ui && npm test -- --watchAll=false --coverage`
- Target: >70% coverage.

---

## CI/CD (GitHub Actions)

Create `.github/workflows/python-ci.yml`:
- **Trigger:** Push to `main` and `team*` branches; PRs to `main`.
- **Backend job:** Setup Python 3.11, install deps, run `pytest --cov=app tests/ -v`.
- **Frontend job:** Setup Node 18, `npm ci`, `npm run build`, `npm test -- --watchAll=false`.
- Jobs run in parallel.
- Use `actions/checkout@v4`, `actions/setup-python@v5`, `actions/setup-node@v4`.

---

## Documentation

Create `DOCS.md` at repo root with:
1. Architecture overview (how frontend, backend, and DB interact)
2. Tech stack table
3. Database schema with ER diagram (Mermaid)
4. API endpoints table (all methods, paths, descriptions, status codes)
5. Setup & installation steps
6. Build, test, and run commands

Create `README.md` with project name, one-line description, quick start (5 steps), and link to DOCS.md.

---

## Sample Prompts

Use these prompts with Copilot to build the application step by step:

### Setup
- "Create a FastAPI project structure with SQLAlchemy and SQLite"
- "Configure CORS for React frontend in FastAPI"
- "Create database.py with SQLAlchemy engine, session, and Base for SQLite"

### Models & Schemas
- "Create SQLAlchemy models for Customer, Product, and PurchaseOrder with a many-to-many relationship between orders and products"
- "Create Pydantic schemas for Customer with EmailStr validation"
- "Create Pydantic schemas for Product with price > 0 validation"
- "Create Pydantic schemas for PurchaseOrder with nested customer and products in response"

### API Endpoints
- "Create FastAPI router for Customer CRUD with /customers prefix"
- "Add search endpoint GET /products/search?q= with case-insensitive name matching"
- "Create order endpoints that validate customer_id and product_ids exist before creating"
- "Add export endpoints for customers to Excel using openpyxl and PDF using reportlab"

### Frontend
- "Create React app with Router and Navbar for Customers, Products, Orders"
- "Create CustomerList component that fetches from /customers and displays a table"
- "Create CustomerForm with validation for email and required fields"
- "Create api.js service with Axios for all backend endpoints"
- "Add Excel and PDF export buttons to CustomerList that download files"

### Testing
- "Create pytest conftest.py with test database fixture and FastAPI TestClient"
- "Write tests for all Customer CRUD endpoints including validation errors"
- "Write React tests for CustomerList component with mocked API calls"

### CI/CD
- "Create GitHub Actions workflow for Python FastAPI + React with parallel backend and frontend jobs"

### Documentation
- "Create DOCS.md with architecture, database schema (Mermaid ER diagram), API endpoints, and setup instructions"
