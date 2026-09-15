// ============================================================
// МОДУЛЬ ГЕНЕРАЦИИ КОНТРАКТА
// ============================================================

const Generator = (function () {

  // --- Утилиты ---
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function roundDistance(v) {
    return Math.round(v * 10) / 10;
  }

  // --- Фильтрация ---
  function filterTypes(selectedNames) {
    return TYPES.filter(t => selectedNames.includes(t.name));
  }

  function filterRoutes(distanceFilter) {
    return ROUTES.filter(r => {
      // Есть пересечение [r.min, r.max] и [filter.min, filter.max]
      return r.max >= distanceFilter.min && r.min <= distanceFilter.max;
    });
  }

  // --- Подбор одного контракта ---
  function tryBuildContract(types, routes, filters) {
    const type = pick(types);
    const route = pick(routes);

    // Пересечение диапазона маршрута и фильтра
    const dMin = Math.max(route.min, filters.distance.min);
    const dMax = Math.min(route.max, filters.distance.max);

    const distance = (dMin === dMax)
      ? dMin
      : roundDistance(randomInRange(dMin, dMax));

    const travelDays = distance / CONFIG.shipSpeed;
    const buffer = MISSION_BUFFER[type.name] || 3;
    const baseTime = travelDays + buffer;

    // Какие уровни срочности дают срок в пределах фильтра?
    const fittingUrgencies = URGENCY.filter(u => {
      const deadline = Math.ceil(baseTime * u.slack);
      return deadline >= filters.time.min && deadline <= filters.time.max;
    });

    if (fittingUrgencies.length === 0) return null;

    const urgency = pick(fittingUrgencies);
    const deadline = Math.ceil(baseTime * urgency.slack);

    const complication = pick(COMPLICATIONS);

    return {
      type,
      route,
      complication,
      urgency,
      distance,
      travelDays,
      buffer,
      baseTime,
      deadline
    };
  }

  // --- Расчёт оплаты ---
  function calculatePayment(contract) {
    const { type, route, distance, urgency } = contract;
    const distanceMod = distance / 1000;
    const totalMod = (1 + route.mod + distanceMod) * urgency.payMod;
    const total = type.base * totalMod;

    return {
      distanceMod,
      totalMod,
      total
    };
  }

  // --- Публичный метод ---
  /**
   * @param {Object} filters — из Filters.read()
   * @returns {Object} — готовый контракт с оплатой, или null
   */
  function generate(filters) {
    const types = filterTypes(filters.types);
    if (types.length === 0) {
      throw new Error("Выбери хотя бы один тип контракта.");
    }

    const routes = filterRoutes(filters.distance);
    if (routes.length === 0) {
      throw new Error("Ни один маршрут не подходит под выбранное расстояние. Расширь диапазон.");
    }

    for (let i = 0; i < CONFIG.maxAttempts; i++) {
      const contract = tryBuildContract(types, routes, filters);
      if (contract) {
        const payment = calculatePayment(contract);
        return { ...contract, payment };
      }
    }

    throw new Error("Не удалось подобрать контракт под фильтры. Попробуй ослабить условия — расширь срок или расстояние.");
  }

  // --- Экспорт ---
  return { generate };
})();