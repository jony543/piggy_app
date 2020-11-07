let img;
let stimH = 50;
let stimW = 50;
let nStim = 10;
let remaining = nStim;
let positions = [];

function preload() {
	img = loadImage('images/coin_gold.png');
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	stimW = width / 5;
	stimH = stimW;
	img.resize(stimH, stimW)

	// limit nStim to half the theoretical max amount
	nStim = min(nStim, 0.5 * floor((height*width)/(stimH* stimW)));
	
	for (var i = 0; i < nStim; i++) {
		var x = random(0, width - stimW);
		var y = random(0, height - stimH);

		if (positions.some(p => dist(x,y,p[0],p[1]) < min (stimH, stimW))) {
			i -=1
		} else {			
			positions.push([x,y]);
		}
	}
}

function draw () {
	background(200);

	for (var i = 0; i < remaining; i++) {
		image(img, positions[i][0], positions[i][1]);
	}
}

function mousePressed() {
	for (var i = 0; i < remaining; i++) {
		if (mouseX > positions[i][0] && mouseX < (positions[i][0] + stimW) &&
			mouseY > positions[i][1] && mouseY < (positions[i][1] + stimH)) {
			positions.splice(i, 1);
			remaining -= 1;
		}
	}
}