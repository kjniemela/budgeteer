import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';
import TabGroup from '../components/TabGroup.jsx';
import EnhancedTable from '../components/EnhancedTable.jsx';

const permColumns = [
  {
      id: 'user_name',
      numeric: false,
      label: 'User Name',
  },
  {
      id: 'email',
      numeric: false,
      label: 'Email',
  },
  {
      id: 'permissionLvl',
      numeric: true,
      label: 'Permission Level',
  },
];

class Budget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgets: [],
      expenseRows: [],
      surplus: [],
      expandedRows: {},
      contacts: {},
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      startMonth: 1,
      endMonth: 12,
      showEntryForm: false,
      editMode: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.fetchContacts = this.fetchContacts.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
    this.changeUserPermissions = this.changeUserPermissions.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.save = this.save.bind(this);
    this.editField = this.editField.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const { budgetId } = this.props;
    const { startYear, startMonth, endYear, endMonth } = this.state;
    const { data: budget } = await axios.get(`api/budgets/${budgetId}?start=${startYear}-${startMonth}&end=${endYear}-${endMonth}`)
    
    const requests = [];
    const surplusRequests = [];
    let month = startMonth;
    for (let year = startYear; year <= endYear; year++) {
      while (month <= 12 && (year < endYear || month <= endMonth)) { // this.formatDate(year, month)
        requests.push(this.fetchRow(year, month));
        surplusRequests.push(this.fetchSurplus(year, month));
        month++;
      }
      month = 1;
    }
    
    
    let expenseRows = [];
    let surplus = [];
    await Promise.all(requests).then(results => expenseRows = results);
    await Promise.all(surplusRequests).then(results => surplus = results);
    await this.fetchContacts();
    this.setState({ budget, expenseRows, surplus });
  }

  async fetchSurplus(year, month) {
    const { budgetId } = this.props;
    const { data: surplus } = await axios.get(`api/budgets/${budgetId}/surplus/${year}/${month}`);
    return surplus;
  }

  async fetchRow(year, month) {
    const { budgetId } = this.props;
    const { data } = await axios.get(`api/budgets/${budgetId}/rows/${year}/${month}`);
    const cols = {};
    data.rowSums.map(col => cols[col.col] = col.amount);
    return cols;
  }

  async fetchContacts() {
    const { envelopeId, user } = this.props;
    if (user) {
      const basePath = window.location.pathname;
      const contacts = {};
      const { data } = await axios.get('api/contacts');
      data.map(contact => {
        if (contact.user_id === user.id) contacts[contact.contact_id] = contact.contact_name;
        else contacts[contact.user_id] = contact.user_name; 
      });
      this.setState({ contacts });
    }
  }

  async submitEntry(data) {
    const { budgetId } = this.props;
    const { startYear, startMonth } = this.state;
    await axios.post(`api/budgets/${budgetId}/columns`, {
      ...data, budgetId, start_time: this.formatDate(startYear, startMonth)
    });
    this.fetchData();
  }

  formatDate(year, month) {
    if (month < 10) return `${year}-0${month}-01`;
    else return `${year}-${month}-01`;
  }

  async changeUserPermissions({ user_id, permissionLvl }) {
    const { budgetId } = this.props;
    await axios.put('api/budgets/permissions', {
      user_id,
      budget_id: budgetId,
      permissionLvl,
    });
    this.fetchData();
  }

  async toggleEdit() {
    const { editMode } = this.state;
    await this.fetchData();
    this.setState({ editMode: !editMode });
  }

  async save() {
    const { budgetId } = this.props;
    const { budget } = this.state;
    // TODO - error handling here
    await axios.post(`api/budgets/${budgetId}`, budget);
    this.fetchData();
    this.setState({ editMode: false });
  }

  editField(row, col, value) {
    const { budget } = this.state;
    const editedBudget = {...budget};
    editedBudget.columns[col].rows[row] = value;
    this.setState({ budget: editedBudget });
  }

  render() {
    const { name, setView } = this.props;
    const {
      budget, expandedRows, expenseRows, surplus, contacts,
      startYear, startMonth, endYear, endMonth,
      showEntryForm, editMode
    } = this.state;

    const now = new Date();
    const localDate = new Date((now - (now.getTimezoneOffset() * 60000)));
    const dateString = localDate.toISOString().slice(0, -8);

    const months = [
      'Jan.',
      'Feb.',
      'Mar.',
      'Apr.',
      'May.',
      'Jun.',
      'Jul.',
      'Aug.',
      'Sep.',
      'Oct.',
      'Nov.',
      'Dec.',
    ];

    const rows = {};
    let month = startMonth;
    for (let year = startYear; year <= endYear; year++) {
      while (month <= 12 && (year < endYear || month <= endMonth)) {
        rows[this.formatDate(year, month)] = <>{months[month-1]}&nbsp;{year}</>;
        month++;
      }
      month = 1;
    }
    console.log(rows);

    const tabs = {
      summary: {
        displayName: 'Summary',
        content: (
          <div className="stack">
            <div  className="enhancedTable budgetSummary">
              <div className="tableBtns">
                <button
                  className="textBtn"
                  onClick={this.fetchData}
                >
                  Refresh
                </button>
                {editMode && (
                  <button
                    className="textBtn"
                    onClick={this.save}
                  >
                    Save
                  </button>
                )}
                <button
                  className="textBtn"
                  onClick={this.toggleEdit}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="tableFrame">
                <table>
                  <thead>
                    <tr>
                      <th colSpan={4}></th>
                      {budget && budget.columns.map(col => (
                        <th
                          key={col.id}
                          className="tableLink"
                          align="center"
                          colSpan={2}
                        >{col.title}</th>
                      ))}
                    </tr>
                    <tr>
                      <th>Date</th>
                      <th className="leftCell narrowCell">Surplus</th>
                      <th className="leftCell narrowCell">Total Income</th>
                      <th className="leftCell narrowCell">Total Planned</th>
                      {budget && budget.columns.map(col => (
                        <>
                          <th
                            className="leftCell"
                            key={`${col.id}right`}
                            align="center"
                          >Planned</th>
                          <th
                            className="rightCell"
                            key={`${col.id}left`}
                            align="center"
                          >Spent</th>
                        </>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(rows).map((key, rowIndex) => {

                      const rowSurplus = surplus[rowIndex]?.surplus || 0;
                      const totalIncome = (surplus[rowIndex]?.income || 0) - (surplus[rowIndex]?.transfers || 0);
                      const totalPlanned = budget?.columns.reduce((prev, cur) => prev + Number(cur.rows[key] || 0), 0);
                      
                      return (
                        <tr
                          key={key}
                          onClick={() => {
                            
                          }}
                        >
                          <td className="tableLink">{rows[key]}</td>
                          <td className={`leftCell${rowSurplus < 0 ? ' alertCell' : ''}`}>
                            ${rowSurplus}
                          </td>
                          <td className={`leftCell${totalIncome < totalPlanned ? ' alertCell' : ''}`}>
                            ${totalIncome}
                          </td>
                          <td className="leftCell">
                            ${totalPlanned}
                          </td>
                          {budget && budget.columns.map((col, colIndex) => (
                            <>
                              {editMode ? (
                                <div className="leftCell tableInput">
                                  <input
                                    value={col.rows[key]}
                                    type="number"
                                    onChange={(({ target }) => this.editField(key, colIndex, target.value))}
                                  />
                                </div>
                              ) : (
                                <td
                                  className="leftCell"
                                  key={`${col.id}${key}right`}
                                  align="left"
                                >
                                  ${col.rows[key]}
                                </td>
                              )}
                              <td
                                className={`rightCell ${(Number(expenseRows[rowIndex][col.id]) > (Number(col.rows[key]) || 0) ? 'alertCell' : '')}`}
                                key={`${col.id}${key}left`}
                                align="left"
                              >${expenseRows[rowIndex][col.id] || 0}</td>
                            </>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <button
              className="textBtn"
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
            >
              Add column
            </button>
            {showEntryForm && (
              <InputForm submitFn={this.submitEntry} fields={{
                title: 'Column Name'
              }} required={{
                title: true
              }} />
            )}
          </div>
        ),
      },
      users: {
        displayName: 'Users',
        content: (
          <div className="stack">
            {budget && (
              <EnhancedTable key={'users'} refresh={this.fetchData} columns={permColumns} rows={budget.perms} defaultSort={'user_name'} />
            )}
            <button
              className="textBtn"
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
            >
              Change user permissions
            </button>
            {showEntryForm && (
              <InputForm submitFn={this.changeUserPermissions} fields={{
                user_id: 'User',
                permissionLvl: 'Permission Level',
              }} required={{
                user_id: true,
                permissionLvl: true,
              }} types={{
                user_id: 'select',
                permissionLvl: 'select',
              }} dropdownOptions={{
                user_id: contacts,
                permissionLvl: {
                  0: 'No Access',
                  1: 'Read Access',
                  2: 'Read/Comment',
                  3: 'Write Access',
                  4: 'Write/Delete',
                },
              }} />
            )}
          </div>
        ),
      },
    };

    return (
      <>
        <PageTitle title={budget ? `${budget.budget.title} - Summary` : null} />
        <TabGroup tabs={tabs} />
      </>
    );
  }
}

export default Budget;