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

Today's Goal

By the end of this lecture, you'll have this running on your laptop:

```
               Docker
                  │
    ┌─────────────┴─────────────┐
    │                           │
 PostgreSQL                 Redis
    │                           │
    └─────────────┬─────────────┘
                  │
             Node.js API
                  │
              TypeScript
                  │
              Express App

```

No BullMQ today.

No Workers today.

Today is about building a strong foundation.

---

### Step 1 — Create the Project

Open your terminal.

```
mkdir background-job-system
```

```
cd background-job-system
```

Initialize Node.
```
npm init -y
```

### Think Like an Engineer

Why are we starting from scratch?

Because in a real company, nobody gives you a ready-made project.

You create the architecture yourself.

---

### Step 2 — Install Runtime Dependencies

These are needed when the application runs.

```
npm install express dotenv

```

Why?

### Express

Creates HTTP APIs.

### dotenv

Loads environment variables from .env.

Never hardcode passwords.

Never hardcode ports.

Never hardcode database URLs.

---

### Step 3 — Install Development Dependencies
```
npm install -D \
typescript \
tsx \
@types/node \
@types/express \
nodemon

```

Let's understand every package.

---
TypeScript

Not just for type safety.

It gives us:

- Better IntelliSense
- Easier refactoring
- Compile-time errors
- Safer large codebases

Most production Node.js teams use TypeScript.

---

### tsx

Runs TypeScript directly.

Instead of:
```
Compile

↓

Run JS
```

We'll simply run:
```
npm run dev
```
Much faster development.

---

### nodemon

Automatically restarts the server.

Without it:

```
Edit file

↓

Stop server

↓

Restart server
```

With nodemon:
```
Save

↓

Restart automatically
```

---

### Step 4 — Initialize TypeScript

```
npx tsc --init
```
This creates:
```
tsconfig.json
```

---
### Replace it with this

```
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    "strict": true,

    "esModuleInterop": true,

    "skipLibCheck": true,

    "forceConsistentCasingInFileNames": true,

    "outDir": "./dist",

    "rootDir": "./src"
  },

  "include": ["src"]
}

```

---

### Why Strict Mode?

Many beginners disable it.

Professionals don't.

Strict mode catches bugs before production.

Imagine this.

```
user.name.toUpperCase()
```
But
```
user = null
```

Strict mode warns you immediately.

Without it

Production crashes.

---

### Step 6 — Create Folder Structure

Create this exactly.
```
background-job-system/

src/

    config/

    controllers/

    routes/

    middleware/

    services/

    queues/

    workers/

    logger/

    utils/

    types/

    app.ts

    server.ts

.env

.gitignore

tsconfig.json

package.json

```
Notice something.

There is no models folder yet.

Because we haven't introduced Prisma.

Never create folders "just in case."

---

### Step 6 — Create .gitignore

```
node_modules

dist

.env

coverage

logs

```

Never commit .env.

---

Step 7 — Create Environment Variables
`.env`
```
PORT=5000

NODE_ENV=development

```

Nothing more.

We'll add Redis and PostgreSQL later.

Don't add variables before you need them.


---

### Step 8 — Configure Scripts

Open package.json.

Replace scripts with

```
"scripts": {
  "dev":"nodemon --watch src --exec tsx src/server.ts",
  "build":"tsc",
  "start":"node dist/server.js"
}

```

---

### Why build?
Development

```
TypeScript

↓

tsx

↓

Run

```

Production

```
 TypeScript

↓

Compile

↓

JavaScript

↓

Run

```

Step 9 — Create app.ts
```
import express from "express";

const app = express();

app.use(express.json());

export default app;

```

Simple.

One responsibility.

Configure Express.

Nothing else.

---

### Why separate app.ts and server.ts?

Many beginners do this.
```
server.ts

Express

Routes

Database

Redis

Everything
```

After six months
```
3000 lines
```

Impossible to maintain.

Instead
```
app.ts

↓

Configure Express

Only
```

```
server.ts

↓

Start Server

```
Single Responsibility Principle.

---

### Step 10 — Create server.ts

```
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

```

Very clean.

---

Step 11 — Run server

```
npm run dev
```
Expected output

```
Server running on 5000
```
---

Visit
```
http://localhost:5000
```

You'll get

```
Cannot GET /
```

This is actually good.

It means

 - Express is running
 - Port is working
 - Server started successfully

---

### What We Accomplished Today

We built the `foundation`:

```
Node.js
   │
TypeScript
   │
Express
   │
Environment Variables
   │
Production Folder Structure

```

No unnecessary complexity.

Every file has a purpose.

---


(Mandatory) Question 

Before moving to Lecture 3, make sure you can answer:

- Why do we separate app.ts from server.ts?
- Why do we use tsx during development instead of compiling every time?
- Why should secrets never be hardcoded?
- Why is strict: true important in TypeScript?
- Why don't we create folders that we don't need yet?


