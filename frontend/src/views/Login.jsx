import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, TextField, Typography } from '@mui/material';

import InputForm from '../components/InputForm.jsx';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.login = this.login.bind(this);
  }

  login({ email, password }) {
    const basePath = window.location.pathname;
    axios.post(basePath + 'login', { email, password })
    .then(() => {
      this.props.verifySession();
    })
    .then(() => {
      this.props.setView('home');
    })
  }

  render() {
    const { name, setView } = this.props;
    return (
      <>
        <Container style={{
          maxWidth: 500,
        }}>
          <Container style={{
            marginBottom: 10,
            marginTop: 70,
            textAlign: 'center',
          }}>
            <Stack spacing={2}>
              <InputForm submit={this.login} submitText={'Login'} fields={{
                email: 'E-Mail',
                password: 'Password',
              }} required={{
                email: true,
                password: true,
              }} types={{
                password: 'password',
              }} />
              <Button 
                onClick={() => setView('signup')}
                variant="text"
              >
                Create New Account
              </Button>
            </Stack>
          </Container>
        </Container>
      </>
    );
  }
}

export default Login;