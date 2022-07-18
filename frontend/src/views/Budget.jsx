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
    let month = startMonth;
    for (let year = startYear; year <= endYear; year++) {
      while (month <= 12 && (year < endYear || month <= endMonth)) { // this.formatDate(year, month)
        requests.push(this.fetchRow(year, month));
        month++;
      }
      month = 1;
    }
    
    let expenseRows = [];
    await Promise.all(requests).then(results => expenseRows = results);
    this.setState({ budget, expenseRows });
  }

  async fetchRow(year, month) {
    const { budgetId } = this.props;
    const { data } = await axios.get(`api/budgets/${budgetId}/rows/${year}/${month}`);
    console.log(data);
    const cols = {};
    data.rowSums.map(col => cols[col.col] = col.amount);
    return cols;
  }

  submitEntry(data) {
    console.log(data);
    const basePath = window.location.pathname;
    axios.post(basePath + 'api/budgets', data)
    .then(() => {
      this.fetchData();
    })
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
    const { budget, expandedRows, expenseRows, startYear, startMonth, endYear, endMonth, showEntryForm, editMode } = this.state;

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
          <div  className="budgetSummary">
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
            <table>
              <thead>
                <tr>
                  <td></td>
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
                  <td>Date</td>
                  {budget && budget.columns.map(col => (
                    <>
                      <th
                        key={`${col.id}right`}
                        align="center"
                        sx={{
                          borderLeft: '3px solid rgba(112, 112, 112, 1)',
                          fontWeight: 'bold',
                        }}
                      >Planned</th>
                      <th
                        key={`${col.id}left`}
                        align="center"
                        sx={{
                          borderLeft: '1px solid rgba(224, 224, 224, 1)',
                          borderRight: '3px solid rgba(112, 112, 112, 1)',
                          fontWeight: 'bold',
                        }}
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
                    <td>{rows[key]}</td>
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
            Create new budget
          </button>
          {showEntryForm && (
            <InputForm submitFn={this.submitEntry} fields={{
              title: 'Budget Name'
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