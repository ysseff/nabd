# Nabd Pharmacy Management Dashboard

Nabd is a web-based pharmacy operations dashboard built with AngularJS and Supabase.
It centralizes daily workflows for checkout, invoices, inventory, suppliers, employees, and pharmacy settings.

## Overview

The application is designed for two user roles:

- `employee`: handles daily sales and checkout operations.
- `admin`: has full operational access, including employee, supplier, product, and preferences management.

Core goals:

- Fast checkout and invoice generation
- Controlled role-based access
- Clear inventory and supplier workflows
- Simple deployment as static frontend files

## Main Features

- Authentication and profile-based access
- Checkout flow with cart, payment selection, and discount handling
- Sales/invoice history with invoice details drawer and print receipt
- Supplier CRUD management (admin)
- Employee CRUD management (admin)
- Product management with create/update/delete (admin)
- Pharmacy preferences management (admin)

## Access Rules

| Area | Employee | Admin |
| --- | --- | --- |
| Checkout | Yes | Yes |
| Sales | Yes | Yes |
| Products | Read | Full CRUD |
| Suppliers | Read | Full CRUD |
| Employees | No | Full CRUD |
| Preferences | No | Update |

## Tech Stack

- AngularJS + ngRoute
- Bootstrap
- Supabase (Auth, PostgREST, RPC)
- Browser `localStorage` for session/cart persistence

## Project Structure

```text
.
├── app.js
├── index.html
├── controllers/
├── services/
├── directives/
├── views/
│   └── shared/
├── styles/
└── assets/
```

## Getting Started

### 1. Prerequisites

- Python 3 (or any static file server)
- A Supabase project with the required tables/views/RPCs/policies

### 2. Run Locally
With live server open:

`http://localhost:5500`

## Backend Requirements (Supabase)

The frontend expects these resources:

- Tables: `profiles`, `pharmacy_settings`, `suppliers`, `products`, `sales`, `sale_items`
- Views: `products_view`, `sales_view`, `sale_items_view`
- RPCs: `complete_sale`, `void_sale`
- RLS policies enforcing role-based permissions
