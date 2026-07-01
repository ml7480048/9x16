# 9×16 — Статус прогресу по днях

> Оновлювати після кожної сесії. ✅ Done · 🔵 Next · ⏳ Pending

**Стан на 2026-07-01 (після Дня 12 Вечір + доробок):** Дні 1-12 повністю готові — 12/30 днів плану, 2/5 шляху. Реальні (не mock) інтеграції в проді (9x16.vercel.app): Anthropic Claude (`claude-sonnet-5`) генерує унікальні сцени й скрипт, Kling генерує реальні зображення в Storyboard і реальні відео-варіанти (Brand Prototype A/B/C) на Кроці 5 "Money Shot". Poll-timeout піднято до 270с (Vercel 300с стеля) + додано "Check again" — якщо наш опит здався, а Kling насправді доробив відео, можна перевірити статус без витрати нового кредиту. Клієнт тепер явно обирає "money shot" сцену в Storyboard (кнопка "Set as Money Shot"), замість довільного вибору першого готового зображення. Промпти для A/B/C варіантів переписані на конкретні camera/action інструкції (протестовано — варіанти досить схожі, ще можна покращити пізніше). Верхня навігація сайту оновлена: Platform → "AI Prototype", Player → "Verticals". Додано inline Edit у скрипті (Крок 4, без виклику Claude). Пофіксили "New Session" (раніше відкривав стару незакінчену сесію замість чистої). Відомий gap: кнопка Next неактивна після вибору варіанту на Кроці 5 — це очікувано, бо "що далі" (фінальне відео-склеювання) ще не спроектовано, заплановано на потім. Заплановано на потім (не зараз): фінальне відео-склеювання всіх сцен обраним стилем інтеграції в один епізод; повноцінна система сесій (Sessions/Settings — День 13+); реальні акаунти з паролем (зараз лише lead-форма без пароля).

**A24-редизайн затверджено як основний (2026-07-01):** Маріан підтвердив — новий дизайн не фінальний, але базовий/основний напрямок, старий "dark premium" не повертаємо (лишається лише як тег `v0-dark-premium` про всяк випадок). Далі допрацьовуємо поверх A24-бази. Відомі речі для перевірки/фіксу: (1) hover-only розкриття назв на `/player` плитках не спрацює на мобільних тач-екранах (а мобільний — основний use case) — треба або тестувати наживо, або зробити підпис завжди видимим на мобільних; (2) деякі сторінки (Settings, Team, Sessions) можуть виглядати занадто порожніми на малому екрані телефону через правило "70-80% порожнього простору" — треба перевірити наживо і зменшити відступи на мобільних breakpoint'ах, якщо відчуття "недороблено".

**Реальне hero-відео підключено (2026-07-01):** Маріан скинув реальний brand-майстер `1618_EB_Jobs-der-Zukunft...mov` (358MB ProRes) в робочу папку. Сконвертував через ffmpeg в `916/public/hero-preview.mp4` (720×1280, без звуку, ~5.1MB) і підключив на головній (Hero) та на `/platform` (фон за заголовком, 15% opacity). Плейсхолдери прибрані.

**+ ще один раунд — /player, /contacts, /team (2026-07-01, той самий день):** `/player` тепер показує 3 реальних наративних формати (Slice of Life / Micro-Thriller / Character Comedy) як порожні плейсхолдер-тайли в сітці 3 колонки, назва зʼявляється лише на hover/focus. `/contacts` спрощено до headline + accent email-лінк + місто, більше нічого. `/team` лишили "Coming soon" — реального складу команди нема, свідомо не вигадував імена (патерн для майбутнього списку закоментований в коді). Ще не закомічено — чекаємо фінального батч-коміту.

