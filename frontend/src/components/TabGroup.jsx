import React from 'react';

import SolidBtn from './buttons/SolidBtn.jsx';

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
              <SolidBtn
                key={tab}
                className={`fullWidth${tab === currentTab ? ' selected' : ''}`}
                onClick={() => this.setState({ currentTab: tab })}
              >
                {tabs[tab].displayName}
              </SolidBtn>
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