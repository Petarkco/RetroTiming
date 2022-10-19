var debug = false;
// Classic for Manana, Classic-Bold for Manana in bold and F1Digital for Futura.
var font = "Classic";

const url =
	"http://localhost:10101/api/v2/live-timing/state/TrackStatus,ExtrapolatedClock,TimingData,DriverList";

async function getTimingData() {
	const response = await fetch(url, {
		mode: "cors",
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	});
	if (debug === true) {
		console.log("Grabbing Timing Data");
	}
	const timingData = await response.json();
	if (debug === true) {
		// console.log(timingData);
	}

	//Set font
	if (font === "Classic") {
		document.getElementById("main").style.fontFamily = "manana, sans-serif";
	}
	if (font === "Classic-Bold") {
		document.getElementById("main").style.fontFamily =
			"manana-bold, sans-serif";
	}
	if (font === "F1Digital") {
		document.getElementById("main").style.fontFamily =
			"futura-pt-condensed, sans-serif";
	}

	//Display 2 hour timer
	var sessionTimeRemaining = timingData.ExtrapolatedClock.Remaining;
	document.getElementById("race-time").innerText = sessionTimeRemaining;

	//Display SC/VSC and Red flags
	var trackStatus = timingData.TrackStatus.Message;
	if (trackStatus === "AllClear") {
		document.getElementById("foot-flag").innerText = "";
		document.getElementById("foot-flag").style.backgroundColor = "";
	}
	if (trackStatus === "Red") {
		document.getElementById("foot-flag").innerText = "";
		document.getElementById("foot-flag").style.backgroundColor = "#c80000";
		document.getElementById("foot-flag").style.animation =
			"blink normal 1.2s infinite ease-in-out";
	}
	if (trackStatus === "SCDeployed") {
		document.getElementById("foot-flag").innerText = "";
		document.getElementById("foot-flag").style.backgroundColor = "#f8ff2c";
		document.getElementById("foot-flag").style.animation =
			"blink normal 1.2s infinite ease-in-out";
	}
	if (trackStatus === "VSCDeployed") {
		document.getElementById("foot-flag").innerText = "";
		document.getElementById("foot-flag").style.backgroundColor = "#f8ff2c";
		document.getElementById("foot-flag").style.animation =
			"blink normal 1.2s infinite ease-in-out";
	}

	//Allows sector times to have 2 decimals without rounding down
	Number.prototype.toFixedNoRounding = function (n) {
		try {
			const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g");
			const a = this.toString().match(reg)[0];
			const dot = a.indexOf(".");
			if (dot === -1) {
				// integer, insert decimal dot and pad up zeros
				return a + "." + "0".repeat(n);
			}
			const b = n - (a.length - dot) + 1;
			return b > 0 ? a + "0".repeat(b) : a;
		} catch (err) {}
	};
	document.getElementById("position-Data").innerHTML = `<tr>
	<th id="pos-head"></th>
	<th id="carnum-head"></th>
	<th id="name-head"></th>
	<th id="gap-head">GAP</th>
	<th id="int-head">INT</th>
	<th id="lastlap-head"></th>
	<th id="status-head"></th>
	<th id="s1-head">00.0</th>
	<th id="s2-head">00.0</th>
	<th id="s3-head">00.0</th>
	<th id="pit-head"></th>
</tr>`;
	const liveTimingData = timingData.TimingData.Lines;
	for (let lines of Object.entries(liveTimingData).sort(
		(a, b) => parseInt(a[1].Position) - parseInt(b[1].Position)
	)) {
		let linesData = lines;
		for (var i = 1; i < linesData.length; i++) {
			let timingCarPos = linesData[i].Position;
			let timingCarNum = linesData[i].RacingNumber;
			let timingGap = linesData[i].GapToLeader;
			let timingInt = linesData[i].IntervalToPositionAhead.Value;
			let timingLastLap = linesData[i].LastLapTime.Value;
			let timingS1 = linesData[i].Sectors[0].Value;
			let timingS1_dec = parseFloat(timingS1).toFixedNoRounding(1);
			let timingS2 = linesData[i].Sectors[1].Value;
			let timingS2_dec = parseFloat(timingS2).toFixedNoRounding(1);
			let timingS3 = linesData[i].Sectors[2].Value;
			let timingS3_dec = parseFloat(timingS3).toFixedNoRounding(1);
			let timingPitCount = linesData[i].NumberOfPitStops;
			let is_driverSector1_fastest = linesData[i].Sectors[0].OverallFastest;
			let is_driverSector2_fastest = linesData[i].Sectors[1].OverallFastest;
			let is_driverSector3_fastest = linesData[i].Sectors[2].OverallFastest;
			let is_driverSector1_pb = linesData[i].Sectors[0].PersonalFastest;
			let is_driverSector2_pb = linesData[i].Sectors[1].PersonalFastest;
			let is_driverSector3_pb = linesData[i].Sectors[2].PersonalFastest;
			let is_fastestlap = linesData[i].LastLapTime.OverallFastest;
			let is_pb = linesData[i].LastLapTime.PersonalFastest;
			let timingStopped = linesData[i].Stopped;
			let timingInPits = linesData[i].InPit;
			let timingPitOut = linesData[i].PitOut;
			let carStatus = "";

			switch (timingCarNum) {
				case "1":
					var timingDriverName = "M. VERSTAPPEN";
					break;
				case "3":
					var timingDriverName = "D. RICCIARDO";
					break;
				case "4":
					var timingDriverName = "L. NORRIS";
					break;
				case "5":
					var timingDriverName = "S.VETTEL";
					break;
				case "6":
					var timingDriverName = "N. LATIFI";
					break;
				case "10":
					var timingDriverName = "P. GASLY";
					break;
				case "11":
					var timingDriverName = "S. PEREZ";
					break;
				case "14":
					var timingDriverName = "F. ALONSO";
					break;
				case "16":
					var timingDriverName = "C. LECLERC";
					break;
				case "18":
					var timingDriverName = "L. STROLL";
					break;
				case "20":
					var timingDriverName = "K. MAGNUSSEN";
					break;
				case "22":
					var timingDriverName = "Y. TSUNODA";
					break;
				case "23":
					var timingDriverName = "A. ALBON";
					break;
				case "24":
					var timingDriverName = "Z. GUANYU";
					break;
				case "31":
					var timingDriverName = "E. OCON";
					break;
				case "44":
					var timingDriverName = "L. HAMILTON";
					break;
				case "47":
					var timingDriverName = "M. SCHUMACHER";
					break;
				case "55":
					var timingDriverName = "C. SAINZ";
					break;
				case "63":
					var timingDriverName = "G. RUSSELL";
					break;
				case "77":
					var timingDriverName = "V. BOTTAS";
					break;
			}

			if (timingPitCount === undefined) {
				timingPitCount = "";
			}
			if (timingStopped === true) {
				carStatus = "STOPPED";
			}
			if (timingInPits === true) {
				carStatus = "IN PIT";
			}
			if (timingPitOut === true) {
				carStatus = "OUT";
			}

			if (timingS1_dec === undefined) {
				timingS1_dec = "";
			}
			if (timingS2_dec === undefined) {
				timingS2_dec = "";
			}
			if (timingS3_dec === undefined) {
				timingS3_dec = "";
			}

			var timingPosLine = `<td id="tab-pos">${timingCarPos}</td>`;
			var timingCarNumLine = `<td id="tab-carnum">${timingCarNum}</td>`;
			var timingDriverNameLine = `<td id="tab-name">${timingDriverName}</td>`;
			var timingGapLine = `<td id="tab-gap">${timingGap}</td>`;
			if (timingCarPos === "1") {
				var timingGapLine = `<td id="tab-p1-gap" colspan="2">${timingGap}</td>`;
			}
			var timingIntLine = `<td id="tab-int">${timingInt}</td>`;
			if (timingCarPos === "1") {
				var timingIntLine = ``;
			}
			var timingLastLapLine = `<td id="tab-lastlap">${timingLastLap}</td>`;
			if (is_fastestlap === true) {
				var timingLastLapLine = `<td id="tab-lastlap-fastest">${timingLastLap}</td>`;
			}
			if (is_pb === true && is_fastestlap === false) {
				var timingLastLapLine = `<td id="tab-lastlap-pb">${timingLastLap}</td>`;
			}
			var timingCarStatusRow = `<td id="tab-status">${carStatus}</td>`;
			var timingSector1Row = `<td id="tab-s1">${timingS1_dec}</td>`;
			var timingSector2Row = `<td id="tab-s2">${timingS2_dec}</td>`;
			var timingSector3Row = `<td id="tab-s3">${timingS3_dec}</td>`;
			var timingPitCountRow = `<td id="tab-pit">${timingPitCount}</td></tr>`;
			if (is_driverSector1_fastest === true) {
				timingSector1Row = `<td id="tab-s1-fastest">${timingS1_dec}</td>`;
			}
			if (is_driverSector2_fastest === true) {
				timingSector2Row = `<td id="tab-s2-fastest">${timingS2_dec}</td>`;
			}
			if (is_driverSector3_fastest === true) {
				timingSector3Row = `<td id="tab-s3-fastest">${timingS3_dec}</td>`;
			}
			if (is_driverSector1_pb === true && is_driverSector1_fastest === false) {
				timingSector1Row = `<td id="tab-s1-pb">${timingS1_dec}</td>`;
			}
			if (is_driverSector2_pb === true && is_driverSector2_fastest === false) {
				timingSector2Row = `<td id="tab-s2-pb">${timingS2_dec}</td>`;
			}
			if (is_driverSector3_pb === true && is_driverSector3_fastest === false) {
				timingSector3Row = `<td id="tab-s3-pb">${timingS3_dec}</td>`;
			}

			document.getElementById("position-Data").innerHTML += `
			<tr>
			${timingPosLine}
			${timingCarNumLine}
			${timingDriverNameLine}
			${timingGapLine}
			${timingIntLine}
			${timingLastLapLine}
			${timingCarStatusRow}
			${timingSector1Row}
			${timingSector2Row}
			${timingSector3Row}
			${timingPitCountRow}
			</tr>`;
		}
	}
}

