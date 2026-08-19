### Phase 1 — Backend Architecture
Goal

By the end of this phase, you should be able to answer questions like:

- How does Google.com open in my browser?
- How does my Node.js code actually execute?
- What is an HTTP request internally?
- Why do we need Express?
- Why do we need PostgreSQL?
- Why do we need Redis?
- What is a Load Balancer?
- What exactly is a Reverse Proxy?
- Why do companies use Nginx?
- How does one request travel through an enterprise backend?

Once you understand this, `AWS will feel like infrastructure rather than a collection of confusing services.`

---

### Phase 1 Roadmap

This phase itself has multiple modules

```
Phase 1 - Backend Architecture

Module 1
│
├── Lesson 1. What is Backend?
├── Lesson 2. Client vs Server
├── Lesson 3. What Happens When You Open Google.com?
├── Lesson 4. Internet Fundamentals
├── Lesson 5. IP Address
├── Lesson 6. Ports
├── Lesson 7. DNS
├── Lesson 8. TCP
├── Lesson 9. TLS / HTTPS
├── Lesson 10. HTTP Deep Dive
├── Lesson 11. Request Lifecycle
├── Lesson 12. Browser Internals
├── Lesson 13. Reverse Proxy
├── Lesson 14. Application Server
├── Lesson 15. Database Communication
├── Lesson 16. Response Lifecycle
└── Assignment

Module 2
│
├── REST API Design
├── API Versioning
├── Pagination
├── Filtering
├── Sorting
├── Status Codes
├── Idempotency
├── Authentication Headers
├── API Documentation
└── Assignment

Module 3
│
├── Node.js Internals
├── V8 Engine
├── Event Loop
├── Event Queue
├── Libuv
├── Thread Pool
├── Streams
├── Buffers
├── Child Process
├── Cluster
└── Assignment

Module 4
│
├── Express Internals
├── Middleware
├── Routing
├── Error Handling
├── Validation
├── Logging
├── Security
├── Rate Limiting
└── Assignment
```

---
### Module 1
### Lesson 1
### What is a Backend?
---


### Learning Objectives

By the end of today's lesson you should be able to answer:

- What is Backend?
- Why does Backend exist?
- Why can't React alone build applications?
- Why do companies have backend teams?
- What responsibilities belong to Backend?
- What responsibilities do NOT belong to Backend?
- Where does Node.js fit?
- Where does PostgreSQL fit?
- Where does AWS fit?

---

### Before We Define Backend

Let's ask a simple question.

Suppose you build this React application.

```
+----------------------------+
|         Login Page         |
|                            |
| Email:    ____________     |
| Password: ____________     |
|                            |
|       [ Login ]            |
+----------------------------+

```

Looks great.

Now think carefully.

When the user clicks `Login...`

How does React know whether the password is correct?

It doesn't.

React only knows what is currently loaded in the browser. It has no trusted access to user accounts, passwords, or databases.

So where should the password be verified?

On another machine that the user cannot control.

That machine runs the backend.

---

### Imagine There Is No Backend

Let's remove the backend completely.

```
Browser

↓

React

↓

???
```

Now ask yourself:

Where are users stored?

Nowhere.

Where are passwords stored?

Nowhere.

Who verifies passwords?

Nobody.

Who saves uploaded files?

Nobody.

Who sends emails?

Nobody.

Who creates invoices?

Nobody.

Who talks to PostgreSQL?

Nobody.

A frontend alone cannot securely perform these tasks.

---

### The First Principle

`Backend exists because there are operations that must happen on a trusted machine, not on the user's device.`

This is the most important sentence in today's lesson.

Why?

Because ***the browser belongs to the user.***

The user can inspect it, modify it, or even replace your JavaScript entirely.

Never trust code running in the browser for enforcing security or business rules.

---

### Real Example

Suppose your website sells a laptop.

Price:
```
₹100,000
```

Your React app contains:
```
const price = 100000;
```

A malicious user opens Developer Tools and changes it to:

```
const price = 1;
```

If your application trusted the browser's price, the user could buy a ₹100,000 laptop for ₹1.

A properly designed backend never trusts client-calculated values. It recalculates prices, validates permissions, and enforces business rules on the server.

---

### So What Is Backend?

A concise definition:
```
A backend is software running on a server that receives requests from clients, executes business logic, communicates with databases or other services, and returns responses.
```

Let's break that down.

---

### 1. Receives Requests

A browser sends:
```
POST /login
```
The backend receives it.
```
Browser

↓

Backend
```

---

### 2. Executes Business Logic

Business logic means the rules of your application.

Examples:

Bank:
```
Balance >= Withdrawal?
```

Shopping:
```
Is product in stock?
```

Food delivery:

```
Restaurant is open?
```

Project management:
```
Can this user edit this task?
```

These rules define how the business operates and belong on the backend.

---

