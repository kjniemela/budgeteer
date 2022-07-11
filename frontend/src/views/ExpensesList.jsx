import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';
import ExpensesTable from '../components/ExpensesTable.jsx';
import InputForm from '../components/InputForm.jsx';

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
            <ExpensesTable refresh={this.fetchData} rows={expenses} /> {/* TODO - make this a general use component */}
            <Button 
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
              variant="text"
              >
              Submit new entry
            </Button>
            {showEntryForm && (
              <InputForm submit={this.submitEntry} fields={{
                date: 'Date',
                amount: 'Amount',
                vendor: 'Location',
                memo: 'Memo',
              }} required={{
                amount: true,
                vendor: true,
              }} types={{
                date: 'datetime-local',
                amount: 'number',
              }} defaults={{
                date: dateString,
              }} />
            )}
          </Stack>
        </Container>
      </>
    );
  }
}

export default ExpensesList;