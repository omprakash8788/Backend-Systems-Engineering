### Module 3 — Lecture 2
### Concurrency — The Invisible Enemy

#### Today's Question

`"Node.js is single-threaded.`

`Then why do race conditions still happen?"`

If you truly understand today's lecture, you'll understand why companies like Amazon, BookMyShow, Stripe, and Uber invest enormous effort into concurrency control.

### Chapter 1 — The Biggest Myth

Almost every Node.js developer has heard this:

 - "Node.js is single-threaded."

Then they conclude:

 - "Race conditions cannot happen."

❌ This conclusion is wrong.

---

Let's Think

Suppose your server receives:
```
Request A
```
and 
```
Request B
```
at exactly the same moment.

Question:

Can Node.js receive both?

### Yes.

"But Node is single-threaded!"

Correct.

The JavaScript execution thread is single-threaded, but the `system is not.`

Remember from Module 1:

```
Client A
        \
         \
Client B ---> Operating System
         /
        /
Client C

↓

libuv

↓

Event Loop

↓

JavaScript Thread
```
Thousands of network connections can exist simultaneously.

---

### Question

Is JavaScript executing two functions at the exact same CPU instruction?

Usually no.

Can two independent requests overlap in time while waiting for I/O?

Absolutely.

That overlap is enough to create race conditions.

---

### Chapter 2 — What is Concurrency?

Concurrency is `multiple tasks making progress during overlapping periods of time.`

Notice I did `not` say "executing at the exact same instant."

Example:

```
Time →

Request A

Read Database
─────────────── Waiting

                    Resume

                    Write Database

Request B

       Read Database
────────────── Waiting

                        Resume

                        Write Database

```

Both requests overlap.

This is concurrency.

---

### Scenario 1 — Amazon (Overselling)
Batabase 
```
Product

Stock = 1
```

Two customers 
```
Customer A

Customer B
```

Both click:
```
Buy Now
```
---
Naive code:
```
const product = await db.findProduct(id);

if (product.stock > 0) {
    product.stock--;
    await db.save(product);
}
```
Looks correct.

---

Timeline:
```
Time →

A reads stock = 1

B reads stock = 1

A decrements to 0

B decrements to 0 (based on stale data)

A saves

B saves
```

Question:

How many laptops did we have?
```
1
```
How many customers think they bought it?
```
2
```
### Thinking

The bug isn't in JavaScript.

The bug is that both requests made decisions using outdated data.

This is called a race condition.

### Definition

A race condition occurs when:

- The correctness of the program depends on the order or timing of concurrent operations.

Notice.

If timing changes,

the result changes.

### Scenario 4 — WhatsApp
User sends:
```
Hello
```
Exactly when the recipient disconnects.

Question:

Should the message disappear?

No.

Need durable storage.

Need retries.

Need delivery acknowledgement.

Need idempotency.

Concurrency is everywhere.

---

### Chapter 5 — Why Databases Exist

Many beginners think:

PostgreSQL stores data.

That's only half true.

It also provides:

 - Transactions
 - Locks
 - Isolation
 - Recovery
 - Consistency
 - Crash safety
 - Concurrency control

A database is a concurrency engine as much as it is a storage engine.