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

## 3. Proponowany stos technologiczny

* **Frontend:** React.js
* **Backend:** Node.js wraz z frameworkiem Express (własne REST API)
* **Baza danych:** MongoDB
* **Autoryzacja:** JSON Web Tokens (JWT) do zabezpieczenia endpointów i podziału na role