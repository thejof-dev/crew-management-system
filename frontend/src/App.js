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
  const [newClient, setNewClient] = useState({ name: '', industry: '' });
  const [editClient, setEditClient] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    serial_number: '',
    status: 'Available'
  });
  const [editEquipment, setEditEquipment] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      axios.get('http://localhost:5002/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        fetchClients();
        fetchEquipment();
        fetchJobs();
        fetchCrew();
      }).catch(() => {
        localStorage.removeItem('token');
        setLoggedIn(false);
        setShowLoginModal(true);
      });
    }
    setShowLoginModal(true); }, [loggedIn]);

  const fetchClients = async () => {
    if (!token) {
        console.error("🚨 No token found! Redirecting to login.");
        return;
    }
    console.log("🔹 Fetching clients with token:", token);

    try {
        const response = await axios.get('http://localhost:5002/clients', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data);
    } catch (error) {
        console.error("❌ Error fetching clients:", error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 403) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem('token');
            setLoggedIn(false);
        }
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
    if (!editCrew) return;
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

  const addClient = async () => {
    try {
      const response = await axios.post('http://localhost:5002/clients', newClient, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setClients([...clients, response.data]);
      setNewClient({ name: '', industry: '' });
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const updateClient = async () => {
    if (!editClient) return;
    try {
      await axios.put(`http://localhost:5002/clients/${editClient.id}`, editClient, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setClients(clients.map(client => (client.id === editClient.id ? editClient : client)));
      setEditClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };
  // Fetch Equipment Data
const fetchEquipment = async () => {
  if (!token) return;
  try {
    const response = await axios.get('http://localhost:5002/equipment', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEquipment(response.data);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    if (error.response && error.response.status === 403) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem('token');
      setLoggedIn(false);
    }
  }
};

const addEquipment = async () => {
  if (!newEquipment.name || !newEquipment.type || !newEquipment.serial_number) {
    alert('Please fill in all required fields: Name, Type, and Serial Number.');
    return;
  }

  try {
    console.log("🔹 Adding equipment:", newEquipment);
    const response = await axios.post('http://localhost:5002/equipment', newEquipment, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    console.log("✅ Equipment added successfully:", response.data);

    setEquipment([...equipment, response.data]);
    setNewEquipment({ name: '', type: '', serial_number: '', status: 'Available' });
  } catch (error) {
    console.error("❌ Error adding equipment:", error.response ? error.response.data : error.message);
  }
};

// Update Equipment
const updateEquipment = async () => {
  if (!editEquipment) return;
  try {
    await axios.put(`http://localhost:5002/equipment/${editEquipment.id}`, editEquipment, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    setEquipment(equipment.map(item => (item.id === editEquipment.id ? editEquipment : item)));
    setEditEquipment(null);
  } catch (error) {
    console.error('Error updating equipment:', error);
  }
};

// Delete Equipment
const deleteEquipment = async (id) => {
  try {
    await axios.delete(`http://localhost:5002/equipment/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEquipment(equipment.filter(item => item.id !== id));
  } catch (error) {
    console.error('Error deleting equipment:', error);
  }
};
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5002/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', email);
      setToken(response.data.token);
      setUserEmail(email);
      setLoggedIn(true);
      setShowLoginModal(false);
    } catch (error) {
      setLoginError('Invalid email or password');
    }
  };


  return (
    <Router>
       <div className="app-container">
       {!loggedIn ? (
          <Navigate to="/" replace />
        ) : (
          <>
        <aside className="sidebar">
          <h2>Menu</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/clients">Clients</Link></li>
            <li><Link to="/jobs">Jobs</Link></li>
            <li><Link to="/crew">Crew</Link></li>
            <li><Link to="/equipment">Equipment</Link></li>
            <li className="user-info">Logged in as: {userEmail}</li>
            <li><button className="btn-logout" onClick={() => setLoggedIn(false)}>Logout</button></li>
          </ul>
        </aside>
        <main className="content">
        <Routes>
           <Route path="/clients" element={
              <div>
                <h2>Clients</h2>
                {editClient ? (
                  <div className="client-form">
                    <h3>Edit Client</h3>
                    <input type="text" placeholder="Name" value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} />
                    <input type="text" placeholder="Industry" value={editClient.industry} onChange={(e) => setEditClient({ ...editClient, industry: e.target.value })} />
                    <button className="btn-save" onClick={updateClient}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditClient(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="client-form">
                    <input type="text" placeholder="Name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
                    <input type="text" placeholder="Industry" value={newClient.industry} onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })} />
                    <button className="btn-add" onClick={addClient}>Add Client</button>
                  </div>
                )}
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Industry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id}>
                        <td>{client.name}</td>
                        <td>{client.industry}</td>
                        <td>
                          <button onClick={() => setEditClient(client)}>Edit</button>
                          <button onClick={() => deleteClient(client.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            } />
          <Route path="/jobs" element={<div><h2>Jobs</h2><ul>{jobs.map(job => <li key={job.id}>{job.title}</li>)}</ul></div>} />
          <Route path="/crew" element={
              <div>
                <h2>Crew</h2>
                {editCrew ? (
                  <div className="crew-form">
                    <h3>Edit Crew Member</h3>
                    <input type="text" placeholder="Name" value={editCrew.name} onChange={(e) => setEditCrew({ ...editCrew, name: e.target.value })} />
                    <input type="text" placeholder="Role" value={editCrew.role} onChange={(e) => setEditCrew({ ...editCrew, role: e.target.value })} />
                    <input type="email" placeholder="Email" value={editCrew.email} onChange={(e) => setEditCrew({ ...editCrew, email: e.target.value })} />
                    <button className="btn-save" onClick={updateCrewMember}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditCrew(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="crew-form">
                    <input type="text" placeholder="Name" value={newCrew.name} onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })} />
                    <input type="text" placeholder="Role" value={newCrew.role} onChange={(e) => setNewCrew({ ...newCrew, role: e.target.value })} />
                    <input type="email" placeholder="Email" value={newCrew.email} onChange={(e) => setNewCrew({ ...newCrew, email: e.target.value })} />
                    <button className="btn-add" onClick={addCrewMember}>Add Crew Member</button>
                  </div>
                )}
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crew.map(member => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.role}</td>
                        <td>{member.email}</td>
                        <td>
                          <button onClick={() => setEditCrew(member)}>Edit</button>
                          <button onClick={() => deleteCrewMember(member.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            } />
         <Route path="/equipment" element={
  <div>
    <h2>Equipment</h2>
    {editEquipment ? (
      <div className="equipment-form">
        <h3>Edit Equipment</h3>
        <input type="text" placeholder="Name" value={editEquipment.name} onChange={(e) => setEditEquipment({ ...editEquipment, name: e.target.value })} />
        <input type="text" placeholder="Type" value={editEquipment.type} onChange={(e) => setEditEquipment({ ...editEquipment, type: e.target.value })} />
        <input type="text" placeholder="Serial Number" value={editEquipment.serial_number} onChange={(e) => setEditEquipment({ ...editEquipment, serial_number: e.target.value })} />
        <input type="text" placeholder="Status" value={editEquipment.status} onChange={(e) => setEditEquipment({ ...editEquipment, status: e.target.value })} />
        <button className="btn-save" onClick={updateEquipment}>Save</button>
        <button className="btn-cancel" onClick={() => setEditEquipment(null)}>Cancel</button>
      </div>
    ) : (
      <div className="equipment-form">
        <input type="text" placeholder="Name" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} />
        <input type="text" placeholder="Type" value={newEquipment.type} onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })} />
        <input type="text" placeholder="Serial Number" value={newEquipment.serial_number} onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })} />
        <input type="text" placeholder="Status" value={newEquipment.status} onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value })} />
        <button className="btn-add" onClick={addEquipment}>Add Equipment</button>
      </div>
    )}
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Serial Number</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {equipment.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td>{item.serial_number}</td>
            <td>{item.status}</td>
            <td>
              <button onClick={() => setEditEquipment(item)}>Edit</button>
              <button onClick={() => deleteEquipment(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
} />
        </Routes>
        </main>
        </>
        )}

{showLoginModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Login</h2>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="btn-login" onClick={handleLogin}>Login</button>
              {loginError && <p className="error-message">{loginError}</p>}
              <button className="btn-close" onClick={() => setShowLoginModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
