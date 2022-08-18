import React from 'react';
import { Link } from 'react-router-dom';
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
    let { data: balance } = await axios.get(`${window.ADDR_PREFIX}/api/balance`);
    this.setState({ balance });
  }

  render() {
    const { setView } = this.props;
    const { balance } = this.state;
    const ADDR_PREFIX = window.ADDR_PREFIX;

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
            <Link className="btn solidBtn halfWidth" to={`${ADDR_PREFIX}/budgets`}>Budgets</Link>
            <Link className="btn solidBtn halfWidth" to={`${ADDR_PREFIX}/accounts`}>Accounts</Link>
            <Link className="btn solidBtn halfWidth" to={`${ADDR_PREFIX}/expenses`}>Expenses</Link>
            <Link className="btn solidBtn halfWidth" to={`${ADDR_PREFIX}/income`}>Income</Link>
            <Link className="btn solidBtn halfWidth" to={`${ADDR_PREFIX}/goals`}>Goals</Link>
            <Link className="btn solidBtn halfWidth" to={`${ADDR_PREFIX}/contacts`}>Contacts</Link>
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