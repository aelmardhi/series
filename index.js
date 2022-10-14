const fs = require('fs');
const { argv } = require('process');
const Store =  require('./lib/store');


const HELP_MSG = `Usage: series <COMMAND> [ARGS]
opens files in series.
        
<COMMAND> could be:
    include, i      include or create config file.
                    Usage:  series include <PATH>
    set, s          set a new series.
                    Usage:  series set <NAME> <PATH>
    current, c      open the current file in the series.
                    Usage: series current <NAME>
    next, n         open the next file in the series.
                    Usage: series next <NAME>
    help, h         shows help. shows this.
                    Usage: series help`;

(async function main(){
    const store =   new Store()
    await store.loadConfigs();


    switch (process.argv[2]) { //switch Command
        case 'include':
        case 'i':
            if(instruction(['include', 'i'], ['<PATH>'], [process.argv[3]]))
                store.include (process.argv[3]);
            break;
        case 'set':
        case 's':
            if(instruction(['set', 's'], ['<NAME>','<PATH>'], [process.argv[3], process.argv[4]]))
                store.set(process.argv[3], process.argv[4]);
            break;
        case 'current':
        case 'c':
            if(instruction(['current', 'c'], ['<NAME>'], [process.argv[3]]))
                store.current(process.argv[3]);
            break;
        case 'next':
        case 'n':
            if(instruction(['next', 'n'], ['<NAME>'], [process.argv[3]]))
                store.next(process.argv[3]);
            break;
        case 'help':
        case 'h':
        default:
            console.log(HELP_MSG);
            break;
    }
})()


function instruction( commands, args, values){
    let count = 0;
    for( v of values){
        if(v)
            count++;
    }
    if(count >= values.length)
        return true;
    console.log('Missing arguments, the command should be in the form:');
    for(c of commands){
        let i = '   series '+c;
        for(let j=0; j< args.length;j++){
            i += ' '+ args[j];
        }
        console.log(i);
    }
    return false;
}