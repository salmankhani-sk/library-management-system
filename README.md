
Library Management System
Welcome to the Library Management System! This project allows users to search for books, borrow them, and manage their library activities. It’s built with a FastAPI backend and a Next.js frontend, using PostgreSQL as the database.
This guide will walk you through setting up and running the project on your local machine. Follow each step carefully to ensure everything works smoothly.

Table of Contents

Prerequisites
Clone the Repository
Set Up PostgreSQL
Set Up the Backend
Set Up the Frontend
Run the Project
Generate a Secret Key
Troubleshooting
Contributing
License


Prerequisites
Before you start, ensure you have the following installed:

Git: To clone the repository.
Python 3.8–3.11: For the backend (FastAPI).
Node.js 16 or higher: For the frontend (Next.js).
PostgreSQL: For the database.
pip: Python package manager (comes with Python).
npm: Node.js package manager (comes with Node.js).

You can check if these are installed by running:
git --version
python --version  # or python3 --version
node --version
psql --version
pip --version
npm --version

If any are missing, install them using the instructions below or from their official websites.

Clone the Repository
To get the project files on your local machine, clone the repository from GitHub:

Open a terminal (Command Prompt, PowerShell, or Bash).

Run the following command:
git clone https://github.com/salmankhani-sk/library-management-system


Navigate into the project directory:
cd library-management-system




Set Up PostgreSQL
The project uses PostgreSQL as its database. Follow these steps to install and configure it:
1. Install PostgreSQL

Windows:

Download the installer from postgresql.org.
Run the installer and follow the prompts.
During installation, set a password for the postgres user (e.g., khanss).


Linux (Ubuntu):

Open a terminal and run:
sudo apt update
sudo apt install postgresql postgresql-contrib




Mac:

Install Homebrew if you don’t have it (/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)").

Then run:
brew install postgresql





2. Start PostgreSQL

Windows: PostgreSQL starts automatically after installation. If not, start it via the "pgAdmin" tool or services.

Linux/Mac: Start the PostgreSQL service:
sudo service postgresql start  # Linux
brew services start postgresql  # Mac



3. Create a Database

Open the PostgreSQL shell:
psql -U postgres


Enter your password (e.g., khanss) when prompted.

Create a database named library_db:
CREATE DATABASE library_db;


Exit the shell:
\q




Set Up the Backend
The backend uses FastAPI and requires a virtual environment to manage dependencies.
1. Create and Activate a Virtual Environment

Windows:
python -m venv env
.\env\Scripts\activate


Linux/Mac:
python3 -m venv env
source env/bin/activate


You’ll see (env) in your terminal prompt when activated.



2. Install Dependencies

Install the Python packages listed in requirements.txt:
pip install -r requirements.txt


If requirements.txt is missing, ask the repository owner for it or install common FastAPI dependencies:
pip install fastapi uvicorn psycopg2-binary python-dotenv





3. Configure Environment Variables

Create a .env file in the project root:
echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/library_db > .env
echo GOOGLE_BOOKS_API_KEY=your_google_books_api_key >> .env
echo SECRET_KEY=your_secret_key >> .env


Replace:
your_password with your PostgreSQL password (e.g., khanss).
your_google_books_api_key with a key from Google Books API.
your_secret_key with a secure key (see Generate a Secret Key).






Set Up the Frontend
The frontend uses Next.js and requires Node.js.
1. Navigate to the Frontend Directory

From the project root:
cd frontend



2. Install Dependencies

Install the required Node.js packages:
npm install




Run the Project
You’ll need to run both the backend and frontend servers.
1. Run the Backend

From the project root (in the terminal with the virtual environment activated):
uvicorn app.main:app --reload


The backend will run at http://localhost:8000.



2. Run the Frontend

Open a new terminal, navigate to the frontend directory:
cd frontend
npm run dev


The frontend will run at http://localhost:3000.



3. Access the App

Open your browser and visit http://localhost:3000.


Generate a Secret Key
A SECRET_KEY is required for secure operations (e.g., token signing). Here’s how to generate one:
Option 1: Using Python

Open a Python shell:
python


Run this code to generate a 32-byte key:
import secrets
print(secrets.token_hex(32))


Copy the output (e.g., a1b2c3...) and add it to your .env file:
SECRET_KEY=a1b2c3...



Option 2: Using OpenSSL

If OpenSSL is installed, run:
openssl rand -hex 32


Copy the output and add it to your .env file:
SECRET_KEY=your_generated_key




Troubleshooting

Database Connection Issues:
Verify PostgreSQL is running: psql -U postgres.
Check .env file for correct DATABASE_URL.


Backend Won’t Start:
Ensure all dependencies are installed (pip install -r requirements.txt).
Use Python 3.8–3.11 (python --version).


Frontend Not Loading:
Run npm install in the frontend directory.
Check the terminal and browser console (F12) for errors.




Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a branch (git checkout -b feature-branch).
Commit your changes (git commit -m "Add feature").
Push to your fork (git push origin feature-branch).
Open a pull request.


License
This project is licensed under the MIT License.

Final Notes

Replace placeholders (your_password, your_google_books_api_key, your_secret_key) with real values.
Ensure all steps are followed in order.
If issues persist, open an issue on GitHub or contact the repository owner.

Alhamdulillah, everything should work perfectly now!
