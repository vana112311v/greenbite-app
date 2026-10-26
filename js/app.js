/**
 * Лабораторная работа № 5 — Клиентская логика приложения GreenBite
 * Работает на всех 3 отдельных страницах (index.html, catalog.html, tracker.html)
 * и синхронизирует состояние через localStorage
 */
(function () {
  "use strict";

  var STORAGE_KEY = "greenbite_lab5_state";

  var MEALS = [
    {
      id: "m1",
      title: "Зелёный Детокс-Боул с киноа",
      category: "detox",
      tag: "Детокс",
      kcal: 420,
      protein: 18,
      fat: 14,
      carbs: 52,
      price: 490,
      image: "assets/meal-detox.svg"
    },
    {
      id: "m2",
      title: "Лосось Су-вид с брокколи и бурым рисом",
      category: "balance",
      tag: "Баланс",
      kcal: 540,
      protein: 36,
      fat: 22,
      carbs: 48,
      price: 680,
      image: "assets/meal-balance.svg"
    },
    {
      id: "m3",
      title: "Протеиновый Стейк из индейки с бататом",
      category: "sport",
      tag: "Спорт",
      kcal: 650,
      protein: 48,
      fat: 18,
      carbs: 68,
      price: 640,
      image: "assets/meal-sport.svg"
    },
    {
      id: "m4",
      title: "Тофу Терияки с эдамаме и гречневой соба",
      category: "vegan",
      tag: "Веган",
      kcal: 460,
      protein: 24,
      fat: 15,
      carbs: 58,
      price: 520,
      image: "assets/meal-vegan.svg"
    },
    {
      id: "m5",
      title: "Смузи-боул Спирулина, чиа и манго",
      category: "detox",
      tag: "Детокс",
      kcal: 340,
      protein: 12,
      fat: 10,
      carbs: 49,
      price: 430,
      image: "assets/meal-detox.svg"
    },
    {
      id: "m6",
      title: "Говядина Прайм с киноа и спаржей",
      category: "sport",
      tag: "Спорт",
      kcal: 710,
      protein: 52,
      fat: 26,
      carbs: 62,
      price: 750,
      image: "assets/meal-sport.svg"
    }
  ];

  var state = {
    targetKcal: 1800,
    activeCategory: "all",
    searchQuery: "",
    darkTheme: false,
    cart: {
      m1: 1,
      m2: 1
    }
  };

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (parsed.targetKcal) state.targetKcal = parsed.targetKcal;
          if (parsed.cart && typeof parsed.cart === "object") state.cart = parsed.cart;
          if (typeof parsed.darkTheme === "boolean") state.darkTheme = parsed.darkTheme;
        }
      }
    } catch (e) {
      // Игнорируем ограничения sandbox
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        targetKcal: state.targetKcal,
        cart: state.cart,
        darkTheme: state.darkTheme
      }));
    } catch (e) {
      // Игнорируем ограничения sandbox
    }
  }

  function applyTheme() {
    var themeBtn = document.getElementById("themeToggleBtn");
    if (state.darkTheme) {
      document.body.classList.add("dark-theme");
      if (themeBtn) themeBtn.textContent = "☀️ Тема";
    } else {
      document.body.classList.remove("dark-theme");
      if (themeBtn) themeBtn.textContent = "🌙 Тема";
    }
  }

  function showToast(text) {
    var toast = document.getElementById("toastMsg");
    var toastText = document.getElementById("toastText");
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.classList.add("visible");
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      toast.classList.remove("visible");
    }, 3000);
  }

  function updateHeaderBadgeAndGoals() {
    var totalItems = 0;
    for (var i = 0; i < MEALS.length; i++) {
      totalItems += state.cart[MEALS[i].id] || 0;
    }
    var badge = document.getElementById("cartCountBadge");
    if (badge) badge.textContent = String(totalItems);

    var heroTarget = document.getElementById("heroTargetDisplay");
    if (heroTarget) heroTarget.textContent = state.targetKcal + " ккал";

    var goalBtns = document.querySelectorAll(".goal-btn");
    for (var j = 0; j < goalBtns.length; j++) {
      var btnKcal = parseInt(goalBtns[j].getAttribute("data-kcal"), 10);
      if (btnKcal === state.targetKcal) {
        goalBtns[j].classList.add("active");
      } else {
        goalBtns[j].classList.remove("active");
      }
    }
  }

  function renderCatalog() {
    var grid = document.getElementById("catalogGrid");
    if (!grid) return;

    var filtered = MEALS.filter(function (item) {
      var matchesCat = state.activeCategory === "all" || item.category === state.activeCategory;
      var matchesQuery = item.title.toLowerCase().indexOf(state.searchQuery.toLowerCase()) !== -1;
      return matchesCat && matchesQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="meal-card"><p>По вашему запросу блюда не найдены. Попробуйте выбрать другую категорию.</p></div>';
      return;
    }

    var html = "";
    for (var i = 0; i < filtered.length; i++) {
      var m = filtered[i];
      var inCartQty = state.cart[m.id] || 0;
      html += '<article class="meal-card">' +
        '<div class="meal-top">' +
          '<img class="meal-thumb" src="' + m.image + '" alt="' + m.title + '">' +
          '<div class="meal-info">' +
            '<span class="meal-tag">' + m.tag + '</span>' +
            '<h3 class="meal-title">' + m.title + '</h3>' +
          '</div>' +
        '</div>' +
        '<div class="meal-macros">' +
          '<span>🔥 ' + m.kcal + ' ккал</span>' +
          '<span>Б: ' + m.protein + ' г</span>' +
          '<span>Ж: ' + m.fat + ' г</span>' +
          '<span>У: ' + m.carbs + ' г</span>' +
        '</div>' +
        '<div class="meal-footer">' +
          '<span class="meal-price">' + m.price + ' ₽</span>' +
          '<button type="button" class="add-btn" data-add-id="' + m.id + '">' +
            (inCartQty > 0 ? 'В рационе (' + inCartQty + ') +' : '+ В рацион') +
          '</button>' +
        '</div>' +
      '</article>';
    }
    grid.innerHTML = html;
  }

  function renderTrackerAndCart() {
    var totalKcal = 0;
    var totalProtein = 0;
    var totalFat = 0;
    var totalCarbs = 0;
    var totalPrice = 0;

    var cartList = document.getElementById("cartList");
    var cartHtml = "";

    for (var i = 0; i < MEALS.length; i++) {
      var meal = MEALS[i];
      var qty = state.cart[meal.id] || 0;
      if (qty > 0) {
        totalKcal += meal.kcal * qty;
        totalProtein += meal.protein * qty;
        totalFat += meal.fat * qty;
        totalCarbs += meal.carbs * qty;
        totalPrice += meal.price * qty;

        cartHtml += '<div class="cart-item">' +
          '<div>' +
            '<div class="cart-item-title">' + meal.title + '</div>' +
            '<div class="section-desc">' + (meal.kcal * qty) + ' ккал • ' + (meal.price * qty) + ' ₽</div>' +
          '</div>' +
          '<div class="cart-item-controls">' +
            '<button type="button" class="qty-btn" data-dec-id="' + meal.id + '">−</button>' +
            '<span>' + qty + '</span>' +
            '<button type="button" class="qty-btn" data-inc-id="' + meal.id + '">+</button>' +
          '</div>' +
        '</div>';
      }
    }

    if (cartList) {
      cartList.innerHTML = cartHtml || '<p class="section-desc">Ваш дневной рацион пока пуст. Перейдите на страницу «Меню» (catalog.html), чтобы добавить блюда.</p>';
    }

    var kcalLabel = document.getElementById("kcalProgressText");
    if (kcalLabel) {
      kcalLabel.textContent = totalKcal + " / " + state.targetKcal + " ккал";
    }

    var pct = Math.min(100, Math.round((totalKcal / state.targetKcal) * 100));
    var fill = document.getElementById("kcalProgressBar");
    if (fill) {
      fill.style.width = pct + "%";
    }

    var pVal = document.getElementById("macroProtein");
    var fVal = document.getElementById("macroFat");
    var cVal = document.getElementById("macroCarbs");
    var priceEl = document.getElementById("cartTotalPrice");

    if (pVal) pVal.textContent = totalProtein + " г";
    if (fVal) fVal.textContent = totalFat + " г";
    if (cVal) cVal.textContent = totalCarbs + " г";
    if (priceEl) priceEl.textContent = totalPrice + " ₽";
  }

  function initEvents() {
    var themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        state.darkTheme = !state.darkTheme;
        applyTheme();
        saveState();
      });
    }

    var goalBtns = document.querySelectorAll(".goal-btn");
    for (var i = 0; i < goalBtns.length; i++) {
      goalBtns[i].addEventListener("click", function (e) {
        var btn = e.currentTarget;
        var kcal = parseInt(btn.getAttribute("data-kcal"), 10) || 1800;
        state.targetKcal = kcal;
        saveState();
        updateHeaderBadgeAndGoals();
        renderTrackerAndCart();
        showToast("Дневная норма сохранена: " + kcal + " ккал");
      });
    }

    var chipBtns = document.querySelectorAll(".chip-btn");
    for (var k = 0; k < chipBtns.length; k++) {
      chipBtns[k].addEventListener("click", function (e) {
        var btn = e.currentTarget;
        state.activeCategory = btn.getAttribute("data-cat") || "all";
        for (var m = 0; m < chipBtns.length; m++) {
          chipBtns[m].classList.remove("active");
        }
        btn.classList.add("active");
        renderCatalog();
      });
    }

    var searchInput = document.getElementById("catalogSearch");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        state.searchQuery = e.target.value || "";
        renderCatalog();
      });
    }

    document.addEventListener("click", function (e) {
      var addBtn = e.target.closest("[data-add-id]");
      if (addBtn) {
        var id = addBtn.getAttribute("data-add-id");
        state.cart[id] = (state.cart[id] || 0) + 1;
        saveState();
        updateHeaderBadgeAndGoals();
        renderCatalog();
        renderTrackerAndCart();
        showToast("Блюдо добавлено в ваш рацион!");
        return;
      }

      var incBtn = e.target.closest("[data-inc-id]");
      if (incBtn) {
        var incId = incBtn.getAttribute("data-inc-id");
        state.cart[incId] = (state.cart[incId] || 0) + 1;
        saveState();
        updateHeaderBadgeAndGoals();
        renderCatalog();
        renderTrackerAndCart();
        return;
      }

      var decBtn = e.target.closest("[data-dec-id]");
      if (decBtn) {
        var decId = decBtn.getAttribute("data-dec-id");
        if (state.cart[decId] > 1) {
          state.cart[decId] -= 1;
        } else {
          delete state.cart[decId];
        }
        saveState();
        updateHeaderBadgeAndGoals();
        renderCatalog();
        renderTrackerAndCart();
        return;
      }

      var faqBtn = e.target.closest(".faq-question");
      if (faqBtn) {
        var item = faqBtn.closest(".faq-item");
        if (item) item.classList.toggle("open");
      }
    });

    var orderForm = document.getElementById("orderForm");
    if (orderForm) {
      orderForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var nameInput = document.getElementById("customerName");
        var phoneInput = document.getElementById("customerPhone");
        var name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Гость";
        showToast("Заказ для " + name + " принят! Курьер свяжется с вами.");
        if (nameInput) nameInput.value = "";
        if (phoneInput) phoneInput.value = "";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadState();
    applyTheme();
    updateHeaderBadgeAndGoals();
    renderCatalog();
    renderTrackerAndCart();
    initEvents();
  });
})();
