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

### Small Improvement Before Next Lecture

One thing we'll improve in the next lecture is the route structure.

Instead of:
```
app.use(emailRoutes);
```

we'll use a versioned API:
```
app.use("/api/v1/emails", emailRoutes);
```

and inside `email.routes.ts:`

```
router.post("/", sendEmail);
```

This produces cleaner URLs:
```
POST /api/v1/emails
```

---

### Module 1 — Lecture 6.4
### Creating Our First Worker

Until now, we have built only the `producer side:`

```
Client
   │
   ▼
Express API
   │
   ▼
emailQueue.add()
   │
   ▼
Redis
   │
   ▼
WAITING

```

But nobody is consuming the job.

That's what a `Worker` does.

Today we'll build:

```
                    ┌──────────────┐
                    │  Node API    │
                    │  Producer    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │    Queue     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Worker    │
                    │   Consumer   │
                    └──────┬───────┘
                           │
                           ▼
                    Process Email Job
```

---

### Important Architecture Decision

Before coding, understand this:

#### The API process and Worker process should be separate processes.

Don't do this:

```
server.ts
   │
   ├── Express
   ├── Redis
   └── Worker
```

Instead:
```
API PROCESS
   │
   └── Express
         │
         ▼
       Redis
         ▲
         │
WORKER PROCESS
   │
   └── BullMQ Worker
```

Why?

Because if email processing becomes CPU-heavy, the API shouldn't become slow.

Later we can run:

```
API × 3

Worker × 10

```

independently.

That is the beginning of horizontal scaling.

---

### Step 1 — Create the Worker File

Create this folder if it doesn't exist:

```
background-job-system/
└── src/
    └── workers/
```

Now create:
```
src/workers/email.worker.ts
```

This file's responsibility is:

 - Consume jobs from email-queue and process them.

---

### Step 2 — Write the Worker

Open:
`src/workers/email.worker.ts`

Write:

```
import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

interface EmailJobData {
    email: string;
}

const emailWorker = new Worker<EmailJobData>(
    "email-queue",

    async (job: Job<EmailJobData>) => {

        logger.info({
            jobId: job.id,
            email: job.data.email,
        }, "Processing email job");

        // Simulate email processing
        await new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });

        logger.info({
            jobId: job.id,
        }, "Email processed successfully");
    },

    {
        connection: redis,
    }
);

emailWorker.on("completed", (job) => {

    logger.info({
        jobId: job.id,
    }, "Job completed");

});

emailWorker.on("failed", (job, error) => {

    logger.error({
        jobId: job?.id,
        error: error.message,
    }, "Job failed");

});

logger.info("Email worker started");
```

---

### Step 3 — Understand the Important Part

This line:
```
new Worker<EmailJobData>(
    "email-queue",
```

is extremely important.

We previously created:

```
new Queue("email-queue")
```

Now our worker uses:
```
"email-queue"
```

The names must match.

```
Queue
  │
  │ "email-queue"
  ▼
Redis
  ▲
  │
  │ "email-queue"
Worker
```

If you accidentally write:
```
new Worker("emailQueue")
```
instead of:
```
new Worker("email-queue")
```
they are different queues.

---

### Step 4 — Understand the Processor

This part:
```
async (job) => {
```
is the actual background processing function.

When BullMQ finds a waiting job:

```
Redis

Job #1
{
   email: "abc@gmail.com"
}
```

BullMQ gives it to:
```
async (job) => {
```

Then we can access:
```
job.id
```

and 
```
job.data.email
```

For example
```
job.id

1
```

and:
```
job.data.email

abc@gmail.com

```

---

### Step 5 — Why Did We Use an Interface?

We wrote:

```
interface EmailJobData {
    email: string;
}
```

Therefore:
```
job.data.email
```

is known by TypeScript to be:
```
string
```

This is much safer than:
```
job.data.whatever
```

TypeScript can catch mistakes before production.

---

### Step 6 — The `setTimeout`

We currently have:
```
await new Promise((resolve) => {
    setTimeout(resolve, 2000);
});

```

This is` not actually sending an email.`

We're deliberately simulating a slow background operation.

Imagine:
```
Send Email
Generate PDF
Resize Image
Process Video
Generate Report
Call External API
```
These operations may take time.

Our simulation takes:

```
2 seconds
```

This lets us observe the worker properly.

---

### Step 7 — Create a Worker Start Script

We don't want to start the worker whenever we start the API.

Create a new file:
```
src/worker.ts
```

Write:
```
import "./workers/email.worker";
```

That's it.

This file is the `entry point for the worker process.`

---

### Why Have `server.ts` AND `worker.ts?`

Because they represent different processes.

```
src/server.ts
       │
       ▼
    API PROCESS
       │
    Express
```
and:
```
src/worker.ts
       │
       ▼
  WORKER PROCESS
       │
    BullMQ
```

This separation is extremely important.

---

### Step 8 — Add Worker Script

Open:
```
package.json
```

Find:
```
"scripts": {
```

Change it to:
```
"scripts": {
    "dev": "nodemon --watch src --exec tsx src/server.ts",
    "dev:worker": "nodemon --watch src --exec tsx src/worker.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:worker": "node dist/worker.js"
}
```

Now we have two processes.

### API
```
npm run dev
```

### Worker 
```
npm run dev:worker
```

---

### Step 9 — Start Redis

Before testing:

```
docker compose up -d
```

Check :
```
docker ps
```

you should see:
```
bg-postgres
bg-redis
```
---

### Step 10 — Start the API

Terminal 1:

```
npm run dev
```
Expected:
```
Redis Connected
Redis Ready
Server running on port 5000
```

Keep this terminal running.

---

### Step 11 — Start the Worker

Open another terminal.

Inside the same project:

```
npm run dev:worker
```

Expected:

```
Email worker started
```

You now here:
```
Terminal 1

API
│
└── Express
```

and:
```
Terminal 2

Worker
│
└── BullMQ Worker

```

This is important.

`Do not close either terminal.`

---

### Step 12 — Create a Job

Use Postman or PowerShell.

Request

```
POST http://localhost:5000/send-email
```

Body:

```
JSON

{
    "email": "abc@gmail.com"
}

```

Expected API response:
```
{
    "success": true,
    "message": "Job Added Successfully"
}
```
---


### Step 13 — Watch the Worker

Look at Terminal 2.

You should see something similar to:
```
Email worker started

Processing email job
    jobId: 1
    email: abc@gmail.com
```

Wait approximately 2 seconds

Then:

```
Email processed successfully
```

and:
```
Job completed
```

🎉

You have just built your first background job system.

---

### Step 14 — Understand What Just Happened

The API received:

```
POST /send-email
```

Then:
```
await emailQueue.add("send-email", {
    email,
});
```

The API didn't process the email.

Instead:

```
API
 │
 │ Add Job
 ▼
Redis
 │
 │ Waiting
 ▼
Worker
 │
 │ Process
 ▼
Completed
```

This is the fundamental architecture we'll build on.

---

### Step 15 — Test the Most Important Property

Now let's prove that the API and worker are actually independent.

#### Stop the worker

In Terminal 2:
```
Ctrl + C
```
Worker stops.

---

Keep API running

Terminal 1 should still show:

```
Server running on port 5000
```

Now send
```
POST /send-email
```

again.
```
{
    "email": "second@gmail.com"
}
```

API should still respond:
```
{
    "success": true,
    "message": "Job Added Successfully"
}
```

But no email is processed.

Why?

Because:
```
API
 │
 ▼
Redis
 │
 ▼
Waiting Job
```

There is no worker.

---

### Step 16 — Start Worker Again

Run:

```
npm run dev:worker
```

Watch Terminal 2.

The worker should pick up the waiting job.

You should see:

```
Watch Terminal 2.

The worker should pick up the waiting job.

You should see:
```

then:
```
Email processed successfully
```

This is a `very important test.`

It proves Redis is acting as the intermediary.

---

### The Architecture You Just Built

```

                    ┌──────────────────┐
                    │      Client      │
                    └────────┬─────────┘
                             │
                             │ HTTP
                             ▼
                    ┌──────────────────┐
                    │   Node.js API    │
                    │                  │
                    │ Express          │
                    │ Producer         │
                    └────────┬─────────┘
                             │
                             │ add()
                             ▼
                    ┌──────────────────┐
                    │      Redis       │
                    │                  │
                    │  email-queue     │
                    │                  │
                    │    WAITING       │
                    └────────┬─────────┘
                             │
                             │ consume
                             ▼
                    ┌──────────────────┐
                    │      Worker      │
                    │                  │
                    │     BullMQ       │
                    │     Consumer     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Email Service   │
                    │    (Later)       │
                    └──────────────────┘

```

