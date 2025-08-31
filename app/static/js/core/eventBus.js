const events = {};

export const eventBus = {
  on(eventName, callback) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(callback);
  },

  emit(eventName, data) {
    if (events[eventName]) {
      events[eventName].forEach((callback) => callback(data));
    }
  },
};

