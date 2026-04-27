/* ============================================================
   CALCULADORA DE PORCENTAJES — app.js
   Toda la lógica de la app: tabs, calculadora, historial, dark mode.
   ============================================================ */

// ── DOM REFERENCES ────────────────────────────────────────────────────────────
// Obtenemos referencias a todos los elementos que vamos a manipular.
var inputAmount     = document.getElementById('input-amount');
var inputPercentage = document.getElementById('input-percentage');
var btnAdd          = document.getElementById('btn-add');
var btnSubtract     = document.getElementById('btn-subtract');
var resultPctValue  = document.getElementById('result-percentage-value');
var resultTotal     = document.getElementById('result-total');
var historyList     = document.getElementById('history-list');
var historyEmpty    = document.getElementById('history-empty');
var btnClear        = document.getElementById('btn-clear-history');
var toggleDark      = document.getElementById('toggle-dark');
var toggleThumb     = document.getElementById('toggle-thumb');
var darkModeIcon    = document.getElementById('dark-mode-icon');
var pageTitle       = document.getElementById('page-title');


// ── TAB NAVIGATION ────────────────────────────────────────────────────────────
// Cada pestaña tiene: el id del botón de nav → { id del panel, título del header }
var tabs = {
  'nav-calcular':  { panel: 'tab-calcular',  title: 'CALCULADORA DE PORCENTAJES' },
  'nav-historial': { panel: 'tab-historial', title: 'HISTORIAL' },
  'nav-ajustes':   { panel: 'tab-ajustes',   title: 'AJUSTES' }
};

function switchTab(id) {
  // 1. Ocultar todos los paneles
  ['tab-calcular', 'tab-historial', 'tab-ajustes'].forEach(function(p) {
    document.getElementById(p).classList.remove('active');
  });

  // 2. Mostrar el panel seleccionado
  document.getElementById(tabs[id].panel).classList.add('active');

  // 3. Actualizar el título del header
  pageTitle.textContent = tabs[id].title;

  // 4. Resetear estilos de todos los botones de nav
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.remove('bg-violet-50', 'dark:bg-violet-900/30', 'text-violet-700', 'dark:text-violet-300', 'rounded-2xl');
    btn.classList.add('text-gray-400', 'dark:text-gray-500');
  });

  // 5. Aplicar estilo activo al botón pulsado
  var activeBtn = document.getElementById(id);
  activeBtn.classList.remove('text-gray-400', 'dark:text-gray-500');
  activeBtn.classList.add('bg-violet-50', 'dark:bg-violet-900/30', 'text-violet-700', 'dark:text-violet-300', 'rounded-2xl');
}

// Conectar los botones de navegación
document.getElementById('nav-calcular').addEventListener('click',  function() { switchTab('nav-calcular'); });
document.getElementById('nav-historial').addEventListener('click', function() { switchTab('nav-historial'); });
document.getElementById('nav-ajustes').addEventListener('click',   function() { switchTab('nav-ajustes'); });


// ── CALCULATOR ────────────────────────────────────────────────────────────────

// Lee y valida los dos inputs. Devuelve un objeto o null si hay error.
function getInputs() {
  var amount = parseFloat(inputAmount.value);
  var pct    = parseFloat(inputPercentage.value);
  if (isNaN(amount) || isNaN(pct)) {
    alert('Por favor ingresa números válidos');
    return null;
  }
  return { amount: amount, percentage: pct };
}

// Actualiza los dos spans de resultado en pantalla
function updateDisplay(pctVal, total) {
  resultPctValue.textContent = pctVal.toFixed(2);
  resultTotal.textContent    = total.toFixed(2);
}

// Modo SUMA: útil para calcular impuestos o propinas
function addPercentage() {
  var i = getInputs();
  if (!i) return;
  var pctVal = (i.percentage / 100) * i.amount;
  var total  = i.amount + pctVal;
  updateDisplay(pctVal, total);
  addToHistory(i.amount, i.percentage, pctVal, total, 'suma');
}

// Modo RESTA: útil para calcular descuentos
function subtractPercentage() {
  var i = getInputs();
  if (!i) return;
  var pctVal = (i.percentage / 100) * i.amount;
  var total  = i.amount - pctVal;
  updateDisplay(pctVal, total);
  addToHistory(i.amount, i.percentage, pctVal, total, 'resta');
}

