import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faEnvelope, faHome, faSearch, faUser, faTimes, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/AppContext';
import './DarkMoode.css';
 // 👉 Import your CSS here

export default function Nav() {
  const { user } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // 🌓 Dark mode state

  const userImage = user?.imageUrl || 'path/to/default-image.jpg';

  // Toggle dark mode function
  function toggleDarkMode() {
    document.body.classList.toggle('darkmood');
    setIsDarkMode(!isDarkMode); // Change icon rotation
  }

  return (
    <nav className="shadow-md px-6 py-2 sticky top-0 z-50" style={{ backgroundColor: 'var(--color-card)', color: 'var(--text-color)' }}>

      <div className="flex justify-between items-center">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-purple-600">
            NapaExtra
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/">
              <FontAwesomeIcon icon={faHome} size="lg" className="text-purple-600" />
            </Link>

            {user && (
              <Link to={`/profile/${user.userId}`}>
                <FontAwesomeIcon icon={faUser} size="lg" className="text-purple-600" />
              </Link>
            )}

            {/* Search Bar */}
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Link to={`/chatbox/${user.userId}`}>
                <FontAwesomeIcon icon={faEnvelope} size="lg" className="text-purple-600" />
              </Link>
            )}

            <Link to="/">
              <FontAwesomeIcon icon={faBell} size="lg" className="text-purple-600" />
            </Link>

            {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode}>
              <FontAwesomeIcon 
                icon={faLightbulb} 
                size="lg" 
                className={`text-purple-600 dark-mood-icon ${isDarkMode ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <img
                    src={userImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-400"
                  />
                  <h4 className="font-medium text-purple-600 hidden sm:block">{user.firstName}</h4>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size="lg" className="text-purple-600" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 mt-4 md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faHome} className="text-purple-600 mr-2" /> Home
          </Link>

          {user && (
            <Link to={`/profile/${user.userId}`} onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faUser} className="text-purple-600 mr-2" /> Profile
            </Link>
          )}

          {user && (
            <Link to={`/chatbox/${user.userId}`} onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 mr-2" /> Chat
            </Link>
          )}

          <Link to="/" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faBell} className="text-purple-600 mr-2" /> Notifications
          </Link>
        </div>
      )}
    </nav>
  );
}
