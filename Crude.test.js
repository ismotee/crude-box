const Crude = require("./Crude.js");

describe("creators:", () => {
  let crude;
  let response;
  let calculatedItemId;
  let initialValue = undefined;
  let callbackFunc;
  let subscribeFunc;
  let calculation;

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

  const crudeWithBasicAndCalculatedItem = (init, calc = () => {}) => {
    return () => {
      initialValue = init;
      calculation = calc;

      crude = new Crude();
      response = crude.create(init);
      calculatedItemId = crude.createCalculated(calc, response);
    };
  };

  describe("given empty crude, when accessing item with read()", () => {
    beforeEach(emptyCrude());

    test("should return list of items", () => {
      expect(crude.read()).toEqual([]);
    });
  });

  describe("Given crude with one item", () => {
    beforeEach(crudeWithOneItem());

    describe("When create is called with string", () => {
      test("should create item with initial value", () => {
        expect(getItemWithResponse()).toEqual({ value: initialValue });
      });

      test("value should be accessible using read()", () => {
        expect(readResponseItem()).toEqual(initialValue);
      });
    });

    describe("When accessing item with read()", () => {
      test("should return list of items", () => {
        expect(crude.read()).toEqual([{ key: response, value: initialValue }]);
      });
    });

    describe("When trying to access value with non existing id by using read()", () => {
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

    describe("when delete is called to a id that doesn't exist", () => {
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

  describe("Given Crude with one item and callback", () => {
    beforeEach(crudeWithOneItemAndCallback("first value"));

    describe("Given callback, when updating item with a new value", () => {
      test("Should change value and call callback function", () => {
        const newValue = "second value";
        crude.update(response, newValue);
        expect(readResponseItem()).toEqual(newValue);
        expect(callbackFunc).toHaveBeenCalledTimes(2);
      });
    });

    describe("When updating item with a new value but id doesn't exist", () => {
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
        expect(crude.getState()).toEqual({
          [response]: { value: initialValue },
        });
        expect(callbackFunc).toHaveBeenCalledTimes(1);
      });
    });

    describe("when delete is called with item id and callback", () => {
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

    describe("when creating item with a callback and callback is removed and item is deleted", () => {
      test("should call a callback once", () => {
        crude.removeStateChangedCallback(callbackFunc);
        crude.delete(response);
        expect(callbackFunc).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Given Crude with one item and subscribe", () => {
    beforeEach(crudeWithOneItemAndSubscribe());

    describe("when item is created and subscribed and item's value is updated", () => {
      test("should call subscribe", () => {
        crude.update(response, "new value");
        expect(subscribeFunc).toHaveBeenCalledTimes(1);
      });
    });

    describe("when unsubscribed and the item's value is updated", () => {
      test("should not call subscribe function", () => {
        crude.unsubscribe(subscribeFunc);
        crude.update(response, "some value");
        expect(subscribeFunc).not.toHaveBeenCalled();
      });
    });

    describe("When item is deleted", () => {
      test("should remove id from the subscribe", () => {
        crude.delete(response);
        console.log(response);
        expect(crude.subscribes[0].ids).toEqual([]);
      });
    });
  });

  describe("Given crude with one basic and one calculated item with trivial function", () => {
    beforeEach(crudeWithBasicAndCalculatedItem(undefined, () => 42));

    describe("when get(calculatedItemId) is called", () => {
      test("should return 42", () => {
        expect(crude.read(calculatedItemId)).toEqual(42);
      });
    });
  });

  describe("Given crude with one basic (with value of 21) and one calculated item counting twice of first item", () => {
    beforeEach(crudeWithBasicAndCalculatedItem(21, (item) => item * 2));

    describe("when get(calculatedItemId) is called", () => {
      test("should return 42", () => {
        expect(crude.read(calculatedItemId)).toEqual(42);
      });
    });

    describe("When value of first item is changed", () => {
      test("Should change the calculated value too", () => {
        crude.update(response, 42);
        expect(crude.read(calculatedItemId)).toEqual(84);
      });
    });

    describe("when delete is called to calculatedItem", () => {
      test("should delete item and subscription", () => {
        crude.delete(calculatedItemId);
        expect(crude.getState()).not.toContain(calculatedItemId);
        expect(crude.subscribes).toEqual([]);
      });
    });
  });
});
