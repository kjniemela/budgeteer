import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

import InputForm from '../components/InputForm.jsx';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: null,
      redirect: null,
    };

    this.login = this.login.bind(this);
  }

  login({ email, password }) {
    axios.post(`${window.ADDR_PREFIX}/login`, { email, password })
    .then(() => {
      this.props.verifySession();
    })
    .then(() => {
      this.setState({ redirect: '' });
    })
    .catch(({ response }) => {
      if (response.status === 401) {
        this.setState({ errorMsg: 'auth_failed' })
      }
    });
  }

  render() {
    const { name } = this.props;
    const { errorMsg, redirect } = this.state;

    const localeErrorMsgs = {
      'auth_failed': 'E-mail or password incorrect',
    };

    return (
      <div className="auth">
        {redirect !== null && <Navigate to={`${window.ADDR_PREFIX}${redirect}`} />}
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
          <Link
            className="btn textBtn"
            to={`${window.ADDR_PREFIX}/signup`}
          >
            Create New User Account
          </Link>
        </div>
      </div>
    );
  }
}

export default Login;