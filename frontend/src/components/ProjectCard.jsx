import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, CardMedia, Link, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@emotion/react';
import axios from 'axios';

const ProjectCard = ({ view, project, setView }) => {

  const [data, setData] = useState(undefined);
  const { palette } = useTheme();

  useEffect(() => {
    axios.get(`/api/projects/project_cards/${project}.json`)
    .then((response) => {
      setData(response.data);
    })
    .catch((err) => {
      console.error(err);
      setData({
        title: 'Error',
        desc: 'There was an error loading the details of this project. If this error persists, please let a site administrator know.'
      });
    });
  }, []);

  return (
    <Card sx={{
      marginY: 8
    }}>
      <CardMedia
        component="img"
        height="280"
        image={data?.image}
        alt={project}
        sx={{ objectPosition: 'center top' }}
      />
      <CardContent>
        
        <Typography gutterBottom variant="h5" component="div">
          {data?.title}
          <Typography variant="caption" color="text.primary" style={{ marginLeft: 10 }}>
            {data?.authors && `by ${data?.authors}`}
          </Typography>
        </Typography>
        <Typography variant="body2" color="text.primary">
          {data?.desc}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          style={{ color: palette.text.primary }}
          onClick={() => setView('project', project)}
        >
          Learn More
        </Button>
        {data?.site && (<Link href={data?.site}>
          <Button
            size="small"
            style={{ color: palette.text.primary }}
          >
            Visit Site
          </Button>
        </Link>)}
        {data?.github && (<Link href={data?.github}>
          <Button
            size="small"
            style={{ color: palette.text.primary }}
          >
            GitHub Repo
          </Button>
        </Link>)}
      </CardActions>
    </Card>
  );
};

export default ProjectCard;