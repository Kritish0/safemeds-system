let schedules = [];
let currentAlert = null;

function login() {
  const companyId = document.getElementById("companyId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!companyId || !password) {
    alert("Please enter Company ID / Staff ID and password.");
    return;
  }

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").classList.remove("hidden");
}

function addSchedule() {
  const name = document.getElementById("patientName").value.trim();
  const med = document.getElementById("medication").value.trim();
  const time = document.getElementById("medTime").value;
  const alertType = document.getElementById("alertType").value;

  if (!name || !med || !time) {
    alert("Please fill all fields");
    return;
  }

  const schedule = { name, med, time, alertType };
  schedules.push(schedule);

  displaySchedules();
  triggerAlert(schedule);

  document.getElementById("patientName").value = "";
  document.getElementById("medication").value = "";
  document.getElementById("medTime").value = "";
}

function displaySchedules() {
  const list = document.getElementById("scheduleList");
  list.innerHTML = "";

  schedules.forEach((s) => {
    const li = document.createElement("li");
    li.innerText = `${s.med} for ${s.name} at ${s.time} (${s.alertType})`;
    list.appendChild(li);
  });
}

function triggerAlert(schedule) {
  currentAlert = schedule;
  document.getElementById("alertBox").innerText =
    `🔔 ${schedule.med} for ${schedule.name} at ${schedule.time}`;
}

function takeDose() {
  if (!currentAlert) return;

  logAction(`✅ Taken: ${currentAlert.med} for ${currentAlert.name}`);
  document.getElementById("alertBox").innerText = "No active alerts";
  currentAlert = null;
}

function missDose() {
  if (!currentAlert) return;

  logAction(`❌ Missed: ${currentAlert.med} for ${currentAlert.name} (Caregiver notified)`);
  document.getElementById("alertBox").innerText = "No active alerts";
  currentAlert = null;
}

function logAction(text) {
  const li = document.createElement("li");
  li.innerText = text;
  document.getElementById("logList").appendChild(li);
}
