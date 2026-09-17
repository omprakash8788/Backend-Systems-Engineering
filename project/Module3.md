### Module 3 — Distributed Systems

We are now moving from `queue mechanics` to `distributed-systems guarantees.`

This is a major transition.

You already built:
```
Module 1
Queue Fundamentals
        ↓
Module 2
Production Queue Patterns
        ↓
Module 3
Distributed Systems
```

The goal of Module 3 is to understand what happens when `multiple Node.js processes, workers, servers, and services operate on the same data at the same time.`

BullMQ itself is designed around an `at-least-once processing model in failure scenarios`, so this is exactly the right point to study these concepts.

---

### Module 3 — Lecture 1
### Exactly-Once vs At-Least-Once

This is one of the most important concepts in distributed systems.

If you understand this properly, later topics such as:

- distributed locks
- idempotency
- Redlock
- Outbox
- Inbox
- Saga

will become much easier.

---

### 1. The fundamental problem

Imagine our system receives:

```
POST /send-email
```

The API creates:

```
Email Job #100
```

Then:
```
API
 ↓
Redis
 ↓
Email Worker
 ↓
SMTP Provider
```

Suppose the worker sends the email successfully.

Then this happens:

```
Worker
  │
  ├── Send email ✅
  │
  └── Worker crashes 💥
```

The worker never gets the opportunity to tell the queue:

```
"Job completed."

```

Now the queue may think:

```
Job #100
     ↓
still processing
```

Eventually the job can be considered stalled and processed again. BullMQ explicitly documents this possibility: if a worker loses the job lock while processing, the job can be restarted and therefore processed more than once.

SO:
```
Email sent
      ↓
Worker crashes
      ↓
Job processed again
      ↓
Email sent again

```

Customer receives:
```
📧 Welcome email
📧 Welcome email
```

This is the heart of distributed processing.

---

### 2. At-least-once

At-least-once means:

- The system attempts to ensure the operation is processed at least one time, but it may be processed more than once.

Conceptually:
```
Message
   ↓
Worker
   ↓
Process
```

Normally:
```
1 message
   ↓
1 processing
```

But during failure:
```
1 message
   ↓
processing
   ↓
worker crashes
   ↓
retry
   ↓
processing again
```

Therefore:
```
Minimum = 1
Maximum = potentially >1
```

---

### 3. Why do systems use at-least-once?

Because distributed systems have failures.

Imagine the alternative.

The system says:

`"I promise this job will never execute twice."`

But the ***worker sends the email and crashes before acknowledging*** completion.

The system has two choices:

### Choice A

Assume it completed.

```
Don't retry
```

But what if the email was `not actually sent?`

You lose the operation.

### Choice B

Retry.

```
Try again
```

Now you might process twice.

Distributed systems generally prefer not losing work, and therefore retries can result in duplicate processing.

BullMQ's documentation recommends designing jobs to be ***idempotent,*** so retrying the same logical operation doesn't change the final result incorrectly.

---

### 4. Exactly-once

Exactly-once means conceptually:

```
1 logical operation
        ↓
exactly 1 successful effect
```

For example:
```
Payment #500
      ↓
Charge customer
      ↓
Exactly one charge
```

Not:
```
₹1,000
₹1,000
```

because the worker happened to retry.

---

### 5. The important distinction

There are actually two different things people often mix together:

### Message delivery
```
Was the message delivered once?
```
### Business effect
```
Did the business operation happen once?
```

These are not necessarily the same.

***For example:***

```

Queue
 ↓
Job delivered twice
 ↓
Worker
 ↓
Database prevents duplicate effect

```

The `delivery` was at-least-once.

But the `business effect` can still be exactly-once from the application's perspective.

This distinction is extremely important.

---

### 6. Example: Payment

Suppose:
```
paymentId = PAY-100
amount = ₹5000
```

Worker receives:
```

{
    "paymentId": "PAY-100",
    "amount": 5000
}
```

First attempt:

```

PAY-100
   ↓
Charge ₹5000
   ↓
SUCCESS

```

Worker crashes before acknowledging.

Second attempt:

```

PAY-100
   ↓
Charge ₹5000

```

Without protection:

```

₹5000 + ₹5000

```

Customer gets charged:

```
₹10,000

```

Bad.

---

### 7. Idempotency solves part of this

We can store:

```
paymentId = PAY-100
```

in the database.

Before processing:
```

Does PAY-100 already exist?

```

If:

```

NO

```

process it.

If:

```

YES

```

don't perform the operation again.

Conceptually:

```
             ┌── First attempt
             │
PAY-100 ─────┤
             │
             └── Retry
                  │
                  ▼
           Already processed?
              /        \
            YES         NO
             │           │
             ▼           ▼
          Ignore       Process
```

BullMQ also supports custom job IDs and deduplication mechanisms, which can help prevent duplicate queue entries, but queue-level deduplication alone does not solve every duplicate `business effect` problem.

---

### 8. Queue-level vs business-level idempotency

This is extremely important.

### Queue level
```
jobId = payment-PAY-100
```

This can prevent duplicate jobs from being added while that job still exists in the queue. BullMQ documents that custom job IDs can be used to avoid duplicate jobs.

### Business level

Database:
```

payments
----------------
payment_id
status
amount

```

The database protects:

```

PAY-100

```

from being applied twice.

##### Why do we need both?

Because:
```

Queue deduplication
        ≠
Business transaction safety

```

For example, BullMQ notes that once a job has been removed, its old job ID no longer prevents another job with that ID from being added.

---

### 9. Real-world example

Imagine an order system:

```

Order
 ↓
Payment
 ↓
Inventory
 ↓
Email

```

A retry could cause:

```

Payment       → duplicate ❌
Inventory     → duplicate ❌
Email         → duplicate ❌

```

So each operation needs appropriate protection.

For example:

```

Payment
  ↓
idempotency key

Inventory
  ↓
database constraint / transaction

Email
  ↓
idempotent notification record

```

This is why distributed systems aren't simply:

```

queue.add()

```

They require carefully designed state transitions.

---


### 10. At-most-once

There's a third model.

### At-most-once
```
0 or 1 processing

```

It means:

```

Never process twice

```

but:
```

It may never process at all.

```

For example:

```

Message
 ↓
Worker crashes
 ↓
No retry

```

Message is lost.

So:

```

At-most-once
    ↓
0 or 1

```

```
At-least-once
    ↓
1 or more

```

```
Exactly-once
    ↓
exactly 1

```

---

### 11. Comparison

```
| Model         | Minimum | Maximum | Main risk                                         |
| ------------- | ------: | ------: | ------------------------------------------------- |
| At-most-once  |       0 |       1 | Lost work                                         |
| At-least-once |       1 |      >1 | Duplicate processing                              |
| Exactly-once  |       1 |       1 | Extremely difficult across distributed boundaries |

```

The key lesson is:

`At-least-once + idempotent business operations is often the practical architecture.`

---

### 12. The mental model to remember

Think of it this way:

```
                 DISTRIBUTED SYSTEM
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Network         Worker         Redis
        failure         crash         failure
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    Retry needed
                         │
                         ▼
                 Duplicate possible
                         │
                         ▼
                   Idempotency
                         │
                         ▼
               Correct final state
```

This leads directly into our next lecture:

---





