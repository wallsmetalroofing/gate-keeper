/* eslint-disable implicit-arrow-linebreak */
const {
    GateKeeper
} = require("./index.js");

const get = GateKeeper(value =>
    new Promise(resolve => {
        console.log("Calling", value);

        setTimeout(() => resolve(value), 100);
    }));

for (let x = 0; x < 5; x++) {
    for (let i = 0; i < 10; i++) {
        get(i).then(console.log);
    }
}

console.log("Is Getting 5", get.isCurrentlyGetting(5));

get(5).then(console.log);
get(10).then(console.log);
get(10).then(console.log);
get(10).then(console.log);