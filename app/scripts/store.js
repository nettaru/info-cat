import { ACTION_TYPES } from './config';

function isOngoingTrend(latestTrend, now, trendType) {
  return (now - latestTrend.start)/60000 >= 2 && latestTrend.type == trendType;
}

function updateCPULoadEvents(cpuLoadEvents, type, now) {
    // If no ongoing load event - let's mark a trend start:
    if (cpuLoadEvents.latestTrend.type !== type) {
    cpuLoadEvents.latestTrend = { start: now, type };
  }

  const isOngoingEvent = isOngoingTrend(cpuLoadEvents.latestTrend, now, type);
  // If we have an ongoing high load event -
  // Either update the event still ongoing, or log the new event
  if (isOngoingEvent) {
    const lastEvent = cpuLoadEvents.events[cpuLoadEvents.events.length - 1];
    if (lastEvent && lastEvent.start == cpuLoadEvents.latestTrend.start) {
      lastEvent.end = now;
    } else {
      cpuLoadEvents.events.push({ start: cpuLoadEvents.latestTrend.start, end: now, type });
    }
  }
}

function getNextState (currentAvarageLoad, state) {
  const now = Date.now();
  // Add current avarage data with time, remove first element of window to maintain
  // data for the past 10 minutes.
  const avarageLoad10MinWindow = [...state.avarageLoad10MinWindow, { time: now, value: currentAvarageLoad }];

  // Check if we maintain data for longer than 10 minutes, and if so - remove the first data entry
  if ((avarageLoad10MinWindow[avarageLoad10MinWindow.length - 1].time - avarageLoad10MinWindow[0].time)/(10*60*1000) > 10) {
    avarageLoad10MinWindow.shift();
  }

  // Update high CPU load
  const cpuLoadEvents = {
    events: [...state.cpuLoadEvents.events],
    latestTrend: {...state.cpuLoadEvents.latestTrend}
  };
  const eventType = currentAvarageLoad > 1 ? ACTION_TYPES.type : ACTION_TYPES.RECOVERY;
  updateCPULoadEvents(cpuLoadEvents, eventType, now);

  // Remove or update first CPU load event if it is already out of the documented time window
  if (cpuLoadEvents.events.length > 0 && avarageLoad10MinWindow[0].time > cpuLoadEvents.events[0].start) {
    cpuLoadEvents.events[0].start = avarageLoad10MinWindow[0].time;
    if (cpuLoadEvents.events[0].end < cpuLoadEvents.events[0].start) {
      cpuLoadEvents.events.shift();
    }
  }

  return {
    // Update current avarage load
    currentAvarageLoad,
    avarageLoad10MinWindow,
    cpuLoadEvents
  };
}

/**
 * Store manages the module state, in a redux-y manner.
 * Returns getState, dispatch & subscribe API
**/
export default function Store() {
  const subscribtions = {};
  let state = {
    currentAvarageLoad: 0,
    avarageLoad10MinWindow: [],
    cpuLoadEvents: {
      events: [],
      latestTrend: {}
    }
  };
  return {
    getState: () => {
      return state;
    },
    dispatch: data => {
      if (!data) return;
      const { type, payload } = data;
      const notifyEvents = [type];
      switch (type) {
        case ACTION_TYPES.NEW_LOAD_DATA:
          const currentAvarageLoad = Number(payload);
          const nextState = getNextState(currentAvarageLoad, state);

          const isNewLoadEvent = nextState.cpuLoadEvents.events.length > state.cpuLoadEvents.events.length;
          if (isNewLoadEvent) {
            notifyEvents.push(nextState.cpuLoadEvents.events[nextState.cpuLoadEvents.events.length - 1].type);
          }

          state = nextState;
          break;
        default:
          return;
      }
      Object.values(subscribtions).forEach(subscribtion => subscribtion(notifyEvents));
    },
    subscribe: (subscribtion) => {
      const randomId = Math.random().toString();
      subscribtions[randomId] = subscribtion;
      return () => {
        delete subscribtions[randomId];
      };
    }
  }
};