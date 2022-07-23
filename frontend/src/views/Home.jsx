import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    let { data: balance } = await axios.get(basePath + 'api/balance');
    this.setState({ balance });
  }

  render() {
    const { setView } = this.props;
    const { balance } = this.state;

    return (
      <>
        <PageTitle title={'Home'} />
        <div className="stack" >
          <h2 className="centered">Current Total Balance: {balance !== null ? `$${balance.balance}` : 'N/A'}</h2>
          <button className="solidBtn halfWidth" onClick={() => setView('budgets')}>Budgets</button>
          <button className="solidBtn halfWidth" onClick={() => setView('envelopes')}>Accounts</button>
          <button className="solidBtn halfWidth" onClick={() => setView('expenses')}>Expenses</button>
          <button className="solidBtn halfWidth" onClick={() => setView('income')}>Income</button>
          <button className="solidBtn halfWidth" onClick={() => setView('savingsenvelopes')}>Savings</button>
          <button className="solidBtn halfWidth" onClick={() => setView('contacts')}>Contacts</button>
        </div>
      </>
    );
  }
}

export default Home;