**5 детальних брифів по сторінках, поверх повного редизайну (2026-07-01, той самий день):** Головна (video-first hero, повернули Process-секцію зі scroll fade-in), `/platform` (nav об'єднано в один floating рядок — Header тепер має `subNav` слот, Sidebar більше не окрема панель), `/demo` (з заглушки — в реальний робочий демо з VerticalPlayer+VariantSwitcher на публічних sample-кліпах, бо реального Kling-відео для публічної сторінки нема), wizard-форма (underline-inputs всюди, Tone — 3 текстові опції замість dropdown, StepIndicator — тонка лінія прогресу замість кроків-кружечків, відступи 48px), `/platform/sessions` і `/platform/settings` (чесні empty-стани замість вигаданого функціоналу — реального бекенду сесій/налаштувань ще нема). Все перевірено eslint+tsc — чисто. **Залишилось вручну:** `git rm` для `PlatformTeaser.tsx`, `PlayerTeaser.tsx`, `Select.tsx` (тепер невикористовувані, на додачу до вже видалених `CompanyIntro.tsx`/`SolutionSection.tsx`).

**Повний редизайн design system (2026-07-01, перед Днем 13, окрема позапланова сесія):** Замінили "dark premium" (картки з бордюрами, кружечки-номери, filled/outline кнопки) на A24-minimalist: border-radius 0 всюди, без тіней/glow/градієнтів, фон завжди чистий #0A0A0A, accent-колір лише один момент на екран, шрифт заголовків замінено з Space Grotesk на Bebas Neue (tight leading, без bold/letter-spacing), кнопки стали текстовими лінками зі стрілкою (→), навігація — тонкий прозорий floating бар без фону/бордера, степ-індикатори — 01/02/03 замість кружечків, картки-грід де не було реального контенту прибрані (напр. A/B/C рамки на головній, series-concepts пільс на /player) заради 70-80% порожнього простору. Застосовано на всіх сторінках: `/`, `/platform`, `/platform/new`, `/platform/sessions`, `/platform/settings`, `/platform/leads`, `/player`, `/contacts`, `/team`, `/demo`, весь wizard. Перевірено eslint + tsc — чисто по всьому проєкту.

**Баланс API на кінець сесії (2026-07-01):** Anthropic — $4.90 org credits, витрачено $0.10 цього місяця (з ліміту $200K). Kling — 2 resource-пакети активні, залишок: 76% video generation, 93% image generation.

**Редизайн стартової сторінки (2026-07-01, фініш сесії):** Прибрали дублювання — `CompanyIntro` і старий `Hero` мали два окремих `<h1>` з майже однаковим текстом, об'єднали в один `Hero.tsx`. `SolutionSection` (5 кроків) повторював те, що тепер є на `/platform` — замінили на короткий `PlatformTeaser` (як вже був `PlayerTeaser`, обидва просто ведуть на повну версію замість повтору). Додали візуал у Hero: три нахилені 9:16-рамки A/B/C — пряме відсилання на реальну фічу Brand Prototype варіантів. Поправили застарілі назви (Platform→AI Prototype, Player→Verticals) в тексті головної. **Залишилось вручну:** `CompanyIntro.tsx` і `SolutionSection.tsx` — мертвий код, видалити через `git rm` (я не можу видаляти файли з цього середовища).

**Позапланова робота (2026-07-01, поза 30-денним роадмапом) — Done, задеплоєно:** `/platform` перероблено на публічну explainer-сторінку (що таке AI Prototype + 3 кроки). `/platform/new` тепер захищена: спочатку форма з ім'ям/email/брендом (без пароля) — зберігається в Postgres через `@vercel/postgres`, база підключена через Vercel Marketplace (Neon), встановлюється cookie на рік. `/platform/leads` — таблиця зібраних лідів, захищена Basic Auth (`ADMIN_USER=admin` / реальний `ADMIN_PASSWORD` виставлені і в `.env.local`, і в Vercel). Причина фічі: `/platform/new` раніше був повністю відкритий — будь-хто міг анонімно витрачати Kling/Anthropic кредити; тепер є ліда-база для клієнтів. Явно відкладено: реальні акаунти з паролем/логіном (зараз лише lead-форма без пароля) — можлива майбутня фіча.

## Тиждень 1 — Фундамент

| День | Сесія | Задача | Статус |
|---|---|---|---|
| 1 | Ранок | Setup + Next.js проєкт | ✅ Done |
| 1 | Вечір | Design system tokens + базові компоненти | ✅ Done |
| 2 | Ранок | Hero секція landing page | ✅ Done |
| 2 | Вечір | Решта landing page + навігація | ✅ Done |
| 3 | Ранок | Routing (App Router, всі routes) | ✅ Done |
| 3 | Вечір | Dashboard layout + sidebar | ✅ Done |
| 4 | Ранок | Wizard container + Step 1 (Brand Input) | ✅ Done |
| 4 | Вечір | Step 2 (Visual Setup) | ✅ Done |
| 5 | Ранок | Vercel деплой | ✅ Done |
| 5 | Вечір | Mobile тест і фікси | ✅ Done |

## Тиждень 2 — AI Інтеграція

| День | Сесія | Задача | Статус |
|---|---|---|---|
| 6 | Ранок | Anthropic API wrapper (anthropic.ts) | ✅ Done |
| 6 | Вечір | API route /api/generate-scenes | ✅ Done |
| 7 | Ранок | Step 3 UI — Storyboard Grid | ✅ Done |
| 7 | Вечір | Step 4 — Script Viewer | ✅ Done |
| 8 | Ранок | Image generation wrapper (Kling, $2.45 trial) | ✅ Done |
| 8 | Вечір | Підключення images до Storyboard | ✅ Done |
| 9 | Ранок | Video wrapper (Kling, $9.80 trial) | ✅ Done |
| 9 | Вечір | API route /api/generate-video | ✅ Done |
| 10 | Ранок | Повний flow тест | ✅ Done |
| 10 | Вечір | Фікси + loading UX (staged progress) | ✅ Done |

## Тиждень 3 — Brand Prototype Feature

| День | Сесія | Задача | Статус |
|---|---|---|---|
| 11 | Ранок | VerticalPlayer компонент | ✅ Done |
| 11 | Вечір | Три варіанти генерації (Promise.all) | ✅ Done |
| 12 | Ранок | VariantSwitcher UI | ✅ Done |
| 12 | Вечір | Step 5 — Prototype Viewer | ✅ Done |
| 13 | Ранок | Session persistence (localStorage) | 🔵 Next |
| 13 | Вечір | Session detail page | ⏳ Pending |
| 14 | Ранок | /demo route (публічний showcase) | ⏳ Pending |
| 14 | Вечір | Mobile тест /demo | ⏳ Pending |
| 15 | Ранок | End-to-end тест | ⏳ Pending |
| 15 | Вечір | Фікси і polish | ⏳ Pending |

## Тиждень 4 — Polish + Деплой

| День | Сесія | Задача | Статус |
|---|---|---|---|
| 16 | Ранок | Animations + transitions | ⏳ Pending |
| 16 | Вечір | Empty states і error states | ⏳ Pending |
| 17 | Ранок | Responsive audit | ⏳ Pending |
| 17 | Вечір | Performance / Lighthouse | ⏳ Pending |
| 18 | Ранок | Production env (Vercel deploy) | ⏳ Pending |
| 18 | Вечір | Домен 9x16.at + DNS | ⏳ Pending |
| 19 | Ранок | Matching Agent (Agent 2) | ⏳ Pending |
| 19 | Вечір | Format recommendation UI | ⏳ Pending |
| 20 | Ранок | Pitch-ready тест (телефон) | ⏳ Pending |
| 20 | Вечір | Останні фікси | ⏳ Pending |

## Дні 21–30 — Резерв

| Діапазон | Мета | Статус |
|---|---|---|
| 21–30 | API проблеми, додаткові фічі, перший пітч клієнту, старт Performance Agent | ⏳ Pending |
