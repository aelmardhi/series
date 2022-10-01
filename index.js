const fs = require('fs');
const Store =  require('./lib/store');

(async function main(){
    const store =   new Store()
    await store.loadConfigs();


    switch (process.argv[2]) { //switch Command
        case 'include':
        case 'i':
            store.include (process.argv[3]);
            break;
        case 'set':
        case 's':
            store.set(process.argv[3], process.argv[4]);
            break;
        case 'current':
        case 'c':
            store.current(process.argv[3]);
            break;
        case 'next':
        case 'n':
            store.next(process.argv[3]);
            break;

        default:
            break;
    }
})()
