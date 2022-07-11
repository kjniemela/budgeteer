import React from 'react';
import { Button, Stack, TextField } from '@mui/material';

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    const { submit, fields, required, types, submitText } = props;

    if (!submit) throw new Error('InputForm component must have a `submit` prop!');
    if (!fields) throw new Error('InputForm component must have a `fields` prop!');

    this.state = {
      fields: Object.keys(fields).reduce((acc, val, i) => ({...acc, [val]: ''}), {}),
    };
  }

  render() {
    const { submit, fields: fieldNames, required, types, submitText } = this.props;
    const { fields } = this.state;

    return (
      <>
        {Object.keys(fields).map((field) => (
          <TextField
            id={field}
            key={field}
            label={fieldNames[field]}
            color="info"
            required={required && !!required[field]}
            type={types && types[field] || undefined}
            value={fields[field]}
            onChange={({ target }) => this.setState({ fields: {...fields, [field]: target.value }})}
          />
        ))}
        <Button 
          onClick={() => submit(fields)}
          variant="contained"
        >
          {submitText || 'Submit'}
        </Button>
      </>
    );
  }
}

export default InputForm;