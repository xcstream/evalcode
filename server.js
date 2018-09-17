var mqtt=require('mqtt')
var fs = require('fs')
var fetch=require('node-fetch')
var chalk=require('chalk')
const token = fs.readFileSync('/opt/gtok','utf-8').trim();

var client  = mqtt.connect('mqtt://am.appxc.com')
var default_topic = 'xcstream.github.io/evalcode'
var langmap={}

client.on('connect', function () {
    client.subscribe(default_topic)
})
client.on('message',async function (topic, message) {
    var mstr =message.toString()
    console.log( chalk.yellow  ('[new message] ')   +chalk.blue( 'topic:'),
    topic.toString(),chalk.blue( 'payload:') ,mstr)
    var payload = JSON.parse(mstr)

    if(payload.lang){

        payload.url = langmap[payload.lang]
    }
    if(!payload.url){
        console.log(`url not found`)
        return
    }
    if(!payload.clientId){
        console.log(`clientId not found`)
        return
    }

    var filename
    if(payload.lang=='cpp') filename='main.cpp'
    if(payload.lang=='java') filename='Main.java'
    if(payload.lang=='csharp') filename='Main.cs'
    if(payload.lang=='python') filename='main.py'
    if(payload.lang=='c') filename='main.c'

    if(payload.clientId){
        var r = await runcode(payload.url+'/latest',payload.content,filename)
        var reply = {
            content:payload.content,
            result:r,
        }
        client.publish(payload.clientId, JSON.stringify(reply))
    }
})
async function init() {
    var lang = await (await fetch('https://run.glot.io/languages')).json()

    for(var o of lang){
        const {name,url} = o
        langmap[name]=url

    }

    console.log(langmap)
    // await runcode('https://run.glot.io/languages/python/latest', `print(42+232)` )
}

async function runcode(url,content,filename){

    var body = {
        files:[
            {name:filename,content:content}
        ]
    }
    var opt= {
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            'Authorization': 'Token '+token
        },
        body:JSON.stringify(body)
    }

    console.log(opt)
    // var url='https://run.glot.io/languages/python/latest'
    var r = await (await fetch(url,opt)).text()
    console.log(r)
    return r

}

init()