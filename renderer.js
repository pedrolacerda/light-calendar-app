const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let currentMonth;
let currentYear;
let currentView = 'month';
let currentWeekStart = null;
let selectedDate = null;

function getToday() {
  const now = new Date();
  return {
    date: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear(),
    weekday: now.getDay(),
  };
}

function getWeekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/* ── Theme ── */

function getTheme() {
  return localStorage.getItem('theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? '☀︎' : '☽';
  }
  localStorage.setItem('theme', theme);
  if (window.themeAPI) window.themeAPI.notifyTheme(theme);
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/* ── View Management ── */

function setView(view) {
  currentView = view;
  localStorage.setItem('calendarView', view);
  updateViewSwitcher();
  renderView();
  if (window.themeAPI) window.themeAPI.notifyView(view);
}

function updateViewSwitcher() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === currentView);
  });
}

function updateHeader() {
  const monthEl = document.getElementById('monthName');
  const yearEl = document.getElementById('yearNumber');

  if (currentView === 'year') {
    monthEl.textContent = '';
    yearEl.textContent = currentYear;
  } else if (currentView === 'week') {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const sm = MONTH_NAMES[currentWeekStart.getMonth()];
    const em = MONTH_NAMES[end.getMonth()];
    if (currentWeekStart.getMonth() === end.getMonth()) {
      monthEl.textContent = `${sm} ${currentWeekStart.getDate()}–${end.getDate()}`;
    } else {
      monthEl.textContent = `${sm.substring(0, 3)} ${currentWeekStart.getDate()} – ${em.substring(0, 3)} ${end.getDate()}`;
    }
    yearEl.textContent = end.getFullYear();
  } else {
    monthEl.textContent = MONTH_NAMES[currentMonth];
    yearEl.textContent = currentYear;
  }
}

function renderView() {
  const dayHeaders = document.getElementById('dayHeaders');
  const dateGrid = document.getElementById('dateGrid');
  const weekView = document.getElementById('weekView');
  const yearView = document.getElementById('yearView');

  dayHeaders.style.display = currentView === 'month' ? '' : 'none';
  dateGrid.style.display = currentView === 'month' ? '' : 'none';
  weekView.style.display = currentView === 'week' ? '' : 'none';
  yearView.style.display = currentView === 'year' ? '' : 'none';

  updateHeader();

  switch (currentView) {
    case 'week': renderWeekView(); break;
    case 'month': renderDayHeaders(); renderMonthView(); break;
    case 'year': renderYearView(); break;
  }
}

/* ── Day Headers (month view) ── */

function renderDayHeaders() {
  const container = document.getElementById('dayHeaders');
  container.innerHTML = '';
  const t = getToday();

  DAY_NAMES.forEach((name, i) => {
    const el = document.createElement('div');
    el.className = 'day-header';
    el.textContent = name;
    if (i === t.weekday) el.classList.add('today-weekday');
    if (i === 0 || i === 6) el.classList.add('weekend');
    container.appendChild(el);
  });
}

/* ── Month View ── */

function renderMonthView() {
  const grid = document.getElementById('dateGrid');
  grid.innerHTML = '';
  const t = getToday();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const isViewingCurrentMonth = currentMonth === t.month && currentYear === t.year;
  let todayWeekRow = -1;
  if (isViewingCurrentMonth) {
    todayWeekRow = Math.floor((firstDay + t.date - 1) / 7);
  }

  const totalCells = 42;
  let dayCounter = 1;
  let nextMonthDay = 1;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'date-cell';

    const numberSpan = document.createElement('span');
    numberSpan.className = 'date-number';

    const col = i % 7;
    const row = Math.floor(i / 7);

    let displayDate, displayMonth, displayYear;

    if (i < firstDay) {
      displayDate = daysInPrevMonth - firstDay + 1 + i;
      displayMonth = currentMonth - 1;
      displayYear = currentYear;
      if (displayMonth < 0) { displayMonth = 11; displayYear--; }
      cell.classList.add('other-month');
    } else if (dayCounter > daysInMonth) {
      displayDate = nextMonthDay++;
      displayMonth = currentMonth + 1;
      displayYear = currentYear;
      if (displayMonth > 11) { displayMonth = 0; displayYear++; }
      cell.classList.add('other-month');
    } else {
      displayDate = dayCounter++;
      displayMonth = currentMonth;
      displayYear = currentYear;
    }

    numberSpan.textContent = displayDate;

    if (col === 0 || col === 6) cell.classList.add('weekend');

    if (displayDate === t.date && displayMonth === t.month && displayYear === t.year) {
      cell.classList.add('today');
    }

    if (isViewingCurrentMonth && row === todayWeekRow) {
      cell.classList.add('current-week');
      if (col === 0) cell.classList.add('current-week-start');
      if (col === 6) cell.classList.add('current-week-end');
    }

    if (selectedDate &&
        displayDate === selectedDate.date &&
        displayMonth === selectedDate.month &&
        displayYear === selectedDate.year) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => {
      selectedDate = { date: displayDate, month: displayMonth, year: displayYear };
      renderView();
    });

    cell.appendChild(numberSpan);
    grid.appendChild(cell);
  }
}