---

### Very Important Concept: Producer vs Consumer

The API is the:

### Producer

It produces jobs.

```
emailQueue.add(...)
```

The worker is the:

### Consumer

It consumes jobs.

```
new Worker(...)
```

This distinction is fundamental to distributed systems.

---

### What Happens If 1,000 Jobs Arrive?

Suppose:
```
1000 requests
```

come in.

API:

```
Job 1 ─┐
Job 2 ─┤
Job 3 ─┤
Job 4 ─┤
...    ├──> Redis
Job 999│
Job1000┘
```

Worker processes them.

If one worker isn't fast enough, later we can run:

```
Worker 1
Worker 2
Worker 3
Worker 4
Worker 5
```

all consuming from the same queue.

```
                    Redis
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Worker 1    Worker 2    Worker 3
```

That's horizontal worker scaling.

We'll get there.

---

### One Important Production Problem

Our current worker has this:

```
await new Promise((resolve) => {
    setTimeout(resolve, 2000);
});
```

But what happens if the worker crashes?

Or:
```
SMTP server unavailable
```

Or:
```
Email provider returns 500
```

We need:
```
Retry
```

That's why earlier we configured:
```
attempts: 3
```

But we haven't tested it yet.

That will be our next major lesson.

---

### Module 1 — Lecture 6.5
### Job Failures, Retries & Backoff

Our system currently works:
```
Client
  │
  ▼
API
  │
  ▼
Redis
  │
  ▼
Worker
  │
  ▼
Success
```

But production systems don't live in a perfect world.

External services fail.

```
SMTP unavailable
Payment provider timeout
Database temporarily unavailable
Third-party API returns 500
Network failure
Worker crashes
```

So we need:

```
Job
 │
 ▼
Attempt 1
 │
 ├── Success → Completed
 │
 └── Failure
       │
       ▼
    Retry
       │
       ▼
    Attempt 2
       │
       ├── Success → Completed
       │
       └── Failure
             │
             ▼
          Attempt 3
             │
             ├── Success → Completed
             │
             └── Failure
                   │
                   ▼
                 Failed
```

### Today's Goal

We'll implement and test:

attempts
backoff
failed jobs
retry behavior
attemptsMade
completed jobs
permanently failed jobs

And, importantly, we'll observe the behavior ourselves.

---

### Step 0 — Make Sure Previous Lecture Works

Before changing anything, start Redis:

```
docker compose up -d

```

Check:
```
docker ps
```
You should have:
```
bg-postgres
bg-redis
```

Terminal 1 — API
```
npm run dev
```

---

Terminal 2 — Worker
```
npm run dev:worker
```

You should see something like:

```
Redis Connected
Redis Ready
Server running on port 5000
```

and:
```
Email worker started

```

If your previous lecture isn't working, `don't implement today's changes yet.` Fix that first.

---

### Step 1 — Modify the Queue

Open this exact file:

```
background-job-system/
└── src/
    └── queues/
        └── email.queue.ts    <-- OPEN THIS

```

Currently you have something similar to:

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

We're going to add backoff.

Replace the file with:

```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email-queue", {
    connection: redis,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 1000,
        },

        removeOnComplete: 100,

        removeOnFail: 500,
    },
});
```

---

### Step 2 — Understand attempts

This:
```
attempts: 3
```

means BullMQ can execute the job up to `three times.`

For example:
```
Attempt 1
   ↓
Failed

Attempt 2
   ↓
Failed

Attempt 3
   ↓
Failed

Final state = failed
```

If attempt 2 succeeds:
```
Attempt 1
   ↓
Failed

Attempt 2
   ↓
Success

Final state = completed
```

---

### Step 3 — Understand Backoff

We added:
```
backoff: {
    type: "exponential",
    delay: 1000,
}

```
This means BullMQ doesn't immediately retry.

It waits.

Conceptually:
```
Attempt 1
   ↓
FAIL
   ↓
wait
   ↓
Attempt 2
   ↓
FAIL
   ↓
wait longer
   ↓
Attempt 3

```

Exponential backoff is useful because immediately hammering an already-failing external service is often a bad idea.

For our example, the delays grow roughly like:
```
1 second
2 seconds
4 seconds
...
```

The exact scheduling can also be affected by queue timing and worker availability.

---

### Step 4 — We Need a Job That Fails

Right now our worker always succeeds.

Open:
```
background-job-system/
└── src/
    └── workers/
        └── email.worker.ts    <-- OPEN THIS
```

Currently you have:
```
await new Promise((resolve) => {
    setTimeout(resolve, 2000);
});
```

We're going to make the worker intentionally fail for a particular email.

Replace the processor with:

```
import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

interface EmailJobData {
    email: string;
}

const emailWorker = new Worker<EmailJobData>(
    "email-queue",

    async (job: Job<EmailJobData>) => {

        logger.info({
            jobId: job.id,
            email: job.data.email,
            attempt: job.attemptsMade + 1,
        }, "Processing email job");

        // Intentionally fail this job
        if (job.data.email === "fail@gmail.com") {
            throw new Error("Simulated email provider failure");
        }

        // Simulate email processing
        await new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });

        logger.info({
            jobId: job.id,
        }, "Email processed successfully");
    },

    {
        connection: redis,
    }
);

emailWorker.on("completed", (job) => {

    logger.info({
        jobId: job.id,
    }, "Job completed");

});

emailWorker.on("failed", (job, error) => {

    logger.error({
        jobId: job?.id,
        attemptsMade: job?.attemptsMade,
        error: error.message,
    }, "Job failed");

});

logger.info("Email worker started");

```
---

### Step 5 — Why throw?

This is critical.

We have:

```
throw new Error("Simulated email provider failure");

```

BullMQ interprets a thrown error from the processor as:

  - The job failed.

Then BullMQ applies our retry policy.

```
Worker
  │
  ▼
throw Error
  │
  ▼
BullMQ detects failure
  │
  ▼
Retry policy
```

Don't manually do:

```
emailQueue.add(...)
```

again inside the worker.

BullMQ handles the retry.

---

### Step 6 — Restart the Worker

Because we're using nodemon, it should restart automatically.

If necessary:

```
Ctrl + C
```
then:
```
npm run dev:worker
```

Expected:
```
Email worker started
```

---

### Step 7 — Test a Successful Job First

Send:
```
POST http://localhost:5000/send-email
```

Body:
```
{
    "email": "success@gmail.com"
}
```

Expected worker behavior:

```
Processing email job
       ↓
2 seconds
       ↓
Email processed successfully
       ↓
Job completed
```

So our existing system still works.

---

### Step 8 — Now Break It

Send:

```
POST http://localhost:5000/send-email
```

Body:
```
{
    "email": "fail@gmail.com"
}

```

The API will still respond:

```
{
    "success": true,
    "message": "Job Added Successfully"
}
```

This is important.

The API's job was only to enqueue the job.

---

### Step 9 — Watch the Worker

Now look at your worker terminal.

You should see approximately:

```
Processing email job
jobId: 2
attempt: 1
```

Then:
```
Job failed
attemptsMade: 1
error: Simulated email provider failure
```

BullMQ waits according to the backoff policy.

Then:
```
Processing email job
jobId: 2
attempt: 2
```

It fails again.

Then:

```
Processing email job
jobId: 2
attempt: 3
```

It fails again.

Finally:

```
Job failed
```

The job is now permanently failed according to our configured three attempts.

---

### Step 10 — Important Distinction

You may notice:

```
job.attemptsMade
```

and:
```
job.opts.attempts

```
These mean different things.

`attempts`

Maximum number of attempts.

```
3
```
`attemptsMade`

How many attempts have already happened.

For example:

```
Before processing:
attemptsMade = 0

After first failure:
attemptsMade = 1

After second failure:
attemptsMade = 2

After third failure:
attemptsMade = 3

```

That's why we wrote:

```
attempt: job.attemptsMade + 1
```

while logging the current execution.

---

### Step 11 — Inspect Redis

Now let's look underneath BullMQ.

Open another terminal:

```
docker exec -it bg-redis redis-cli

```

Run:
```
KEYS bull:email-queue:*
```

You should see keys related to the queue.

Because we configured:
```
removeOnFail: 500

```
the failed job should remain available for inspection.

---

### Step 12 — Don't Guess the Job Key

Earlier we used:

```
HGETALL bull:email-queue:1

```
That was okay for our first job, but don't build production debugging habits around guessing IDs.

First discover the queue's job IDs:
```
ZRANGE bull:email-queue:failed 0 -1

127.0.0.1:6379> ZRANGE bull:email-queue:failed 0 -1

```

