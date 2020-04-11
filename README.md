# Crude-box

Crude-box is a simplistic, relational and framework agnostic data manager.

# Installation

`npm i crude-box`

# Usage / Getting started

Import CrudeBox and create new instance:

```
 import CrudeBox from "crude-box";
 import crude = CrudeBox();
```

Crude-box "emulates" CRUD-style data management.

create new data entry:

```
const test = crude.create("Hello, world!");
```

note: create returns an id that is wise to store somewhere.

Access freshly created data:

```
crude.read(test);
```

or to access all data:

```
crude.read();
```

Update entry:

```
crude.update(test, "Hello, new World!");
```

delete entry:

```
crude.delete(test);
```

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
