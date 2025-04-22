# Library Management System

Welcome to the **Library Management System**, a web application for searching, borrowing, and managing books in a library. The project features a **FastAPI** backend, a **Next.js** frontend, and a **PostgreSQL** database, providing a seamless experience for book lovers and library administrators.

This README provides detailed, step-by-step instructions to set up and run the project locally. Follow each section carefully to ensure a smooth setup.

---

## Table of Contents

- Overview
- Prerequisites
- Clone the Repository
- Set Up PostgreSQL
  - Install PostgreSQL
  - Start PostgreSQL
  - Create a Database
- Set Up the Backend
  - Create a Virtual Environment
  - Install Backend Dependencies
  - Configure Environment Variables
- Set Up the Frontend
  - Navigate to the Frontend Directory
  - Install Frontend Dependencies
- Run the Project
  - Run the Backend
  - Run the Frontend
  - Access the Application
- Generate a Secret Key
  - Using Python
  - Using OpenSSL
- Troubleshooting
- Contributing
- License

---

## Overview

The Library Management System allows users to:

- Search for books using the Google Books API.
- Borrow and return books.
- Manage library inventory with a user-friendly interface.

**Tech Stack**:

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js (React)
- **Database**: PostgreSQL
- **Dependencies**: Managed via `requirements.txt` (backend) and `package.json` (frontend)

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Git**: For cloning the repository.
- **Python 3.8–3.11**: For the FastAPI backend.
- **Node.js 16 or higher**: For the Next.js frontend.
- **PostgreSQL 12 or higher**: For the database.
- **pip**: Python package manager (included with Python).
- **npm**: Node.js package manager (included with Node.js).

Verify installations by running:

```bash
git --version
python --version  # or python3 --version
node --version
psql --version
pip --version
npm --version
```

### Installation Links

- Git
- Python (choose 3.8–3.11)
- Node.js
- PostgreSQL

---

## Clone the Repository

To get the project files, clone the repository from GitHub:

1. Open a terminal (Command Prompt, PowerShell, or Bash).

2. Run the clone command:

   ```bash
   git clone https://github.com/salmankhani-sk/library-management-system
   ```

3. Navigate to the project directory:

   ```bash
   cd library-management-system
   ```

---

## Set Up PostgreSQL

The project uses PostgreSQL to store book and user data. Follow these steps to install and configure it.

### Install PostgreSQL

- **Windows**:

  - Download the installer from postgresql.org.
  - Run the installer and follow the prompts.
  - Set a password for the `postgres` user  during installation.



### Start PostgreSQL

- **Windows**:

  - PostgreSQL typically starts automatically after installation.
  - If not, use pgAdmin or start it via Services:
    - Press `Win + R`, type `services.msc`, find `postgresql-x64-XX`, and start it.



### Create a Database

1. Open the PostgreSQL command-line tool:

   ```bash
   psql -U postgres
   ```

2. Enter your `postgres` user password (e.g., `khanss`) when prompted.

3. Create a database named `library_db`:

   ```sql
   CREATE DATABASE library_db;
   ```

4. Verify the database was created:

   ```sql
   \l
   ```

5. Exit the `psql` shell:

   ```sql
   \q
   ```

---

## Set Up the Backend

The backend is built with FastAPI and requires a virtual environment to manage Python dependencies.

### Create a Virtual Environment

1. From the project root directory (`library-management-system`):

   - **Windows**:

     ```powershell
     python -m venv env
     .\env\Scripts\activate
     ```

   

2. You’ll see `(env)` in your terminal, indicating the virtual environment is active.

### Install Backend Dependencies

Install the Python packages listed in `requirements.txt`:

```bash
pip install -r requirements.txt
```

- **Note**: If you encounter issues with `reportlab` or other packages, ensure you’re using Python 3.8–3.11. You can also try upgrading `pip`:

  ```bash
  python -m pip install --upgrade pip
  ```

### Configure Environment Variables

The backend requires a `.env` file to store configuration settings, such as the database URL, Google Books API key, and secret key.

1. Create a `.env` file in the project root:

   ```bash
   echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/library_db > .env
   echo GOOGLE_BOOKS_API_KEY=your_google_books_api_key >> .env
   echo SECRET_KEY=your_secret_key >> .env
   ```

