# GastroHub

![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-9.x-880000?style=flat-square&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Roles-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google OAuth](https://img.shields.io/badge/OAuth-Google-4285F4?style=flat-square&logo=google&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest%203-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)

**Przedmiot:** Technologie Aplikacji Webowych II  
**Autorzy:** Kacper Szczudło, Piotr Cebula  
**Demo:** [https://gastro-hub.me](https://gastro-hub.me)

---

## Spis treści

1. [Opis projektu](#1-opis-projektu)
2. [Finalne funkcjonalności](#2-finalne-funkcjonalności)
3. [Stos technologiczny](#3-stos-technologiczny)
4. [Demo i screenshoty](#4-demo-i-screenshoty)
5. [Struktura repozytorium](#5-struktura-repozytorium)
6. [Uruchomienie lokalne (dev)](#6-uruchomienie-lokalne-dev)
7. [Uruchomienie produkcyjne](#7-uruchomienie-produkcyjne)
8. [Testy](#8-testy)
9. [Dokumentacja dodatkowa](#9-dokumentacja-dodatkowa)
10. [Znane ograniczenia](#10-znane-ograniczenia)

---

## 1. Opis projektu

**GastroHub** to kompleksowa aplikacja webowa do zarządzania restauracją. Łączy w sobie automatyczny
system rezerwacji stolików dla klientów oraz panel obsługi i system **POS (Point of Sale)** dla
personelu lokalu. Zrezygnowaliśmy z wyboru konkretnych stolików przez klientów na rzecz automatycznego
przydziału, co optymalizuje obłożenie sali.

Aplikacja działa w trzech rolach: **Klient**, **Kelner** i **Administrator** — każda z osobnym UI
i osobnym zestawem uprawnień egzekwowanym po stronie API (middleware ról + JWT).

## 2. Finalne funkcjonalności

### Klient

- Logowanie i rejestracja (email + hasło lub **Sign in with Google**).
- Przeglądanie pełnego menu restauracji z filtrowaniem po kategoriach.
- Składanie rezerwacji (data + godzina + liczba gości) — system **automatycznie przydziela
  stolik** w zależności od dostępności i pojemności.
- Lista własnych rezerwacji ze statusami (`oczekująca` / `zrealizowana` / `odrzucona`).

### Kelner

- Interaktywny plan sali (kafelki stolików z kolorami statusów).
- Modal stolika: przypisanie kelnera, otwarcie rachunku, oznaczanie gości „z ulicy”.
- **System POS** — dodawanie pozycji menu do rachunku, edycja ilości, zapis rachunku jako
  otwartego lub zamknięcie zamówienia z płatnością.
- Mój grafik — zgłaszanie dyspozycyjności (zmiana poranna / popołudniowa).

### Administrator

- Pełne **CRUD menu** (nazwa, opis, cena, kategoria, zdjęcie w base64).
- Konfiguracja układu sali (tryb drag&drop — przeciąganie stolików zapisuje pozycję w bazie).
- Zarządzanie wszystkimi rezerwacjami (anulowanie, ręczne odrzucanie, *prune* starych rekordów).
- Zarządzanie grafikami pracy wszystkich kelnerów.

### Wspólne

- JWT + middleware sprawdzający role (`client` / `waiter` / `admin`).
- Walidacja zajętości stolika na danym przedziale czasu po stronie serwera.
- Automatyczny *prune* przeterminowanych rezerwacji (uruchamiany 30 s po starcie serwera,
  następnie co 24 h).

## 3. Stos technologiczny

| Warstwa | Technologia | Wersja |
|--------|-------------|--------|
| Frontend | React + Vite + TypeScript + Tailwind CSS | React **19.2**, Vite **7.3**, TS **6.0**, Tailwind **4.2** |
| Backend | Node.js + Express (ESM) | Express **5.2**, Node **≥ 20 LTS** |
| Baza danych | MongoDB + Mongoose | Mongoose **9.2** (MongoDB Atlas) |
| Autoryzacja | JWT + role + Google OAuth | `jsonwebtoken` **9.0**, `google-auth-library` **10.6** |
| Testy | Vitest + Testing Library + jsdom | Vitest **3.2** |
| Hosting frontu | **Vercel** | SPA build z `client/` |
| Hosting API | **Render** | Web Service z `server/` |

Pełna architektura (use case, ERD, warstwy modułów) opisana jest w
[`docs/architecture.md`](docs/architecture.md).

## 4. Demo i screenshoty

- Live demo: **[https://gastro-hub.me](https://gastro-hub.me)**
- Screenshoty wszystkich widoków + opis layoutu: [`docs/ui.md`](docs/ui.md)

## 5. Struktura repozytorium

| Katalog | Zawartość |
|--------|-----------|
| `client/` | Aplikacja React (Vite, TS, Tailwind), testy Vitest |
| `server/` | API Express + Mongoose, testy Vitest |
| `docs/` | Dokumentacja API, opis architektury, makiety UI |
| `docs/images/` | Screenshoty z aplikacji i diagram ERD |

## 6. Uruchomienie lokalne (dev)

### Wymagania

- **Node.js** ≥ 20 LTS
- Działająca instancja **MongoDB** (lokalnie albo MongoDB Atlas)

### Zmienne środowiskowe

**Backend** — plik `server/.env` (wzór: [`server/.env.example`](server/.env.example)):

| Zmienna | Wymagane | Opis |
|--------|----------|------|
| `MONGO_URI` | tak | Connection string do MongoDB |
| `JWT_SECRET` | tak | Tajny klucz do podpisywania JWT |
| `PORT` | nie | Port HTTP API (domyślnie 5000) |
| `GOOGLE_CLIENT_ID` | dla logowania Google | Ten sam identyfikator co `VITE_GOOGLE_CLIENT_ID` w kliencie |

**Frontend** — plik `client/.env` (wzór: [`client/.env.example`](client/.env.example)):

| Zmienna | Wymagane | Opis |
|--------|----------|------|
| `VITE_API_URL` | tak | Pełny URL do API, np. `http://localhost:5000/api` (lokalnie) lub `https://<twoj-backend>.onrender.com/api` (prod) |
| `VITE_APP_NAME` | nie | Opcjonalna nazwa instancji |
| `VITE_GOOGLE_CLIENT_ID` | dla logowania Google | OAuth Client ID z Google Cloud Console |

### Instalacja i serwery developerskie

```bash
# Terminal 1 — API (port 5000)
cd server && npm install && npm run dev

# Terminal 2 — UI (port wypisze Vite)
cd client && npm install && npm run dev
```

W dev frontend ma proxy `/api → http://localhost:5000` (`client/vite.config.js`).

### Linux: watcher plików (EMFILE / inotify)

- **Klient (Vite):** `npm run dev:poll` lub `GASTROHUB_POLL=1`.
- **Serwer (nodemon):** `npm run dev:poll` (`--legacy-watch`).

## 7. Uruchomienie produkcyjne

Konfiguracja produkcyjna używana w demo: **MongoDB Atlas + Render (backend) + Vercel (frontend)**.

### 7.1 Baza danych — MongoDB Atlas

1. Załóż klaster w [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier wystarczy).
2. W `Database Access` utwórz użytkownika z uprawnieniem `readWrite`.
3. W `Network Access` dodaj `0.0.0.0/0` (lub IP z Render) — wymagane, aby Render mógł się łączyć.
4. Skopiuj connection string w formacie `mongodb+srv://<user>:<pass>@<cluster>/gastrohub`.

### 7.2 Backend — Render (Web Service)

1. W panelu Render: **New → Web Service** i połącz repozytorium GitHub `GastroHub`.
2. Ustaw:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (uruchamia `node src/server.js`)
   - **Node Version:** 20 lub nowsza (`Environment → NODE_VERSION=20`)
3. Dodaj zmienne środowiskowe (`Environment`):

   ```env
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=<silny losowy ciąg>
   GOOGLE_CLIENT_ID=<id z Google Cloud Console>
   ```

   `PORT` jest ustawiany przez Render automatycznie — serwer odczyta go z `process.env.PORT`
   (`server/src/server.js`).
4. **Health check:** `GET /` → zwraca `GastroHub API is running`.
5. Po wdrożeniu Render udostępni publiczny adres typu `https://<nazwa>.onrender.com`. Zachowaj go —
   trafi do frontowej zmiennej `VITE_API_URL`.

### 7.3 Frontend — Vercel

1. W panelu Vercel: **Add New Project → Import Git Repository** i wskaż `GastroHub`.
2. Ustaw:
   - **Root Directory:** `client`
   - **Framework Preset:** *Vite* (Vercel wykryje automatycznie)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Dodaj zmienne środowiskowe (Project Settings → Environment Variables) dla `Production`:

   ```env
   VITE_API_URL=https://<nazwa>.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=<ten sam co po stronie backendu>
   VITE_APP_NAME=GastroHub
   ```

4. (Opcjonalnie) Wpinasz własną domenę — np. `gastro-hub.me`. Aktualne demo: `https://gastro-hub.me`.

### 7.4 Google OAuth

W [Google Cloud Console](https://console.cloud.google.com/) utwórz **OAuth 2.0 Client ID**
typu *Web application* i dodaj:

- **Authorized JavaScript origins:** `https://gastro-hub.me`, `http://localhost:5173`,
- **Authorized redirect URIs:** ten sam zestaw co powyżej.

Następnie wstaw uzyskany Client ID jako `GOOGLE_CLIENT_ID` (backend, Render) oraz
`VITE_GOOGLE_CLIENT_ID` (frontend, Vercel) — **muszą to być te same wartości**.

### 7.5 Smoke test produkcji

```bash
# 1. Backend zwraca napis powitalny
curl -s https://<nazwa>.onrender.com/

# 2. Frontend ładuje SPA
curl -sI https://gastro-hub.me | head -n 1
```

## 8. Testy

Stack: **Vitest**; po stronie klienta dodatkowo **Testing Library** + **jsdom**.

```bash
cd server && npm test            # jednorazowy przebieg
cd server && npm run test:watch  # tryb watch

cd client && npm test
cd client && npm run test:watch
```

Przy `EMFILE: too many open files` w trybie watch użyj wariantu polling:
`npm run test:watch:poll` w katalogu `server/` lub `client/` (szczegóły w `vitest.config.js`).

## 9. Dokumentacja dodatkowa

- **API:** [`docs/api.md`](docs/api.md) + kolekcja Postman
  [`docs/GastroHubApi.postman_collection.json`](docs/GastroHubApi.postman_collection.json).
- **Architektura i diagramy** (use case, ERD, warstwy): [`docs/architecture.md`](docs/architecture.md).
- **Makiety / opis layoutu widoków:** [`docs/ui.md`](docs/ui.md).
- **Wybór tematu projektu:** [`docs/topic-selection.md`](docs/topic-selection.md).

## 10. Znane ograniczenia

- Brak osobnego widoku „kuchni” — kelner od razu zamyka i opłaca rachunek, statusy zamówienia
  (`preparing` itp.) istnieją tylko po stronie API.
- Zdjęcia pozycji menu są przechowywane jako **base64 w MongoDB** — wystarczające dla projektu
  zaliczeniowego, ale w produkcji warto przepiąć na storage obiektowy (S3 / Cloudinary).
- Plan sali jest statycznym układem 2D bez wsparcia dla wielu sal lub pięter.
- Render Free tier **usypia** serwer po ~15 minutach bezczynności — pierwsze zapytanie po
  uśpieniu trwa kilka sekund (cold start). W demo widoczne jako wolniejsze pierwsze logowanie.
- Brak realnej bramki płatności — przycisk *Zakończ / Zapłać* zamyka rachunek po stronie API,
  ale nie integruje się z procesorem płatności.
- Brak push-update’ów w czasie rzeczywistym (WebSocket/SSE) — kelnerzy odświeżają stan sali
  ręcznie lub poprzez zmianę widoku.
- Logowanie Google działa tylko wtedy, gdy `VITE_GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_ID` są
  ustawione **identycznie** po obu stronach; w przeciwnym razie pozostaje login email/hasło.
- Testy frontowe pokrywają głównie ekran logowania i kluczowe konteksty — pełna regresja UI
  wymaga dopisania kolejnych przypadków.
