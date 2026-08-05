Module 1 — Lecture 1
Think Like a Backend Engineer
Before writing a single line of code...

I want you to forget Node.js.

Forget Express.

Forget Redis.

Let's think like an engineer.


---

Scenario 1

Imagine you're building LinkedIn.

A user uploads their resume

```
POST /upload-resume
```

The resume is only 2 MB.

Should take less than a second, right?

Not exactly.

After upload, the company wants to do all of this.

```
Save file

↓

Extract text

↓

Virus scan

↓

AI resume analysis

↓

Generate PDF Preview

↓

Create Search Index

↓

Notify Recruiter

↓

Send Email

↓

Store Analytics

```

---

Question.

How long will this take?

Let's assume

```
Save File          300 ms
AI Analysis       5000 ms
Email              500 ms
Search Index      1500 ms
PDF Preview       2000 ms
Virus Scan        3000 ms

-------------------------

Total

≈12 seconds

```

---

Would you make the user wait 12 seconds?

Of course not.

Imagine clicking Upload and seeing...

```
Loading...

Loading...

Loading...

Loading...

12 seconds...

```
The user closes the browser.

Bad experience.

---

Solution?

Most beginners do this.
```
Client

↓

Express API

↓

Do Everything

↓

Return Response

```

Looks simple.

But it's terrible.

---

### Why?

Imagine 100 users upload resumes.

Each request takes 12 seconds.

```
User 1

↓

Express

12 sec

```

```
User 2

↓

Express

12 sec

```
Now imagine
```
1000 users
```

---
Your server becomes

```
CPU 100%

RAM Increasing

Timeout

Users Waiting

Requests Fail

```

### Question 1
### Why can't Express simply do all the work?

### Answer

Because `Express is responsible for handling HTTP requests, not performing heavy business processing.`

Express should
```
Receive Request

↓

Validate

↓

Authenticate

↓

Save minimal data

↓

Return Response

```
That's it.

Nothing more.

---

Think of Express as a receptionist.
```
Customer enters

↓

Receptionist registers name

↓

Gives token

↓

Customer sits

↓

Technicians do actual work

```

The receptionist doesn't repair the computer.

---

Express is the receptionist.

Workers are the engineers

---

### Question 2
### Then where does the heavy work happen?

Imagine a restaurant.

Customer orders pizza.

Does the waiter cook?

No.

```
Customer

↓

Waiter

↓

Kitchen

↓

Waiter

↓

Customer
```

The waiter only takes the order.

---

Backend architecture is identical.

```
Client

↓

Express

↓

Queue

↓

Worker

↓

Database

```

Express never cooks.

Workers cook.

---

### Question 3
### What is a Queue?

Imagine you're standing at a ticket counter.

```
Person A

Person B

Person C

Person D
```
Only one employee exists.

So people stand in line.
```
A

↓

B

↓

C

↓

D

```

That line is called `QUEUE`

---
Now replace people with jobs.
```
Send Email

Generate PDF

Resize Image

AI Summary

Send SMS

```

Instead of executing immediately,

they wait.

```
Queue

↓

Worker picks first

↓

Worker picks second

↓

Worker picks third
```

---

Redis is simply storing that waiting line

---

### Question 4
### Why Redis?

Could we use PostgreSQL?

Yes.

Companies did years ago.

But it's slow for this purpose.

Redis stores everything in memory.

Imagine

```
RAM

↓

Redis

↓

Extremely Fast
```

Compared to
```
Disk

↓

PostgreSQL

↓

Slower
```

For queues,

speed matters.

Redis can push and pop jobs in microseconds.

---

### Question 5
### Why not call the worker directly?

Suppose 
```
 Express

↓

Worker

```

Worker crashes.

Express crashes too.

Now every request fails.

Instead

```
Express

↓

Redis

↓

Worker

```

Redis becomes the middleman.

If Worker dies,

jobs remain safely in Redis.

A new worker starts.

Processing continues.

This separation makes the system much more resilient.

---

### Question 6
### What exactly is a Worker?

A worker is just another Node.js process.

You already know this.

When you run
```
node server.js
```
that creates one Node.js process.

Later we'll run
```
node worker.js

```
That's a completely different Node.js process.
```
Express Process

↓

Listening on Port 5000

```

and
```
Worker Process

↓

Listening to Redis

```
They don't talk directly.

Redis connects them.

---

The Complete Picture

```
                  Client
                     │
                     │ POST /upload
                     ▼
             ┌─────────────────┐
             │   Express API   │
             └─────────────────┘
                     │
         Save minimal request data
                     │
                     ▼
             ┌─────────────────┐
             │      Redis      │
             │     (Queue)     │
             └─────────────────┘
                     │
          Worker asks: "Any jobs?"
                     │
                     ▼
             ┌─────────────────┐
             │ Worker Process  │
             └─────────────────┘
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Send Email      AI Analysis    Generate PDF

```

The client gets a fast response while the heavy work continues in the background.

---

### Development Mindset

As a backend engineer, always ask yourself:

`Should this work happen while the user is waiting?`

If the answer is No, it probably belongs in a background job.

Examples include:

- Sending emails
- Sending SMS
- Push notifications
- Image resizing
- Video transcoding
- PDF generation
- AI processing
- Data imports
- Analytics aggregation
- Search indexing



### Interview Questions

You should be able to answer these without memorizing:

- Why is Redis commonly used with BullMQ instead of PostgreSQL?
- What happens if a worker crashes while processing a job?
- Why should Express return a response quickly?
- What is the Producer–Consumer pattern?
- What is the responsibility of an HTTP server versus a background worker?

---

Assignment (Don't skip)

Answer these five questions in your own words:

- Why shouldn't Express process heavy tasks?
- Why do we need Redis between Express and workers?
- What would happen if Redis didn't exist and Express called workers directly?
- Give five real-world features that should be processed in the background.
- In one sentence, explain the Producer–Consumer pattern

---


### Module 1 – Lecture 2,

### Setting Up a Production-Grade Development Environment






