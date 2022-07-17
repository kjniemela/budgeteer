import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const budgetColumns = [
  {
    id: 'title',
    numeric: false,
    label: 'Name',
  },
  {
    id: 'cols',
    numeric: true,
    label: 'Columns',
  },
  {
    id: 'rows',
    numeric: true,
    label: 'Rows',
  },
]

class BudgetsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgets: [],
      showEntryForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    let { data: budgets } = await axios.get(basePath + 'api/budgetnames')
    this.setState({ budgets });
  }

  submitEntry(data) {
    console.log(data);
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/budgets', data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name, setView } = this.props;
    const { budgets, showEntryForm } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    return (
      <>
        <PageTitle title={'Budgets'} />
        <div className="stack">
          <EnhancedTable
            refresh={this.fetchData}
            columns={budgetColumns}
            rows={budgets}
            onClicks={{ 'title': (row) => setView('budget', row.id) }}
          />
          <button
            className="textBtn"
            onClick={() => this.setState({ showEntryForm: !showEntryForm })}
            >
            Create new budget
          </button>
          {showEntryForm && (
            <InputForm submitFn={this.submitEntry} fields={{
              title: 'Budget Name'
            }} required={{
              title: true
            }} />
          )}
        </div>
      </>
    );
  }
}

export default BudgetsList;