# Projekt: GastroHub

**Przedmiot:** Technologie Aplikacji Webowych II  
**Autorzy:** Kacper Szczudło, Piotr Cebula

## 1. Opis Projektu

**GastroHub** to kompleksowa aplikacja webowa do zarządzania restauracją. Łączy ona w sobie automatyczny system rezerwacji stolików dla klientów oraz panel obsługi i system POS (Point of Sale) dla personelu lokalu. Zrezygnowaliśmy z wyboru konkretnych stolików przez klientów na rzecz automatycznego przydziału, co zoptymalizuje obłożenie sali.

## 2. Podział na role i zakres funkcjonalny

### 👤 Klient
- Dostęp do aktualnego menu po zalogowaniu
- Składanie rezerwacji (data, godzina, liczba osób → automatyczny przydział stolika)
- Podgląd historii własnych rezerwacji

### 🤵 Kelner
- Interaktywny podgląd sali (kafelki + statusy stolików)
- Przypisywanie się do stolika i oznaczanie stolików „z ulicy”
- System POS – otwieranie rachunku, dodawanie pozycji, zamykanie zamówienia
- Grafik pracy (deklarowanie dyspozycyjności)

### 👑 Administrator
- Zarządzanie menu (CRUD)
- Konfiguracja układu stolików (liczba, pojemność)
- Zarządzanie wszystkimi rezerwacjami (m.in. anulowanie)
- (opcjonalnie) podgląd grafików kelnerów

## 3. Stos technologiczny (MERN)

- **Frontend:** React.js (Vite)
- **Backend:** Node.js + Express.js (REST API)
- **Baza danych:** MongoDB + Mongoose
- **Autentykacja/autoryzacja:** JWT + role (client / waiter / admin)

## 4. Architektura i Diagramy

### Model Przypadków Użycia

```mermaid
usecaseDiagram
    actor "Klient" as C
    actor "Kelner" as K
    actor "Administrator" as A

    usecase "Logowanie i Rejestracja" as UC1
    usecase "Przeglądanie menu" as UC2
    usecase "Automatyczna rezerwacja stolika" as UC3
    usecase "Podgląd interaktywnej sali" as UC4
    usecase "Obsługa zamówień POS" as UC5
    usecase "Grafik pracy" as UC6
    usecase "Zarządzanie menu CRUD" as UC7
    usecase "Konfiguracja układu stolików" as UC8
    usecase "Anulowanie rezerwacji" as UC9

    C --> UC1
    C --> UC2
    C --> UC3

    K --> UC1
    K --> UC4
    K --> UC5
    K --> UC6

    A --> UC1
    A --> UC7
    A --> UC8
    A --> UC9