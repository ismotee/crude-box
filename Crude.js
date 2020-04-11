const uuid = require("uuid/v4");
const clonedeep = require("lodash.clonedeep");

class Crude {
  constructor() {
    this.state = {};
    this.callback = () => {};
  }

  create(value) {
    const id = uuid();
    this.state = this.copyState();
    this.state[id] = { value };
    this.callback();
    return id;
  }

  read(id) {
    if (!id) return this.convertToList();
    this.validateId(id);
    return this.state[id].value;
  }

  update(id, newValue) {
    this.validateId(id);
    this.state = this.copyState();
    const item = clonedeep(this.state[id]);
    item.value = newValue;
    this.state[id] = item;
    this.callback();
  }

  delete(id) {
    this.validateId(id);
    this.state = this.copyState();
    delete this.state[id];
    this.callback();
  }

  copyState() {
    return clonedeep(this.state);
  }

  convertToList() {
    return Object.entries(this.state).map(([key, item]) => {
      return { key, value: item.value };
    });
  }

  validateId(id) {
    if (!this.state[id]) {
      throw Error(`Item doesn't exist: ${id}`);
    }
  }

  getState() {
    return this.state;
  }

  setStateChangedCallback(callback) {
    this.callback = callback;
  }
}

module.exports.default = Crude;
