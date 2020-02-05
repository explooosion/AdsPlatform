import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Broadcast from './pages/Broadcast';
import Manage from './pages/Manage';
import Home from './pages/Home';

const Routes = [
  {
    key: 'broadcast',
    path: '/:id',
    exact: true,
    component: Broadcast,
  },
  {
    key: 'manage',
    path: '/:id/edit',
    exact: true,
    component: Manage,
  },
  {
    key: 'room',
    path: '/',
    exact: true,
    component: Home,
  }
];

function App() {
  const renderRoutes = route => {
    const { key, exact, path, component: Component } = route;
    return (
      <Route
        key={`route-${key}`}
        exact={exact}
        path={path}
        render={props => <Component {...props} />}
      />
    );
  }

  return (
    <Router>
      <Switch>
        {Routes.map(route => renderRoutes(route))}
      </Switch>
    </Router>
  );
}

export default App;
