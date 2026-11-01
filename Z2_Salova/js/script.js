const IS_DEBUG_1 = true;
const IS_DEBUG_2 = true;
const IS_DEBUG_3 = true;
const PROXY_URL = '';
const REST_URL_1 = 'https://restauracia.sk/denne-menu';
const REST_URL_2 = 'https://www.jedalen.stuba.sk/webkredit/Ordering/Menu?canteen=3';
const REST_URL_3 = 'http://www.freefood.sk/menu/#fiit-food';


const LOCAL_PATH_1 = 'local_pages/eatAndMeat.html';
const LOCAL_PATH_2 = 'local_pages/fei.html';
const LOCAL_PATH_3 = 'local_pages/FreeFood.html';

const STORAGE_KEY_1 = 'eatMeat_html';
const STORAGE_KEY_2 = 'fei_html';
const STORAGE_KEY_3 = 'fiit_html';
const STORAGE_KEY_TIME = 'menu_last_updated';
const STORAGE_KEY_DATE = 'menu_last_updated_date';

const DAYS_MAP = {
  1: 'Pondelok',
  2: 'Utorok',
  3: 'Streda',
  4: 'Štvrtok',
  5: 'Piatok'
};

let eatMeatDoc = null;
let feiDoc = null;
let fiitDoc = null;

$(document).ready(() => {
    loadAndProcessMenu();
    setupDayTabs();
    setupRefreshButton();
    setupDeleteButton();
    setupRestaurantFilters();
});

function setupRefreshButton() {
    $('.refresh-btn').on('click', () => {
        loadAndProcessMenu(true);
    });
}



// delete data
function setupDeleteButton() {
    $('.delete-btn').on('click', () => {
        localStorage.removeItem(STORAGE_KEY_1);
        localStorage.removeItem(STORAGE_KEY_2);
        localStorage.removeItem(STORAGE_KEY_3);
        localStorage.removeItem(STORAGE_KEY_TIME);
        localStorage.removeItem(STORAGE_KEY_DATE);

        eatMeatDoc = null;
        feiDoc = null;
        fiitDoc = null;

        $('.refresh-time').text('Vymazané');
        $('#menu-restaurant-1, #menu-restaurant-2, #menu-restaurant-3').empty().html('<li class="dish-card"><p>Dáta boli vymazané. Kliknite na "Aktualizovať menu".</p></li>');
    });
}
// delete data


// update
function updateRefreshDisplay() {
    const savedTime = localStorage.getItem(STORAGE_KEY_TIME);
    if (!savedTime) {
        $('.refresh-time').text('Neuvedené');
        return;
    }
    $('.refresh-time').text(savedTime);
}
// update


// what day is today
function isDataFromToday() {
    const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
    const today = new Date().toISOString().split('T')[0];
    return savedDate === today;
}
// what day is today


// set active
function setActiveTab(dayId) {
  const containerIds = ['#eat-meat', '#fei', '#fiit'];

  if (dayId == 0 || dayId == 6) {
    dayId = 6;
  }

  containerIds.forEach(id => {
    const $container = $(id);
    if (!$container.length) return;

    $container.find('a.active').removeClass('active');
    $container.find(`a[href="#day-${dayId}"]`).addClass('active');
  });
}
// set active


// download
async function fetchPage(fetchUrl) {
    try {
        const data = await $.get(fetchUrl);
        return typeof data === 'string' ? data : new XMLSerializer().serializeToString(data);
    } catch (err) {
        console.error(`Chyba pri načítaní ${fetchUrl}:`, err);
        return null;
    }
}
// download


