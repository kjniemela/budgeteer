import React from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    const { submitFn, fields, required, types, defaults, submitText, dropdownOptions, onChanges, validators } = props;

    if (!submitFn) throw new Error('InputForm component must have a `submitFn` prop!');
    if (!fields) throw new Error('InputForm component must have a `fields` prop!');

    this.state = {
      fields: Object.keys(fields).reduce((acc, val, i) => ({...acc, [val]: (defaults && defaults[val]) || ''}), {}),
      errors: Object.keys(fields).reduce((acc, val, i) => ({...acc, [val]: null}), {}),
      dropdownOptions: dropdownOptions ? Object.keys(dropdownOptions).reduce((acc, field, i) => ({...acc, [field]: (
        Object.keys(dropdownOptions[field]).reduce((acc, val, i) => ([...acc, { value: val, label: dropdownOptions[field][val] }]), [])
      )}), [{}]) : {},
    };
    this.submit = this.submit.bind(this);
  }

  validate() {
    const { required, validators } = this.props;
    const { fields } = this.state;
    let errors = { ...this.state.errors };

    // TODO - remove me!
    console.log(fields);

    let valid = true;

    for (const field in fields) {
      errors[field] = null;
      if (required && required[field] && !fields[field]) {
        errors[field] = 'Required';
        valid = false;
      } else if (validators && validators[field]) {
        const error = validators[field](fields[field]);
        if (error) {
          errors[field] = error;
          valid = false;
        }
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
    const { fields: fieldNames, required, types, dynamicDropdownOptions, submitText, onChanges } = this.props;
    const { fields, errors, dropdownOptions } = this.state;

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
            select={types && types[field] === 'select' || types[field] === 'dynamicselect'}
            value={fields[field]}
            onChange={({ target }) => {
              if (onChanges && onChanges[field]) onChanges[field](target.value);
              this.setState({ fields: {...fields, [field]: target.value }});
            }}
          >
            {types && types[field] === 'select' && dropdownOptions[field].map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
            {types && types[field] === 'dynamicselect' && dynamicDropdownOptions[field]().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
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