const BASE_URL = '/api';

export const getNode = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/nodes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch node: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching node ${id}:`, error);
    throw error;
  }
};

export const createScenario = async (data) => {
  const res = await fetch(`${BASE_URL}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create scenario');
  return res.json();
};

export const getScenarios = async () => {
  const res = await fetch(`${BASE_URL}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
};

export const updateScenario = async (id, data) => {
  const res = await fetch(`${BASE_URL}/scenarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update scenario');
  return res.json();
};

export const getScenarioNodes = async (scenarioId) => {
  const res = await fetch(`${BASE_URL}/scenarios/${scenarioId}/nodes`);
  if (!res.ok) throw new Error('Failed to fetch nodes');
  return res.json();
};

export const createNode = async (data) => {
  const res = await fetch(`${BASE_URL}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create node');
  return res.json();
};

export const addChoice = async (nodeId, data) => {
  const res = await fetch(`${BASE_URL}/nodes/${nodeId}/choices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add choice');
  return res.json();
};