You should see failed job IDs, for example:

```
2
```

Then 
```
HGETALL bull:email-queue:6
```

You should see information about that job.

Depending on the BullMQ version and job state, the exact Redis keys and fields may vary, so use BullMQ's APIs for application-level inspection rather than hardcoding Redis internals.

---

### Step 13 — Understand the Job Lifecycle

We can now visualize the lifecycle.

```
                    add()
                     │
                     ▼
                  WAITING
                     │
                     ▼
                  ACTIVE
                     │
             ┌───────┴────────┐
             │                │
           Success           Error
             │                │
             ▼                ▼
         COMPLETED          RETRY
                              │
                              ▼
                           WAITING
                              │
                              ▼
                           ACTIVE
                              │
                         ┌────┴────┐
                         │         │
                      Success    Failure
                         │         │
                         ▼         ▼
                    COMPLETED    FAILED
```


This state machine is one of the most important concepts in job processing.

---

### Step 14 — Why Retries Matter

Imagine this real scenario:

```
Your Worker
     │
     ▼
Stripe API
     │
     X
Temporary network failure
```

Without retry:

```
Payment Job
    ↓
Failure
    ↓
Lost
```

With retry:
```
Payment Job
    ↓
Failure
    ↓
Wait
    ↓
Retry
    ↓
Success
```

Temporary failures become recoverable.

---

### But Retries Are NOT Always Safe

This is a very important production concept.

Imagine:

```
Charge Credit Card
```
Worker sends request:
```
₹1,000 charge
```

Stripe successfully charges the customer.

But your worker crashes `before recording the successful result.`

BullMQ retries.

You might accidentally charge the customer twice.

Therefore:
 -Retries require idempotent job processing.

We'll study idempotency later in this project.

This is one of the differences between a toy queue system and a production-grade one.

---

### Step 15 — Test Worker Recovery

Let's do a very useful test.

Start worker.

```
npm run dev:worker

```

### Send a failing job.
```
{
    "email": "fail@gmail.com"
}
```

### Immediately stop the worker.

```
Ctrl + C
```

Now the worker is gone.

Redis still contains the job state.

Start worker again:

```
npm run dev:worker
```

BullMQ will continue managing the job according to its state and retry configuration.

This is why we don't store job state only in Node.js memory.

---

### What Redis Is Really Giving Us

Without Redis:

```
API
 │
 ▼
Worker memory

```
Worker crashes:

```
Worker crashes:
```

Job information can disappear.

With Redis:
```
API
 │
 ▼
Redis
 │
 ▼
Worker


```

Worker crashes:
```
💥 Worker
   │
   ▼
Redis still has state
   │
   ▼
New Worker
```

That's the foundation of durability and decoupling in our system.

---

### Step 16 — One Production Improvement

Our queue currently has:

```
attempts: 3

```

and:

```
backoff: {
    type: "exponential",
    delay: 1000,
}
```

This is a reasonable starting point, but production systems often make retry policies `job-specific.`

For example:
```
Email
→ 5 attempts

Webhook
→ 8 attempts

Image processing
→ 3 attempts

Payment
→ carefully controlled retries
```

We'll eventually move toward a more deliberate retry strategy instead of one global setting.

---

### Your Current Project Structure

At this point, you should have:

```
background-job-system/
│
├── src/
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── redis.ts
│   │
│   ├── controllers/
│   │   └── email.controller.ts
│   │
│   ├── queues/
│   │   └── email.queue.ts
│   │
│   ├── routes/
│   │   └── email.routes.ts
│   │
│   ├── workers/
│   │   └── email.worker.ts
│   │
│   ├── logger/
│   │   └── index.ts
│   │
│   ├── app.ts
│   ├── server.ts
│   └── worker.ts
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

### Module 1 — Lecture 6.6

#### Delayed Jobs

Now we're adding another important capability to our background-job system:

 - `Tell the queue: "Do not process this job yet."`

This is different from a retry.

---

### 1. First understand the difference

### Normal job
```
API
 ↓
Queue
 ↓
Worker
 ↓
Process immediately
```

### Delayed job
```
API
 ↓
Queue
 ↓
WAIT 30 seconds
 ↓
Worker
 ↓
Process
```

Retry 

```
Worker
 ↓
Job fails
 ↓
Wait
 ↓
Try again
```

So:

| Feature   | Purpose                               |
| --------- | ------------------------------------- |
| `delay`   | Don't start the job yet               |
| `retry`   | Job already failed; try again         |
| `backoff` | Control how long to wait before retry |

---

### 2. Real Production Example

Imagine a user signs up.

We want:

```
User signs up
      ↓
Send welcome email immediately
      ↓
Wait 24 hours
      ↓
Send "How are you finding our product?"
      ↓
Wait 7 days
      ↓
Send onboarding email

```

Or:

```
Payment successful
      ↓
Schedule invoice email
      ↓
Process later
```

We'll start with something much simpler

---

### Today's Goal

We'll create:

```
POST /send-email
```

with an optional delay.

For example:
```
{
    "email": "test@gmail.com",
    "delay": 10000
}
```

10000 means:
```
10 sec
```

The API should respond immediately:
```
Job Added
```

But the worker should not process it immediately.

---

### 3. Important: No New Queue Needed

We already have:

```
src/queues/email.queue.ts
```

We'll continue using it.

Why?

Because delayed jobs are a feature of a queue, not a different kind of queue.

---

### Step 1 — Open the Controller

Open exactly:
```
background-job-system/
└── src/
    └── controllers/
        └── email.controller.ts   <-- THIS FILE
```

We're going to modify it.

---

### Step 2 — Add `delay`

Replace the complete file with:

```
import { Request, Response } from "express";
import { emailQueue } from "../queues/email.queue";

export async function sendEmail(
    req: Request,
    res: Response
) {
    const { email, delay = 0 } = req.body;

    const job = await emailQueue.add(
        "send-email",
        {
            email,
        },
        {
            delay,
        }
    );

    return res.status(200).json({
        success: true,
        message: "Job Added Successfully",
        jobId: job.id,
        delay,
    });
}
```

---

### 3. Understand This Carefully

This:
```
const { email, delay = 0 } = req.body;
```

means:
if request is:

```
{
    "email": "test@gmail.com"
}
```

then:
```
delay=0;
```

So it behaves like a normal job.

But if request is:

```
{
    "email": "test@gmail.com",
    "delay": 10000
}
```

then:
```
delay=10000;
```

---

### 4. The Important BullMQ Code

This is the critical part:

```
await emailQueue.add(
    "send-email",
    {
        email,
    },
    {
        delay,
    }
);

```

The arguments are:
```
queue.add(

    job name,

    job data,

    job options

)
```

So:
```
"send-email"
```

is the job name.

```
{
    email
}
```


is the data.
And:

```
{
    delay
}
```

is the configuration.

---

### Step 3 — Start Everything

First:
```
docker compose up -d
```

Then Terminal 1:
```
npm run dev
```

Then Terminal 2:

```
npm run dev:worker
```

---

### Step 4 — Test Normal Job

Send:

```
POST http://localhost:5000/send-email
```

Body:
```
{
    "email": "normal@gmail.com"
}
```

Expected API response:
```
{
    "success": true,
    "message": "Job Added Successfully",
    "jobId": "1",
    "delay": 0
}
```

The worker should process it immediately.

---

### Step 5 — Test Delayed Job

Now send:

```
POST http://localhost:5000/send-email
```

Body:
```
{
    "email": "delayed@gmail.com",
    "delay": 10000
}
```

Expected API response:

```
{
    "success": true,
    "message": "Job Added Successfully",
    "jobId": "2",
    "delay": 10000
}
```

The API returns immediately.

But look at the worker terminal.

You should not immediately see:

```
Processing email job
```

Wait approximately:
```
10 seconds
```

Then:
```
Processing email job
```

and eventually:
```
Email processed successfully
```

---

### Step 6 — Why Is This Powerful?

Notice what happened.

The API did:

```
POST /send-email

      ↓

emailQueue.add()

      ↓

Response immediately
```

It did `not` do:
```
wait 10 seconds
```

That's the entire point.

The API is free to handle another request.

---

### Step 7 — Let's Observe Redis

Open:
```
docker exec -it bg-redis redis-cli
```

Now create a delayed job:
```
{
    "email": "redis-test@gmail.com",
    "delay": 30000
}
```

We used:
```
30000 ms
```
which is:
```
30 seconds
```

Immediately run:

```
KEYS bull:email-queue:*
```

You should see queue-related keys, potentially including a delayed-job structure depending on the BullMQ version.

BullMQ manages the delayed state internally in Redis.

---

### Step 8 — Don't Manually Move the Job

This is important.

You should not write Redis code like:

```
redis.zadd(...)
```

to implement delayed jobs yourself.

Don't do this:

```
API
 ↓
