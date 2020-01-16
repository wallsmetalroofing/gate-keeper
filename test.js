/* es-lint: ecmaVersion */
const assert = require('assert');
const {
    GateKeeper
} = require("./index");

describe("Gate Keeper", () => {
    describe("calls only once", () => {
        it("should only call once", function (done) {
            const get = GateKeeper(async () => {
                done();
            });

            get(1);
            get(1);
        });

        it("should resolve the call twice", (done) => {
            let calls = 0;

            const get = GateKeeper(async () => {
                // done();
            });
            get(2).then(() => {
                calls++;
                if (calls === 2) {
                    done();
                }
            });
            get(1).then(() => {
                calls++;
                if (calls === 2) {
                    done();
                }
            });
            get(1).then(() => {
                calls++;
                if (calls === 2) {
                    done();
                }
            });
        });
    });

    describe("result should be equal", () => {

        it("deep equal", (done) => {

            let firstResult = null;

            const get = GateKeeper(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            a: 1,
                            d: {
                                f: 5
                            }
                        });
                    }, 1);
                });
            });

            get(1).then(result => firstResult = result);

            get(1).then(result => {
                if (result === firstResult) {
                    done();
                } else {
                    done(1);
                }
            });
        });
    });

});