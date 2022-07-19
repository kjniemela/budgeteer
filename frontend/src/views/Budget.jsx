import React from 'react';
import axios from 'axios';

import PageTitle from '../components/PageTitle.jsx';
import InputForm from '../components/InputForm.jsx';

class Budget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgets: [],
      expenseRows: [],
      surplus: [],
      expandedRows: {},
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      startMonth: 1,
      endMonth: 12,
      showEntryForm: false,
      editMode: false,
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
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
    const basePath = window.location.pathname;
    const { data: budget } = await axios.get(basePath + `api/budgets/${budgetId}?start=${startYear}-${startMonth}&end=${endYear}-${endMonth}`)
    
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

  async submitEntry(data) {
    const { budgetId } = this.props;
    const { startYear, startMonth } = this.state;
    const basePath = window.location.pathname;
    await axios.post(basePath + `api/budgets/${budgetId}/columns`, {
      ...data, budgetId, start_time: this.formatDate(startYear, startMonth)
    });
    this.fetchData();
  }

  formatDate(year, month) {
    if (month < 10) return `${year}-0${month}-01`;
    else return `${year}-${month}-01`;
  }

  async toggleEdit() {
    const { editMode } = this.state;
    await this.fetchData();
    this.setState({ editMode: !editMode });
  }

  async save() {
    const { budgetId } = this.props;
    const { budget } = this.state;
    const basePath = window.location.pathname;
    // TODO - error handling here
    await axios.post(basePath + `api/budgets/${budgetId}`, budget);
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
    const { budget, expandedRows, expenseRows, surplus, startYear, startMonth, endYear, endMonth, showEntryForm, editMode } = this.state;

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
        rows[this.formatDate(year, month)] = `${months[month-1]} ${year}`;
        month++;
      }
      month = 1;
    }
    console.log(rows);

    return (
      <>
        <PageTitle title={budget ? `${budget.budget.title} - Summary` : null} />
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
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th></th>
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
                  <th className="leftCell">Surplus</th>
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
                {Object.keys(rows).map((key, rowIndex) => (
                  <tr
                    key={key}
                    onClick={() => {
                      
                    }}
                  >
                    <td className="tableLink">{rows[key]}</td>
                    <td
                      className={`leftCell${(surplus[rowIndex]?.surplus || 0) < 0 ? ' alertCell' : ''}`}
                    >${surplus[rowIndex]?.surplus || 0}</td>
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
                ))}
              </tbody>
            </table>
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
      </>
    );
  }
}

export default Budget;