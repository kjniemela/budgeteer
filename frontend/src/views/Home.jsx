import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    const { name, setView } = this.props;
    const { expenses } = this.state;
    return (
      <>
        <PageTitle title={'Home'} />
        <Container style={{
          // maxWidth: 800,
        }}>
          <Container style={{
            marginBottom: 10,
            textAlign: 'center',
          }}>
            <Stack spacing={2} >
              <Button onClick={() => setView('envelopes')} variant="contained">Envelopes</Button>
              <Button onClick={() => setView('expenses')} variant="contained">Expenses</Button>
              <Button onClick={() => setView('income')} variant="contained">Income</Button>
            </Stack>
          </Container>
        </Container>
      </>
    );
  }
}

export default Home;