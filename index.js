'use strict';

var connected = false
var connecting = false

var connectionId = -1
var rx = 0
var tx = 0

document.addEventListener('deviceready', function(e){
	console.log('onDeviceready', e)

	$(document).ready(function() {
		console.log('onDocumentReady')
		$('#connectBtn').on('click', function(e){
			if(!connected){
				$('#connectBtn').text('Disonnect')
				if(!connecting){
					var ip = $('#ip').val() || '192.168.1.145'
					var port = parseInt($('#port').val()) || 2323
					console.log('connectBtn', ip, port)
					connecting = true
					connected = false
					rx = 0
					tx = 0
					connect(ip, port, onOpen)
					return
				}
			}
			disconnect()
		})

		chrome.sockets.tcp.onReceive.addListener(function log_bytesReceived(info) {
			if (info.socketId != connectionId) return;
			rx += info.data.byteLength;
		});
		chrome.sockets.tcp.onReceiveError.addListener(function watch_for_on_receive_errors(info) {
			console.error(info);
			if (info.socketId != connectionId) return;

			// TODO: better error handle
			// error code: https://cs.chromium.org/chromium/src/net/base/net_error_list.h?sq=package:chromium&l=124
			switch (info.resultCode) {
				case -100: // CONNECTION_CLOSED
				case -102: // CONNECTION_REFUSED
				disconnect();
				break;
			}
		});
	})
}, false)

function connect(ip, port, callback) {
	console.log('connect to raw tcp:', ip + ':' + port)
	chrome.sockets.tcp.create({}, function(createInfo) {
		console.log('chrome.sockets.tcp.create', createInfo)
		if (createInfo) {
			connectionId = createInfo.socketId;
		}

		chrome.sockets.tcp.connect(createInfo.socketId, ip, port, function (result){
			/*if (chrome.runtime.lastError) {
				console.error('onConnectedCallback', chrome.runtime.lastError.message);
			}*/

			console.log('onConnectedCallback', result)
			if(result == 0) {
				chrome.sockets.tcp.setNoDelay(createInfo.socketId, true, function (noDelayResult){
					/*if (chrome.runtime.lastError) {
					console.error('setNoDelay', chrome.runtime.lastError.message);
					}*/

					console.log('setNoDelay', noDelayResult)
					if(noDelayResult != 0) {
						console.log('Failed to setNoDelay');
					}
					console.log('Connection opened with ID: ' + createInfo.socketId + ', url: ' + ip + ':' + port);

					if (callback) callback(createInfo);
				});
			} else {
				console.log('Failed to connect');
				if (callback) callback(false);
			}

		});
	});
}

function disconnect() {
	connected = false
	chrome.sockets.tcp.close(connectionId, function (result) {
		/*if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError.message);
		}*/
		console.log('Connection with ID: ' + connectionId + ' closed, Sent: ' + tx + ' bytes, Received: ' + rx + ' bytes');
		connectionId = -1;
	});
	$('#connectBtn').text('Connect')
}

var rxUI = $('#RX')
var txUI = $('#TX')
function updateUI() {
	var active = ((Date.now() - last_received_timestamp) < 500);
	if(active){
		
	}else{
		
	}

	$('#RX').text('RX: ' + rx)
	$('#TX').text('TX: ' + tx)

	window.requestAnimationFrame(updateUI)
}
updateUI()

function onOpen(openInfo) {
	connecting = false

	if(openInfo){
		connected = true
		$('#connectErr').hide()

		updateLiveStats()
	}else{
		$('#connectErr').show()
		disconnect()
	}
}

var last_received_timestamp = 0
function updateLiveStats() {
	last_received_timestamp = Date.now()

	var data = str2ab(last_received_timestamp + ',');
	chrome.sockets.tcp.send(connectionId, data, function (sendInfo) {
		// tcp send error
		if (sendInfo.resultCode < 0) {
			// TODO: better error handle
			// error code: https://cs.chromium.org/chromium/src/net/base/net_error_list.h?sq=package:chromium&l=124
			switch (sendInfo.resultCode) {
				case -100: // CONNECTION_CLOSED
				case -102: // CONNECTION_REFUSED
				break;
			}
			return;
		}

		// track sent bytes for statistics
		tx += sendInfo.bytesSent;

		setTimeout(function(){
			if(!connected) return
			updateLiveStats()
		}, Math.random()*500 + 50)
	});
}

function str2ab(str) {
	var buf = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=str.length; i<strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

