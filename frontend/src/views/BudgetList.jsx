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
      budgets: [],
      showBudgetForm: false,
      showDepositForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitBudget = this.submitBudget.bind(this);
    this.submitDeposit = this.submitDeposit.bind(this);
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
      this.setState({ budgets: data });
    })
  }

  submitBudget(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/budgets', data)
    .then(() => {
      this.fetchData();
    })
  }

  submitDeposit(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + `api/deposits`, data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name, setView } = this.props;
    const { budgets, showBudgetForm, showDepositForm } = this.state;

    const budgetOptions = {};
    budgets.map(row => budgetOptions[row.id] = row.title);

    return (
      <>
        <PageTitle title={'Budgets'} />
        <Container style={{
          // maxWidth: 800,
        }}>
          <Stack spacing={2}>
            <EnhancedTable refresh={this.fetchData} columns={budgetColumns} rows={budgets} />
            <Button 
              onClick={() => this.setState({ showBudgetForm: !showBudgetForm })}
              variant="text"
            >
              Add new budget
            </Button>
            {showBudgetForm && (
              <InputForm submitFn={this.submitBudget} fields={{
                title: 'Name',
              }} required={{
                title: true,
              }} />
            )}
            <Button 
              onClick={() => this.setState({ showDepositForm: !showDepositForm })}
              variant="text"
            >
              Add new deposit
            </Button>
            {showDepositForm && (
              <InputForm submitFn={this.submitDeposit} fields={{
                amount: 'Amount',
                budget: 'Budget',
              }} required={{
                amount: true,
                budget: true,
              }} types={{
                amount: 'number',
                budget: 'select',
              }} dropdownOptions={{
                budget: budgetOptions
              }} />
            )}
          </Stack>
        </Container>
      </>
    );
  }
}

export default BudgetList;