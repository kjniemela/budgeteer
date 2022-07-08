import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import themes from './themes';
import { Typography, Button, Container, Box } from '@mui/material';

import Home from './views/Home.jsx';
import Login from './views/Login.jsx';
import Signup from './views/Signup.jsx';

import NavBar from './components/NavBar.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'login',
      viewData: null,
      theme: 'dark',
    };

    this.setTheme = this.setTheme.bind(this);
    this.setView = this.setView.bind(this);
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
    const { view, theme } = this.state;
    return (
      <ThemeProvider theme={themes[theme]}>
        <CssBaseline />
        <NavBar setTheme={this.setTheme} theme={theme} setView={this.setView} />
        <Container>
          {view === 'home' && <Home setView={this.setView} />}
          {view === 'login' && <Login setView={this.setView} />}
          {view === 'signup' && <Signup setView={this.setView} />}
        </Container>
      </ThemeProvider>
    );
  }
}

export default App;
