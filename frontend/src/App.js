import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [form, setForm] = useState({
    workoutName: '',
    description: '',
    category: '',
    intensity: 'Medium',
  });
  const [result, setResult] = useState(null);
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAction = async (endpoint) => {
    setLoading(true);
    setResult(null);
    setGrammarIssues([]);

    try {
      const res = await axios.post(`http://localhost:5000/workouts/${endpoint}`, form);
      setResult(res.data);
      if (endpoint === 'add') {
        alert(res.data.message);
        setForm({
          workoutName: '',
          description: '',
          category: '',
          intensity: 'Medium'
        });
      }
    } catch (error) {
      setResult({ error: 'An error occurred. Please check the server.' });
    }
    setLoading(false);
  };

  const checkGrammar = async () => {
    setLoading(true);
    setResult(null);
    setGrammarIssues([]);

    try {
      const res = await axios.post('http://localhost:5000/workouts/lint', {
        description: form.description
      });
      setGrammarIssues(res.data);
    } catch (error) {
      setGrammarIssues([{ message: 'Failed to check for issues.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="content-card">
        <h2 className="title">🏋️ AI Workout Duplicate Checker</h2>
        <p className="subtitle">Enter workout details to check for duplicates or add new entries.</p>

        <div className="input-grid">
          <input
            name="workoutName"
            placeholder="Workout Name"
            value={form.workoutName}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />
          <select
            name="intensity"
            value={form.intensity}
            onChange={handleChange}
          >
            <option value="Very Low">Very Low</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Very High">Very High</option>
          </select>
        </div>

        <div className="button-group">
          <button onClick={() => handleAction('check')} disabled={loading}>
            {loading ? 'Checking...' : 'Check Duplicate'}
          </button>
          <button onClick={() => handleAction('add')} disabled={loading}>
            Add Workout
          </button>
          <button onClick={checkGrammar} disabled={loading}>
            Check for Typos
          </button>
        </div>
        
        {grammarIssues.length > 0 && (
          <div className="result-section" style={{ backgroundColor: '#fff3cd' }}>
            <h3 className="result-title">Typos and Grammar Issues Found:</h3>
            <ul>
              {grammarIssues.map((issue, index) => (
                <li key={index}>
                  <strong>Issue:</strong> "{issue.sentence}"<br/>
                  <strong>Problem:</strong> {issue.message}<br/>
                  <strong>Suggestions:</strong> {issue.replacements.map(r => `"${r.value}"`).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result && (
          <div className="result-section">
            <h3 className="result-title">Result:</h3>
            <pre className="result-code">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;