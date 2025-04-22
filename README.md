Library Management System
Welcome to the Library Management System, a web application for searching, borrowing, and managing books in a library. The project features a FastAPI backend, a Next.js frontend, and a PostgreSQL database, providing a seamless experience for book lovers and library administrators.
This README provides detailed, step-by-step instructions to set up and run the project locally. Follow each section carefully to ensure a smooth setup.

Table of Contents

Overview
Prerequisites
Clone the Repository
Set Up PostgreSQL
Install PostgreSQL
Start PostgreSQL
Create a Database


Set Up the Backend
Create a Virtual Environment
Install Backend Dependencies
Configure Environment Variables


Set Up the Frontend
Navigate to the Frontend Directory
Install Frontend Dependencies


Run the Project
Run the Backend
Run the Frontend
Access the Application


Generate a Secret Key
Using Python
Using OpenSSL


Troubleshooting
Contributing
License


Overview
The Library Management System allows users to:

Search for books using the Google Books API.
Borrow and return books.
Manage library inventory with a user-friendly interface.

Tech Stack:

Backend: FastAPI (Python)
Frontend: Next.js (React)
Database: PostgreSQL
Dependencies: Managed via requirements.txt (backend) and package.json (frontend)


Prerequisites
Before setting up the project, ensure you have the following installed:

Git: For cloning the repository.
Python 3.8–3.11: For the FastAPI backend.
Node.js 16 or higher: For the Next.js frontend.
PostgreSQL 12 or higher: For the database.
pip: Python package manager (included with Python).
npm: Node.js package manager (included with Node.js).

Verify installations by running:
git --version
python --version  # or python3 --version
node --version
psql --version
pip --version
npm --version

Installation Links

Git
Python (choose 3.8–3.11)
Node.js
PostgreSQL


Clone the Repository
To get the project files, clone the repository from GitHub:

Open a terminal (Command Prompt, PowerShell, or Bash).

Run the clone command:
git clone https://github.com/salmankhani-sk/library-management-system


Navigate to the project directory:
cd library-management-system




Set Up PostgreSQL
The project uses PostgreSQL to store book and user data. Follow these steps to install and configure it.
Install PostgreSQL

Windows:

Download the installer from postgresql.org.
Run the installer and follow the prompts.
Set a password for the postgres user (e.g., khanss) during installation.


Linux (Ubuntu):

Update packages and install PostgreSQL:
sudo apt update
sudo apt install postgresql postgresql-contrib




Mac:

Install Homebrew if not already installed:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"


Install PostgreSQL:
brew install postgresql





Start PostgreSQL

Windows:

PostgreSQL typically starts automatically after installation.
If not, use pgAdmin or start it via Services:
Press Win + R, type services.msc, find postgresql-x64-XX, and start it.




Linux:

Start the service:
sudo service postgresql start




Mac:

Start with Homebrew:
brew services start postgresql





Create a Database

Open the PostgreSQL command-line tool:
psql -U postgres


Enter your postgres user password (e.g., khanss) when prompted.

Create a database named library_db:
CREATE DATABASE library_db;


Verify the database was created:
\l


Exit the psql shell:
\q




Set Up the Backend
The backend is built with FastAPI and requires a virtual environment to manage Python dependencies.
Create a Virtual Environment

From the project root directory (library-management-system):

Windows:
python -m venv env
.\env\Scripts\activate


Linux/Mac:
python3 -m venv env
source env/bin/activate




You’ll see (env) in your terminal, indicating the virtual environment is active.


Install Backend Dependencies
Install the Python packages listed in requirements.txt:
pip install -r requirements.txt


Note: If you encounter issues with reportlab or other packages, ensure you’re using Python 3.8–3.11. You can also try upgrading pip:
python -m pip install --upgrade pip



Configure Environment Variables
The backend requires a .env file to store configuration settings, such as the database URL, Google Books API key, and secret key.

Create a .env file in the project root:
echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/library_db > .env
echo GOOGLE_BOOKS_API_KEY=your_google_books_api_key >> .env
echo SECRET_KEY=your_secret_key >> .env


Replace the placeholders:

your_password: Your PostgreSQL password (e.g., khanss).
your_google_books_api_key: Obtain a key from the Google Cloud Console. If you don’t have one, contact the repository owner for a temporary key.
your_secret_key: A secure key for JWT authentication (see Generate a Secret Key).


Verify the .env file:
cat .env  # Linux/Mac
type .env  # Windows

Expected output:
DATABASE_URL=postgresql://postgres:khanss@localhost:5432/library_db
GOOGLE_BOOKS_API_KEY=your_api_key
SECRET_KEY=your_secret_key




Set Up the Frontend
The frontend is built with Next.js and requires Node.js to run.
Navigate to the Frontend Directory
From the project root:
cd frontend

Install Frontend Dependencies
Install the Node.js packages listed in package.json:
npm install


Note: Ensure Node.js is installed (node --version). If npm install fails, try clearing the cache:
npm cache clean --force
npm install




Run the Project
To run the application, you need to start both the backend and frontend servers.
Run the Backend

From the project root (library-management-system), with the virtual environment activated:
uvicorn app.main:app --reload


The backend will be available at http://localhost:8000.


Run the Frontend

Open a new terminal and navigate to the frontend directory:
cd library-management-system/frontend


Start the Next.js development server:
npm run dev


The frontend will be available at http://localhost:3000.


Access the Application

Open your browser and visit http://localhost:3000.
Test features like searching for books, adding books, or borrowing them.


Generate a Secret Key
The SECRET_KEY in the .env file is used for secure operations like JWT token signing. Generate a secure key using one of these methods:
Using Python

Open a Python shell:
python


Run:
import secrets
print(secrets.token_hex(32))


Copy the output (e.g., a1b2c3d4...) and update your .env file:
SECRET_KEY=a1b2c3d4...


Exit the Python shell:
exit()



Using OpenSSL

If OpenSSL is installed, run:
openssl rand -hex 32


Copy the output and update your .env file:
SECRET_KEY=your_generated_key




Troubleshooting
Here are common issues and solutions:

Database Connection Errors:

Verify PostgreSQL is running:
psql -U postgres


Check .env file for correct DATABASE_URL (no spaces, correct password, and database name).

Ensure the database exists:
\l




Backend Fails to Start:

Confirm all dependencies are installed:
pip install -r requirements.txt


Use Python 3.8–3.11:
python --version


Check for errors in the terminal and fix missing packages.



Frontend Not Loading:

Ensure you’re in the frontend directory:
cd frontend
npm run dev


Check the browser console (F12) and terminal for errors.

Reinstall dependencies:
npm install




Data Not Saving to Database:

Verify the DATABASE_URL in .env points to the correct database.

Check database tables:
psql -U postgres -d library_db
\dt




Google Books API Issues:

Ensure a valid GOOGLE_BOOKS_API_KEY is in .env.

Test the key with a curl command:
curl "https://www.googleapis.com/books/v1/volumes?q=python&key=your_api_key"






Contributing
We welcome contributions to improve the project! To contribute:

Fork the repository.

Create a new branch:
git checkout -b feature/your-feature


Make your changes and commit:
git commit -m "Add your feature"


Push to your fork:
git push origin feature/your-feature


Open a pull request on GitHub.



License
This project is licensed under the MIT License.

Final Notes

Replace all placeholders (your_password, your_google_books_api_key, your_secret_key) with actual values.
Follow the steps in order to avoid issues.
If you encounter problems, open an issue on the GitHub repository or contact the repository owner.

Alhamdulillah, with these instructions, you should have the Library Management System up and running smoothly!
