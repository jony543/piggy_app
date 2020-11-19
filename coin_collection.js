async function run_coin_collection(settings) {

	//parent.dom_helper.add_css_class('coinTask', 'openning') //** 
	// initialize parameters:
	// ------------------------------
	let coins = [];
	let rocks = [];
	let misses = [];
	let countDownDate = null;
	let counterXposition = null;
	let counterYposition = null;
	let text_size = null;

	// remove outcome related stuff from the screen:
	// ------------------------------

	dom_helper.hide('outcome_win')
	dom_helper.hide('outcome_no_win')
	dom_helper.hide('superimposed_outcome_sum')
	dom_helper.hide('outcome_text_1_')


	//subject_data_worker.done = function (x) { //** 
	// when all messages are processed save the information as a JATOS result
	//if (terminate_subject_data_worker) {
	//	var subData = data_helper.get_subject_data(false);
	//	var currentRunData = subData[jatos.studyResultId];

	// jatos.appendResultData(currentRunData).then(function () {
	// 	console.log('finished');
	// 	if (!!document.referrer) { // this may needed to be adapted on the server
	// 		setTimeout(() => parent.dom_helper.add_css_class('coinTask', 'closing'), 1000) //** 
	// 		setTimeout(() => parent.dom_helper.hide('coinTask'), 2500)
	// 	}
	// });
	//}
	//};

	//dom_helper.remove_css_class('background', 'bgApp')
	//dom_helper.add_css_class('background', 'bgCoinTask')
	//dom_helper.add_css_class('pseudoBackground', 'openning')

	window.setup = function () {
		createCanvas(windowWidth, windowHeight); // The canvas does not start from the real x=0 and y=0 and this is why I do this. * to see the offsets of the body do document.body.getBoundingClientRect() in the console.
		dom_helper.add_css_class('defaultCanvas0', 'openning')
		// setting some important sizes:
		counterXposition = windowWidth * settings.ProportionOfScreenWidthToPlaceCounter;
		counterYposition = windowHeight * settings.ProportionOfScreenHeightToPlaceCounter;
		text_size = windowWidth * settings.textSizeProportionOfScreenWidth;

		document.body.style.backgroundColor = "black"; // set the background color (around and behind the background image)
		bg_img = loadImage(settings.bg_img_path);

		stimW = width * settings.stimSizeProportionOfScreen;
		stimH = stimW * settings.outcomeImageHeightWidthRatio;

		CollectableObj.prototype.setImage("coin", settings.outcome_win_image_path, stimH, stimW);
		if (settings.includeRocks) {
			CollectableObj.prototype.setImage("rock", settings.outcome_no_win_image_path, stimH, stimW);
		}

		// limit nStim to half the theoretical max amount
		nStim = min(settings.nStim, 0.5 * floor((height * width) / (stimH * stimW)) - 1); // Rani: I added -1 to the theoretical max amount to cover for the lack of stimulus on the time counter.
		remaining = nStim;

		subject_data_worker.postMessage({
			coins_task_init_data: {
				windowWidth,
				windowHeight,
				nStim,
				stimW,
				stimH,
				start_time: new Date()
			}
		});

		const n_stimuli = settings.includeRocks ? 2 : 1;
		for (var i = 0; i < nStim; i++) {
			var x = random(0, width - stimW);
			var y = random(0, height - stimH);
			if (rocks.some(c => abs(x - c.x) <= stimW && abs(y - c.y) <= stimH) || // making sure they are not going over each other
				coins.some(c => abs(x - c.x) <= stimW && abs(y - c.y) <= stimH) ||
				(x > (counterXposition - stimW - 0.75 * text_size) && y < (counterYposition + 0.75 * text_size))) { //makeing sure they does not cover the remaining time counter.
				i -= 1
			} else {
				if (i % n_stimuli) {
					rocks.push(new CollectableObj("rock", x, y));
				} else {
					coins.push(new CollectableObj("coin", x, y));
				}
			}
		}

		textSize(text_size);
		textAlign(CENTER, CENTER);

		var dt = new Date();
		dt.setSeconds(dt.getSeconds() + settings.duration + settings.openningAnimTime);
		countDownDate = dt.getTime();
	}

	window.draw = function () {
		background(bg_img);

		var now = new Date();

		// calculate coundwon timer
		var distance = countDownDate - now.getTime();
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);

		if (!remaining || now.getTime() > countDownDate) {
			fill(...settings.counterTextColor);
			text(max(seconds + 1, 0), counterXposition, counterYposition); // seconds + relative x,y position of the counter

			noLoop();

			fill(...settings.finishMessageTextColor);
			text(settings.finishMessage, windowWidth / 2, windowHeight / 2); // position of the finish text

			subject_data_worker.postMessage({
				coin_task_finish_status: {
					remaining,
					finish_time: now
				}
			});

			// when the task is over:
			// ----------------------		

			setTimeout(() => {
				dom_helper.add_css_class('defaultCanvas0', 'closing')
			}, 1000)
			setTimeout(() => {
				dom_helper.hide('defaultCanvas0')
				finishTrial()
			}, 2500);

		} else if (countDownDate - now.getTime() <= settings.duration * 1000) {
			fill(...settings.counterTextColor);
			text(max(seconds + 1, 0), counterXposition, counterYposition); // seconds + relative x,y position of the counter

			coins.filter(c => !c.isCollected()).forEach(c => {
				c.draw(255);
			});
			rocks.filter(c => !c.isCollected()).forEach(c => {
				c.draw(255);
			});

			// a fading effect for what picked up
			coins.filter(c => !!c.isCollected()).forEach(c => {
				var timeFromClick = now.getTime() - c.clickTime
				if (timeFromClick <= (settings.element_disappearing_time * 1000)) {
					alphaVal = (1 - (timeFromClick / (settings.element_disappearing_time * 1000))) * 255 //allpha values shoud be 0 to 255.
					c.draw(alphaVal)
				}
			});

			rocks.filter(c => !!c.isCollected()).forEach(c => {
				var timeFromClick = now.getTime() - c.clickTime
				if (timeFromClick <= (settings.element_disappearing_time * 1000)) {
					alphaVal = (1 - (timeFromClick / (settings.element_disappearing_time * 1000))) * 255 //allpha values shoud be 0 to 255.
					c.draw(alphaVal)
				}
			});

		}
	}

	window.mouseClicked = function () {
		var hit = false;
		coins.filter(c => !c.isCollected()).forEach(c => {
			if (c.isPressed()) {
				remaining -= 1;
				hit = true;

				subject_data_worker.postMessage({
					coins_task_coin_state: coins.map(c => c.serialize())
				});
			}
		});

		rocks.filter(c => !c.isCollected()).forEach(c => {
			if (c.isPressed()) {
				remaining -= 1;
				hit = true;

				subject_data_worker.postMessage({
					coins_task_rock_state: rocks.map(c => c.serialize())
				});
			}
		});

		if (!hit) {
			misses.push({
				mouseX,
				mouseY,
				miss_time: new Date()
			});

			subject_data_worker.postMessage({
				coins_task_misses: misses
			});
		}
	}

	// Setup obejct that can be coin or rock or anything else user can collect
	function CollectableObj(t, x, y) {
		this.x = x;
		this.y = y;
		this.type = t;
		this.clickTime = null;

		this.isCollected = () => !!this.clickTime;

		this.draw = function (alpha_value) {
			tint(255, alpha_value)
			image(CollectableObj.prototype.types[t].img, this.x, this.y);
		}

		this.isPressed = function () {
			if (mouseX > this.x && mouseX < (this.x + CollectableObj.prototype.types[t].w) &&
				mouseY > this.y && mouseY < (this.y + CollectableObj.prototype.types[t].h)) {
				this.clickTime = new Date();
				return true;
			} else {
				return false;
			}
		}

		this.serialize = function () {
			return {
				type: this.type,
				x: this.x,
				y: this.y,
				clickTime: this.clickTime
			};
		}
	}

	CollectableObj.prototype.types = {};
	CollectableObj.prototype.setImage = function (type, imgUrl, height, width) {		
		CollectableObj.prototype.types.push[type] = {
				img: loadImage(imgUrl, img => {
						img.resize(width, height);
					});,
				h: height,
				w: width
		};	
	}

	var p5_script_element = document.createElement('script');
	p5_script_element.setAttribute('src', 'js/p5.min.js');
	document.head.appendChild(p5_script_element);

};
