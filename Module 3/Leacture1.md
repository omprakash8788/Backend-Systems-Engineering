### Lecture 1 — Why Enterprise Systems Fail (Even When the Code Is Correct)

`This is the beginning of real software engineering.`

Up to this point, you've learned how to write backend code.

From now on, you'll learn how to build `software that survives production.`

There is a sentence that every senior engineer eventually learns:

`"Correct code is not enough."`

---

### Example 1 — Amazon's "Buy Now"
Imagine you write
```
async function buyProduct(productId){

    const product = await db.product.findById(productId);

    if(product.stock > 0){

        product.stock--;

        await db.save(product);

    }

}

```

Looks correct.

Everyone in a coding interview would say:

 - "Perfect."

Is it?

Let's test it.

### Production Scenario

Database:
```
stock =1
```
Two customers click `Buy Now`.

Exactly the same millisecond.

```
Customer A

↓

buyProduct()
```
AND
```
Customer B

↓

buyProduct()
```

Both requests read:
```
stock = 1
```

Both pass:
```
if(stock > 0)
```
Both decrement.
Now.
```
stock = -1
```
Congratulations.

You just sold `one laptop to two people`

### Question

Did the code have a bug?

No.

Every line is correct.

The failure came from something else.

What?

---

### The Real Problem

The code assumed:

  - "I am the only request."

Reality:

```
10,000 Requests

Running

At

The

Same

Time
```

This is called:

Concurrency

### Engineering Mindset

`Junior Developer:`

"Does my code work?"

`Senior Engineer:`

"What happens if 5,000 users execute this code simultaneously?"

One question.

Massive difference

---

### Example 2 — Payment System

Imagine:
```
Pay ₹1000
```
Flow:
```
Deduct Money

↓

Create Order
```

Simple.

Now imagine:

```
Deduct Money

↓

💥 Server Crash

↓

Create Order Never Executes
```
Customer:

Money Gone.

Order Missing.

Who is responsible?

You.

---

### Question

Did the payment API fail?

No.

Did PostgreSQL fail?

No.

Your architecture failed.

---

### Example 3 — WhatsApp

Imagine sending:
```
Hello
```
Flow:
```
Phone

↓

Server

↓

Recipient
```

Now suppose:

Recipient is `offline.`

Should the message `disappear?`

No.

It must wait.

`Question.`

Where?

Memory?

Impossible.

Need `durable storage.`

Already we have `another engineering problem.`

### Example 4 — YouTube Upload
User uploads:
```
4GB video
```
Should API wait?

Imagine:

```
await convertVideo();

await generateThumbnail();

await generate1080p();

await generate720p();

await uploadCDN();
```
Processing takes:
```
18 Minutes
```
Will browser wait?

No.

Need background processing.

### Example 5 — Food Delivery

Suppose Swiggy has:
```
Restaurant

↓

Cooking

↓

Delivery Partner

↓

Customer

```
Question.

Should one service manage everything?

Or separate services?

Already we are discussing architecture,

not programming.

---

### The Five Reasons Enterprise Systems Fail

Most failures come from one (or more) of these categories.

### 1. Concurrency

Many users modify the same data simultaneously.

Examples:

 - Buying the last ticket.
 - Booking the same hotel room.
 - Reserving the same seat.

### 2. Distributed Systems

One request touches multiple services

```
Order

↓

Inventory

↓

Payment

↓

Notification

```
What if Inventory succeeds,

Payment fails?

Now your system is inconsistent.

---

### 3. Scale

Works for:
```
100 users
```

Fails for:
```
10 million users
```
Because:

 - Database overloaded.
 - Memory exhausted.
 - CPU saturated.
 - Network becomes a bottleneck.


---

4. Failure

Everything eventually fails.

Examples:

 - Database down.
 - Redis unavailable.
 - Kafka unavailable.
 - Network partition.
 - Disk full.
 - Server restarted.
 - DNS failure.
 - Cloud region outage.

Question.

Can your system survive?

---

### 5. Human Factors

Most systems live:
```
10+

Years 
```
Hundreds of engineers.

Thousands of pull requests.

Question.

Can someone understand your code after three years?

Maintainability becomes a business requirement

---

### Our Mental Model

Every feature we build from now on will answer these questions.

`Does it work?`

↓

`Does it scale?`

↓

`Can it fail safely?`

↓

`Can another engineer maintain it?`

↓

`Can we monitor it?`

↓

`Can we evolve it?`

Only then is it production-ready.


### Case Study

Imagine building an Order Service.

Junior thinking:
```
Receive Request

↓

Save Order

↓

Return Success
```

Senior thinking:
```
Receive Request

↓

Authenticate User

↓

Validate Input

↓

Check Inventory

↓

Reserve Inventory

↓

Calculate Pricing

↓

Start Transaction

↓

Create Order

↓

Publish Event

↓

Send Notification

↓

Write Audit Log

↓

Return Response

↓

Monitor Metrics
```
Notice.

The business problem is much larger than writing an API.