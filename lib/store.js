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

async function Store(){
    this.config = {}
    await this.loadConfigs();
}

Store.prototype.loadConfigs = async function(){
    const mainConfig = JSON.parse( await fs.readFile(__dirname+FILE_NAME, 'utf-8'));
    // check fore inclodes
    let includes = await Promise.all(mainConfig?.include.map(i=>{
        return fs.readFile(parseConfigFileName(i), 'utf-8')
    }))
    for( let i = 0; i< includes.length ; i++){
        this.config[config.include[i]] = includes[i];
    }
    this.config['main'] = mainConfig
}



module.exports = Store;