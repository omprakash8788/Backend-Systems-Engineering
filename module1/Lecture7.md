### The Node.js Module System (From First Principles)

Today we stop writing "small JavaScript files."

Today we start learning how software is built.

Every production application—

 - Netflix
 - Uber
 - Amazon
 - Stripe
 - GitHub

contains thousands of files.

Why doesn't it become chaos?

Because of one idea:

Modules.

Today's Goal

By the end of this lecture you should understand:

 - Why modules exist
 - What problems they solve
 - What require() really does
 - What module.exports really is
 - What import/export really is
 - Why Node.js had CommonJS
 - Why JavaScript introduced ES Modules
 - Module caching
 - Circular dependency
 - How enterprise applications organize code

### Chapter 1 — Imagine There Were No Modules

Let's build a backend.
We need
```
Login

Products

Orders

Payments

Inventory

Users

Reviews

Shipping

```

Without modules everything goes into one file.

```
// app.js

// 18,000 lines

function login(){}

function logout(){}

function register(){}

function createProduct(){}

function deleteProduct(){}

function createOrder(){}

function cancelOrder(){}

function refund(){}

function createShipment(){}

...

```
Question.

Can one human understand this?

No.

The Real Problem Isn't Size

The real problem is complexity.

Suppose you're fixing payment logic.

Do you really want to search

```
18,000 lines
```
every time?

Of course not.

### First Principle

A software system should be divided into small independent pieces.

Exactly like a company.

Imagine Amazon.

Does one employee do everything?

No.

Departments exist.

```
CEO

│

├── HR

├── Finance

├── Marketing

├── Engineering

├── Sales

```

Each department has one responsibility.

Software should work exactly the same way

### A module is not just a file.

A module is

 - A unit of responsibility.

Sometimes one file.

Sometimes many files.

The file is only the container.

The module is the idea.

### Chapter 2 — Encapsulation

Question.

Suppose your bank stores

```
let balance = 1000;

```
Should every file modify it?

```
balance = 1000000;

```
No.

That would destroy correctness.

Instead,

the bank exposes only safe operations.
```
deposit()

withdraw()

getBalance()
```

Not
```
balance = ...
```
This is called encapsulation.

Modules help enforce it.

### Example

Imagine:
```
// payment.js

let secretKey = "...";

function chargeCard(){}

function refund(){}

module.exports = {

    chargeCard,

    refund

};
```
Notice.

The outside world cannot directly access

`secretKey`

Only exported members are public.

Everything else remains private to the module.

### Question

Then what exactly is
```
require()
```


### Chapter 3 — What Does require() Really Do?

Suppose we write:
```
const math = require("./math");
```
Most beginners think:

 - "It imports the file."

Not exactly.

Let's examine the process.

Imagine:
```
app.js

↓

require("./math")
```

Node.js performs several steps.

### Step 1

Resolve the path.
```
"./math"

↓

math.js

```
### step 2
Read the file from disk.
```
Hard Disk

↓

math.js
```

### Step 3
Execute the file.

This surprises many developers.

Node.js doesn't just read the file.

It actually runs it.

Suppose
```
console.log("Math Loaded");
```
You'll immediately see:
```
Math Loaded
```
when the module is first loaded

### Step 4

Return:
```
module.exports
```
Whatever the module exports becomes the value returned by require().

### Visual
```
require()

↓

Locate File

↓

Read File

↓

Execute File

↓

Return module.exports
```

### Chapter 4 — What is module.exports?
Consider:
```
// math.js

function add(a,b){

    return a+b;

}

module.exports = {

    add

};

```

Now:
```
const math = require("./math");

console.log(math);
```
becomes conceptually
```
{

    add: function(){}

}
```
require() returns whatever module.exports references.

### Why Not Export Everything?

Imagine a hospital.

Would every patient have access to:

 - Internal payroll
 - Employee passwords
 - Security cameras

No.

Only the necessary information is exposed.

Modules follow the same principle.


### Chapter 7 — CommonJS vs ES Modules
Historically,

Node.js created:
```
require()

module.exports

```
This system is called:

`CommonJS.`

Later,

JavaScript itself standardized modules.

Now we have:

```
import

export
```

Example
```
// math.js

export function add(a,b){

    return a+b;

}

```

```
import { add } from "./math.js";
```
This is called ES Modules (ESM).


