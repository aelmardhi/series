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

        default:
            break;
    }
})()
