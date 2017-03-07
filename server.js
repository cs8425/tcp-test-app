'use strict';

const net = require('net')

var rx = 0
var tx = 0

var t = null;
var print = function(){
	console.log('r,t', rx, tx);
	t = setTimeout(print, 500)
}

var send = function(socket){
	if(t == null) return
	var data = Buffer.from(Date.now() + ',')
	socket.write(data)
	tx += data.length
	setTimeout(send, Math.random()*500 + 50, socket)
}


var server = net.createServer(function(socket){
	console.log((new Date()).getTime(),'client connected')

	rx = 0
	tx = 0

	socket.on('error', function(err){
		console.log((new Date()).getTime(), 'socket err', err)
	})

	socket.on('data', function(data){
		rx += data.length
		//console.log((new Date()).getTime(), data)
	})

	socket.on('end', function(){
		console.log((new Date()).getTime(),'client disconnected')
		clearTimeout(t)
		t = null
	})

	print()

	send(socket)
})
server.on('error', function(err){
	console.log((new Date()).getTime(),'client err', err)
});
server.listen(2323)

