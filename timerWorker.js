//original idea for workaround using webworker from here:
//https://stackoverflow.com/questions/5927284/how-can-i-make-setinterval-also-work-when-a-tab-is-inactive-in-chrome
self.addEventListener('message',function(e){
	var interval;
    switch (e.data.message) {
        case 'start':

            interval = setInterval(function(){
                self.postMessage('lubdub');
            }, e.data.data.timeSlice);

            break;
        case 'stop':
            clearInterval(interval);
            break;
    };
}, false);