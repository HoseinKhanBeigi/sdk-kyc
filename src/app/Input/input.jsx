import "./style.css";
export default function Input({
  title,
  value,
  required,
  onChange,
  placeholder,
  maxlength,
}) {
  return (
    <div className="form-box-unit">
      <input
        type="text"
        className="input"
        maxlength={maxlength}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(value) => onChange(value)}
      />
      <label> {title} </label>
      <fieldset>
        <legend>
          <p> {title} </p>
        </legend>
      </fieldset>
    </div>
  );
}
