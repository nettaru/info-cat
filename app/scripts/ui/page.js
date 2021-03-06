import UIModel from './model';
import { domElementFromDescription, createNestedElement } from '../utils';
import CurrentAvarageCPULoad from './current-avarage-cpu-load';
import LoadTimeWindow from './load-time-window';
import CPULoadEventsInfo from './cpu-load-events-info';
export default class Page extends UIModel {
  constructor (store) {
    super('page');
    this.cpuAvarageLoad = new CurrentAvarageCPULoad(store);
    this.loadTimeWindow = new LoadTimeWindow(store);
    this.cpuLoadEventsInfo = new CPULoadEventsInfo(store);
  }

  renderChildren () {
    return [
      domElementFromDescription({
        tag: 'h1',
        attributes: { id: 'header' },
        properties: { textContent: 'Avarage CPU Load Dashboard' }
      }),
      createNestedElement({
        attributes: { id: 'grid-container' },
        children: [
          this.cpuAvarageLoad.render(),
          this.cpuLoadEventsInfo.render(),
          this.loadTimeWindow.render()    
        ]
      })
    ]
  }
};