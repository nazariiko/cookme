import React from "react";
import HomeContainer from "../containers/Home/Index";
import Login from "../containers/Login/Index";

const Home = (props) => (
  <React.Fragment>
    { (
      <HomeContainer {...props} />
    )}
  </React.Fragment>
);
export default Home;
