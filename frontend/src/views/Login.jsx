import React from 'react';
import axios from 'axios';

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
      <div className="auth">
        <div className="stack">
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
            <p className="formError centered">
              {localeErrorMsgs[errorMsg]}
            </p>
          )}
          <button
            className="textBtn"
            onClick={() => setView('signup')}
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }
}

export default Login;