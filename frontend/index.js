const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

const path = require('path');
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'dist/')));

app.use('/api', express.static(path.join(__dirname, 'data/')));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