### 3. Talks to Storage and Services

The backend may need to:
```
Read PostgreSQL

↓

Store files in S3

↓

Send email with SES

↓

Publish a message to a queue

↓

Read from Redis
```

The browser should not have unrestricted access to these systems.

---

### 4. Sends a Response

Once the work is done:
```
Browser

↓

Backend

↓

Browser

```

Example response:

```
{
  "message": "Login successful",
  "token": "..."
}
```

---

### Where Does Node.js Fit?

Node.js is `the runtime` that executes our JavaScript on the server.

Think of it this way:

```
JavaScript

↓

Node.js Runtime

↓

Operating System

↓

CPU
```

Your backend code is written in JavaScript (or TypeScript), but Node.js is what allows it to run outside the browser.

---

### Where Does Express Fit?

Express is not the backend.

Express is a framework that helps organize backend code.

```
Node.js

↓

Express

↓

Your Application
```

Node.js can create HTTP servers by itself. Express adds routing, middleware, request parsing, and many conveniences.

We'll eventually learn what Express does internally rather than treating it as magic.

---

### Where Does PostgreSQL Fit?

PostgreSQL is your application's durable memory.

Imagine your backend process restarts.

Anything stored only in RAM is gone.

PostgreSQL stores data on disk so it survives restarts and power failures.

```
Browser

↓

Node.js

↓

PostgreSQL

↓

Disk
```

---

### Where Does AWS Fit?

AWS provides the infrastructure where your backend runs.

Instead of:

```
Browser

↓

Your Laptop
```

Production systems typically look more like:

```
Browser
    │
    ▼
Internet
    │
    ▼
Load Balancer
    │
    ▼
Node.js Servers
    │
    ├────────► PostgreSQL (RDS)
    ├────────► Redis
    ├────────► S3
    └────────► Other Services
```

AWS gives us managed networking, compute, storage, databases, and much more.

---


### A Mental Model

Think of a restaurant.

```
Customer

↓

Waiter

↓

Kitchen

↓

Storage

↓

Waiter

↓

Customer
```

Now map it to software.

| Restaurant          | Backend System         |
| ------------------- | ---------------------- |
| Customer            | Browser / Mobile App   |
| Waiter              | HTTP API               |
| Kitchen             | Backend Business Logic |
| Pantry              | PostgreSQL             |
| Refrigerator        | Redis Cache            |
| Warehouse           | S3                     |
| Restaurant Building | AWS Infrastructure     |


This analogy isn't perfect, but it helps you see how responsibilities are separated.

---

### Complete High-Level Request Flow

```
             Browser
                │
                ▼
         HTTP Request
                │
                ▼
          Node.js Server
                │
                ▼
      Express Router
                │
                ▼
       Business Logic
         │      │
         │      ├────────► PostgreSQL
         │      ├────────► Redis
         │      ├────────► S3
         │      └────────► Email Service
         │
         ▼
      HTTP Response
                │
                ▼
             Browser
```

This diagram is the backbone of our entire course. We'll revisit it repeatedly and gradually replace each box with a deep understanding of what happens inside.

---


### Key Takeaways
- A backend is not Node.js or Express. It is the software that performs trusted work on behalf of clients.
- The browser is controlled by the user and must never be fully trusted.
- Business rules, security checks, and sensitive operations belong on the backend.
- Node.js runs our server-side JavaScript.
- Express helps us build HTTP APIs.
- PostgreSQL stores persistent data.
- AWS provides the infrastructure that hosts production systems

---
---
### Lesson - 2
---
---

### Client vs Server

#### Today's Goal

By the end of this lesson, you'll understand `why the client-server architecture became the dominant way to build applications,` and you'll stop thinking of "client" and "server" as just "frontend" and "backend.

---

### Before We Start

I want to ask a simple question.

When you open YouTube,

Who is doing the work?

Your laptop?

Or Google's computer?

The answer is:

Both.

This is the first major mindset shift.

A modern application is not one program.

It is multiple programs working together.

---

### Life Before Client-Server

Let's go back to the 1970s.

Imagine Microsoft Word (or any desktop application).

```
+---------------------------+
|                           |
|  Program                  |
|                           |
|  UI                       |
|  Logic                    |
|  Data                     |
|                           |
+---------------------------+
```

Everything existed in one place.

- UI
- Business Logic
- Data

All inside one computer.

No internet.

No servers.

No networking.

This architecture worked because only one person used the software.

---

### The Problem

Suppose we build a banking application like this.
```
Computer A

Balance = ₹1000
```

Now another computer opens the same account.
```
Computer B

Balance = ?
```

Which one is correct?

If both computers store their own copy, the balances become inconsistent.

Imagine:

Computer A
```
₹1000
```

Computer A
```
₹1200
```

Now which balance is real?

Nobody knows.

This is called a `consistency problem.`

---

### First Principle

There must be one trusted source of truth.

