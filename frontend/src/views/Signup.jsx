import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, TextField, Typography } from '@mui/material';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
    };

    this.signup = this.signup.bind(this);
  }

  signup() {
    const { firstname, lastname, email, password } = this.state;
    const basePath = window.location.pathname;
    axios.post(basePath + 'signup', { firstname, lastname, email, password })
    .then(() => {
      this.props.verifySession();
    })
    .then(() => {
      this.props.setView('home');
    })
  }

  render() {
    const { name, setView } = this.props;
    const { firstname, lastname, email, password } = this.state;
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
                id='firstname'
                label='First Name'
                color="info"
                value={firstname}
                onChange={({ target }) => this.setState({ firstname: target.value })}
              />
              <TextField
                id='lastname'
                label='Last Name'
                color="info"
                value={lastname}
                onChange={({ target }) => this.setState({ lastname: target.value })}
              />
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
                onClick={this.signup}
                variant="contained"
              >
                Sign Up
              </Button>
              <Button 
                onClick={() => setView('login')}
                variant="text"
              >
                Login to existing account
              </Button>
            </Stack>
          </Container>
        </Container>
      </>
    );
  }
}

export default Signup;