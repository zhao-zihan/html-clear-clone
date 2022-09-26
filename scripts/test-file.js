class Car {
  constructor() {}

  _addCar(name) {
    const carInfo = { name: "mb", make: "sc" };
    const newCar = this.carType(carInfo);
    console.log(newCar);
  }
}

class eCar extends Car {
  constructor() {
    super();
    this.carType = function () {
      return new rCar(...arguments);
    };
  }
}

class rCar {
  constructor(name, make) {
    this.name = name;
    this.make = make;
  }
}

const newCar = new eCar();
newCar._addCar("mb");
