const countEl = document.getElementById('count');
const co2 = document.getElementById('CO2');



updateVisitCount();

function updateVisitCount() {
	fetch('https://api.countapi.xyz/update/visits/counter/?amount=1')
	.then(res => res.json())
	.then(res => {
		countEl.innerHTML = res.value;
		var emission = res.value;
		co2.innerHTML = res.value + res.value*50;


document.getElementById("car").style.left = emission + "px";
	})
}
