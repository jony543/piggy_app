var myDynamicManifest = {
	"name": "Space Gold",
	"short_name": "Space Gold",
	"display": "standalone",
	"orientation": "portrait",
	"background_color": "#666666ff",
	"theme_color": "#000000",
	"icons": [
		{
			"src": "android-icon-36x36.png",
			"sizes": "36x36",
			"type": "image\/png",
			"density": "0.75"
		},
		{
			"src": "android-icon-48x48.png",
			"sizes": "48x48",
			"type": "image\/png",
			"density": "1.0"
		},
		{
			"src": "android-icon-72x72.png",
			"sizes": "72x72",
			"type": "image\/png",
			"density": "1.5"
		},
		{
			"src": "android-icon-96x96.png",
			"sizes": "96x96",
			"type": "image\/png",
			"density": "2.0"
		},
		{
			"src": "android-icon-144x144.png",
			"sizes": "144x144",
			"type": "image\/png",
			"density": "3.0"
		},
		{
			"src": "android-icon-192x192.png",
			"sizes": "192x192",
			"type": "image\/png",
			"density": "4.0"
		},
		{
			"src": "android-icon-512x512.png",
			"sizes": "512x512",
			"type": "image\/png",
			"density": "1.0"
		}
	]
}
// Add the start url
myDynamicManifest["start_url"] = location.href;

// Add the correct path for the icons
const fullPath = location.href.substring(0,location.href.lastIndexOf("/")+1) + 'icons/'; 
myDynamicManifest.icons.forEach((x) => x.src = fullPath + x.src)

// Prepare and attach the manifest to the html
const stringManifest = JSON.stringify(myDynamicManifest);
const blob = new Blob([stringManifest], {type: 'application/json'});
const manifestURL = URL.createObjectURL(blob);
document.getElementById('manifest-placeholder').setAttribute('href', manifestURL);