---

### Module 1 — Lecture 3
### Building Our Local Infrastructure

### Today's Goal

By the end of this lecture, your laptop will look like this:

```
                    Docker Engine
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
     ▼                   ▼                   ▼
 PostgreSQL          Redis             Mailpit (Later)
     │                   │
     └────────────┬──────┘
                  │
           Node.js Application

```

Notice something.

Node.js does not contain Redis.

Node.js does not contain PostgreSQL.

They are completely different applications.

---

### First, Think Like an Engineer

Suppose you're building Swiggy.

You have


```
Order Service

Payment Service

Notification Service

Analytics Service

```

Do you install PostgreSQL inside every service?
No.

All services connect to one PostgreSQL server.

Same idea locally.

---

### Why Docker?

Without Docker

```
Laptop

↓

Install PostgreSQL

↓

Install Redis

↓

Install Version X

↓

PATH Issues

↓

Port Conflicts

↓

"It works on my machine."

```

Everyone's laptop becomes different.

---

With Docker

```
Git Clone

↓

docker compose up

↓

Everything Works

```

Exactly the same environment for everyone.

This is why companies use containers.

---

### What is a Container?

Many beginners think

 - Container = Virtual Machine

Wrong.

Think like this.

```
Windows
│
Docker Engine
│
├── PostgreSQL Container
├── Redis Container
├── Mailpit Container
└── Bull Board (Later)

```

Every container is just an isolated process with its own filesystem and network.

Much lighter than a VM.

---

### Our Project Structure

We will slightly improve the structure.

```
background-job-system/

src/

docker/

prisma/

.env

.env.example

docker-compose.yml

package.json

README.md

```

Notice

We keep Docker files separate from application code.

---

### Step 1 — Install Docker Desktop

If Docker Desktop is already installed:

```
docker --version

```

Example 
```
Docker version 28.x.x
```

Now check
```
docker compose version
```

Example
```
Docker Compose version v2.x.x
```

If both commands work,

you're ready.

---

### Step 2 — Create docker-compose.yml

Create it in the project root.

```
version: "3.9"

services:

  postgres:
    image: postgres:17
    container_name: bg-postgres

    restart: unless-stopped

    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: background_jobs

    ports:
      - "5432:5432"

    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:8

    container_name: bg-redis

    restart: unless-stopped

    ports:
      - "6379:6379"

    volumes:
      - redis_data:/data

volumes:

  postgres_data:

  redis_data:

```

Don't worry about every line yet.

We'll study every property.

---

### Step 3 — Why Volumes?

Suppose Docker stores PostgreSQL here

```
Container

↓

Database

```

Now delete the container.

Everything disappears.

Bad.

Instead
```
Container

↓

Volume

↓

Hard Disk
```

Now

Delete container.

Database still exists.

This is how production works.

---

### Step 4 — Start Everything
```
docker compose up -d
```
Expected
```
Creating bg-postgres

Creating bg-redis

Started
```

---

### Step 5 — Verify Containers
```
docker ps
```
Expected 
```
CONTAINER ID

bg-postgres

bg-redis

```

Both should show 
```
STATUS

Up

```

### Step 6 — Understand Ports

You wrote

```
5432:5432

```
Think
```
Host Machine

5432

↓

Container

5432
```

Redis

```
Host

6379

↓

Container

6379
```

Node connects to the host ports.

---

### Step 7 — Add Environment Variables
.env
```
PORT=5000

NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/background_jobs"

REDIS_HOST=localhost

REDIS_PORT=6379
```

Notice

No hardcoded values inside the code.

Everything comes from .env.

---
### Step 8 — Test PostgreSQL

Open a terminal.

```
docker exec -it bg-postgres psql -U postgres
```
Now 
```
\l
```
Expected
```
background_jobs
postgres
template0
template1
```

Exit 
```
\q
```

---

### Step 9 — Test Redis
```
docker exec -it bg-redis redis-cli
```
Now
```
PING
```
Expected
```
PONG
```
Now try
```
SET name omprakash
```
Expected 
```
ok
```
Read it
```
GET name
```
Output
```
"omprakash"
```
Exit 
```
exit
```

---

### What Just Happened?

You manually communicated with Redis.

Later BullMQ will do exactly the same thing—just through code.

---

### Networking
Our system now looks like this.
```
                  localhost

         ┌──────────┼──────────┐
         │          │          │
         ▼          ▼          ▼
     Node API   PostgreSQL   Redis
      :5000       :5432       :6379
```
Nothing magical.

Everything communicates over TCP.

---

### Debugging Skills

Every backend engineer should know these commands.

See running containers

```
docker ps
```
Stop everything
```
docker compose down
```

Start everything
```
docker compose up -d
```

