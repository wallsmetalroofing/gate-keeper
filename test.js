/* es-lint: ecmaVersion */
const assert = require("assert");
const { GateKeeper, GateKeeperHit, GateKeeperMiss } = require("./index");
const { debounce } = require("./debounce");

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
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            a: 1,
                            d: {
                                f: 5,
                            },
                        });
                    }, 1);
                });
            });

            get(1).then((result) => (firstResult = result));

            get(1).then((result) => {
                if (result === firstResult) {
                    done();
                } else {
                    done(1);
                }
            });
        });

        // ensure that if the original request is rejected that all callbacks throw
        it("all requests should throw", (done) => {
            let firstError = null;

            const get = GateKeeper(
                () =>
                    new Promise((_, r) =>
                        setTimeout(() => r(new Error("test")), 1)
                    )
            );

            const runThen = (...args) => {
                done(new Error("Promise Resolved"));
            };

            const catchErr = (err) => {
                if (!firstError) {
                    firstError = err;
                } else {
                    if (firstError === err) {
                        done();
                    } else {
                        done(
                            new Error(
                                "Either the errors are not identical or one of the promises resolved"
                            )
                        );
                    }
                }
            };

            get(1).then(runThen).catch(catchErr);

            get(1).then(runThen).catch(catchErr);
        });
    });

    describe("Metrics Callbacks", () => {
        const reset = () => {
            GateKeeperHit(() => {});
            GateKeeperMiss(() => {});
        };
        afterEach(reset);

        it("should call the hit callback once", (done) => {
            const get = GateKeeper(
                () => new Promise((r) => setTimeout(() => r(), 1))
            );

            GateKeeperHit(() => done());
            GateKeeperMiss(() => {});

            get(1)
                .then(() => {})
                .catch(done);
            get(1)
                .then(() => {})
                .catch(done);
        });

        it("should call the miss callback once", (done) => {
            const get = GateKeeper(
                () => new Promise((r) => setTimeout(() => r(), 1))
            );

            GateKeeperHit(() => {});
            GateKeeperMiss(() => done());

            get(1)
                .then(() => {})
                .catch(done);
            get(1)
                .then(() => {})
                .catch(done);
        });

        it("should call the miss then the hit callback", (done) => {
            const get = GateKeeper(
                () => new Promise((r) => setTimeout(() => r(), 1))
            );

            let miss = false;
            GateKeeperHit(() => {
                if (miss) {
                    done();
                } else {
                    done(new Error("Miss callback didn't run yet."));
                }
            });
            GateKeeperMiss(() => (miss = true));

            get(1)
                .then(() => {})
                .catch(done);
            get(1)
                .then(() => {})
                .catch(done);
        });
    });
});

describe("Debounce", function () {
    it("should resolve once", function (done) {
        this.timeout(300);
        this.slow(260);
        const val = debounce((i) => done(assert.strictEqual(i, 49)));

        for (let i = 0; i < 50; i++) {
            val.callback(i);
        }
    });

    it("should resolve with first call", function (done) {
        this.timeout(300);
        this.slow(260);
        const val = debounce((i) => done(assert.strictEqual(i, 3)), {
            cancelOnTrigger: false,
        });

        (async () => {
            // call the callback several times but it should still resolve based on the first time
            for (let i = 0; i < 4; i++) {
                val.callback(i);
                await new Promise((r) => setTimeout(r, 50));
            }
        })();
    });

    it("should resolve immediately", function (done) {
        this.timeout(10);
        this.slow(8);
        const val = debounce((i) => done(assert.strictEqual(i, 49)));

        for (let i = 0; i < 50; i++) {
            val.callback(i);
        }
        val.immediate();
    });
});
