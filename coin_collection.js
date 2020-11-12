let img;
let stimH = 50;
let stimW = 50;
let nStim = 10;
let remaining = nStim;
let coins = [];

function setup() {
	createCanvas(windowWidth, windowHeight);

	stimW = width / 5;
	stimH = stimW;

	Coin.prototype.setImage('images/outcome_win.png', stimH, stimW)

	// limit nStim to half the theoretical max amount
	nStim = min(nStim, 0.5 * floor((height*width)/(stimH* stimW)));

	for (var i = 0; i < nStim; i++) {
		var x = random(0, width - stimW);
		var y = random(0, height - stimH);		

		if (coins.some(c => dist(x,y,c.x,c.y) < max(stimW, stimW))) {
			i -=1
		} else {			
			coins.push(new Coin(x, y));
		}
	}
}

async function draw () {
	background(200);

	for (var i = 0; i < remaining; i++) {
		coins[i].draw();
	}
}

function mousePressed() {
	for (var i = 0; i < remaining; i++) {
		if (coins[i].isPressed()) {
			coins.splice(i, 1);
			remaining -= 1;
		}
	}
}

// Setup coin object
function Coin (x, y) {
	this.x = x;
	this.y = y;

	this.draw = function () {
		image(Coin.prototype.img, this.x, this.y);
	}

	this.isPressed = function () {
		return mouseX > this.x && mouseX < (this.x + Coin.prototype.w) &&
				mouseY > this.y && mouseY < (this.y + Coin.prototype.h);
	}
}

Coin.prototype.setImage = function (imgUrl, height, width) {
	Coin.prototype.img = loadImage(imgUrl, img => {
		img.resize(width, height);
	});	

	Coin.prototype.h = height;
	Coin.prototype.w = width;
}