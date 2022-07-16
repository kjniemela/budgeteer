import React from 'react';

const InputField = ({ id, label, errorText, required, type, select, value, onChange, dropdownOptions }) => {

  return (
    <div className="inputField">
      <label htmlFor={id}>{label}</label>
      {select ? (
        <select
          className="input"
          id={id}
          required={required}
          value={value}
          onChange={onChange}
        >
          <option value={null}></option>
          {dropdownOptions.map(option => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          id={id}
          required={required}
          type={type}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default InputField;