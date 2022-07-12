import React from 'react';
import axios from 'axios';
import { Button, Container, fabClasses, Stack, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const expenseColumns = [
  {
      id: 'posted_on',
      numeric: false,
      disablePadding: false,
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
    id: 'budget',
    numeric: false,
    label: 'Budget',
  },
]

class ExpensesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expenses: [],
      showEntryForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const basePath = window.location.pathname;
    axios.get(basePath + 'api/expenses')
    .then(({ data }) => {
      data = data.map(row => ({...row, posted_on: (new Date(row.posted_on)).toDateString()}))
      this.setState({ expenses: data });
    })
  }

  submitEntry(data) {
    console.log(data);
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/expenses', data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name, setView } = this.props;
    const { expenses, showEntryForm } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    return (
      <>
        <PageTitle title={'Expenses'} />
        <Container style={{
          // maxWidth: 800,
        }}>
          <Stack spacing={2}>
            <EnhancedTable refresh={this.fetchData} columns={expenseColumns} rows={expenses} />
            <Button 
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
              variant="text"
              >
              Submit new entry
            </Button>
            {showEntryForm && (
              <InputForm submitFn={this.submitEntry} fields={{
                date: 'Date',
                amount: 'Amount',
                vendor: 'Location',
                memo: 'Memo',
                budget: 'Budget',
              }} required={{
                amount: true,
                vendor: true,
                budget: true,
              }} types={{
                date: 'datetime-local',
                amount: 'number',
                budget: 'select',
              }} defaults={{
                date: dateString,
              }} dropdownOptions={{
                budget: {0: 'test budget 1'}
              }} />
            )}
          </Stack>
        </Container>
      </>
    );
  }
}

export default ExpensesList;