// Main Menu Loader & Controller
async function loadAndProcessMenu(forceFetch = false) {
  let htmlText1 = localStorage.getItem(STORAGE_KEY_1);
  let htmlText2 = localStorage.getItem(STORAGE_KEY_2);
  let htmlText3 = localStorage.getItem(STORAGE_KEY_3);

  const needsFetch = forceFetch || !isDataFromToday() || !htmlText1 || !htmlText2 || !htmlText3;

  if (needsFetch) {
    $('#loading-spinner').show();
    await new Promise(resolve => setTimeout(resolve, 800));

    const fetchUrl1 = IS_DEBUG_1 ? LOCAL_PATH_1 : PROXY_URL + encodeURIComponent(REST_URL_1);
    const fetchUrl2 = IS_DEBUG_2 ? LOCAL_PATH_2 : PROXY_URL + encodeURIComponent(REST_URL_2);
    const fetchUrl3 = IS_DEBUG_3 ? LOCAL_PATH_3 : PROXY_URL + encodeURIComponent(REST_URL_3);

    const [res1, res2, res3] = await Promise.all([
      fetchPage(fetchUrl1),
      fetchPage(fetchUrl2),
      fetchPage(fetchUrl3)
    ]);

    if (res1) {
      htmlText1 = res1; localStorage.setItem(STORAGE_KEY_1, htmlText1); 
    }
    if (res2) { 
      htmlText2 = res2; localStorage.setItem(STORAGE_KEY_2, htmlText2); 
    }
    if (res3) { 
      htmlText3 = res3; localStorage.setItem(STORAGE_KEY_3, htmlText3); 
    }

    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('sk-SK')} ${now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}`;
    const todayDate = now.toISOString().split('T')[0];

    localStorage.setItem(STORAGE_KEY_TIME, formattedTime);
    localStorage.setItem(STORAGE_KEY_DATE, todayDate);

    $('#loading-spinner').hide();
  }

  updateRefreshDisplay();

  const parser = new DOMParser();
  eatMeatDoc = htmlText1 ? parser.parseFromString(htmlText1, 'text/html') : null;
  feiDoc = htmlText2 ? parser.parseFromString(htmlText2, 'text/html') : null;
  fiitDoc = htmlText3 ? parser.parseFromString(htmlText3, 'text/html') : null;

  const today = new Date();
  const defaultDayId = today.getDay();
  
  setActiveTab(defaultDayId);
  renderDayMenu1(defaultDayId);
  renderDayMenu2(defaultDayId);
  renderDayMenu3(defaultDayId);
}
// Main Menu Loader & Controller


// Setup Day Tab Listeners
function setupDayTabs() {
  const selectors = ['#eat-meat', '#fei', '#fiit'];

  selectors.forEach(selector => {
    $(selector).on('click', 'a', function(event) {
      event.preventDefault();

      const $link = $(this);
      const dayId = $link.attr('href').replace(/\D/g, '');

      $(selector).find('a').removeClass('active');
      $link.addClass('active');

      renderDayMenu1(dayId);
      renderDayMenu2(dayId);
      renderDayMenu3(dayId);
    });
  });
}
// Setup Day Tab Listeners


// Eat meat parse single day
function renderEatMeatSingleDay(d, container, showDayHeader = false) {
  if (!eatMeatDoc){
    return false;
  } 
  const dayPanel = eatMeatDoc.querySelector(`#day-${d}`);
  if (!dayPanel) {
    return false;
  } 

  const menuItems = dayPanel.querySelectorAll('.menu-body');
  if (menuItems.length === 0) {
    return false;
  } 

  const $container = $(container);

  if (showDayHeader) {
    const $header = $(`
      <li class="day-header-wrapper">
        <h4 class="day-title-header">${DAYS_MAP[d]}</h4>
      </li>
    `);
    $container.append($header);
  }

  menuItems.forEach(item => {
    const category = item.querySelector('.menu-title h4')?.textContent.trim() || '';
    const rawPrice = item.querySelector('.price')?.textContent.trim() || '';
    const description = item.querySelector('.menu-description .desc')?.textContent.trim() || '';
    const price = rawPrice.replace(/\s+/g, ' ');

    const $li = $(`
      <li class="dish-card">
        <h5>${category}</h5>
        <p>${description}</p>
        <p class="badge-price">${price}</p>
      </li>
    `);

    $container.append($li);
  });

  return true;
}
// Eat meat parse single day


