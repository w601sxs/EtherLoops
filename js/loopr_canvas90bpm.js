/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//document.onclick = function (e) {
//    draw_b();
//};

//(function draw_b() {
//  var a_canvas = document.getElementById("beat-bar");
//  //var b_canvas = document.getElementById("b");
//  var b_context = a_canvas.getContext("2d");
//  b_context.fillRect(0, 25, 0, 0);
//}());

//counter to track the duration of the beat
var beatTimer = 0;

var start = null;
var element = document.getElementById("beat-bar");
var canvasContext = element.getContext("2d");
//canvasContext.fillRect(0, 25, 100, 100);

var lastTimeStamp = new Date().getTime();

var downBeat = false;
var downCounts = [];
var playedOnce = false;

function step(timestamp) {
    if (!triggered && !playedOnce){window.requestAnimationFrame(step);return;}
    var maxBarNormal = element.width * (90 / 60);
    //console.log(element.width);
    //console.log(maxBarNormal);
    var now = new Date().getTime();
    var dt = now - lastTimeStamp;
    //console.log(dt);
    if (!start)
        start = timestamp;
    var progress = timestamp - start;

    canvasContext.clearRect(0, 0, element.width, element.height);

    //console.log(beatTimer);

    beatTimer += dt / 1000;

    var barWidth = maxBarNormal / 16 * beatTimer;

    if (barWidth >= element.width || !playedOnce)
    {
        barWidth = 0;
        beatTimer = 0;
        downBeat = true;
        downCounts = [];
        restartAllLoops();
        //triggered = false;
        playedOnce = true;
    } else {
        //downBeat = false;
    }

    canvasContext.fillStyle = "#FF0000";
    canvasContext.fillRect(0, 0, barWidth, 20)

    var pulseInterval = (maxBarNormal / 32) - 2.5;
    var downCount = Math.floor(barWidth  / pulseInterval);
    
    //console.log(downCount);
    if (downCount >= 0 && downCounts.indexOf(downCount) === -1)
    {
        downCounts.push(downCount);
        downBeat = true;
        console.log('true');
    }

    for (var i = 0; i < loops.length; i++)
    {
        if (!loops[i].playing) {
            loops[i].pulse(2);
        }
        if (downBeat)
        {
            loops[i].pulseOnce = true;
        }
        if (loops[i].playing && loops[i].pulseOnce)
        {
            //loops[i].pulse(10);
        }
        //console.log(i);
        //console.log(loops[i]);
        //loops[i].stop();
        //loops[i].play();
    }
    downBeat = false;

    //console.log(progress);
    //element.style.width = Math.min(progress/10, 1000) + "px";
    //if (progress < 2000) {
    lastTimeStamp = now;
    window.requestAnimationFrame(step);
    //}
}

window.requestAnimationFrame(step);
