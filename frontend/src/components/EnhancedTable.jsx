import React from 'react';

function descendingComparator(a, b, column) {
  let aVal = a[column.id];
  let bVal = b[column.id];

  if (column.numeric) {
    aVal = Number(a[column.id]);
    bVal = Number(b[column.id]);
  }

  if (aVal < bVal) {
    return -1;
  }
  if (aVal > bVal) {
    return 1;
  }
  return 0;
}

function getComparator(orderDesc, column) {
  return orderDesc
    ? (a, b) => descendingComparator(a, b, column)
    : (a, b) => -descendingComparator(a, b, column);
}

class EnhancedTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: props.defaultSort,
      orderDesc: true,
    };

    this.sortBy = this.sortBy.bind(this);
  }

  sortBy(id) {
    let { orderDesc, sortBy } = this.state;
    if (sortBy === id) {
      orderDesc = !orderDesc;
    } else {
      sortBy = id;
    }
    this.setState({ orderDesc, sortBy });
  }

  getStrValue(column, row) {
    let value = row[column.id];

    if (column.isDate) {
      return value ? value.toDateString() : 'Never';
    } else {
      return value;
    }
  }

  render() {
    const { columns, rows, refresh, onClicks } = this.props;
    const { orderDesc, sortBy } = this.state;

    const sortedRows = sortBy ? rows.sort(getComparator(orderDesc, columns.find(column => column.id === sortBy))) : rows;

    return (
      <div className="enhancedTable">
        <button className="textBtn" onClick={refresh}>Refresh</button>
        <table>
          <thead>
            <tr>
              {columns.map(column => (
                <th onClick={() => this.sortBy(column.id)}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(row => (
              <tr>
                {columns.map((column, i) => (
                  <td className={i > 0 ? 'leftBorder' : ''}>{column.prefix}{this.getStrValue(column, row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default EnhancedTable;
  