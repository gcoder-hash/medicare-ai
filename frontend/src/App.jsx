import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Bell,
  Check,
  ChevronRight,
  Droplets,
  HeartPulse,
  History,
  Home,
  Info,
  Moon,
  Pill,
  Plus,
  Settings,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import "./App.css";
import { subscribeToPush } from "./pushNotifications";

import {
  getMedicines,
  markMedicineTaken,
  markMedicineSkipped,
  analyzeSymptoms,
  addMedicine,
  addWater,
  getWaterToday,
  getMedicineHistory,
  updateMedicine,
  deleteMedicine,
  getWaterHistory,
  getDueMedicines,
 getProfile,
getSymptomHistory,
savePushSubscription,
} from "./api";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("darkMode") === "true";
});
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setIsLoggedIn(false);
  }
}, []);
useEffect(() => {
  localStorage.setItem("darkMode", String(darkMode));
}, [darkMode]);
useEffect(() => {
  if (isLoggedIn) {
    getProfile()
     .then((profile) => {
  setAuthName(profile.name);
  setProfileEmail(profile.email);
})
      .catch(() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setAuthName("");
      });

    loadMedicines();
    loadWater();
    loadMedicineHistory();
    loadWaterHistory();
loadSymptomHistory();
  }
}, [isLoggedIn]);
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service worker registered:", registration.scope);
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  }
}, []);
const [showRegister, setShowRegister] = useState(false);
const [showAuthPage, setShowAuthPage] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [showHelp, setShowHelp] = useState(false);

const [authName, setAuthName] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [profileEmail, setProfileEmail] = useState("");
const [authError, setAuthError] = useState("");
  const [medicines, setMedicines] = useState([]);
const [showMedicines, setShowMedicines] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const [medicineHistory, setMedicineHistory] = useState([]);
const [showMedicineHistory, setShowMedicineHistory] = useState(false);

  const [symptoms, setSymptoms] = useState("");
const [aiResult, setAiResult] = useState("");
const [aiLoading, setAiLoading] = useState(false);
const [symptomHistory, setSymptomHistory] = useState([]);
const [showSymptomHistory, setShowSymptomHistory] = useState(false);
const [showMedicineForm, setShowMedicineForm] = useState(false);
const [editingMedicineId, setEditingMedicineId] = useState(null);
const [medicineNotificationsEnabled, setMedicineNotificationsEnabled] =
  useState(() => localStorage.getItem("medicineNotifications") !== "false");

const [waterNotificationsEnabled, setWaterNotificationsEnabled] =
  useState(() => localStorage.getItem("waterNotifications") !== "false");
const [waterReminderTimes, setWaterReminderTimes] = useState(() => {
  const saved = localStorage.getItem("waterReminderTimes");

  return saved
    ? JSON.parse(saved)
    : ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
});

const [medicineForm, setMedicineForm] = useState({
  name: "",
  purpose: "",
  dosage: "",
  time: "Morning",
  food_instruction: "After food",
  duration: "",
});
const [water, setWater] = useState(0);
const [waterHistory, setWaterHistory] = useState([]);
const [showWaterHistory, setShowWaterHistory] = useState(false);

const [waterGoal, setWaterGoal] = useState(() => {
  return Number(localStorage.getItem("waterGoal")) || 2500;
});

const [showGoalSetting, setShowGoalSetting] = useState(false);

const [goalInput, setGoalInput] = useState(() => {
  return Number(localStorage.getItem("waterGoal")) || 2500;
});

const waterRemaining = Math.max(waterGoal - water, 0);

const waterPercentage = Math.min(
  Math.round((water / waterGoal) * 100),
  100
);
const today = new Date().toLocaleDateString("en-CA");

const todayMedicineHistory = medicineHistory.filter((log) => {
  if (!log.created_at) return false;

  return log.created_at.split("T")[0] === today;
});

const healthScore =
  todayMedicineHistory.length > 0
    ? Math.round(
        (todayMedicineHistory.filter((log) => log.status === "Taken").length /
          todayMedicineHistory.length) *
          100
      )
    : 0;
const [waterAmount, setWaterAmount] = useState(250);

