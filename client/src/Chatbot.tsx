import React, { useState } from 'react';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Simulate MCP call based on input
      let method = 'firebase.firestore.query';
      let params: any = { collection: 'tasks' };

      if (input.toLowerCase().includes('users')) {
        method = 'firebase.auth.listUsers';
        params = {};
      } else if (input.toLowerCase().includes('deploy')) {
        method = 'firebase.hosting.deploy';
        params = {};
      }

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params })
      });

      const result = await response.json();
      const aiMessage = { text: `MCP Result: ${JSON.stringify(result)}`, sender: 'ai' as const };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Error executing command.', sender: 'ai' }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-purple-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white">Firebase AI Chatbot (via MCP)</h1>
        </div>
        <div className="px-6 py-8">
          <div className="mb-6 h-96 overflow-y-auto border p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                  <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a Firebase command (e.g., 'show tasks', 'list users', 'deploy')"
              className="flex-1 p-3 border rounded-l-lg"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-500 text-white px-6 py-3 rounded-r-lg hover:bg-purple-600"
            >
              Send
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Examples: "Show all tasks", "List users", "Deploy app". Commands are processed via MCP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
