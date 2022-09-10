# Crude-box

Crude-box is a simplistic, relational and framework agnostic data manager.

# Installation

`npm i crude-box`

# Usage / Getting started

_Import CrudeBox and create new instance:_

```
 import CrudeBox from "crude-box";
 import crude = CrudeBox();
```

_Crude-box "emulates" CRUD-style data management. There's four basic methods:_

```
const id = crude.create(initialValue);
crude.read(id);
crude.update(id, newValue);
crude.delete(id);
```

_There's few other convinient methods:_

```
// create a calculated property that updates whenever ids are being changed.
// calculatedFunction will receive values of the ids as a separated arguments.
const id = crude.createCalculated(calculationFunction, ...ids);

// subscribes to ids and calls subscribe function after value change.
crude.subscribe(ids, subscribeFunction);
crude.unsubscribe(subscribeFunction);

// to read multiple values
const values = crude.readMany(...ids);
```

```
const test = crude.create("Hello, world!");
```

note: create returns an id that is wise to store somewhere.

# Simple examples

The ids from create() call can be stored into nice structures with human-readable names:

```
import CrudeBox from "crude-box";
const crude = CrudeBox();

const person = {
    firstName: crude.create("John"),
    lastName: crude.create("Doe"),
    occupation: crude.create("diver"),
    age: crude.create(42),
};

console.log(crude.read(person.firstName));
```

# State of the project
The project is postponed to the indefinite future.
