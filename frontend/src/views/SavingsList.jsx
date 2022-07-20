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
    label: 'Net Withdrawals',
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

class SavingsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      envelopes: [],
      savings: [],
      envelopeNames: {},
      budgets: {},
      showEnvelopeForm: false,
      showTransferForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEnvelope = this.submitEnvelope.bind(this);
    this.transferFunds = this.transferFunds.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    let { data: envelopes } = await axios.get(basePath + 'api/envelopes');
    const envelopeNames = {};
    envelopes = envelopes.map(row => {
      envelopeNames[row.id] = row.title;

      return ({
        ...row,
        last_used: row.last_used ? new Date(row.last_used) : null,
        last_deposit: row.last_deposit ? new Date(row.last_deposit) : null,  
      })
    });
    let { data: savings } = await axios.get(basePath + 'api/envelopes?savings=1');
    savings = savings.map(row => ({
      ...row,
      last_used: row.last_used ? new Date(row.last_used) : null,
      last_deposit: row.last_deposit ? new Date(row.last_deposit) : null,  
    }));
    let { data: budgetData } = await axios.get(basePath + 'api/budgetnames');
    const budgets = {};
    budgetData.map(row => budgets[row.id] = row.title);
    this.setState({ envelopes, savings, envelopeNames, budgets });
  }

  submitEnvelope(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/envelopes', { ...data, savings: 1 })
    .then(() => {
      this.fetchData();
    })
  }

  async transferFunds({ amount, sourceId, destinationId }) {
    const { envelopeNames } = this.state;

    const expenseEntry = {
      amount,
      vendor: 'TRANSFER',
      memo: `From ${envelopeNames[sourceId]} to ${envelopeNames[destinationId]}`,
      date: new Date(),
      envelope: sourceId,
    };
    const incomeEntry = {
      amount,
      source: 'TRANSFER',
      memo: `From ${envelopeNames[sourceId]} to ${envelopeNames[destinationId]}`,
      date: new Date(),
      envelope: destinationId,
    };

    const basePath = window.location.pathname;
    await axios.post(basePath + 'api/expenses', expenseEntry);
    await axios.post(basePath + 'api/income', incomeEntry);
   
    this.fetchData();
  }

  render() {
    const { name, setView } = this.props;
    const { envelopes, savings, envelopeNames, budgets, showEnvelopeForm, showTransferForm } = this.state;

    const envelopeOptions = {};
    envelopes.map(row => envelopeOptions[row.id] = row.title);

    return (
      <>
        <PageTitle title={'Savings Envelopes'} />
        <div className="stack">
          <EnhancedTable refresh={this.fetchData} columns={envelopeColumns} rows={savings} onClicks={{
            title: (row) => setView('savings', row.id),
          }} />
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
          <button
            className="textBtn"
            onClick={() => this.setState({ showTransferForm: !showTransferForm })}
          >
            Transfer funds
          </button>
          {showTransferForm && (
            <InputForm submitFn={this.transferFunds} fields={{
              amount: 'Amount',
              sourceId: 'Source Envelope',
              destinationId: 'Destination Envelope',
            }} required={{
              amount: true,
              sourceId: true,
              destinationId: true,
            }} types={{
              amount: 'number',
              sourceId: 'select',
              destinationId: 'select',
            }} dropdownOptions={{
              sourceId: envelopeNames,
              destinationId: envelopeNames,
            }} />
          )}
        </div>
      </>
    );
  }
}

export default SavingsList;