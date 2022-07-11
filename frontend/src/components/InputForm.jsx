import React from 'react';
import { Button, Stack, TextField } from '@mui/material';

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    const { submit, fields, required, types, defaults, submitText } = props;

    if (!submit) throw new Error('InputForm component must have a `submit` prop!');
    if (!fields) throw new Error('InputForm component must have a `fields` prop!');

    this.state = {
      fields: Object.keys(fields).reduce((acc, val, i) => ({...acc, [val]: (defaults && defaults[val]) || ''}), {}),
      showError: false,
    };
  }

  render() {
    const { submit, fields: fieldNames, required, types, submitText } = this.props;
    const { fields, showError } = this.state;

    return (
      <>
        {Object.keys(fields).map((field) => (
          <TextField
            id={field}
            key={field}
            label={fieldNames[field]}
            color="info"
            error={showError}
            required={required && !!required[field]}
            type={types && types[field] || undefined}
            value={fields[field]}
            onChange={({ target }) => this.setState({ showError: false, fields: {...fields, [field]: target.value }})}
          />
        ))}
        <Button 
          onClick={() => {
            if (submit(fields)) {

            } else {
              this.setState({ showError: true });
            }
          }}
          variant="contained"
        >
          {submitText || 'Submit'}
        </Button>
      </>
    );
  }
}

export default InputForm;