View logs
```
docker logs bg-postgres
```
Redis logs
```
docker logs bg-redis
```

Restart one container
```
docker restart bg-redis

```

Enter PostgreSQL

```
docker exec -it bg-postgres psql -U postgres

```
Enter Redis
```
docker exec -it bg-redis redis-cli
```

These commands are used constantly in real projects.

---
### What We Built Today

Today we didn't write business logic.

Instead, we built reliable infrastructure.

```
Node.js API
     │
     ├──────────────┐
     │              │
     ▼              ▼
PostgreSQL      Redis
     │              │
 Docker         Docker
     │              │
Persistent     Persistent
 Volumes         Volumes
```

A strong backend starts with a strong foundation.

---

### Homework (Required)

Don't continue until you can successfully complete all of these:

✅ docker compose up -d
✅ docker ps
✅ Connect to PostgreSQL using psql
✅ Connect to Redis using redis-cli
✅ Run PING and receive PONG
✅ Create a Redis key with SET
✅ Read it back with GET

If any of these fail, we'll debug them together before moving on.


---

### Module 1 — Lecture 4
### Connecting Node.js to PostgreSQL and Redis

### Today's Goal

By the end of this lecture, our application should look like this:

```
                   Client
                      │
                      ▼
              GET /health
                      │
                Express Server
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   PostgreSQL                  Redis
        │                           │
      Connected                 Connected
```

### Step 1 — Why Connect at Startup?

Many beginners do this:
```
app.get("/users", async () => {
    // Connect Database
});
```
Every request creates a new connection.

This is terrible.

Instead:
```
Application Starts

↓

Connect Database

↓

Connect Redis

↓

Ready to Accept Requests
```
If either service is unavailable, the application should fail fast instead of serving broken requests.

### Step 2 — Install Dependencies

```
npm install prisma @prisma/client redis

```

Development dependency:
```
npm install -D prisma
```
---

### Why Two Prisma Packages?

prisma

 - CLI
 - migrations
 - schema generation

@prisma/client

- used inside your application

---
### Step 3 — Initialize Prisma
```
npx prisma init
```
Expected structure:
```
prisma/

    schema.prisma
```
Note - If you have already `prisma` folder then delete it, then run command.

---

### Step 4 — Configure Prisma

Replace datasource:

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

```
Note - Do this inside `schema.prisma`

Notice

We never hardcode credentials.

Everything comes from `.env.`

---

### Step 5 — Create First Model

Let's keep it simple.

```
model HealthCheck {

  id        Int      @id @default(autoincrement())

  createdAt DateTime @default(now())
}
```

Note - Write inside schema.prisma

This table exists only so we can prove Prisma works.

---

### Step 6 — Run Migration
```
npx prisma migrate dev --name init
```

Note - After this command i got error , just beacuse prisma version issue, uninsatll latest prisma and install Prisma 6 

```
npm uninstall prisma @prisma/client

```
Then install Prisma 6:
```
npm install prisma@6 @prisma/client@6
```

Now run 
```
npx prisma generate
```
then
```
npx prisma migrate dev --name init
```
 - Also update password for postgress `inside .env`.

Expected 
```
Migration applied

Prisma Client Generated

```

Verify
```
npx prisma studio

```

Browser opens.

Congratulations.

You are connected to PostgreSQL.

---

### Step 7 — Create Config Folder
Inside 

```
src/config/
```
Create
```
database.ts

redis.ts
```

Why?

Because configuration belongs in one place

---

### Step 8 — Database Configuration
`src/config/database.ts`
```
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

```

Looks simple.

That's good.

---

### Why Singleton?

Imagine this:

```
Request 1

↓

new PrismaClient()

```

```
Request 2

↓

new PrismaClient()

```
Soon

```
500 requests

↓

500 database clients

```

Disaster.

Instead
```
Application

↓

One Prisma Client

↓

Shared Everywhere
```

---

### Step 9 — Redis Configuration
`src/config/redis.ts`

```
import { createClient } from "redis";

export const redis = createClient({
    url: "redis://localhost:6379"
});

redis.on("connect", () => {
    console.log("Redis Connected");
});

redis.on("error", (err) => {
    console.error(err);
});
```

Later we'll improve this using environment variables.

For now, keep it simple.

---

### Step 10 — Connect on Startup

Update server.ts

```
import dotenv from "dotenv";
import app from "./app";
import { redis } from "./config/redis";
import { prisma } from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {

        await prisma.$connect();

        await redis.connect();

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

    } catch (error) {

        console.error("Startup Failed", error);

        process.exit(1);
    }
}

startServer();
```

Notice

The server starts only after both dependencies are available.

---

### Why is This Better?

Bad architecture

```
Server Starts

↓

Users Send Requests

↓

Database Missing

↓

500 Errors