btnAdd.addEventListener('click', addPercentage);
btnSubtract.addEventListener('click', subtractPercentage);


// ── HISTORY + LOCALSTORAGE ────────────────────────────────────────────────────
// Cargamos el historial guardado en el navegador.
// Si no hay nada guardado, usamos un array vacío [].
var history = JSON.parse(localStorage.getItem('calc_history') || '[]');

// Guarda un nuevo cálculo al inicio del array (más reciente primero)
function addToHistory(amount, pct, pctVal, total, mode) {
  history.unshift({
    amount:     amount,
    percentage: pct,
    pctVal:     pctVal,
    total:      total,
    mode:       mode,  // 'suma' o 'resta'
    time:       new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  });
  localStorage.setItem('calc_history', JSON.stringify(history)); // persistir
  renderHistory();
}

// Dibuja todas las tarjetas del historial en el DOM
function renderHistory() {
  if (history.length === 0) {
    historyEmpty.style.display = 'flex';
    historyList.style.display  = 'none';
    return;
  }

  historyEmpty.style.display = 'none';
  historyList.style.display  = 'flex';
  historyList.innerHTML = '';

  history.forEach(function(e) {
    var isAdd     = e.mode === 'suma';
    var badgeCls  = isAdd ? 'bg-violet-100 text-violet-700' : 'bg-pink-100 text-pink-700';
    var iconColor = isAdd ? 'text-violet-600' : 'text-primary';
    var iconName  = isAdd ? 'add_circle' : 'remove_circle';
    var modeLabel = isAdd ? 'Suma' : 'Resta';

    var card = document.createElement('div');
    card.className = 'history-item bg-surface-container rounded-3xl p-5 shadow-sm flex flex-col gap-3';
    card.innerHTML =
      '<div class="flex items-center justify-between">' +
        '<div class="flex items-center gap-2">' +
          '<span class="material-symbols-outlined ' + iconColor + '">' + iconName + '</span>' +
          '<span class="font-semibold text-on-surface text-sm">' +
            e.amount.toFixed(2) + ' &middot; ' + e.percentage + '%' +
          '</span>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
          '<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ' + badgeCls + '">' + modeLabel + '</span>' +
          '<span class="text-xs text-on-surface-variant">' + e.time + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="h-px bg-outline-variant/30"></div>' +
      '<div class="flex justify-between">' +
        '<div class="flex flex-col gap-0.5">' +
          '<span class="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Valor %</span>' +
          '<span class="text-on-surface font-semibold text-base">' + e.pctVal.toFixed(2) + '</span>' +
        '</div>' +
        '<div class="flex flex-col gap-0.5 items-end">' +
          '<span class="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Final</span>' +
          '<span class="text-primary font-bold text-base">' + e.total.toFixed(2) + '</span>' +
        '</div>' +
      '</div>';

    historyList.appendChild(card);
  });
}

// Botón "Limpiar todo"
btnClear.addEventListener('click', function() {
  if (history.length === 0) return;
  if (confirm('¿Seguro que quieres borrar todo el historial?')) {
    history = [];
    localStorage.removeItem('calc_history'); // borrar del navegador
    renderHistory();
  }
});


// ── DARK MODE ─────────────────────────────────────────────────────────────────
var isDark = false;

function applyDark(dark) {
  isDark = dark;
  if (dark) {
    document.documentElement.classList.add('dark');
    toggleDark.style.backgroundColor = '#630ed4';
    toggleThumb.style.transform = 'translateX(28px)';
    toggleDark.setAttribute('aria-checked', 'true');
    darkModeIcon.textContent = 'light_mode';
  } else {
    document.documentElement.classList.remove('dark');
    toggleDark.style.backgroundColor = '';
    toggleThumb.style.transform = 'translateX(0)';
    toggleDark.setAttribute('aria-checked', 'false');
    darkModeIcon.textContent = 'dark_mode';
  }
}

toggleDark.addEventListener('click', function() { applyDark(!isDark); });


// ── INIT ──────────────────────────────────────────────────────────────────────
// Renderizar historial al cargar la página (puede ya tener datos de localStorage)
renderHistory();
