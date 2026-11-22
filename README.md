# made by f4r3n9e1t — портфолио

Концепция **RENDER REGION**: сайт как вьюпорт Blender в момент рендера. Мир существует как сетка,
а курсор — это красная рамка региона рендера (Ctrl+B), внутри которой геометрия становится материей.
Почему именно так и как выбирали из трёх концепций — `docs/01_PREPRODUCTION.md`.

## Запуск

Нужен Node.js 20.19+ (или 22.12+).

```bash
npm install
npm run dev        # http://localhost:5199
npm run build      # проверка типов + сборка в dist/
npm run preview    # локальный просмотр собранной версии
```

Деплой: папка `dist/` — статический сайт. Для Netlify уже есть `public/_redirects`, для Vercel —
`vercel.json` (нужно, чтобы прямые ссылки вида `/work/molly-figure` открывались после перезагрузки).

## Как менять контент

Весь контент — в одном файле: **`src/config/site.config.ts`**.

| Что | Где в файле |
|---|---|
| Ник, подпись, роль, описание, заголовок вкладки | `brand` |
| Фраза на первом экране | `hero.statement` |
| Заголовок, короткие фразы и биография | `about` |
| Инструменты и чем каждый «питает» нод-граф | `tools`, `disciplines` |
| Email, Instagram, ArtStation, Behance, Telegram | `contact` |
| Категории 01–05 | `categories` |
| Проекты, тексты, тех. данные, картинки, видео | `projects` |

**Мета-теги для соцсетей** (описание, `og:image`) лежат в `index.html` — поменяйте там текст и,
когда будет домен, сделайте `og:image` абсолютной ссылкой (`https://ваш-домен/og.jpg`).

**Контакты.** Пустое значение = строка «Not linked yet» без ссылки. Пример:

```ts
email: 'you@example.com',          // кнопка Copy появится сама
{ label: 'Telegram', value: '@handle', url: 'https://t.me/handle' },
```

`showEmpty: false` спрячет все незаполненные соцсети.

**Новый проект.** Положите файлы в `public/projects/<slug>/`, скопируйте любой объект в
`projects` и поменяйте поля. `width`/`height` — размеры файла (нужны только для пропорций).
`srcSmall` — уменьшенная копия (~960 px по длинной стороне) для телефонов; можно не указывать.
`status: 'demo'` вешает плашку «Demo slot», `status: 'published'` — убирает её.
У видео кнопка звука появляется только с `hasAudio: true` (сейчас у всех роликов звука нет).

**Свои рендеры в web-размерах.** `tools/prepare_assets.py` берёт исходники из соседних папок
проектов (только читает их) и пишет WebP 2000 px + 960 px в `public/projects/`.
`tools/encode_web_video.py` пережимает анимацию в лёгкий MP4 через FFmpeg, встроенный в Blender:

```bash
python tools/prepare_assets.py
```

```bash
blender -b --factory-startup --python tools/encode_web_video.py -- "C:/abs/path/src.mp4" "C:/abs/path/public/projects/slug/clip.mp4" 1280
```

## Что где лежит

```
src/config/        site.config.ts (весь контент), types.ts (схема)
src/app/           App (роуты, скролл, пасхалка), TransitionProvider (бакет-переходы, экран загрузки), boot
src/pages/         Home, Project (страница проекта), Viewport (секретная), NotFound
src/sections/      Hero, Work, About, Toolset, Contact
src/components/    Nav, Cursor, BucketImage, VideoPlayer, Lightbox, NeonSignature, Magnetic, …
src/three/         sculpture.ts (WebGL-камень, ленивый чанк), webgl.ts (проверка/фолбэк)
src/animations/    buckets (порядок спирали Cycles), tileWipe, reveal, smoothScroll (Lenis)
src/styles/        tokens.css (цвета, шрифты, сетка, моушн), base.css
public/projects/   изображения и видео проектов
tools/             подготовка изображений и видео
docs/              пре-продакшн: три концепции, сравнение, дизайн-система
```

## Секреты

- Наберите на странице **render** — откроется вьюпорт с камнем: перетаскивание вращает,
  клавиши 1–4 переключают шейдинг (Wireframe / Clay / Rendered / Region).
- В консоли браузера ждёт короткое сообщение.
- `?nowebgl` в адресе принудительно включает фолбэк без WebGL (для проверки).