```

Good architecture 
```
Start

↓

Database OK?

↓

Redis OK?

↓

YES

↓

Accept Requests
```

---

### Step 11 — Build a Health Endpoint

Inside

```
routes/

controllers/

```

create 
```
health.routes.ts

health.controller.ts

```

Controller
```
import { Request, Response } from "express";

export const getHealth = async (_req: Request, res: Response) => {

    res.status(200).json({

        status: "UP",

        timestamp: new Date().toISOString()

    });

};

```
Route
```
import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router = Router();

router.get("/", getHealth);

export default router;
```

Register it in `app.ts`

```
import healthRoutes from "./routes/health.routes";

app.use("/health", healthRoutes);

```

---

Visit
```
GET

http://localhost:5000/health
```

Note - Pay attention , `npm uninstall redis` and `npm install ioredis`
Why - redis create issue while handshake connection was not done- After that we come on the final decision to relaced it.

Update `redis.ts`
```
import Redis from "ioredis";

export const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
});

redis.on("connect", () => {
    console.log("✅ Redis Connected");
});

redis.on("ready", () => {
    console.log("✅ Redis Ready");
});

redis.on("error", (err:any) => {
    console.error("Redis Error:", err);
});
```

Note -`Notice there is no connect() call.`

Change your server.ts

Remove `await redis.connect();`

because ioredis connects automatically.

***server.ts***
```
import dotenv from "dotenv";
import app from "./app.js";
import { redis } from "./config/redis.js"; // Just for test
import { prisma } from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {

        await prisma.$connect();
        const pong = await redis.ping()
        console.log(pong) 

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

    } catch (error) {

        console.error("Startup Failed", error);

        process.exit(1);
    }
}

startServer();

```

### Why I'm choosing ioredis

Since we're building a production-grade backend with background workers, retries, queues, and Redis, I want us to focus on backend architecture rather than spending time on what appears to be a client-specific issue.

---

```

GET

http://localhost:5000/health

```
Expected 
```
{
  "status":"UP",
  "timestamp":"2026-08-06T17:20:00Z"
}
```
Great.

API works

---

### Step 12 — Production Health Check

Now let's improve it.

```
import { Request, Response } from 'express'

export const getHealth = async (_req: Request, res: Response) => {
    res.status(200).json({
        status: "UP",
        "services": {
            "database": "UP",

            "redis": "UP"
        },
         "uptime":154,
        timestamp: new Date().toISOString()
    });
}


```

Later we'll check each dependency dynamically.

This is what Kubernetes, Docker, and load balancers use to know whether your service is healthy.

---

### Step 13 — Testing

### Test 1

Stop Redis

```
docker stop bg-redis
```

Run server.

Expected

```
Startup Failed
```

Perfect.

---

### Test 2

Start Redis.

Stop PostgreSQL.

```
docker stop bg-postgres
```
Expected

```
Startup Failed
```
Again, correct.

---

Test 3

Start both.
```
docker compose up -d
```
Server starts normally.

---

### What You Learned Today

You now know:

- How to connect Prisma once.
- How to connect Redis once.
- Why singleton clients matter.
- Why applications should fail fast.
- How health endpoints work.
- How startup orchestration works.

These are patterns you'll reuse for PostgreSQL, Redis, Kafka, RabbitMQ, Elasticsearch, S3, and many other services.

---

Homework

Before Lecture 5, verify all of these:

✅ prisma migrate dev completes successfully.
✅ prisma.$connect() succeeds.
✅ Redis connects successfully.
✅ /health returns 200 OK.
✅ Stopping Redis prevents startup.
✅ Stopping PostgreSQL prevents startup.
✅ Restarting both allows the server to start again.

Do not move on until every check passes.


---

### Module 1 — Lecture 5
### Building the Application Foundation
#### Today's Goal


Transform this

```
Express

↓

console.log()

↓

app.listen()
```

Into
```
              Request
                 │
                 ▼
        Request Logger
                 │
                 ▼
          Route Handler
                 │
                 ▼
      Business Logic (Later)
                 │
                 ▼
       Error Middleware
                 │
                 ▼
      Structured Response
```


### Today's Topics

By the end of this lecture, we will have

✅ Centralized Configuration
✅ Structured Logging (Pino)
✅ Error Handling Middleware
✅ Async Error Wrapper
✅ Custom Error Class
✅ 404 Handler
✅ Graceful Shutdown
✅ Application Lifecycle

Notice...

Still no BullMQ.

Because before we build distributed systems, our API itself must be production-ready.

---

### Think Like an Engineer

Imagine you deploy this server.

At 3 AM it crashes.

You receive this log.

```
TypeError
```

Nothing else.

How long will debugging take?

Hours.

Now imagine

```
{
  "level":"error",
  "time":"2026-08-07T12:35:17Z",
  "requestId":"req_1a92",
  "method":"POST",
  "path":"/jobs/upload",
  "status":500,
  "message":"Database connection timeout"
}

