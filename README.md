# FreeRetros

FreeRetros is a free tool to create and manage retrospective meetings. It is an alternative to Parabol and is built with Next.js, Supabase, and Tailwind CSS.

## How to Install the Project Locally

The project uses Supabase as the backend and database. To install it locally, follow these steps:

1. **Choose a Folder for Supabase**

   Select a folder where you will host Supabase.

2. **Get the Code**

   Clone the Supabase repository:

   ```bash
   git clone --depth 1 https://github.com/supabase/supabase
   ```

3. **Copy Configuration Files**

   After installation (this may take a few minutes), copy the following files into the `/supabase/docker` folder:

   - `.env-copy-supabase`
   - `docker-compose.yml`
   - `docker-compose.s3.yml`

4. **Navigate to the Docker Folder**

   Open your terminal and go to the docker folder:

   ```bash
   cd supabase/docker
   ```

5. **Copy the Fake Environment Variables**

   Run the following command:

   ```bash
   cp .env-copy-supabase .env
   ```

6. **Pull the Latest Docker Images**

   Execute:

   ```bash
   docker compose pull
   ```

7. **Start the Services**

   Before starting, ensure that no other instances are running on the required ports. Then, start the services in detached mode:

   ```bash
   docker compose up -d
   ```

   With these steps, your local environment with Supabase is ready.

8. **Access the Supabase Dashboard**

   - Visit: [http://localhost:8000](http://localhost:8000)
   - Login using the following credentials:
     - **User:** supabase
     - **Password:** password

   From the dashboard, you can manage your database and other Supabase functionalities. For more details, visit the [Supabase Documentation](https://supabase.com/docs).

## Cloning FreeRetros and Setting Up the Next.js Project

1. **Clone this Repository**

   Clone the FreeRetros repository to your local machine.

   **Important:**
   When installing dependencies, you need to add the following due some issues with shadcn and React 19

   ```bash
    npm install --force
   ```

````
2. **Run Prisma Migration**

 To copy the schema to the Supabase database, run:

 ```bash
 npm run migrate:development --name init
```

Wait until the schema is created in the database.

3. **Start the Project**

   Finally, start the project with:

   ```bash
   npm run dev
   ```
````
