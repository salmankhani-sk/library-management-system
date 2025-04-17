# /app/routes/book.py
from fastapi import APIRouter, Query
import requests

router = APIRouter()

@router.get("/books/search/")
def search_books(query: str):
    google_api = "https://www.googleapis.com/books/v1/volumes"
    response = requests.get(google_api, params={"q": query})
    data = response.json()

    books = []
    for item in data.get("items", []):
        info = item.get("volumeInfo", {})
        image_links = info.get("imageLinks", {})
        industry_ids = info.get("industryIdentifiers", [])

        isbn = next((id['identifier'] for id in industry_ids if 'ISBN' in id['type']), "Unknown")

        books.append({
            "id": item.get("id"),
            "title": info.get("title", "Unknown"),
            "author": ", ".join(info.get("authors", ["Unknown"])),
            "isbn": isbn,
            "status": "available",
            "thumbnail": image_links.get("thumbnail"),
        })

    return books