Instead of:
```
Computer A

Balance

Computer B

Balance

Computer C

Balance
```

#### We create one central computer.

```
        Client A

            │

            ▼

        Server

            ▲

            │

        Client B
```

Now everyone asks the same server.

The server owns the truth.

---

### What is a Client?

A client is simply:

 - `A program that requests a service from another program.`

Notice the definition.

It does `not` say:

- Browser
- React
- Mobile App

Those are examples.

The important word is `requests.`

Examples of clients:

- Chrome
- Firefox
- Edge
- React App
- Angular App
- Vue App
- Android App
- iPhone App
- Postman
- curl
- Another backend service

Anything requesting work is a client.

---

### What is a Server?

A `server` is:

- `A program that provides services to other programs over a network.`

Notice something interesting.

A server is also just a program.

Node.js becomes a server `only because it listens for requests.`

Python can be a server.

Java can be a server.

Go can be a server.

Even another Node.js application can be a client to a different Node.js application.

---

### Example

Suppose we have:

```
Browser

↓

Node.js API

↓

Payment Service

↓

Bank
```

Is the Node.js API a server?

Yes.

Is it also a client?

Also yes.

Why?

Because it receives requests from the browser `and `sends requests to the payment service.

Programs can have multiple roles.

---

### Important Mindset

People often think:

```
Browser = Client

Backend = Server
```

This is only true in a simple application.

In production:
```
Browser

↓

API Gateway

↓

Authentication Service

↓

Order Service

↓

Inventory Service

↓

Payment Service
```

Every service is simultaneously:

- a server to one component
- a client to another

This becomes very important when we study microservices.

---

### Client Responsibilities

What should happen on the client?

Examples:

✅ Display UI

✅ Buttons

✅ Forms

✅ Animations

✅ User interaction

✅ Input collection

✅ Basic validation (for better user experience)

Example:
```
Email is empty
```
The client can show an error immediately.

---

### What Should NOT Happen on the Client?

Imagine this:
```
const isAdmin = true;
```

Would you trust that?

Of course not.

The user can change it to:

```
const isAdmin = true;
```

(or modify any other client-side value using browser developer tools.)

The same is true for:

```
price = 1
```

or 

```
balance = 100000000
```

The client can modify anything it controls.

Never trust it.

---

### Server Responsibilities

The server is responsible for:

- Authentication
- Authorization
- Database access
- Business rules
- Payments
- Inventory
- Emails
- Security
- Logging
- Auditing

Everything important.

---

### Real Login Example

Suppose the user clicks:
```
Login
```

#### Step1
client
```
Email

Password
```

↓

Send request

---

### Step 2

Server receives
```
POST /login
```

---

### Step 3

Server checks PostgreSQL
```
SELECT user...
```

---

### Step 4

Password matches?

Yes

↓

Create JWT

↓

Return Response

---

### Step 5

Browser stores token

User logged in.

Notice:

The browser never verifies the password.

Only the server does.

---

### Communication

How do client and server talk?

Through a protocol.

Most commonly:
```
HTTP
```

Later we'll study:

- HTTP
- HTTPS
- WebSocket
- gRPC
- Server-Sent Events

But for now 

```
Client

↓

HTTP Request

↓

Server

↓

HTTP Response

↓

Client
```

---

### Stateless Communication

Imagine you visit a restaurant.

You order.

You leave.

Tomorrow you return.

Does the waiter automatically remember you?

Usually no.

Every visit starts fresh unless the restaurant has a loyalty system.

HTTP works similarly.

Each request is independent.

```
GET /profile
```

The server doesn't automatically know who you are.

That's why we use:

- Cookies
- Sessions
- JWT
- OAuth Tokens

We'll learn these later.

---

### Real Production Example

Open Amazon.

What actually happens?
```
Browser

↓

Amazon Load Balancer

↓

API Gateway

↓

Authentication Service

↓

Product Service

↓

Inventory Service

↓

Recommendation Service

↓

Database

↓

Response
```

Even a simple page may involve dozens of backend services.

---

### Why Client-Server Won

Advantages:

### Centralized Data

One database.

Everyone sees the same information.

---

### Easier Updates

Bug fix?

Update one server.

Not one million users.

---

### Better Security

Sensitive code stays on the server.

---

### Shared Resources

One database

One storage

One cache

Many users

---

### Scalability

Need more capacity?

Add more servers.

You don't need to update every client.

---

### Mental Model

Think of online banking.

```
ATM

↓

Bank Server

↓

Database

```

The ATM is a client.

The bank's backend is the server.

The database stores account information.

If every ATM stored its own balances, banking would quickly become unreliable.

---

### Summary

A `client` is any program that requests work.

A `server` is any program that provides work.

A program can be both a client and a server at the same time.

The server is the trusted authority for business logic and data.

The client focuses on user interaction and presentation.

---



