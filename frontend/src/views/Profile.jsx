import React from 'react';
import axios from 'axios';

import Alert from '../components/Alert.jsx';
import InputField from '../components/InputField.jsx';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteModal: false,
      enteredPassword: '',
      deleteModalFns: [null, null],
      wrongDeletePass: false,
    };
    this.logout = this.logout.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }

  logout() {
    axios.post('logout')
    .then(() => {
      this.props.verifySession();
    })
  }

  async deleteAccount(firstTry=true) {
    const { user, verifySession } = this.props;
    try {
      await new Promise((resolve, reject) => {
        this.setState({
          showDeleteModal: true,
          deleteModalFns: [resolve, reject],
          wrongDeletePass: !firstTry,
        });
      });

      const { enteredPassword } = this.state;
      const basePath = window.location.pathname;
      const isCorrectPass = (await axios.post('authorize', {
        email: user.email,
        password: enteredPassword,
      }).catch(res => res)).status === 200;
      if (isCorrectPass) {
        await axios.delete(`api/users/${user.id}`, { data: {
          email: user.email,
          password: enteredPassword,
        }});
        await verifySession();
      } else {
        await this.deleteAccount(false);
        return;
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.setState({
        showDeleteModal: false,
      })
    }
  }

  render() {
    const { setDarkMode, darkMode, name, setView, user } = this.props;
    const { showDeleteModal, enteredPassword, deleteModalFns, wrongDeletePass } = this.state;
    return (
      <div className="profile">
        {showDeleteModal && (
          <Alert
            cancel="Nevermind"
            callback={deleteModalFns[0]}
            cancelCallback={deleteModalFns[1]}
          >
            <p>
              Deleting your account is <b>not reversible</b> and all your data will be <b>permanently deleted</b>!
              <br />
              All data associated with your account will be lost <b>forever</b>!
            </p>
            <p>
              Please enter your password to confirm that you are <b>absolutely sure</b> you want to delete your account:
            </p>
            <InputField
              id="password"
              errorText={wrongDeletePass && 'Incorrect Password'}
              value={enteredPassword}
              onChange={({ target }) => this.setState({ enteredPassword: target.value })}
            />
          </Alert>
        )}
        <div className="stack">
          {user ? (
            <>
              <div className="profileInfo">
                <img className="profileImg" src={user.gravatar_link + '?s=256'} />
                <h1 className="profileName">{`${user.firstname} ${user.lastname}`}</h1>
                <span className="profileEmail">{user.email}</span>
              </div>
              <br />
              <button
                className="solidBtn halfWidth"
                onClick={() => setDarkMode(!darkMode)}
              >
                Toggle Dark Mode
              </button>
              <button 
                className="solidBtn halfWidth"
                onClick={this.logout}
              >
                Logout
              </button>
              <button 
                className="solidBtn halfWidth errorBtn"
                onClick={this.deleteAccount}
              >
                Delete Account
              </button>
              <button 
                className="textBtn"
                onClick={() => setView('signup')}
              >
                Create New User Account
              </button>
            </>
          ) : (
            <>
              <button 
                className="textBtn"
                onClick={() => setView('login')}
              >
                Login to existing user account
              </button>
              <button 
                className="textBtn"
                onClick={() => setView('signup')}
              >
                Create New User Account
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Profile;