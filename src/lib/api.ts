const BASE_URL = "/api/flows";

export const getFlows = async () => {
  const response = await fetch(BASE_URL);
  return response.json();
};

export const getFlow = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};

export const createFlow = async (data: any) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateFlow = async (id: string, data: any) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteFlow = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Adicione outros métodos conforme necessário