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