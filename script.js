let schedules = JSON.parse(localStorage.getItem("safemedsSchedules")) || [];
let logs = JSON.parse(localStorage.getItem("safemedsLogs")) || [];
let currentAlert = JSON.parse(localStorage.getItem("safemedsCurrentAlert")) || null;
let logCount = logs.length;
let alertSoundPlayedFor = null;

function saveData() {
  localStorage.setItem("safemedsSchedules", JSON.stringify(schedules));
  localStorage.setItem("safemedsLogs", JSON.stringify(logs));
  localStorage.setItem("safemedsCurrentAlert", JSON.stringify(currentAlert));
}

function login() {
  const companyId = document.getElementById("companyId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!companyId || !password) {
    alert("Please enter Company ID / Staff ID and password.");
    return;
  }

  localStorage.setItem("safemedsLoggedIn", "true");
  localStorage.setItem("safemedsUser", companyId);

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("appPage").classList.remove("hidden");
  document.getElementById("welcomeText").innerText = `Welcome back, ${companyId}`;

  renderSchedules();
  renderLogs();
  renderAlert();
  updateSummary();
}

function logout() {
  localStorage.removeItem("safemedsLoggedIn");
  localStorage.removeItem("safemedsUser");

  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("companyId").value = "";
  document.getElementById("password").value = "";
}

function restoreLogin() {
  const loggedIn = localStorage.getItem("safemedsLoggedIn");
  const user = localStorage.getItem("safemedsUser");

  if (loggedIn === "true" && user) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    document.getElementById("welcomeText").innerText = `Welcome back, ${user}`;
  }
}

function changeTheme() {
  const selectedTheme = document.getElementById("themeSelector").value;
  document.body.className = selectedTheme;
  localStorage.setItem("safemedsTheme", selectedTheme);
}

function restoreTheme() {
  const savedTheme = localStorage.getItem("safemedsTheme") || "theme-blue";
  document.body.className = savedTheme;
  const selector = document.getElementById("themeSelector");
  if (selector) selector.value = savedTheme;
}

function addSchedule() {
  const name = document.getElementById("patientName").value.trim();
  const med = document.getElementById("medication").value.trim();
  const dosage = document.getElementById("dosage").value.trim();
  const time = document.getElementById("medTime").value;
  const alertType = document.getElementById("alertType").value;
  const notes = document.getElementById("notes").value.trim();

  if (!name || !med || !dosage || !time) {
    alert("Please fill all required fields.");
    return;
  }

  const schedule = {
    id: Date.now(),
    name,
    med,
    dosage,
    time,
    alertType,
    notes,
    status: "Scheduled",
    lastTriggeredDate: null
  };

  schedules.push(schedule);
  saveData();
  renderSchedules();
  updateSummary();

  document.getElementById("patientName").value = "";
  document.getElementById("medication").value = "";
  document.getElementById("dosage").value = "";
  document.getElementById("medTime").value = "";
  document.getElementById("notes").value = "";

  logAction(`➕ Added schedule: ${med} for ${name} at ${time}`);
}

function deleteSchedule(id) {
  const schedule = schedules.find(item => item.id === id);
  schedules = schedules.filter(item => item.id !== id);

  if (currentAlert && currentAlert.id === id) {
    currentAlert = null;
  }

  saveData();
  renderSchedules();
  renderAlert();
  updateSummary();

  if (schedule) {
    logAction(`🗑️ Deleted schedule: ${schedule.med} for ${schedule.name}`);
  }
}

