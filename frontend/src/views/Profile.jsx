import React from 'react';
import axios from 'axios';

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
      <div className="profile">
        <div className="stack">
          {user ? (
            <>
              <div className="profileInfo">
                <h1 className="profileName">{`${user.firstname} ${user.lastname}`}</h1>
                <span className="profileEmail">{user.email}</span>
              </div>
              <br />
              <button 
                className="solidBtn"
                onClick={this.logout}
              >
                Logout
              </button>
              <button 
                className="textBtn"
                onClick={() => setView('signup')}
              >
                Create New Account
              </button>
            </>
          ) : (
            <>
              <button 
                className="textBtn"
                onClick={() => setView('login')}
              >
                Login to existing account
              </button>
              <button 
                className="textBtn"
                onClick={() => setView('signup')}
              >
                Create New Account
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Profile;