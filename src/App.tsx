import { memo } from "react";
import PhoneManager from "./components/Phone";

const App = () => {
  return (
    <div className="App">
      <PhoneManager />
    </div>
  );
};

export default memo(App);
