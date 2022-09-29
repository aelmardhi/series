const fs = require('node:fs').promises
const pathModule = require('node:path');
const { spawn } = require('node:child_process');

const FILE_NAME = '.series.config';
const MAIN = 'main';
const MAIN_CONFIG_PATH = pathModule.join(__dirname,'..',FILE_NAME);
const numRegExp = /\d+/g;
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
        this.config[mainConfig.include[i]] = JSON.parse(includes[i]);
    }
    this.config[MAIN] = mainConfig
}

Store.prototype.include = function(p){
    p = pathModule.resolve(p);
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

Store.prototype.set = function(name, path){
    path = pathModule.resolve(path);
    const shortest = this.getClosestConfig(path);
    this.config[shortest][name] =  {
        path: pathModule.join( pathModule.relative(shortest, path)),
    }
    this.saveConfig(shortest)
}

Store.prototype.getClosestConfig = function(path){
    let shortest = MAIN_CONFIG_PATH
    let length = pathModule.relative(shortest, path).length
    const configKeys = Object.keys( this.config)
    for (let k of configKeys ){
        if(k === MAIN)
            k = MAIN_CONFIG_PATH;
        const p = pathModule.relative(k, path).slice(pathModule.sep);
        if(p.length < length){
            shortest = k;
            length = p.length;
        }
    }
    if(shortest === MAIN_CONFIG_PATH)
        shortest = MAIN
    console.log(shortest);
    return shortest;
}

Store.prototype.findKey = function(name){
    let key;
    const configKeys = Object.keys( this.config);
    for(k of configKeys){
        if( this.config[k][name]){
            key = k; 
            break;
        }
    }
    if(!key)
        throw Error('can not find '+ name )
    return key;
}

Store.prototype.current = async function (name){
    const key = this.findKey(name);
        
    if(!this.config[key][name].current){
        const configPath = key === MAIN? MAIN_CONFIG_PATH : key;
        let path = pathModule.join(pathModule.resolve(configPath), this.config[key][name].path);
        while(true){
            let list;
            try{
                list = await fs.opendir(path);
            }catch{
                break;
            }
            let num,first;
            for await( let d of list){
                if(!first){
                    num = Number.parseInt(numRegExp.exec(d.name)[0]);
                    first = d;
                    continue;
                }
                while(((i = numRegExp.exec(d.name))&&(numRegExp.lastIndex = i.index) && (i=i[0])) && ((j=numRegExp.exec(first.name)) && (j=j[0]) )&& i===j);
                i = Number.parseInt(i);
                if(!num || i< num){
                    num = i;
                    first = d;
                }
            }
            path = pathModule.join(path,first.name);
        }
        path = pathModule.relative( pathModule.join(key, this.config[key][name].path), path);
        this.config[key][name].current =  path
        this.saveConfig(key);
    }
    let path = pathModule.join(key, this.config[key][name].path, this.config[key][name].current );
    spawn('open',[path]);
}

Store.prototype.next = async function (name){
    const key = this.findKey(name);
    if(!this.config[key][name].current)
        return this.current(name);
    
    let currentPath = this.config[key][name].current;
    if(currentPath[0] === pathModule.sep)
        currentPath = pathModule.sep + currentPath;
    while(currentPath.length){
        currentPath = currentPath.substr(0,currentPath.lastIndexOf(pathModule.sep));
        const configPath = key === MAIN? MAIN_CONFIG_PATH : key;
        let path = pathModule.join(pathModule.resolve(configPath), this.config[key][name].path, currentPath);
        let list = await fs.opendir(path);
        let files = [];
        for await (let e of list)
            files.push(e.name)
        files.sort((a,b)=>{
            let i,j;
            numRegExp.lastIndex = 0;
            while(((i = numRegExp.exec(a))&&(numRegExp.lastIndex = i.index)) && ((j=numRegExp.exec(b))  )&& i[0]===j[0]);
            return Number.parseInt(i &&i[0]) - Number.parseInt(j &&j[0])
        });
        
    }
    // const configPath = key === MAIN? MAIN_CONFIG_PATH : key;
    // let path = pathModule.join(pathModule.resolve(configPath), this.config[key][name].path);
    // while(true){
    //     let list;
    //     try{
    //         list = await fs.opendir(path);
    //     }catch{
    //         break;
    //     }
    //     let num,first;
    //     for await( let d of list){
    //         if(!first){
    //             num = Number.parseInt(numRegExp.exec(d.name)[0]);
    //             first = d;
    //             continue;
    //         }
    //         while(((i = numRegExp.exec(d.name)) && (i=i[0])) && ((j=numRegExp.exec(first.name)) && (j=j[0]) )&& i===j);
    //         i = Number.parseInt(i);
    //         if(!num || i< num){
    //             num = i;
    //             first = d;
    //         }
    //     }
    //     path = pathModule.join(path,first.name);
    // }
    // path = pathModule.relative( pathModule.join(key, this.config[key][name].path), path);
    // this.config[key][name].current =  path
    // this.saveConfig(key);
}

module.exports = Store;