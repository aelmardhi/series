const fs = require('node:fs').promises
const pathModule = require('node:path');

const FILE_NAME = '.series.config'
const MAIN = 'main'
const MAIN_CONFIG_PATH = FILE_NAME
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

async function loadOrCreateFile(p){
    try{
        return await fs.readFile(p,'utf-8');
    }catch(e){
        console.log('File: '+p+ ' does not exist trying to create');
        const content = JSON.stringify({});
        console.log(content);
        fs.writeFile(p,content,{encoding: 'utf-8'});
        return content;
    }
}



function Store(){
    this.config = {}
}

Store.prototype.loadConfigs = async function(){
    const mainConfig = JSON.parse( await loadOrCreateFile(MAIN_CONFIG_PATH));
    // check fore inclodes
    let includes = (mainConfig.include && await Promise.all(mainConfig?.include?.map(i=>{
        return loadOrCreateFile(parseConfigFileName(i))
    }))) || []
    for( let i = 0; i< includes.length ; i++){
        this.config[mainConfig.include[i]] = includes[i];
    }
    this.config[MAIN] = mainConfig
}

Store.prototype.include = function(p){
    if(! this.config[MAIN])
        throw Error('No Main file')
    const path = parseConfigFileName(p);
    if(!this.config[MAIN].include)
        this.config[MAIN].include = []
    this.config[MAIN].include.push(p);
    this.saveConfig(MAIN);
}

Store.prototype.saveConfig = function (p){
    const config = JSON.stringify( this.config[p]);
    if(p === MAIN){
        p = MAIN_CONFIG_PATH
    }
    const path = parseConfigFileName(p);
    fs.writeFile(path, config, {encoding: 'utf-8'});
}



module.exports = Store;