// ============================================================
// МОДУЛЬ ФИЛЬТРОВ
// ============================================================

const Filters = (function () {
  const DIST_MIN_ID = "dist-min";
  const DIST_MAX_ID = "dist-max";
  const TIME_MIN_ID = "time-min";
  const TIME_MAX_ID = "time-max";
  const TYPES_CONTAINER_ID = "type-checks";

  // --- Инициализация чекбоксов ---
  function initTypes() {
    const container = document.getElementById(TYPES_CONTAINER_ID);
    container.innerHTML = TYPES.map(t => `
      <label>
        <input type="checkbox" checked data-name="${t.name}">
        ${t.name}
      </label>
    `).join("");
  }

  function selectAll(val) {
    document.querySelectorAll(`#${TYPES_CONTAINER_ID} input[type="checkbox"]`)
      .forEach(c => c.checked = val);
  }

  // --- Чтение значений ---
  function getSelectedTypes() {
    return Array.from(document.querySelectorAll(`#${TYPES_CONTAINER_ID} input[type="checkbox"]`))
      .filter(c => c.checked)
      .map(c => c.dataset.name);
  }

  function readNumber(id, fallback) {
    const val = parseFloat(document.getElementById(id).value);
    return isNaN(val) ? fallback : val;
  }

  /**
   * Возвращает объект фильтров или выбрасывает ошибку.
   */
  function read() {
    let distMin = readNumber(DIST_MIN_ID, 0.5);
    let distMax = readNumber(DIST_MAX_ID, 70);
    let timeMin = readNumber(TIME_MIN_ID, 1);
    let timeMax = readNumber(TIME_MAX_ID, 90);

    // Если пользователь перепутал местами — меняем
    if (distMin > distMax) [distMin, distMax] = [distMax, distMin];
    if (timeMin > timeMax) [timeMin, timeMax] = [timeMax, timeMin];

    // Зажимаем в допустимые границы
    distMin = Math.max(0.5, Math.min(70, distMin));
    distMax = Math.max(0.5, Math.min(70, distMax));
    timeMin = Math.max(1, Math.min(90, timeMin));
    timeMax = Math.max(1, Math.min(90, timeMax));

    const types = getSelectedTypes();
    if (types.length === 0) {
      throw new Error("Выбери хотя бы один тип контракта.");
    }

    return {
      types,
      distance: { min: distMin, max: distMax },
      time: { min: timeMin, max: timeMax }
    };
  }

  // --- Публичный интерфейс ---
  return {
    init: initTypes,
    selectAll,
    read
  };
})();