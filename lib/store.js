const fs = require('node:fs').promises
const pathModule = require('node:path');

const FILE_NAME = 'series.config'

function parseConfigFileName(name){
    const index = name.indexOf(FILE_NAME);
    const length = name.length;
    if( index === (length - FILE_NAME.length) )
        return name;
    if(name[length-1] != pathModule.sep)
        name += pathModule.sep;
    name += FILE_NAME;
    return name;
}

function Store(){
    this.config = {}
    this.loadConfigs();
}

Store.prototype.loadConfigs = async function(){
    const mainConfig = JSON.parse( await fs.readFile(__dirname+FILE_NAME, 'utf-8'));
    // check fore inclodes
    for( let i of mainConfig?.include){
        const config = JSON.parse( await fs.readFile(parseConfigFileName(i), 'utf-8'));
        this.config[i] = config;
        delete i;
    }
    this.config['main'] = mainConfig
}



module.exports = Store;