import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';
import TabGroup from '../components/TabGroup.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import Alert from '../components/Alert.jsx';
import TextBtn from '../components/buttons/TextBtn.jsx';

const expenseColumns = [
  {
    id: 'posted_on',
    numeric: false,
    isDate: true,
    label: 'Date',
  },
  {
    id: 'amount',
    numeric: true,
    label: 'Amount',
    prefix: '$',
  },
  {
    id: 'vendor',
    numeric: false,
    label: 'Location',
  },
  {
    id: 'memo',
    numeric: false,
    label: 'Memo',
  },
  {
    id: 'posted_by',
    numeric: false,
    label: 'Posted By',
  },
  {
    id: 'column',
    numeric: false,
    label: 'Budget Column',
  },
  {
    id: 'docref',
    numeric: false,
    label: 'Doc #',
  },
];

const incomeColumns = [
  {
      id: 'posted_on',
      numeric: false,
      isDate: true,
      label: 'Date',
  },
  {
    id: 'amount',
    numeric: true,
    label: 'Amount',
    prefix: '$',
  },
  {
    id: 'source',
    numeric: false,
    label: 'From',
  },
  {
    id: 'memo',
    numeric: false,
    label: 'Memo',
  },
  {
    id: 'posted_to',
    numeric: false,
    label: 'Posted To',
  },
  {
    id: 'docref',
    numeric: false,
    label: 'Doc #',
  },
];

const permColumns = [
  {
      id: 'user_name',
      numeric: false,
      label: 'User Name',
  },
  {
      id: 'email',
      numeric: false,
      label: 'Email',
  },
  {
      id: 'permissionLvl',
      numeric: true,
      label: 'Permission Level',
  },
];

