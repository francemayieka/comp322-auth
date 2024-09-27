// src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect to login on root */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        {/* Use PrivateRoute to protect the home route */}
        <Route 
          path="/home" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Home />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
