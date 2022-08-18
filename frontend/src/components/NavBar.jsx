import React from 'react';
import { Link } from 'react-router-dom';

const views = ['budgets', 'accounts', 'expenses', 'income', 'goals', 'contacts'];
const viewNames = ['Budgets', 'Accounts', 'Expenses', 'Income', 'Savings', 'Contacts'];

const NavBar = ({ setView, user }) => (
  <nav className="navBar">
    <div className="navMenu left">
      <Link
        className="logoText"
        to={`${window.ADDR_PREFIX}`}
      >
        Budgeteer
      </Link>
    </div>
    <div className="navMenu center">
      {views.map((view, i) => (
        <Link
          key={view}
          className="btn solidBtn"
          to={`${window.ADDR_PREFIX}/${view}`}
        >
          {viewNames[i]}
        </Link>
      ))}
    </div>
    <div className="navMenu right">
      <Link
        className="btn solidBtn profileBtn"
        to={user ? `${window.ADDR_PREFIX}/profile` : `${window.ADDR_PREFIX}/login`}
      >
        {user && <img src={user.gravatar_link + '?s=48'} />}
        {user ? `${user.firstname} ${user.lastname}` : 'Login'}
      </Link>
    </div>
  </nav>
);

export default NavBar;