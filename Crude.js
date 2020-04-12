const uuid = require("uuid/v4");
const clonedeep = require("lodash.clonedeep");

class Crude {
  constructor() {
    this.state = {};
    this.callbacks = [];
    this.subscribes = [];
  }

  create(value) {
    const id = uuid();
    this.state = this.copyState();
    this.state[id] = { value };
    this.callCallbacks();
    return id;
  }

  copyState() {
    return clonedeep(this.state);
  }

  callCallbacks() {
    this.callbacks.forEach((cb) => cb());
  }

  read(id) {
    if (!id) return this.convertToList();
    this.validateId(id);
    return this.state[id].value;
  }

  convertToList() {
    return Object.entries(this.state).map(([key, item]) => {
      return { key, value: item.value };
    });
  }

  update(id, newValue) {
    this.validateId(id);
    this.state = this.copyState();
    const item = clonedeep(this.state[id]);
    item.value = newValue;
    this.state[id] = item;
    this.callCallbacks();
    this.callSubscriptions(id);
  }

  validateId(id) {
    if (!this.state[id]) {
      throw Error(`Item doesn't exist: ${id}`);
    }
  }

  callSubscriptions(id) {
    const subs = this.subscribes.filter((ss) =>
      ss.ids.some((idx) => idx === id)
    );
    subs.forEach((sub) => sub.callback());
  }

  delete(id) {
    this.validateId(id);
    this.state = this.copyState();
    delete this.state[id];
    this.callCallbacks();
    this.removeSubscribe();
  }

  removeSubscribe(id) {
    this.subscribes.forEach((sub) => {
      sub.ids = sub.ids.filter((idx) => idx !== id);
    });
  }

  addStateChangedCallback(callback) {
    this.callbacks.push(callback);
  }

  removeStateChangedCallback(callback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  subscribe(ids, callback) {
    this.subscribes.push({ callback, ids });
  }

  unsubscribe(callback) {
    this.subscribes = this.subscribes.filter(
      (sub) => sub.callback !== callback
    );
  }

  getState() {
    return this.state;
  }
}

module.exports = Crude;
