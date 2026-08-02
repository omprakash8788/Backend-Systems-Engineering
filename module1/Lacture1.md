### Course: Building an Enterprise E-Commerce Backend

### Module 1 — Foundations of Backend Engineering

### Lecture 1 — What Is a Backend?

Before writing even one line of code

Imagine this.
You open Amazon

`You search `

```
MacBook Pro
```

You press Enter

`Within about 200 milliseconds, thousands of things happen`

**_The product page appears_**

Most beginners think

- Node.js returns products.

That answer is far too shallow

A systems engineer asks

- What exactly happened from the moment I pressed Enter?

That is our first lesson

---

### The Journey of One HTTP Request

Suppose your browser visits

```
https://amazon.com/products?search=macbook
```

Let's slow time down

```
You
 │
 │ Press Enter
 ▼
Browser
 │
 ▼
Internet
 │
 ▼
Amazon
 │
 ▼
Product appears
```

<span style="color: red;">Looks simple.</span>
<span style="color: green;">Reality is not</span>

First Principle

- Ask yourself
- Can the browser directly access the database?
- Would this work

### Why not?

- Imagine every user had direct database access
- They could execute:

```
DELETE FROM products;
```

- The entire company would be compromised.
- So the database must never be exposed to the public internet.

## Instead:

```
Browser

↓

Backend

↓

Database
```
The backend is the gatekeeper

<span style="color: red;">Questions</span>
<span style="color: green;">Why doesn't the frontend simply contain all the business logic</span>
<span style="color: green;">Why have a backend at all?</span>

### Suppose pricing were calculated in JavaScript on the browser
```
price = 100;

discount = 20;

finalPrice = price - discount;
```
***Can the customer change this?***

Answer is - `Yes `

Open DevTools
```
price = 1
```
- Now imagine buying a `₹2,00,000` laptop for `₹1`.
- The backend exists because the `client cannot be trusted`.
- This is one of the most important rules in software engineering.

### Golden Rule #1
- Never trust the client.
Remember this sentence


### The Backend's Responsibilities
  - If it isn't just "getting data," what does it actually do?
  - A backend is responsible for
```
  Receive requests

↓

Validate input

↓

Authenticate user

↓

Authorize permissions

↓

Apply business rules

↓

Communicate with databases

↓

Communicate with other services

↓

Generate response

↓

Log everything

↓

Handle failures

```

- Notice something.

- Reading from the database is only one step.

- Most of the work happens before and after it

### Example 
Suppose a customer places an order
```
POST /orders
```

A beginner imagines
```
Insert into Orders table

Done.
```

Reality looks more like this:
```
Receive request

↓

Validate body

↓

Verify JWT

↓

Find customer

↓

Check address

↓

Verify inventory

↓

Reserve stock

↓

Calculate tax

↓

Calculate shipping

↓

Create payment intent

↓

Start database transaction

↓

Create order

↓

Reduce inventory

↓

Commit transaction

↓

Publish event

↓

Queue confirmation email

↓

Log request

↓

Return response
```

One button click can trigger dozens of operations

### Backend Is an Orchestrator
- Think of an orchestra.
- There are many musicians
  - Database
  - Redis
  - Queue
  - Payment provider
  - Email service
  - File storage
  - Search engine

If every musician plays independently, you get noise.
The backend is the conductor that coordinates them into one coherent process


### What Is Node.js?
 - Many people say
  - Node.js is a backend language 

Not exactly.
- JavaScript is the language
- Node.js is the runtime that allows JavaScript to execute outside a browser.
- The browser has its own JavaScript engine

Node.js embeds the same JavaScript engine (V8) and adds capabilities browsers don't expose, such as
  - Reading and writing files
  - Opening network sockets
  - Running HTTP servers
  - Accessing operating system resources
  - Creating child processes

Without Node.js, JavaScript cannot act as a backend server

### Our Goal
By the end of this course, you should be able to look at a complex system like this

```

                    Internet
                        │
                Load Balancer
                        │
               Node.js API Cluster
                        │
      ┌────────────┬─────────────┐
      │            │             │
 Product      Order Service   User Service
      │            │             │
      └──────┬─────┴─────────────┘
             │
          PostgreSQL
             │
           Redis
             │
           BullMQ
             │
     Background Workers

```

### Mental Model
Keep this picture in your mind
```
Client
   │
   ▼
Backend
   │
   ├── Database
   ├── Cache
   ├── Queue
   ├── Storage
   ├── Payment
   ├── Email
   └── Other Services
```

The backend is the brain of the system. It makes decisions, enforces rules, coordinates components, and protects data
