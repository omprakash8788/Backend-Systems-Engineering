Lecture 6 — libuv: The Engine Behind Node.js

`Today's Goal`

Today we're going to answer one question:

`If JavaScript is single-threaded, who is actually doing all the work?`


This lecture separates framework users from Node.js engineers.

Most developers know:

```
fs.readFile()

setTimeout()

http.createServer()

fetch()
```
Very few know what actually happens after these functions are called.

Today we will.


### Before We Start

Let's review something.

Suppose we execute:

```
const fs = require("fs");

fs.readFile("users.json", () => {
    console.log("Done");
});
```
Question.

Who is reading the file?

Is JavaScript reading it?

No.

JavaScript cannot read a hard disk.

Then who does?

Let's discover.

### First Principle

JavaScript is a programming language.

Languages do not know how to:

 - Read SSDs
 - Open TCP connections
 - Allocate network sockets
 - Create threads
 - Schedule timers

Those are operating system responsibilities.

So JavaScript needs help.

---
### Question

Then why doesn't Node.js simply ask Windows or Linux directly?

Why do we need another layer?

Excellent question.

Because every operating system is different.

Imagine you write:
```
fs.readFile("user.json")
```
Should your code change because you switched from:

 - Windows
 - Linux
 - macOS

Of course not.

Your JavaScript should remain identical.

Something must hide the operating system differences.

That "something" is libuv.

### What is libuv?
libuv is a C library that sits between Node.js and the operating system.

Think of it as a universal translator.

```
Your JavaScript

↓

Node.js

↓

libuv

↓

Windows / Linux / macOS

↓

Hardware

```
Without libuv,

Node.js would need separate implementations for every operating system

### Real Life Analogy

Imagine three countries.
```
India

Japan

Germany
```
Each speaks a different language.

Instead of learning all three,

you hire one translator.

```
You

↓

Translator

↓

Everyone Else

```
libuv is that translator.

Many people think:

Node.js = V8

Wrong.

Node.js consists of several important parts.

Conceptually:

```
                Node.js

        ┌────────────────────┐
        │   Your Code        │
        ├────────────────────┤
        │        V8          │
        ├────────────────────┤
        │      Node APIs     │
        ├────────────────────┤
        │       libuv        │
        ├────────────────────┤
        │ Operating System   │
        └────────────────────┘

```

Each layer has a different responsibility.

### Let's Follow One Request
Suppose you write:
```
fs.readFile("users.json");
```
Question.

What happens?

Let's slow time down.

### Step 1

Your JavaScript executes.

```
JavaScript

↓

fs.readFile()
```
### Step 2

Node.js receives the request.

It says:

 - "I cannot read disks."

So it forwards the work.

### Step 3

Node.js hands the task to libuv.

```
JavaScript

↓

Node.js

↓

libuv
```

### Step 4
libuv asks the operating system.
```
libuv

↓

Operating System

↓

Read File
```
Now JavaScript is free again.

It can execute other code

### Step 5

The operating system finishes.

It informs libuv.
```
Disk

↓

Operating System

↓

libuv
```

### Step 6
libuv tells Node.js:

 - "The file is ready."

### Step 7
Node.js places your callback into the appropriate queue.

Eventually the Event Loop executes it.
```
console.log("Done");
```

### The Entire Journey

```
Your Code

↓

Node.js

↓

libuv

↓

Operating System

↓

Hard Disk

↓

Operating System

↓

libuv

↓

Event Loop

↓

Callback Executes

```
This is what actually happens

---
### The Thread Pool

Now we reach one of the most misunderstood topics.

Question.

If JavaScript has only one thread,

how can file reading happen simultaneously?

Answer:

Because `JavaScript isn't doing it.`

libuv has a `thread pool.`

Think of a restaurant.

One receptionist.

Four chefs.
```
Customer

↓

Receptionist

↓

Chef 1

Chef 2

Chef 3

Chef 4
```

The receptionist doesn't cook.

The chefs do.

Similarly,

JavaScript doesn't perform certain blocking operations.

The thread pool helps perform them.

### Default Thread Pool Size

By default,

libuv creates: 
```
4 Worker Threads
```
Think of them as workers waiting for jobs.
```
Thread 1

Thread 2

Thread 3

Thread 4
```
When work arrives,

a free worker takes it.

### Example

Suppose five file reads happen together.

```
fs.readFile("1.txt");

fs.readFile("2.txt");

fs.readFile("3.txt");

fs.readFile("4.txt");

fs.readFile("5.txt");
```
Question.

We only have four workers.

What happens?

#### Worker allocation:
```
Worker 1 → File 1

Worker 2 → File 2

Worker 3 → File 3

Worker 4 → File 4

File 5 waits

```
When one worker finishes,

it picks up File 5.

### Question

Then can only four users use Node.js?

Absolutely not.

This is a very common misconception.

The thread pool is not responsible for handling every request.

It is used only for certain categories of work.

### Which Operations Use the Thread Pool?

Examples include:

- File system operations (fs)
- Some cryptographic operations (crypto)
- DNS lookups in some cases
- Compression (zlib)

These operations may involve the thread pool because they can block.

### What Does NOT Usually Use the Thread Pool?

Network I/O, such as:

HTTP servers
TCP sockets
Many database drivers

often relies on efficient operating system event notification mechanisms rather than occupying a thread per connection.

This is one reason Node.js can manage many concurrent network connections.

### Huge Misconception

People often say:

 - "Node.js uses four threads."

No.

A more accurate mental model is:

```
1 JavaScript Main Thread

+

Event Loop

+

libuv

+

Thread Pool

+

Operating System

```


### Engineering Insight

Think of JavaScript as the manager, not the laborer.

The manager:

- Accepts work
- Delegates it
- Continues organizing
- Processes completed results

The workers (operating system, libuv, thread pool when applicable) perform much of the waiting and low-level work.

### Complete Architecture

Keep this diagram in your head.

```
                   Your Code
                        │
                        ▼
                    JavaScript
                  (Main Thread)
                        │
                        ▼
                    Node.js APIs
                        │
                        ▼
                      libuv
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        Thread Pool         Evented I/O
      (files, crypto,      (networking,
       compression...)      sockets...)
              │                   │
              └─────────┬─────────┘
                        ▼
                 Operating System
                        ▼
                     Hardware
```

### Why Senior Engineers Care

Imagine production suddenly becomes slow.

A junior developer might say:

 - "Node.js is slow."

A senior engineer asks:

- Is the Event Loop blocked?
- Is the thread pool saturated?
- Is disk I/O slow?
- Is the database the bottleneck?
- Is the network overloaded?
- Is CPU-bound work blocking JavaScript?

Understanding the architecture lets you diagnose problems instead of guessing.


