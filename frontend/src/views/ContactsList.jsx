import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';
import TabGroup from '../components/TabGroup.jsx';
import SolidBtn from '../components/buttons/SolidBtn.jsx';
import TextBtn from '../components/buttons/TextBtn.jsx';

class ContactsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      showContactForm: false,
    };
    this.submitContact = this.submitContact.bind(this);
    this.acceptContact = this.acceptContact.bind(this);
    this.rejectContact = this.rejectContact.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let { data: contacts } = await axios.get(`${window.ADDR_PREFIX}/api/contacts`);
    this.setState({ contacts });
  }

  async submitContact({ email }) {
    await axios.post(`${window.ADDR_PREFIX}/api/contacts`, { email });
    this.fetchData();
  }

  async acceptContact(contactId) {
    await axios.put(`${window.ADDR_PREFIX}/api/contacts/${contactId}`);
    this.fetchData();
  }

  async rejectContact(contactId) {
    await axios.delete(`${window.ADDR_PREFIX}/api/contacts/${contactId}`);
    this.fetchData();
  }

  render() {
    const { user,setView } = this.props;
    const { contacts, showContactForm } = this.state;

    const refreshBtn = (
      <TextBtn onClick={() => this.fetchData()}>Refresh</TextBtn>
    );

    const contactCount = user && contacts && contacts.reduce((acc, contact) => (
      acc + ((contact.accepted === 1) ? 1 : 0)
    ), 0);

    const incomingRequestCount = user && contacts && contacts.reduce((acc, contact) => (
      acc + ((contact.contact_id === user.id && contact.accepted === 0) ? 1 : 0)
    ), 0);

    const tabs = {
      all: {
        displayName: `All (${contactCount || 0})`,
        content: (
          <>
            {refreshBtn}
            {user && contacts && contacts.filter(contact => contact.accepted === 1).map(contact => {
              if (contact.user_id === user.id) {
                return (
                  <div key={contact.contact_email} className="contactTile">
                    <img src={contact.gravatar_link + '?s=64'} />
                    <h2>{contact.contact_name}</h2>
                    <span>{contact.contact_email}</span>
                  </div>
                );
              } else {
                return (
                  <div key={contact.user_email} className="contactTile">
                    <img src={contact.gravatar_link + '?s=64'} />
                    <h2>{contact.user_name}</h2>
                    <span>{contact.user_email}</span>
                  </div>
                );
              }
            })}
          </>
        ),
      },
      pending: {
        displayName: `Pending${incomingRequestCount ? ` (${incomingRequestCount})` : ''}`,
        content: (
          <>
            {refreshBtn}
            {user && contacts && contacts.filter(contact => contact.accepted === 0).map(contact => {
              if (contact.user_id === user.id) {
                return (
                  <div key={contact.contact_email} className="contactTile">
                    <img src={contact.gravatar_link + '?s=64'} />
                    <h2>{contact.contact_name}</h2>
                    <span>{contact.contact_email}</span>
                    <span style={{'marginLeft': 'auto'}}>Pending</span>
                  </div>
                );
              } else {
                return (
                  <div key={contact.user_email} className="contactTile">
                    <img src={contact.gravatar_link + '?s=64'} />
                    <h2>{contact.user_name}</h2>
                    <span>{contact.user_email}</span>
                    <SolidBtn style={{'marginLeft': 'auto'}} onClick={() => this.acceptContact(contact.user_id)}>Accept</SolidBtn>
                    <SolidBtn className="errorBtn" onClick={() => this.rejectContact(contact.user_id)}>Reject</SolidBtn>
                  </div>
                );
              }
            })}
          </>
        ),
      },
      add: {
        displayName: 'Add Contact',
        content: (
          <>
            {refreshBtn}
            <InputForm color="paper" submitFn={this.submitContact} fields={{
              email: 'E-Mail',
            }} required={{
              email: true,
            }} types={{
              email: 'email',
            }} />
          </>
        ),
      },
    };

    return (
      <>
        <PageTitle title={'Contacts'} />
        <div className="paper" >
          <TabGroup tabs={tabs} defaultTab="all" />
        </div>
      </>
    );
  }
}

export default ContactsList;