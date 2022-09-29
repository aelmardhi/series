const fs = require('fs');
const Store =  require('./lib/store');

(async function main(){
    const store =   new Store()
    await store.loadConfigs()
    console.log(store.config);


    switch (process.argv[2]) { //switch Command
        case 'include':
            store.include (process.argv[3]);
            break;
        case 'set':
            store.set(process.argv[3], process.argv[4]);
            break;

        default:
            break;
    }
})()
