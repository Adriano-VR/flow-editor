import { Flow } from '@/types/flow';

const BASE_URL = "/api/flows";

export const getFlows = async () => {
  const response = await fetch(BASE_URL);
  return response.json();
};

export const getFlow = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};

export const createFlow = async (data: Partial<Flow>) => {
  // Ensure the flow is created with empty edges
  const flowData = {
    ...data,
    attributes: {
      ...data.attributes,
      data: {
        ...data.attributes?.data,
        edges: [],
        nodes: data.attributes?.data?.nodes || []
      }
    }
  };

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(flowData),
  });
  return response.json();
};

export const updateFlow = async (id: string, data: unknown) => {
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