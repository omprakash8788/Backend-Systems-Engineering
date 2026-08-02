### Lecture 2 — How the Internet Actually Works

We will derive everything from first principles.

### Today's Goal

At the end of today's lecture, you should be able to answer:
`When I type `google.com` and press Enter, what exactly happens?`

Not "the browser opens Google."

I mean every major step.

### Before We Start

Let's ask the most important question.

### Question

Imagine there is no Internet.
You have

```
Computer A
```

and

```
Computer B
```

How can they communicate?

- Don't think about HTTP.
-
- Don't think about Node.
-
- Don't think about browsers.
-
- Think like the first engineer who invented networking.

### First Principle

- Computers understand only two things:

```
0

1

```

Everything else eventually becomes binary.
Even

```
Even
```

becomes

```
01001000
01100101
01101100
01101100
01101111

```

So communication means

- One computer sends binary data to another computer.

### Problem 1

How do two computers even find each other?
Imagine Bangalore
There are millions of houses.
If I simply say

```
Deliver this parcel.
```

Can the delivery person deliver it?

No.

Why?

No address.

The same is true for computers.

- Every computer needs an address

### This Address Is Called an IP Address

Example - `192.168.1.5`

Every device on a network has an address.
Think of it as `House Address`

for computers.

### Analogy

```
Your Friend

↓

House Number

↓

Street

↓

City

```

Computer

```
Server

↓

IP Address

↓

Network

↓

Internet
```

Without an address - `Nobody knows where to send data`

If every website has an IP address
why do we type : `google.com`
instead of :`instead of`

Why

- Because humans are terrible at remembering numbers.
- We remember names
- Computers remember addresses.
- We need a translator

### DNS (Domain Name System)

- Think of DNS as the Internet's phonebook.
- Example

```
Mom

↓

+91xxxxxxxxxx

```

Your phone stores :- `Mom`
instead of the number

DNS does exactly that.

```
google.com

↓

142.xxx.xxx.xxx

```

### What Happens When You Press Enter?

Suppose you type
`google.com`

Let's slow everything down

```
Browser

↓

Needs IP Address

↓

Asks DNS

↓

DNS replies

↓

142.xxx.xxx.xxx

↓

Browser now knows where Google lives
```

Without DNS
the browser has nowhere to send the request

### Question

- Now we know Google's address.
- Can we send data?
- Not yet.
- Why?

Imagine a building.

```
Apartment Building

Address:
MG Road
```

Inside
there are

```
Flat 101

Flat 102

Flat 103

Flat 104

```

The address gets you to the building.

How do you know which apartment to visit?

Exactly
Computers have the same problem

### Ports

An IP identifies :- `Machine`
A Port identifies:- `Application`
Example

```
IP

↓

142.xxx.xxx.xxx

↓

Port 443

↓

HTTPS Server
```

### TCP (Transmission Control Protocol)

Its job is :- `Reliable Delivery`

It guarantees

- Correct order
- Missing packets resent
- Duplicate packets removed
- Error detection

Think of TCP as a highly reliable courier service

### UDP

UDP says

```
I'll send it.

Good luck.
```

- No guarantees.
- No retransmission.
- No ordering.
- Why would anyone use UDP?
- Because it is much faster.

### Example

Watching IPL live.

Would you rather

Wait five seconds

for one missing frame

or

Lose one frame and continue?

Exactly.

Streaming,

gaming,

voice calls
prefer speed.

Therefore,

they often use UDP.

### HTTP (HyperText Transfer Protocol)
Don't worry about the name

Think of it as :- `The language spoken between browser and server.`

Example
```
GET /products
```
Server understands
`User wants products.`

### A Real HTTP Request
```
GET /products HTTP/1.1

Host: amazon.com

Accept: application/json

User-Agent: Chrome

```

This is simply a structured message.

### Server Response
```
 HTTP/1.1 200 OK

Content-Type: application/json

{
    "products":[]
}
```

Notice something.

The browser and server follow an agreed format.

That's all a protocol is

 `A set of rules that both sides agree to follow.`

### Where Does Node.js Fit?
 - Now we finally arrive at Node.js.
 - Imagine this
```
 Internet

↓

TCP Connection

↓

HTTP Request

↓

Node.js

↓

Your Code

↓

Database

↓

Node.js

↓

HTTP Response

↓

Browser
```

Node.js is the runtime that listens for incoming network connections, parses requests (often with the help of libraries or frameworks), executes your JavaScript, and sends responses back.

When we use Express later, Express will make working with HTTP much more convenient, but it's built on top of Node's networking capabilities

### Complete Journey
Let's put everything together

```
You type

google.com

↓

Browser

↓

DNS Lookup

↓

Gets IP Address

↓

Connects to Port 443

↓

TCP Connection

↓

HTTPS (encrypted HTTP)

↓

HTTP Request

↓

Node.js Server

↓

Business Logic

↓

Database

↓

Database Returns Data

↓

Node.js Creates Response

↓

HTTP Response

↓

Browser Renders Page
```

This sequence is the foundation of almost every web application you'll build.

### Engineering Mindset
When you become a senior backend engineer, you stop seeing:
`GET /users`
Instead, your mind sees:

```
Name

↓

DNS

↓

IP

↓

Port

↓

TCP

↓

TLS

↓

HTTP

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

Response
```
That mental model helps you debug, optimize, and design systems far more effectively than simply knowing framework APIs.