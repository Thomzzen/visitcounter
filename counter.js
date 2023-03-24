const countEl = document.getElementById('count');
const co2 = document.getElementById('CO2');
var end = 41343;

updateVisitCount();

function updateVisitCount() {
	fetch('https://api.countapi.xyz/update/visits/counter/?amount=1')
	.then(res => res.json())
	.then(res => {
		countEl.innerHTML = res.value;
		var emission = res.value;
		var co2Emission = res.value + res.value*3;
		co2.innerHTML = co2Emission;
		var procent = co2Emission/end*100;

console.log(procent);
document.getElementById("car").style.left = procent + "%";
	})
}
