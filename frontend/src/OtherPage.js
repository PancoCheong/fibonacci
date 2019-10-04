import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div>
      <div>This page is for demonstrating HTML5 push state routing by using react router</div>
	  <div>&nbsp;</div>
      <Link to="/">Go back to home page!</Link>
    </div>
  );
};
