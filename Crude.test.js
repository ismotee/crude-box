const Crude = require("./Crude.js").default;

describe("creators:", () => {
  let crude;
  let response;
  let initialValue = undefined;
  let callbackFunc;
  let subscribeFunc;

  const getStateKeys = () => Object.keys(crude.getState());
  const getItemWithResponse = () => crude.getState()[response];
  const readResponseItem = () => crude.read(response);
  const crudeWithOneItem = (init) => {
    return () => {
      initialValue = init;
      crude = new Crude();
      response = crude.create(initialValue);
    };
  };
  const crudeWithOneItemAndCallback = (init) => {
    return () => {
      callbackFunc = jest.fn();
      initialValue = init;
      crude = new Crude();
      crude.addStateChangedCallback(callbackFunc);
      response = crude.create(initialValue);
    };
  };
  const crudeWithOneItemAndSubscribe = (init) => {
    return () => {
      subscribeFunc = jest.fn();
      initialValue = init;
      crude = new Crude();
      crude.addStateChangedCallback(callbackFunc);
      response = crude.create(initialValue);
      crude.subscribe([response], subscribeFunc);
    };
  };

  const emptyCrude = () => {
    return () => {
      crude = new Crude();
    };
  };

  const uuidMatch = expect.stringMatching(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );

  describe("When create is called with string", () => {
    beforeEach(crudeWithOneItem("some initial value"));

    test("should create item with initial value", () => {
      expect(getItemWithResponse()).toEqual({ value: initialValue });
    });

    test("value should be accessible using read()", () => {
      expect(readResponseItem()).toEqual(initialValue);
    });
  });

  describe("When accessing item with read()", () => {
    beforeEach(crudeWithOneItem("some initial value"));

    test("should return list of items", () => {
      expect(crude.read()).toEqual([{ key: response, value: initialValue }]);
    });
  });

  describe("given empty state, when accessing item with read()", () => {
    beforeEach(emptyCrude());

    test("should return list of items", () => {
      expect(crude.read()).toEqual([]);
    });
  });

  describe("When trying to access value with non existing id by using read()", () => {
    beforeEach(crudeWithOneItem());

    test("should throw Item doesn't exist error", () => {
      falseId = "id that doesn't exist";
      expect.assertions(1);
      try {
        crude.read(falseId);
      } catch (e) {
        expect(e.message).toEqual(`Item doesn't exist: ${falseId}`);
      }
    });
  });

  describe("Given callback, when updating item with a new value", () => {
    beforeEach(crudeWithOneItemAndCallback("first value"));

    test("Should change value and call callback function", () => {
      const newValue = "second value";
      crude.update(response, newValue);
      expect(readResponseItem()).toEqual(newValue);
      expect(callbackFunc).toHaveBeenCalledTimes(2);
    });
  });

  describe("When updating item with a new value but id doesn't exist", () => {
    beforeEach(crudeWithOneItemAndCallback("first value"));

    test("Should throw Item doesn't exist error", () => {
      const newValue = "second value";
      const falseId = "not an id";
      let message;
      expect.assertions(3);
      try {
        crude.update(falseId, newValue);
      } catch (e) {
        message = e.message;
      }
      expect(message).toEqual(`Item doesn't exist: ${falseId}`);
      expect(crude.getState()).toEqual({ [response]: { value: initialValue } });
      expect(callbackFunc).toHaveBeenCalledTimes(1);
    });
  });

  describe("when delete is called with item id and callback", () => {
    beforeEach(crudeWithOneItemAndCallback());

    test("should delete item from the state,", () => {
      crude.delete(response);
      try {
        readResponseItem();
      } catch (e) {
        expect(e.message).toEqual(`Item doesn't exist: ${response}`);
      }
      expect(getStateKeys().length).toEqual(0);
      expect(callbackFunc).toHaveBeenCalledTimes(2);
    });
  });

  describe("when delete is called to a id that doesn't exist", () => {
    beforeEach(crudeWithOneItem());

    test("should throw an Item doesn't exist Error", () => {
      let message;
      const falseId = "not an id";
      try {
        crude.delete(falseId);
      } catch (e) {
        message = e.message;
      }
      expect(message).toEqual(`Item doesn't exist: ${falseId}`);
    });
  });

  describe("when creating item with a callback and callback is removed and item is deleted", () => {
    beforeEach(crudeWithOneItemAndCallback());

    test("should call a callback once", () => {
      crude.removeStateChangedCallback(callbackFunc);
      crude.delete(response);
      expect(callbackFunc).toHaveBeenCalledTimes(1);
    });
  });

  describe("when item is created and subscribed and item's value is updated", () => {
    beforeEach(crudeWithOneItemAndSubscribe());

    test("should call subscribe", () => {
      crude.update(response, "new value");
      expect(subscribeFunc).toHaveBeenCalledTimes(1);
    });
  });

  describe("when item is created ans subscribed and unsubscribed and the item's value is updated", () => {
    beforeEach(crudeWithOneItemAndSubscribe());

    test("should not call subscribe function", () => {
      crude.unsubscribe(subscribeFunc);
      crude.update(response, "some value");
      expect(subscribeFunc).not.toHaveBeenCalled();
    });
  });
});
