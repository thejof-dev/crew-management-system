
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('crew');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!token);

  useEffect(() => {
    if (loggedIn) {
      fetchClients();
      fetchJobs();
      fetchCrew();
    }
  }, [loggedIn]);

  const fetchClients = async () => {
    const response = await axios.get('/clients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setClients(response.data);
  };

  const fetchJobs = async () => {
    const response = await axios.get('/jobs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setJobs(response.data);
  };

  const fetchCrew = async () => {
    const response = await axios.get('/crew', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCrew(response.data);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setToken(response.data.token);
      setUserRole(response.data.role);
      setLoggedIn(true);
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Crew Management System</h1>
      {!loggedIn ? (
        <div className="auth-box">
          <h2>Login</h2>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div className="dashboard">
          <h2>Clients</h2>
          <ul className="list">{clients.map(client => <li key={client.id}>{client.name}</li>)}</ul>
          <h2>Jobs</h2>
          <ul className="list">{jobs.map(job => <li key={job.id}>{job.client_id} - {job.status}</li>)}</ul>
          <h2>Crew</h2>
          <ul className="list">{crew.map(member => <li key={member.id}>{member.name} - {member.role}</li>)}</ul>
        </div>
      )}
    </div>
  );
};

export default App;
