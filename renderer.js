const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let currentMonth;
let currentYear;
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

function init() {
  const t = getToday();
  currentMonth = t.month;
  currentYear = t.year;

  renderDayHeaders();
  renderCalendar();
  bindEvents();
  scheduleMidnightRefresh();
}

function scheduleMidnightRefresh() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msUntilMidnight = midnight - now;
  setTimeout(() => {
    renderDayHeaders();
    renderCalendar();
    scheduleMidnightRefresh();
  }, msUntilMidnight + 500); // small buffer past midnight
}

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

function renderCalendar() {
  document.getElementById('monthName').textContent = MONTH_NAMES[currentMonth];
  document.getElementById('yearNumber').textContent = currentYear;

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

  const totalCells = 42; // 6 rows × 7 cols
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
      // Previous month
      displayDate = daysInPrevMonth - firstDay + 1 + i;
      displayMonth = currentMonth - 1;
      displayYear = currentYear;
      if (displayMonth < 0) { displayMonth = 11; displayYear--; }
      cell.classList.add('other-month');
    } else if (dayCounter > daysInMonth) {
      // Next month
      displayDate = nextMonthDay++;
      displayMonth = currentMonth + 1;
      displayYear = currentYear;
      if (displayMonth > 11) { displayMonth = 0; displayYear++; }
      cell.classList.add('other-month');
    } else {
      // Current month
      displayDate = dayCounter++;
      displayMonth = currentMonth;
      displayYear = currentYear;
    }

    numberSpan.textContent = displayDate;

    // Weekend styling
    if (col === 0 || col === 6) {
      cell.classList.add('weekend');
    }

    // Today highlight
    if (displayDate === t.date && displayMonth === t.month && displayYear === t.year) {
      cell.classList.add('today');
    }

    // Current week row highlight
    if (isViewingCurrentMonth && row === todayWeekRow) {
      cell.classList.add('current-week');
      if (col === 0) cell.classList.add('current-week-start');
      if (col === 6) cell.classList.add('current-week-end');
    }

    // Selected date highlight
    if (selectedDate &&
        displayDate === selectedDate.date &&
        displayMonth === selectedDate.month &&
        displayYear === selectedDate.year) {
      cell.classList.add('selected');
    }

    // Click to select
    cell.addEventListener('click', () => {
      selectedDate = { date: displayDate, month: displayMonth, year: displayYear };
      renderCalendar();
    });

    cell.appendChild(numberSpan);
    grid.appendChild(cell);
  }
}

function bindEvents() {
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  // Click month/year header to jump back to today
  document.getElementById('monthYear').addEventListener('click', () => {
    const t = getToday();
    currentMonth = t.month;
    currentYear = t.year;
    selectedDate = null;
    renderCalendar();
  });
}

document.addEventListener('DOMContentLoaded', init);
