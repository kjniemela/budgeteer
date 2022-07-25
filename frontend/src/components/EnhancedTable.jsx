import React from 'react';

function descendingComparator(a, b, column, defaultColumn) {
  let aVal = a[column.id];
  let bVal = b[column.id];

  if (column.numeric) {
    aVal = Number(a[column.id]);
    bVal = Number(b[column.id]);
  }

  if (!aVal) return -1;
  if (!bVal) return 1;

  if (aVal < bVal) {
    return -1;
  }
  if (aVal > bVal) {
    return 1;
  }
  if (defaultColumn) return descendingComparator(a, b, defaultColumn);
  else return 0;
}

function getComparator(orderDesc, column, defaultColumn) {
  return orderDesc
    ? (a, b) => descendingComparator(a, b, column, defaultColumn)
    : (a, b) => -descendingComparator(a, b, column, defaultColumn);
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
    const { columns, rows, refresh, onClicks, defaultSort } = this.props;
    const { orderDesc, sortBy } = this.state;

    const sortColumn = columns.find(column => column.id === sortBy);
    const defaultColumn = columns.find(column => column.id === defaultSort);

    const sortedRows = sortBy ? rows.sort(getComparator(orderDesc, sortColumn, defaultColumn)) : rows;

    return (
      <div className="enhancedTable">
        <div className="tableBtns">
          <button className="textBtn" onClick={refresh}>Refresh</button>
        </div>
        <div className="tableFrame">
          <table>
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={`HEAD-${column.id}`} onClick={() => this.sortBy(column.id)}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(row => (
                <tr key={row.id}>
                  {columns.map((column, i) => {
                    let content = <>{column.prefix}{this.getStrValue(column, row)}</>;
                    if (onClicks && onClicks[column.id]) {
                      content = <a className="tableLink" onClick={() => onClicks[column.id](row)}>{content}</a>;
                    }

                    return <td key={`${row.id}-${column.id}`} className={i > 0 ? 'leftBorder' : ''}>{content}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default EnhancedTable;
  