async function getClock() {
	const response = await fetch(
		"http://localhost:10101/api/v2/live-timing/clock",
		{
			mode: "cors",
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}
	);
	if (debug === true) {
		console.log("Getting time");
	}
	const clockData = await response.json();
	if (debug === true) {
		console.log(clockData);
	}
	const sessionResponse = await fetch(
		"http://localhost:10101/api/v2/live-timing/state/SessionInfo",
		{
			mode: "cors",
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}
	);
	if (debug === true) {
		console.log("Getting Session Info");
	}
	const sessionInfo = await sessionResponse.json();
	var trackOffset = sessionInfo.GmtOffset;
	let trackTimezone;
	if (trackOffset === "-12:00:00") {
		trackTimezone = "Etc/GMT+12";
	}
	if (trackOffset === "-11:00:00") {
		trackTimezone = "Etc/GMT+11";
	}
	if (trackOffset === "-10:00:00") {
		trackTimezone = "Etc/GMT+10";
	}
	if (trackOffset === "-09:00:00") {
		trackTimezone = "Etc/GMT+9";
	}
	if (trackOffset === "-08:00:00") {
		trackTimezone = "Etc/GMT+8";
	}
	if (trackOffset === "-07:00:00") {
		trackTimezone = "Etc/GMT+7";
	}
	if (trackOffset === "-06:00:00") {
		trackTimezone = "Etc/GMT+6";
	}
	if (trackOffset === "-05:00:00") {
		trackTimezone = "Etc/GMT+5";
	}
	if (trackOffset === "-04:00:00") {
		trackTimezone = "Etc/GMT+4";
	}
	if (trackOffset === "-03:00:00") {
		trackTimezone = "Etc/GMT+3";
	}
	if (trackOffset === "-02:00:00") {
		trackTimezone = "Etc/GMT+2";
	}
	if (trackOffset === "-01:00:00") {
		trackTimezone = "Etc/GMT+1";
	}
	if (trackOffset === "00:00:00") {
		trackTimezone = "Etc/GMT-0";
	}
	if (trackOffset === "01:00:00") {
		trackTimezone = "Etc/GMT-1";
	}
	if (trackOffset === "02:00:00") {
		trackTimezone = "Etc/GMT-2";
	}
	if (trackOffset === "03:00:00") {
		trackTimezone = "Etc/GMT-3";
	}
	if (trackOffset === "04:00:00") {
		trackTimezone = "Etc/GMT-4";
	}
	if (trackOffset === "05:00:00") {
		trackTimezone = "Etc/GMT-5";
	}
	if (trackOffset === "06:00:00") {
		trackTimezone = "Etc/GMT-6";
	}
	if (trackOffset === "07:00:00") {
		trackTimezone = "Etc/GMT-7";
	}
	if (trackOffset === "08:00:00") {
		trackTimezone = "Etc/GMT-8";
	}
	if (trackOffset === "09:00:00") {
		trackTimezone = "Etc/GMT-9";
	}
	if (trackOffset === "10:00:00") {
		trackTimezone = "Etc/GMT-10";
	}
	if (trackOffset === "11:00:00") {
		trackTimezone = "Etc/GMT-11";
	}
	if (trackOffset === "12:00:00") {
		trackTimezone = "Etc/GMT-12";
	}
	if (trackOffset === "13:00:00") {
		trackTimezone = "Etc/GMT-13";
	}
	if (trackOffset === "14:00:00") {
		trackTimezone = "Etc/GMT-14";
	}

	var systemTime = clockData.systemTime;
	var trackTime = clockData.trackTime;
	var now = Date.now();
	var trackTimeLiveRaw = (now -= systemTime -= trackTime);
	var trackTimeLive = new Date(trackTimeLiveRaw).toLocaleTimeString("en-GB", {
		timeZone: trackTimezone,
	});
	document.getElementById("track-time").innerHTML = trackTimeLive;
	if (trackTimeLive === "Invalid Date") {
		document.getElementById("track-time").style.visibility = "hidden";
	}
}

getTimingData();
if (debug === false) {
	setInterval(getTimingData, 100);
}
getClock();
if (debug === false) {
	setInterval(getClock, 100);
}
