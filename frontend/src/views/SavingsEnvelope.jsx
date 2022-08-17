import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';
import Alert from '../components/Alert.jsx';

class SavingsEnvelope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      envelope: null,
      savingsGoals: {},
      envelopeNames: {},
      showTransferForm: false,
      editMode: false,
      showAlert: false,
      alertCallback: () => {},
    };
    this.fetchData = this.fetchData.bind(this);
    this.transferFunds = this.transferFunds.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.editAlloc = this.editAlloc.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const { envelopeId } = this.props;
    let { data: envelope } = await axios.get(`api/envelopes/${envelopeId}`);
    let { data: savingsGoals } = await axios.get(`api/envelopes/${envelopeId}/savings`);
    let { data: envelopeNameData } = await axios.get('api/envelopenames');
    const envelopeNames = {};
    envelopeNameData.map(item => {
      if (item.id !== envelopeId) envelopeNames[item.id] = item.title;
    });
    this.setState({ envelope, savingsGoals, envelopeNames });
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

    await axios.post('api/expenses', expenseEntry);
    await axios.post('api/income', incomeEntry);
   
    this.fetchData();
  }

  async toggleEdit() {
    const { editMode } = this.state;
    await this.fetchData();
    this.setState({ editMode: !editMode });
  }

  editAlloc(index, newAlloc) {
    const { savingsGoals } = this.state;
    const newGoals = [ ...savingsGoals ];
    const oldAlloc = newGoals[index].alloc_pr;
    newGoals[index].alloc_pr = newAlloc;
    this.setState({ savingsGoals: newGoals });
  }

  async showValidationAlert() {
    await new Promise((resolve, reject) => {
      this.setState({ showAlert: true, alertCallback: resolve });
    });
  }

  async validate(depth=0, goals=null) {
    const { savingsGoals } = this.state;
    const newGoals = goals || [ ...savingsGoals ];
    const oldAlloc = newGoals.reduce((prev, goal) => prev + Number(goal.alloc_pr), 0);
    if (Math.round(oldAlloc * 10000) / 10000 !== 100) {
      for (let i = 0; i < newGoals.length; i++) {
        newGoals[i].alloc_pr = (newGoals[i].alloc_pr / oldAlloc) * 100;
      }
      if (depth < 10) {
        await this.validate(depth+1, newGoals);
        return;
      }
    }
    if (depth > 0) await this.showValidationAlert();
    for (let i = 0; i < newGoals.length; i++) {
      newGoals[i].alloc_weight = newGoals[i].alloc_pr * 100;
    }
    this.setState({ savingsGoals: newGoals, showAlert: false });
  }

  async save() {
    const { envelopeId } = this.props;
    const { savingsGoals } = this.state;
    await this.validate();
    await axios.put(`api/envelopes/${envelopeId}/savings`, savingsGoals);
    this.fetchData();
    this.setState({ editMode: false });
  }

  /**
   * round `value` to two decimal points, representing a value in dollars and cents
   * @param {*} value 
   */
  round(value) {
    return Math.round(value * 100) / 100;
  }

  /**
   * floor `value` to two decimal points, representing a value in dollars and cents
   * @param {*} value 
   */
  floor(value) {
    return Math.floor(value * 100) / 100;
  }

  render() {
    const { name, setView } = this.props;
    const { envelope, savingsGoals, envelopeNames, showTransferForm, editMode, showAlert, alertCallback } = this.state;

    const balance = envelope?.balance || envelope?.net_deposits || 0;

    return (
      <>
        {envelope && (
          <>
            <PageTitle title={envelope.title} />
            <div className="stack">
              <div className="centered">
                <h3>Account Balance: ${balance}</h3>
                {showAlert && (
                  <Alert callback={alertCallback}>
                    <p>
                      The entered percentages do not add up to 100%.<br />Percentages will be automatically adjusted.
                    </p>
                  </Alert>
                )}
              </div>
              <div  className="enhancedTable">
                <div className="tableBtns">
                  <button
                    className="textBtn"
                    onClick={this.fetchData}
                  >
                    Refresh
                  </button>
                  {editMode && (
                    <button
                      className="textBtn"
                      onClick={this.save}
                    >
                      Save
                    </button>
                  )}
                  <button
                    className="textBtn"
                    onClick={this.toggleEdit}
                  >
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>Amount Saved</th>
                      <th>From This Account</th>
                      <th>Allocation %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsGoals.map((goal, i) => (
                      <tr>
                        <td>{goal.memo}</td>
                        <td>${this.floor(goal.alloc)}</td>
                        <td>${this.floor(balance  * (goal.alloc_pr / 100))}</td>
                        {editMode ? (
                          <div className="leftCell tableInput">
                            <input
                              value={this.round(goal.alloc_pr)}
                              type="number"
                              onChange={(({ target }) => this.editAlloc(i, target.value))}
                            />
                          </div>
                        ) : (
                          <td>{this.round(goal.alloc_pr)}%</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  destinationId: 'Destination Account',
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