import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import themes from './themes';
import { Typography, Button, Container, Box } from '@mui/material';

import Home from './views/Home.jsx';
import Login from './views/Login.jsx';
import Signup from './views/Signup.jsx';
import Profile from './views/Profile.jsx';

import NavBar from './components/NavBar.jsx';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'home',
      viewData: null,
      theme: 'dark',
      user: null,
    };

    this.setTheme = this.setTheme.bind(this);
    this.setView = this.setView.bind(this);
    this.verifySession = this.verifySession.bind(this);
  }

  componentDidMount() {
    this.verifySession();
  }

  verifySession() {
    const basePath = window.location.pathname;
    axios.get(basePath + 'verify')
    .then(({ data }) => {
      this.setState({ user: data });
    })
    .catch(({ response }) => {
      if (response.status === 401) {
        this.setState({ user: null });
      } else {
        console.error(response);
      }
    })
  }

  setTheme(theme) {
    if (themes[theme]) {
      this.setState({ theme });
    } else {
      throw 'Invalid Theme!';
    }
  }

  setView(view, viewData=null) {
    this.setState({ view, viewData });
  }

  render() {
    const { view, theme, user } = this.state;
    return (
      <ThemeProvider theme={themes[theme]}>
        <CssBaseline />
        <NavBar setTheme={this.setTheme} theme={theme} setView={this.setView} user={user} />
        <Container>
          {view === 'home' && <Home setView={this.setView} />}
          {view === 'login' && <Login setView={this.setView} verifySession={this.verifySession} />}
          {view === 'signup' && <Signup setView={this.setView} verifySession={this.verifySession} />}
          {view === 'profile' && <Profile setView={this.setView} verifySession={this.verifySession} user={user} />}
        </Container>
      </ThemeProvider>
    );
  }
}

export default App;
