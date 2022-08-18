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
      } else {
        console.error(response);
      }
    })
  }

  setDarkMode(darkMode) {
    this.setState({ darkMode });
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
          <Router>
            <NavBar user={user} />
            <div className="content">
              {verifying ? null : (
                <Routes>
                  <Route path={`${ADDR_PREFIX}/`} element={
                    <Home />
                  } />
                  <Route path={`${ADDR_PREFIX}/profile`} element={
                    <Profile
                      verifySession={this.verifySession}
                      user={user}
                      setDarkMode={this.setDarkMode}
                      darkMode={darkMode}
                    />
                  } />
                  <Route path={`${ADDR_PREFIX}/login`} element={
                    <Login verifySession={this.verifySession} />
                  } />
                  <Route path={`${ADDR_PREFIX}/signup`} element={
                    <Signup verifySession={this.verifySession} />
                  } />
                  <Route path={`${ADDR_PREFIX}/budgets`} element={
                    <BudgetsList />
                  } />
                  <Route path={`${ADDR_PREFIX}/accounts`} element={
                    <EnvelopeList />
                  } />
                  <Route path={`${ADDR_PREFIX}/expenses`} element={
                    <ExpensesList envelopeId={viewData} />
                  } />
                  <Route path={`${ADDR_PREFIX}/income`} element={
                    <IncomeList />
                  } />
                  <Route path={`${ADDR_PREFIX}/goals`} element={
                    <SavingsList />
                  } />
                  <Route path={`${ADDR_PREFIX}/budgets/:budgetId`} element={
                    <BudgetWrapper user={user} />
                  } />
                  <Route path={`${ADDR_PREFIX}/accounts/:envelopeId`} element={
                    <EnvelopeWrapper user={user} />
                  } />
                  {/* TODO - probably remove this route? */}
                  <Route path={`${ADDR_PREFIX}/savings/:envelopeId`} element={
                    <SavingsEnvelopeWrapper />
                  } />
                  <Route path={`${ADDR_PREFIX}/contacts`} element={
                    <ContactsList user={user} />
                  } />
                </Routes>
              )}
            </div>
          </Router>
        </div>
      </div>
    );
  }
}

export default App;

{/* {view === 'home' && <Home />}
    {view === 'profile' && (
      <Profile
       
        verifySession={this.verifySession}
        user={user}
        setDarkMode={this.setDarkMode}
        darkMode={darkMode}
      />
    )}
    {view === 'login' && <Login verifySession={this.verifySession} />}
    {view === 'signup' && <Signup verifySession={this.verifySession} />}
    {view === 'budgets' && <BudgetsList />}
    {view === 'envelopes' && <EnvelopeList />}
    {view === 'expenses' && <ExpensesList envelopeId={viewData} />}
    {view === 'income' && <IncomeList />}
    {view === 'savingsenvelopes' && <SavingsList />}
    {view === 'budget' && <Budget user={user} budgetId={viewData} />}
    {view === 'envelope' && <Envelope user={user} envelopeId={viewData} />}
    {view === 'savings' && <SavingsEnvelope envelopeId={viewData} />}
    {view === 'contacts' && <ContactsList user={user} envelopeId={viewData} />} */}