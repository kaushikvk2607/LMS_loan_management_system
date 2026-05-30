# Loan Management System

A full-stack MERN + Next.js + TypeScript application implementing an end-to-end loan lifecycle workflow with role-based operations, BRE validation, loan sanctioning, disbursement, and repayment tracking.

## Live Demo
https://drive.google.com/file/d/1hSpWcGE3jgEIdWoOxsi5o8J6Ye-H7fsM/view?usp=drive_link

### Frontend Application

https://lms-loan-management-system-frontend.vercel.app

### Backend API

https://lms-loan-management-system.onrender.com

### Health Check

https://lms-loan-management-system.onrender.com/health

---

## Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* React Hooks

### Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Multer File Upload

### Database

* MongoDB Atlas
* Mongoose ODM

---

## Features

### Borrower Module

* User Registration & Login
* BRE (Business Rule Engine) Validation
* Salary Slip Upload
* Loan Eligibility Check
* Loan Application Submission

### Sales Module

* View borrower leads
* Track eligibility status

### Sanction Module

* Approve loan applications
* Reject applications with reason

### Disbursement Module

* Disburse sanctioned loans
* Update loan lifecycle status

### Collection Module

* Record repayments
* UTR validation
* Auto-close loan after complete repayment

### Security Features

* JWT Authentication
* Role-Based Access Control (RBAC)
* Protected APIs
* Secure Password Hashing using bcrypt

---

## Loan Lifecycle

```text
APPLIED
   ↓
SANCTIONED
   ↓
DISBURSED
   ↓
CLOSED

OR

APPLIED
   ↓
REJECTED
```

---

## Business Rule Engine (BRE)

Loan eligibility is evaluated based on:

* Age validation
* Monthly salary validation
* Employment type validation
* PAN validation

Only eligible borrowers can proceed with loan applications.

---

## Local Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example.local frontend/.env.local
```

### Start MongoDB

```bash
docker compose up -d mongo
```

### Seed Users

```bash
npm run seed
```

### Run Application

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:4000
```

---

## Seeded Credentials

Password for all users:

```text
Password@123
```

| Role                   | Email                                               |
| ---------------------- | --------------------------------------------------- |
| Admin                  | [admin@lms.dev](mailto:admin@lms.dev)               |
| Sales Executive        | [sales@lms.dev](mailto:sales@lms.dev)               |
| Sanction Executive     | [sanction@lms.dev](mailto:sanction@lms.dev)         |
| Disbursement Executive | [disbursement@lms.dev](mailto:disbursement@lms.dev) |
| Collection Executive   | [collection@lms.dev](mailto:collection@lms.dev)     |
| Borrower               | [borrower@lms.dev](mailto:borrower@lms.dev)         |

---

## API Endpoints

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| GET    | /api/auth/me       |

### Borrower

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | /api/borrower/me          |
| POST   | /api/borrower/details     |
| POST   | /api/borrower/salary-slip |
| POST   | /api/borrower/apply       |

### Dashboard

| Method | Endpoint                                     |
| ------ | -------------------------------------------- |
| GET    | /api/dashboard/sales                         |
| GET    | /api/dashboard/sanction                      |
| PATCH  | /api/dashboard/sanction/:loanId/approve      |
| PATCH  | /api/dashboard/sanction/:loanId/reject       |
| GET    | /api/dashboard/disbursement                  |
| PATCH  | /api/dashboard/disbursement/:loanId/disburse |
| GET    | /api/dashboard/collection                    |
| POST   | /api/dashboard/collection/:loanId/payments   |

---

## Deployment

### Frontend

Platform: Vercel

Environment Variable:

```env
NEXT_PUBLIC_API_URL=https://lms-loan-management-system.onrender.com/api
```

### Backend

Platform: Render

Environment Variables:

```env
PORT=10000
MONGODB_URI=<mongodb-atlas-uri>
JWT_SECRET=<secret>
CLIENT_ORIGIN=https://lms-loan-management-system-frontend.vercel.app
UPLOAD_DIR=uploads
```

---

## Evaluation Flow

1. Register as a borrower or use seeded borrower account.
2. Submit borrower details.
3. Upload salary slip.
4. Run eligibility check.
5. Apply for a loan.
6. Login as Sanction Executive and approve.
7. Login as Disbursement Executive and disburse.
8. Login as Collection Executive and record repayments.
9. Observe automatic loan closure after full repayment.

---

## Project Highlights

* Full-stack TypeScript application
* Production deployment on Vercel + Render + MongoDB Atlas
* Role-based workflow automation
* Business Rule Engine (BRE)
* File upload validation
* JWT Authentication
* Loan lifecycle management
* Responsive UI
* End-to-end workflow demonstration
