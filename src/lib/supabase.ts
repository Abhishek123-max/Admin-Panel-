const API_BASE_URL = "http://15.207.223.246:8000";

export const addProperty = async (data: any) => {
  const res = await fetch(`${API_BASE_URL}/add-property`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
