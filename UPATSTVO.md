# ⚙ Авто Сервис — Упатство за Инсталација
# ⚙ Auto Servis — Installation Guide

---

## Што ти треба / What you need

- Компјутер (Windows, Mac, или Linux)
- Интернет конекција
- 30 минути слободно време

**Сè е БЕСПЛАТНО** — нема плаќање.
**Everything is FREE** — no payment required.

---

## ЧЕКОР 1: Инсталирај Node.js
## STEP 1: Install Node.js

1. Отвори: **https://nodejs.org**
2. Кликни на зеленото копче **"LTS"** (ако е 20.x или 22.x, и двете се ОК)
3. Инсталирај го (Next → Next → Finish)
4. За да провериш дали работи, отвори **Terminal** (Mac/Linux) или **Command Prompt** (Windows):
   ```
   node --version
   ```
   Треба да видиш број како `v20.11.0` — ако видиш, продолжи!

---

## ЧЕКОР 2: Направи Supabase (базата на податоци)
## STEP 2: Create Supabase (the database)

Supabase е бесплатна онлајн база каде се чуваат податоците. Тоа е она што овозможува
повеќе уреди (телефон + компјутер) да ги гледаат истите податоци.

1. Отвори: **https://supabase.com**
2. Кликни **"Start your project"** → најави се со GitHub или email
3. Кликни **"New Project"**
   - **Name:** `auto-servis`
   - **Database Password:** напиши нешто и ЗАПАМТИ ГО (или запиши го)
   - **Region:** избери **Central EU (Frankfurt)** (најблиску до Македонија)
   - Кликни **"Create new project"**
4. Почекај 1-2 минути додека се создаде

### 2а: Пушти го SQL скриптот

1. Во Supabase, кликни **"SQL Editor"** (лево мени)
2. Кликни **"New query"**
3. Отвори го фајлот `supabase-setup.sql` од проектот
4. Копирај го ЦЕЛИОТ текст и залепи го во SQL Editor
5. Кликни **"Run"** (зеленото копче)
6. Треба да видиш ✓ "Success"

### 2б: Земи ги клучевите

1. Кликни **"Settings"** (лево мени, долу) → **"API"**
2. Ќе видиш:
   - **Project URL** — нешто како `https://abcdefgh.supabase.co`
   - **anon public key** — долг текст кој почнува со `eyJ...`
3. **ЗАПИШИ ГИ** — ќе ти требаат во следниот чекор

---

## ЧЕКОР 3: Подготви го проектот
## STEP 3: Prepare the project

1. Отвори Terminal / Command Prompt
2. Оди до фолдерот каде го имаш проектот:
   ```
   cd auto-servis
   ```
3. Инсталирај ги потребните пакети:
   ```
   npm install
   ```
   (Почекај додека заврши — може да трае 1-2 минути)

4. Направи го `.env` фајлот:

   **На Mac/Linux:**
   ```
   cp .env.example .env
   ```
   **На Windows:**
   ```
   copy .env.example .env
   ```

5. Отвори го `.env` фајлот со текст едитор (Notepad, VS Code, итн.) и пополни:
   ```
   VITE_SUPABASE_URL=https://твојот-проект.supabase.co
   VITE_SUPABASE_ANON_KEY=твојот-anon-клуч
   ```
   (Замени ги со вредностите од Чекор 2б)

6. Тестирај локално:
   ```
   npm run dev
   ```
   Отвори **http://localhost:3000** во прелистувач — треба да ја видиш апликацијата!

---

## ЧЕКОР 4: Стави ја онлајн (deploy)
## STEP 4: Put it online (deploy)

### Опција А: Vercel (најлесно — препорачано)

1. Ако немаш, направи **GitHub** акаунт: https://github.com/signup
2. Инсталирај **Git**: https://git-scm.com/downloads

3. Во Terminal, внатре во `auto-servis` фолдерот:
   ```
   git init
   git add .
   git commit -m "first commit"
   ```

