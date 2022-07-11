import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, TextField, Typography } from '@mui/material';

import InputForm from '../components/InputForm.jsx';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: null,
    };

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
    .catch(({ response }) => {
      if (response.status === 401) {
        this.setState({ errorMsg: 'auth_failed' })
      }
    });
  }

  render() {
    const { name, setView } = this.props;
    const { errorMsg } = this.state;

    const localeErrorMsgs = {
      'auth_failed': 'E-mail or password incorrect',
    };

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
              <InputForm submitFn={this.login} submitText={'Login'} fields={{
                email: 'E-Mail',
                password: 'Password',
              }} required={{
                email: true,
                password: true,
              }} types={{
                password: 'password',
              }} />
              {errorMsg && (
                <Typography variant="body1" color="error">
                  {localeErrorMsgs[errorMsg]}
                </Typography>
              )}
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