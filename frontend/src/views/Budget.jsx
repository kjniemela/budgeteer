import React from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, Collapse, Container, IconButton, Paper, Stack, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';

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
    };
    this.fetchData = this.fetchData.bind(this);
    this.submitEntry = this.submitEntry.bind(this);
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

  render() {
    const { name, setView } = this.props;
    const { budget, expandedRows, expenseRows, showEntryForm, startYear, startMonth, endYear, endMonth } = this.state;

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
        <PageTitle title={budget ? budget.budget.title : null} />
        <Container style={{
          // maxWidth: 800,
        }}>
          <Stack spacing={2}>
            <TableContainer component={Paper}>
            <IconButton
              sx={{ margin: 2 }}
              onClick={this.fetchData}
            >
              <RefreshIcon />
            </IconButton>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    {budget && budget.columns.map(col => (
                      <TableCell key={col.id} align="center" colSpan={2}>{col.title}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    {budget && budget.columns.map(col => (
                      <>
                        <TableCell
                          key={`${col.id}left`}
                          align="center"
                          sx={{
                            borderLeft: '1px solid rgba(224, 224, 224, 1)',
                          }}
                        >Spent</TableCell>
                        <TableCell
                          key={`${col.id}right`}
                          align="center"
                          sx={{
                            borderRight: '1px solid rgba(224, 224, 224, 1)',
                          }}
                        >Allocated</TableCell>
                      </>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(rows).map((key, index) => (
                    <TableRow
                      key={key}
                      onClick={() => {
                        
                      }}
                    >
                      <TableCell>{rows[key]}</TableCell>
                      {budget && budget.columns.map(col => (
                        <>
                          <TableCell
                            key={`${col.id}${key}left`}
                            sx={{
                              borderLeft: '1px solid rgba(224, 224, 224, 1)',
                              backgroundColor: (Number(expenseRows[index][col.id]) > Number(col.rows[key]) ? '#e80000' : ''),
                            }}
                            align="left"
                          >${expenseRows[index][col.id] || 0}</TableCell>
                          <TableCell
                            key={`${col.id}${key}right`}
                            sx={{
                              borderRight: '1px solid rgba(224, 224, 224, 1)',
                            }}
                            align="left"
                          >${col.rows[key]}</TableCell>
                        </>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button 
              onClick={() => this.setState({ showEntryForm: !showEntryForm })}
              variant="text"
              >
              Create new budget
            </Button>
            {showEntryForm && (
              <InputForm submitFn={this.submitEntry} fields={{
                title: 'Budget Name'
              }} required={{
                title: true
              }} />
            )}
          </Stack>
        </Container>
      </>
    );
  }
}

export default Budget;