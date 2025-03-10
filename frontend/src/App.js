import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './styles.css';

const App = () => {
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || 'Guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!token);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newCrew, setNewCrew] = useState({ name: '', role: '', email: '' });
  const [editCrew, setEditCrew] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      axios.get('http://localhost:5002/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        fetchClients();
        fetchJobs();
        fetchCrew();
        fetchEquipment();
      }).catch(() => {
        localStorage.removeItem('token');
        setLoggedIn(false);
      });
    }
  }, [loggedIn]);

  const fetchClients = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5002/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchJobs = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5002/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCrew = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5002/crew', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCrew(response.data);
    } catch (error) {
      console.error('Error fetching crew:', error);
    }
  };

  const addCrewMember = async () => {
    try {
      const response = await axios.post('http://localhost:5002/crew', newCrew, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setCrew([...crew, response.data]);
      setNewCrew({ name: '', role: '', email: '' });
    } catch (error) {
      console.error('Error adding crew member:', error);
    }
  };

  const updateCrewMember = async () => {
    try {
      await axios.put(`http://localhost:5002/crew/${editCrew.id}`, editCrew, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setCrew(crew.map(member => (member.id === editCrew.id ? editCrew : member)));
      setEditCrew(null);
    } catch (error) {
      console.error('Error updating crew member:', error);
    }
  };

  const deleteCrewMember = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/crew/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCrew(crew.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting crew member:', error);
    }
  };
  const fetchEquipment = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5002/equipment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleLogin = async () => {
    try {
        console.log("🔹 Sending login request with:", { email, password });
        const response = await axios.post('http://localhost:5002/auth/login', { email, password });
        console.log("✅ Login successful. Token received:", response.data);
        if (!response.data.token) {
            console.error("❌ Login failed: No token received");
            alert("Login failed. No token received.");
            return;
        }
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', email);
        setToken(response.data.token);
        setUserEmail(email);
        setLoggedIn(true);
    } catch (error) {
        console.error("❌ Login failed:", error.response ? error.response.data : error.message);
        alert('Login failed. Check credentials.');
    }
  };

  return (
    <Router>
      <div className="container">
        {!loggedIn ? <Navigate to="/" replace /> : null}
        <header className="header-menu">
          <h1 className="title">Crew Management System</h1>
          {loggedIn && (
            <div className="menu-container">
              <button className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <ul>
                    <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                    <li><Link to="/clients" onClick={() => setMenuOpen(false)}>Clients</Link></li>
                    <li><Link to="/jobs" onClick={() => setMenuOpen(false)}>Jobs</Link></li>
                    <li><Link to="/crew" onClick={() => setMenuOpen(false)}>Crew</Link></li>
                    <li><Link to="/equipment" onClick={() => setMenuOpen(false)}>Equipment</Link></li>
                    <li className="user-info">Logged in as: {userEmail}</li>
                    <li><button className="btn-logout" onClick={() => setLoggedIn(false)}>Logout</button></li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </header>
        <Routes>
          <Route path="/clients" element={<div><h2>Clients</h2><ul>{clients.map(client => <li key={client.id}>{client.name}</li>)}</ul></div>} />
          <Route path="/jobs" element={<div><h2>Jobs</h2><ul>{jobs.map(job => <li key={job.id}>{job.title}</li>)}</ul></div>} />
          <Route path="/crew" element={
            <div>
              <h2>Crew</h2>
              <ul>{crew.map(member => (
                <li key={member.id}>{member.name} - {member.role} - {member.email}
                  <button onClick={() => deleteCrewMember(member.id)}>Delete</button>
                  <button onClick={() => setEditCrew(member)}>Edit</button>
                </li>
              ))}</ul>
              <h3>{editCrew ? 'Edit Crew Member' : 'Add Crew Member'}</h3>
              <input type="text" placeholder="Name" value={editCrew ? editCrew.name : newCrew.name} onChange={(e) => editCrew ? setEditCrew({ ...editCrew, name: e.target.value }) : setNewCrew({ ...newCrew, name: e.target.value })} />
              <input type="text" placeholder="Role" value={editCrew ? editCrew.role : newCrew.role} onChange={(e) => editCrew ? setEditCrew({ ...editCrew, role: e.target.value }) : setNewCrew({ ...newCrew, role: e.target.value })} />
              <input type="email" placeholder="Email" value={editCrew ? editCrew.email : newCrew.email} onChange={(e) => editCrew ? setEditCrew({ ...editCrew, email: e.target.value }) : setNewCrew({ ...newCrew, email: e.target.value })} />
              {editCrew ? <button onClick={updateCrewMember}>Update</button> : <button onClick={addCrewMember}>Add</button>}
              {editCrew && <button onClick={() => setEditCrew(null)}>Cancel</button>}
            </div>
          } />
          <Route path="/equipment" element={<div><h2>Equipment</h2><ul>{equipment.map(item => <li key={item.id}>{item.name} - {item.type}</li>)}</ul></div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
