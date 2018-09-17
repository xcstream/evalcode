var mqtt=require('mqtt')
var fs = require('fs')
var fetch=require('node-fetch')

const token = fs.readFileSync('/opt/gtok','utf-8').trim();

var client  = mqtt.connect('mqtt://am.appxc.com')
var default_topic = 'xcstream.github.io/evalcode'

client.on('connect', function () {
    client.subscribe(default_topic)
})
client.on('message',async function (topic, message) {
    var mstr =message.toString()
    console.log( chalk.yellow  ('[new message] ')   +chalk.blue( 'topic:'),
    topic.toString(),chalk.blue( 'payload:') ,mstr)
    var payload = JSON.parse(mstr)
    if(payload.clientid){
        var r = await runcode(payload.url,payload.content)
        var reply = {
            content:payload.content,
            result:r,
        }
        client.publish(payload.clientid, JSON.stringify(reply))
    }
}
var langmap={}
async function init() {
    var lang = await (await fetch('https://run.glot.io/languages')).text()
    console.log(lang)

    for(var o of lang){
        const {name,url} = o
        langmap[name]=url
    }
    await runcode('https://run.glot.io/languages/python/latest', `print(42+232)` )
}

async function runcode(url,content){
    var body = {
        files:[
            {name:'main',content:content}
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