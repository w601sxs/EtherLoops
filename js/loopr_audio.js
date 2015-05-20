/* JS functions to control HTML5 web audio
 */

var context = new AudioContext();

//array to monitor which loops are currently playing
var loops = [];

var triggered = false;

function loadPadAudio(object,url)
{
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
 
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            object.buffer = buffer;
        });
    };
    request.send();
}

function restartAllLoops() {
    //if (downBeat) {
        for (var i = 0; i < loops.length; i++)
        {
            //console.log(loops[i]);
            loops[i].stop();
            loops[i].play();
            loops[i].resetOpacity();
        }
    //}
    //beatTimer = 0;
}

function addAudioProperties(object) {
    object.name = object.id;
    object.source = $(object).data('sound');
    object.loop = true;
    object.fading = 'down';
    object.opacity = 1;
    object.pulseOnce = false;
    object.playing = false;
    loadPadAudio(object, object.source);
    object.resetOpacity = function () {
        this.fading = 'down';
        this.opacity = 1;
        $(object).css('opacity', 1);
    };
    object.pulse = function (speed) {
        //this.opacity = $(object).css('opacity');
        this.opacity -= this.fading === 'down' ? 0.01 * speed : 0;
        this.opacity += this.fading === 'up' ? 0.01 * speed : 0;
        if (this.opacity >= 1)
        {
            this.opacity = 1;
            this.fading = 'down';
            this.pulseOnce = false;
        }
        if (this.opacity <= 0)
        {
            this.opacity = 0;
            this.fading = 'up';
        }
        //console.log(opacity);
        $(object).css('opacity', this.opacity);
    };
    object.addToLoops = function () {
        loops.push(object);
        triggered = true;
        //$(object).attr('data-pulsing', true);
    };
    object.play = function () {
        //restartAllLoops();
        this.playing = true;
        var s = context.createBufferSource();
        s.buffer = object.buffer;
        s.connect(context.destination);
        //s.connect(object.volume);
        //object.volume.connect(context.destination);
        s.loop = object.loop;
        s.start(0);
        object.s = s;
    };
    object.stop = function () {
        this.playing = false;
        if(object.s) object.s.stop();
    };
    object.removeLoop = function () {
        for (var i =0;i<loops.length;i++)
        {
            if (loops[i] === object)
            {
                var temp = loops[loops.length-1];
                loops[loops.length-1] = loops[i];
                loops[i] = temp;
                // loops[i].stop();
                break;
            }
        }
        loops.pop();
    };
}

var musicBuffer = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function loadMusic(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      musicBuffer = buffer;
      //createNewContext();
      //playSound(musicBuffer);
    });
  }
  request.send();
}

function playSound(buffer) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}

function createNewContext()
{
// Create offline context
var offlineContext = new OfflineAudioContext(1, musicBuffer.length, musicBuffer.sampleRate);

// Create buffer source
var source = offlineContext.createBufferSource();
source.buffer = musicBuffer;

// Create filter
var filter = offlineContext.createBiquadFilter();
filter.type = "lowpass";

// Pipe the song into the filter, and the filter into the offline context
source.connect(filter);
filter.connect(offlineContext.destination);

// Schedule the song to start playing at time:0
source.start(0);

// Render the song
offlineContext.startRendering()

// Act on the result
offlineContext.oncomplete = function(e) {
  // Filtered buffer!
  var filteredBuffer = e.renderedBuffer;
  console.log(filteredBuffer);
  var peaksArray = getPeaksAtThreshold(filteredBuffer.getChannelData(0),.85);
  //console.log(peaksArray);
  var intervalArray = countIntervalsBetweenNearbyPeaks(peaksArray);
  //console.log(intervalArray);
  var tempo = groupNeighborsByTempo(intervalArray);
  console.log(tempo);
  tempo.forEach(function(temp,i)
  {
      
  });
  //intervalCounts.forEach(function(intervalCount, i) {
  //playSound(filteredBuffer);
};
}

// Function to identify peaks

function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 10000;
    }
    i++;
  }
  return peaksArray;
}

// Function used to return a histogram of peak intervals

function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

// Function used to return a histogram of tempo candidates.

function groupNeighborsByTempo(intervalCounts) {
  var tempoCounts = [];
  intervalCounts.forEach(function(intervalCount, i) {
    // Convert an interval to tempo
    if (intervalCount.interval === 0 || isNaN(intervalCount.interval))
    {
        return;
    }
    var theoreticalTempo = 60 / (intervalCount.interval / 48000 );
    

    // Adjust the tempo to fit within the 90-180 BPM range
    while (theoreticalTempo < 90) theoreticalTempo *= 2;
    while (theoreticalTempo > 180) theoreticalTempo /= 2;
    
    console.log(theoreticalTempo, Math.floor(theoreticalTempo));

    var foundTempo = tempoCounts.some(function(tempoCount) {
      if (Math.abs(tempoCount.tempo - theoreticalTempo) < 1)
        return tempoCount.count += intervalCount.count;
    });
    if (!foundTempo) {
      tempoCounts.push({
        tempo: theoreticalTempo,
        count: intervalCount.count
      });
    }
  });
  return tempoCounts;
}