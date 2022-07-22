import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const envelopeColumns = [
  {
      id: 'memo',
      numeric: false,
      disablePadding: false,
      label: 'Name',
  },
  {
    id: 'target_amount',
    numeric: true,
    label: 'Target Amount',
    prefix: '$',
  },
  {
    id: 'balance',
    numeric: true,
    label: 'Current Balance',
    prefix: '$',
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
      showSavingsForm: false,
      showTransferForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitGoal = this.submitGoal.bind(this);
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
    let { data: savings } = await axios.get(basePath + 'api/savings');
    // savings = savings.map(row => ({
    //   ...row,
    // }));
    let { data: budgetData } = await axios.get(basePath + 'api/budgetnames');
    const budgets = {};
    budgetData.map(row => budgets[row.id] = row.title);
    this.setState({ envelopes, savings, envelopeNames, budgets });
  }

  submitGoal(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/savings', { ...data })
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
    const { envelopes, savings, envelopeNames, budgets, showSavingsForm, showTransferForm } = this.state;

    const envelopeOptions = {};
    envelopes.map(row => envelopeOptions[row.id] = row.title);

    return (
      <>
        <PageTitle title={'Savings Goals'} />
        <div className="stack">
          <EnhancedTable refresh={this.fetchData} columns={envelopeColumns} rows={savings} onClicks={{
            title: (row) => setView('savings', row.id),
          }} />
          <button
            className="textBtn"
            onClick={() => this.setState({ showSavingsForm: !showSavingsForm })}
          >
            Add new savings goal
          </button>
          {showSavingsForm && (
            <InputForm submitFn={this.submitGoal} fields={{
              memo: 'Name',
              target_amount: 'Target Amount',
            }} required={{
              memo: true,
              target_amount: true,
            }} types={{
              target_amount: 'number',
            }} />
          )}
          {/* <button
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
          )} */}
        </div>
      </>
    );
  }
}

export default SavingsList;