function renderSchedules() {
  const list = document.getElementById("scheduleList");
  list.innerHTML = "";

  if (schedules.length === 0) {
    list.innerHTML = `<li class="empty-item">No medication schedules added yet.</li>`;
    return;
  }

  schedules.forEach((s, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="schedule-item-top">
        <div>
          <strong>${index + 1}. ${s.med}</strong>
          Patient: ${s.name}<br>
          Dosage: ${s.dosage}<br>
          Time: ${s.time}<br>
          Alert: ${s.alertType}<br>
          Notes: ${s.notes || "No notes"}<br>
          Status: ${s.status}
        </div>
        <button class="delete-btn" onclick="deleteSchedule(${s.id})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function triggerAlert(schedule) {
  currentAlert = schedule;
  saveData();
  renderAlert();
  updateSummary();

  const todayKey = `${schedule.id}-${new Date().toDateString()}`;
  if (alertSoundPlayedFor !== todayKey) {
    playAlertSound();
    alertSoundPlayedFor = todayKey;
  }
}

function renderAlert() {
  const alertBox = document.getElementById("alertBox");
  if (!alertBox) return;

  if (!currentAlert) {
    alertBox.classList.remove("active-alert");
    alertBox.classList.add("idle-alert");
    alertBox.innerText = "No active alerts";
    return;
  }

  alertBox.classList.remove("idle-alert");
  alertBox.classList.add("active-alert");
  alertBox.innerText = `🔔 Dose Due: ${currentAlert.med} for ${currentAlert.name} at ${currentAlert.time} (${currentAlert.alertType} alert)`;
}

function takeDose() {
  if (!currentAlert) {
    alert("There is no active alert right now.");
    return;
  }

  updateScheduleStatus(currentAlert.id, "Taken");
  logAction(`✅ Taken: ${currentAlert.med} for ${currentAlert.name} at ${currentAlert.time}`);
  clearAlert();
}

function missDose() {
  if (!currentAlert) {
    alert("There is no active alert right now.");
    return;
  }

  updateScheduleStatus(currentAlert.id, "Missed");
  logAction(`❌ Missed: ${currentAlert.med} for ${currentAlert.name} at ${currentAlert.time} — Caregiver Notified`);
  clearAlert();
}

function clearAlert() {
  currentAlert = null;
  saveData();
  renderAlert();
  updateSummary();
}

function updateScheduleStatus(id, status) {
  const item = schedules.find(schedule => schedule.id === id);
  if (item) {
    item.status = status;
    saveData();
    renderSchedules();
  }
}

function logAction(text) {
  logs.unshift(text);
  logCount = logs.length;
  saveData();
  renderLogs();
  updateSummary();
}

function renderLogs() {
  const logList = document.getElementById("logList");
  if (!logList) return;

  logList.innerHTML = "";

  if (logs.length === 0) {
    logList.innerHTML = `<li class="empty-item">No activity recorded yet.</li>`;
    return;
  }

  logs.forEach(log => {
    const li = document.createElement("li");
    li.innerText = log;
    logList.appendChild(li);
  });
}

function updateSummary() {
  document.getElementById("totalSchedules").innerText = schedules.length;
  document.getElementById("activeAlertStatus").innerText = currentAlert ? "Active" : "None";
  document.getElementById("totalLogs").innerText = logs.length;

  const uniquePatients = new Set(schedules.map(item => item.name.toLowerCase()));
  document.getElementById("totalPatients").innerText = uniquePatients.size;
}

function playAlertSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
  } catch (error) {
    console.log("Audio could not play:", error);
  }
}

function checkRealTimeAlerts() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toDateString();

  const dueSchedule = schedules.find(schedule => {
    return schedule.time === currentTime && schedule.lastTriggeredDate !== today;
  });

  if (dueSchedule) {
    dueSchedule.lastTriggeredDate = today;
    dueSchedule.status = "Due Now";
    triggerAlert(dueSchedule);
    saveData();
    renderSchedules();
    logAction(`🔔 Alert triggered: ${dueSchedule.med} for ${dueSchedule.name} at ${dueSchedule.time}`);
  }
}

restoreTheme();
restoreLogin();
renderSchedules();
renderLogs();
renderAlert();
updateSummary();
checkRealTimeAlerts();
setInterval(checkRealTimeAlerts, 30000);
