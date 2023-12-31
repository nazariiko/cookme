import React from "react";

const AdultFilter = (props) => {
  return (
      <li>
        <div className="form-check form-switch adultSwitch">
          <input type="checkbox" className="form-check-input" id="Toggle1" />
          <label className="form-check-label" htmlFor="Toggle1">
            {props.t("Adult content")}
          </label>
        </div>
      </li>
  );
};

export default AdultFilter;
