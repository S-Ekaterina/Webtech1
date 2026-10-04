const a = new Date("2026-10-14T17:59:00");
const d = new Date();
const SEMESTER_START = new Date("2026-09-14");
const SEMESTER_END = new Date("2026-12-14");


// progress bar
const SEMESTER_TIME = SEMESTER_END - SEMESTER_START;
const elapsedTime = d - SEMESTER_START;

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
const formattedDateTime = d.toLocaleString('sk-SK', options);

document.getElementById('current-date').textContent = formattedDateTime;
// today is ?


// actual day and time

const actualDay = d.getDay();
const actualHour = d.getHours();
const actualMinute = d.getMinutes();

const targetBlock = (actualHour - 7) * 4 + Math.floor(actualMinute / 15);
let currentRow = document.querySelector(`table tr:nth-child(${2*actualDay})`);

const statusDay = document.getElementById('status');
//statusDay.textContent = `${actualDay}`;


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
// actual day and time


// filter
const buttons = document.querySelectorAll('.item-button button');
const items = document.querySelectorAll('.lecture, .exercise, .culture');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.item-button button.active').classList.remove('active');
        button.classList.add('active');

        const filterAttr = button.getAttribute('data-filter');

        items.forEach(item => {
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