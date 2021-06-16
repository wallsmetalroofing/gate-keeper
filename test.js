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

        it("identical objects", (done) => {

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

        // ensure that if the original request is rejected that all callbacks throw
        it("all requests should throw", done => {
            let firstError = null;

            const get = GateKeeper(() => (new Promise((_, r) => setTimeout(() => r(new Error("test")), 1))));

            const runThen = (...args) => {
                done(new Error("Promise Resolved"));
            };

            const catchErr = err => {
                if (!firstError) {
                    firstError = err;
                } else {

                    if (firstError === err) {
                        done();
                    } else {
                        done(new Error("Either the errors are not identical or one of the promises resolved"));
                    }

                }
            };

            get(1)
                .then(runThen)
                .catch(catchErr);

            get(1)
                .then(runThen)
                .catch(catchErr);

        });
    });

});