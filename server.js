var mqtt=require('mqtt')
var fs = require('fs')
var fetch=require('node-fetch')

const token = fs.readFileSync('/opt/gtok','utf-8').trim();

async function init() {
    var lang = await (await fetch('https://run.glot.io/languages')).text()
    console.log(lang)
    await runcode()
}

async function runcode(){
    var opt= {
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            'Authorization': 'Token '+token
        },
        body:'{"files": [{"name": "main.py", "content": "print(42)"}]}'
    }

    console.log(opt)
    var url='https://run.glot.io/languages/python/latest'
    var r = await (await fetch(url,opt)).text()
    console.log(r)
}

init()