class Envelope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      envelope: {},
      expenses: [],
      income: [],
      envelopes: {},
      budgets: {},
      contacts: {},
      savingsGoals: [],
      showEntryForm: false,
      editMode: false,
      showPercentAlert: false,
      alertCallback: () => {},
    };
    this.fetchData = this.fetchData.bind(this);
    this.fetchEnvelope = this.fetchEnvelope.bind(this);
    this.fetchEnvelopeNames = this.fetchEnvelopeNames.bind(this);
    this.fetchExpenses = this.fetchExpenses.bind(this);
    this.fetchIncome = this.fetchIncome.bind(this);
    this.fetchContacts = this.fetchContacts.bind(this);
    this.fetchSavingsGoals = this.fetchSavingsGoals.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.changeUserPermissions = this.changeUserPermissions.bind(this);
    this.saveSavingsGoals = this.saveSavingsGoals.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    // await these?
    this.fetchEnvelope();
    this.fetchEnvelopeNames();
    this.fetchExpenses();
    this.fetchIncome();
    this.fetchContacts();
    this.fetchSavingsGoals();
  }

  async fetchEnvelope() {
    const { envelopeId } = this.props;
    const { data: envelope } = await axios.get(`${window.ADDR_PREFIX}/api/envelopes/${envelopeId}`);
    envelope.perms = envelope.perms.map(row => ({
      ...row,
      id: row.user_id,
    }));
    this.setState({ envelope });
  }

  async fetchEnvelopeNames() {
    let { data: envelopeData } = await axios.get(`${window.ADDR_PREFIX}/api/envelopenames`);
    const envelopes = {};
    const budgets = {};
    envelopeData.map(row => {
      envelopes[row.id] = row.title;
      budgets[row.id] = row.budget_id;
    });
    this.setState({ envelopes, budgets });
  }

  async fetchExpenses() {
    const { envelopeId } = this.props;
    let { data: expenses } = await axios.get(`${window.ADDR_PREFIX}/api/expenses?envelope=${envelopeId}`);
    expenses = expenses.map(row => ({
      ...row,
      posted_on: new Date(row.posted_on),
      column: row.column || '',
    }));
    this.setState({ expenses });
  }

  async fetchIncome() {
    const { envelopeId } = this.props;
    const { data } = await axios.get(`${window.ADDR_PREFIX}/api/income/?envelope=${envelopeId}`)
    const income = data.map(row => ({...row, posted_on: new Date(row.posted_on)}));
    this.setState({ income });
  }

  async fetchContacts() {
    const { envelopeId, user } = this.props;
    if (user) {
      const basePath = window.location.pathname;
      const contacts = {};
      const { data } = await axios.get(`${window.ADDR_PREFIX}/api/contacts`);
      data.map(contact => {
        if (contact.user_id === user.id) contacts[contact.contact_id] = contact.contact_name;
        else contacts[contact.user_id] = contact.user_name; 
      });
      this.setState({ contacts });
    }
  }

  async fetchSavingsGoals() {
    const { envelopeId } = this.props;
    let { data: savingsGoals } = await axios.get(`${window.ADDR_PREFIX}/api/envelopes/${envelopeId}/savings`);
    savingsGoals = savingsGoals.map(goal => ({
      ...goal,
      alloc_pr: goal.alloc_weight / 10_000,
    }));
    this.setState({ savingsGoals });
  }

  async toggleEdit() {
    const { editMode } = this.state;
    await this.fetchData();
    this.setState({ editMode: !editMode });
  }

  async changeUserPermissions({ user_id, permissionLvl }) {
    const { envelopeId } = this.props;
    await axios.put(`${window.ADDR_PREFIX}/api/envelopes/permissions`, {
      user_id,
      envelope_id: envelopeId,
      permissionLvl,
    });
    this.fetchEnvelope();
  }
  
  editAlloc(index, newAlloc) {
    const { savingsGoals } = this.state;
    const newGoals = [ ...savingsGoals ];
    const oldAlloc = newGoals[index].alloc_pr;
    newGoals[index].alloc_pr = newAlloc;

    const totalSavingsAlloc = newGoals.map(goal => Number(goal.alloc_pr)).reduce((a, x) => a + x, 0);
    if (totalSavingsAlloc > 100) {
      newAlloc -= totalSavingsAlloc - 100;
      newGoals[index].alloc_pr = newAlloc;
    }

    this.setState({ savingsGoals: newGoals });
  }

  async showValidationAlert() {
    await new Promise((resolve, reject) => {
      this.setState({ showPercentAlert: true, alertCallback: resolve });
    });
  }

  async validateAlloc(depth=0, goals=null) {
    const { savingsGoals, envelope } = this.state;
    const balance = envelope?.balance || envelope?.net_deposits || 0;
    const newGoals = goals || [ ...savingsGoals ];
    const oldAlloc = newGoals.reduce((prev, goal) => prev + Number(goal.alloc_pr), 0);
    if (oldAlloc > 100) {
      for (let i = 0; i < newGoals.length; i++) {
        newGoals[i].alloc_pr = (newGoals[i].alloc_pr / oldAlloc) * 100;
      }
      if (depth < 10) {
        await this.validateAlloc(depth+1, newGoals);
        return;
      }
    }
    if (depth > 0) await this.showValidationAlert();
    for (let i = 0; i < newGoals.length; i++) {
      if (this.floor(newGoals[i].alloc_pr / 100 * balance) > newGoals[i].target_amount) {
        newGoals[i].alloc_pr = this.ceil(newGoals[i].target_amount / balance, 6) * 100;
      }
      newGoals[i].alloc_weight = newGoals[i].alloc_pr * 10_000;
    }
    this.setState({ savingsGoals: newGoals, showPercentAlert: false });
  }

  async saveSavingsGoals() {
    const { envelopeId } = this.props;
    const { savingsGoals } = this.state;
    await this.validateAlloc();
    await axios.put(`${window.ADDR_PREFIX}/api/envelopes/${envelopeId}/savings`, savingsGoals);
    this.fetchData();
    this.setState({ editMode: false });
  }

  /**
   * round `value` to specified number of decimal points
   * @param {number} value
   * @param {number} digits
   */
  round(value, digits=2) {
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  /**
   * floor `value` to specified number of decimal points
   * @param {number} value
   * @param {number} digits
   */
  floor(value, digits=2) {
    return Math.floor(value * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  /**
   * ceil `value` to specified number of decimal points
   * @param {number} value
   * @param {number} digits
   */
   ceil(value, digits=2) {
    return Math.ceil(value * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  render() {
    const { envelopeId, setView } = this.props;
    const { 
      envelope, expenses, income, envelopes, budgets, contacts, savingsGoals,
      showEntryForm,
      editMode,
      showPercentAlert,
      alertCallback
    } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    const balance = envelope?.balance || envelope?.net_deposits || 0;

    const tabs = {
      expenses: {
        displayName: 'Expenses',
        content: (
          <div className="stack">
            <EnhancedTable key={'expenses'} refresh={this.fetchExpenses} columns={expenseColumns} rows={expenses} defaultSort={'posted_on'} />
          </div>
        ),
      },
      income: {
        displayName: 'Income',
        content: (
          <div className="stack">
            <EnhancedTable key={'income'} refresh={this.fetchIncome} columns={incomeColumns} rows={income} defaultSort={'posted_on'} />
          </div>
        ),
      },
      users: {
        displayName: 'Users',
        content: (
          <div className="stack">
            <EnhancedTable key={'users'} refresh={this.fetchEnvelope} columns={permColumns} rows={envelope.perms || []} defaultSort={'user_name'} />
            <TextBtn onClick={() => this.setState({ showEntryForm: !showEntryForm })}>Change user permissions</TextBtn>
            {showEntryForm && (
              <InputForm submitFn={this.changeUserPermissions} fields={{
                user_id: 'User',
                permissionLvl: 'Permission Level',
              }} required={{
                user_id: true,
                permissionLvl: true,
              }} types={{
                user_id: 'select',
                permissionLvl: 'select',
              }} dropdownOptions={{
                user_id: contacts,
                permissionLvl: {
                  0: 'No Access',
                  1: 'Read Access',
                  2: 'Read/Comment',
                  3: 'Write Access',
                  4: 'Write/Delete',
                },
              }} />
            )}
          </div>
        ),
      },
      savings: envelope.is_savings ? ({
        displayName: 'Savings Goals',
        content: (
          <div className="stack">
            {showPercentAlert && (
              <Alert callback={alertCallback}>
                <p>
                  The sum of the entered percentages exceeds 100%.<br />Percentages will be automatically adjusted.
                </p>
              </Alert>
            )}
            <div  className="enhancedTable">
              <div className="tableBtns">
                <TextBtn onClick={this.fetchSavingsGoals}>Refresh</TextBtn>
                {editMode && (
                  <TextBtn onClick={this.saveSavingsGoals}>Save</TextBtn>
                )}
                <TextBtn onClick={this.toggleEdit}>{editMode ? 'Cancel' : 'Edit'}</TextBtn>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target Amount</th>
                    <th>Amount Saved</th>
                    <th>From This Account</th>
                    <th>Allocation %</th>
                  </tr>
                </thead>
                <tbody>
                  {savingsGoals.map((goal, i) => (
                    <tr>
                      <td>{goal.memo}</td>
                      <td>{goal.target_amount}</td>
                      <td>${this.floor(goal.alloc)}</td>
                      <td>${this.floor(balance  * (goal.alloc_pr / 100))}</td>
                      {editMode ? (
                        <div className="leftCell tableInput tableSlider">
                          <input
                            className="percentInput"
                            value={this.round(goal.alloc_pr, 4)}
                            type="number"
                            onChange={(({ target }) => this.editAlloc(i, target.value))}
                          />
                          <input
                            className="slider"
                            value={this.round(goal.alloc_pr, 4)}
                            type="range"
                            step="0.0001"
                            onChange={(({ target }) => this.editAlloc(i, target.value))}
                          />
                        </div>
                      ) : (
                        <td>{this.round(goal.alloc_pr, 2)}%</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      }) : null,
    };

    return envelope ? (
      <>
        <PageTitle title={envelope.title} />
        <div className="centered">
          <h3>Account Balance: ${balance}</h3>
        </div>
        <TabGroup tabs={tabs} />
      </>
    ) : null;
  }
}

export default Envelope;