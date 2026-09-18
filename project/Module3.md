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

But the **_worker sends the email and crashes before acknowledging_** completion.

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

BullMQ's documentation recommends designing jobs to be **_idempotent,_** so retrying the same logical operation doesn't change the final result incorrectly.

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

**_For example:_**

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

### Module 3 — Lecture 2

### Lecture 2 - Distributed Locks

We now move from:

- `A job can execute more than once.`

to:

`How do multiple workers coordinate so that only one of them performs a critical operation at a time?`

This is the foundation for **Redlock, leader election, race-condition prevention, and several production coordination patterns.**

Redis documents the `SET key value NX PX` pattern as the basic single-instance locking primitive; importantly, the lock value should be unique and releasing the lock safely requires checking that the value still belongs to the client that acquired it.

---

### 1. The problem we're solving

Imagine we have two workers:

```
Worker A
Worker B
```

Both receive work concerning the same resource:

```
account:1001
```

At almost exactly the same time:

```
Worker A ───────┐
                ├──> account:1001
Worker B ───────┘
```

Both execute:

```
const balance = await getBalance();

const newBalance = balance - 100;

await saveBalance(newBalance);
```

Suppose the balance is:

```
₹1000
```

Both workers read:

```

Worker A → ₹1000
Worker B → ₹1000

```

Then:

```
Worker A → ₹900
Worker B → ₹900
```

Expected:

```
₹1000 - ₹100 - ₹100 = ₹800
```

Actual:

```
₹900
```

We lost one operation.

That's a `race condition.`

---

### 2. Why normal JavaScript doesn't solve this

You might think:

```
let processing = false;
```

and:

```
if (processing) {
    return;
}

processing = true;

await doWork();

processing = false;

```

This does `not` solve the distributed problem.

Why?

Because we might have:

```

Server 1
   │
   └── processing = false


Server 2
   │
   └── processing = false

```

Each Node.js process has its own memory.

So:

```
Server 1 memory ≠ Server 2 memory
```

A local variable cannot coordinate independent processes.

---

### 3. What is a distributed lock?

A distributed lock is a coordination mechanism where multiple processes agree:

`Only the process holding this lock may perform this critical operation.`

Conceptually:

```
              Redis
                │
       ┌────────┴────────┐
       │                 │
   Worker A           Worker B
       │                 │
    acquire           acquire
       │                 │
       ▼                 ▼
     LOCK              DENIED
       │
       ▼
   critical work
       │
       ▼
    release
```

Worker B waits or exits.

---

### 4. Why Redis?

You already have Redis in this project:

```
Node.js
   │
   ├── BullMQ
   │
   └── Redis

```

Redis gives us an atomic command:

```
SET key value NX PX ...

```

NX means:

```
Set the key only if it doesn't already exist.

```

**PX** gives the key a millisecond expiration.

Therefore:

```

SET lock:account:1001 worker-A NX PX 10000
```

means:

```
If lock doesn't exist:
    create it
    expire after 10 seconds

Otherwise:
    don't create it

```

---

### 5. The critical property

Suppose:

```
Worker A
Worker B

```

both execute:

```

SET lock:account:1001 ...
NX
```

Redis processes commands atomically.

One gets:

```
OK
```

The other gets:

```
null
```

So:

```
Worker A → LOCK ACQUIRED ✅
Worker B → LOCK DENIED ❌

```

This is the basic idea.

---

### 6. Important: don't use SETNX + EXPIRE

You may see code like:

```
await redis.setnx(
    "lock:account:1001",
    "worker-A"
);

await redis.expire(
    "lock:account:1001",
    10
);
```

Don't build our production lock this way.

There is a gap:

```
SETNX
  ↓
process crashes 💥
  ↓
EXPIRE never happens
```

Now you can have a lock that remains forever.

Redis recommends using SET with NX and an expiration instead of the old SETNX locking pattern.

Use:

```
SET lock value NX PX ttl
```

as one atomic operation.

---

### 7. The lock must have an owner

This is extremely important.

Don't use:

```
lock:account:1001 → "locked"

```

Use something unique:

```
lock:account:1001 → "550e8400-e29b-41d4-a716-446655440000"

```

That value is the `lock token.`

Why?

Because imagine:

```

Worker A acquires lock
       ↓
Worker A becomes slow
       ↓
lock expires
       ↓
Worker B acquires lock
       ↓
Worker A finishes

```

Worker A must `not` delete Worker B's lock.

That's why the owner token matters.

Redis's documented single-instance algorithm specifically requires a unique random value and safe release only when the stored value matches that value.

---

### 8. The dangerous implementation

Never blindly do:

```
await redis.del(
    "lock:account:1001"
);
```

Why?

Imagine:

