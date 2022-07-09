import React from 'react';
import axios from 'axios';
import { Button, Container, Stack, TextField, Typography } from '@mui/material';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    const basePath = window.location.pathname;
    axios.post(basePath + 'logout')
    .then(() => {
      this.props.verifySession();
    })
  }

  render() {
    const { name, setView, user } = this.props;
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
              {user ? (
                <>
                  <Typography variant="h4">
                    {`${user.firstname} ${user.lastname}`}
                  </Typography>
                  <Typography variant="subtitle1">
                    {user.email}
                  </Typography>
                  <Button 
                    onClick={this.logout}
                    variant="contained"
                  >
                    Logout
                  </Button>
                  <Button 
                    onClick={() => setView('signup')}
                    variant="text"
                  >
                    Create New Account
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setView('login')}
                    variant="text"
                  >
                    Login to existing account
                  </Button>
                  <Button 
                    onClick={() => setView('signup')}
                    variant="text"
                  >
                    Create New Account
                  </Button>
                </>
              )}
            </Stack>
          </Container>
        </Container>
      </>
    );
  }
}

export default Profile;