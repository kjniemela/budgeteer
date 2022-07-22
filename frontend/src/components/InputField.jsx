import React from 'react';

const InputField = ({ id, label, errorText, required, type, select, value, onChange, dropdownOptions }) => {

  return (
    <div className={`inputField ${errorText ? 'error' : ''}`}>
      <label htmlFor={id}>{label}{required ? ' *' : ''}</label>
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
            <option key={option.value} value={option.value}>{option.label}</option>
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
      {errorText && (
        <span>{errorText}</span>
      )}
    </div>
  );
};

export default InputField;