```

Now debugging takes seconds.

### Logs are your eyes in production.

---

### Step 1 — Install Pino
```
npm install pino pino-http

```

Pretty logs during development

```
npm install -D pino-pretty
```

---

### Why Pino?

Most beginners write
```
console.log("User Created");
```

Large companies don't.

They write
```
{
   "level":"info",
   "event":"USER_CREATED",
   "userId":123,
   "time":"..."
}
```

Machines can search JSON logs.

Humans cannot search random sentences efficiently.

---

### Step 2 — Folder Structure
Add
```
src/

config/

logger/

middleware/

errors/

utils/

types/

```

Our project is slowly becoming maintainable.

---

### Step 3 — Create Logger

`src/logger/index.ts`
```
import pino from 'pino'

export const logger = pino({
    transport:{
        target:"pino-pretty"
    },
    level:process.env.LOG_LEVEL || "info"
})

```
Notice

No `console.log.`

Anywhere.

Ever.

---

### Rule #1

Instead of

```
console.log("Redis Connected");
```

Use
```
logger.info("Redis Connected");
```
Instead of 
```
console.error(error);
```
Use
```
logger.error(error);
```

Everything goes through one logger.

---

### Step 4 — Configuration Module

Instead of
```
process.env.PORT

process.env.REDIS_URL

process.env.NODE_ENV

```
all over the project,


create
`src/config/env.ts`

```
import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL!
};

```

Now every file imports

```
import { env } from "../config/env";
```
One source of truth.

---

### Why?

Imagine

200 files.

Someone changes

```
REDIS_HOST
```
to
```
REDIS_URL
```

If every file uses `process.env` directly,

good luck fixing it.

Configuration should be centralized.

---

### Step 5 — Request Logger

Every request should be logged automatically.

```
GET /health

↓

Request Started

↓

Response

↓

200 OK

↓

12 ms

```
You shouldn't manually log every route.

We'll add middleware that does it once.

---

### Step 6 — Custom Error Class

Never throw raw strings.

Bad
```
throw "Invalid User";
```
Bad 
```
throw new Error("Something");
```

Better 
```
throw new AppError(
    404,
    "USER_NOT_FOUND"
);
```
Why?

Errors become predictable.

---

### Create

`src/errors/AppError.ts`

```
export class AppError extends Error {

    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
    }

}
```

Simple.

Powerful.

---

### Step 7 — Error Middleware

Every route

```
Controller

↓

Success
```
or
```
Controller

↓

Throws Error

```

Both should end here

```
Global Error Middleware

```
instead of
```
Controller A

Controller B

Controller C

Each returns errors differently
```

One place.

One format.

---

### Standard Error Response
```
{
   "success":false,
   "message":"User Not Found"
}

```

Not
```
{
   "error":"Wrong"
}
```
or
```
{
   "msg":"..."
}
```
Consistency matters.

---

### Step 8 — Async Error Wrapper

Beginners write

```
try {

}
catch{

}

```

inside every controller.

After 200 APIs

you have 200 try/catch blocks.

Instead

```
Controller

↓

Wrapper

↓

Error Middleware

```

Cleaner.

---

### Step 9 — 404 Middleware

User requests

```
GET /abcxyz
```

Don't return

```
Cannot GET /abcxyz
```

Return
```
{
    "success":false,
    "message":"Route Not Found"
}

```
Professional APIs never expose Express defaults

---

### Step 10 — Graceful Shutdown

One of the most ignored topics.

Imagine

```
Worker

↓

Processing Payment

↓

Server Killed

```

Payment lost.

Instead

```
SIGTERM

↓

Stop Accepting Requests

↓

Finish Current Jobs

↓

Disconnect Redis

↓

Disconnect Database

↓

Exit
```

Professional systems don't just stop.

They `shut down gracefully.`

---

### Application Lifecycle

Your application now has a lifecycle.

```
Application Starts

↓

Load Environment

↓

Create Logger

↓

Connect PostgreSQL

↓

Connect Redis

↓

Register Routes

↓

Start Server

↓

Serve Requests

↓

Shutdown Signal

↓

Close HTTP Server

↓

Disconnect Redis

↓

Disconnect Prisma

↓

Exit

