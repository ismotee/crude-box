const Crude = require("./Crude.js").default;

describe("creators:", () => {
  let crude;
  let response;
  let initialValue = undefined;
  let callbackFunc;
  const getStateKeys = () => Object.keys(crude.getState());
  const getItemWithResponse = () => crude.getState()[response];
  const readResponseItem = () => crude.read(response);
  const crudeWithOneItem = (init) => {
    return () => {
      callbackFunc = jest.fn();
      initialValue = init;
      crude = new Crude();
      crude.setStateChangedCallback(callbackFunc);
      response = crude.create(initialValue);
    };
  };
  const emptyCrude = () => {
    return () => {
      crude = new Crude();
      crude.setStateChangedCallback(callbackFunc);
    };
  };

  const uuidMatch = expect.stringMatching(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );

  describe("When create is called without argument,", () => {
    beforeEach(crudeWithOneItem(undefined));

    test("should return uuid", () => {
      expect(response).toEqual(uuidMatch);
    });

    test("should create an new object to store with a value of undefined", () => {
      const item = getItemWithResponse();
      const entries = Object.entries(item);

      expect(getStateKeys(crude)).toEqual(expect.arrayContaining([uuidMatch]));
      expect(entries).toEqual([["value", undefined]]);
    });

    test("store keys length should be 1", () => {
      expect(getStateKeys().length).toEqual(1);
    });

    test("should call callback", () => {
      expect(callbackFunc).toHaveBeenCalled();
    });
  });

  describe("When create is called with string,", () => {
    beforeEach(crudeWithOneItem("some initial value"));

    test("should create item with initial value", () => {
      expect(getItemWithResponse()).toEqual({ value: initialValue });
    });

    test("value should be accessible using read()", () => {
      expect(readResponseItem()).toEqual(initialValue);
      expect(callbackFunc).toHaveBeenCalled();
    });
  });

  describe("When create is called with string,", () => {
    beforeEach(crudeWithOneItem("some initial value"));

    test("should create item with initial value", () => {
      expect(getItemWithResponse()).toEqual({ value: initialValue });
      expect(callbackFunc).toHaveBeenCalled();
    });
  });

  describe("When accessing item with read(id),", () => {
    beforeEach(crudeWithOneItem("some initial value"));

    test("should return value", () => {
      expect(readResponseItem()).toEqual(initialValue);
    });
  });

  describe("When accessing item with read(),", () => {
    beforeEach(crudeWithOneItem("some initial value"));

    test("should return list of items", () => {
      expect(crude.read()).toEqual([{ key: response, value: initialValue }]);
    });
  });

  describe("given empty state, when accessing item with read(),", () => {
    beforeEach(emptyCrude());

    test("should return list of items", () => {
      expect(crude.read()).toEqual([]);
    });
  });

  describe("When trying to access value with non existing id by using read(),", () => {
    beforeEach(crudeWithOneItem(undefined));

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

  describe("When updating item with a new value,", () => {
    beforeEach(crudeWithOneItem("first value"));

    test("Should change value", () => {
      const newValue = "second value";
      crude.update(response, newValue);
      expect(readResponseItem()).toEqual(newValue);
      expect(callbackFunc).toHaveBeenCalledTimes(2);
    });
  });

  describe("When updating item with a new value but id doesn't exist,", () => {
    beforeEach(crudeWithOneItem("first value"));

    test("Should throw Item doesn't exist error", () => {
      const newValue = "second value";
      const falseId = "not an id";
      expect.assertions(2);
      try {
        crude.update(falseId, newValue);
      } catch (e) {
        expect(e.message).toEqual(`Item doesn't exist: ${falseId}`);
      }
      expect(crude.getState()).toEqual({ [response]: { value: initialValue } });
    });
  });

  describe("when delete is called with item id,", () => {
    beforeEach(crudeWithOneItem());

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
});
