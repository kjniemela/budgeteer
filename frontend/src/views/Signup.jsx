import React from 'react';
import axios from 'axios';

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
      <div className="auth">
        <div className="stack">
          <InputForm submitFn={this.signup} submitText={'Sign Up'} fields={{
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
          <button
            className="textBtn"
            onClick={() => setView('login')}
          >
            Login to existing account
          </button>
        </div>
      </div>
    );
  }
}

export default Signup;