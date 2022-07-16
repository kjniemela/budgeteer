import React from 'react';

import PageTitle from '../components/PageTitle.jsx';

const Home = ({ setView }) => {
  return (
    <>
      <PageTitle title={'Home'} />
      <div className="stack" >
        <button className="solidBtn" onClick={() => setView('budgets')}>Budgets</button>
        <button className="solidBtn" onClick={() => setView('envelopes')}>Envelopes</button>
        <button className="solidBtn" onClick={() => setView('expenses')}>Expenses</button>
        <button className="solidBtn" onClick={() => setView('income')}>Income</button>
      </div>
    </>
  );
}

export default Home;