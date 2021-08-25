var fs = require('fs');
var util = require('util');
var xml_parser = require('fast-xml-parser');
var he = require('he')
var option = {
    attributeNamePrefix: "",
    attrNodeName: "", //default is false
    textNodeName: "#text",
    ignoreAttributes: false,

    format: true,
    indentBy: "  ",
    supressEmptyNode: true,
};
var timeZoneOffset = -120; // Eastern Standard Time UTC+2
var sameDate = (new Date(((new Date()) - (timeZoneOffset * 60 * 1000)))).toISOString()
console.log("Hello, World!");
console.log(sameDate);
var dateWithoutZ = sameDate.slice(0, -1);
var r = dateWithoutZ.replace(/[:.-]/g, '');
console.log(r);

var ParserJS = xml_parser.j2xParser;
var obj_parser = new ParserJS(option);

//parsing xml and converting it in Object
var xmlData = '';
function readXML() {
    return new Promise((resolve, reject) => {
        var readXML = fs.createReadStream('data.xml', 'utf-8');
        readXML.on('data', (chunk) => {
            xmlData += chunk;
        }).on('end', () => {
            //console.log(xmlData);
            resolve();
        }).on('error', () => {
            reject();
        })
    })
}

function writeXML(data, check) {
    return new Promise((resolve, reject) => {
        var filename = check == "partpriceupdate" ? 'data4.xml' : 'data3.xml';
        var writeXML = fs.createWriteStream(filename);
        writeXML.write(data);
        writeXML.on("finish", () => {
            console.log("Successfully written");
        })
        writeXML.end(() => console.log("Done"));
    })
}

readXML().then(() => {
    console.log("Success")
    var jsonObj = xml_parser.parse(xmlData, { ignoreAttributes: false, attributeNamePrefix: "", });  //converting xml to obj
    // console.log(jsonObj);
    var jsonObj2 = jsonObj;
    console.log("---------------------------------------sssssss")
    //console.log(jsonObj2);
    //only PartPriceUpdate

    let newTransaction = [];
    let newTransaction2 = [];
    newTransaction = jsonObj.Message.Transaction.filter(val => {
        return val.Part !== undefined
    })

    newTransaction2 = jsonObj.Message.Transaction.filter(val => {
        return val.Part == undefined
    })
    console.log("---------------------------------------eeeeeee")
    //console.log(newTransaction)
    jsonObj.Message.Transaction = newTransaction;

    var xml_with_partpriceupdate = obj_parser.parse(jsonObj);
    writeXML(xml_with_partpriceupdate, "partpriceupdate").then(() => {
        console.log("Success written")
    }).catch(() => {
        console.log("Error in writing files")
    })



    //exclude PartPriceUpdate

    console.log(jsonObj.Message.Transaction.length)

    jsonObj.Message.Transaction = newTransaction2;
    console.log(jsonObj.Message.Transaction.length)
    var xml_without_partpriceupdate = obj_parser.parse(jsonObj);

    writeXML(xml_without_partpriceupdate, "no").then(() => {
        console.log("Success written")
    }).catch(() => {
        console.log("Error in writing files")
    })

}).catch(err => {
    console.log("error in parsing xml file");
})






