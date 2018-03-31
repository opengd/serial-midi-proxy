/*!
 * serial-midi-proxy
 * A serial midi to serial proxy
 * MIT Licensed
 */

var SerialPort = require('serialport');

var portIN = new SerialPort('COM4', {
  baudRate: 9600,
  parser: SerialPort.parsers.raw
});


var portOUT = new SerialPort('COM7', {
    baudRate: 9600,
    parser: SerialPort.parsers.raw
  });


portIN.open(function (err) {
});

portOUT.open(function (err) {
    setInterval(intervalFunc,500);
});

portIN.on('error', function(err) {
    console.log('Error: ', err.message);
});

portOUT.on('error', function(err) {
    console.log('Error: ', err.message);
});

function intervalFunc() {
    if(newMidata) {
        //console.log(newMidata);
        portOUT.write(newMidata);
        newMidata = undefined;
    }
}

var rawInCom = "";
var newMidata = undefined;
var lastnewMidata = undefined;

portIN.on('data', function (data) {
    
    data.toString('ascii').split('').forEach(element => {
        if(element == "<" && rawInCom == "") {
            rawInCom = rawInCom + element;
        } else if(element == ">" && rawInCom != "") {
            rawInCom = rawInCom + element;
            rawInCom = rawInCom.slice(1, -1);
            rawArr = rawInCom.split('!');
            var conValueArr = [];
            rawArr.forEach(s => {
                var i = parseInt("0x" + s, 16);
                conValueArr.push(i);
            });
            
            var newbuff = Buffer.from(conValueArr);

            if(!newMidata && (!lastnewMidata || lastnewMidata[2] != conValueArr[2]))
            {
                lastnewMidata = conValueArr;
                newMidata = newbuff;
            }

            rawInCom = ""; 
        } else if (rawInCom != "") {
            rawInCom = rawInCom + element;
        }
    });
});