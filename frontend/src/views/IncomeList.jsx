import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';
import InputForm from '../components/InputForm.jsx';

const incomeColumns = [
  {
      id: 'posted_on',
      numeric: false,
      isDate: true,
      label: 'Date',
  },
  {
    id: 'amount',
    numeric: true,
    label: 'Amount',
    prefix: '$',
  },
  {
    id: 'source',
    numeric: false,
    label: 'From',
  },
  {
    id: 'memo',
    numeric: false,
    label: 'Memo',
  },
  {
    id: 'posted_to',
    numeric: false,
    label: 'Posted To',
  },
  {
    id: 'envelope',
    numeric: false,
    label: 'Envelope',
  },
]

class IncomeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      income: [],
      envelopes: {},
      showEntryForm: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const basePath = window.location.pathname;
    const { data } = await axios.get(basePath + 'api/income')
    const income = data.map(row => ({...row, posted_on: new Date(row.posted_on)}));
    let { data: envelopeData } = await axios.get(basePath + 'api/envelopenames');
    const envelopes = {};
    envelopeData.map(row => envelopes[row.id] = row.title);
    this.setState({ income, envelopes });
  }

  submitEntry(data) {
    console.log(data);
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/income', data)
    .then(() => {
      this.fetchData();
    })
  }

  render() {
    const { name, setView } = this.props;
    const { income, envelopes, showEntryForm } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    return (
      <>
        <PageTitle title={'Income'} />
        <div className="stack">
          <EnhancedTable refresh={this.fetchData} columns={incomeColumns} rows={income} defaultSort={'posted_on'} />
          <button
            className="textBtn"
            onClick={() => this.setState({ showEntryForm: !showEntryForm })}
          >
            Submit new entry
          </button>
          {showEntryForm && (
            <InputForm submitFn={this.submitEntry} fields={{
              date: 'Date',
              amount: 'Amount',
              source: 'Source',
              memo: 'Memo',
              envelope: 'Envelope',
            }} required={{
              amount: true,
              vendor: true,
              envelope: true,
            }} types={{
              date: 'datetime-local',
              amount: 'number',
              envelope: 'select',
            }} defaults={{
              date: dateString,
            }} dropdownOptions={{
              envelope: envelopes,
            }}/>
          )}
        </div>
      </>
    );
  }
}

export default IncomeList;