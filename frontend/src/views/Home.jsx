import React from 'react';
import { Container, Typography } from '@mui/material';

import PageTitle from '../components/PageTitle.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { name, setView } = this.props;
    return (
      <>
        <PageTitle title={'Home'} />
        <Container style={{
          maxWidth: 800,
        }}>
          {/* <Typography variant="body1">
            Welcome to HMI!
          </Typography> */}
          <Container style={{
            marginBottom: 10,
            textAlign: 'center',
          }}>
            <Typography variant="h2">
              Projects
            </Typography>
          </Container>
          <ProjectCard view={'home'} project={'remnant'} setView={setView} />
          <ProjectCard view={'home'} project={'civclonejs'} setView={setView} />
          <ProjectCard view={'home'} project={'simplesequencer'} setView={setView} />
          <ProjectCard view={'home'} project={'archivium'} setView={setView} />
          <ProjectCard view={'home'} project={'voteinator'} setView={setView} />
          <ProjectCard view={'home'} project={'tkdmotions'} setView={setView} />
        </Container>
      </>
    );
  }
}

export default Home;