const fs = require('fs');
const Store =  require('./lib/store');

const store = new Store()



switch (process.argv[2]) { //switch Command
    case 'include':
        store.include (process.argv[3]);
        break;

    default:
        break;
}