redis.zadd()
 ↓
custom scheduler
 ↓
worker
```

BullMQ already provides this functionality.

We want:

```
API
 ↓
BullMQ
 ↓
Redis
 ↓
BullMQ Worker
```

Let the job system manage the lifecycle.

---

### Step 9 — Test Multiple Delayed Jobs

Create three jobs.

### Job 1
```
{
    "email": "one@gmail.com",
    "delay": 5000
}
```

### Job 2 
```
{
    "email": "two@gmail.com",
    "delay": 10000
}
```

### Job 3
```
{
    "email": "two@gmail.com",
    "delay": 10000
}
```

You should observe roughly:

```
5 sec
 ↓
Job 1

10 sec
 ↓
Job 2

15 sec
 ↓
Job 3
```

The important thing is that the `delay belongs to each job.`

---

### Step 10 — Now Let's Make It Production-Safer

Right now we're accepting:

```
{
    "delay": -5000
}
```

That's nonsense.

Also:
```
{
    "delay": "hello"
}
```

is invalid.

And:

```
{
    "delay": 999999999999
}
```

could be problematic.

We shouldn't blindly trust request input.

---

### Step 11 — Validate Delay

For now, let's keep the validation simple.

Open:
```
src/controllers/email.controller.ts
```

Replace it with:
```
import { Request, Response } from "express";
import { emailQueue } from "../queues/email.queue";

export async function sendEmail(
    req: Request,
    res: Response
) {
    const { email, delay = 0 } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Valid email is required",
        });
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

    const job = await emailQueue.add(
        "send-email",
        {
            email,
        },
        {
            delay,
        }
    );

    return res.status(200).json({
        success: true,
        message: "Job Added Successfully",
        jobId: job.id,
        delay,
    });
}
```

---

### Step 12 — Test Invalid Delay

Send:

```
{
    "email": "test@gmail.com",
    "delay": -100
}
```


### Step 12 — Test Invalid Delay
Send:
```
{
    "email": "test@gmail.com",
    "delay": -100
}
```

Expected:
```
{
    "success": false,
    "message": "Delay must be a positive integer"
}
```

### Step 13 — Delay vs Retry

This is one of the most important things to remember.

### Delayed job

You intentionally tell BullMQ:

```
Don't process this yet.
```

Example :
```
{
    delay: 10000
}
```

Meaning:
```
Wait 10 seconds
```

---

#### Retry backoff

The job already started and failed.

```
Worker
 ↓
Process
 ↓
FAIL
 ↓
Wait
 ↓
Retry
```

Controlled by:
```
backoff: {
    type: "exponential",
    delay: 1000
}

```

---

Visual Difference

```
DELAYED JOB

API
 │
 ▼
Redis
 │
 │ wait
 │
 │ 10 sec
 ▼
Worker
 │
 ▼
Process
```

versus:

```
RETRY

API
 │
 ▼
Redis
 │
 ▼
Worker
 │
 ▼
Process
 │
 X
FAIL
 │
 ▼
Backoff
 │
 ▼
Worker
 │
 ▼
Process Again
```

Very different concepts.

---

### Step 14 — Production Scenario

Imagine our application has password reset.

User clicks:
```
Forgot Password
```
API
```
Generate reset token

       ↓

Save token in PostgreSQL

       ↓

Add email job

       ↓

Return response
```

Queue:
```
emailQueue.add(
    "password-reset",
    {
        userId,
        email,
        resetToken
    }
)
```
Worker:
```
Receive job

↓

Generate email

↓

Send email

↓

Complete
```

That's where our project is heading.

---

### Step 15 — One Important Security Lesson

Don't put sensitive information unnecessarily into Redis jobs.

For example, don't casually put:

```
{
    "password": "MySecretPassword"
}
```

into a queue.

Redis is infrastructure, not a secret vault.

Prefer:
```
{
    "userId": 123
}
```

and let the worker retrieve what it legitimately needs.

We'll discuss data ownership and security more deeply when we build the real email workflow.

---

### Current Architecture

Your system is now:

```
                         ┌──────────────┐
                         │    Client    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  Express API │
                         │   Producer   │
                         └──────┬───────┘
                                │
                         queue.add()
                                │
                                ▼
                  ┌─────────────────────────┐
                  │          Redis          │
                  │                         │
                  │ WAITING                 │
                  │ DELAYED                 │
                  │ ACTIVE                  │
                  │ COMPLETED               │
                  │ FAILED                  │
                  └────────────┬────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Worker    │
                        │   Consumer   │
                        └──────────────┘
```

We've now got:

```
✅ Queue

✅ Worker

✅ Successful jobs

✅ Failed jobs

✅ Retries

✅ Exponential backoff

✅ Delayed jobs
```

That's already a real asynchronous processing foundation.

---

### Module 1 — Lecture 6.7
#### Job Priority

Today we're going to make our queue smarter.

Right now, suppose Redis contains:

```
100 normal jobs
```

and then a user requests:
```
Password Reset
```

We don't want important jobs to be treated exactly like low-value background work.

We'll introduce `job priority.`


---

### 1. What We're Building

Our queue will eventually handle:

```
HIGH PRIORITY
────────────────
Password reset
Account security
Payment confirmation

NORMAL PRIORITY
────────────────
Welcome email
Order confirmation

LOW PRIORITY
────────────────
Analytics
Reports
Cleanup
```

The important concept is:

 - Lower BullMQ priority number = higher priority.

For example:
```
priority: 1   → very high
priority: 5   → medium
priority: 10  → low
```

---

### 2. Important Limitation

Priority does not mean:

 - "This job will always execute immediately."

If your worker is already processing a job:

```
Worker
  │
  ├── Processing normal job
  │
  │    ← High priority job arrives
  │
  └── Current job continues
```

The high-priority job cannot magically interrupt the currently executing JavaScript function.

It will be considered when the worker is ready for another job.

This is important for understanding real queue systems.

---

### 3. Today's Architecture

We'll change:
```
POST /send-email

        ↓

emailQueue.add()

        ↓

Redis

```

into:
```
POST /send-email
        │
        ▼
Determine priority
        │
        ▼
BullMQ
        │
        ▼
Redis
        │
        ▼
Worker
```

---

### Step 1 — Open the Controller

Open exactly:

```
background-job-system/
└── src/
    └── controllers/
        └── email.controller.ts
```

We currently accept:
```
{
    "email": "test@gmail.com",
    "delay": 10000
}
```
We'll add:

```
{
    "email": "test@gmail.com",
    "priority": "high"
}
```

---

### Step 2 — Define Allowed Priorities

At the top of:
```
src/controllers/email.controller.ts
```
add:
```
type EmailPriority = "high" | "normal" | "low";
```

So TypeScript knows that these are the only valid values.

---

### Step 3 — Create a Priority Map

Below the type, add:

```
const PRIORITY_MAP: Record<EmailPriority, number> = {
    high: 1,
    normal: 5,
    low: 10,
};
```

This is important.

Our API speaks in business terms:

```
high
normal
low
```

BullMQ receives:

```
1
5
10
```

So we're keeping BullMQ-specific infrastructure details out of the request.

---

Step 4 — Update the Complete Controller

Open:
```
src/controllers/email.controller.ts
```

Replace the entire file with:

```
import { Request, Response } from "express";
import { emailQueue } from "../queues/email.queue";

type EmailPriority = "high" | "normal" | "low";

const PRIORITY_MAP: Record<EmailPriority, number> = {
    high: 1,
    normal: 5,
    low: 10,
};

