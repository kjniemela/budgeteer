import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import TabGroup from '../components/TabGroup.jsx';

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
    let { data: balance } = await axios.get('api/balance');
    this.setState({ balance });
  }

  render() {
    const { setView } = this.props;
    const { balance } = this.state;

    const tabs = {
      summary: {
        displayName: 'Summary',
        content: (
          <div className="stack" >
            <h2 className="centered">Net Worth: {balance !== null ? `$${balance.balance}` : 'N/A'}</h2>
          </div>
        ),
      },
      pages: {
        displayName: 'Pages',
        content: (
          <div className="stack" >
            <button className="solidBtn halfWidth" onClick={() => setView('budgets')}>Budgets</button>
            <button className="solidBtn halfWidth" onClick={() => setView('envelopes')}>Accounts</button>
            <button className="solidBtn halfWidth" onClick={() => setView('expenses')}>Expenses</button>
            <button className="solidBtn halfWidth" onClick={() => setView('income')}>Income</button>
            <button className="solidBtn halfWidth" onClick={() => setView('savingsenvelopes')}>Savings</button>
            <button className="solidBtn halfWidth" onClick={() => setView('contacts')}>Contacts</button>
          </div>
        ),
      },
    };

    return (
      <>
        <PageTitle title={'Home'} />
        <div className="paper">
          <TabGroup tabs={tabs} />
        </div>
      </>
    );
  }
}

export default Home;