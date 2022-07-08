import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = {
  spacing: 4,
  typography: {
    fontFamily: [
      'Roboto',
      'Raleway',
      'Open Sans',
    ].join(','),
    h1: {
      fontSize: '4rem',
      fontFamily: 'Raleway',
    },
    h2: {
      fontSize: '2.5rem',
      fontFamily: 'Open Sans',
      fontStyle: 'bold',
    },
    h3: {
      fontSize: '1.8rem',
      fontFamily: 'Roboto',
    },
    body1: {
      fontSize: '1.3rem',
      fontFamily: 'Roboto',
    },
  },
};

const lightTheme = responsiveFontSizes(createTheme({
  ...theme,
  palette: {
    background: {
      default: '#dadada',
      paper: '#fafafa',
    },
    // primary: {
    //   main: '#2B37D4',//indigo
    // },
    // secondary: {
    //   main: '#E769A6',//pink
    // },
    // error: {
    //   main: '#D72A2A',//red
    // },
    // warning: {
    //   main: '#FC7B09',//orange
    // },
    // info: {
    //   main: '#6B7D6A',//gray
    // },
    // success: {
    //   main: '#09FE00',//green
    // },
    // text: {
    //   primary: '#000000',//black
    //   secondary: '#FFFF00',//white
    // },
  },
}));

const darkTheme = responsiveFontSizes(createTheme({
  ...theme,
  palette: {
    background: {
      default: '#1f344f',
      paper: '#255899',
    },
    primary: {
      main: '#2662ad',
    },
    secondary: {
      main: '#E769A6',
    },
    error: {
      main: '#D72A2A',
    },
    warning: {
      main: '#FC7B09',
    },
    info: {
      main: '#fafafa',
    },
    success: {
      main: '#09FE00',
    },
    text: {
      primary: '#fafafa',
      secondary: '#fafafa',
    },
  },
}));

const themes = {
  'light': lightTheme,
  'dark': darkTheme,
};

export default themes;