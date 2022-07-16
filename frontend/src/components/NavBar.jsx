import React from 'react';

const views = ['home']

const NavBar = ({ setDarkMode, darkMode, setView, user }) => (
  <nav className="navBar">
    <h2>
      Budgeteer
    </h2>
    <div style={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
      {views.map(view => (
        <button
          key={view}
          className="navBtn"
          onClick={() => setView(view)}
          style={{ my: 2, color: 'white', display: 'block' }}
        >
          {view}
        </button>
      ))}
    </div>
    <button
      className="navBtn"
      onClick={() => setDarkMode(!darkMode)}
    >
      Toggle Dark Mode
    </button>
    <button
      className="navBtn"
      onClick={() => user ? setView('profile') : setView('login')}
    >
      {user ? `Logged in as ${user.firstname} ${user.lastname}` : 'Login'}
    </button>
  </nav>
);

export default NavBar;