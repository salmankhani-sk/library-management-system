# /app/routes/book.py

# Import APIRouter from FastAPI to create a router for organizing and grouping related endpoints.
# APIRouter allows modularizing routes into separate files or modules for better organization.
from fastapi import APIRouter, Query

# Import the requests library to make HTTP requests to external APIs.
# Here, it's used to interact with the Google Books API to fetch book data.
import requests

# Instantiate an APIRouter object, which will hold the routes related to book operations.
# This router can be included in the main FastAPI application to add these routes.
router = APIRouter()

# Define a GET endpoint at "/books/search/" using the router.
# This endpoint is used to search for books based on a query string provided by the client.
# The 'query' parameter is annotated as a string, indicating it expects a string input from the client.
@router.get("/books/search/")
def search_books(query: str):
    # Set the base URL for the Google Books API, specifically the volumes endpoint.
    # This API allows searching for books by various criteria, such as title, author, or ISBN.
    google_api = "https://www.googleapis.com/books/v1/volumes"
    
    # Make an HTTP GET request to the Google Books API with the search query as a parameter.
    # The 'params' argument passes the query as 'q' in the URL, e.g., "?q=<query>" in the request.
    response = requests.get(google_api, params={"q": query})
    
    # Parse the JSON response from the API into a Python dictionary for easy access.
    # The response contains data about the books matching the search query.
    data = response.json()

    # Initialize an empty list to store the processed book data.
    # This list will hold dictionaries with selected book information to be returned to the client.
    books = []
    
    # Iterate over the 'items' list in the API response, which contains individual book entries.
    # Use .get("items", []) to safely handle cases where 'items' is missing (e.g., no results), defaulting to an empty list.
    for item in data.get("items", []):
        # Extract the 'volumeInfo' dictionary from the book item, which contains detailed book information.
        # Use .get("volumeInfo", {}) to default to an empty dict if 'volumeInfo' is missing.
        info = item.get("volumeInfo", {})
        
        # Extract the 'imageLinks' dictionary from 'volumeInfo', which contains URLs for book cover images.
        # Use .get("imageLinks", {}) to default to an empty dict if 'imageLinks' is missing.
        image_links = info.get("imageLinks", {})
        
        # Extract the 'industryIdentifiers' list from 'volumeInfo', which contains identifiers like ISBN.
        # Use .get("industryIdentifiers", []) to default to an empty list if 'industryIdentifiers' is missing.
        industry_ids = info.get("industryIdentifiers", [])

        # Use a generator expression to find the ISBN identifier from the 'industryIdentifiers' list.
        # It looks for the first identifier where 'type' contains 'ISBN' (e.g., 'ISBN_10' or 'ISBN_13').
        # If no ISBN is found, default to "Unknown" using the next() function's default parameter.
        isbn = next((id['identifier'] for id in industry_ids if 'ISBN' in id['type']), "Unknown")

        # Append a dictionary of selected book information to the 'books' list.
        # This dictionary formats the data in a way that's easy for the client to consume.
        books.append({
            "id": item.get("id"),  # The unique Google Books ID for the book, directly from the 'item' dictionary.
            "title": info.get("title", "Unknown"),  # The book's title, defaulting to "Unknown" if not present in 'volumeInfo'.
            "author": ", ".join(info.get("authors", ["Unknown"])),  # Join multiple authors into a string with commas, default to "Unknown" if no authors.
            "isbn": isbn,  # The ISBN found from the generator expression or "Unknown" if not available.
            "status": "available",  # Hardcoded status as "available" (could be dynamic in a full system).
            "thumbnail": image_links.get("thumbnail"),  # URL for the book's thumbnail image, if available; None if not present.
        })

    # Return the list of books as the response to the client's request.
    # FastAPI will automatically serialize this list of dictionaries into JSON format for the HTTP response.
    return books