# Деплой Noor Coffee на noorcoffee.ru

Прод-стек поднимается одной командой через `docker-compose.prod.yml`.

## Архитектура

```
Интернет
   │  80/443 (HTTPS)
   ▼
 Caddy  ──► выпускает и продлевает TLS-сертификат (Let's Encrypt) автоматически
   │  reverse_proxy
   ▼
 frontend (nginx)  ──► отдаёт React-SPA, проксирует /api и /uploads
   │
   ▼
 backend (Go)  ──► REST API + загрузка картинок (том uploads_data)
   │
   ▼
 db (PostgreSQL 16)  ──► данные (том db_data)
```

Наружу открыты **только порты 80 и 443 (Caddy)**. База и backend в интернет не торчат.

---

## 1. Что нужно на сервере

- Linux-сервер (VPS) с публичным IP.
- Установленные **Docker** и плагин **docker compose v2**:
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```
- Открытые порты **80** и **443** (firewall / security group).

## 2. DNS

В панели регистратора домена `noorcoffee.ru` создай A-записи на IP сервера:

| Тип | Имя              | Значение (IP сервера) |
|-----|------------------|-----------------------|
| A   | `@` (noorcoffee.ru) | `123.45.67.89`     |
| A   | `www`            | `123.45.67.89`        |

Подожди, пока DNS обновится (`ping noorcoffee.ru` должен отдавать твой IP).
Сертификат HTTPS Caddy сможет выпустить только после того, как домен указывает на сервер.

## 3. Деплой

```bash
git clone <repo-url> noor
cd noor

cp .env.example .env
nano .env            # ОБЯЗАТЕЛЬНО смени POSTGRES_PASSWORD и ADMIN_TOKEN

docker compose -f docker-compose.prod.yml up -d --build
```

Через 1–2 минуты Caddy получит сертификат и сайт будет доступен:

- Витрина: **https://noorcoffee.ru**
- Админка: **https://noorcoffee.ru/admin**
- Панель персонала: **https://noorcoffee.ru/staff**

При входе в админку/панель введи значение `ADMIN_TOKEN` из `.env`.

> `www.noorcoffee.ru` автоматически редиректится на `https://noorcoffee.ru`.

---

## 4. Полезные команды

```bash
# логи
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f caddy     # если не выдаётся сертификат

# статус
docker compose -f docker-compose.prod.yml ps

# перезапуск / остановка
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml down              # данные в томах сохраняются

# обновление после git pull
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 5. Бэкапы

```bash
# дамп базы
docker exec noor_db pg_dump -U postgres coffeeshop > backup_$(date +%F).sql

# восстановление
cat backup_2026-01-01.sql | docker exec -i noor_db psql -U postgres -d coffeeshop

# загруженные картинки (логотип/фоны/фото товаров) лежат в томе uploads_data:
docker run --rm -v noor_uploads_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads_$(date +%F).tar.gz -C /data .
```

> Имена томов: `noor_db_data`, `noor_uploads_data`, `noor_caddy_data`.

---

## 6. Заметки

- **Сертификат** продлевается автоматически, ничего делать не нужно.
- **Сменить настройки витрины** (название, WhatsApp, валюта, фоны, логотип) можно
  прямо в админке → «Внешний вид» (значения из `.env` — только дефолты на старте).
- **Локальная разработка** — отдельный файл `docker-compose.yaml` (порты 3000/8081/5433)
  либо `cd frontend && npm run dev` + `cd backend && go run ./cmd/server`.
- Файл **`.env` не коммить** — он в `.gitignore`.
