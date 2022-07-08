import React from 'react';
import { Typography, Card, Container } from '@mui/material';
import { useTheme } from '@mui/styles';

const PageTitle = ({ title }) => (
  <Container>
    <Card style={{
      textAlign: 'center',
      margin: 20,
    }}>
      <Typography variant='h1'>
        {title}
      </Typography>
    </Card>
  </Container>
);

export default PageTitle;