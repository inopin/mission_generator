// ============================================================
// ТОЧКА ВХОДА
// ============================================================

const App = (function () {

  // --- Форматирование ---
  function formatMoney(n) {
    return Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ") + " бирров";
  }

  function formatPercent(v) {
    const p = v * 100;
    const sign = p >= 0 ? "+" : "−";
    return sign + Math.abs(p).toFixed(0) + "%";
  }

  function urgencyClass(name) {
    return "urgency-" + name.replace(/\s+/g, "-");
  }

  // --- Рендер ---
  function renderError(message) {
    document.getElementById("output").innerHTML =
      `<div class="error">${message}</div>`;
  }

  function renderContract(c) {
    const distanceBarPercent = ((c.distance - 0.5) / 69.5) * 100;

    document.getElementById("output").innerHTML = `
      <div class="card">
        <div class="label">Тип контракта</div>
        <div class="value">${c.type.name}</div>
        <div class="desc">${c.type.desc}</div>
        <div class="meta">Базовая оплата: ${formatMoney(c.type.base)}</div>
      </div>

      <div class="card">
        <div class="label">Маршрут</div>
        <div class="value">${c.route.name}</div>
        <div class="desc">${c.route.desc}</div>
        <div class="meta">Модификатор маршрута: ${formatPercent(c.route.mod)}</div>
      </div>

      <div class="card">
        <div class="label">Расстояние</div>
        <div class="value">${c.distance.toFixed(1)} а.е.</div>
        <div class="distance-bar">
          <div class="distance-bar-fill" style="width:${distanceBarPercent}%"></div>
        </div>
        <div class="meta">Надбавка за дальность: +${(c.distance / 10).toFixed(2)}%</div>
      </div>

      <div class="card">
        <div class="label">Срочность</div>
        <div class="value ${urgencyClass(c.urgency.name)}">${c.urgency.name}</div>
        <div class="desc">${c.urgency.desc}</div>
        <div class="meta">
          Срок: <strong>${c.deadline} дн.</strong> ·
          Дорога: ~${c.travelDays.toFixed(1)} дн. ·
          На задание: ${c.buffer} дн. ·
          Множитель оплаты: ×${c.urgency.payMod.toFixed(1)}
        </div>
      </div>

      <div class="card">
        <div class="label">Осложнение</div>
        <div class="value">${c.complication.name}</div>
        <div class="desc">${c.complication.desc}</div>
      </div>

      <div class="card total">
        <div class="label">Итоговая оплата</div>
        <div class="value">${formatMoney(c.payment.total)}</div>
        <div class="breakdown">
          ${formatMoney(c.type.base)} × (1 ${formatPercent(c.route.mod)} ${formatPercent(c.payment.distanceMod)}) × ${c.urgency.payMod.toFixed(1)} = ${formatMoney(c.payment.total)}
        </div>
      </div>
    `;
  }

  // --- Основной обработчик ---
  function handleGenerate() {
    try {
      const filters = Filters.read();
      const contract = Generator.generate(filters);
      renderContract(contract);
    } catch (err) {
      renderError(err.message);
    }
  }

  // --- Инициализация ---
  function init() {
    Filters.init();

    document.getElementById("btn-select-all").addEventListener("click", () => Filters.selectAll(true));
    document.getElementById("btn-select-none").addEventListener("click", () => Filters.selectAll(false));
    document.getElementById("btn-generate").addEventListener("click", handleGenerate);

    // Первый контракт при загрузке
    handleGenerate();
  }

  return { init };
})();

window.addEventListener("load", App.init);