// FEI parse single day
function renderFeiSingleDay(d, container, showDayHeader = false) {
  if (!feiDoc) return false;
  const targetDayName = DAYS_MAP[d].toLowerCase();
  const rows = Array.from(feiDoc.querySelectorAll('table tbody tr'));
  let isTargetDay = false;
  let currentCategory = '';
  const dishes = [];

  rows.forEach(row => {
    if (row.classList.contains('table-active')) {
      const headerText = row.textContent.toLowerCase().trim();
      if (headerText.includes(targetDayName)) {
        isTargetDay = true;
        currentCategory = row.textContent.trim().split('-')[0].trim();
      } else {
        isTargetDay = false;
      }
      return;
    }

    if (currentCategory === 'Raňajky' || currentCategory === 'Pizza' || currentCategory === 'Doplnky k R a M'
      || currentCategory === 'Doplňky k HJ' || currentCategory === 'Minútky' || currentCategory === 'Prílohy k M'
    ) {
      return;
    }

    if (isTargetDay) {
      const nameEl = row.querySelector('td.text-wrap span[lang="sk"]') || row.querySelector('td.text-wrap');
      const description = nameEl ? nameEl.textContent.trim().replace(/\s+/g, ' ') : '';
      if (!description) return;

      const badge = row.querySelector('.badge')?.textContent.trim() || '';
      const categoryTitle = badge ? `${currentCategory} ${badge}` : currentCategory;
      const price = row.querySelector('td.text-right')?.textContent.trim().replace(/\s+/g, ' ') || '';

      dishes.push({ categoryTitle, description, price });
    }
  });

  if (dishes.length === 0) return false;

  const $container = $(container);

  if (showDayHeader) {
    const $header = $(`
      <li class="day-header-wrapper">
        <h4 class="day-title-header">${DAYS_MAP[d]}</h4>
      </li>
    `);
    $container.append($header);
  }

  dishes.forEach(dish => {
    const $li = $(`
      <li class="dish-card">
        <h5>${dish.categoryTitle}</h5>
        <p>${dish.description}</p>
        <p class="badge-price">${dish.price}</p>
      </li>
    `);
    $container.append($li);
  });

  return true;
}
// FEI parse single day


// FIIT parse single day
function renderFiitSingleDay(d, container, showDayHeader = false) {
  if (!fiitDoc) return false;
  const targetDayName = DAYS_MAP[d].toLowerCase();
  const dayElements = fiitDoc.querySelectorAll('.day-title');
  let targetDayPanel = null;

  dayElements.forEach(element => {
    const text = element.textContent.toLowerCase().trim();
    if (text.startsWith(targetDayName)) {
      targetDayPanel = element.closest('li') || element.parentNode;
    }
  });

  if (!targetDayPanel) return false;

  const menuItems = targetDayPanel.querySelectorAll('.day-offer li');
  if (menuItems.length === 0) return false;

  const $container = $(container);

  if (showDayHeader) {
    const $header = $(`
      <li class="day-header-wrapper">
        <h4 class="day-title-header">${DAYS_MAP[d]}</h4>
      </li>
    `);
    $container.append($header);
  }

  menuItems.forEach(item => {
    let category = item.querySelector('.brand:not(.price)')?.textContent.trim() || '';
    const rawPrice = item.querySelector('.price')?.textContent.trim() || '';
    const price = rawPrice.replace(/\s+/g, ' ');

    const clone = item.cloneNode(true);
    clone.querySelector('.price')?.remove();
    
    let description = clone.textContent.trim();
    if (category && description.startsWith(category)) {
      description = description.slice(category.length).trim();
    }

    if (category === 'P.') category = 'Polievka';
    else if (category === '1.') category = 'MENU 1';
    else if (category === '2.') category = 'MENU 2';
    else if (category === '3.') category = 'MENU 3';

    const $li = $(`
      <li class="dish-card">
        <h5>${category}</h5>
        <p>${description}</p>
        <p class="badge-price">${price}</p>
      </li>
    `);
    $container.append($li);
  });

  return true;
}
// FIIT parse single day


