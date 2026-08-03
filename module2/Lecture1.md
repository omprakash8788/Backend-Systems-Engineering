### Module 2 — Building a Production Backend
### Lecture 1 — Why Express Exists (Building HTTP From First Principles)

Today is the day we stop studying Node.js and start becoming Backend Engineers.

Up until now, you've learned:

 - Event Loop
 - libuv
 - Modules
 - npm
 - package.json

But today...

We're going to build our first server.
Not with Express.
Not with NestJS.
Not with Fastify.

`Just Node.js.`

Because if you don't understand what Express is hiding, you'll never truly master backend development.

Today's Goal

By the end of this lecture, you will understand:

 - What HTTP really is.
 - What a web server actually does.
 - Why Node.js has an http module.
 - Why Express was invented.
 - The lifecycle of an HTTP request.
 - Why every framework ultimately sits on top of the HTTP protocol.


### What is backend 
First Definition

A backend is a software system that:

- receives requests
- processes business logic
- communicates with databases
- returns responses

Notice.

Node.js is one technology that can build a backend.

It is not the definition of backend

---

### What is a Server?

Another common misconception.

People say:

`"Server means a big computer."`

Not necessarily.

`A server is a program.`

Think carefully.

`If I run this program:`

```
console.log("Hello");
```
Does it wait for users?

No.

It starts.

Prints.

Stops.

### Building a Server Using Only Node.js

Create:
 src/server.js

```
const http = require("http");

const server = http.createServer((req, res) => {
    res.end("Hello World");
});

server.listen(3000);

```

Looks simple.

But let's understand every single line

### Line 1
```
const http = require("http");
```
Question.

Who wrote http?

You?

No.

It is a built-in Node.js module.

Node ships with modules like:

 - http
 - fs
 - path
 - os
 - crypto
 - events

No installation required.

### Line 2
```
http.createServer(...)
```
Question.

What does this return?

Not a running server.

It returns a Server object.

Think of it as constructing a restaurant before opening it.

### The Callback
```
(req, res) => {

}
```

- This callback executes once for every incoming request.
- Suppose 1,000 users connect.
- How many times does this callback run?
- Exactly 1,000 times.
- Each request gets its own req and res objects

### req Object

Question.
What is req?
It represents everything the client sent.
Examples:

```
req.method
```
Later we'll learn:
```
req.headers

req.body

req.cookies

req.params

req.query
```

Everything starts here.

### res Object

Question.

What is res?

It represents the response we send back.

Example:

```
res.end("Hello");
```
Question.

What happens if you never call:

```
res.end()
```
The browser keeps waiting.

Because the response was never completed

### server.listen()
```
server.listen(3000);
```

Question.

Does this create a website?

No.

It tells the operating system:

 - Listen on port 3000.

When someone connects,

notify Node.js.

### Mental Model
```
Client

↓

Port 3000

↓

Operating System

↓

Node.js

↓

Your Callback

```
The operating system accepts the TCP connection.

Node.js receives the event.

Your callback runs.

### Let's Build Routing
```
GET /products
```
and 
```
GET /users
```

### How?
```
const server = http.createServer((req, res) => {

    if (req.url === "/products") {

        res.end("Products");

    } else if (req.url === "/users") {

        res.end("Users");

    } else {

        res.statusCode = 404;
        res.end("Not Found");

    }

});

```

### What Express Actually Does

Many beginners think:

Express is a server.

Not exactly.

Express is a `framework built on top of Node's http module.`

Conceptually:

```
Your Code

↓

Express

↓

Node HTTP Module

↓

libuv

↓

Operating System

```
Express doesn't replace Node.

It makes Node easier to use.

### Express Solves These Problems

Without Express:

- Manual routing
- Manual body parsing
- Manual error handling
- Manual middleware
- Manual response helpers
- Manual query parsing

With Express:

### Architecture We Will Build
```
Browser
    │
    ▼
Express
    │
    ▼
Routes
    │
    ▼
Middleware
    │
    ▼
Controllers
    │
    ▼
Services
    │
    ▼
Repositories
    │
    ▼
PostgreSQL
```

### And later:
```
Redis

Queues

Authentication

Docker

Kafka

Microservices

CI/CD

Observability

Testing

```

### The Middleware Chain
```
Request

↓

Logger

↓

JSON Parser

↓

Authentication

↓

Authorization

↓

Routes

↓

Controller

↓

Response
```

Every middleware gets an opportunity to:

 - Continue
 - Modify the request
 - Stop the request
 - Return an error

### What is Middleware?

A middleware is simply a function.

```
(req,res,next)=>{

}
```
Three arguments.

Question.

Why three?

Let's understand.

---
`req`
Contains incoming data.
Examples:
```
req.method

req.url

req.headers

req.body

req.params

req.query

```

---

`res`

Contains response helpers.

Examples:

```
res.send()

res.json()

res.status()

res.end()

```
`next`

This is the most misunderstood function.

Question.

Why does it exist?

Imagine:

```
Checkpoint 1

↓

Checkpoint 2

↓

Checkpoint 3
```

How does checkpoint 1 allow the passenger forward?

It says:

```
next();

```

Without next(),

the request stops.

### Example
```
function logger(req,res,next){

    console.log(req.method);

    next();

}
```
Question.

What happens?

Request arrives.

↓

Logger executes.

↓

Prints:

```
GET
```
↓

Calls
```
next()
```
↓

Next middleware executes.

### What Happens if next() Isn't Called?

Suppose:
```
function logger(req,res,next){

    console.log("Logging");

}

```
Question.

What happens?

Nothing else.

Browser waits forever.

Why?

Because:

no response sent
no next called

Pipeline stops.

### Express Routing
Suppose
```
app.get("/products",handler);

app.post("/login",handler);

app.delete("/cart/:id",handler);
```
Question.

How does Express know which handler to execute?

Internally,

Express maintains a routing table.

Conceptually:

```
GET /products

↓

productsController
```

```
POST /login

↓

loginController
```

When a request arrives,

Express matches:

- Method
- Path

If matched,

the handler executes.

### Controller

Many beginners place all logic inside routes.

Example:
```
app.get("/products",(req,res)=>{

    // 200 lines

});
```
Question.

Good architecture?

No.

Instead:

```
app.get("/products",getProducts);
```
Controller 
```
async function getProducts(req,res){

}
```

Controllers have one responsibility:

Handle HTTP communication.

Not business rules.

### Service Layer

Question.

Where should pricing logic go?

Inside controller?

No.

Controllers should remain thin.

Instead:
```
Controller

↓

Service

↓

Repository

↓

Database
```
Service contains business rules.

Example:
```
Calculate Discount

Validate Coupon

Inventory Rules

Shipping Logic

```

### Repository Layer

Question.
Who talks to PostgreSQL?
Controller?
No.
Service?
No.

Repository.

Example
```
ProductRepository

↓

SELECT *

FROM products
```

Repository isolates database code.

If tomorrow you switch from PostgreSQL to another database, most changes stay inside the repository layer.

### The Full Enterprise Flow

```
Browser

↓

Express

↓

Logger Middleware

↓

Authentication Middleware

↓

Validation Middleware

↓

Router

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Controller

↓

Express

↓

Browser

```
Every professional backend roughly follows this flow.

---

### Homework

Don't write business logic yet.

Build only the skeleton.

```
src/

├── server.js
├── app.js
├── routes/
│      product.routes.js
│
├── controllers/
│      product.controller.js
│
├── services/
│      product.service.js
│
├── repositories/
│      product.repository.js
│
├── middleware/
│      logger.middleware.js
│
└── config/
```