/* ── Week View ── */

function renderWeekView() {
  const container = document.getElementById('weekView');
  container.innerHTML = '';
  const t = getToday();

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);

    const cell = document.createElement('div');
    cell.className = 'week-day';

    const nameEl = document.createElement('div');
    nameEl.className = 'week-day-name';
    nameEl.textContent = DAY_NAMES[i];

    const numberEl = document.createElement('div');
    numberEl.className = 'week-day-number';
    numberEl.textContent = date.getDate();

    if (date.getDate() === t.date && date.getMonth() === t.month && date.getFullYear() === t.year) {
      cell.classList.add('today');
    }

    if (i === 0 || i === 6) cell.classList.add('weekend');

    if (selectedDate &&
        date.getDate() === selectedDate.date &&
        date.getMonth() === selectedDate.month &&
        date.getFullYear() === selectedDate.year) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => {
      selectedDate = { date: date.getDate(), month: date.getMonth(), year: date.getFullYear() };
      renderView();
    });

    cell.appendChild(nameEl);
    cell.appendChild(numberEl);
    container.appendChild(cell);
  }
}

/* ── Year View ── */

function renderYearView() {
  const container = document.getElementById('yearView');
  container.innerHTML = '';
  const t = getToday();

  for (let month = 0; month < 12; month++) {
    const miniMonth = document.createElement('div');
    miniMonth.className = 'mini-month';

    const nameEl = document.createElement('div');
    nameEl.className = 'mini-month-name';
    nameEl.textContent = MONTH_NAMES[month].substring(0, 3);
    if (month === t.month && currentYear === t.year) {
      nameEl.classList.add('current');
    }
    miniMonth.appendChild(nameEl);

    // Mini day headers
    const headerRow = document.createElement('div');
    headerRow.className = 'mini-day-headers';
    DAY_NAMES.forEach(name => {
      const h = document.createElement('div');
      h.className = 'mini-day-header';
      h.textContent = name.charAt(0);
      headerRow.appendChild(h);
    });
    miniMonth.appendChild(headerRow);

    // Date grid
    const grid = document.createElement('div');
    grid.className = 'mini-grid';
    const firstDay = new Date(currentYear, month, 1).getDay();
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'mini-date empty';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateEl = document.createElement('div');
      dateEl.className = 'mini-date';
      dateEl.textContent = day;

      const col = (firstDay + day - 1) % 7;
      if (col === 0 || col === 6) dateEl.classList.add('weekend');

      if (day === t.date && month === t.month && currentYear === t.year) {
        dateEl.classList.add('today');
      }

      grid.appendChild(dateEl);
    }

    miniMonth.appendChild(grid);

    // Click mini month to switch to month view
    miniMonth.addEventListener('click', () => {
      currentMonth = month;
      setView('month');
    });

    container.appendChild(miniMonth);
  }
}

/* ── Navigation ── */

function navigatePrev() {
  switch (currentView) {
    case 'week':
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      currentMonth = currentWeekStart.getMonth();
      currentYear = currentWeekStart.getFullYear();
      break;
    case 'month':
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      break;
    case 'year':
      currentYear--;
      break;
  }
  renderView();
}

function navigateNext() {
  switch (currentView) {
    case 'week':
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      currentMonth = currentWeekStart.getMonth();
      currentYear = currentWeekStart.getFullYear();
      break;
    case 'month':
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      break;
    case 'year':
      currentYear++;
      break;
  }
  renderView();
}

function goToToday() {
  const t = getToday();
  currentMonth = t.month;
  currentYear = t.year;
  currentWeekStart = getWeekStart(new Date());
  selectedDate = null;
  renderView();
}

/* ── Events ── */

function bindEvents() {
  document.getElementById('prevMonth').addEventListener('click', navigatePrev);
  document.getElementById('nextMonth').addEventListener('click', navigateNext);
  document.getElementById('monthYear').addEventListener('click', goToToday);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
}

/* ── Lifecycle ── */

function scheduleMidnightRefresh() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msUntilMidnight = midnight - now;
  setTimeout(() => {
    renderView();
    scheduleMidnightRefresh();
  }, msUntilMidnight + 500);
}

function init() {
  const t = getToday();
  currentMonth = t.month;
  currentYear = t.year;
  currentWeekStart = getWeekStart(new Date());
  currentView = localStorage.getItem('calendarView') || 'month';

  applyTheme(getTheme());

  if (window.themeAPI) {
    window.themeAPI.onSetTheme(applyTheme);
  }

  updateViewSwitcher();
  renderView();
  bindEvents();
  scheduleMidnightRefresh();

  // Notify main of initial view for correct window sizing
  if (window.themeAPI) window.themeAPI.notifyView(currentView);
}

document.addEventListener('DOMContentLoaded', init);