2. Replace the placeholders:

   - `your_password`: Your PostgreSQL password (e.g., `khanss`).
   - `your_google_books_api_key`: Obtain a key from the Google Cloud Console. If you don’t have one, contact the repository owner for a temporary key.
   - `your_secret_key`: A secure key for JWT authentication (see Generate a Secret Key).

3. Verify the `.env` file:

   ```bash
   cat .env  # Linux/Mac
   type .env  # Windows
   ```

   Expected output:

   ```
   DATABASE_URL=postgresql://postgres:khanss@localhost:5432/library_db
   GOOGLE_BOOKS_API_KEY=your_api_key
   SECRET_KEY=your_secret_key
   ```

---

## Set Up the Frontend

The frontend is built with Next.js and requires Node.js to run.

### Navigate to the Frontend Directory

From the project root:

```bash
cd frontend
```

### Install Frontend Dependencies

Install the Node.js packages listed in `package.json`:

```bash
npm install
```

- **Note**: Ensure Node.js is installed (`node --version`). If `npm install` fails, try clearing the cache:

  ```bash
  npm cache clean --force
  npm install
  ```

---

## Run the Project

To run the application, you need to start both the backend and frontend servers.

### Run the Backend

1. From the project root (`library-management-system`), with the virtual environment activated:

   ```bash
   uvicorn app.main:app --reload
   ```

2. The backend will be available at `http://localhost:8000`.

### Run the Frontend

1. Open a new terminal and navigate to the `frontend` directory:

   ```bash
   cd library-management-system/frontend
   ```

2. Start the Next.js development server:

   ```bash
   npm run dev
   ```

3. The frontend will be available at `http://localhost:3000`.

### Access the Application

- Open your browser and visit `http://localhost:3000`.
- Test features like searching for books, adding books, or borrowing them.

---

## Generate a Secret Key

The `SECRET_KEY` in the `.env` file is used for secure operations like JWT token signing. Generate a secure key using one of these methods:

### Using Python

1. Open a Python shell:

   ```bash
   python
   ```

2. Run:

   ```python
   import secrets
   print(secrets.token_hex(32))
   ```

3. Copy the output (e.g., `a1b2c3d4...`) and update your `.env` file:

   ```
   SECRET_KEY=a1b2c3d4...
   ```

4. Exit the Python shell:

   ```python
   exit()
   ```

### Using OpenSSL

1. If OpenSSL is installed, run:

   ```bash
   openssl rand -hex 32
   ```

2. Copy the output and update your `.env` file:

   ```
   SECRET_KEY=your_generated_key
   ```

---

## Troubleshooting

Here are common issues and solutions:

- **Database Connection Errors**:

  - Verify PostgreSQL is running:

    ```bash
    psql -U postgres
    ```

  - Check `.env` file for correct `DATABASE_URL` (no spaces, correct password, and database name).

  - Ensure the database exists:

    ```sql
    \l
    ```

- **Backend Fails to Start**:

  - Confirm all dependencies are installed:

    ```bash
    pip install -r requirements.txt
    ```

  - Use Python 3.8–3.11:

    ```bash
    python --version
    ```

  - Check for errors in the terminal and fix missing packages.

- **Frontend Not Loading**:

  - Ensure you’re in the `frontend` directory:

    ```bash
    cd frontend
    npm run dev
    ```

  - Check the browser console (F12) and terminal for errors.

  - Reinstall dependencies:

    ```bash
    npm install
    ```

- **Data Not Saving to Database**:

  - Verify the `DATABASE_URL` in `.env` points to the correct database.

  - Check database tables:

    ```sql
    psql -U postgres -d library_db
    \dt
    ```

- **Google Books API Issues**:

  - Ensure a valid `GOOGLE_BOOKS_API_KEY` is in `.env`.

  - Test the key with a curl command:

    ```bash
    curl "https://www.googleapis.com/books/v1/volumes?q=python&key=your_api_key"
    ```

---

## Contributing

We welcome contributions to improve the project! To contribute:

1. Fork the repository.

2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes and commit:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push to your fork:

   ```bash
   git push origin feature/your-feature
   ```

5. Open a pull request on GitHub.

---

## License

This project is licensed under the MIT License.

---

### Final Notes

- Replace all placeholders (`your_password`, `your_google_books_api_key`, `your_secret_key`) with actual values.
- Follow the steps in order to avoid issues.
- If you encounter problems, open an issue on the GitHub repository or contact the repository owner.

**Alhamdulillah**, with these instructions, you should have the Library Management System up and running smoothly!
