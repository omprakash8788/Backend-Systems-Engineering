### Module 2 — Advanced Queue Patterns
#### Lecture 1 — Multiple Queues & Queue Routing (Production Grade)

Welcome to `Module 2.`

In Module 1, we learned how to build a `single production-grade queue.`

That works for small applications.

But in real systems like Amazon, Uber, Netflix, Stripe, or GitHub, `one queue is almost never enough.`

---

### Why One Queue Becomes a Problem

Imagine your application handles:

- Email sending
- PDF generation
- Image processing
- Video encoding
- Payment processing

If everything goes into one queue:

```
                    email-queue

     Email
        │
PDF ----┼----
        │
Images -┼----
        │
Video --┼----
        │
Payment-┼----
```

Suppose someone uploads a 5 GB video.

That job takes:

```
20 minutes
```

Now your password reset email waits behind it.

Not acceptable.

---

### Production Architecture

Instead:

```
                Redis

                  │

      ┌───────────┼────────────┐

      ▼           ▼            ▼

 Email Queue   Image Queue   Payment Queue

      │           │            │

      ▼           ▼            ▼

 Email Worker Image Worker Payment Worker
```

Each type of work has:

- Its own queue
- Its own worker
- Its own retry policy
- Its own concurrency
- Its own monitoring

---

### Goal of This Lecture

We'll refactor our project.

Current:
```
Producer

↓

Email Queue

↓

Worker
```

New:
```
Producer

↓

Queue Router

↓

Email Queue

PDF Queue

Notification Queue
```

---


### New Folder Structure

Update your project:

```
src/
│
├── queues/
│   ├── email.queue.ts
│   ├── pdf.queue.ts
│   └── notification.queue.ts
│
├── workers/
│   ├── email.worker.ts
│   ├── pdf.worker.ts
│   └── notification.worker.ts
│
├── services/
│   └── queue-router.service.ts
│
├── controllers/
├── routes/
└── config/
```

---

### Step 1 — Create PDF Queue

Create:
```
src/queues/pdf.queue.ts
```

Write:
```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const pdfQueue = new Queue(
    "pdf-queue",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 3,
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
);
```

---

Step 2 — Create Notification Queue

Create:

```
src/queues/notification.queue.ts
```

```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const notificationQueue = new Queue(
    "notification-queue",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 5,
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
);
```

Notice:

Email and notification retries are different.

Each queue can have its own configuration.

---

### Step 3 — Create PDF Worker

Create:
```
src/workers/pdf.worker.ts
```

```
import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

export const pdfWorker = new Worker(
    "pdf-queue",

    async (job) => {

        logger.info(
            {
                jobId: job.id,
                reportId: job.data.reportId,
            },
            "Generating PDF"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 3000)
        );

        logger.info(
            {
                jobId: job.id,
            },
            "PDF generated"
        );

    },

    {
        connection: redis,
        concurrency: 2,
    }
);
```

---

### Step 4 — Create Notification Worker

Create:
```
src/workers/notification.worker.ts
```

```
import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

export const notificationWorker = new Worker(
    "notification-queue",

    async (job) => {

        logger.info(
            {
                userId: job.data.userId,
                type: job.data.type,
            },
            "Sending notification"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );

        logger.info("Notification sent");

    },

    {
        connection: redis,
        concurrency: 10,
    }
);
```

Notice:

Notifications can run with higher concurrency than PDFs.

---

### Step 5 — Register Workers

Open:
```
src/worker.ts
```

Add:
```
import "./workers/pdf.worker";
import "./workers/notification.worker";
```

Now your imports should include:
```
import "./workers/email.worker";
import "./workers/pdf.worker";
import "./workers/notification.worker";
```

---

### Step 6 — Create Queue Router

Instead of controllers knowing every queue, we'll create a routing service.

Create
```
src/services/queue-router.service.ts
```

```
import { emailQueue } from "../queues/email.queue";
import { pdfQueue } from "../queues/pdf.queue";
import { notificationQueue } from "../queues/notification.queue";

export class QueueRouter {

    static async sendEmail(email: string) {

        return emailQueue.add(
            "send-email",
            {
                email,
            }
        );

    }

    static async generatePdf(reportId: string) {

        return pdfQueue.add(
            "generate-pdf",
            {
                reportId,
            }
        );

    }

    static async sendNotification(
        userId: string,
        type: string
    ) {

        return notificationQueue.add(
            "notify",
            {
                userId,
                type,
            }
        );

    }

}
```

Now the rest of the application doesn't care which queue is used.

---

### Step 7 — Create a PDF Controller

Create:
```
src/controllers/pdf.controller.ts
```

```
import { Request, Response } from "express";
import { QueueRouter } from "../services/queue-router.service";

export async function generatePdf(
    req: Request,
    res: Response
) {

    const { reportId } = req.body;

    const job = await QueueRouter.generatePdf(reportId);

    return res.status(202).json({
        success: true,
        jobId: job.id,
    });

}
```

---

### Step 8 — Create Routes

Create:

```
src/routes/pdf.routes.ts
```

```
import { Router } from "express";
import { generatePdf } from "../controllers/pdf.controller";

const router = Router();

router.post(
    "/generate-pdf",
    generatePdf
);

export default router;
```

---

### Step 9 — Register Routes

Open:
```
src/app.ts
```

Add:
```
import pdfRoutes from "./routes/pdf.routes";
```
Register:
```
app.use("/api/v1", pdfRoutes);
```

---

### Step 10 — Test

Restart everything.

API

```
npm run dev
```

Worker
```
npm run dev:worker
```

---

Request:
```
POST /api/v1/generate-pdf
```

Body:
```
{
    "reportId": "report-001"
}
```

Expected API response:
```
{
    "success": true,
    "jobId": "1"
}
```

