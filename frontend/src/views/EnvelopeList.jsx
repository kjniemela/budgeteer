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
      envelopeNames: {},
      budgets: {},
      showEnvelopeForm: false,
      showTransferForm: false,
      showBudgetForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEnvelope = this.submitEnvelope.bind(this);
    this.transferFunds = this.transferFunds.bind(this);
    this.setBudget = this.setBudget.bind(this);
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
    let { data: budgetData } = await axios.get(basePath + 'api/budgetnames');
    const budgets = {};
    budgetData.map(row => budgets[row.id] = row.title);
    this.setState({ envelopes, envelopeNames, budgets });
  }

  submitEnvelope(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/envelopes', data)
    .then(() => {
      this.fetchData();
    })
  }

  async transferFunds({ date, amount, sourceId, destinationId }) {
    const { envelopeNames } = this.state;

    const expenseEntry = {
      amount,
      vendor: 'TRANSFER',
      memo: `From ${envelopeNames[sourceId]} to ${envelopeNames[destinationId]}`,
      date: date || new Date(),
      envelope: sourceId,
    };
    const incomeEntry = {
      amount,
      source: 'TRANSFER',
      memo: `From ${envelopeNames[sourceId]} to ${envelopeNames[destinationId]}`,
      date: date || new Date(),
      envelope: destinationId,
    };

    const basePath = window.location.pathname;
    await axios.post(basePath + 'api/expenses', expenseEntry);
    await axios.post(basePath + 'api/income', incomeEntry);
   
    this.fetchData();
  }

  async setBudget({ envelope, budget }) {
    const basePath = window.location.pathname;
    await axios.put(basePath + `api/envelopes/${envelope}`, { budget_id: budget || null });

    this.fetchData();
  }

  render() {
    const { name, setView } = this.props;
    const { envelopes, envelopeNames, budgets, showEnvelopeForm, showTransferForm, showBudgetForm } = this.state;

    const envelopeOptions = {};
    envelopes.map(row => envelopeOptions[row.id] = row.title);

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    return (
      <>
        <PageTitle title={'Accounts'} />
        <div className="stack">
          <EnhancedTable refresh={this.fetchData} columns={envelopeColumns} rows={envelopes} onClicks={{
            title: (row) => {
              if (row.is_savings) setView('savings', row.id);
              else setView('expenses', row.id);
            },
          }} />
          <button
            className="textBtn"
            onClick={() => this.setState({ showEnvelopeForm: !showEnvelopeForm })}
          >
            Add new account
          </button>
          {showEnvelopeForm && (
            <InputForm submitFn={this.submitEnvelope} fields={{
              title: 'Name',
              savings: 'Type',
              budget: 'Budget',
            }} required={{
              title: true,
              savings: true,
            }} types={{
              budget: 'select',
              savings: 'select',
            }} dropdownOptions={{
              budget: budgets,
              savings: {
                0: 'Checking',
                1: 'Savings',
              }
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
              date: 'Date',
              amount: 'Amount',
              sourceId: 'Source Account',
              destinationId: 'Destination Account',
            }} required={{
              amount: true,
              sourceId: true,
              destinationId: true,
            }} types={{
              date: 'datetime-local',
              amount: 'number',
              sourceId: 'select',
              destinationId: 'select',
            }} defaults={{
              date: dateString,
            }} dropdownOptions={{
              sourceId: envelopeNames,
              destinationId: envelopeNames,
            }} />
          )}
          <button
            className="textBtn"
            onClick={() => this.setState({ showBudgetForm: !showBudgetForm })}
          >
            Set account budget
          </button>
          {showBudgetForm && (
            <InputForm submitFn={this.setBudget} fields={{
              envelope: 'Account',
              budget: 'Budget',
            }} required={{
              envelope: true,
            }} types={{
              envelope: 'select',
              budget: 'select',
            }} dropdownOptions={{
              envelope: envelopeNames,
              budget: budgets,
            }} />
          )}
        </div>
      </>
    );
  }
}

export default EnvelopeList;