```

Understanding this lifecycle is a hallmark of experienced backend engineers.

---

### Testing

Before moving forward, test these scenarios:

### Test 1

Request

```
GET /health
```

Verify:

 - Request is logged.
 - Response is successful.

---

### Test 2

Request an unknown route:
```
GET /random-route
```

Verify:
- JSON 404 response.
- Request is logged.

### Test 3

Throw an AppError inside any controller.

Verify:

- Global error middleware formats the response.
- Stack trace is logged.


---

### Production Principles Learned Today

You now understand why professional services have:

- A single logger
- A single configuration source
- A single error format
- A single shutdown flow
- A predictable application lifecycle

These aren't "advanced Node.js" topics—they're the foundation of reliable backend systems

`npm install -D pino-pretty`

Rework  going on...

### Part 2 — Request Logging

Now install middleware.

inside 
```
app.ts
```

Add
```
import pinoHttp from "pino-http";
import { logger } from "./logger";

app.use(
    pinoHttp({
        logger,
    })
);

```

---

Run

```
npm run dev
```

Now visit 

```
http://localhost:5000/health

```

Console

```
GET /health

200

15ms

```

NOW we can test logging.

---

### Part 3 — AppError

create 
```
src/errors/AppError.ts (Already we have)
```

```
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
    }
}

```

Nothing else.

Run project.

No errors?

Good.

Move on.

---

### Part 4 — Error Middleware

Create 
```
src/middleware/error.middleware.ts
```

```

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}

```

Register it after all routes.

```
app.use(errorMiddleware);
```

Don't test yet.

---

### Part 5 — Create a Route That Throws

Now create

```
router.get("/error", () => {
    throw new AppError(
        400,
        "Something went wrong"
    );
});

```

NOW

visit
```
GET /error
```

Expected
```
{
  "success": false,
  "message": "Something went wrong"
}
```
Now the middleware is verified.

---

### Part 6 — 404 Middleware

Create (open app.ts)

```
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

```

Express checks routes in order.

```
↓

/health

↓

/users

↓

/jobs

↓

No route found

↓

404 Middleware

↓

Response

```

If you put the 404 middleware `before` your routes:

```
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});

app.use("/health", healthRoutes);

```

then `every request` would immediately return 404 because Express stops once a response is sent.

That's why the order is:

```
Express

↓

JSON Middleware

↓

Routes

↓

404 Middleware

↓

Global Error Middleware

```

The order is critical.

---



### Next Lecture — Module 1, Lecture 6

This is where our actual project begins.

This lecture is one of the most important in the entire course because `you will understand the architecture behind every background processing system.`

And I promise one thing:

I will not skip a single file.


Every file will have:

✅ File path
✅ Why it exists
✅ Complete code
✅ Line-by-line explanation
✅ Run
✅ Test
✅ Debug
✅ Interview discussion

---

### Module 1 — Lecture 6.1
### Our First Background Queue

---

### Today's Goal

By the end of today, we'll achieve this:

```
                 Client

                    │

                    ▼

          POST /send-email

                    │

                    ▼

              Express API

                    │

        Add Job to Redis Queue

                    │

        Return Response Immediately

                    │

           ----------------

                    │

              Worker Process

                    │

             Process Job

                    │

            Print "Email Sent"

```

Notice:

Express never sends the email.

---

### Before Writing Code

Let's understand the architecture.

### Traditional API

```
Client

↓

Express

↓

Send Email

↓

Response

```

Problem:

User waits.

---

### Queue Architecture

```
Client

↓

Express

↓

Redis Queue

↓

Response Immediately

↓

Worker

↓

Send Email


```

User doesn't wait.

This is how Amazon, Uber, Swiggy, Netflix, LinkedIn, etc. work.

---

### Folder Structure

After today's lecture your project should look like this:

```
background-job-system/

src/

    config/

        database.ts

        redis.ts

        env.ts

    queues/

        email.queue.ts   <-- NEW

    workers/

        email.worker.ts  <-- NEW

    controllers/

        email.controller.ts <-- NEW

    routes/

        email.routes.ts <-- NEW

    app.ts

    server.ts

package.json
```

---

### STEP 1
### Install BullMQ

Open terminal.

Run

```
npm install bullmq

```

---

### Why BullMQ?

Redis only stores data.

BullMQ knows how to

- Retry jobs
- Delay jobs
- Priorities
- Failed jobs
- Completed jobs
- Workers
- Concurrency

BullMQ sits on top of Redis.

```
BullMQ

↓

Redis

↓

Memory

```

---

### STEP 2
### Create Queue Folder

Create

```
src/

    queues/

```
Inside create

```
email.queue.ts
```

Full path
```
background-job-system/

src/

queues/

email.queue.ts
```

---

### Why does this file exist?

Never create BullMQ queues inside controllers.

Controllers should only receive requests.

Queues belong inside

```
queues/
```

because

their responsibility is queue creation.

---

STEP 3

Open

```
src/queues/email.queue.ts

```

Write this.

```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email-queue", {
    connection: redis,
});

