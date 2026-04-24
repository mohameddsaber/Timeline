const BASE_URL = 'http://localhost:5000/api';

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
