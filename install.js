if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
	redirectToStudy();
} else {
	showInstallPromotion();
}	

function showInstallPromotion() {
	dom_helper.hide("loading");
	dom_helper.show("installInstructions");
}

function redirectToStudy() {
	const urlParams = new URLSearchParams(window.location.search);
	const userId = urlParams.get('userId');
	const studyId= 9;
	const batchId = urlParams.get('batchId');
	window.location = "/experiments/publix/" + studyId + "/start?" +
						"batchId=" + batchId + 
						"&personalMultipleWorkerId=" + userId;
}