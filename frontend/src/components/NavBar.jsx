import React from 'react';
import { AppBar, Box, Button, IconButton, Switch, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import ThemeSwitch from './ThemeSwitch.jsx';

const views = ['home']

const NavBar = ({ setTheme, theme, setView, user }) => (
  <AppBar position="static">
    <Toolbar>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" component="div">
        Budgeteer
      </Typography>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {views.map(view => (
          <Button
            key={view}
            onClick={() => setView(view)}
            sx={{ my: 2, color: 'white', display: 'block' }}
          >
            {view}
          </Button>
        ))}
      </Box>
      <ThemeSwitch checked={theme === 'dark'} onChange={(e, state) => setTheme(state ? 'dark' : 'light')}/>
      <Button
        color="inherit"
        onClick={() => user ? setView('profile') : setView('login')}
      >
        {user ? `Logged in as ${user.firstname} ${user.lastname}` : 'Login'}
      </Button>
    </Toolbar>
  </AppBar>
);

export default NavBar;