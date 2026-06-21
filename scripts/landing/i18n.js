(function () {
  var STORAGE_KEY = 'apexLang';

  var translations = {
    ru: {
      meta_title: 'Apex — пространство для совместной работы над проектами',
      meta_description: 'Apex — рабочее пространство для команд: задачи, доска, календарь, чат и общий доступ. Ведите проекты вместе, не теряя контекст.',

      header_open_app: 'Открыть Apex',
      header_auth_entry: 'Вход',
      header_dropdown_guest: 'Гость',
      header_dropdown_not_auth: 'Не авторизован',
      header_dropdown_login: 'Войти',
      header_dropdown_register: 'Регистрация',
      header_dropdown_logout: 'Выйти',

      login_title: 'Войдите в аккаунт',
      login_email_label: 'Введите почту:',
      login_email_placeholder: 'Введите свою почту',
      login_pass_label: 'Введите пароль:',
      login_pass_placeholder: 'Введите пароль',
      login_forgot: 'Забыли пароль?',
      login_btn: 'Войти',
      login_no_acc: 'Нет аккаунта?',
      login_register_link: 'Зарегистрироваться',

      forgot_title: 'Восстановление пароля',
      forgot_email_label: 'Введите вашу почту:',
      forgot_email_placeholder: 'Введите почту для восстановления',
      forgot_btn: 'Восстановить пароль',
      forgot_back: 'Вернуться ко входу',

      reg_title: 'Регистрация',
      reg_name_label: 'Имя:',
      reg_name_placeholder: 'Введите имя',
      reg_email_label: 'E-mail:',
      reg_email_placeholder: 'Введите почту',
      reg_pass_label: 'Пароль:',
      reg_pass_placeholder: 'Введите пароль',
      reg_confirm_label: 'Подтверждение пароля',
      reg_confirm_placeholder: 'Повторите пароль',
      reg_agree_pre: 'Я согласен(а) с',
      reg_agree_license_link: 'Лицензионным соглашением',
      reg_agree_privacy_pre: 'Я прочитал(а) и согласен(а) с',
      reg_agree_privacy_link: 'Политикой конфиденциальности',
      reg_btn: 'Создать аккаунт',
      reg_have_acc: 'Уже есть аккаунт?',
      reg_login_link: 'Войти',

      payment_title: 'Оформление подписки',
      payment_terms_pre: 'Нажимая кнопку, вы соглашаетесь с',
      payment_terms_link: 'условиями подписки',
      payment_btn: 'Оплатить',

      hero_eyebrow: 'Совместная работа над проектами',
      hero_h1_html: 'Пространство, где проект <span class="hero-accent">собирается&nbsp;в&nbsp;одном&nbsp;месте</span>',
      hero_subtitle: 'Задачи, доска, календарь и заметки для всей команды в одном окне. Общий доступ, прозрачный прогресс и фокус на результат — без переключений между инструментами.',
      hero_start_btn: 'Начать бесплатно',
      hero_how_btn: 'Посмотреть, как устроено',
      hero_bullet_web: 'Веб приложение',
      hero_bullet_sync: 'Совместная работа в реальном времени',
      hero_bullet_clean: 'Без рекламы и трекеров',

      features_title: 'Что есть в Apex',
      features_subtitle: 'Всё, чтобы команда вела проекты в одном пространстве — без переключений',
      feat1_title: 'Проекты и направления',
      feat1_body: 'Разделяйте работу команды по проектам и направлениям, настраивайте цвета и иконки',
      feat2_title: 'Общий календарь',
      feat2_body: 'Дедлайны, встречи и спринты команды в едином календаре — без двойного учёта',
      feat3_title: 'Задачи и доска',
      feat3_body: 'Канбан-доска и лента задач на сегодня с чек-листами, комментариями и вложениями',
      feat4_title: 'Прогресс команды',
      feat4_body: 'Фиксируйте релизы, спринты и ключевые результаты — видно, что и кем сделано',
      feat5_title: 'Гибкие настройки',
      feat5_body: 'Роли, уведомления, темы и интеграции — подстраивайте под процессы вашей команды',
      feat6_title: 'Быстрые заметки',
      feat6_body: 'Идеи, решения встреч и наброски — одним кликом, с переносом в задачи',

      df_title: 'Как устроен Apex',
      df_subtitle: 'Прозрачный контроль над проектами, временем и людьми',

      tile01_tag: 'Навигация',
      tile01_title: 'Навигационный тулбар',
      tile01_li1: 'Логотип Apex и быстрый возврат к домашнему пространству',
      tile01_li2: 'Доступ к Проектам, Календарю, Прогрессу, Заметкам в один клик',
      tile01_li3: 'Внизу — Профиль и Справка',

      tile02_tag: 'Организация',
      tile02_title: 'Проекты команды',
      tile02_li1: 'Список проектов и направлений в боковом меню',
      tile02_li2: 'Группировка задач и событий по проектам с общим доступом',
      tile02_li3: 'Персонализация цветов и иконок для каждого проекта',

      tile03_tag: 'Планирование',
      tile03_title: 'Календарь',
      tile03_li1: 'Мини-календарь в правом сайд-баре',
      tile03_li2: 'Полноэкранный календарь со всеми событиями команды',

      tile04_tag: 'Задачи',
      tile04_title: 'Задачи и доска',
      tile04_li1: 'Лента задач на сегодня (таймлайн)',
      tile04_li2: 'Полноэкранное окно для создания и обсуждения задачи',
      tile04_li3: 'Чек-листы, комментарии с эмодзи и вложениями',
      tile04_li4: 'Статусы и «Фокус-режим» с таймером',

      tile05_tag: 'Достижения',
      tile05_title: 'Прогресс и достижения',
      tile05_li1: 'Фиксация результатов и побед команды',
      tile05_li2: 'Карточки релизов и ключевых результатов',
      tile05_li3: 'Статистика и аналитика прогресса по проектам',

      tile06_tag: 'Профиль',
      tile06_title: 'Профиль и настройки',
      tile06_li1: 'Управление аватаром, именем и email',
      tile06_li2: 'Уведомления, темы и прочие опции',

      tile07_tag: 'Заметки',
      tile07_title: 'Быстрые заметки',
      tile07_li1: 'Быстро зафиксировать мысль и потом перенести её в задачу',
      tile07_li2: 'Отдельные закладки для разных типов заметок',

      video_title: 'Apex в действии',
      video_subtitle: 'Посмотрите, как легко вести проекты, задачи и команду в одном окне',

      sub_title: 'Выберите подписку',
      sub_subtitle: 'Доступ ко всем функциям Apex',

      footer_download: 'Скачать',
      footer_soon_appstore: 'Скоро в App Store',
      footer_docs: 'Документы',
      footer_privacy: 'Политика конфиденциальности',
      footer_license: 'Лицензионное соглашение',
      footer_offer: 'Публичная оферта',
      footer_contact: 'Связь',
      footer_copy: '© 2026 Apex. Учебный проект.',
    },

    en: {
      meta_title: 'Apex — a space for collaborating on projects',
      meta_description: 'Apex is a workspace for teams: tasks, board, calendar, chat and shared access. Run projects together without losing context.',

      header_open_app: 'Open Apex',
      header_auth_entry: 'Sign In',
      header_dropdown_guest: 'Guest',
      header_dropdown_not_auth: 'Not signed in',
      header_dropdown_login: 'Sign In',
      header_dropdown_register: 'Sign Up',
      header_dropdown_logout: 'Sign Out',

      login_title: 'Sign In',
      login_email_label: 'Email:',
      login_email_placeholder: 'Enter your email',
      login_pass_label: 'Password:',
      login_pass_placeholder: 'Enter your password',
      login_forgot: 'Forgot password?',
      login_btn: 'Sign In',
      login_no_acc: 'No account?',
      login_register_link: 'Sign Up',

      forgot_title: 'Reset Password',
      forgot_email_label: 'Enter your email:',
      forgot_email_placeholder: 'Enter your email to reset',
      forgot_btn: 'Reset Password',
      forgot_back: 'Back to Sign In',

      reg_title: 'Create Account',
      reg_name_label: 'Name:',
      reg_name_placeholder: 'Enter your name',
      reg_email_label: 'E-mail:',
      reg_email_placeholder: 'Enter your email',
      reg_pass_label: 'Password:',
      reg_pass_placeholder: 'Enter password',
      reg_confirm_label: 'Confirm password',
      reg_confirm_placeholder: 'Repeat password',
      reg_agree_pre: 'I agree to the',
      reg_agree_license_link: 'License Agreement',
      reg_agree_privacy_pre: 'I have read and agree to the',
      reg_agree_privacy_link: 'Privacy Policy',
      reg_btn: 'Create Account',
      reg_have_acc: 'Already have an account?',
      reg_login_link: 'Sign In',

      payment_title: 'Subscribe',
      payment_terms_pre: 'By clicking the button, you agree to the',
      payment_terms_link: 'subscription terms',
      payment_btn: 'Pay',

      hero_eyebrow: 'Collaborate on projects',
      hero_h1_html: 'The space where your project <span class="hero-accent">comes&nbsp;together in&nbsp;one&nbsp;place</span>',
      hero_subtitle: 'Tasks, board, calendar and notes for the whole team in one window. Shared access, transparent progress and focus on results — without switching between tools.',
      hero_start_btn: 'Start for free',
      hero_how_btn: 'See how it works',
      hero_bullet_web: 'Web app',
      hero_bullet_sync: 'Real-time collaboration',
      hero_bullet_clean: 'No ads or trackers',

      features_title: "What's in Apex",
      features_subtitle: 'Everything for your team to run projects in one space — without switching',
      feat1_title: 'Projects & streams',
      feat1_body: 'Split your team’s work by projects and streams, customise colours and icons',
      feat2_title: 'Shared calendar',
      feat2_body: 'Deadlines, meetings and sprints in a single calendar — no double bookkeeping',
      feat3_title: 'Tasks & board',
      feat3_body: 'Kanban board and a today timeline with checklists, comments and attachments',
      feat4_title: 'Team progress',
      feat4_body: 'Track releases, sprints and key results — see what was done and by whom',
      feat5_title: 'Flexible settings',
      feat5_body: 'Roles, notifications, themes and integrations — tailored to your team’s process',
      feat6_title: 'Quick notes',
      feat6_body: 'Ideas, meeting decisions and drafts — in one click, with conversion into tasks',

      df_title: 'How Apex Works',
      df_subtitle: 'Transparent control over projects, time and people',

      tile01_tag: 'Navigation',
      tile01_title: 'Navigation Toolbar',
      tile01_li1: 'Apex logo and quick return to your home space',
      tile01_li2: 'One-click access to Projects, Calendar, Progress and Notes',
      tile01_li3: 'Profile and Help at the bottom',

      tile02_tag: 'Organisation',
      tile02_title: 'Team Projects',
      tile02_li1: 'List of projects and streams in the sidebar',
      tile02_li2: 'Group tasks and events by project with shared access',
      tile02_li3: 'Personalise colours and icons for each project',

      tile03_tag: 'Planning',
      tile03_title: 'Calendar',
      tile03_li1: 'Mini calendar in the right sidebar',
      tile03_li2: 'Full-screen calendar with all team events',

      tile04_tag: 'Tasks',
      tile04_title: 'Tasks & Board',
      tile04_li1: "Today's task timeline",
      tile04_li2: 'Full-screen window to create and discuss a task',
      tile04_li3: 'Checklists, comments with emoji and attachments',
      tile04_li4: 'Statuses and Focus mode with a timer',

      tile05_tag: 'Achievements',
      tile05_title: 'Progress & Achievements',
      tile05_li1: 'Record your team’s results and wins',
      tile05_li2: 'Cards for releases and key results',
      tile05_li3: 'Statistics and progress analytics by project',

      tile06_tag: 'Profile',
      tile06_title: 'Profile & Settings',
      tile06_li1: 'Manage avatar, name and email',
      tile06_li2: 'Notifications, themes and more',

      tile07_tag: 'Notes',
      tile07_title: 'Quick Notes',
      tile07_li1: 'Quickly capture a thought and turn it into a task later',
      tile07_li2: 'Separate tabs for different note types',

      video_title: 'Apex in Action',
      video_subtitle: 'See how easy it is to run projects, tasks and your team in one window',

      sub_title: 'Choose a Plan',
      sub_subtitle: 'Access to all Apex features',

      footer_download: 'Download',
      footer_soon_appstore: 'Coming soon on App Store',
      footer_docs: 'Documents',
      footer_privacy: 'Privacy Policy',
      footer_license: 'License Agreement',
      footer_offer: 'Public Offer',
      footer_contact: 'Contact',
      footer_copy: '© 2026 Apex. Educational project.',
    }
  };

  function detectLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ru' || stored === 'en') return stored;
    var browser = String(navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();
    return browser === 'ru' ? 'ru' : 'en';
  }

  function applyLang(lang) {
    var tr = translations[lang];
    if (!tr) return;

    document.documentElement.lang = lang;
    document.title = tr.meta_title;

    var el;
    el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', tr.meta_description);
    el = document.querySelector('meta[property="og:title"]');
    if (el) el.setAttribute('content', tr.meta_title);
    el = document.querySelector('meta[property="og:description"]');
    if (el) el.setAttribute('content', tr.meta_description);
    el = document.querySelector('meta[property="og:locale"]');
    if (el) el.setAttribute('content', lang === 'ru' ? 'ru_RU' : 'en_US');

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      if (tr[key] !== undefined) node.textContent = tr[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-html');
      if (tr[key] !== undefined) node.innerHTML = tr[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-placeholder');
      if (tr[key] !== undefined) node.setAttribute('placeholder', tr[key]);
    });

    document.querySelectorAll('.lang-toggle-btn [data-lang]').forEach(function (span) {
      span.classList.toggle('is-active', span.getAttribute('data-lang') === lang);
    });
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  window.apexI18n = { setLanguage: setLanguage };

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(detectLang());

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lang]');
      if (btn && btn.closest('.lang-toggle-btn')) {
        setLanguage(btn.getAttribute('data-lang'));
      }
    });
  });
})();
