import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
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
import Envelope from './views/Envelope.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'home',
      viewData: null,
      darkMode: false,
      verifying: true,
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
    await axios.get(`${window.ADDR_PREFIX}/verify`)
    .then(({ data }) => {
      this.setState({ user: data, verifying: false });
    })
    .catch(({ response }) => {
      if (response.status === 401) {
        this.setState({ user: null, verifying: false });
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
    const { view, darkMode, user, verifying, viewData } = this.state;
    const ADDR_PREFIX = window.ADDR_PREFIX;

    const BudgetWrapper = (props) => {
      const params = useParams();
      return <Budget {...{ ...props }} budgetId={params.budgetId} />;
    };

    const EnvelopeWrapper = (props) => {
      const params = useParams();
      return <Envelope {...{ ...props }} envelopeId={params.envelopeId} />;
    };

    const SavingsEnvelopeWrapper = (props) => {
      const params = useParams();
      return <SavingsEnvelope {...{ ...props }} envelopeId={params.envelopeId} />;
    };

    return (
      <div className={darkMode ? 'dark' : 'light'}>
        <div className="page">
          <NavBar setView={this.setView} user={user} />
          <div className="content">
            {verifying ? null : (
              <Router>
                <Routes>
                  <Route path={`${ADDR_PREFIX}/`} element={
                    <Home setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/profile`} element={
                    <Profile
                      setView={this.setView}
                      verifySession={this.verifySession}
                      user={user}
                      setDarkMode={this.setDarkMode}
                      darkMode={darkMode}
                    />
                  } />
                  <Route path={`${ADDR_PREFIX}/login`} element={
                    <Login setView={this.setView} verifySession={this.verifySession} />
                  } />
                  <Route path={`${ADDR_PREFIX}/signup`} element={
                    <Signup setView={this.setView} verifySession={this.verifySession} />
                  } />
                  <Route path={`${ADDR_PREFIX}/budgets`} element={
                    <BudgetsList setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/accounts`} element={
                    <EnvelopeList setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/expenses`} element={
                    <ExpensesList setView={this.setView} envelopeId={viewData} />
                  } />
                  <Route path={`${ADDR_PREFIX}/income`} element={
                    <IncomeList setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/goals`} element={
                    <SavingsList setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/budgets/:budgetId`} element={
                    <BudgetWrapper user={user} setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/accounts/:envelopeId`} element={
                    <EnvelopeWrapper user={user} setView={this.setView} />
                  } />
                  {/* TODO - probably remove this route? */}
                  <Route path={`${ADDR_PREFIX}/savings/:envelopeId`} element={
                    <SavingsEnvelopeWrapper setView={this.setView} />
                  } />
                  <Route path={`${ADDR_PREFIX}/contacts`} element={
                    <ContactsList user={user} setView={this.setView} />
                  } />
                </Routes>
                {/* {view === 'home' && <Home setView={this.setView} />}
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
                {view === 'budget' && <Budget user={user} setView={this.setView} budgetId={viewData} />}
                {view === 'envelope' && <Envelope user={user} setView={this.setView} envelopeId={viewData} />}
                {view === 'savings' && <SavingsEnvelope setView={this.setView} envelopeId={viewData} />}
                {view === 'contacts' && <ContactsList user={user} setView={this.setView} envelopeId={viewData} />} */}
              </Router>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
