import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const envelopeColumns = [
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

class EnvelopeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      envelopes: [],
      showEnvelopeForm: false,
      showDepositForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEnvelope = this.submitEnvelope.bind(this);
    this.submitDeposit = this.submitDeposit.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    let { data: envelopes } = await axios.get(basePath + 'api/envelopes')
    let { data: balance } = await axios.get(basePath + 'api/balance')
    envelopes = envelopes.map(row => ({
      ...row,
      last_used: row.last_used ? (new Date(row.last_used)).toDateString() : 'Never',
      last_deposit: row.last_deposit ? (new Date(row.last_deposit)).toDateString() : 'Never',  
    }));
    this.setState({ envelopes, balance });
  }

  submitEnvelope(data) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/envelopes', data)
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
    const { envelopes, showEnvelopeForm, showDepositForm, balance } = this.state;

    const envelopeOptions = {};
    envelopes.map(row => envelopeOptions[row.id] = row.title);

    return (
      <>
        <PageTitle title={'Envelopes'} />
        <Container style={{
          // maxWidth: 800,
        }}>
          <Stack spacing={2}>
            <Typography>Current Balance: ${balance ? balance.balance : 'N/A'}</Typography>
            <EnhancedTable refresh={this.fetchData} columns={envelopeColumns} rows={envelopes} />
            <Button 
              onClick={() => this.setState({ showEnvelopeForm: !showEnvelopeForm })}
              variant="text"
            >
              Add new envelope
            </Button>
            {showEnvelopeForm && (
              <InputForm submitFn={this.submitEnvelope} fields={{
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
                envelope: 'Envelope',
              }} required={{
                amount: true,
                envelope: true,
              }} types={{
                amount: 'number',
                envelope: 'select',
              }} dropdownOptions={{
                envelope: envelopeOptions
              }} />
            )}
          </Stack>
        </Container>
      </>
    );
  }
}

export default EnvelopeList;