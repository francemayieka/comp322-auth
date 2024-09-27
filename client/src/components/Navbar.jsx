import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token from local storage or state
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="bg-blue-500 p-4">
      <Link to="/" className="text-white mx-2">Home</Link>
      <Link to="/login" className="text-white mx-2">Login</Link>
      <Link to="/signup" className="text-white mx-2">Sign Up</Link>
      <button onClick={handleLogout} className="text-white mx-2">Logout</button>
    </nav>
  );
};

export default Navbar;
