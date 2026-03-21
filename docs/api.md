# Dokumentacja API GastroHub

W tym pliku znajdują się przykłady podstawowych zapytań do naszego API. Pełna kolekcja Postman znajduje się w pliku `GastroHubApi.postman_collection.json` w tym samym folderze.

## 1. Autoryzacja (Auth)

### Rejestracja Użytkownika
* **URL:** `/api/auth/register`
* **Metoda:** `POST`
* **Body (JSON):**
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin",
    "role": "admin"
  }
  ```
* **Oczekiwana odpowiedź:** Obiekt zawierający komunikat sukcesu oraz dane utworzonego użytkownika.

### Logowanie Użytkownika
* **URL:** `/api/auth/login`
* **Metoda:** `POST`
* **Body (JSON):**
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin"
  }
  ```
* **Oczekiwana odpowiedź:** Obiekt zawierający komunikat sukcesu, wygenerowany token JWT oraz dane użytkownika.

## 2. Menu (chronione endpointy)

### Dodanie Pozycji Menu (Success - z tokenem admina)
* **URL:** `/api/menu`
* **Metoda:** `POST`
* **Autoryzacja:** `Bearer Token` (wymagana rola `admin`)
* **Body (JSON):**
  ```json
  {
    "name": "Burger Drwala",
    "description": "Wołowina, bekon, ser, sos",
    "price": 45.00,
    "category": "Dania Główne"
  }
  ```
* **Oczekiwana odpowiedź:** `201 Created` oraz obiekt z komunikatem: `Dodaj nową pozycję menu`.

### Dodanie Pozycji Menu (Fail - bez tokena)
* **URL:** `/api/menu`
* **Metoda:** `POST`
* **Autoryzacja:** brak
* **Body (JSON):**
  ```json
  {
    "name": "Burger Drwala",
    "description": "Wołowina, bekon, ser, sos",
    "price": 45.00,
    "category": "Dania Główne"
  }
  ```
* **Oczekiwana odpowiedź:** `401 Unauthorized` oraz obiekt błędu: `Brak tokenu autoryzacyjnego`.