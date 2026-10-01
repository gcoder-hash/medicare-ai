const API_URL = "http://127.0.0.1:8000";
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getMedicines() {
  const response = await fetch(`${API_URL}/medicines`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load medicines");
  }

  return response.json();
}

export async function markMedicineTaken(medicineId) {
  const response = await fetch(
    `${API_URL}/medicines/${medicineId}/taken`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark medicine as taken");
  }

  return response.json();
}

export async function markMedicineSkipped(medicineId) {
  const response = await fetch(
    `${API_URL}/medicines/${medicineId}/skip`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to skip medicine");
  }

  return response.json();
}
export async function getMedicineHistory() {
  const response = await fetch(`${API_URL}/medicines/history`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load medicine history");
  }

  return response.json();
}
export async function addMedicine(medicine) {
  const params = new URLSearchParams({
    name: medicine.name,
    purpose: medicine.purpose,
    dosage: medicine.dosage,
    time: medicine.time,
    food_instruction: medicine.food_instruction,
    duration: medicine.duration,
  });

  const response = await fetch(
    `${API_URL}/medicines?${params.toString()}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add medicine");
  }

  return response.json();
}
export async function addWater(amount_ml) {
  const response = await fetch(
    `${API_URL}/water?amount_ml=${amount_ml}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add water");
  }

  return response.json();
}

export async function getWaterToday() {
  const response = await fetch(`${API_URL}/water`, {
  headers: getAuthHeaders(),
});

  if (!response.ok) {
    throw new Error("Failed to load water");
  }

  return response.json();
}

export async function deleteMedicine(medicineId) {
  const response = await fetch(
    `${API_URL}/medicines/${medicineId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete medicine");
  }

  return response.json();
}
export async function getWaterHistory() {
  const response = await fetch(`${API_URL}/water/history`, {
  headers: getAuthHeaders(),
});

  if (!response.ok) {
    throw new Error("Failed to load water history");
  }

  return response.json();
}
export async function analyzeSymptoms(symptoms) {
  const response = await fetch(`${API_URL}/symptoms`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ symptoms }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || "Unable to analyze symptoms"
    );
  }

  return response.json();
}
export async function registerUser(name, email, password) {
  const params = new URLSearchParams({
    name,
    email,
    password,
  });

  const response = await fetch(
    `${API_URL}/register?${params.toString()}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}
export async function loginUser(email, password) {
  const params = new URLSearchParams({
    email,
    password,
  });

  const response = await fetch(
    `${API_URL}/login?${params.toString()}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}
export async function updateMedicine(medicineId, medicine) {
  const params = new URLSearchParams({
    name: medicine.name,
    purpose: medicine.purpose,
    dosage: medicine.dosage,
    time: medicine.time,
    food_instruction: medicine.food_instruction,
    duration: medicine.duration,
  });

  const response = await fetch(
    `${API_URL}/medicines/${medicineId}?${params.toString()}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update medicine");
  }

  return response.json();
}
export async function getDueMedicines() {
  const response = await fetch(`${API_URL}/medicines/due`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to check medicine reminders");
  }

  return response.json();
}
export async function getProfile() {
  const response = await fetch(`${API_URL}/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load profile");
  }

  return response.json();
}
export async function getSymptomHistory() {
  const response = await fetch(`${API_URL}/symptoms`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load symptom history");
  }

  return response.json();
}
export async function savePushSubscription(subscription) {
  const token = localStorage.getItem("token");

  const json = subscription.toJSON();

  const params = new URLSearchParams({
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  });

  const response = await fetch(
    `http://127.0.0.1:8000/push/subscribe?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save push subscription");
  }

  return response.json();
}
