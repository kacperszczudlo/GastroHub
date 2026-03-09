# Wybór tematu: GastroHub

## 1. Opis wybranego tematu projektu
GastroHub to kompleksowa aplikacja webowa do zarządzania restauracją. Łączy ona w sobie automatyczny system rezerwacji stolików dla klientów oraz panel obsługi i system POS (Point of Sale) dla personelu lokalu. Zrezygnowaliśmy z wyboru konkretnych stolików przez klientów na rzecz automatycznego przydziału, co zoptymalizuje obłożenie sali.

## 2. Cel projektu
Celem projektu jest optymalizacja działania restauracji poprzez automatyzację procesu rezerwacji oraz dostarczenie personelowi narzędzi do zarządzania salą i zamówieniami w czasie rzeczywistym.

## 3. Zakres funkcjonalny

### 👤 Klient
* **Menu:** Dostęp do aktualnego menu po zalogowaniu.
* **Rezerwacje:** Składanie rezerwacji poprzez podanie daty, godziny oraz liczby osób. Automatyczny przydział stolika.

### 🤵 Kelner (User)
* **Podgląd sali:** Dostęp do interaktywnego, kafelkowego podglądu sali.
* **Zarządzanie stolikami:** Oznaczanie na żywo stolików jako zajęte i przypisywanie się do ich obsługi.
* **System POS:** Składanie zamówień (dodawanie potraw z menu) i podsumowanie kwoty rachunku.
* **Grafik pracy:** Dostęp do kalendarza w celu zaznaczania swojej obecności.

### 👑 Administrator (Właściciel)
* **Zarządzanie układem sali:** Ustalanie liczby stolików i ich pojemności.
* **Zarządzanie menu:** Dodawanie potraw, zmiana cen.
* **Zarządzanie rezerwacjami:** Ręczne odwoływanie rezerwacji klientów.

## 4. Proponowane technologie
* **Frontend:** React.js (Vite)
* **Backend:** Node.js, Express.js (własne REST API)
* **Baza danych:** MongoDB (Mongoose)
* **Autoryzacja:** JSON Web Tokens (JWT)