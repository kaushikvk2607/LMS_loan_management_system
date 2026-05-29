# Loan Management System

A full-stack MERN + Next.js + TypeScript assignment build for a loan lifecycle workflow.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt
- Uploads: Multer with PDF/JPG/PNG validation

## Features

- Borrower signup and login
- Server-side BRE for age, salary, PAN, and employment checks
- Salary slip upload with 5 MB limit
- Loan amount and tenure sliders with simple-interest calculation
- Loan lifecycle: `APPLIED`, `SANCTIONED`, `REJECTED`, `DISBURSED`, `CLOSED`
- Executive modules for Sales, Sanction, Disbursement, and Collection
- Backend and frontend role-based access control
- Unique UTR validation for payments
- Automatic loan closure after full repayment
- Seeded users for evaluator testing

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example.local frontend/.env.local
```

3. Start MongoDB locally or set `MONGODB_URI` in `backend/.env`.

```bash
docker compose up -d mongo
```

4. Seed login accounts:

```bash
npm run seed
```

5. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

## Seeded Credentials

All seeded accounts use this password:

```text
Password@123
```

| Role | Email |
| --- | --- |
| Admin | `admin@lms.dev` |
| Sales | `sales@lms.dev` |
| Sanction | `sanction@lms.dev` |
| Disbursement | `disbursement@lms.dev` |
| Collection | `collection@lms.dev` |
| Borrower | `borrower@lms.dev` |

## API Overview

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/borrower/me` | Borrower |
| POST | `/api/borrower/details` | Borrower |
| POST | `/api/borrower/salary-slip` | Borrower |
| POST | `/api/borrower/apply` | Borrower |
| GET | `/api/dashboard/sales` | Admin, Sales |
| GET | `/api/dashboard/sanction` | Admin, Sanction |
| PATCH | `/api/dashboard/sanction/:loanId/approve` | Admin, Sanction |
| PATCH | `/api/dashboard/sanction/:loanId/reject` | Admin, Sanction |
| GET | `/api/dashboard/disbursement` | Admin, Disbursement |
| PATCH | `/api/dashboard/disbursement/:loanId/disburse` | Admin, Disbursement |
| GET | `/api/dashboard/collection` | Admin, Collection |
| POST | `/api/dashboard/collection/:loanId/payments` | Admin, Collection |

## Deployment

### Backend

- Build command: `npm run build -w backend`
- Start command: `npm run start -w backend`
- Required environment variables:
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLIENT_ORIGIN`
  - `UPLOAD_DIR`

Use a persistent upload volume in production if salary slips must remain available after redeploys.

### Frontend

- Build command: `npm run build -w frontend`
- Start command: `npm run start -w frontend`
- Required environment variable:
  - `NEXT_PUBLIC_API_URL`

Set `NEXT_PUBLIC_API_URL` to the deployed backend API URL ending in `/api`.

## Evaluation Flow

1. Register or log in as borrower.
2. Submit one failing BRE case and one passing BRE case.
3. Upload a valid salary slip.
4. Apply for a loan.
5. Log in as Sanction or Admin and approve.
6. Log in as Disbursement or Admin and disburse.
7. Log in as Collection or Admin and record payments until the loan closes.