Worker logs:
```
Generating PDF

↓

PDF generated
```

Your email queue remains completely unaffected.

---

What we already built
✅ Email Queue
✅ PDF Queue
❌ Notification API (missing)
❌ Notification Route (missing)
❌ Notification Testing (missing)

Let's finish it.

---

### Step 1 — Create Notification Controller

File
```
src/controllers/notification.controller.ts
```

```
import { Request, Response } from "express";
import { QueueRouter } from "../services/queue-router.service";

export async function sendNotification(
    req: Request,
    res: Response
) {
    const { userId, type } = req.body;

    const job = await QueueRouter.sendNotification(
        userId,
        type
    );

    return res.status(202).json({
        success: true,
        message: "Notification queued successfully",
        jobId: job.id,
    });
}
```

---

### Step 2 — Create Notification Routes

File
```
src/routes/notification.routes.ts
```

```
import { Router } from "express";
import { sendNotification } from "../controllers/notification.controller";

const router = Router();

router.post(
    "/send-notification",
    sendNotification
);

export default router;
```

---

Step 3 — Register Routes

Open

```
src/app.ts
```

import
```
import notificationRoutes from "./routes/notification.routes";
```

Register
```
app.use("/api/v1", notificationRoutes);
```

Now your routes should include:

```
app.use("/api/v1", emailRoutes);
app.use("/api/v1", pdfRoutes);
app.use("/api/v1", notificationRoutes);
```

---

Step 4 — Verify Queue Router

Open
```
src/services/queue-router.service.ts
```

Verify it contains:
```
static async sendNotification(
    userId: string,
    type: string
) {
    return notificationQueue.add(
        "notify",
        {
            userId,
            type,
        }
    );
}
```

Nothing else is needed.

---

### Step 5 — Restart Application

Terminal 1

```
npm run dev
```

Terminal 2

```
npm run dev:worker
```

### Test 1 — Email Queue

Request
```
POST /api/v1/send-email
```

Body
```
{
    "email": "john@example.com"
}
```

Expected Response
```
{
    "success": true,
    "jobId": "..."
}
```

Expected Worker Log
```
Processing email...

↓

Email sent
```

### Test 3 — Notification Queue

Request
```
POST /api/v1/send-notification
```
Body
```
{
    "userId": "123",
    "type": "WELCOME"
}
```

Expected Response

```
{
    "success": true,
    "message": "Notification queued successfully",
    "jobId": "..."
}
```

Expected Worker Log
```
Sending notification

↓

Notification sent
```

---

### Test 4 — Queue Isolation

Queue these jobs quickly:

```
POST /api/v1/send-email
```

```
POST /api/v1/generate-pdf
```

```
POST /api/v1/send-notification
```

Expected behavior:
```
Email Worker
↓

Processes Email

--------------------

PDF Worker
↓

Processes PDF

--------------------

Notification Worker
↓

Processes Notification
```

Each worker only processes its own queue.

---

### Test 5 — Worker Failure Isolation
1. Stop the PDF worker temporarily (or comment out its import in worker.ts).
2. Submit:
```
POST /api/v1/generate-pdf
```

Expected:
```


- PDF job stays in pdf-queue.
- Email jobs continue processing.
- Notification jobs continue processing.

This demonstrates fault isolation.
```

---

### Test 6 — Redis Verification

