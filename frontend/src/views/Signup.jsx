import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import InputForm from '../components/InputForm.jsx';

class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.signup = this.signup.bind(this);
  }

  signup({ firstname, lastname, email, password }) {
    axios.post(`${window.ADDR_PREFIX}/signup`, { firstname, lastname, email, password })
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
          <Link
            className="btn textBtn"
            to={`${window.ADDR_PREFIX}/login`}
          >
            Login to existing user account
          </Link>
        </div>
      </div>
    );
  }
}

export default Signup;