### Building an HTTP Server from First Principles (Without Express)

- Today is the first day we write code.
- But we are not learning Express.
- We are learning what Express is built on top of.
- If you understand this lecture, Express becomes just another library.

By the end of this lecture, you will understand:

- What http.createServer() actually does.
- What happens internally when a client connects.
- What req (IncomingMessage) really is.
- What res (ServerResponse) really is.
- How routing works without Express.
- How JSON responses are created.
- Why Express exists.

### Question

How can our Node.js program listen for requests?
Node.js provides a built-in module called:

```
http

```

Notice:

- Not Express.
- Not Fastify.
- Not NestJS

This comes with Node.js itself.

### Creating Our First Server

Create a new folder

```
backend-course/
    app.js
```

Now write

```
const http = require("http");

```

### What Just Happened?

Let's slow down

```
const

↓

Create a variable
```

```
http

↓

Built-in Node.js module
```

```
require()

↓

Load that module into memory

```

Where did `http` come from?

Did we install it?

No.

Because it is part of Node.js.

Node ships with several built-in modules such as:

- http
- fs
- path
- os
- crypto

These are called `core modules`.

### Creating a Server

Now write:

```
const http = require("http");

const server = http.createServer();
```

Question:

Did we start the server?

No.

We only created it.

Think of buying a phone.

Buying it doesn't mean you're making calls.

### What Does createServer() Return?

- This is extremely important.
- Many beginners think it returns "a running server."
- It actually returns an object.
- Conceptually:

```
server

↓

{
  listen(),
  close(),
  on(),
  ...
}
```

This object knows how to:

 - Listen
 - Close
 - Accept connections
 - Emit events

Think of it as a machine that isn't switched on yet.

### Starting the Server
Now write:
```
server.listen(3000);
```

Question:

What is 3000?
Many people answer:
 - "The server number."
Not quite.

It is the port.
 - Remember Lecture 2

```
IP Address

+

Port

↓

Application


```

Our program is saying:

 - Operating System,

 - Please send all traffic arriving on port 3000 to me

### Visualizing What Happens
```
Browser

↓

localhost:3000

↓

Operating System

↓

Node.js Server
```
The operating system receives the network traffic first and then delivers it to the process listening on that port.

### Running the Server
Open the terminal

Run:
```
node app.js

```

Question:

Nothing appears.

Did it fail?

No.

The server is simply waiting.

Servers spend most of their life waiting for requests.

### Event-Driven Programming

Imagine a receptionist
Would they constantly shout

```
Any customer?

Any customer?

Any customer?
```
No.

They quietly wait.
When someone arrives,
they respond.

Node.js follows the same idea.
It reacts to events.
A request arriving is an event


### Receiving Requests
Now update the code:
```
const http = require("http");

const server = http.createServer((req, res) => {

});
```

Question:

Where did req and res come from?
We never created them.

Exactly.
Node.js creates them for every incoming request.

### What is req?
`req` stands for:
```
IncomingMessage
```
It contains information about the client's request.

For example:
```
GET /products
```

Node.js creates an object like:

```
req = {
    method: "GET",
    url: "/products",
    headers: {...}
}

```

This is simplified, but it's the right mental model.

### What is res?
`res` stands for
```
ServerResponse

```
It represents the response you will send back.

Conceptually:
```
res = {
    write(),
    end(),
    setHeader(),
    statusCode
}

```
Again, simplified but accurate enough for understanding

Request Life Cycle
Let's trace one request.
```
Browser

↓

GET /

↓

Operating System

↓

Node.js

↓

createServer()

↓

(req, res)

↓

Your Code

↓

res.end()

↓

Browser Receives Response
```

### Sending Our First Response
Inside the callback:
```
const http = require("http");

const server = http.createServer((req, res) => {

    res.end("Hello World");

});

server.listen(3000);

```
Run:
```
Inside terminal : node app.js
```

Open:
```
http://localhost:3000

```
You should see:
```
Hello World

```

Congratulations.

You just built a web server without Express.
 
### What Does res.end() Mean?
Think of writing a letter
```

Write content

↓

Seal envelope

↓

Send

```

`res.end() means:`

  - I have finished sending the response.

Without calling it,

the browser keeps waiting because it doesn't know the response is complete.


### Multiple Requests

Question:

If 1,000 users visit simultaneously,

does Node.js create 1,000 servers?

No.

It creates:
```
One Server

↓

Many Request Objects

↓

Many Response Objects

```
Each request has its own req and res

### Inspecting the Request

Let's print some information.

```
const http = require("http");

const server = http.createServer((req, res) => {

    console.log(req.method);

    console.log(req.url);

    res.end("Done");

});

server.listen(3000);

```

We can check the URL ourselves.

```
const http = require("http");

const server = http.createServer((req, res) => {

    if (req.url === "/") {

        res.end("Home Page");

    } else if (req.url === "/products") {

        res.end("Products Page");

    } else {

        res.end("Page Not Found");

    }

});

server.listen(3000);

```

Congratulations.

You just implemented your first router.

### But There's a Problem
Imagine: `1000`

Your code becomes:
```
if (...)

else if (...)

else if (...)

else if (...)

else if (...)

...
```
Eventually: `3000 lines`

Hard to read.
Hard to maintain.
This is one reason frameworks like Express exist.


### Returning JSON
Browsers understand more than plain text.
Suppose we want to return
```
{
    "name": "Laptop",
    "price": 50000
}
```
Can we do:
```
res.end({
    name: "Laptop"
});
```
No.

Why?

HTTP sends bytes.

Objects must be converted into text.

We use:
```
JSON.stringify()
```
```
const product = {
    name: "Laptop",
    price: 50000
};

res.end(JSON.stringify(product));
```
Now the object becomes a JSON string suitable for transmission.

### But One More Thing

The browser still doesn't know the response is JSON.

We should tell it.

```
res.setHeader("Content-Type", "application/json");

res.end(JSON.stringify(product));

```

Now the client understands how to interpret the response.

### Status Codes
Suppose a route doesn't exist

Instead of:
```
res.end("Not Found");
```

We should also set the status code.
```
res.statusCode = 404;

res.end("Not Found");
```

### Complete Example
```
const http = require("http");

const server = http.createServer((req, res) => {

    if (req.url === "/") {

        res.statusCode = 200;

        res.end("Home");

    } else if (req.url === "/products") {

        const products = [

            { id: 1, name: "Laptop" },

            { id: 2, name: "Phone" }

        ];

        res.setHeader("Content-Type", "application/json");

        res.statusCode = 200;

        res.end(JSON.stringify(products));

    } else {

        res.statusCode = 404;

        res.end("Route Not Found");

    }

});

server.listen(3000);
```

### Why Express Was Created

After writing this, imagine building:

 - 500 routes
 - Middleware
 - Authentication
 - Validation
 - Error handling
 - Cookies
 - File uploads

Doing all of that manually with the http module would be tedious.
Express doesn't replace Node.js.
Express builds on top of Node.js to provide higher-level abstractions.

### Mental Model
Never think:
```
Browser

↓

Express

↓

Database

```

Instead think:

```
Browser

↓

TCP Connection

↓

Node.js HTTP Server

↓

Express Router

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

```
Express is just one layer in a larger system
