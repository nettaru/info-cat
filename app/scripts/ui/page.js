import UIModel from './model';
import { domElementFromDescription } from './utils';
import CurrentAvarageCPULoad from './current-avarage-cpu-load';
import LoadTimeWindow from './load-time-window';

export default class Page extends UIModel {
  constructor (store) {
    super('page');
    this.cpuAvarageLoad = new CurrentAvarageCPULoad(store);
    this.loadTimeWindow = new LoadTimeWindow(store);
  }

  renderChildren () {
    return [
      domElementFromDescription({
        tag: 'h1',
        attributes: { id: 'header' },
        properties: { textContent: 'Avarage CPU Load Dashboard' }
      }),
      this.cpuAvarageLoad.render(),
      this.loadTimeWindow.render()
    ]
  }
};