```

---

### Wait...

Will this code work?

No.

And this is intentional.

Why?

Because our current redis.ts is using the redis package, while BullMQ requires an ioredis connection.

You actually encountered this earlier in your project when we switched to ioredis. This is a real-world design issue, and it's important not to hide it.

So before we can create our first BullMQ queue, we need to refactor our Redis configuration.

---

### Why?

BullMQ is built around ioredis.

A production setup should use one shared ioredis connection for BullMQ producers and workers.

So our next lesson is


### Module 1 — Lecture 6.2

Refactor Redis Configuration for BullMQ

We'll:

Replace the redis package with ioredis
Build a reusable Redis connection
Explain every option (host, port, maxRetriesPerRequest, reconnect behavior)
Test the connection with PING
Verify BullMQ can use it

Only after that will we return to email.queue.ts


---

### Current Architecture

Right now

```
Express

↓

redis package

↓

Redis

```

### But we already update that one 

After this lecture

```
Express

↓

ioredis

↓

Redis

↑

BullMQ

↑

Worker

```

Notice

Both Express and BullMQ will use the same Redis connection.


### update 
`env.ts`

```
import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL!,
    REDIS_HOST:process.env.REDIS_HOST!,
    REDIS_PORT:process.env.REDIS_PORT!,


};


```


### update 
`redis.ts`

```
import Redis from "ioredis";
import { logger } from "../logger/index.js";
import { env } from "./env.js";

export const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,

    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    logger.info("✅ Redis Connected");
});

redis.on("ready", () => {
    logger.info("✅ Redis Ready");
});

redis.on("error", (error:any) => {
    logger.error(error);
});

redis.on("close", () => {
    logger.warn("Redis Connection Closed");
});

```
---

### Wait...

We used

```
env.REDIS_HOST

```

Do we have it?

Maybe not.

Let's fix that.

---

Note - We already fix that one.

`src/config/env.ts`

```

import dotenv from "dotenv";

dotenv.config();

export const env = {

    PORT: Number(process.env.PORT) || 5000,

    NODE_ENV: process.env.NODE_ENV || "development",

    DATABASE_URL: process.env.DATABASE_URL!,

    REDIS_HOST: process.env.REDIS_HOST || "localhost",

    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,

};

```

---
### Step 6

Open
```
.env
```

Update 
```
PORT=5000

NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/background_jobs"

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

### Step 7

Open

```
src/server.ts

```

Find

```
await redis.connect();

```
Note - We done it before.

Everything working fine

---

### Why does BullMQ use ioredis?

This is an interview favorite.

Suppose 

```
10 Workers

```

Each worker needs

- reconnect
- pub/sub
- blocking commands
- streams
- Lua scripts

BullMQ depends heavily on Redis features that ioredis supports very well.

That's why BullMQ officially recommends it.

---

### Production Tip

Never create multiple Redis instances.

❌ Bad

```
new Redis()

new Redis()

new Redis()

new Redis()

```

Each one creates another TCP connection.

---

✅ Good

```
export const redis = new Redis(...)

```

Everyone imports the same connection.

One application.

↓

One Redis connection (or a small, intentional set of specialized connections when needed).

---

Test Checklist

Before moving on:

✅ npm run dev starts successfully.
✅ Redis Connected appears.
✅ Redis Ready appears.
✅ redis.ping() returns PONG.
✅ Docker Redis container is running.
✅ No ECONNREFUSED errors.

Only after every check passes do we continue.

---


### Module 1 — Lecture 6.3
### Creating Our First Queue

- Now the real fun begins.
- Today you're going to create your first queue.
- Don't think of BullMQ as a library.
- Think of it as a Post Office.

```
You
 │
 │ Submit Letter
 ▼
Post Office (Queue)
 │
 │ Stores Letter
 ▼
Delivery Boy (Worker)
 │
 ▼
Receiver
```

Redis is the `Post Office.`

Worker is the `Delivery Boy.`

Express is the `Customer.`

---

### Today's Goal

By the end of this lecture

```POST /send-email

↓

BullMQ Queue

↓

Redis

↓

Job Stored Successfully


```

Notice

`No worker yet.`

Today we're only creating jobs.

---

### Before Coding

Let's understand what a Queue actually is.

Suppose

100 users click

```

Forgot Password

```

at exactly the same time.

Express receives

```
User 1

User 2

User 3

...

User 100

```

Should Express send 100 emails?

No.

Express should simply say

```
Redis,

please remember these 100 jobs.

```

Redis stores them.

Later

Workers process them.

---

### Project Structure

After today

```
background-job-system/

src/

config/

queues/

    email.queue.ts

controllers/

    email.controller.ts

routes/

    email.routes.ts

```

---

### STEP 1
#### Create Queue

Create file

`src/queues/email.queue.ts`

Why?

Every queue belongs inside

```
queues/

```

Controllers should never create BullMQ objects.

---

### STEP 2

Open
`src/queues/email.queue.ts`

Write

```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email-queue", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});
```

---

