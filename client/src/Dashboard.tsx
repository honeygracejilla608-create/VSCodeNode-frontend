import React, { useState, useEffect } from 'react';

interface FirestoreData {
  tasks: any[];
  users: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<FirestoreData>({ tasks: [], users: [] });
  const [loading, setLoading] = useState(false);

  // Mock MCP calls - in real implementation, connect to MCP server
  const fetchFirestoreData = async () => {
    setLoading(true);
    try {
      // Simulate MCP call: firebase.firestore.query({ collection: 'tasks' })
      const tasksResponse = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'firebase.firestore.query', params: { collection: 'tasks' } })
      });
      const tasks = await tasksResponse.json();

      // Simulate MCP call: firebase.auth.listUsers()
      const usersResponse = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'firebase.auth.listUsers', params: {} })
      });
      const users = await usersResponse.json();

      setData({ tasks, users });
    } catch (error) {
      console.error('MCP error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Dashboard (via MCP)</h1>

        <button
          onClick={fetchFirestoreData}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Firestore Tasks</h2>
            <ul className="space-y-2">
              {data.tasks.map((task, index) => (
                <li key={index} className="border-b pb-2">
                  <strong>{task.title}</strong>: {task.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Users</h2>
            <ul className="space-y-2">
              {data.users.map((user, index) => (
                <li key={index} className="border-b pb-2">
                  {user.email} ({user.uid})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