// Setup restaurant filters
function renderDayMenu1(dayId) {
  const $myContainer = $('#menu-restaurant-1');
  if (!$myContainer.length) return;
  $myContainer.empty();

  if (!eatMeatDoc) {
    $myContainer.html('<li class="dish-card"><p>Menu pre túto reštauráciu nie je k dispozícii.</p></li>');
    return;
  }

  if (dayId == 0 || dayId == 6) {
    let foundAny = false;
    for (let d = 1; d <= 5; d++) {
      if (renderEatMeatSingleDay(d, $myContainer[0], true)) {
        foundAny = true;
      }
    }
    if (!foundAny) {
      $myContainer.text('Na tento týždeň sa nenašlo žiadne menu.');
    }
  } else {
    const found = renderEatMeatSingleDay(dayId, $myContainer[0], false);
    if (!found) {
      $myContainer.text('Na tento deň sa nenašlo žiadne menu.');
    }
  }
}

function renderDayMenu2(dayId) {
  const $myContainer = $('#menu-restaurant-2');
  if (!$myContainer.length) return;
  $myContainer.empty();

  if (!feiDoc) {
    $myContainer.html('<li class="dish-card"><p>Menu pre túto reštauráciu nie je k dispozícii.</p></li>');
    return;
  }

  if (dayId == 0 || dayId == 6) {
    let foundAny = false;
    for (let d = 1; d <= 5; d++) {
      if (renderFeiSingleDay(d, $myContainer[0], true)) {
        foundAny = true;
      }
    }
    if (!foundAny) {
      $myContainer.text('Na tento týždeň sa nenašlo žiadne menu.');
    }
  } else {
    const found = renderFeiSingleDay(dayId, $myContainer[0], false);
    if (!found) {
      $myContainer.text('Na tento deň sa nenašlo žiadne menu.');
    }
  }
}

function renderDayMenu3(dayId) {
  const $myContainer = $('#menu-restaurant-3');
  if (!$myContainer.length) return;
  $myContainer.empty();

  if (!fiitDoc) {
    $myContainer.html('<li class="dish-card"><p>Menu pre túto reštauráciu nie je k dispozícii.</p></li>');
    return;
  }

  if (dayId == 0 || dayId == 6) {
    let foundAny = false;
    for (let d = 1; d <= 5; d++) {
      if (renderFiitSingleDay(d, $myContainer[0], true)) {
        foundAny = true;
      }
    }
    if (!foundAny) {
      $myContainer.text('Na tento týždeň sa nenašlo žiadne menu.');
    }
  } else {
    const found = renderFiitSingleDay(dayId, $myContainer[0], false);
    if (!found) {
      $myContainer.text('Na tento deň sa nenašlo žiadne menu.');
    }
  }
}

function setupRestaurantFilters() {
    const filters = [
        { checkboxId: '#filter-eat-meat', sectionId: '#eat-meat', storageKey: 'filter_show_eat_meat' },
        { checkboxId: '#filter-fei', sectionId: '#fei', storageKey: 'filter_show_fei' },
        { checkboxId: '#filter-fiit', sectionId: '#fiit', storageKey: 'filter_show_fiit' }
    ];

    filters.forEach(({ checkboxId, sectionId, storageKey }) => {
        const $checkbox = $(checkboxId);
        const $section = $(sectionId);

        if (!$checkbox.length || !$section.length) return;

        const savedState = localStorage.getItem(storageKey);
        if (savedState !== null) {
            const isVisible = savedState === 'true';
            $checkbox.prop('checked', isVisible);
            $section.toggle(isVisible);
        }

        $checkbox.on('change', function() {
            const isVisible = $(this).is(':checked');
            $section.stop(true, true).slideToggle(isVisible);
            localStorage.setItem(storageKey, isVisible);
        });
    });
}