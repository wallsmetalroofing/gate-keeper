## Gate-Keeper
`npm i @walls/gate-keeper`

Gate-Keeper will prevent duplicate calls with the same parameters. Instead it will wait for the first call to resolve and then resolve any later call with the identical value.

Add the module to file with this require statement.

    const {GateKeeper} = require("@walls/gate-keeper");

Setup the method to get async results.

    const get = GateKeeper( async (id) => {
        return await getFromServer(id);
    });

Call to get a result

    const file = await get(12);

> Written with [StackEdit](https://stackedit.io/).