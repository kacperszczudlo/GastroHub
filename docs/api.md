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
* **Oczekiwana odpowiedź:** `201 Created` oraz obiekt z komunikatem o utworzeniu pozycji menu.

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

### Dodanie Pozycji Menu (drugi przykład z kolekcji)
* **URL:** `/api/menu`
* **Metoda:** `POST`
* **Autoryzacja:** `Bearer Token` (wymagana rola `admin`)
* **Body (JSON):**
  ```json
  {
    "name": "Krem z pomidorów",
    "description": "Z grzankami i bazylią",
    "price": 18.50,
    "category": "Zupy"
  }
  ```
* **Oczekiwana odpowiedź:** `201 Created` oraz obiekt z utworzoną pozycją menu.

### Pobranie Wszystkich Pozycji Menu
* **URL:** `/api/menu`
* **Metoda:** `GET`
* **Autoryzacja:** `Bearer Token` (zgodnie z testem w kolekcji)
* **Body:** brak
* **Oczekiwana odpowiedź:** `200 OK` oraz lista pozycji menu.

### Aktualizacja Pozycji Menu
* **URL:** `/api/menu/:id`
* **Metoda:** `PUT`
* **Autoryzacja:** `Bearer Token` (zgodnie z testem w kolekcji)
* **Przykładowe URL z kolekcji:** `/api/menu/69bed9de02539b9403c54070`
* **Body (JSON):**
  ```json
  {
    "price": 90.00
  }
  ```
* **Oczekiwana odpowiedź:** `200 OK` oraz obiekt z zaktualizowaną pozycją menu.

### Usunięcie Pozycji Menu
* **URL:** `/api/menu/:id`
* **Metoda:** `DELETE`
* **Autoryzacja:** `Bearer Token` (zgodnie z testem w kolekcji)
* **Przykładowe URL z kolekcji:** `/api/menu/69bed9de02539b9403c54070`
* **Body:** brak
* **Oczekiwana odpowiedź:** `200 OK` oraz potwierdzenie usunięcia pozycji menu.

## 3. Stoliki (Tables)

### Dodanie Stolika
* **URL:** `/api/tables`
* **Metoda:** `POST`
* **Autoryzacja:** `Bearer Token` (wymagana rola `admin`)
* **Body (JSON):**
  ```json
  {
    "tableNumber": 4,
    "capacity": 8
  }
  ```
* **Oczekiwana odpowiedź:** `201 Created` oraz obiekt z utworzonym stolikiem.

## 4. Rezerwacje (Reservations)

### Dodanie Rezerwacji
* **URL:** `/api/reservations`
* **Metoda:** `POST`
* **Autoryzacja:** `Bearer Token` (wymagane zalogowanie)
* **Body (JSON):**
  ```json
  {
    "reservationDate": "2026-03-25",
    "startTime": "18:00",
    "endTime": "20:00",
    "numberOfGuests": 4
  }
  ```
* **Oczekiwana odpowiedź:** `201 Created` oraz obiekt z utworzoną rezerwacją.

### Dodanie Rezerwacji (Fail - Stolik Zajęty)
* **URL:** `/api/reservations`
* **Metoda:** `POST`
* **Autoryzacja:** `Bearer Token` (wymagane zalogowanie)
* **Body (JSON):**
  ```json
  {
    "reservationDate": "2026-03-25",
    "startTime": "18:00",
    "endTime": "20:00",
    "numberOfGuests": 4
  }
  ```
* **Oczekiwana odpowiedź:** `404 Not Found` oraz komunikat o niedostępności stolika na podany termin.

### Anulowanie Rezerwacji
* **URL:** `/api/reservations/:id`
* **Metoda:** `DELETE`
* **Autoryzacja:** `Bearer Token` (wymagane zalogowanie)
* **Przykładowe URL z kolekcji:** `/api/reservations/69bee6365fa39e47bf9338d1`
* **Body:** brak
* **Oczekiwana odpowiedź:** `200 OK` oraz potwierdzenie anulowania rezerwacji.

## 5. Zamowienia (Order)

### Dodanie Zamowienia
* **URL:** `/api/orders`
* **Metoda:** `POST`
* **Autoryzacja:** `Bearer Token` (wymagane zalogowanie)
* **Body (JSON):**
  ```json
  {
    "items": [
      {
        "menuItemId": "69bedd186ef7c39ad2981284",
        "quantity": 2
      }
    ],
    "totalPrice": 100.00
  }
  ```
* **Oczekiwana odpowiedz:** `201 Created` oraz obiekt z utworzonym zamowieniem.

### Aktualizacja Statusu Zamowienia
* **URL:** `/api/orders/:id/status`
* **Metoda:** `PUT`
* **Autoryzacja:** `Bearer Token` (wymagane zalogowanie)
* **Przykladowe URL z kolekcji:** `/api/orders/69bef31cf5dd18d0da1594e5/status`
* **Body (JSON):**
  ```json
  {
    "status": "preparing"
  }
  ```
* **Oczekiwana odpowiedz:** `200 OK` oraz obiekt ze zaktualizowanym statusem zamowienia.