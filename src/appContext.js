import { createContext } from 'react';

import Socket from './services/socket';

export default createContext({
  ws: new Socket().connect(),
});