4. Направи нов repository на GitHub:
   - Оди на https://github.com/new
   - **Repository name:** `auto-servis`
   - Кликни **"Create repository"**
   - Копирај ги командите "push an existing repository" и пуштиги во Terminal:
   ```
   git remote add origin https://github.com/ТВОЕТО-ИМЕ/auto-servis.git
   git branch -M main
   git push -u origin main
   ```

5. Отвори **https://vercel.com** → Sign up со GitHub
6. Кликни **"Add New..." → "Project"**
7. Избери го `auto-servis` repository
8. **ВАЖНО:** Пред да кликнеш Deploy, кликни на **"Environment Variables"** и додади:
   - `VITE_SUPABASE_URL` = твојот URL
   - `VITE_SUPABASE_ANON_KEY` = твојот клуч
9. Кликни **"Deploy"**
10. По 1-2 минути ќе добиеш линк како: `https://auto-servis-xxxxx.vercel.app`

**ГОТОВО!** 🎉 Тој линк е твојата апликација. Отвори го на телефон, компјутер, таблет — сите ги гледаат истите податоци.

### Опција Б: Netlify (исто лесно)

1. Отвори **https://netlify.com** → Sign up
2. Кликни **"Add new site" → "Deploy manually"**
3. Прво билдај го проектот:
   ```
   npm run build
   ```
4. Повлечи го `dist` фолдерот во Netlify
5. Во **Site settings → Environment variables**, додади ги Supabase клучевите
6. Rebuild

---

## ЧЕКОР 5: Додади на телефон (како апликација)
## STEP 5: Add to phone (like an app)

### iPhone:
1. Отвори го линкот во Safari
2. Кликни на Share копчето (квадрат со стрелка)
3. Кликни **"Add to Home Screen"**
4. Именувај го "Авто Сервис" → Add

### Android:
1. Отвори го линкот во Chrome
2. Кликни на ⋮ (три точки горе десно)
3. Кликни **"Add to Home screen"**
4. Именувај го → Add

Сега имаш иконка на телефонот која ја отвара апликацијата!

---

## Корисни информации / Useful info

### Како работи синхронизацијата?
Кога газдата додава сервис на компјутер, работникот го гледа на таблет — во реално време.
Ако нема интернет, апликацијата работи офлајн (со localStorage) и се синхронизира кога ќе
се врати интернетот.

### Безбедност
- ПИН-от го заштитува приватниот режим (приходи, клиенти)
- Supabase anon клучот е безбеден за фронтенд — Row Level Security е вклучен
- За дополнителна безбедност, можеш да ги ограничиш дозволените домени во
  Supabase Dashboard → Settings → API → "Allowed domains"

### Ако нешто не работи
- Провери дали `.env` фајлот е точно пополнет
- Провери дали SQL скриптот е пуштен во Supabase
- Отвори Browser Console (F12) и види дали има грешки
- Провери дали Supabase проектот е активен (бесплатните проекти се паузираат после 7 дена неактивност — само отвори го dashboard-от за да се рестартира)

### Supabase бесплатни лимити (повеќе од доволно)
- 500MB база
- 1GB трансфер месечно
- Неограничени API повици
- Realtime sync вклучен

---

## Структура на проектот / Project structure

```
auto-servis/
├── index.html          ← HTML страница
├── package.json        ← зависности (dependencies)
├── vite.config.js      ← Vite конфигурација
├── .env.example        ← пример за environment variables
├── .env                ← ТВОИТЕ клучеви (НЕ го споделувај!)
├── .gitignore          ← фајлови кои git ги игнорира
├── supabase-setup.sql  ← SQL за базата
├── UPATSTVO.md         ← ова упатство
└── src/
    ├── main.jsx        ← React entry point
    ├── index.css       ← стилови
    ├── supabase.js     ← Supabase конекција + sync
    └── App.jsx         ← целата апликација
```

---

**Прашања? Проблеми?** Врати се кај Claude и прашај — ќе ти помогнам! 🔧
