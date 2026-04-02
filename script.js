let schedules = [];
let currentAlert = null;
let logCount = 0;

function login() {
  const companyId = document.getElementById("companyId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!companyId || !password) {
    alert("Please enter Company ID / Staff ID and password.");
    return;
  }

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("appPage").classList.remove("hidden");
  document.getElementById("welcomeText").innerText = `Welcome back, ${companyId}`;
}

function logout() {
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("companyId").value = "";
  document.getElementById("password").value = "";
}

function changeTheme() {
  const selectedTheme = document.getElementById("themeSelector").value;
  document.body.className = selectedTheme;
}

function addSchedule() {
  const name = document.getElementById("patientName").value.trim();
  const med = document.getElementById("medication").value.trim();
  const time = document.getElementById("medTime").value;
  const alertType = document.getElementById("alertType").value;

  if (!name || !med || !time) {
    alert("Please fill all fields.");
    return;
  }

  const schedule = { name, med, time, alertType };
  schedules.push(schedule);

  renderSchedules();
  triggerAlert(schedule);

  document.getElementById("patientName").value = "";
  document.getElementById("medication").value = "";
  document.getElementById("medTime").value = "";

  updateSummary();
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
      <strong>${index + 1}. ${s.med}</strong><br>
      Patient: ${s.name}<br>
      Time: ${s.time}<br>
      Alert: ${s.alertType}
    `;
    list.appendChild(li);
  });
}

function triggerAlert(schedule) {
  currentAlert = schedule;

  const alertBox = document.getElementById("alertBox");
  alertBox.classList.remove("idle-alert");
  alertBox.classList.add("active-alert");
  alertBox.innerText = `🔔 Dose Due: ${schedule.med} for ${schedule.name} at ${schedule.time} (${schedule.alertType} alert)`;

  updateSummary();
}

function takeDose() {
  if (!currentAlert) {
    alert("There is no active alert right now.");
    return;
  }

  logAction(`✅ Taken: ${currentAlert.med} for ${currentAlert.name} at ${currentAlert.time}`);
  clearAlert();
}

function missDose() {
  if (!currentAlert) {
    alert("There is no active alert right now.");
    return;
  }

  logAction(`❌ Missed: ${currentAlert.med} for ${currentAlert.name} at ${currentAlert.time} — Caregiver Notified`);
  clearAlert();
}

function clearAlert() {
  currentAlert = null;

  const alertBox = document.getElementById("alertBox");
  alertBox.classList.remove("active-alert");
  alertBox.classList.add("idle-alert");
  alertBox.innerText = "No active alerts";

  updateSummary();
}

function logAction(text) {
  const li = document.createElement("li");
  li.innerText = text;
  document.getElementById("logList").prepend(li);
  logCount++;
  updateSummary();
}

function updateSummary() {
  document.getElementById("totalSchedules").innerText = schedules.length;
  document.getElementById("activeAlertStatus").innerText = currentAlert ? "Active" : "None";
  document.getElementById("totalLogs").innerText = logCount;
}

renderSchedules();
updateSummary();
