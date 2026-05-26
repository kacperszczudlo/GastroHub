# Architektura i Diagramy

## 1. Stos technologiczny (MERN)

| Warstwa | Technologia | Wersja |
|--------|-------------|--------|
| Frontend | React + Vite + TypeScript + Tailwind CSS | React 19.2 · Vite 7.3 · TS 6.0 · Tailwind 4.2 |
| Backend | Node.js + Express (ESM) | Express 5.2 |
| Baza danych | MongoDB + Mongoose | Mongoose 9.2 |
| Autoryzacja | JWT + role + Google OAuth | `jsonwebtoken` 9.0 · `google-auth-library` 10.6 |
| Testy | Vitest + Testing Library + jsdom | Vitest 3.2 |
| Hosting frontu | Vercel | — |
| Hosting API | Render | — |

## 2. Architektura logiczna (high-level)

```mermaid
flowchart LR
    Browser["Przeglądarka (klient/kelner/admin)"]
    Vercel["Vercel — Frontend\nReact + Vite (SPA)"]
    Render["Render — Backend\nNode.js + Express"]
    Mongo[("MongoDB Atlas\n(Mongoose)")]
    Google["Google Identity Services\n(OAuth)"]

    Browser -- HTTPS --> Vercel
    Vercel -- "REST /api/*" --> Render
    Render -- "Mongoose" --> Mongo
    Browser -- "id_token" --> Google
    Browser -- "POST /api/auth/google" --> Render
    Render -- "verifyIdToken" --> Google
```

## 3. Model przypadków użycia

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

## 4. Diagram ERD (Entity Relationship Diagram)

![Diagram ERD bazy danych](images/DiagramERD.png)

Główne kolekcje MongoDB (zdefiniowane jako modele Mongoose w `server/src/modules/*`):

| Kolekcja | Model | Najważniejsze pola |
|----------|-------|--------------------|
| `users` | `auth/user.model.js` | `email`, `passwordHash`, `role` (`client` / `waiter` / `admin`), `googleId` |
| `menuitems` | `menu/menu.model.js` | `name`, `description`, `price`, `category`, `imageBase64` |
| `tables` | `table/table.model.js` | `tableNumber`, `capacity`, `position`, `status` |
| `reservations` | `reservation/reservation.model.js` | `userId`, `tableId`, `reservationDate`, `startTime`, `endTime`, `numberOfGuests`, `status` |
| `orders` | `order/order.model.js` | `tableId`, `waiterId`, `items[]`, `totalPrice`, `status` |
| `schedules` | `schedule/schedule.model.js` | `userId`, `date`, `shift` |

## 5. Warstwy aplikacji (backend)

```
server/src/
├── app.js                # konfiguracja Express + montaż routerów
├── server.js             # bootstrap (DB connect, cron prune)
├── database/connect.js   # połączenie z Mongo
├── middlewares/          # auth, role guard, error handler
└── modules/
    ├── auth/             # routes · controller · service · model
    ├── menu/
    ├── table/
    ├── reservation/
    ├── order/
    └── schedule/
```

Każdy moduł trzyma się układu **routes → controller → service → model**, co ułatwia testy
jednostkowe (Vitest) bez stawiania całego serwera HTTP.

## 6. Warstwy aplikacji (frontend)

```
client/src/
├── main.tsx              # wejście (Google OAuth provider)
├── App.tsx               # router widoków na podstawie roli + currentView
├── components/
│   ├── common/           # Header, LoginScreen
│   ├── client/           # ClientMenu, ClientReservation, ClientReservationsList
│   ├── waiter/           # FloorPlan, WaiterPOS, TableModal
│   └── admin/            # AdminMenuManager, AdminReservationsManager, ScheduleView
├── context/              # AuthContext, MenuDataContext, TablesContext, ...
├── services/             # axios + obsługa API
└── ...
```

Stan globalny jest realizowany przez `React Context` (m.in. `AuthContext`, `NavigationContext`,
`MenuDataContext`, `TablesContext`, `ReservationsContext`, `ScheduleContext`, `UiFeedbackContext`).
Wszystkie providery są zagnieżdżone w `AppProviders.tsx`.