Open Redis Commander (if you're using it).

You should now see separate queues like:

```
bull:email-queue

bull:pdf-queue

bull:notification-queue
```

Each queue maintains its own waiting, active, completed, and failed jobs.

---


### Project Structure After Lecture 1

```
src/
├── controllers/
│   ├── email.controller.ts
│   ├── pdf.controller.ts
│   └── notification.controller.ts
│
├── routes/
│   ├── email.routes.ts
│   ├── pdf.routes.ts
│   └── notification.routes.ts
│
├── queues/
│   ├── email.queue.ts
│   ├── pdf.queue.ts
│   └── notification.queue.ts
│
├── workers/
│   ├── email.worker.ts
│   ├── pdf.worker.ts
│   └── notification.worker.ts
│
├── services/
│   └── queue-router.service.ts
```


### Why This Architecture Matters

Imagine:
```
500 PDF Jobs

5 Email Jobs
```

With one queue:
```
PDF
PDF
PDF
PDF
PDF
Email
```

The email waits.

With separate queues:

```
PDF Queue

↓

PDF Worker

-------------------

Email Queue

↓

Email Worker

```

The email is processed immediately.

---

### Testing Checklist
##### Test 1

Submit an email job.

Verify the email worker handles it.

---

### Test 2

Submit a PDF job.

Verify the `PDF worker` handles it.

---

### Test 3

Stop the PDF worker.

Submit another PDF job.

Verify:

- The job remains in the pdf-queue.
- Email jobs continue processing normally.

This demonstrates fault isolation between queues.


---

### Production Notes

A good rule is:

- One queue per type of workload, not necessarily one queue per API endpoint.
- Tune each queue independently (concurrency, retries, rate limits).
- Avoid putting unrelated long-running and short-running jobs in the same queue.

---

### What You Learned

You now know how to:

✅ Create multiple BullMQ queues.
✅ Assign dedicated workers to each queue.
✅ Route jobs through a service layer.
✅ Isolate workloads for better reliability and performance.
✅ Prepare your architecture for scaling each queue independently.


---
---



### Lecture 2 — Job Flows (Parent–Child Jobs) with BullMQ FlowProducer

Welcome to one of BullMQ's most powerful features.

Until now, every job has been independent.

```
Send Email

↓

Done
```

But real business processes are rarely a single task.

Imagine an invoice system.

When a customer places an order:

```
Create Invoice

↓

Generate PDF

↓

Upload PDF

↓

Send Email

↓

Notify User

```

These jobs depend on each other.

If PDF generation fails, the email must not be sent.

This is exactly what `FlowProducer` solves.

---

### Learning Objectives

By the end of this lecture you will be able to build workflows like:

```
             Parent Job

          Create Invoice

      ┌────────┼─────────┐

      ▼        ▼         ▼

 Generate PDF Upload PDF Notify User

      │

      ▼

 Send Email
```

The parent completes only after all children succeed.

---

### What You'll Build

We'll build this workflow:

```
Generate Report

│

├── Generate PDF

├── Send Notification

└── Send Email
```

---

### Folder Structure

No new folders.

We'll add:

```
src/

├── services/
│      workflow.service.ts
│
├── controllers/
│      workflow.controller.ts
│
├── routes/
│      workflow.routes.ts
```

---

### Step 1 — Create Workflow Service

Create

```
src/services/workflow.service.ts
```

```
import { FlowProducer } from "bullmq";
import { redis } from "../config/redis";

const flowProducer = new FlowProducer({
    connection: redis,
});

export class WorkflowService {

    static async createReportWorkflow(
        reportId: string,
        email: string,
        userId: string
    ) {

        return flowProducer.add({
            name: "create-report",

            queueName: "workflow-queue",

            data: {
                reportId,
            },

            children: [

                {
                    name: "generate-pdf",

                    queueName: "pdf-queue",

                    data: {
                        reportId,
                    },
                },

                {
                    name: "send-email",

                    queueName: "email-queue",

                    data: {
                        email,
                    },
                },

                {
                    name: "notify",

                    queueName: "notification-queue",

                    data: {
                        userId,
                        type: "REPORT_READY",
                    },
                },
            ],
        });

    }

}
```

Notice something important.

The workflow itself has `no worker yet.`

The child jobs will automatically be sent to the queues we already created.

---

### Step 2 — Create Parent Queue

Create
```
src/queues/workflow.queue.ts
```

```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const workflowQueue = new Queue(
    "workflow-queue",
    {
        connection: redis,
    }
);
```

---

### Step 3 — Create Parent Worker

Create
```
src/workers/workflow.worker.ts
```

```
import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

export const workflowWorker = new Worker(
    "workflow-queue",

    async (job) => {

        logger.info(
            {
                reportId: job.data.reportId,
            },
            "Workflow completed successfully."
        );

    },

    {
        connection: redis,
    }
);
```

This worker executes `only after every child job succeeds.`

---

### Step 4 — Register Worker

Open
```
src/worker.ts
```
Add
```
import "./workers/workflow.worker";
```
Now your imports should look similar to:
```
import "./workers/email.worker";
import "./workers/pdf.worker";
import "./workers/notification.worker";
import "./workers/workflow.worker";
```

---

### Step 5 — Create Controller

Create
```
src/controllers/workflow.controller.ts
```

```
import { Request, Response } from "express";
import { WorkflowService } from "../services/workflow.service";

export async function createWorkflow(
    req: Request,
    res: Response
) {

    const {
        reportId,
        email,
        userId,
    } = req.body;

    const flow = await WorkflowService.createReportWorkflow(
        reportId,
        email,
        userId
    );

    return res.status(202).json({
        success: true,
        flowId: flow.job.id,
    });

}

```

---

### Step 6 — Create Route

Create
```
src/routes/workflow.routes.ts
```

```
import { Router } from "express";
import { createWorkflow } from "../controllers/workflow.controller";

const router = Router();

router.post(
    "/workflow/report",
    createWorkflow
);

export default router;

```

---

### Step 7 — Register Route

Open
```
src/app.ts
```

Import
```
import workflowRoutes from "./routes/workflow.routes";
```

Register
```
app.use("/api/v1", workflowRoutes);
```

---

### Step 8 — Restart Everything

Terminal 1
```
npm run dev
```
Terminal 2
```
npm run dev:worker
```


---

### Test 1 — Create Workflow

Request
```
POST /api/v1/workflow/report
```

Body

```
{
    "reportId": "report-1001",
    "email": "john@example.com",
    "userId": "user-1"
}
```

Expected response
```
{
    "success": true,
    "flowId": "..."
}
```

---

### Test 2 — Verify Worker Logs

Expected log order:
```
PDF Worker

↓

Generating PDF

↓

PDF generated

------------------

Email Worker

↓

Processing email

↓

Email sent

------------------

Notification Worker

↓

Sending notification

↓

Notification sent

------------------

Workflow Worker

↓

Workflow completed successfully.
```

The parent worker runs after the children complete.

---

### Test 3 — Simulate Failure

Open
```
src/workers/pdf.worker.ts
```

Temporarily add:

```
throw new Error("PDF generation failed");
```

Restart the worker.

Create the workflow again.

Expected:

```
PDF Worker

↓

Fails

↓

Workflow Parent

↓

Does NOT complete
```

The parent remains incomplete because a required child failed.

---

### Test 4 — Remove the Failure

Delete the temporary throw.

Restart the worker.

Run the workflow again.

Expected:

- PDF job succeeds.
- Email job succeeds.
- Notification job succeeds.
- Parent workflow completes.

---

### Test 5 — Verify Existing Endpoints Still Work

Ensure these still function independently
```
POST /api/v1/send-email
```
```
POST /api/v1/generate-pdf
```
```
POST /api/v1/send-notification
```
Expected:

Each endpoint continues to enqueue jobs into its own queue, independent of the workflow.

---

### Common Mistakes
### ❌ Mistake 1

Using a queue name that doesn't exist.

```
queueName: "emails"
```

when your actual queue is:
```
queueName: "email-queue"
```

Result: Jobs will never be processed.

---


### ❌ Mistake 2

Forgetting to start a worker for one of the child queues.

The workflow will wait forever for that child.

---

### ❌ Mistake 3

Putting business logic in the parent worker.

The parent should coordinate the workflow, not duplicate child work.

---

Production Notes

Use FlowProducer when tasks have dependencies.

Good examples:

- Order Processing
- Invoice Generation
- Video Processing Pipeline
- Image Thumbnail Generation
- AI Processing Pipeline
- Data Import Workflow

Avoid FlowProducer for completely independent jobs.

---

### Architecture

```
                 API

                  │

                  ▼

            FlowProducer

                  │

        Parent Workflow Job

                  │

        ┌─────────┼─────────┐

        ▼         ▼         ▼

   PDF Queue  Email Queue  Notification Queue

        │         │         │

        ▼         ▼         ▼

   PDF Worker Email Worker Notification Worker

        └─────────┼─────────┘

                  ▼

          Workflow Worker
```

### Assignment (Recommended)

Extend the workflow to include another child:

```
Audit Queue
```
Create:

- audit.queue.ts
- audit.worker.ts

The audit worker should log:
```
User X generated report Y
```

Then add it as another child in the workflow. Verify that the parent completes only after all four child jobs (PDF, Email, Notification, Audit) finish successfully.

---

### What You Learned

You now know how to:

- ✅ Use FlowProducer to create job workflows.
- ✅ Coordinate parent and child jobs.
- ✅ Ensure dependent tasks complete before the parent finishes.
- ✅ Test successful and failing workflows.
- ✅ Design multi-step background processes.


---
---

### Lecture 3 — Batch Processing & Bulk Job Enqueueing (Production Grade)

In the previous lecture, we learned how to process `dependent jobs` using `FlowProducer.`

Now let's solve another real production problem.

---

### The Problem

Imagine your company has `100,000 users.`

Marketing wants to send a newsletter.

A beginner writes:

```
for (const user of users) {
    await emailQueue.add("send-email", {
        email: user.email,
    });
}
```

Looks fine...

Until you realize

```
100,000 jobs

↓

100,000 Redis network requests

↓

Slow API

↓

High latency

↓

Poor performance
```

---

### Production Solution

BullMQ provides:
```
queue.addBulk()
```

Instead of:
```
100,000

Redis Requests
```

we do:
```
One

Bulk Request
```

Much faster 

---

### Today's Goal

We'll build a production-ready `bulk email API.`

```
Client

↓

POST /bulk-email

↓

Validation

↓

Queue.addBulk()

↓

Redis

↓

Workers
```

---

### What We'll Build

New endpoint:

```
POST /api/v1/bulk-email
```

Request

```
{
    "emails": [
        "john@example.com",
        "alice@example.com",
        "bob@example.com"
    ]
}
```

Instead of creating three requests,

one API call creates three BullMQ jobs.

---

### Project Structure

We'll add:

```
src/

├── controllers/
│      bulk.controller.ts
│
├── routes/
│      bulk.routes.ts
│
└── services/
       bulk.service.ts

```

---

### Step 1 — Create Bulk Service

Create
```
src/services/bulk.service.ts
```

```
import { emailQueue } from "../queues/email.queue";

export class BulkService {

    static async queueEmails(
        emails: string[]
    ) {

        return emailQueue.addBulk(

            emails.map((email) => ({

                name: "send-email",

                data: {
                    email,
                },

            }))

        );

    }

}
```

Notice:

Instead of:

```
queue.add(...)
```

we use:
```
queue.addBulk(...)
```


---

### Step 2 — Create Controller

Create
```
src/controllers/bulk.controller.ts
```

```
import { Request, Response } from "express";
import { BulkService } from "../services/bulk.service";
import { AppError } from "../utils/AppError";

export async function bulkEmail(
    req: Request,
    res: Response
) {

    const { emails } = req.body;

    if (!Array.isArray(emails)) {
        throw new AppError(
            "emails must be an array",
            400
        );
    }

    const jobs = await BulkService.queueEmails(
        emails
    );

    return res.status(202).json({

        success: true,

        total: jobs.length,

        jobIds: jobs.map(job => job.id),

    });

}
```

---

### Step 3 — Create Routes

Create

```
src/routes/bulk.routes.ts
```

```
import { Router } from "express";
import { bulkEmail } from "../controllers/bulk.controller";

const router = Router();

router.post(
    "/bulk-email",
    bulkEmail
);

export default router;
```

---

### Step 4 — Register Route

Open
```
src/app.ts
```

import 
```
import bulkRoutes from "./routes/bulk.routes";
```

Register 
```
app.use("/api/v1", bulkRoutes);
```

---

### Step 5 — Restart

Terminal 1

```
npm run dev
```

Terminal 2

```
npm run dev:worker
```

---

### Test 1 — Queue Three Emails

Request
```
POST /api/v1/bulk-email
```
Body
```
{
    "emails": [
        "a@gmail.com",
        "b@gmail.com",
        "c@gmail.com"
    ]
}
```

Expected Response
```
{
    "success": true,
    "total": 3,
    "jobIds": [
        "101",
        "102",
        "103"
    ]
}
```

---

### Expected Worker Logs
```
Processing email a@gmail.com

↓

Completed

--------------------

Processing email b@gmail.com

↓

Completed

--------------------

Processing email c@gmail.com

↓

Completed
```

---

### Step 6 — Test With 100 Jobs

You don't have to manually type them.

Create a file.

---

#### File
```
scripts/generate-bulk.js
```

```
const axios = require("axios");

const emails = [];

for (let i = 1; i <= 100; i++) {
    emails.push(`user${i}@gmail.com`);
}

axios.post(
    "http://localhost:5000/api/v1/bulk-email",
    { emails }
)
.then(res => {

    console.log(res.data);

})
.catch(console.error);
```

---

Run

```
node scripts/generate-bulk.js
```

Expected 
```
Queued 100 jobs
```

Worker begins processing.

---

### Step 7 — Validate Duplicate Emails

Current request:

```
{
    "emails": [
        "a@gmail.com",
        "a@gmail.com",
        "a@gmail.com"
    ]
}
```

Creates:
```
3 Jobs 
```

Not good.

Let's deduplicate.

Open
```
src/services/bulk.service.ts
```

Replace:

```
emails
```

With

```

const uniqueEmails = [...new Set(emails)];

return emailQueue.addBulk(

    uniqueEmails.map(email => ({

        name: "send-email",

        data: {
            email,
        },

    }))

);

```

Now:

```
[
"a@gmail.com",
"a@gmail.com",
"a@gmail.com"
]
```

becomes 
```
1 Job
```

---

### Step 8 — Validate Empty Array

Request
```
{
    "emails": []
}
```

Should return:
```
{
    "message": "emails must not be empty"
}
```

Update controller.
```
if (emails.length === 0) {
    throw new AppError(
        "emails must not be empty",
        400
    );
}
```

---

### Step 9 — Large Batch Strategy

Should we enqueue:

```
500,000 jobs
```

in onr request?

No.

Instead:
```
500,000

↓

Chunks

↓

1000

↓

1000

↓

1000
```

Much safer.

---

Example helper 

```
function chunk<T>(
    array: T[],
    size: number
) {

    const chunks = [];

    for (let i = 0; i < array.length; i += size) {

        chunks.push(
            array.slice(i, i + size)
        );

    }

    return chunks;

}
```

Then

```
const batches = chunk(uniqueEmails, 1000);

for (const batch of batches) {

    await emailQueue.addBulk(

        batch.map(email => ({

            name: "send-email",

            data: {
                email,
            },

        }))

    );

}
```

---

### Why Chunking Matters

Imagine:

```
1,000,000 Jobs
```

Without chunking:
```
Huge Memory

↓

Huge Redis Command

↓

Timeout
```

With chunking:
```
1000

↓

1000

↓

1000

↓

Fast

↓

Stable
```

---

### Production Testing
Test 1

Queue

```
{
    "emails": [
        "one@gmail.com",
        "two@gmail.com"
    ]
}
```


Verify

- Response contains two job IDs.
- Worker processes both jobs.

---

### Test 2

Queue duplicate emails.

Verify only unique emails are added.

---

### Test 3

Queue an empty array.

Expected

```
400 Bad Request
```

---

### Test 4

Queue 100 emails using:

```
node scripts/generate-bulk.js
```

Verify:

- API responds quickly.
- Worker processes all jobs.
- No Redis errors.

---

### Test 5

If your worker concurrency is` 5,` observe that jobs are processed five at a time while the rest remain in the waiting state.

---


### Common Mistakes

- ❌ Calling queue.add() inside a loop for thousands of jobs.

- ❌ Accepting unlimited array sizes from clients.

- ❌ Not removing duplicates.

- ❌ Not validating request payloads.

---

Production Notes

In real production systems:

- Limit the maximum batch size (for example, 1,000 or 5,000 jobs per request).
- Split very large imports into chunks.
- Validate every item before enqueueing.
- Return accepted job counts instead of waiting for processing.
- Monitor queue growth during bulk imports.


---

### Project Structure

```
src/
├── controllers/
│   ├── bulk.controller.ts
│   ├── email.controller.ts
│   ├── notification.controller.ts
│   ├── pdf.controller.ts
│   └── workflow.controller.ts
│
├── services/
│   ├── bulk.service.ts
│   ├── queue-router.service.ts
│   └── workflow.service.ts
│
├── routes/
│   ├── bulk.routes.ts
│   ├── email.routes.ts
│   ├── notification.routes.ts
│   ├── pdf.routes.ts
│   └── workflow.routes.ts
```

### What You Learned

You can now:

- ✅ Use queue.addBulk() for efficient job creation.
- ✅ Build bulk-processing APIs.
- ✅ Remove duplicate work before enqueueing.
- ✅ Chunk very large batches for scalability.
- ✅ Design bulk import endpoints suitable for production.

---
---

### Lecture 4 — Dynamic Queue Routing & Queue Selection (Production Grade)

***Prerequisite***: Complete Module 2 – Lectures 1–3 first.

---

### Why Do We Need Dynamic Queue Routing?

Currently, our application looks like this:

```
Email API
    │
    ▼
Email Queue

PDF API
    │
    ▼
PDF Queue

Notification API
    │
    ▼
Notification Queue
```

This works...

Until business requirements grow.

Imagine this feature request:

***Premium customers should have faster email processing than free users.***

Should we write:

```
if (isPremium) {
    premiumEmailQueue.add(...)
} else {
    emailQueue.add(...)
}
```

inside every controller?

No.

That spreads routing logic across the application.

Instead:

```
Controller

↓

Queue Router

↓

Decision

↓

Correct Queue
```

The controller should never know which queue is used.

---

### Today's Goal

We'll build a routing engine.

Instead of:

```
Controller

↓

emailQueue
```

We'll have:

```
Controller

↓

Routing Service

↓

Email Queue

↓

OR

↓

Priority Email Queue
```

---

Final Architecture
```
                 API

                  │

                  ▼

         Queue Routing Service

          │              │

          ▼              ▼

Email Queue      Priority Email Queue

          │              │

          ▼              ▼

Email Worker    Priority Worker
```

---

### Step 1 — Create Premium Email Queue

Create a new file:

```
src/queues/premium-email.queue.ts
```

```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const premiumEmailQueue = new Queue(
    "premium-email-queue",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 5,
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
);

```

---

### Step 2 — Create Premium Worker

Create:

```
src/workers/premium-email.worker.ts
```

```
import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

export const premiumEmailWorker = new Worker(
    "premium-email-queue",

    async (job) => {

        logger.info(
            {
                jobId: job.id,
                email: job.data.email,
                plan: "PREMIUM",
            },
            "Processing premium email"
        );

        await new Promise(resolve => setTimeout(resolve, 1000));

        logger.info(
            {
                jobId: job.id,
            },
            "Premium email sent"
        );

    },

    {
        connection: redis,

        concurrency: 10,
    }
);
```


Notice:

Premium customers get:

- higher concurrency
- separate queue
- independent scaling

### Note - Update this one 
```
src/services/queue-router.service.ts
```

```
import { emailQueue } from "../queues/email.queue.js";
import { pdfQueue } from "../queues/pdf.queue.js";
import { notificationQueue } from "../queues/notification.queue.js";


import { QueueRegistry } from "./queue-registry.service.js";


interface SendEmailOptions {
    email: string;
    isPremium: boolean;
    delay: number;
    priority: number;
}


export class QueueRouter {

     static async sendEmail(options: SendEmailOptions) {
        const queue = options.isPremium
            ? QueueRegistry.premiumEmail
            : QueueRegistry.email;

        return queue.add(
            "send-email",
            {
                email: options.email,
            },
            {
                jobId: options.email,
                delay: options.delay,
                priority: options.priority,
            }
        );
    }

    static async generatePdf(reportId: string) {

        return pdfQueue.add(
            "generate-pdf",
            {
                reportId,
            }
        );

    }

    static async sendNotification(
        userId: string,
        type: string
    ) {

        return notificationQueue.add(
            "notify",
            {
                userId,
                type,
            }
        );

    }

}

```

---

### Step 3 — Register Worker

Open
```
src/worker.ts
```

Add:
```
import "./workers/premium-email.worker";
```

---

### Step 4 — Create Queue Registry

Instead of importing queues everywhere, let's centralize them.

Create
```
src/services/queue-registry.service.ts
```

```
import { emailQueue } from "../queues/email.queue";
import { premiumEmailQueue } from "../queues/premium-email.queue";
import { pdfQueue } from "../queues/pdf.queue";
import { notificationQueue } from "../queues/notification.queue";

export const QueueRegistry = {

    email: emailQueue,

    premiumEmail: premiumEmailQueue,

    pdf: pdfQueue,

    notification: notificationQueue,

};
```

This gives us one place to manage queues.

---

### Step 5 — Refactor Queue Router

Open
```
src/services/queue-router.service.ts
```

Replace the email method with:
```
import { QueueRegistry } from "./queue-registry.service";

static async sendEmail(
    email: string,
    isPremium: boolean
) {

    const queue = isPremium
        ? QueueRegistry.premiumEmail
        : QueueRegistry.email;

    return queue.add(
        "send-email",
        {
            email,
        }
    );

}
```

The router now decides the queue.

The controller doesn't.

---

### Step 6 — Update Email Controller

Open
```
src/controllers/email.controller.ts
```

Update

```
const {

    email,

    isPremium = false,

} = req.body;
```

Then:
```
const job = await QueueRouter.sendEmail(

    email,

    isPremium

);
```

### Note - Here we updated someting new 

```

import { Request, Response } from "express"

// import { emailQueue } from "../queues/email.queue.js"
import { logger } from "../logger/index.js";
import { QueueRouter } from "../services/queue-router.service.js";
type EmailPriority = "high" | "normal" | "low";

const PRIORITY_MAP: Record<EmailPriority, number> = {
    high: 1,
    normal: 5,
    low: 10,
};

export async function sendEmail(req: Request, res: Response) {

    const { email, delay = 0, priority = "normal", isPremium = false } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Valid email is required"
        })
    }


    if (
        typeof delay !== "number" ||
        !Number.isInteger(delay) ||
        delay < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Delay must be a positive integer",
        });
    }

    if (
        priority !== "high" &&
        priority !== "normal" &&
        priority !== "low"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Priority must be high, normal, or low",
        });
    }

    // const job = await emailQueue.add("send-email", {
    //     email
    // },
    //     {
    //         jobId:email,
    //         delay,
    //         priority:PRIORITY_MAP[priority as EmailPriority],
    //     }


    // );

    //  logger.info({ email }, "Adding job");

    const job = await QueueRouter.sendEmail({
        email,
        isPremium,
        delay,
        priority: PRIORITY_MAP[priority as EmailPriority],
    });

    return res.status(200).json({
        success: true,
        message: "Job Added Successfully",
        jobId: job.id,
        priority,
        isPremium,
        delay

    })

}



```

---

### Step 7 — Test Normal Email

Request
```
POST /api/v1/send-email
```
Body
```
{
    "email": "normal@gmail.com"
}
```

Expected worker log
```
Email Worker

↓

Processing email

↓

Completed
```

---

### Test 2 — Premium Email

Request

```
POST /api/v1/send-email

```
Body
```
{
    "email": "vip@gmail.com",
    "isPremium": true
}
```
Expected
```
Premium Email Worker

↓

Processing premium email

↓

Completed
```

Notice:

The endpoint is identical.

Only routing changed.

---

### Step 8 — More Advanced Routing

Routing doesn't have to depend only on premium users.

You can route by:

```
Tenant

↓

Region

↓

Priority

↓

Job Size

↓

Customer Plan

↓

Feature Flag
```

Example:

```
if (tenant === "enterprise") {

    return enterpriseQueue;

}

if (region === "eu") {

    return europeQueue;

}

if (priority === "high") {

    return highPriorityQueue;

}

return defaultQueue;
```

---

### Step 9 — Route by File Size

Example:

```
Upload

↓

5 MB

↓

Image Queue

------------------

500 MB

↓

Large File Queue
```

```
if (fileSize > 100) {

    return largeFileQueue;

}

return imageQueue;

```

Large jobs won't block smaller ones.

---

### Step 10 — Route by Priority
```
Critical

↓

Critical Queue

--------------------

Normal

↓

Default Queue

--------------------

Low

↓

Background Queue
```

Different workers.

Different scaling.

---

### Step 11 — Why This Pattern?

Imagine:

```
50 Controllers
```

Without a router:

Every controller decides:

```
Queue A?

Queue B?

Queue C?
```

Maintenance nightmare.

With a router:

```
Controller

↓

QueueRouter

↓

Queue Decision
```

One place.

Easy to change.

---

### Production Architecture 

```
                  API

                   │

                   ▼

             Queue Router

                   │

      ┌────────────┼─────────────┐

      ▼            ▼             ▼

 Premium      Standard      Enterprise

   Queue         Queue          Queue

      │            │             │

      ▼            ▼             ▼

 Premium      Standard      Enterprise

 Worker        Worker         Worker
```

---

### Testing Checklist
##### Test 1

Submit
```
{
    "email":"a@gmail.com"
}
```

Verify:

Standard email worker processes the job.

---

### Test 2

Submit
```
{
    "email":"vip@gmail.com",
    "isPremium":true
}
```

Verify:

Premium worker processes the job.

---

### Test 3

Stop the premium worker.

Queue a premium email.

Verify:

- Job stays in premium-email-queue.
- Standard emails continue processing.

---

### Test 4

Restart the premium worker.

Verify queued premium jobs are processed automatically.



### Common Mistakes

❌ Controllers choosing queues directly.

❌ Copying routing logic into multiple controllers.

❌ Using queue names as string literals throughout the codebase.

❌ Mixing business rules with queue implementation details.


---

### Production Improvements (Let's Make It Better)

The implementation above works, but a production-grade routing service should avoid a growing list of if/else statements.

Instead, define explicit types.

Create:

```
src/types/job-types.ts
```

```
export enum CustomerPlan {
    FREE = "FREE",
    PREMIUM = "PREMIUM",
    ENTERPRISE = "ENTERPRISE",
}
```

Then route using a lookup table:

```
import { CustomerPlan } from "../types/job-types";

const emailQueues = {
    [CustomerPlan.FREE]: QueueRegistry.email,
    [CustomerPlan.PREMIUM]: QueueRegistry.premiumEmail,
};

const queue =
    emailQueues[plan] ?? QueueRegistry.email;
```

This is easier to extend when adding more plans.

---

### Project Structure

```
src/
├── controllers/
│   ├── email.controller.ts
│   ├── notification.controller.ts
│   ├── pdf.controller.ts
│   ├── workflow.controller.ts
│   └── bulk.controller.ts
│
├── queues/
│   ├── email.queue.ts
│   ├── premium-email.queue.ts
│   ├── pdf.queue.ts
│   └── notification.queue.ts
│
├── workers/
│   ├── email.worker.ts
│   ├── premium-email.worker.ts
│   ├── pdf.worker.ts
│   └── notification.worker.ts
│
├── services/
│   ├── queue-router.service.ts
│   ├── queue-registry.service.ts
│   ├── workflow.service.ts
│   └── bulk.service.ts
│
└── types/
    └── job-types.ts
```

### What You Learned

You can now:

✅ Route jobs dynamically at runtime.
✅ Keep controllers free from queue-selection logic.
✅ Create dedicated queues for different customer tiers.
✅ Scale queues independently.
✅ Centralize routing decisions in one maintainable service.


---

### Your architecture now becomes

```
Request
   │
   ▼
Email Controller
   │
   ▼
QueueRouter
   │
   ├── email-queue
   └── premium-email-queue
           │
           ▼
        BullMQ

```


### Lecture 5 — Queue Pause, Resume & Maintenance Mode (Production Grade)

***Prerequisite:*** Complete Module 2 – Lectures 1–4.

---

### Why This Feature Exists

Imagine your production server is running normally.

```
API

↓

Queue

↓

Workers
```

Suddenly you need to:

- Deploy a new worker version
- Upgrade Redis
- Fix a production bug
- Investigate a failed batch
- Prevent more jobs from being processed

Should you stop the entire application?

`No.`

BullMQ allows you to `pause` a queue.

Jobs continue to be accepted, but workers stop processing them until the queue is resumed.

This is used daily in production systems.

---

### What We'll Build

Admin APIs:

```
POST /api/v1/admin/queues/email/pause

POST /api/v1/admin/queues/email/resume

GET /api/v1/admin/queues/status
```

Architecture:

```
Admin API

↓

Queue Manager

↓

Pause Queue

↓

Workers Stop Processing

↓

Resume Queue

↓

Workers Continue
```

---

### Folder Structure

Create:

```
src/
├── controllers/
│      admin.controller.ts
│
├── routes/
│      admin.routes.ts
│
└── services/
       queue-manager.service.ts
```

---

### Step 1 — Create Queue Manager Service

File

```
src/services/queue-manager.service.ts
```

```
import { QueueRegistry } from "./queue-registry.service.js";

export class QueueManager {

    static getQueue(name: string) {

        switch (name) {

            case "email":
                return QueueRegistry.email;

            case "premium-email":
                return QueueRegistry.premiumEmail;

            case "pdf":
                return QueueRegistry.pdf;

            case "notification":
                return QueueRegistry.notification;

            default:
                return null;

        }

    }

    static async pause(queueName: string) {

        const queue = this.getQueue(queueName);

        if (!queue) {
            throw new Error(`Queue '${queueName}' not found`);
        }

        await queue.pause();

    }

    static async resume(queueName: string) {

        const queue = this.getQueue(queueName);

        if (!queue) {
            throw new Error(`Queue '${queueName}' not found`);
        }

        await queue.resume();

    }

    static async status(queueName: string) {

        const queue = this.getQueue(queueName);

        if (!queue) {
            throw new Error(`Queue '${queueName}' not found`);
        }

        const counts = await queue.getJobCounts(
            "waiting",
            "active",
            "completed",
            "failed",
            "delayed"
        );

        return counts;

    }

}
```

---

### Step 2 — Create Admin Controller

#### File

```
src/controllers/admin.controller.ts
```

```
import { Request, Response } from "express";
import { QueueManager } from "../services/queue-manager.service.js";

export async function pauseQueue(
    req: Request,
    res: Response
) {

    const { queue } = req.params;

    await QueueManager.pause(queue);

    return res.json({
        success: true,
        message: `${queue} queue paused`,
    });

}

export async function resumeQueue(
    req: Request,
    res: Response
) {

    const { queue } = req.params;

    await QueueManager.resume(queue);

    return res.json({
        success: true,
        message: `${queue} queue resumed`,
    });

}

export async function queueStatus(
    req: Request,
    res: Response
) {

    const { queue } = req.params;

    const status = await QueueManager.status(queue);

    return res.json({
        success: true,
        queue,
        status,
    });

}
```

---

### Step 3 — Create Routes

#### File

```
src/routes/admin.routes.ts
```

```
import { Router } from "express";

import {
    pauseQueue,
    resumeQueue,
    queueStatus,
} from "../controllers/admin.controller.js";

const router = Router();

router.post(
    "/admin/queues/:queue/pause",
    pauseQueue
);

router.post(
    "/admin/queues/:queue/resume",
    resumeQueue
);

router.get(
    "/admin/queues/:queue/status",
    queueStatus
);

export default router;

```

---

### Step 4 — Register Routes

Open:
```
src/app.ts
```

Import
```
import adminRoutes from "./routes/admin.routes.js";
```

Register:

```
app.use("/api/v1", adminRoutes);
```

---

### Step 5 — Restart the Application

Terminal 1

```
npm run dev
```

Terminal 2

```
npm run dev:worker
```
---

### Test 1 — Queue Status

Request

```
GET /api/v1/admin/queues/email/status
```

Expected Response

```
{
  "success": true,
  "queue": "email",
  "status": {
    "waiting": 0,
    "active": 0,
    "completed": 15,
    "failed": 0,
    "delayed": 2
  }
}
```

---

### Test 2 — Pause Queue

Request

```
POST /api/v1/admin/queues/email/pause
```

Expected Response

```
{
    "success": true,
    "message": "email queue paused"
}
```

---

### Test 3 — Add Jobs While Paused

Call your existing endpoint:

```
POST /api/v1/send-email
```

Body
```
{
    "email":"paused@example.com"
}
```

Expected:

API Response

```
{
    "success": true,
    "jobId":"..."
}

```

Worker Log

```
{
    "success": true,
    "jobId":"..."
}
```

Worker Log

```

Nothing happens.

```

The job stays in Redis.

---

#### Test 4 — Verify Status
```
GET /api/v1/admin/queues/email/status
```
Expected

```
{
    "waiting":1,
    "active":0,
    "completed":15
}

```

The waiting job confirms the queue is paused.

---

### Test 5 — Resume Queue
```
POST /api/v1/admin/queues/email/resume
```

Expected 
```
{
    "success":true,
    "message":"email queue resumed"
}
```

Immediately afterward, your worker should log:

```
Processing email

↓

Completed
```

The queued job is processed automatically.

---

### Test 6 — Pause Only One Queue

Pause only:
```
POST /api/v1/admin/queues/email/pause
```

Now test:
```
POST /api/v1/send-email
```

```
POST /api/v1/generate-pdf
```

Expected :

```
Email Queue

↓

Paused

--------------------

PDF Queue

↓

Still Working
```

Only the email queue is affected.

---


### Production Improvement

Our switch statement works, but it's not scalable.

Replace `getQueue()` with a lookup table.

### File

```
src/services/queue-manager.service.ts
```

```
import { QueueRegistry } from "./queue-registry.service.js";

const queues = {
    email: QueueRegistry.email,
    "premium-email": QueueRegistry.premiumEmail,
    pdf: QueueRegistry.pdf,
    notification: QueueRegistry.notification,
};

export class QueueManager {

    static getQueue(name: keyof typeof queues) {
        return queues[name] ?? null;
    }

    // pause(), resume(), status() remain the same
}

```

Now adding a new queue only requires updating one object.

---


### Real Production Examples
### Deployment

```
Pause Queue

↓

Deploy Worker v2

↓

Health Check

↓

Resume Queue
```

---

### Incident Response

```
Payment Provider Down

↓

Pause Payment Queue

↓

Fix Integration

↓

Resume Queue
```

---

### Black Friday

```
Email Queue

↓

Paused Temporarily

↓

Payments Continue

↓

Resume Emails Later

```

---

### Project Structure

```
src/
├── controllers/
│   ├── admin.controller.ts
│   ├── bulk.controller.ts
│   ├── email.controller.ts
│   ├── notification.controller.ts
│   ├── pdf.controller.ts
│   └── workflow.controller.ts
│
├── services/
│   ├── bulk.service.ts
│   ├── queue-manager.service.ts
│   ├── queue-registry.service.ts
│   ├── queue-router.service.ts
│   └── workflow.service.ts
│
├── routes/
│   ├── admin.routes.ts
│   ├── bulk.routes.ts
│   ├── email.routes.ts
│   ├── notification.routes.ts
│   ├── pdf.routes.ts
│   └── workflow.routes.ts
```

### What You Learned

You now know how to:

- ✅ Pause a BullMQ queue.
- ✅ Resume processing without restarting the application.
- ✅ Expose admin APIs for operational control.
- ✅ Monitor queue job counts.
- ✅ Isolate maintenance to a single queue.

---
---




