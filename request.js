const request = require('request-promise-native')
const decode = require('unescape')
const fs = require('fs')

const source = request('https://www.whenisthenextsteamsale.com')

const parse = function (html) {
    var myRe = /({&quot;Name)(.*)(&quot;})/g;

    var a = html.match(myRe)[0]
    var b = decode(a)
    console.log(b)

    return fs.writeFile("./data.json", b, function (err) {
        if (err) {
            console.log(err)
            return false
        }
        console.log("The file was saved!")
        return true
    })
}

const retry = function (err) {
    console.log(err)
    setTimeout(() => {
        console.log('retry start in 5 sec')
        source.then(parse).catch(retry)
    }, 5000)
}

retry('first try')