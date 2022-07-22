import React from 'react';

const views = ['budgets', 'envelopes', 'expenses', 'income', 'savingsenvelopes'];
const viewNames = ['Budgets', 'Accounts', 'Expenses', 'Income', 'Savings'];

const NavBar = ({ setDarkMode, darkMode, setView, user }) => (
  <nav className="navBar">
    <div className="navMenu left">
      <h2
        className="logoText"
        onClick={() => setView('home')}
      >
        Budgeteer
      </h2>
    </div>
    <div className="navMenu center">
      {views.map((view, i) => (
        <button
          key={view}
          className="solidBtn"
          onClick={() => setView(view)}
        >
          {viewNames[i]}
        </button>
      ))}
    </div>
    <div className="navMenu right">
      <button
        className="solidBtn"
        onClick={() => setDarkMode(!darkMode)}
      >
        Toggle Dark Mode
      </button>
      <button
        className="solidBtn"
        onClick={() => user ? setView('profile') : setView('login')}
      >
        {user ? `Logged in as ${user.firstname} ${user.lastname}` : 'Login'}
      </button>
    </div>
  </nav>
);

export default NavBar;