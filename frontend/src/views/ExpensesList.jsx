import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

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
    id: 'envelope',
    numeric: false,
    label: 'Envelope',
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
]

class ExpensesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expenses: [],
      envelopes: {},
      budgets: {},
      columns: {},
      showEntryForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
    this.fetchBudgetColumns = this.fetchBudgetColumns.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    let { data: expenses } = await axios.get(basePath + 'api/expenses');
    let { data: envelopeData } = await axios.get(basePath + 'api/envelopenames');
    const envelopes = {};
    const budgets = {};
    envelopeData.map(row => {
      envelopes[row.id] = row.title;
      budgets[row.id] = row.budget_id;
    });
    expenses = expenses.map(row => ({
      ...row,
      posted_on: new Date(row.posted_on),
      column: row.column || '',
    }));
    this.setState({ expenses, envelopes, budgets });
  }

  async fetchBudgetColumns(envelopeId) {
    const { budgets } = this.state;
    let columns = {};
    if (budgets[envelopeId]) {
      const basePath = window.location.pathname;
      let { data: columnData } = await axios.get(basePath + `api/budgets/${budgets[envelopeId]}/columns`);
      columns = {};
      columnData.map(row => columns[row.id] = row.title);
    }
    this.setState({ columns });
  }

  submitEntry(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/expenses', data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name, setView } = this.props;
    const { expenses, envelopes, budgets, columns, showEntryForm } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    return (
      <>
        <PageTitle title={'Expenses'} />
        <div className="stack">
          <EnhancedTable refresh={this.fetchData} columns={expenseColumns} rows={expenses} defaultSort={'posted_on'} />
          <button
            className="textBtn"
            onClick={() => this.setState({ showEntryForm: !showEntryForm })}
          >
            Submit new entry
          </button>
          {showEntryForm && (
            <InputForm submitFn={this.submitEntry} fields={{
              date: 'Date',
              amount: 'Amount',
              vendor: 'Location',
              memo: 'Memo',
              envelope: 'Envelope',
              column: 'Budget Column'
            }} required={{
              amount: true,
              vendor: true,
              envelope: true,
            }} types={{
              date: 'datetime-local',
              amount: 'number',
              envelope: 'select',
              column: 'dynamicselect',
            }} defaults={{
              date: dateString,
            }} dropdownOptions={{
              envelope: envelopes,
            }} dynamicDropdownOptions={{
              column: () => Object.keys(columns).reduce((acc, val, i) => ([...acc, { value: val, label: columns[val] }]), []),
            }} onChanges={{
              envelope: this.fetchBudgetColumns
            }} />
          )}
        </div>
      </>
    );
  }
}

export default ExpensesList;