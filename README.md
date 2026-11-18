# Каталог оборудования

Каталог на **50 000 товаров**: FastAPI + Pydantic, чистый JavaScript, Web Worker, Service Worker, GZip, ETag и pytest. Интерфейс на русском языке.

## Запуск (Python 3.11+)

```bash
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev main.py
```

Открыть: http://127.0.0.1:8000/ — каталог; http://127.0.0.1:8000/docs — Swagger.

## Тесты

```bash
pytest -q
```

В `tests/test_api.py` четыре теста: схема, валидация, ETag/304 и GZip.

## Проверка офлайн-режима

1. Откройте каталог по `http://127.0.0.1:8000/`, дождитесь загрузки.
2. Обновите страницу один раз, чтобы убедиться, что Service Worker управляет вкладкой.
3. DevTools → Application → Service Workers: проверьте статус activated.
4. DevTools → Network → Offline, затем перезагрузите страницу.
5. Введите «клавиатра» — поиск должен работать по сохранённым данным.
6. При изменении файлов оболочки увеличьте `VERSION` в `static/sw.js` и обновите страницу.

**Важно:** при первом посещении онлайн нужно дождаться завершения загрузки API и кеширования. DevTools → Application → Cache storage показывает `shell-v1` и `api-v1`.

## Проверка обработки ошибок

Временно замените в `static/app.js` путь `/api/items` на `/api/items?delay=8` или `/api/nope`, перезагрузите страницу с отключённым кешем и проверьте статус. Верните исходный путь.


## Состав

- `main.py` — API и статические файлы
- `static/index.html`, `styles.css` — семантика и адаптивный интерфейс
- `static/search.js` — алгоритм нечёткого поиска на основе расстояния Левенштейна
- `static/worker.js` — поиск в отдельном потоке
- `static/app.js` — UI, загрузка с AbortController, защита от XSS
- `static/sw.js` — офлайн-кеш
- `tests/test_api.py` — тесты API
- `REPORT.md` — отчёт и инструкция для замеров