### Let's understand every line
### Line 1

```
import { Queue } from "bullmq";
```
BullMQ gives us a Queue class.

### Line 2

```

import { redis } from "../config/redis";

```
We're reusing

our existing Redis connection.

Never create another one.


Queue Name 
```
"email-queue"
```
Redis will literally create
```
bull:email-queue

```

as its internal key prefix.

Later you'll see it.

---

### attempts

```
attempts:3
```

Imagine

Worker crashes.

BullMQ retries.

```
Try 1

↓

Fail

↓

Try 2

↓

Fail

↓

Try 3

↓

Dead


```

Without writing any retry code.

---

### removeOnComplete

BullMQ stores completed jobs.

Thousands.

Millions.

Eventually Redis becomes huge

```
removeOnComplete:100
```

means

Keep only the latest

```
100
```

completed jobs.

Everything older is deleted automatically.

---

removeOnFail

Keep

```
500
```

failed jobs.

Why?

Because failures are useful for debugging.

---

### Stop

Run

```
npm run dev
```

Nothing should happen.

No errors.

Queue created.

No jobs yet.

---

### STEP 3

Now create Controller.

File

`src/controllers/email.controller.ts`

write 
```
import { Request, Response } from "express";
import { emailQueue } from "../queues/email.queue";

export async function sendEmail(
    req: Request,
    res: Response
) {

    const { email } = req.body;

    await emailQueue.add("send-email", {
        email,
    });

    return res.status(200).json({
        success: true,
        message: "Job Added Successfully",
    });

}

```

---

### Why Controller doesn't send email?

Because

Controller's responsibility is

```
Receive Request

↓

Validate

↓

Add Queue Job

↓

Return Response

```

NOT

```
Receive Request

↓

Connect SMTP

↓

Send Email

↓

Wait

↓

Return

```

Huge difference.

---

### STEP 4

Create Route

File

`src/routes/email.routes.ts`

```
import { Router } from "express";
import { sendEmail } from "../controllers/email.controller";

const router = Router();

router.post(
    "/send-email",
    sendEmail
);

export default router;
```

### STEP 5

Open
`src/app.ts`

Current 
```
app.use("/health", healthRoutes);
```
Add
```
import emailRoutes from "./routes/email.routes";

app.use(emailRoutes);

```

Notice

We didn't write

```
app.use("/email",...)

```

because route already contains

```
/send-email

```

Both styles are valid, but we'll keep this simple for now.

---

STEP 6

Run

```
npm run dev
```

Expected
```
Server running

Redis Connected

Redis Ready

```

### STEP 7

Test

Open Postman

```
POST

http://localhost:5000/send-email

```

Body

```
{
    "email":"abc@gmail.com"
}
```

Expected 
```
{
    "success":true,
    "message":"Job Added Successfully"
}

```

Great.

Question.

Was email sent?

No.

Worker doesn't exist

---

### STEP 8

Let's verify Redis stored the job.

Open terminal


```
docker exec -it bg-redis redis-cli
```

Run
```
KEYS *
```

Expected

Something like
```
bull:email-queue:id

bull:email-queue:wait

bull:email-queue:events

```

Congratulations.

Your first BullMQ queue exists.

---

Inspect Waiting Jobs

Run

```
LRANGE bull:email-queue:wait 0 -1


Example 
127.0.0.1:6379> LRANGE bull:email-queue:wait 0 -1

```
Expected
```
1
```

Meaning

Job ID

```
1
```

is waiting.

Redis is holding it.

---

Where is Email?

Run

```
HGETALL bull:email-queue:1

```

You'll see data similar to:

```
127.0.0.1:6379> HGETALL bull:email-queue:1
 1) "name"
 2) "send-email"
 3) "data"
 4) "{\"email\":\"abc@gmail.com\"}"
 5) "opts"
 6) "{\"removeOnComplete\":100,\"removeOnFail\":500,\"attempts\":3}"
 7) "timestamp"
 8) "1786132089043"
 9) "delay"
10) "0"
11) "priority"
12) "0"
127.0.0.1:6379> 


```


Now you know

Redis isn't storing "magic."

It's storing plain data structures that BullMQ manages.

---

### Architecture So Far

```
                Client

                   │

POST /send-email

                   │

                   ▼

            Express Controller

                   │

emailQueue.add(...)

                   │

                   ▼

             Redis Queue

                   │

             Waiting Jobs
```

No worker yet.

Jobs are simply waiting.

---


### Interview Questions
Why create Queue in a separate file?

Because

Queues are infrastructure.

Controllers are application logic.

Separation of concerns.

---

### Why isn't email sent immediately?

Because background processing improves response time and decouples request handling from long-running work.

---

### Why store jobs in Redis?

Because Redis acts as a fast, durable intermediary between producers (your API) and consumers (workers).

---



