# Projekt: GastroHub

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![API](https://img.shields.io/badge/API-REST-005571?style=flat-square)
![Security](https://img.shields.io/badge/Security-JWT%20%2B%20Roles-000000?style=flat-square&logo=jsonwebtokens)

**Przedmiot:** Technologie Aplikacji Webowych II  
**Autorzy:** Kacper Szczudło, Piotr Cebula

## 1. Opis Projektu

**GastroHub** to kompleksowa aplikacja webowa do zarządzania restauracją. Łączy ona w sobie automatyczny system rezerwacji stolików dla klientów oraz panel obsługi i system POS (Point of Sale) dla personelu lokalu. Zrezygnowaliśmy z wyboru konkretnych stolików przez klientów na rzecz automatycznego przydziału, co zoptymalizuje obłożenie sali.

## 2. Podział na role i zakres funkcjonalny

### Klient
- Dostęp do aktualnego menu po zalogowaniu
- Składanie rezerwacji (data, godzina, liczba osób → automatyczny przydział stolika)
- Podgląd historii własnych rezerwacji

### Kelner
- Interaktywny podgląd sali (kafelki + statusy stolików)
- Przypisywanie się do stolika i oznaczanie stolików „z ulicy”
- System POS – otwieranie rachunku, dodawanie pozycji, zamykanie zamówienia
- Grafik pracy (deklarowanie dyspozycyjności)

### Administrator
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
flowchart LR
    subgraph " "
        C("Klient"):::actor
        K("Kelner"):::actor
        A("Administrator"):::actor
    end

    subgraph "System GastroHub"
        UC1("Logowanie i Rejestracja")
        UC2("Przeglądanie menu")
        UC3("Automatyczna rezerwacja stolika")
        UC4("Podgląd interaktywnej sali")
        UC5("Obsługa zamówień POS")
        UC6("Grafik pracy")
        UC7("Zarządzanie menu CRUD")
        UC8("Konfiguracja układu stolików")
        UC9("Anulowanie rezerwacji")
    end

    C --> UC1 & UC2 & UC3
    K --> UC1 & UC4 & UC5 & UC6
    A --> UC1 & UC7 & UC8 & UC9

    classDef actor fill:#e6f3ff,stroke:#0066cc,stroke-width:2px
    classDef usecase fill:#fffacd,stroke:#cc9900,stroke-width:1.5px
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9 usecase
```

### Diagram ERD (Entity Relationship Diagram)

![Diagram ERD bazy danych](docs/DiagramERD.png)

