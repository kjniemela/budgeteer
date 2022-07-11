import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, TextField, Typography } from '@mui/material';

import InputForm from '../components/InputForm.jsx';

class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.signup = this.signup.bind(this);
  }

  signup({ firstname, lastname, email, password }) {
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
            <Stack spacing={2} >
              <InputForm submit={this.signup} submitText={'Sign Up'} fields={{
                firstname: 'First Name',
                lastname: 'Last Name',
                email: 'E-Mail',
                password: 'Password',
              }} required={{
                email: true,
                password: true,
              }} types={{
                password: 'password',
              }} />
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