import React from 'react';
import axios from 'axios';

import Home from './views/Home.jsx';
import Login from './views/Login.jsx';
import Signup from './views/Signup.jsx';
import Profile from './views/Profile.jsx';

import NavBar from './components/NavBar.jsx';
import ExpensesList from './views/ExpensesList.jsx';
import EnvelopeList from './views/EnvelopeList.jsx';
import IncomeList from './views/IncomeList.jsx';
import BudgetsList from './views/BudgetsList.jsx';
import Budget from './views/Budget.jsx';
import SavingsList from './views/SavingsList.jsx';
import SavingsEnvelope from './views/SavingsEnvelope.jsx';
import ContactsList from './views/ContactsList.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'home',
      viewData: null,
      darkMode: false,
      user: null,
    };

    this.setDarkMode = this.setDarkMode.bind(this);
    this.setView = this.setView.bind(this);
    this.verifySession = this.verifySession.bind(this);
  }

  componentDidMount() {
    this.verifySession();
  }

  async verifySession() {
    const basePath = window.location.pathname;
    await axios.get(basePath + 'verify')
    .then(({ data }) => {
      this.setState({ user: data });
    })
    .catch(({ response }) => {
      if (response.status === 401) {
        this.setState({ user: null });
        this.setView('login');
      } else {
        console.error(response);
      }
    })
  }

  setDarkMode(darkMode) {
    this.setState({ darkMode });
  }

  setView(view, viewData=null) {
    this.setState({ view, viewData });
  }

  render() {
    const { view, darkMode, user, viewData } = this.state;
    return (
      <div className={darkMode ? 'dark' : 'light'}>
        <div className="page">
          <NavBar setView={this.setView} user={user} />
          <div className="content">
            {view === 'home' && <Home setView={this.setView} />}
            {view === 'profile' && (
              <Profile
                setView={this.setView}
                verifySession={this.verifySession}
                user={user}
                setDarkMode={this.setDarkMode}
                darkMode={darkMode}
              />
            )}
            {view === 'login' && <Login setView={this.setView} verifySession={this.verifySession} />}
            {view === 'signup' && <Signup setView={this.setView} verifySession={this.verifySession} />}
            {view === 'budgets' && <BudgetsList setView={this.setView} />}
            {view === 'envelopes' && <EnvelopeList setView={this.setView} />}
            {view === 'expenses' && <ExpensesList setView={this.setView} envelopeId={viewData} />}
            {view === 'income' && <IncomeList setView={this.setView} />}
            {view === 'savingsenvelopes' && <SavingsList setView={this.setView} />}
            {view === 'budget' && <Budget setView={this.setView} budgetId={viewData} />}
            {view === 'savings' && <SavingsEnvelope setView={this.setView} envelopeId={viewData} />}
            {view === 'contacts' && <ContactsList user={user} setView={this.setView} envelopeId={viewData} />}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