useEffect(() => {
  if (!isLoggedIn || !medicineNotificationsEnabled) return;

  const checkReminders = async () => {
    try {
      const dueMedicines = await getDueMedicines();

      console.log("DUE MEDICINES:", dueMedicines);

      if (!("Notification" in window)) {
        console.warn("Browser notifications are not supported.");
        return;
      }

      if (Notification.permission !== "granted") {
        console.warn("Notification permission:", Notification.permission);
        return;
      }

      const today = new Date().toLocaleDateString("en-CA");

     dueMedicines.forEach((medicine) => {
  const reminderKey = `medicine-reminded-${today}-${medicine.id}`;

  if (localStorage.getItem(reminderKey)) {
    return;
  }

  console.log("CREATING MEDICINE NOTIFICATION:", medicine.name);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("Medicine Reminder", {
        body: `${medicine.name} — ${
          medicine.dosage || "Take your medicine now"
        }`,
        tag: `medicine-${medicine.id}-${today}`,
      });
    });
  }

  localStorage.setItem(reminderKey, "true");
});
 
    } catch (error) {
      console.error("Reminder check failed:", error);
    }
  };

  checkReminders();

  const interval = setInterval(checkReminders, 10000);

  return () => clearInterval(interval);
}, [isLoggedIn, medicineNotificationsEnabled]);
useEffect(() => {
  if (!isLoggedIn || !waterNotificationsEnabled) return;

  const checkWaterReminder = async () => {
    try {
      if (!("Notification" in window)) return;

      if (Notification.permission !== "granted") return;

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

if (!waterReminderTimes.includes(currentTime)) {
  return;
}

      const today = now.toLocaleDateString("en-CA");
     const reminderKey = `water-reminded-${today}-${currentTime}`;

      // Prevent duplicate notification during the same hour
      if (localStorage.getItem(reminderKey)) {
        return;
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification("Water Reminder", {
          body: "Time to drink some water 💧",
         tag: `water-${today}-${currentTime}`,
        });
      }

      localStorage.setItem(reminderKey, "true");

      console.log("💧 WATER NOTIFICATION SENT");
    } catch (error) {
      console.error("Water reminder failed:", error);
    }
  };

  checkWaterReminder();

  const interval = setInterval(checkWaterReminder, 10000);

  return () => clearInterval(interval);
}, [isLoggedIn, waterNotificationsEnabled, waterReminderTimes]);
async function handleAuthSubmit(e) {
console.log("LOGIN BUTTON CLICKED");
console.log("ABOUT TO CALL LOGIN API");
  e.preventDefault();
  setAuthError("");

  try {
    if (showRegister) {
      const { registerUser } = await import("./api");

      await registerUser(
        authName,
        authEmail,
        authPassword
      );

      setShowRegister(false);
      setAuthName("");
      setAuthPassword("");
      setAuthError("");

      alert("Registration successful. Please login.");
    } else {
      const { loginUser } = await import("./api");

      const data = await loginUser(
  authEmail,
  authPassword
);
console.log("LOGIN API RESPONSE:", data);

localStorage.setItem("token", data.access_token);

setAuthName(data.name);
setIsLoggedIn(true);
setShowAuthPage(false);
setAuthEmail("");
setAuthPassword("");
    }
  } catch (error) {
    console.error(error);
    setAuthError(error.message);
  }
}
function handleLogout() {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
  setAuthEmail("");
  setAuthPassword("");
  setAuthError("");
setAuthName("");
setProfileEmail("");
}
async function enableNotifications() {
  try {
    if (!("Notification" in window)) {
      alert("Browser notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setMessage("Notification permission was not granted.");
      return;
    }

    const subscription = await subscribeToPush();

    await savePushSubscription(subscription);

    setMessage("Notifications enabled successfully.");
  } catch (error) {
    console.error("Push notification setup failed:", error);
    setMessage("Could not enable notifications.");
  }
}
async function loadMedicines() {
  try {
    setLoading(true);

    const data = await getMedicines();

    setMedicines(data);
  } catch (error) {
    console.error("Failed to load medicines:", error);
    setMessage("Unable to load medicines.");
  } finally {
    setLoading(false);
  }
}
async function loadMedicineHistory() {
  try {
    const data = await getMedicineHistory();
    setMedicineHistory(data);
  } catch (error) {
    console.error(error);
  }
}
async function loadWater() {
  try {
    const data = await getWaterToday();
    setWater(data.total_water_ml);
  } catch (error) {
    console.error(error);
  }
}
async function loadWaterHistory() {
  try {
    const data = await getWaterHistory();
    setWaterHistory(data);
  } catch (error) {
    console.error(error);
  }
}
async function loadSymptomHistory() {
  try {
    const data = await getSymptomHistory();
    setSymptomHistory(data);
  } catch (error) {
    console.error(error);
  }
}

async function handleAddWater() {
  try {
    await addWater(waterAmount);
    await loadWater();
    setMessage(`${waterAmount} ml of water added.`);
  } catch (error) {
    console.error(error);
    setMessage("Unable to add water.");
  }
}
 async function handleAddMedicine(e) {
  e.preventDefault();

  try {
    if (editingMedicineId) {
      await updateMedicine(editingMedicineId, medicineForm);

      setMessage("Medicine updated successfully.");
    } else {
      await addMedicine(medicineForm);

      setMessage("Medicine added successfully.");
    }

    setMedicineForm({
      name: "",
      purpose: "",
      dosage: "",
      time: "Morning",
      food_instruction: "After food",
      duration: "",
    });

    setEditingMedicineId(null);
    setShowMedicineForm(false);

    await loadMedicines();
  } catch (error) {

    console.error(error);
    setMessage(
      editingMedicineId
        ? "Unable to update medicine."
        : "Unable to add medicine."
    );
  }
}
async function handleTaken(id) {
  try {
    await markMedicineTaken(id);
    await loadMedicines();
    await loadMedicineHistory();
    setMessage("Medicine marked as taken.");
  } catch (error) {
    console.error(error);
    setMessage("Unable to update medicine status.");
  }
}

async function handleSkip(id) {
  try {
    await markMedicineSkipped(id);
    await loadMedicines();
    await loadMedicineHistory();
    setMessage("Medicine skipped.");
  } catch (error) {
    console.error(error);
    setMessage("Unable to update medicine status.");
  }
}
async function handleDelete(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this medicine?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteMedicine(id);
    await loadMedicines();
    await loadMedicineHistory();

    setMessage("Medicine deleted successfully.");
  } catch (error) {
    console.error(error);
    setMessage("Unable to delete medicine.");
  }
}
if (showAuthPage) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="brand-logo">
          <HeartPulse size={25} strokeWidth={2.4} />
        </div>

        <h1>
          {showRegister ? "Create your account" : "Welcome back"}
        </h1>

        <p>
          {showRegister
            ? "Create your MediCare AI account"
            : "Sign in to continue to MediCare AI"}
        </p>

        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>

          {showRegister && (
            <input
              type="text"
              placeholder="Full name"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            required
          />

          <button type="submit">
            {showRegister ? "Create account" : "Login"}
          </button>

        </form>

        <div className="auth-switch">
          {showRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setShowRegister(!showRegister);
              setAuthError("");
            }}
          >
            {showRegister ? "Login" : "Register"}
          </button>
        </div>

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => {
              setShowAuthPage(false);
              setAuthError("");
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">
            <HeartPulse size={23} strokeWidth={2.4} />
          </div>

          <div>
            <h2>MediCare</h2>
            <span>AI HEALTH</span>
          </div>
        </div>

        <div className="menu-label">MAIN MENU</div>

        <nav>
        <button
  className={`nav-item ${!showSettings && !showHelp ? "active" : ""}`}
  onClick={() => {
    setShowSettings(false);
    setShowHelp(false);
  }}
>
  <Home size={18} />
  <span>Dashboard</span>
</button>

          <button
  className="nav-item"
  onClick={() => {
    if (!isLoggedIn) {
      setShowRegister(false);
      return;
    }

    document.querySelector(".medicines-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <Pill size={18} />
  <span>Medicines</span>
  <b>{medicines.length}</b>
</button>

          <button
  className="nav-item"
  onClick={() => {
    if (!isLoggedIn) {
      setShowRegister(false);
      return;
    }

    document.getElementById("water-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <Droplets size={18} />
  <span>Water Tracker</span>
</button>
          <button
  className="nav-item"
  onClick={() => {
    if (!isLoggedIn) {
      setShowRegister(false);
      return;
    }

    document.querySelector(".ai-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <Sparkles size={18} />
  <span>AI Health Guide</span>
</button>

         <button
  className="nav-item"
  onClick={() => {
    if (!isLoggedIn) {
      setShowRegister(false);
      return;
    }

    document.querySelector(".history-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
>
  <History size={18} />
  <span>Health History</span>
</button>
        </nav>

        <div className="menu-label personal-label">PERSONAL</div>

        <nav>
         <button
  className={`nav-item ${showSettings ? "active" : ""}`}
  onClick={() => {
    setShowSettings(true);
    setShowHelp(false);
  }}
>
  <Settings size={18} />
  <span>Settings</span>
</button>

        <button
  className={`nav-item ${showHelp ? "active" : ""}`}
  onClick={() => {
    setShowHelp(true);
    setShowSettings(false);
  }}
>
  <Info size={18} />
  <span>Help & Support</span>
</button>
        </nav>

        <div className="sidebar-bottom">
  <div className="profile-card">
    {isLoggedIn ? (
      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    ) : (
      <button
  className="login-sidebar-button"
  onClick={() => {
    setShowAuthPage(true);
    setShowRegister(false);
    setAuthError("");
    setAuthEmail("");
    setAuthPassword("");
  }}
>
  Login
</button>
    )}
  </div>
</div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <div className="date-label">
              {new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
}).toUpperCase()}
            </div>

            <h1>{new Date().getHours() >= 5 && new Date().getHours() < 12
  ? "Good morning"
  : new Date().getHours() >= 12 && new Date().getHours() < 17
  ? "Good afternoon"
  : new Date().getHours() >= 17 && new Date().getHours() < 21
  ? "Good evening"
  : "Good night"}, {authName || "User"}</h1>

            <p>
              Here's your health overview for today.
            </p>
          </div>

          <div className="header-actions">

            <button
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button className="icon-button notification">
              <Bell size={19} />
              <span></span>
            </button>

            <div className="header-avatar">
             {authName
  ? authName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  : "U"}
            </div>

          </div>

        </header>

        {/* TOAST */}
        {message && (
          <div className="toast">
            <Check size={17} />
            <span>{message}</span>
            <button onClick={() => setMessage("")}>
              <X size={15} />
            </button>
          </div>
        )}
{showHelp ? (
  <div className="settings-page card">

    <div className="history-title-row">
      <Info size={22} />
      <h2>Help & Support</h2>
    </div>

   <p className="help-subtitle">
  Learn how to use MediCare AI and get the most from your health dashboard.
</p>

    <div className="settings-content">

      <div className="help-section">
        <h3>How to use MediCare AI</h3>
        <p>
          MediCare AI helps you manage your medicines, track your water intake,
          get general health guidance, and review your health history.
        </p>
      </div>

      <div className="help-section">
        <h3>Medicine Reminders</h3>
        <p>
          Add a medicine with its name, dosage, time, food instruction, and
          duration. You can mark medicines as Taken or Skip and manage your
          active medicines.
        </p>
      </div>

      <div className="help-section">
        <h3>Water Tracker</h3>
        <p>
          Set your daily water goal and use the Add Water button whenever you
          drink water. Your progress and water history are shown automatically.
        </p>
      </div>

      <div className="help-section">
        <h3>AI Health Guide</h3>
        <p>
          Describe your symptoms to receive general health information and
          guidance. The AI Health Guide is not a medical diagnosis.
        </p>
      </div>

      <div className="help-section">
        <h3>Health History</h3>
        <p>
          Review your previous medicine activity, water records, and AI health
          guidance to keep track of your health routine.
        </p>
      </div>

      <div className="help-section">
        <h3>Safety</h3>
        <p>
          MediCare AI provides general health information only. For serious,
          worsening, or emergency symptoms, seek help from a qualified
          healthcare professional or emergency service.
        </p>
      </div>

      <div className="help-section">
        <h3>Contact & Feedback</h3>
        <p>
          If you find a problem or have an idea to improve MediCare AI,
          you can share your feedback with the project team.
        </p>
      </div>
<button
  className="secondary-button"
  onClick={() => {
    setShowHelp(false);
    setShowSettings(false);
  }}
>
  <Home size={16} />
  <span>Back to Dashboard</span>
</button>

    </div>
  </div>
) : showSettings ? (
  <div className="settings-page card">
    <div className="history-title-row">
      <Settings size={22} />
      <h2>Settings</h2>
    </div>

    <div className="settings-content">

  <div className="settings-section">
    <h3>Account</h3>
    <p>View your MediCare AI account information.</p>

    <div className="account-info">
      <div className="account-row">
        <span className="account-label">Name</span>
        <span className="account-value">
          {authName || "Not available"}
        </span>
      </div>

      <div className="account-row">
        <span className="account-label">Email</span>
        <span className="account-value">
          {profileEmail || "Not available"}
        </span>
      </div>

      <div className="account-row">
        <span className="account-label">Account</span>
        <span className="account-value">Active</span>
      </div>
    </div>
  </div>

<div className="settings-section">
  <h3>Appearance</h3>
  <p>Choose how MediCare AI looks on your device.</p>

  <div className="notification-setting">
    <div>
      <strong>Dark Mode</strong>
      <span>
        Use a darker appearance for MediCare AI.
      </span>
    </div>

    <button
      className={`notification-toggle ${darkMode ? "enabled" : ""}`}
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? "ON" : "OFF"}
    </button>
  </div>
</div>


<div className="settings-section">
  <h3>Notifications</h3>
  <p>Control your medicine and water reminders.</p>

{isLoggedIn && (
    <button
      className="secondary-button"
      onClick={enableNotifications}
    >
      <Bell size={16} />
      Enable Browser Notifications
    </button>
  )}

  <div className="notification-setting">
    <div>
      <strong>Medicine Reminders</strong>
      <span>
        Get notified when a medicine is due.
      </span>
    </div>

    <button
      className={`notification-toggle ${
        medicineNotificationsEnabled ? "enabled" : ""
      }`}
      onClick={() => {
        const newValue = !medicineNotificationsEnabled;

        setMedicineNotificationsEnabled(newValue);
        localStorage.setItem(
          "medicineNotifications",
          String(newValue)
        );
      }}
    >
      {medicineNotificationsEnabled ? "ON" : "OFF"}
    </button>
  </div>

  <div className="notification-setting">
    <div>
      <strong>Water Reminders</strong>
      <span>
        Get reminders to drink water throughout the day.
      </span>
    </div>

    <button
      className={`notification-toggle ${
        waterNotificationsEnabled ? "enabled" : ""
      }`}
      onClick={() => {
        const newValue = !waterNotificationsEnabled;

        setWaterNotificationsEnabled(newValue);
        localStorage.setItem(
          "waterNotifications",
          String(newValue)
        );
      }}
    >
      {waterNotificationsEnabled ? "ON" : "OFF"}
    </button>
  </div>
</div>
<div className="settings-section">
  <h3>Water Goal</h3>
  <p>Set your daily water intake target.</p>

  <div className="water-goal-setting">
    <div>
      <strong>Daily Goal</strong>
      <span>
        Current target: {waterGoal} ml
      </span>
    </div>

    <button
      className="secondary-button"
      onClick={() => {
        setGoalInput(waterGoal);
        setShowGoalSetting(!showGoalSetting);
      }}
    >
      {showGoalSetting ? "Cancel" : "Change Goal"}
    </button>
  </div>

  {showGoalSetting && (
    <div className="water-goal-form">
      <input
        type="number"
        min="500"
        max="10000"
        step="100"
        value={goalInput}
        onChange={(e) => setGoalInput(e.target.value)}
        placeholder="Enter daily goal in ml"
      />

      <button
        className="primary-button"
        onClick={() => {
          const newGoal = Number(goalInput);

          if (newGoal < 500 || newGoal > 10000) {
            alert("Please enter a goal between 500 ml and 10000 ml.");
            return;
          }

          setWaterGoal(newGoal);
          localStorage.setItem("waterGoal", String(newGoal));
          setShowGoalSetting(false);
        }}
      >
       Save Goal
      </button>
    </div>
  )}
</div>
<div className="water-schedule-section">
  <h3>Water Reminder Schedule</h3>

  <p>Choose when you want to receive water reminders.</p>

  {waterReminderTimes.map((time, index) => (
    <div className="water-time-row" key={`${time}-${index}`}>
      <input
        type="time"
        value={time}
        onChange={(e) => {
          const updatedTimes = [...waterReminderTimes];
          updatedTimes[index] = e.target.value;
          setWaterReminderTimes(updatedTimes);
        }}
      />

      <button
        className="remove-water-time"
        onClick={() => {
          const updatedTimes = waterReminderTimes.filter(
            (_, i) => i !== index
          );

          setWaterReminderTimes(updatedTimes);
        }}
      >
        Remove
      </button>
    </div>
  ))}

  <button
    className="secondary-button"
    onClick={() => {
      setWaterReminderTimes([
        ...waterReminderTimes,
        "08:00",
      ]);
    }}
  >
    + Add Reminder Time
  </button>

  <button
    className="primary-button"
    onClick={() => {
      localStorage.setItem(
        "waterReminderTimes",
        JSON.stringify(waterReminderTimes)
      );

      setMessage("Water reminder schedule saved.");
    }}
  >
    Save Water Schedule
  </button>
</div>
<div className="settings-section">
  <h3>Privacy & Security</h3>
  <p>
    Manage your account session and keep your MediCare AI account secure.
  </p>

  <div className="privacy-setting">
    <div>
      <strong>Account Security</strong>
      <span>
        You are currently signed in to your MediCare AI account.
      </span>
    </div>

    <button
      className="privacy-logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</div>
<div className="settings-section">
  <h3>About MediCare AI</h3>
  <p>
    Information about the MediCare AI application.
  </p>

  <div className="about-info">
    <div className="about-row">
      <span className="about-label">App Name</span>
      <span className="about-value">MediCare AI</span>
    </div>

    <div className="about-row">
      <span className="about-label">Version</span>
      <span className="about-value">1.0.0</span>
    </div>

    <div className="about-row">
      <span className="about-label">Purpose</span>
      <span className="about-value">
        Medicine, water & health guidance
      </span>
    </div>
  </div>

  <div className="medical-disclaimer">
    <strong>Medical Disclaimer</strong>
    <span>
      MediCare AI provides general health information and reminders.
      It is not a substitute for professional medical advice,
      diagnosis, or treatment.
    </span>
  </div>
</div>

  <button
    className="secondary-button"
    onClick={() => setShowSettings(false)}
  >
    <Home size={16} />
    <span>Back to Dashboard</span>
  </button>

</div>
  </div>
) : (
  <>
        {/* HEALTH SUMMARY */}
        <section className="health-summary">

          <div className="summary-left">

            <div className="summary-icon">
              <Activity size={24} />
            </div>

            <div>
              <span className="summary-label">
                TODAY'S HEALTH STATUS
              </span>

              <h2>
                You're doing well today
              </h2>

              <p>
                Stay consistent with your medication and hydration.
              </p>
            </div>

          </div>

          <div className="health-score">

            <div className="score-ring">
              <div>
               <strong>{healthScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div>
              <span>HEALTH SCORE</span>
              <strong>Good</strong>
            </div>

          </div>

        </section>

        {/* STATS */}
       <section className="stats-grid">

  {/* MEDICATION */}
  <div className="stat-card">

    <div className="stat-header">
      <div className="stat-icon medicine-icon">
        <Pill size={19} />
      </div>

      <span className="status-pill green">
        Today
      </span>
    </div>

    <span className="stat-label">
      MEDICATION
    </span>

    <h3>
      {medicines.length}
      <small> active medicines</small>
    </h3>

    <div className="stat-footer">
      <span>Medication schedule</span>
      <ChevronRight size={15} />
    </div>

  </div>


  {/* HYDRATION */}
  <div className="stat-card">

    <div className="stat-header">
      <div className="stat-icon water-icon">
        <Droplets size={19} />
      </div>
    </div>

    <span className="status-pill blue">
      {waterPercentage}%
    </span>

    <span className="stat-label">
      HYDRATION
    </span>

    <h3>
      {water}
      <small> / {waterGoal.toLocaleString()} ml</small>
    </h3>

    <div className="progress-bar">
      <span style={{ width: `${waterPercentage}%` }}></span>
    </div>

    <div className="stat-footer">
      <span>
        {waterRemaining.toLocaleString()} ml remaining
      </span>
    </div>

  </div>


  {/* WELLNESS */}
  <div className="stat-card">

    <div className="stat-header">
      <div className="stat-icon wellness-icon">
        <HeartPulse size={19} />
      </div>

      <span className="status-pill purple">
        {healthScore >= 80
          ? "Good"
          : healthScore >= 50
          ? "Fair"
          : "Needs attention"}
      </span>
    </div>

    <span className="stat-label">
      WELLNESS
    </span>

    <h3>
      {healthScore >= 80
        ? "Healthy"
        : healthScore >= 50
        ? "Improving"
        : "Needs attention"}
    </h3>

    <div className="stat-footer">
      <span>Keep your routine consistent</span>
    </div>

  </div>

</section>
        {/* MAIN GRID */}
        <section className="dashboard-grid">
{showMedicineForm && (
  <div className="medicine-form-overlay">
    <div className="medicine-form-card">

      <div className="form-header">
        <div>
          <span className="section-label">MEDICATION</span>
          <h2>{editingMedicineId ? "Edit medicine" : "Add a medicine"}</h2>
          <p>Create a medication reminder.</p>
        </div>

        <button
          className="form-close"
          onClick={() => setShowMedicineForm(false)}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleAddMedicine}>

        <label>
          Medicine name
          <input
            type="text"
            placeholder="e.g. Paracetamol"
            value={medicineForm.name}
            onChange={(e) =>
              setMedicineForm({
                ...medicineForm,
                name: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Purpose
          <input
            type="text"
            placeholder="e.g. Fever"
            value={medicineForm.purpose}
            onChange={(e) =>
              setMedicineForm({
                ...medicineForm,
                purpose: e.target.value,
              })
            }
          />
        </label>

        <label>
          Dosage
          <input
            type="text"
            placeholder="e.g. 500 mg"
            value={medicineForm.dosage}
            onChange={(e) =>
              setMedicineForm({
                ...medicineForm,
                dosage: e.target.value,
              })
            }
            required
          />
        </label>

        <div className="form-row">

          <label>
            Time
            <select
              value={medicineForm.time}
              onChange={(e) =>
                setMedicineForm({
                  ...medicineForm,
                  time: e.target.value,
                })
              }
            >
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </label>

          <label>
            Food
            <select
              value={medicineForm.food_instruction}
              onChange={(e) =>
                setMedicineForm({
                  ...medicineForm,
                  food_instruction: e.target.value,
                })
              }
            >
              <option>Before food</option>
              <option>After food</option>
              <option>With food</option>
              <option>Any time</option>
            </select>
          </label>

        </div>

        <label>
          Duration
          <input
            type="text"
            placeholder="e.g. 3 days"
            value={medicineForm.duration}
            onChange={(e) =>
              setMedicineForm({
                ...medicineForm,
                duration: e.target.value,
              })
            }
          />
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowMedicineForm(false)}
          >
            Cancel
          </button>

          <button type="submit" className="save-medicine-button">
            <Check size={16} />
            {editingMedicineId ? "Update medicine" : "Save medicine"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}

          {/* MEDICINES */}
          <div className="card medicines-card">

            <div className="card-heading">

              <div>
                <span className="section-label">
                  MEDICATION
                </span>

                <h2>Today's medicines</h2>
              </div>

       
            </div>

            {loading ? (

              <div className="empty-state">
                <div className="loading-circle"></div>
                <p>Loading your medicines...</p>
              </div>

            ) : medicines.length === 0 ? (

              <div className="empty-state">
                <Pill size={28} />
                <h3>No medicines yet</h3>
                <p>Add your first medicine to begin tracking.</p>
              </div>

          ) : (
  <>
    <button
      className="medicine-history-toggle"
      onClick={() => setShowMedicines(!showMedicines)}
    >
      <div>
        <strong>My medicines</strong>
        <span>{medicines.length} medicines</span>
      </div>

      <span className="medicine-toggle-text">
        {showMedicines ? "Hide" : "View"}
        <ChevronRight
          size={16}
          className={showMedicines ? "rotate-icon" : ""}
        />
      </span>
    </button>

    {showMedicines && (
      <div className="medicine-list">
        {medicines.map((medicine) => (
          <div className="medicine-item" key={medicine.id}>

            <div className="medicine-symbol">
              <Pill size={20} />
            </div>

            <div className="medicine-info">

              <div className="medicine-title">
                <h3>{medicine.name}</h3>

                <span className="upcoming">
                  Scheduled
                </span>
              </div>

              <p>
                {medicine.dosage}
                {medicine.food_instruction
                  ? ` · ${medicine.food_instruction}`
                  : ""}
              </p>

              <span className="medicine-meta">
                {medicine.purpose || "Medication"} ·{" "}
                {medicine.time || "Scheduled"}
              </span>

            </div>

            <div className="medicine-actions">

              <button
                className="taken-button"
                onClick={() => handleTaken(medicine.id)}
              >
                <Check size={15} />
                Taken
              </button>

              <button
                className="edit-button"
                onClick={() => {
                  setEditingMedicineId(medicine.id);
                  setMedicineForm({
                    name: medicine.name || "",
                    purpose: medicine.purpose || "",
                    dosage: medicine.dosage || "",
                    time: medicine.time || "Morning",
                    food_instruction:
                      medicine.food_instruction || "After food",
                    duration: medicine.duration || "",
                  });
                  setShowMedicineForm(true);
                }}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={() => handleDelete(medicine.id)}
              >
                Delete
              </button>

              <button
                className="skip-button"
                onClick={() => handleSkip(medicine.id)}
              >
                Skip
              </button>

            </div>

          </div>
        ))}
      </div>
    )}
  </>
)}

          </div>

          {/* WATER */}
          <div className="card water-card" id="water-section">

            <div className="card-heading">

              <div>
                <span className="section-label">
                  HYDRATION
                </span>

                <h2>Water today</h2>
<button
  className="water-goal-button"
  onClick={() => {
  setGoalInput(waterGoal);
  setShowGoalSetting(true);
}}
>
  Set goal
</button>
{showGoalSetting && (
  <div className="goal-setting-box">
    <strong>Daily water goal</strong>

    <div className="goal-input-row">
      <input
        type="number"
        value={goalInput}
        onChange={(e) => setGoalInput(e.target.value)}
        min="500"
        step="100"
      />

      <span>ml</span>
    </div>

    <div className="goal-actions">
      <button
        className="goal-cancel"
        onClick={() => setShowGoalSetting(false)}
      >
        Cancel
      </button>

      <button
        className="goal-save"
        onClick={() => {
          if (Number(goalInput) >= 500) {
            setWaterGoal(Number(goalInput));
            setShowGoalSetting(false);
          }
        }}
      >
        Save goal
      </button>
    </div>
  </div>
)} 
              </div>

              <Droplets size={20} className="heading-icon" />

            </div>

            <div className="water-dashboard">

              <div
  className="water-circle"
  style={{ "--water-progress": `${waterPercentage}%` }}
>

                <div>
                 <strong>{waterPercentage}%</strong>
                  <span>of goal</span>
                </div>

              </div>

              <div className="water-numbers">

                <strong>{water} ml</strong>

               <span>
  of {waterGoal.toLocaleString()} ml daily goal
</span>

                <div className="water-progress">
                 <span
  style={{
    width: `${waterPercentage}%`,
  }}
></span>
                </div>

                <small>
 {waterRemaining.toLocaleString()} ml remaining
</small>

              </div>

            </div>

            <button className="add-water" onClick={handleAddWater}>
  <Plus size={17} />
  Add {waterAmount} ml
</button>
<div className="water-history">

  <button
    className="water-history-toggle"
    onClick={() => setShowWaterHistory(!showWaterHistory)}
  >
    <div>
      <strong>Water history</strong>
      <span>{waterHistory.length} entries</span>
    </div>

    <span className="history-toggle-text">
      {showWaterHistory ? "Hide" : "View"}
      <ChevronRight
        size={16}
        className={showWaterHistory ? "rotate-icon" : ""}
      />
    </span>
  </button>

  {showWaterHistory && (
    <div className="water-history-list">
      {waterHistory.slice(0, 5).map((log) => (
        <div className="water-history-item" key={log.id}>
          <div>
            <Droplets size={15} />
            <span>{log.amount_ml} ml</span>
          </div>

          <small>{log.date}</small>
        </div>
      ))}
    </div>
  )}

</div>

          </div>

          {/* AI */}
          <div className="card ai-card">

            <div className="ai-card-top">

              <div className="ai-title">

                <div className="ai-logo">
                  <Sparkles size={20} />
                </div>

                <div>
                  <span className="section-label">
                    INTELLIGENT CARE
                  </span>

                  <h2>AI Health Guide</h2>
                </div>

              </div>

              <div className="online">
                <span></span>
                Online
              </div>

            </div>

            <p className="ai-text">
              Describe how you're feeling and get general
              health guidance and recommended next steps.
            </p>

            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. headache, mild fever, tiredness..."
              rows="3"
            />

           <button
  type="button"
  className="analyze-button"
  disabled={aiLoading}
  onClick={async () => {
    console.log("AI BUTTON CLICKED");

    if (!symptoms.trim()) {
      setMessage("Please enter your symptoms first.");
      return;
    }

    try {
      setAiLoading(true);
      setAiResult("");

      console.log("SENDING TO AI:", symptoms);

      const result = await analyzeSymptoms(symptoms);

      console.log("AI RESPONSE:", result);

      setAiResult(result.guidance);
    } catch (error) {
      console.error(error);
      setMessage("Unable to analyze symptoms.");
    } finally {
      setAiLoading(false);
    }
  }}
>
  <Sparkles size={17} />
  {aiLoading ? "Analyzing..." : "Analyze symptoms"}
  <ChevronRight size={16} />
</button>

            <div className="medical-note">
              <AlertCircle size={15} />
              <span>
                General health information only. Not a medical diagnosis.
              </span>
            </div>
{aiLoading && (
  <div className="ai-result">
    <div className="ai-result-title">
      <Sparkles size={16} />
      <strong>AI Guidance</strong>
    </div>

    <p>Analyzing your symptoms...</p>
  </div>
)}

{aiResult && !aiLoading && (
  <div className="ai-result">
    <div className="ai-result-title">
      <Sparkles size={16} />
      <strong>AI Guidance</strong>
    </div>

    <p>{aiResult}</p>
  </div>
)}

          </div>

          {/* QUICK ACTIONS */}
          {/* QUICK ACTIONS */}
<div className="card quick-card">

  <div className="card-heading">
    <div>
      <span className="section-label">
        SHORTCUTS
      </span>

      <h2>Quick actions</h2>
    </div>
  </div>

  <div className="quick-actions">

    {/* ADD MEDICINE */}
    <button onClick={() => setShowMedicineForm(true)}>
      <div className="quick-icon purple-quick">
        <Pill size={19} />
      </div>

      <div>
        <strong>Add medicine</strong>
        <span>Create a reminder</span>
      </div>

      <ChevronRight size={16} />
    </button>


    {/* LOG WATER */}
    <button
      onClick={() => {
        document.getElementById("water-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
    >
      <div className="quick-icon blue-quick">
        <Droplets size={19} />
      </div>

      <div>
        <strong>Log water</strong>
        <span>Update your intake</span>
      </div>

      <ChevronRight size={16} />
    </button>


    {/* ASK AI */}
    <button
      onClick={() => {
        document.querySelector(".ai-card")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
    >
   
      <div className="quick-icon green-quick">
        <Sparkles size={19} />
      </div>

      <div>
        <strong>Ask AI</strong>
        <span>Check symptoms</span>
      </div>

      <ChevronRight size={16} />
    </button>


    {/* VIEW HISTORY */}
    <button
      onClick={() => {
        document.querySelector(".history-card")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
    >
      <div className="quick-icon orange-quick">
        <History size={19} />
      </div>

      <div>
        <strong>View history</strong>
        <span>See health records</span>
      </div>

      <ChevronRight size={16} />
    </button>

  </div>

</div>

          {/* MEDICINE HISTORY */}
          <div className="card history-card">

            <div className="card-heading">

              <div>
                <span className="section-label">0
                  MEDICATION ACTIVITY
                </span>

               <div>
  <h2>Medicine history</h2>
  <button
    className="history-toggle"
    onClick={() => setShowMedicineHistory(!showMedicineHistory)}
  >
    {showMedicineHistory ? "Hide" : "Show"}
  </button>
</div>
              </div>

              <History size={20} className="heading-icon" />

            </div>

            {medicineHistory.length === 0 ? (

              <div className="history-empty">
                <History size={22} />
                <p>No medicine activity yet.</p>
                <span>
                  Your Taken and Skipped actions will appear here.
                </span>
              </div>

           ) : showMedicineHistory ? (

  <div className="history-list">

                {medicineHistory.map((item) => {

                  const medicine = medicines.find(
                    (med) => med.id === item.medicine_id
                  );

                  return (
                    <div className="history-item" key={item.id}>

                      <div className="history-icon">
                        <Pill size={17} />
                      </div>

                      <div className="history-info">
                        <strong>
                          {medicine
                            ? medicine.name
                            : `Medicine #${item.medicine_id}`}
                        </strong>

                        <span>
                          Medicine action recorded
                        </span>
                      </div>

                      <span
                        className={
                          item.status === "Taken"
                            ? "history-status taken"
                            : "history-status skipped"
                        }
                      >
                        {item.status}
                      </span>

                    </div>
                  );

                })}

              </div>

           ) : null}

          </div>

        </section>
     <div className="card ai-history-card">
  <div className="card-heading">
    <div>
      <span className="section-label">AI HEALTH HISTORY</span>

      <div className="history-title-row">
        <h2>Symptom history</h2>

        <button
          className="history-toggle"
          onClick={() => setShowSymptomHistory(!showSymptomHistory)}
        >
          {showSymptomHistory ? "Hide" : "Show"}
        </button>
      </div>
    </div>

    <Sparkles size={20} className="heading-icon" />
  </div>

  {symptomHistory.length === 0 ? (
    <div className="history-empty">
      <Sparkles size={22} />
      <p>No AI symptom history yet.</p>
      <span>Your AI health guidance will appear here.</span>
    </div>
  ) : showSymptomHistory ? (
    <div className="ai-history-list">
     {symptomHistory.map((item) => (
  <div className="ai-history-item" key={item.id}>

    <div className="ai-history-question">
      <div className="ai-history-meta">
        <strong>Symptoms</strong>

        <span>
          {new Date(item.created_at).toLocaleString()}
        </span>
      </div>

      <p>{item.symptoms}</p>
    </div>

    <div className="ai-history-response">
      <strong>AI Guidance</strong>

      <p>{item.response}</p>
    </div>

  </div>
))}
    </div>
  ) : null}
</div>
</>
)}


        <footer className="footer">
          <div className="footer-brand">
            <HeartPulse size={15} />
            <strong>MediCare AI</strong>
          </div>

          <span>
            Your health, intelligently supported.
          </span>
        </footer>

      </main>

    </div>
  );
}

export default App; 
