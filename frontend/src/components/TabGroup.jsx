import React from 'react';
import { Link, Routes, Route, Navigate, useLocation, useResolvedPath } from 'react-router-dom';

import SolidBtn from './buttons/SolidBtn.jsx';

const TabGroup = ({ tabs, defaultTab }) => {
  
  const location = useLocation().pathname;
  const locationArray = location.split('/');
  const currentTab = locationArray[locationArray.length - 1];
  const parentRoute = useResolvedPath(".").pathname;

  console.log(currentTab)

  return (
    <>
      {!((currentTab in tabs) || defaultTab) && <Navigate to={Object.keys(tabs)[0]} />}
      {(defaultTab && !(currentTab in tabs && currentTab !== defaultTab) && location !== parentRoute) && <Navigate to={parentRoute} />}
      <div className="horizontalBtnField">
        {Object.keys(tabs).map(tab => (
          tabs[tab] ? (
            <Link
              key={tab}
              to={tab === defaultTab ? '' : tab}
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
          (tabs[tab] ? <Route key={tab} path={tab === defaultTab ? '' : tab} element={tabs[tab].content} /> : null)
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