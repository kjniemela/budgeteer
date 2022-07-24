import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';
import TabGroup from '../components/TabGroup.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';

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
      showEntryForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.fetchEnvelope = this.fetchEnvelope.bind(this);
    this.fetchEnvelopeNames = this.fetchEnvelopeNames.bind(this);
    this.fetchExpenses = this.fetchExpenses.bind(this);
    this.fetchIncome = this.fetchIncome.bind(this);
    this.fetchContacts = this.fetchContacts.bind(this);
    this.changeUserPermissions = this.changeUserPermissions.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.fetchEnvelope();
    this.fetchEnvelopeNames();
    this.fetchExpenses();
    this.fetchIncome();
    this.fetchContacts();
  }

  async fetchEnvelope() {
    const { envelopeId } = this.props;
    const basePath = window.location.pathname;
    const { data: envelope } = await axios.get(basePath + `api/envelopes/${envelopeId}`);
    envelope.perms = envelope.perms.map(row => ({
      ...row,
      id: row.user_id,
    }));
    this.setState({ envelope });
  }

  async fetchEnvelopeNames() {
    const basePath = window.location.pathname;
    let { data: envelopeData } = await axios.get(basePath + 'api/envelopenames');
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
    const basePath = window.location.pathname;
    let { data: expenses } = await axios.get(basePath + `api/expenses?envelope=${envelopeId}`);
    expenses = expenses.map(row => ({
      ...row,
      posted_on: new Date(row.posted_on),
      column: row.column || '',
    }));
    this.setState({ expenses });
  }

  async fetchIncome() {
    const { envelopeId } = this.props;
    const basePath = window.location.pathname;
    const { data } = await axios.get(basePath + `api/income/?envelope=${envelopeId}`)
    const income = data.map(row => ({...row, posted_on: new Date(row.posted_on)}));
    this.setState({ income });
  }

  async fetchContacts() {
    const { envelopeId, user } = this.props;
    if (user) {
      const basePath = window.location.pathname;
      const contacts = {};
      const { data } = await axios.get(basePath + 'api/contacts');
      data.map(contact => {
        if (contact.user_id === user.id) contacts[contact.contact_id] = contact.contact_name;
        else contacts[contact.user_id] = contact.user_name; 
      });
      this.setState({ contacts });
    }
  }

  async changeUserPermissions({ user_id, permissionLvl }) {
    const { envelopeId } = this.props;
    const basePath = window.location.pathname;
    await axios.put(basePath + 'api/envelopes/permissions', {
      user_id,
      envelope_id: envelopeId,
      permissionLvl,
    });
    this.fetchEnvelope();
  }

  render() {
    const { envelopeId, setView } = this.props;
    const { envelope, expenses, income, envelopes, budgets, contacts, showEntryForm } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

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
            <EnhancedTable key={'users'} refresh={this.fetchEnvelope} columns={permColumns} rows={envelope.perms} defaultSort={'user_name'} />
            <button
              className="textBtn"
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
            >
              Change user permissions
            </button>
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
    };

    return envelope ? (
      <>
        <PageTitle title={envelope.title} />
        <TabGroup tabs={tabs} />
      </>
    ) : null;
  }
}

export default Envelope;