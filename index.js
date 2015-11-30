#! /usr/bin/env node

var http = require("http")
var fs = require("fs")
var path = require("path")
var Xray = require('x-ray')
var xray = Xray()
var Stream = require("json2csv-stream")

var argv = require("yargs") 
.usage("Usage:")
.command("scan", "Scrape vdc-sy.info website")
.command("tocsv", "Convert your json to csv")
.argv

if (argv._[0] === "scan") {
  scanVdc()
} else if (argv._[0] === "tocsv") {
  convertToCSV()
} else { 
  require("yargs").showHelp()
}


function scanVdc() {
  xray('http://www.vdc-sy.info/index.php/en/martyrs/1/c29ydGJ5PWEua2lsbGVkX2RhdGV8c29ydGRpcj1ERVNDfGFwcHJvdmVkPXZpc2libGV8ZXh0cmFkaXNwbGF5PTB8', '.peopleListing tr:nth-child(3), tr:nth-child(3) ~ tr',
    [{
      name: "td:nth-child(1)",
      status: "td:nth-child(2)",
      sex: "td:nth-child(3)",
      province: "td:nth-child(4)",
      area: "td:nth-child(5)",
      dateOfDeath: "td:nth-child(6)",
      causeOfDeath: "td:nth-child(7)",
      //result: xray(["tr:nth-child(2), tr:nth-child(2) ~ tr a@href"], [{
      //  person: ".peopleListing tr"
      //}])
    }])
    .paginate(".tablePgaination a:nth-child(1)@href")
    (function(err, obj) {
      if (err) console.log(err)
      obj.forEach(function(person) {
        return Object.keys(person).forEach(function(key) {
          person[key] = person[key].replace(/\t/g, "").replace(/\n/g, "")
        })
      })
      var writeableObj = JSON.stringify(obj, null, 2)
      fs.writeFile('vdcCasualties.json', writeableObj, function(err, res) {
        if (err) {
         console.log(err)
        } else {
         console.log("Successfully written file")
        }
      })
    })

}


function convertToCSV() {
  var parser = new Stream()

  var reader = fs.createReadStream("vdcCasualties.json")
  var writer = fs.createWriteStream("vdcCasualties.csv")
  
  reader
    .pipe(parser)
    .pipe(writer)
    .on("error", function(err) {
      process.stdout.write("There is an error reading the csv file")
   })
}
