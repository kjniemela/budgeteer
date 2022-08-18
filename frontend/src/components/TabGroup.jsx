import React from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import SolidBtn from './buttons/SolidBtn.jsx';

const TabGroup = ({ tabs }) => {
  
  const locationArray = useLocation().pathname.split('/');
  const currentTab = locationArray[locationArray.length - 1];

  return (
    <>
      {!(currentTab in tabs) && <Navigate to={Object.keys(tabs)[0]} />}
      <div className="horizontalBtnField">
        {Object.keys(tabs).map(tab => (
          tabs[tab] ? (
            <Link
              key={tab}
              to={tab}
              className={`btn solidBtn fullWidth${tab === currentTab ? ' selected' : ''}`}
            >
              {tabs[tab].displayName}
            </Link>
          ) : null
        ))}
      </div>
      <hr />
      <Routes>
        {Object.keys(tabs).map(tab => (
          (tabs[tab] ? <Route key={tab} path={tab} element={tabs[tab].content} /> : null)
        ))}
      </Routes>
    </>
  );
};

// class TabGroup extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       currentTab: (Object.keys(props.tabs)[0] || null),
//     };
//   }

//   render() {
//     const { tabs } = this.props;
//     const { currentTab } = this.state;

//     return (
//       <>
        // <div className="horizontalBtnField">
        //   {Object.keys(tabs).map(tab => (
        //     tabs[tab] ? (
        //       <SolidBtn
        //         key={tab}
        //         className={`fullWidth${tab === currentTab ? ' selected' : ''}`}
        //         onClick={() => this.setState({ currentTab: tab })}
        //       >
        //         {tabs[tab].displayName}
        //       </SolidBtn>
        //     ) : null
        //   ))}
        // </div>
        // <hr />
//         {tabs[currentTab].content}
//       </>
//     );
//   }
// }

export default TabGroup;