export async function sendEmail(
    req: Request,
    res: Response
) {
    const {
        email,
        delay = 0,
        priority = "normal",
    } = req.body;

    if (
        typeof email !== "string" ||
        email.trim() === ""
    ) {
        return res.status(400).json({
            success: false,
            message: "Valid email is required",
        });
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

    const job = await emailQueue.add(
        "send-email",
        {
            email,
        },
        {
            delay,
            priority: PRIORITY_MAP[priority as EmailPriority],
        }
    );

    return res.status(200).json({
        success: true,
        message: "Job Added Successfully",
        jobId: job.id,
        priority,
        delay,
    });
}

```

---

### Step 5 — Understand the Important Part

This:
```
priority: PRIORITY_MAP[priority as EmailPriority]
```

could become:
```
high
  ↓
1

normal
  ↓
5

low
  ↓
10
```

So when the client sends:

```
{
    "email": "user@gmail.com",
    "priority": "high"
}
```

BullMQ receives:
```
{
    priority: 1
}
```

---

### Step 6 — Why Don't We Let Clients Send Numbers?

We could do this:

```
{
    "priority": 1
}

```

But that's bad API design for our use case.

What does:

```
priority: 1
```

mean?

A developer has to know our infrastructure configuration.

Instead:

```
{
    "priority": "high"
}
```

is self-explanatory.

Our application owns the meaning.

BullMQ owns the implementation.

That's a good separation of concerns.

---

### Step 7 — Start Everything

Start Redis:

```
docker compose up -d
```

Terminal 1
```
npm run dev
```

Terminal 2
```
npm run dev:worker
```

---

### Step 8 — Test High Priority

Send:

```
POST http://localhost:5000/send-email
```

Body:
```
{
    "email": "important@gmail.com",
    "priority": "high"
}
```

Expected :
```
{
    "success": true,
    "message": "Job Added Successfully",
    "jobId": "1",
    "priority": "high",
    "delay": 0
}
```

The worker should process it.

---

### Step 9 — Test Normal Priority

Send:

```
{
    "email": "normal@gmail.com",
    "priority": "normal"
}
```

Expected:
```
{
    "success": true,
    "message": "Job Added Successfully",
    "jobId": "2",
    "priority": "normal",
    "delay": 0
}
```

---

### Step 10 — Test Low Priority

Send:

```
{
    "email": "low@gmail.com",
    "priority": "low"
}
```

Expected:
```
{
    "success": true,
    "message": "Job Added Successfully",
    "jobId": "3",
    "priority": "low",
    "delay": 0
}
```

---

### But We Haven't Proven Priority Yet

Correct.

If you send jobs one at a time:

```
Job 1
 ↓
Worker

Job 2
 ↓
Worker

Job 3
 ↓
Worker
```

there is no competition.

We need to create a backlog.

---

### Step 11 — Make the Worker Slower

This will allow us to observe scheduling.

Open:

```
src/workers/email.worker.ts
```

Find:

```
await new Promise((resolve) => {
    setTimeout(resolve, 2000);
});
```

Change it temporarily to:

```
await new Promise((resolve) => {
    setTimeout(resolve, 5000);
});
```

Now each job takes approximately 5 seconds.

---

### Why Are We Doing This?

We need enough time to create:

```
LOW
LOW
LOW
HIGH
```

before the worker finishes the current job.

---

### Step 12 — Temporarily Stop the Worker

In Terminal 2:
```
Ctrl + C
```
Now the queue has no consumer

---

### Step 13 — Add Low Priority Jobs

Send these four requests.

#### Job 1
```
{
    "email": "low-1@gmail.com",
    "priority": "low"
}

```

### Job 2
```
{
    "email": "low-2@gmail.com",
    "priority": "low"
}
```

### Job 3
```
{
    "email": "low-3@gmail.com",
    "priority": "low"
}
```

Now add:

Job 4

```
{
    "email": "high-1@gmail.com",
    "priority": "high"
}

```

Now Redis contains roughly:

```
LOW
LOW
LOW
HIGH
```

---

Step 14 — Start Worker

Run:

```
npm run dev:worker
```

Watch carefully.

The worker should select the higher-priority eligible job before lower-priority waiting jobs.

You should see:

```
high-1@gmail.com
```

being selected before the low-priority jobs.

Then the low-priority jobs follow.

---

### Important Detail

Don't be surprised if the exact logs don't look like:

```
HIGH
LOW
LOW
LOW
```

because your previous jobs may still exist in Redis.

You may also have:

```
completed
failed
delayed
```

jobs from previous lectures.

For clean experiments, we should eventually give ourselves a proper queue reset/development cleanup mechanism.

`Don't manually delete random Redis keys yet.`

We'll build a safer queue-management approach later.

---

### Step 15 — Test Invalid Priority

Send:
```
{
    "email": "test@gmail.com",
    "priority": "urgent"
}
```

Expected:
```
{
    "success": false,
    "message": "Priority must be high, normal, or low"
}
```

That's good.

Our API doesn't allow arbitrary priority values.

---

### Step 16 — Test Default Priority

Send:

```
{
    "email": "default@gmail.com"
}
```

Because we wrote:
```
priority = "normal"
```

the request becomes: 
```
priority = normal
```

and BullMQ gets:
```
priority = 5
```

---

### Step 17 — Understand What BullMQ Is Doing

Conceptually:

```
Redis Queue
────────────────────────────

Job A → priority 10
Job B → priority 10
Job C → priority 1
Job D → priority 5

                 │
                 ▼

             Worker

                 │
                 ▼

             Job C
```


The worker doesn't simply say:

 - "Give me the oldest job."

It considers the queue's scheduling rules.


---

### Step 18 — Priority Is Not Preemption

This is extremely important.

Suppose:

```
Worker
  │
  ▼
Processing LOW job
```

and then:
```
HIGH job arrives
```

BullMQ doesn't normally stop the low job halfway through.

It does:
```
LOW
│
├── currently running
│
└── finishes
       │
       ▼
HIGH
```

So priority affects `which waiting job is selected next.`

It does not mean:

```
HIGH arrives
   ↓
kill LOW
   ↓
run HIGH
```

---

### Step 19 — Priority + Concurrency

Now think about this.

One worker:

```
Worker concurrency = 1
```

means:
```
Job A
  ↓
finish
  ↓
Job B
  ↓
finish
```

If we later use:
```
concurrency: 5
```

the worker can process multiple jobs concurrently.

Conceptually:

```
             Redis
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
     Job 1   Job 2    Job 3
       │       │        │
       ▼       ▼        ▼
    Worker  Worker   Worker
      slot     slot     slot
```

We'll study concurrency separately because it has major implications for CPU, memory, external APIs, database connections, and rate limits.

---

### Step 20 — Why Priority Is Useful

Imagine our application eventually has:

```
email-queue
```
with:
```
Password reset       HIGH
OTP                  HIGH
Order confirmation   HIGH

Welcome email        NORMAL
Newsletter           NORMAL

Analytics report     LOW
Cleanup              LOW
```

If the queue becomes busy:
```
10,000 analytics jobs
```

we don't necessarily want:
```
Password reset
```

waiting behind all of them.

Priority gives us a scheduling mechanism.

---

### Step 21 — But Don't Abuse Priority

A common mistake is:
```
Everything = HIGH
```

Then:
```
HIGH
HIGH
HIGH
HIGH
HIGH
HIGH
```

If everything is important:

 - Nothing is actually prioritized.

Priority should represent a meaningful business requirement.

---

### Step 22 — One More Production Concern

Imagine:
```
HIGH
HIGH
HIGH
HIGH
HIGH
HIGH
...
```

keeps arriving.

Then:
```
LOW
LOW
LOW
```

may keep waiting.

This is called `starvation.`

So queue priority is not automatically a complete fairness strategy.

Production systems sometimes need separate queues:

```
critical-queue
normal-queue
bulk-queue
```

or carefully designed worker allocation.

We'll eventually compare:

```
One queue + priority
```

versus:
```
Multiple queues
```

because both are useful architectures.

---

### Step 23 — Restore Worker Delay

We temporarily changed:

```
5000
```

Restore:
```
2000
```

Open:
`src/workers/email.worker.ts`

and make sure this is back to:

```
await new Promise((resolve) => {
    setTimeout(resolve, 2000);
});
```

Don't leave our artificial 5-second delay in the project.

---

### Current Architecture

We now have:

```
                         Client
                           │
                           ▼
                    ┌─────────────┐
                    │   Express   │
                    │  Producer   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   BullMQ    │
                    │    Queue    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │             │
                    │  Delayed    │
                    │  Waiting    │
                    │  Active     │
                    │  Completed  │
                    │  Failed     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Worker    │
                    │             │
                    │ Priority    │
                    │ Retry       │
                    │ Backoff     │
                    │ Delay       │
                    └─────────────┘

```

---


### Your Testing Checklist

Do all five.

#### Test 1 — High

```
{
    "email": "high@gmail.com",
    "priority": "high"
}
```

#### Test 2 — Normal

```
{
    "email": "normal@gmail.com",
    "priority": "normal"
}
```

#### Test 3 — Low
```
{
    "email": "low@gmail.com",
    "priority": "low"
}

```

### Test 4 — Invalid
```
{
    "email": "invalid@gmail.com",
    "priority": "urgent"
}
```

Expected:
```
400
```

Test 5 — Actual Priority Competition
- Stop worker.
- Add 3 low-priority jobs.
- Add 1 high-priority job.
- Start worker.
- Observe which eligible job is selected first.

---

### Next Lecture — Module 1, Lecture 6.8
### Dead Letter Queue (DLQ)

Until now, our system works like this:

```
API
 │
 ▼
Main Queue
 │
 ▼
Worker
 │
 ├── Success → Completed
 │
 └── Failure
       │
       ▼
Retry
       │
       ▼
Still Failed
       │
       ▼
❌ Job Lost (Practically)
```

In a production system, `we never ignore permanently failed jobs.`

Instead, we move them to a `Dead Letter Queue (DLQ).`

```
                Main Queue
                    │
                    ▼
                 Worker
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   Success                  Permanent Failure
        │                       │
        ▼                       ▼
   Completed              Dead Letter Queue
                                 │
                                 ▼
                     Developer / Admin Reviews
```


---

### What is a Dead Letter Queue?

A `Dead Letter Queue` is a special queue that stores jobs that `could not be processed successfully`, even after all retries.

Examples:

- Payment service permanently unavailable
- Invalid email template
- Corrupted image upload
- Invalid webhook payload

Instead of losing the job, we `preserve it.`

---

Today's Goal

We'll build:

- A dedicated DLQ
- Automatically move failed jobs into it
- Process DLQ jobs separately
- Log why they failed
- Keep original job information

---

### Project Structure After This Lecture

```
src/
│
├── queues/
│   ├── email.queue.ts
│   └── dead-letter.queue.ts   <-- NEW
│
├── workers/
│   ├── email.worker.ts
│   └── dlq.worker.ts          <-- NEW
│
├── worker.ts
└── ...
```

---

### Step 1 — Create the Dead Letter Queue
### Create File
`src/queues/dead-letter.queue.ts`

Write:
```
import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const deadLetterQueue = new Queue("dead-letter-queue", {
    connection: redis,

    defaultJobOptions: {
        attempts: 1,

        removeOnComplete: false,

        removeOnFail: false,
    },
});
```

---

### Why attempts: 1 ?

If a job has already failed permanently,

we don't want another endless retry loop.

```
Main Queue
↓

Failed

↓

DLQ

↓

Store
```

Not:

```
DLQ

↓

Retry

↓

Retry

↓

Retry
```

---

### Step 2 — Modify Email Worker

Open
`src/workers/email.worker.ts`

---

Find this listener:

```
emailWorker.on("failed", (job, error) => {

    logger.error({
        jobId: job?.id,
        attemptsMade: job?.attemptsMade,
        error: error.message,
    }, "Job failed");

});
```

Replace it with this complete version:
```
import { deadLetterQueue } from "../queues/dead-letter.queue";

emailWorker.on("failed", async (job, error) => {

    logger.error({
        jobId: job?.id,
        attemptsMade: job?.attemptsMade,
        error: error.message,
    }, "Job failed");

    if (!job) {
        return;
    }

    // Only move after ALL retries are exhausted
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {

        await deadLetterQueue.add(
            "failed-email-job",
            {
                originalJobId: job.id,
                email: job.data.email,
                reason: error.message,
                failedAt: new Date().toISOString(),
            }
        );

        logger.warn({
            originalJobId: job.id,
        }, "Moved job to Dead Letter Queue");
    }

});
```

---

### Why this condition?

This line is extremely important.

```
if (job.attemptsMade >= (job.opts.attempts ?? 1))
```

Imagine:
```
attempts = 3
```

```
Attempt 1

↓

Fail

↓

Retry

Attempt 2

↓

Fail

↓

Retry

Attempt 3

↓

Fail

↓

DLQ

```

We move the job `only after the final retry.`

---

### Step 3 — Create the DLQ Worker

Create file
`src/workers/dlq.worker.ts`
Write:
```
import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../logger";

interface DeadLetterJob {
    originalJobId: string;
    email: string;
    reason: string;
    failedAt: string;
}

new Worker<DeadLetterJob>(
    "dead-letter-queue",

    async (job: Job<DeadLetterJob>) => {

        logger.warn({
            originalJobId: job.data.originalJobId,
            email: job.data.email,
            reason: job.data.reason,
            failedAt: job.data.failedAt,
        }, "Dead Letter Job Received");

        // In production this could:
        // Save to DB
        // Notify Slack
        // Send PagerDuty alert
        // Create Jira ticket
    },

    {
        connection: redis,
    }
);

logger.info("DLQ Worker Started");
```

---

#### Step 4 — Start Both Workers

Open
`src/worker.ts`

Currently you probably have:
```
import "./workers/email.worker";
```

Replace with:
```
import "./workers/email.worker";
import "./workers/dlq.worker";
```

Now running:
```
npm run dev:worker
```

starts:
```
Email Worker

+

DLQ Worker
```

---

### Step 5 — Restart Everything

Terminal 1

```
npm run dev
```

Terminal 2
```
npm run dev:worker
```

Expected:
```
Email worker started

DLQ Worker Started
```

---

### Step 6 — Force a Failure

Use:

```
POST /send-email
```
Body
```
{
    "email": "fail@gmail.com"
}
```

Remember,

our worker intentionally throws

```
throw new Error("Simulated email provider failure");
```

---

### Step 7 — Observe

Worker output
```
Attempt 1

↓

Fail

↓

Retry

↓

Attempt 2

↓

Fail

↓

Retry

↓

Attempt 3

↓

Fail

↓

Moved job to Dead Letter Queue

↓

DLQ Worker Received Job
```

Exactly what we wanted.

---

### Step 8 — What's Inside the DLQ?

Our payload is

```
{
    originalJobId: job.id,

    email: job.data.email,

    reason: error.message,

    failedAt: new Date().toISOString()
}
```

Notice

We preserve

 - Original Job ID
 - Email
 - Failure reason
 - Failure timestamp

That helps operators debug the issue later.

---

### Step 9 — Production Example

Imagine

```
Payment Queue

↓

Stripe timeout

↓

Retry

↓

Retry

↓

Still failed

↓

DLQ
```

The DLQ might trigger

```
Slack alert

↓

Engineer notified

↓

Issue investigated

↓

Replay job
```

No payment request is silently lost.

---

### Step 10 — Test Another Failure

Modify

```
if (job.data.email === "fail@gmail.com")
```

to

```
if (
    job.data.email.includes("fail")
)
```

Now these should fail

```
{
    "email": "fail1@gmail.com"
}

```

```
{
    "email": "fail2@gmail.com"
}
```

```
{
    "email": "fail@gmail.com"
}
```
Watch all of them appear in the DLQ.

After testing, restore the original condition if you prefer.

---

### Step 11 — Why Not Delete Failed Jobs?

Bad idea

```
Fail

↓

Delete
```

You've lost

- Payload
- Error
- Context

Impossible to investigate later.

---

Better
```
Fail

↓

DLQ

↓

Inspect

↓

Replay if needed
```

---

### Step 12 — Redis Flow

Now our architecture becomes

```
              API
               │
               ▼
         Email Queue
               │
               ▼
            Worker
               │
       ┌───────┴────────┐
       ▼                ▼
Completed           Failed
                        │
                        ▼
              Dead Letter Queue
                        │
                        ▼
                  DLQ Worker
```


---

### Step 13 — A Better Design (Coming Soon)

Right now,

the DLQ worker only logs.

Production systems usually do much more.

For example

```
DLQ

↓

Database

↓

Admin Dashboard

↓

Replay Button

↓

Move back to Main Queue
```

We'll build that later.

---

### Step 14 — Verify in Redis

Open
```
docker exec -it bg-redis redis-cli
```


Run:
```
KEYS bull:dead-letter-queue:*
```

You should now see Redis keys for the DLQ.

---

### Step 15 — One Important Production Rule

#### Never put every failed job into the DLQ automatically without thinking.

Some failures are `permanent:`

```
Email address doesn't exist
```

Retrying forever won't help.

Others are `transient:`

```
SMTP server timeout
```

Retries make sense.

Later in the course, we'll classify errors so we only retry when it is meaningful.

---

### Current Architecture
```
                    Client
                      │
                      ▼
                Express API
                      │
                      ▼
                 Email Queue
                      │
                      ▼
                   Redis
                      │
                      ▼
                 Email Worker
                ┌─────┴─────┐
                ▼           ▼
          Completed     Failed
                            │
                            ▼
                 Dead Letter Queue
                            │
                            ▼
                     DLQ Worker
```

---

### Testing Checklist
#### Test 1 — Successful Job

```
{
    "email": "success@gmail.com"
}
```

Expected:
```
Completed

NOT moved to DLQ
```

---

Test 2 — Failed Job

```
{
    "email": "fail@gmail.com"
}
```

Expected:
```
Retry

Retry

Retry

↓

DLQ
```

---

### Test 3 — Redis

Run
```
docker exec -it bg-redis redis-cli
```

Then
```
KEYS bull:dead-letter-queue:*
```

Verify the DLQ exists.

---

### Test 4 — Worker Logs

Verify you see

```
Moved job to Dead Letter Queue
```
and then
```
Dead Letter Job Received
```

---

### What You've Learned

You now understand:

✅ Retries
✅ Exponential backoff
✅ Delayed jobs
✅ Priorities
✅ Permanent failures
✅ Dead Letter Queue (DLQ)

These are core building blocks used in production systems built with BullMQ, RabbitMQ, Kafka consumers, AWS SQS, Azure Service Bus, and Google Pub/Sub.

---

### Module 1 — Lecture 6.9
#### Production Job Monitoring & Administration API

Up until now, we've been checking jobs using:
```
redis-cli
```

or watching the worker logs.

That works for development, but in production, you don't SSH into Redis every time you want to inspect a job.

Instead, you expose `internal/admin APIs.`

By the end of this lecture, you'll have endpoints like:

```
GET    /api/v1/jobs/:id
GET    /api/v1/jobs
GET    /api/v1/jobs/failed
GET    /api/v1/jobs/completed
GET    /api/v1/jobs/waiting
GET    /api/v1/jobs/delayed
POST   /api/v1/jobs/:id/retry
DELETE /api/v1/jobs/:id
```

---

### What We'll Build

```
Admin Client
      │
      ▼
Express API
      │
      ▼
BullMQ Queue
      │
      ▼
Redis
```

Instead of directly talking to Redis, our API will use `BullMQ's Queue API.`

This is the production approach.

---

### Step 1 — Create a Jobs Controller

Create this file:
```
background-job-system/
└── src/
    └── controllers/
        └── jobs.controller.ts
```

Write:

```
import { Request, Response } from "express";
import { emailQueue } from "../queues/email.queue";

export async function getJob(
    req: Request,
    res: Response
) {
    const { id } = req.params;

    const job = await emailQueue.getJob(id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    return res.json({
        success: true,
        data: {
            id: job.id,
            name: job.name,
            data: job.data,
            attemptsMade: job.attemptsMade,
            delay: job.opts.delay ?? 0,
            priority: job.opts.priority ?? null,
            timestamp: job.timestamp,
        },
    });
}
```

---

### Step 2 — Create Job Routes

Create:
```
src/routes/jobs.routes.ts
```

Write:
```
import { Router } from "express";
import { getJob } from "../controllers/jobs.controller";

const router = Router();

router.get("/:id", getJob);

export default router;
```

---

### Step 3 — Register Routes

Open:
```
src/app.ts
```

Import:
```
import jobsRoutes from "./routes/jobs.routes";
```

Register it:
```
app.use("/api/v1/jobs", jobsRoutes);
```

Your routing should look similar to:

```
app.use("/api/v1", emailRoutes);

app.use("/api/v1/jobs", jobsRoutes);
```

---

### Step 4 — Restart

API
```
npm run dev
```

Worker
```
npm run dev:worker
```

---

### Step 5 — Create a Job
```
POST /api/v1/send-email
```

Body
```
{
    "email": "john@gmail.com"
}
```

Suppose response is
```
{
    "success": true,
    "jobId": "12"
}
```

---

### Step 6 — Query That Job

Request
```
GET /api/v1/jobs/12
```

Example response 
```
{
    "success": true,
    "data": {
        "id": "12",
        "name": "send-email",
        "data": {
            "email": "john@gmail.com"
        },
        "attemptsMade": 0,
        "delay": 0,
        "priority": 5,
        "timestamp": 1755120000000
    }
}
```

Now we can inspect jobs without Redis CLI.

---

### Step 7 — List Jobs by Status

Open
```
src/controllers/jobs.controller.ts
```

Add:
```
export async function listJobs(
    req: Request,
    res: Response
) {
    const status =
        (req.query.status as string) ?? "waiting";

    const jobs = await emailQueue.getJobs([status as any]);

    return res.json({
        success: true,
        count: jobs.length,
        data: jobs.map((job) => ({
            id: job.id,
            name: job.name,
            email: job.data.email,
            attemptsMade: job.attemptsMade,
        })),
    });
}
```

---

### Step 8 — Update Routes

Open

```
src/routes/jobs.routes.ts
```

Replace with:
```
import { Router } from "express";

import {
    getJob,
    listJobs,
} from "../controllers/jobs.controller";

const router = Router();

router.get("/", listJobs);

router.get("/:id", getJob);

export default router;
```

---

### Step 9 — Test Waiting Jobs

Request

```
GET /api/v1/jobs?status=waiting
```

Example
```
{
    "success": true,
    "count": 2,
    "data": [
        {
            "id": "13",
            "email": "one@gmail.com"
        },
        {
            "id": "14",
            "email": "two@gmail.com"
        }
    ]
}
```

---

### Step 10 — Other Statuses

BullMQ supports several job states.

Try:

```
GET /api/v1/jobs?status=completed
```

or
```
GET /api/v1/jobs?status=failed
```

or
```
GET /api/v1/jobs?status=delayed
```

or
```
GET /api/v1/jobs?status=active
```

or
```
GET /api/v1/jobs?status=waiting
```

---

### Step 11 — Retry Failed Job

BullMQ allows retrying a failed job.

Add this to:

```
src/controllers/jobs.controller.ts
```

```
export async function retryJob(
    req: Request,
    res: Response
) {
    const job = await emailQueue.getJob(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    await job.retry();

    return res.json({
        success: true,
        message: "Retry requested",
    });
}
```

---

### Step 12 — Register Route

Open
```
src/routes/jobs.routes.ts
```

Add
```
import {
    getJob,
    listJobs,
    retryJob,
} from "../controllers/jobs.controller";
```

Then register
```
router.post("/:id/retry", retryJob);
```

Your routes should now be:

```
router.get("/", listJobs);

router.get("/:id", getJob);

router.post("/:id/retry", retryJob);
```

---

### Step 13 — Delete Job

Sometimes we want to remove an old completed or failed job.

Add:
```
export async function deleteJob(
    req: Request,
    res: Response
) {
    const job = await emailQueue.getJob(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    await job.remove();

    return res.json({
        success: true,
        message: "Job removed",
    });
}
```

---

### Register Route
```
router.delete("/:id", deleteJob);
```

---

### Final Route File
```
src/routes/jobs.routes.ts
```

```
import { Router } from "express";

import {
    getJob,
    listJobs,
    retryJob,
    deleteJob,
} from "../controllers/jobs.controller";

const router = Router();

router.get("/", listJobs);

router.get("/:id", getJob);

router.post("/:id/retry", retryJob);

router.delete("/:id", deleteJob);

export default router;
```

---

### Testing 

### Test 1

Create a job.
```
POST /api/v1/send-email
```
Save the `jobId.`

---

### Test 2

Inspect it.
```
GET /api/v1/jobs/{jobId}
```

Expected:

 - Correct job information.
 - Payload is visible.

---

### Test 3

Create a failing job.

```
{
    "email": "fail@gmail.com"
}
```
Wait until retries finish.

Then
```
GET /api/v1/jobs?status=failed
```

Verify it appears.

---

### Test 4

Retry it.

```
POST /api/v1/jobs/{jobId}/retry
```
Watch the worker logs.

---

### Test 5

Delete a completed job.

```
DELETE /api/v1/jobs/{jobId}
```

Then
```
GET /api/v1/jobs/{jobId}
```
Expected"
```
{
    "success": false,
    "message": "Job not found"
}
```

---

### Production Notes

The implementation above is intentionally simple for learning. In a production system, you should improve it by:

- Validating status against an allowed list instead of using as any.
- Protecting these endpoints with authentication and authorization (they should usually be admin-only).
- Paginating results instead of returning every job.
- Returning timestamps in ISO format for easier reading.
- Logging all retry and delete operations for auditing.

### Project Structure
```
src/
│
├── controllers/
│   ├── email.controller.ts
│   └── jobs.controller.ts
│
├── queues/
│   ├── email.queue.ts
│   └── dead-letter.queue.ts
│
├── routes/
│   ├── email.routes.ts
│   └── jobs.routes.ts
│
├── workers/
│   ├── email.worker.ts
│   └── dlq.worker.ts
│
├── app.ts
├── server.ts
└── worker.ts
```

---

### What You Learned

You can now:

✅ Inspect a job by ID.
✅ List jobs by status.
✅ Retry failed jobs.
✅ Delete jobs.
✅ Build admin APIs on top of BullMQ instead of relying on redis-cli.

These are the kinds of APIs that power internal operations dashboards.

---

### Module 1 — Lecture 6.10
#### Job Progress Tracking (Production Grade)

Until now, our jobs have only two visible states:

```
Waiting
    ↓
Running
    ↓
Completed
```

But in real production systems, a job may run for several minutes.

Think about:

- Uploading a 5 GB video
- Processing 10,000 images
- Exporting 1 million database rows
- Sending 100,000 emails

If the frontend only knows:

```
Running...
```

that's a terrible user experience.

Instead, production systems expose `progress.`

```
0%
 │
 ▼
20%
 │
 ▼
45%
 │
 ▼
80%
 │
 ▼
100%
```

BullMQ provides this feature out of the box.

---

### Today's Goal

We'll build:

```
Worker
    │
    ▼
job.updateProgress(...)
    │
    ▼
Redis
    │
    ▼
REST API
    │
    ▼
Frontend
```

---

### What We'll Build

Our email worker will simulate multiple steps.

```
Receive Job
      │
      ▼
10% Validate Request
      │
      ▼
30% Load Email Template
      │
      ▼
60% Generate HTML
      │
      ▼
80% Send Email
      │
      ▼
100% Done
```

---

### Step 1 — Open Worker

Open
```
src/workers/email.worker.ts
```
Find your processor.

It currently looks similar to:
```
async (job) => {

    logger.info({
        jobId: job.id,
    }, "Processing");

    await new Promise(resolve => setTimeout(resolve, 2000));

}
```

We're replacing only the processing logic.

---

### Step 2 — Update Progress

Replace the processing part with:

```
logger.info(
    {
        jobId: job.id,
    },
    "Processing email job"
);

// STEP 1
await job.updateProgress(10);

await new Promise((resolve) => {
    setTimeout(resolve, 1000);
});

// STEP 2
await job.updateProgress(30);

await new Promise((resolve) => {
    setTimeout(resolve, 1000);
});

// STEP 3
await job.updateProgress(60);

await new Promise((resolve) => {
    setTimeout(resolve, 1000);
});

// STEP 4
await job.updateProgress(80);

await new Promise((resolve) => {
    setTimeout(resolve, 1000);
});

// Finished
await job.updateProgress(100);

logger.info(
    {
        jobId: job.id,
    },
    "Email processed successfully"
);
```

---

### What Does updateProgress() Do?

This line
```
await job.updateProgress(60);
```

writes progress into Redis.

BullMQ stores it automatically.

You don't have to create another Redis key.

---

### Step 3 — Expose Progress

Open

```
src/controllers/jobs.controller.ts
```

Find
```
getJob()
```

Currently you return something similar to:
```
data: {
    id: job.id,
    name: job.name,
    data: job.data,
}
```
Add
```
progress: job.progress,
```

The complete return becomes
```
return res.json({
    success: true,

    data: {
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        progress: job.progress,
        delay: job.opts.delay ?? 0,
        priority: job.opts.priority ?? null,
        timestamp: job.timestamp,
    },
});
```

---

### Step 4 — Restart

Terminal 1

```
npm run dev
```

Terminal 2
```
npm run dev:worker
```

---

### Step 5 — Create a Job

Request

```
POST /api/v1/send-email
```
Body
```
{
    "email": "progress@gmail.com"
}
```
Suppose response
```
{
    "jobId": "45"
}
```

---

### Step 6 — Poll Progress

Immediately request

```
GET /api/v1/jobs/45
```

Depending on timing you may see

```
{
    "progress": 10
}
```

One second later
```
{
    "progress": 30
}
```

Again
```
{
    "progress": 60
}
```

Later 
```
{
    "progress": 80
}

```

Finally
```
{
    "progress": 100
}
```

---

### Visual Timeline
```
Client

↓

POST /send-email

↓

Job Created

↓

GET /jobs/45

↓

10%

↓

GET /jobs/45

↓

30%

↓

GET /jobs/45

↓

60%

↓

GET /jobs/45

↓

80%

↓

GET /jobs/45

↓

100%
```

---

### Step 7 — Improve Progress

Numbers alone aren't very helpful.

Instead of only

```
60
```
BullMQ lets us store an object.
Replace 
```
await job.updateProgress(60);
```

With

```
await job.updateProgress({
    percentage: 60,
    step: "Generating HTML",
});
```

Now every update becomes

```
await job.updateProgress({
    percentage: 10,
    step: "Validating request",
});

await job.updateProgress({
    percentage: 30,
    step: "Loading template",
});

await job.updateProgress({
    percentage: 60,
    step: "Generating HTML",
});

await job.updateProgress({
    percentage: 80,
    step: "Sending email",
});

await job.updateProgress({
    percentage: 100,
    step: "Completed",
});
```

---

### Step 8 — No Controller Changes Needed

Because

```
job.progress
```

returns whatever we stored.

Now the API returns

```
{
    "progress": {
        "percentage": 60,
        "step": "Generating HTML"
    }
}
```

Much better 

---

### Step 9 — Production Example

Imagine

```
Video Upload
```

Progress might look like
```
{
    "percentage": 10,
    "step": "Uploading"
}
```

then

```
{
    "percentage": 35,
    "step": "Extracting Audio"
}
```

then

```
{
    "percentage": 55,
    "step": "Generating Thumbnail"
}
```

then

```
{
    "percentage": 80,
    "step": "Encoding Video"
}
```

then

```
{
    "percentage": 100,
    "step": "Finished"
}
```

Exactly the same mechanism.

---

### Step 10 — Frontend Polling

A frontend could do

```
Every 2 seconds

↓

GET /jobs/:id

↓

Read progress

↓

Update progress bar
```

Like

```
██████░░░░░

60%
```

---

### Step 11 — Important

Progress is not persisted forever.

Remember

```
removeOnComplete: 100
```

Eventually BullMQ removes old jobs.

Once removed,

```
GET /jobs/:id
```

returns

```
404
```

That's expected.

If your business requires permanent audit history, save it in PostgreSQL, not only in BullMQ.

---

### Step 12 — Better Architecture

For long-running jobs:

```
Worker

↓

Progress

↓

Redis

↓

REST API

↓

Frontend
```

For real-time updates:

```
Worker

↓

Redis

↓

WebSocket

↓

Frontend
```

Polling is simple.

WebSockets are more efficient.

We'll cover WebSockets in a later module.

---

### Step 13 — Add a Dedicated Progress Endpoint

Instead of returning the whole job every time, let's expose only progress.

Open
```
src/controllers/jobs.controller.ts
```

Add:
```
export async function getJobProgress(
    req: Request,
    res: Response
) {
    const job = await emailQueue.getJob(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    return res.json({
        success: true,
        progress: job.progress,
    });
}
```

---

### Step 14 — Register Route

Open

```
src/routes/jobs.routes.ts
```

Import 
```
getJobProgress
```

Then add 
```
router.get("/:id/progress", getJobProgress);
```

Your routes become

```
router.get("/", listJobs);

router.get("/:id", getJob);

router.get("/:id/progress", getJobProgress);

router.post("/:id/retry", retryJob);

router.delete("/:id", deleteJob);
```

---

### Testing
Test 1

Create a job.
```
POST /api/v1/send-email
```

---

Test 2

Immediately call
```
GET /api/v1/jobs/{id}/progress
```
Expected 
```
{
    "progress": {
        "percentage": 10,
        "step": "Validating request"
    }
}
```

---

Test 3

Wait one second

```
GET /api/v1/jobs/{id}/progress
```
Expected
```
{
    "progress": {
        "percentage": 30,
        "step": "Loading template"
    }
}
```

---

Test 4

Continue polling until

```
{
    "progress": {
        "percentage": 100,
        "step": "Completed"
    }
}
```

---

### Production Notes

For production systems:

✅ Store progress as an object, not just a number.

✅ Keep progress updates meaningful (avoid updating every millisecond).

✅ Use WebSockets or Server-Sent Events (SSE) for live updates instead of aggressive polling.

✅ Persist important business status in your database if users need to view historical progress after BullMQ removes completed jobs.

---

### What You Learned

You now know how to:

✅ Update job progress from a worker.
✅ Store progress in Redis via BullMQ.
✅ Expose progress through REST APIs.
✅ Design progress data for frontend consumption.
✅ Understand the difference between temporary queue state and permanent business state.

At this point, your queue system supports:

- Producers
- Workers
- Retries
- Backoff
- Delayed jobs
- Priorities
- Dead Letter Queue
- Job Monitoring APIs
- Progress Tracking

This is already approaching the feature set of many real-world background processing systems.

---










