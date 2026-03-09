# Projekt: GastroHub
**Przedmiot:** Technologie Aplikacji Webowych II  
**Autorzy:** Kacper Szczudło, Piotr Cebula

## 1. Opis Projektu
**GastroHub** to kompleksowa aplikacja webowa do zarządzania restauracją. Łączy ona w sobie automatyczny system rezerwacji stolików dla klientów oraz panel obsługi i system POS (Point of Sale) dla personelu lokalu. Zrezygnowaliśmy z wyboru konkretnych stolików przez klientów na rzecz automatycznego przydziału, co zoptymalizuje obłożenie sali.

## 2. Podział na role i zakres funkcjonalny

### 👤 Klient
* **Menu:** Dostęp do aktualnego menu po zalogowaniu.
* **Rezerwacje:** Składanie rezerwacji poprzez podanie jedynie daty, godziny oraz liczby osób. System automatycznie przydziela odpowiedni stolik na podstawie dostępności.

### 🤵 Kelner (User)
* **Podgląd sali:** Dostęp do interaktywnego, kafelkowego podglądu sali.
* **Zarządzanie stolikami:** Oznaczanie na żywo stolików jako zajęte (goście z "ulicy") i przypisywanie się do ich obsługi.
* **System POS:** Składanie zamówień (dodawanie potraw z menu) i podsumowanie kwoty rachunku.
* **Grafik pracy:** Dostęp do kalendarza w celu zaznaczania swojej obecności w pracy.

### 👑 Administrator (Właściciel)
* **Zarządzanie układem sali:** Ustalanie liczby stolików i ich pojemności.
* **Zarządzanie menu:** Dodawanie potraw, zmiana cen.
* **Zarządzanie rezerwacjami:** Ręczne odwoływanie rezerwacji klientów.

## 3. Stos technologiczny (MERN)
* **Frontend:** React.js (Vite)
* **Backend:** Node.js, Express.js (REST API)
* **Baza danych:** MongoDB (Mongoose)
* **Bezpieczeństwo:** JSON Web Tokens (JWT) dla ról i autoryzacji

---

## 4. Architektura i Diagramy (Project Setup)

### Model Przypadków Użycia
```mermaid
useCaseDiagram
    actor "Klient" as C
    actor "Kelner" as K
    actor "Administrator" as A

    C --> (Logowanie i Rejestracja)
    C --> (Przeglądanie menu)
    C --> (Automatyczna rezerwacja stolika)
    
    K --> (Logowanie i Rejestracja)
    K --> (Podgląd interaktywnej sali)
    K --> (Obsługa zamówień POS)
    K --> (Grafik pracy)
    
    A --> (Logowanie i Rejestracja)
    A --> (Zarządzanie menu CRUD)
    A --> (Konfiguracja układu stolików)
    A --> (Anulowanie rezerwacji)