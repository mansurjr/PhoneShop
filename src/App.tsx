import { memo } from 'react';
import PhoneManager from './api/phoneCRUD';

const App = () => {
  return (
    <div className="App">
      <PhoneManager/>
    </div>
  );
};

export default memo(App);