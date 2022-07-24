import React from 'react';

class TabGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: (Object.keys(props.tabs)[0] || null),
    };
  }

  render() {
    const { tabs } = this.props;
    const { currentTab } = this.state;

    return (
      <>
        <div className="horizontalBtnField">
          {Object.keys(tabs).map(tab => (
            tabs[tab] ? (
              <button
                key={tab}
                className={`solidBtn fullWidth${tab === currentTab ? ' selected' : ''}`}
                onClick={() => this.setState({ currentTab: tab })}
              >
                {tabs[tab].displayName}
              </button>
            ) : null
          ))}
        </div>
        <hr />
        {tabs[currentTab].content}
      </>
    );
  }
}

export default TabGroup;