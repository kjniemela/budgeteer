import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';

class SavingsEnvelope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      envelope: null,
      envelopeNames: {},
    };
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const { envelopeId } = this.props;
    const basePath = window.location.pathname;
    let { data: envelope } = await axios.get(basePath + `api/envelopes/${envelopeId}`);
    let { data: envelopeNameData } = await axios.get(basePath + 'api/envelopenames');
    const envelopeNames = {};
    envelopeNameData.map(item => {
      if (item.id !== envelopeId) envelopeNames[item.id] = item.title;
    });
    this.setState({ envelope, envelopeNames });
  }

  async transferFunds({ amount, destinationId }) {
    const { envelopeId } = this.props;
    const { envelopeNames } = this.state;

    const expenseEntry = {
      amount,
      vendor: 'TRANSFER',
      memo: `From ${envelopeNames[envelopeId]} to ${envelopeNames[destinationId]}`,
      date: new Date(),
      envelope: envelopeId,
    };
    const incomeEntry = {
      amount,
      source: 'TRANSFER',
      memo: `From ${envelopeNames[envelopeId]} to ${envelopeNames[destinationId]}`,
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
    const { envelope, envelopeNames, showTransferForm } = this.state;

    return (
      <>
        {envelope && (
          <>
            <PageTitle title={envelope.title} />
            <div className="stack">
              <div className="centered">
                <h3>Account Balance: ${envelope.balance || envelope.net_deposits || 0}</h3>
              </div>
              <button
                className="textBtn"
                onClick={() => this.setState({ showTransferForm: !showTransferForm })}
              >
                Withdraw funds
              </button>
              {showTransferForm && (
                <InputForm submitFn={this.transferFunds} fields={{
                  amount: 'Amount',
                  destinationId: 'Destination Envelope',
                }} required={{
                  amount: true,
                  destinationId: true,
                }} types={{
                  amount: 'number',
                  destinationId: 'select',
                }} dropdownOptions={{
                  destinationId: envelopeNames,
                }} />
              )}
            </div>
          </>
        )}
      </>
    );
  }
}

export default SavingsEnvelope;