import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const envelopeColumns = [
  {
      id: 'title',
      numeric: false,
      disablePadding: false,
      label: 'Name',
  },
  {
    id: 'balance',
    numeric: true,
    label: 'Current Balance',
    prefix: '$',
  },
  {
    id: 'net_deposits',
    numeric: true,
    label: 'Net Deposits',
    prefix: '$',
  },
  {
    id: 'net_expenses',
    numeric: true,
    label: 'Net Expenses',
    prefix: '$',
  },
  {
    id: 'budget',
    numeric: false,
    label: 'Budget',
  },
  {
    id: 'last_used',
    numeric: false,
    isDate: true,
    label: 'Last withdrawn from',
  },
  {
    id: 'last_deposit',
    numeric: false,
    isDate: true,
    label: 'Last deposited to',
  },
]

class EnvelopeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      envelopes: [],
      budgets: {},
      balance: null,
      showEnvelopeForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEnvelope = this.submitEnvelope.bind(this);
    this.submitDeposit = this.submitDeposit.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    let { data: envelopes } = await axios.get(basePath + 'api/envelopes')
    let { data: balance } = await axios.get(basePath + 'api/balance')
    envelopes = envelopes.map(row => ({
      ...row,
      last_used: row.last_used ? new Date(row.last_used) : null,
      last_deposit: row.last_deposit ? new Date(row.last_deposit) : null,  
    }));
    let { data: budgetData } = await axios.get(basePath + 'api/budgetnames');
    const budgets = {};
    budgetData.map(row => budgets[row.id] = row.title);
    this.setState({ envelopes, budgets, balance });
  }

  submitEnvelope(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/envelopes', data)
    .then(() => {
      this.fetchData();
    })
  }

  submitDeposit(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + `api/deposits`, data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name, setView } = this.props;
    const { envelopes, budgets, showEnvelopeForm, showDepositForm, balance } = this.state;

    const envelopeOptions = {};
    envelopes.map(row => envelopeOptions[row.id] = row.title);

    return (
      <>
        <PageTitle title={'Envelopes'} />
        <div className="stack">
          <h2>Current Balance: ${balance ? balance.balance : 'N/A'}</h2>
          <EnhancedTable refresh={this.fetchData} columns={envelopeColumns} rows={envelopes} />
          <button
            className="textBtn"
            onClick={() => this.setState({ showEnvelopeForm: !showEnvelopeForm })}
          >
            Add new envelope
          </button>
          {showEnvelopeForm && (
            <InputForm submitFn={this.submitEnvelope} fields={{
              title: 'Name',
              budget: 'Budget',
            }} required={{
              title: true,
            }} types={{
              budget: 'select',
            }} dropdownOptions={{
              budget: budgets,
            }} />
          )}
        </div>
      </>
    );
  }
}

export default EnvelopeList;