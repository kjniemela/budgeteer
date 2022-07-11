import React from 'react';
import { Button, Stack, TextField } from '@mui/material';

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    const { submitFn, fields, required, types, defaults, submitText } = props;

    if (!submitFn) throw new Error('InputForm component must have a `submitFn` prop!');
    if (!fields) throw new Error('InputForm component must have a `fields` prop!');

    this.state = {
      fields: Object.keys(fields).reduce((acc, val, i) => ({...acc, [val]: (defaults && defaults[val]) || ''}), {}),
      errors: Object.keys(fields).reduce((acc, val, i) => ({...acc, [val]: null}), {}),
    };
    this.submit = this.submit.bind(this);
  }

  validate() {
    const { required } = this.props;
    const { fields } = this.state;
    let errors = { ...this.state.errors };

    let valid = true;

    for (const field in fields) {
      errors[field] = null;
      if (required && required[field] && !fields[field]) {
        errors[field] = 'Required';
        valid = false;
      }
    }

    this.setState({ errors });
    return valid;
  }

  submit() {
    const { submitFn } = this.props;
    const { fields } = this.state;

    if (!this.validate()) return;

    submitFn(fields)
  }

  render() {
    const { fields: fieldNames, required, types, submitText } = this.props;
    const { fields, errors } = this.state;

    return (
      <>
        {Object.keys(fields).map((field) => (
          <TextField
            id={field}
            key={field}
            label={fieldNames[field]}
            color="info"
            error={!!errors[field]}
            helperText={errors[field]}
            required={required && !!required[field]}
            type={types && types[field] || undefined}
            value={fields[field]}
            onChange={({ target }) => this.setState({ fields: {...fields, [field]: target.value }})}
          />
        ))}
        <Button 
          onClick={this.submit}
          variant="contained"
        >
          {submitText || 'Submit'}
        </Button>
      </>
    );
  }
}

export default InputForm;