```
Time ─────────────────────────────>

Worker A
   │
   ├── acquires lock
   │
   ├── lock expires
   │
   │                 Worker B
   │                    │
   │                    ├── acquires lock
   │                    │
   │
   └── DEL lock ❌
```

Worker A just deleted **Worker B's lock.**

That's a serious distributed-systems bug.

---

### 9. Safe release

The correct idea is:

```
Get lock value

       ↓

Is it MY token?

     /     \
   YES      NO
    │        │
    ▼        ▼
 DELETE    DON'T DELETE
```

The comparison and deletion must happen atomically.

Redis documents using a script for this purpose.

Conceptually:

```
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

This means:

- Delete the lock only if I still own it.

---

### 10. Our first production-style lock

Because your project already has:

```
src/config/redis.ts
```

and uses:

```
ioredis
```

we will build the lock around your existing Redis connection.

**_Important project rule_**

For this lecture:

```
CREATE
1 new file

EDIT
None initially

DELETE
None
```

We don't want to mix distributed-lock logic into `queue-manager.service.ts`, `queue-router.service.ts`, or another existing service.

Create:

```
src/services/distributed-lock.service.ts
```

This is the first new file specifically dedicated to distributed coordination.

---

### 11. Create the lock service

### CREATE

```
src/services/distributed-lock.service.ts
```

Add:

```
import { randomUUID } from "crypto";
import { redis } from "../config/redis.js";

export class DistributedLockService {

    static async acquire(
        resource: string,
        ttlMs: number
    ): Promise<string | null> {

        const token = randomUUID();

        const result = await redis.set(
            `lock:${resource}`,
            token,
            "PX",
            ttlMs,
            "NX"
        );

        if (result !== "OK") {
            return null;
        }

        return token;
    }

    static async release(
        resource: string,
        token: string
    ): Promise<boolean> {

        const key = `lock:${resource}`;

        const result = await redis.eval(
            `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            `,
            1,
            key,
            token
        );

        return result === 1;
    }
}
```

---

### 12. Understand acquire()

This:

```
const token = randomUUID();
```

create:

```
Worker A
token = abc123
```

Worker B:

```
token = xyz789
```

Then:

```
await redis.set(
    `lock:${resource}`,
    token,
    "PX",
    ttlMs,
    "NX"
);
```

For:

```
resource = account:1001
```

Redis gets:

```
lock:account:1001
```

with:

```
abc123
```

---

### 13. First worker

Worker A:

```
SET lock:account:1001 abc123 NX PX 10000
```

Redis:

```
OK
```

So:

```
return token;
```

returns:

```
abc123
```

Meaning:

```
Worker A owns the lock.
```
---

### 14. Second worker

Worker B:
```
SET lock:account:1001 xyz789 NX PX 10000
```
But:
```
lock:account:1001
```
already exists.

Therefore:
```
result = null
```
Our service returns:
```
null
```
Meaning:
```
Lock not acquired.
```
---

### 15. TTL

We use:
```
"PX",
ttlMs
```

For example:
```
5000
```

means:
```
5 seconds
```
So:
```
Worker acquires lock
       ↓
5 seconds
       ↓
Redis automatically expires lock
```

This protects against:
```
Worker crashes
       ↓
lock never released
```

The lock eventually disappears.

Redis's SET supports millisecond expiry through PX

---

### 16. Test it manually

Don't connect it to your workers yet.

First test the primitive.

Temporarily create a small test using your existing testing setup if you already have one. **Do not create another permanent application entry point.**

The test should conceptually execute:

```
const token =
    await DistributedLockService.acquire(
        "account:1001",
        10000
    );

console.log(token);

```

Run it once.

Expected:
```
some UUID
```
Run it again before the 10 seconds expires.

Expected:
```
null
```
---

### 17. Redis verification

You can inspect the lock directly with Redis CLI:

```
GET lock:account:1001
```
Expected:
```
"some-uuid"
```
Then wait for the TTL.
```
GET lock:account:1001
```
Expected:
```
(nil)
```
You can also inspect:
```
TTL lock:account:1001
```
and see the remaining lifetime in seconds.

---

### 18. Test release

Suppose:
```
token = abc123
```
Call:
```
await DistributedLockService.release(
    "account:1001",
    "abc123"
);

```
Expected:
```
true
```
Then:
```
GET lock:account:1001
```
should return:
```
(nil)
```

---


### What we have actually built

Our system now has:

```
                 Redis
                   │
                   │
          lock:account:1001
                   │
          ┌────────┴────────┐
          │                 │
      Worker A           Worker B
          │                 │
       acquire            acquire
          │                 │
          ▼                 ▼
        UUID               null
          │
          ▼
    Critical Section
          │
          ▼
       release

```

That's a single Redis instance distributed lock.

---

