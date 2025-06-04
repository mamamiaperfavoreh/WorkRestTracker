let workTime = 0;
let restTime = 0;
let workInterval;
let restInterval;
let isWorking = false;
let currentSession = null;
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let currentDate = new Date().toLocaleDateString();

const workTimeDisplay = document.getElementById('work-time');
const restTimeDisplay = document.getElementById('rest-time');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const finishBtn = document.getElementById('finish-btn');
const todayDateDisplay = document.getElementById('today-date');
const totalWorkDisplay = document.getElementById('total-work');
const totalRestDisplay = document.getElementById('total-rest');
const sessionBody = document.getElementById('session-body');

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function checkNewDay() {
  const today = new Date().toLocaleDateString();
  if (today !== currentDate) {
    // New day detected
    if (currentSession) {
      saveSession();
      resetTimers();
    }
    currentDate = today;
    updateDailySummary();
  }
}

function updateWorkTime() {
  checkNewDay();
  workTime++;
  workTimeDisplay.textContent = `Work: ${formatTime(workTime)}`;
  updateDailySummary();
}

function updateRestTime() {
  checkNewDay();
  restTime++;
  restTimeDisplay.textContent = `Rest: ${formatTime(restTime)}`;
  updateDailySummary();
}

function updateDailySummary() {
  const today = new Date().toLocaleDateString();
  const todaySessions = sessions.filter(session => session.date === today);
  
  let totalWork = workTime;
  let totalRest = restTime;
  
  todaySessions.forEach(session => {
    totalWork += session.workDuration;
    totalRest += session.restDuration;
  });

  todayDateDisplay.textContent = `Today (${today})`;
  totalWorkDisplay.textContent = `Total Work: ${formatTime(totalWork)}`;
  totalRestDisplay.textContent = `Total Rest: ${formatTime(totalRest)}`;
}

function startWork() {
  checkNewDay();
  if (!isWorking) {
    isWorking = true;
    if (!currentSession) {
      currentSession = {
        date: new Date().toLocaleDateString(),
        startTime: new Date().toLocaleTimeString(),
        workDuration: 0,
        restDuration: 0,
        endTime: null
      };
    }
    workInterval = setInterval(updateWorkTime, 1000);
    if (restInterval) clearInterval(restInterval);
    updateDailySummary();
  }
}

function pauseWork() {
  if (isWorking) {
    isWorking = false;
    clearInterval(workInterval);
    restInterval = setInterval(updateRestTime, 1000);
    updateDailySummary();
  }
}

function finishWorkDay() {
  if (currentSession) {
    saveSession();
    resetTimers();
    updateDailySummary();
    updateSessionTable();
  }
}

function saveSession() {
  if (currentSession) {
    currentSession.endTime = new Date().toLocaleTimeString();
    currentSession.workDuration = workTime;
    currentSession.restDuration = restTime;
    sessions.push(currentSession);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    currentSession = null;
  }
}

function resetTimers() {
  workTime = 0;
  restTime = 0;
  workTimeDisplay.textContent = `Work: ${formatTime(workTime)}`;
  restTimeDisplay.textContent = `Rest: ${formatTime(restTime)}`;
  clearInterval(workInterval);
  clearInterval(restInterval);
  isWorking = false;
}

function updateSessionTable() {
  sessionBody.innerHTML = sessions.map(session => `
    <tr>
      <td>${session.date}</td>
      <td>${session.startTime}</td>
      <td>${session.endTime}</td>
      <td>${formatTime(session.workDuration)}</td>
      <td>${formatTime(session.restDuration)}</td>
    </tr>
  `).join('');
}

playBtn.addEventListener('click', startWork);
pauseBtn.addEventListener('click', pauseWork);
finishBtn.addEventListener('click', finishWorkDay);

window.addEventListener('beforeunload', () => {
  if (currentSession) {
    saveSession();
  }
});

// Initialize
updateDailySummary();
updateSessionTable();

// Check for new day periodically
setInterval(checkNewDay, 60000); // Check every minute
#Fuck You