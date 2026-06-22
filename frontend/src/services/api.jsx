const API_URL = "http://192.168.1.173:5000";

const loadSensors = async () => {
  try {
    const data = await fetchSensors();
    setSensors(data);
  } catch (error) {
    console.error(error);
  }
};

export const fetchSensors = async () => {
  const response = await fetch(
    `${API_URL}/api/sensors`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sensors");
  }

  return response.json();
};