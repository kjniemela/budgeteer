import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, TextField, Typography } from '@mui/material';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };

    this.login = this.login.bind(this);
  }

  login() {
    const { email, password } = this.state;
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
    const { email, password } = this.state;
    return (
      <>
        <Container style={{
          maxWidth: 800,
        }}>
          <Container style={{
            marginBottom: 10,
            marginTop: 70,
            textAlign: 'center',
          }}>
            <Stack spacing={2} >
              <TextField
                id='email'
                label='E-Mail'
                color="info"
                required
                value={email}
                onChange={({ target }) => this.setState({ email: target.value })}
              />
              <TextField
                id='password'
                label='Password'
                color="info"
                required
                type="password"
                value={password}
                onChange={({ target }) => this.setState({ password: target.value })}
              />
              <Button 
                onClick={this.login}
                variant="contained"
              >
                Login
              </Button>
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