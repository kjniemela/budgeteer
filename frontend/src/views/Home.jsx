import React from 'react';
import { Container, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { name, setView } = this.props;
    return (
      <>
        <PageTitle title={'Home'} />
        <Container style={{
          maxWidth: 800,
        }}>
          <Container style={{
            marginBottom: 10,
            textAlign: 'center',
          }}>
            <Typography variant="h2">
              Projects
            </Typography>
          </Container>
        </Container>
      </>
    );
  }
}

export default Home;