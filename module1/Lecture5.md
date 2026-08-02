### The Event Loop (The Heart of Node.js)

If you truly understand the Event Loop,

you understand why Node.js exists.

Most developers memorize:

 - async/await
 - Promise
 - setTimeout()

But they don't know what is actually happening.

Today we will


Before We Begin

I'm going to say something that confuses almost every beginner.

- Node.js is single-threaded...

But at the same time...

 - Node.js can serve thousands of users simultaneously.

These two statements seem contradictory.

Let's prove why they are both true.

### Chapter 1 — What is a Thread?
Forget programming.
Imagin one chef.
```
Chef
```
The chef can do only `one physical action at a time.`
He can:

 - Cut vegetables
 - Wash dishes
 - Cook rice

Can he physically do all three at the exact same instant?
No.

One human = one execution path
This is similar to `one thread`.

CPU Analogy

Suppose the CPU receives:
```
let a = 10;
let b = 20;
let c = a + b;

```
Can it execute all three JavaScript statements at exactly the same instant?
No.
It executes them one instruction after another.
```
Instruction 1

↓

Instruction 2

↓

Instruction 3
```
This ordered execution is the first mental model you need.

### The Call Stack
Every JavaScript function is executed on something called the Call Stack.

Imagine a stack of plates.
```
        washPlate()
        ------------
        cookRice()
        ------------
        makeDinner()

```

The most recently added plate is always removed first.

This is called LIFO (Last In, First Out).

### Example
```
function one() {
    two();
}

function two() {
    three();
}

function three() {
    console.log("Hello");
}

one();
```

### Suppose we read a file.
```
const fs = require("fs");

const data = fs.readFileSync("users.json");

```
Question:

Can JavaScript continue executing the next line before the file finishes reading?

No.

Why?
Because the function is still on the Call Stack.

The stack is blocked.

### The Problem
Suppose:

1000 users request

`GET /products`

Each request requires:
```
Read Database

↓

2 seconds
```
If every request blocks the main thread
then:
```
Request 1

↓

2 seconds

↓

Request 2

↓

2 seconds

↓

Request 3

↓

2 seconds
```

The server becomes extremely slow.

### Ryan Dahl's Question

Instead of waiting...

What if JavaScript said:

 - "I'll ask someone else to read the file."

Then continue executing other work.

This idea is the foundation of Node.js.

### Asynchronous I/O
Instead of:
```
Read File

↓

Wait

↓

Continue
```
Node.js does:
```
Read File

↓

Operating System

↓

Continue immediately
```
Notice something important.
JavaScript itself is not reading the file.
The operating system does.


### Who Reads the File?
Look carefully
```
Your JavaScript

↓

Node.js Runtime

↓

Operating System

↓

Hard Disk

↓

Operating System

↓

Node.js

↓

Your JavaScript
```
The file reading happens outside the JavaScript thread.

This is one of the biggest misconceptions beginners have.

### The Event Loop

Eventually,
the operating system finishes reading the file.
Now JavaScript must be informed.
Question:
How?
The answer:
The Event Loop.

### Mental Model

Imagine a receptionist again.
```
Customer arrives

↓

Receptionist gives work to kitchen

↓

Keeps serving customers

↓

Kitchen finishes

↓

Receptionist delivers food
```
The receptionist never stands in the kitchen waiting.

The Event Loop behaves similarly.

### The Event Loop Checks One Question
Over and over again.
```
Is the Call Stack empty?

↓

Yes?

↓

Execute the next waiting callback.
```

### Callback Queue
Suppose:
```
setTimeout(() => {

    console.log("A");

}, 1000);

```
Question:

Does the callback immediately go onto the Call Stack?
No.
It waits.
```
Timer finishes

↓

Callback Queue

↓

Event Loop

↓

Call Stack
```

Only when the Call Stack is empty does the Event Loop move it for execution.

### Example
```
console.log("Start");

setTimeout(() => {

    console.log("Timer");

}, 0);

console.log("End");
```

### Promise Microtasks
Now another important concept
Consider:
```
console.log("A");

Promise.resolve().then(() => {

    console.log("B");

});

console.log("C");

```

```
A

C

B
```
Why?

Because the Promise callback also waits until the current synchronous code finishes.

However, Promise callbacks are handled differently from timer callbacks.

### Microtask Queue
Node.js (and JavaScript environments generally) give higher priority to Promise callbacks.

Think of it like this:

```
Call Stack

↓

Microtask Queue

↓

Callback Queue
```

Whenever the Call Stack becomes empty,

the runtime first processes all available microtasks before taking the next callback from the callback queue

### Example
```
console.log("1");

setTimeout(() => {

    console.log("2");

}, 0);

Promise.resolve().then(() => {

    console.log("3");

});

console.log("4");
```

Let's reason it out.

Synchronous code:

```
1

4
```
Now the stack is empty.

Microtasks first:
```
3
```
Then timer callbacks:
```
2
```
Final output:
```
1

4

3

2
```

This ordering is essential to understand Promise and async/await

### async/await

Question:

Is await magic?

No.

It is syntax built on top of Promises.

When execution reaches:
```
await fetchData();
```
the async function pauses its own execution,

allowing the Event Loop to continue processing other work.

When the awaited Promise settles,

execution resumes.

Understanding Promises makes async/await much easier to understand.

### A Dangerous Mistake

Imagine writing:

```
while(true) {

}

```
Question:

What happens?

The Call Stack never becomes empty.

The Event Loop cannot process timers, network callbacks, or Promise continuations.

Your entire server appears frozen.

This is why CPU-heavy work on the main thread is dangerous in Node.js.

### The Complete Picture
```
                    JavaScript

                  Call Stack
                       │
                       ▼
                Synchronous Code
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
     Microtask Queue      Callback Queue
     (Promises, etc.)   (Timers, I/O, etc.)
            │                     │
            └──────────┬──────────┘
                       ▼
                  Event Loop
                       │
                       ▼
                Call Stack Again
```

Keep this diagram in your mind. It explains a huge amount of Node.js behavior.
