const test = new Date("2026-12-18T11:50:00");
const today = new Date();
const SEMESTER_START = new Date("2026-09-14T00:00:00");
const SEMESTER_END = new Date("2026-12-14T00:00:00");



// progress bar
const SEMESTER_TIME = SEMESTER_END - SEMESTER_START;
const elapsedTime = today - SEMESTER_START;

let percentage = (elapsedTime / SEMESTER_TIME) * 100;
percentage = Math.max(0, Math.min(100, percentage));

const roundedValue = percentage.toFixed(1);

const progressBar = document.getElementById('semester-progress');
const progressText = document.getElementById('progress-text');

progressBar.value = roundedValue;
if (roundedValue <= 0) {
  progressText.textContent = 'Semester nezacal sa';
}
else if (roundedValue < 100) {
  progressText.textContent = roundedValue + '%';
}
else {
  progressText.textContent = 'Semester sa skoncil';
}
// progress bar



// today is ?
const options = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};
const formattedDateTime = today.toLocaleString('sk-SK', options);

document.getElementById('current-date').textContent = formattedDateTime;
// today is ?



// actual day and time

const actualDay = today.getDay();
const actualHour = today.getHours();
const actualMinute = today.getMinutes();

const targetBlock = (actualHour - 7) * 4 + Math.floor(actualMinute / 15);
let currentRow = document.querySelector(`table tr:nth-child(${2*actualDay})`);

const statusDay = document.getElementById('status');
//statusDay.textContent = `${actualDay}`;

if (roundedValue <= 0) {
  statusDay.textContent = `Semester sa začina - ${SEMESTER_START.toLocaleString('sk-SK', options)}`;
}
else if (roundedValue >= 100) {
  statusDay.textContent = `Semester sa skončil - ${SEMESTER_END.toLocaleString('sk-SK', options)}`;
}
else {
  if (actualDay >= 1 && actualDay <= 5) {
    let accumulatedBlocks = 0;
    let statusWindow = false;
    let window = null;

    const cells = currentRow.querySelectorAll('td');

    for (const [index, cell] of cells.entries()) {
      if (index == 0) {
        continue;
      }

      const colspan = parseInt(cell.getAttribute('colspan') || 1, 10);

      const startBlock = accumulatedBlocks;
      const endBlock = accumulatedBlocks + colspan;

      if (actualHour < 7) {
        statusWindow = true;
      }

      if (targetBlock >= startBlock && targetBlock < endBlock) {
        const subjectName = cell.textContent.trim();
        
        if (subjectName !== '') {
          cell.classList.add('active-subject');
          statusDay.textContent = `Teraz je ${subjectName}`;
          window = 1;
          break;
        }
        else {
          statusWindow = true;
        }
      }

      else if (targetBlock < endBlock && statusWindow) {
        const subjectNextName = cell.textContent.trim();
        if (subjectNextName !== '') {
          window = 1;
          const NextСlassHour = 7 + Math.floor(startBlock / 4)
          const NextClassMinute = (startBlock % 4) * 15;
          const NextClassMinuteStr = String(NextClassMinute).padStart(2, '0')
          statusDay.textContent = `Nasledujúca hodina je ${subjectNextName} o ${NextСlassHour}:${NextClassMinuteStr}`;
          break;
        }
      }
      

      accumulatedBlocks += colspan;
    }
    if (!window) {
        statusDay.textContent = 'Dnes už je voľno';
    }
  } 
  else {
    statusDay.textContent = 'Dnes je víkend!';
  }
}
// actual day and time



// filter
const buttons = document.querySelectorAll('.item-button button');
const items = document.querySelectorAll('.lecture, .exercise, .culture');

items.forEach(item => {
  if (roundedValue <= 0 || roundedValue >= 100) {
    item.classList.add('hidden-cell');
  }
});

buttons.forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.item-button button.active').classList.remove('active');
    button.classList.add('active');

    

    const filterAttr = button.getAttribute('data-filter');

    items.forEach(item => {
      if (roundedValue <= 0 || roundedValue >= 100) {
        item.classList.add('hidden-cell');
        return;
      }


      if (filterAttr === 'all') {
        item.classList.remove('hidden-cell');
        return;
      }
      const filters = filterAttr.split(' ');
      const hasMatch = filters.some(className => item.classList.contains(className));

      if (hasMatch) {
        item.classList.remove('hidden-cell');
      } 
      else {
        item.classList.add('hidden-cell');
      }
    });
  });
});
// filter



// map

// map