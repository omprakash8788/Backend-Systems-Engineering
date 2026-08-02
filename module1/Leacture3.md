### Lecture 3 — HTTP From First Principles

- Don't memorize HTTP.
- Derive why HTTP exists.

Today, you will understand HTTP deeply.
After this lecture, Express.js will stop looking like magic

### Before HTTP Existed...

- Let's go back to the year 1990.
- There is no REST API.
- No Express.
- No React.
- No JSON.
- Suppose two computers want to communicate.
- Computer A sends:

Computer A sends:
 `Give me all products.`

Computer B receives
 `Give me all products.`

Question:

How does Computer B know:

 - Is this a login request?
 - Is this a payment?
 - Is this an image?
 - Is this a file?
 - Is this a product request?

It doesn't

Humans understand language

Computers need strict rules


### First Principle

 - Communication only works if both sides agree on the format.
 - Think about cricket.
 - Imagine every player had different rules

One says
  `Six runs for a boundary`
Another says:
  `Four runs`

Would the game work? :- `No`

Everyone must follow the same rules.
HTTP is exactly that

---

### What is HTTP?
HTTP stands for `HyperText Transfer Protocol`

Think of it as: `A contract between a client and a server.`

Both agree: `Every request will look like this`, `Every response will look like this.`


### Anatomy of an HTTP Request

Every HTTP request has several parts.

```
 GET /products?page=2 HTTP/1.1

Host: amazon.com

Authorization: Bearer abc123

Accept: application/json

--------------------

Body (optional)

```
### Headers
Most beginners ignore headers.

Professionals know they're critical.

Example
```
 Authorization: Bearer JWT

```
Without it,

server doesn't know who you are.

Another
```
Content-Type: application/json
```
Server now knows

the body contains JSON.

Another
```
Accept: application/json

```
Client says

"I'd like JSON in return."

Headers are metadata about the request or response

### Body
Question

Where should user data go?

Login
```
Email
Password

```
Inside URL?
`/login?password=123456`

Terrible idea.
Reasons:
  - URLs can be logged by servers, browsers, and proxies.
  - They can appear in browser history.
  - They are visible in the address bar

Instead,
use the request body
```
POST /login

Body

{
   "email":"abc@gmail.com",
   "password":"******"
}
```

### Server Response

Every response has

Status Code

Headers

Body

### Status Codes

Question
 - Why not always return `200`
 Because
 the client needs to know what happened.

### 200 OK
Everything worked.

### 201 Created
New resource created.
Example

### 204 No Content
Success
Nothing to return.
Often used after delete operations.

### 400 Bad Request
Client sent invalid data.
Example
Missing email

### 401 Unauthorized
No valid authentication.
Example
JWT missing or invalid

### 403 Forbidden
Authenticated,
but not allowed.
Example
Normal user trying to access an admin endpoint.

### 404 Not Found
Resource doesn't exist.


### 500 Internal Server Error
Something broke on the server.
Usually a bug or unexpected failure.

### Statelessness
Now we reach one of HTTP's most important ideas.

Imagine:
`GET /profile`

How does the server know

who you are?

It doesn't.

HTTP is `stateless`.

Every request is independent.

The server doesn't automatically remember previous requests

### Then How Do Websites Remember Me?
That's where

 - Cookies
 - Sessions
 - JWTs
come in.

They add identity on top of stateless HTTP.

We'll study them in detail later

### Complete Picture
When you visit 
```
amazon.com/products
```

```
Browser

↓

Creates HTTP Request

↓

Adds Headers

↓

Adds Cookies or JWT

↓

Sends Request

↓

Node.js

↓

Express

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Database Response

↓

Express

↓

HTTP Response

↓

Browser
```

### Engineering Insight

When you see:
```
app.get("/products", getProducts);
```

don't think: `This is Express syntax.`

Think:

"This line tells the server: when an HTTP GET request arrives for /products, execute the code that fulfills the client's request."








