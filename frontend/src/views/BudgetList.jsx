import React from 'react';
import axios from 'axios';
import { Button, Container, fabClasses, Stack, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const budgetColumns = [
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
    id: 'last_used',
    numeric: false,
    label: 'Last withdrawn from',
  },
  {
    id: 'last_deposit',
    numeric: false,
    label: 'Last deposited to',
  },
]

class BudgetList extends React.Component {
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
    axios.get(basePath + 'api/budgets')
    .then(({ data }) => {
      data = data.map(row => ({
        ...row,
        last_used: row.last_used ? (new Date(row.last_used)).toDateString() : 'Never',
        last_deposit: row.last_deposit ? (new Date(row.last_deposit)).toDateString() : 'Never',
      }))
      this.setState({ expenses: data });
    })
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
    const { expenses, showEntryForm } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    return (
      <>
        <PageTitle title={'Budgets'} />
        <Container style={{
          // maxWidth: 800,
        }}>
          <Stack spacing={2}>
            <EnhancedTable refresh={this.fetchData} columns={budgetColumns} rows={expenses} />
            <Button 
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
              variant="text"
              >
              Add new budget
            </Button>
            {showEntryForm && (
              <InputForm submitFn={this.submitEntry} fields={{
                title: 'Name',
              }} required={{
                title: true,
              }} />
            )}
          </Stack>
        </Container>
      </>
    );
  }
}

export default BudgetList;