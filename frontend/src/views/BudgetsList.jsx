import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';
import TextBtn from '../components/buttons/TextBtn.jsx';

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
    let { data: budgets } = await axios.get(`${window.ADDR_PREFIX}/api/budgetnames`);
    this.setState({ budgets });
  }

  submitEntry(data) {
    console.log(data);
    axios.post(`${window.ADDR_PREFIX}/api/budgets`, data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name } = this.props;
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
            links={{ 'title': (row) => (`/budgets/${row.id}`) }}
          />
          <TextBtn onClick={() => this.setState({ showEntryForm: !showEntryForm })}>Create new budget</TextBtn>
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