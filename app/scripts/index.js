import '../styles/index.css';
import Store from './store';
import Page from './ui/page';
import SocketManager from './socket-manager';
import NotificationsManager from './notifications-manager';

export function boot () {
  // Create new state store
  const store = Store();

  // Create socket manager to handle communication with server
  SocketManager(store);

  // Create notification manager to show alerts on high cpu load events
  NotificationsManager(store);
  
  // Create the UI and append to the document
  const page = new Page(store);
  document.getElementById('root').append(page.render());
};

boot();