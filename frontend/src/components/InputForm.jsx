import React from 'react';

import InputField from './InputField.jsx';

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
    const { submitFn, defaults } = this.props;
    const { fields } = this.state;

    if (!this.validate()) return;

    const newFields = { ...fields };

    for (const field in newFields) {
      newFields[field] = defaults ? (defaults[field] || '') : '';
    }

    submitFn(fields);
    this.setState({ fields: newFields });
  }

  render() {
    const { color, fields: fieldNames, required, types, dynamicDropdownOptions, submitText, onChanges } = this.props;
    const { fields, errors, dropdownOptions } = this.state;

    return (
      <div className="inputForm">
        {Object.keys(fields).map((field) => (
          <InputField
            key={field}
            id={field}
            color={color}
            label={fieldNames[field]}
            errorText={errors[field]}
            required={required && !!required[field]}
            type={types && types[field] || 'text'}
            select={types && (types[field] === 'select' || types[field] === 'dynamicselect')}
            value={fields[field]}
            onChange={({ target }) => {
              if (onChanges && onChanges[field]) onChanges[field](target.value);
              this.setState({ fields: {...fields, [field]: target.value }});
            }}
            dropdownOptions={
              types && (
                types[field] === 'select' ? (
                  dropdownOptions[field]
                ) : (
                  types[field] === 'dynamicselect' && dynamicDropdownOptions[field]()
                )
              )
            }
          />
        ))}
        <button
          className="btn solidBtn submit"
          onClick={this.submit}
        >
          {submitText || 'Submit'}
        </button>
      </div>
    );
  }
}

export default InputForm;