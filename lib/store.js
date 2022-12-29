const fs = require('node:fs').promises
const pathModule = require('node:path');
const posixPathModule = require('node:path/posix');
const { spawn } = require('node:child_process');

const FILE_NAME = '.series.config';
const MAIN = 'main';
const HOME_DIR = (process.platform === 'win32' || process.platform === 'win64')? process.env.APPDATA.replaceAll('\\','/'): process.env.HOME;
const CONFIG_FOLDER = posixPathModule.join(HOME_DIR, '.aelmardhi');
const CONFIG_SUBFOLDER = posixPathModule.join(CONFIG_FOLDER,'series');
const MAIN_CONFIG_PATH = posixPathModule.join(CONFIG_SUBFOLDER,FILE_NAME);

const numRegExp = /\d+/g;
function parseConfigFileName(name){
    const index = name.indexOf(FILE_NAME);
    const length = name.length;
    if( index === (length - FILE_NAME.length) )
        return name;
    if(name[length-1] != posixPathModule.sep)
        name += posixPathModule.sep;
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

function open(path){
    switch (process.platform) { 
        case 'darwin' : spawn('open', [path]); break;
        case 'win32' :
        case 'win64' : spawn('start' ,['""', '"'+path+'"'],{shell:true}); break;
        default : spawn('xdg-open',[path]); break;
    }
}


function Store(){
    this.config = {}
}

Store.prototype.loadConfigs = async function(){
    try{
        await fs.mkdir(CONFIG_FOLDER);
    }catch{}
    try{
        await fs.mkdir(CONFIG_SUBFOLDER);
    }catch{}
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
    shortestPath = shortest === MAIN ? CONFIG_SUBFOLDER : shortest;
    this.config[shortest][name] =  {
        path: posixPathModule.format(pathModule.parse( pathModule.relative(shortestPath, path))),
    }
    this.saveConfig(shortest)
}

Store.prototype.getClosestConfig = function(path){
    let shortest = MAIN_CONFIG_PATH
    let length = posixPathModule.relative(shortest, path).length
    const configKeys = Object.keys( this.config)
    for (let k of configKeys ){
        if(k === MAIN)
            k = MAIN_CONFIG_PATH;
        const p = posixPathModule.relative(path, k).split(posixPathModule.sep);
        if(p && p.at(-1) === '..' && p.length < length){
            shortest = k;
            length = p.length;
        }
    }
    if(shortest === MAIN_CONFIG_PATH)
        shortest = MAIN
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
        const configPath = key === MAIN? CONFIG_SUBFOLDER : key;
        let path = posixPathModule.join(configPath, this.config[key][name].path);
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
            path = posixPathModule.join(path,first.name);
        }
        path = posixPathModule.relative( posixPathModule.join(configPath, this.config[key][name].path), path);
        this.config[key][name].current =  path
        this.saveConfig(key);
    }
    let path = posixPathModule.join(key, (this.config[key][name].path), this.config[key][name].current );
    open(path);
}

Store.prototype.next = async function (name){
    const key = this.findKey(name);
    if(!this.config[key][name].current)
        return this.current(name);
    const configPath = key === MAIN? CONFIG_SUBFOLDER : key;
    let folder = false;
    let currentFile ;
    let currentPath = posixPathModule.normalize(this.config[key][name].current);
    if(currentPath[0] !== posixPathModule.sep)
        currentPath = posixPathModule.sep + currentPath;
    while(currentPath.length){
        if(!folder){
            currentFile = currentPath.substr(currentPath.lastIndexOf(posixPathModule.sep)+1);
            currentPath = currentPath.substr(0,currentPath.lastIndexOf(posixPathModule.sep));
        }
        let path = posixPathModule.join(configPath, this.config[key][name].path, currentPath);
        let list = await fs.opendir(path);
        let files = [];
        for await (let e of list)
            files.push(e.name);
        files.sort((a,b)=>{
            let i,j;
            numRegExp.lastIndex = 0;
            while(((i = numRegExp.exec(a))&&(numRegExp.lastIndex = i.index)) && ((j=numRegExp.exec(b))  )&& i[0]===j[0]);
            return Number.parseInt(i &&i[0]) - Number.parseInt(j &&j[0])
        });
        let currentIndex = -1;
        if(!folder)
            currentIndex = files.findIndex((value)=>currentFile === value)
        if(currentIndex < files.length -1){
            const p = posixPathModule.join(currentPath.substr(1) ,files[currentIndex+1]);
            if((await fs.stat(posixPathModule.join(configPath, this.config[key][name].path,p))).isDirectory()){
                folder = true;
                currentPath = posixPathModule.sep + p;
                continue;
            }
            this.config[key][name].current = p;
            this.saveConfig(key);
            break;
        }   
    }
    let path = posixPathModule.join( configPath, this.config[key][name].path, this.config[key][name].current );
    open(path);
}

module.exports = Store;