const debug = false;
const MultiView_url =
	"http://localhost:10101/api/v2/live-timing/state/TrackStatus,TimingData,DriverList,SessionInfo,TimingStats";

async function getMultiviewData() {
	const multviewDataResponse = await fetch(MultiView_url, {
		mode: "cors",
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	});
	var multiviewData = await multviewDataResponse.json();
	const multiviewTimingData = multiviewData.TimingData.Lines;
	var sessionOfficialName = multiviewData.SessionInfo.Meeting.OfficialName;
	var sessionTrackStatus = multiviewData.TrackStatus.Message;
	var sessionType = multiviewData.TimingStats.sessionType;

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

	for (let lines of Object.entries(multiviewTimingData).sort(
		(a, b) => parseInt(a[1].Position) - parseInt(b[1].Position)
	)) {
		let linesData = lines;
		var timingFastestS1;
		var timingFastestS2;
		var timingFastestS3;
		for (var i = 1; i < linesData.length; i++) {
			let timingS1 = linesData[i].Sectors[0].Value;
			let timingS1_dec = parseFloat(timingS1).toFixedNoRounding(1);
			let timingS2 = linesData[i].Sectors[1].Value;
			let timingS2_dec = parseFloat(timingS2).toFixedNoRounding(1);
			let timingS3 = linesData[i].Sectors[2].Value;
			let timingS3_dec = parseFloat(timingS3).toFixedNoRounding(1);
			let is_driverSector1_fastest = linesData[i].Sectors[0].OverallFastest;
			let is_driverSector2_fastest = linesData[i].Sectors[1].OverallFastest;
			let is_driverSector3_fastest = linesData[i].Sectors[2].OverallFastest;

			if (is_driverSector1_fastest === true) {
				timingFastestS1 = timingS1_dec;
			}
			if (is_driverSector2_fastest === true) {
				timingFastestS2 = timingS2_dec;
			}
			if (is_driverSector3_fastest === true) {
				timingFastestS3 = timingS3_dec;
			}

			if (timingFastestS1 === undefined) {
				timingFastestS1 = "";
			}
			if (timingFastestS2 === undefined) {
				timingFastestS2 = "";
			}
			if (timingFastestS3 === undefined) {
				timingFastestS3 = "";
			}
		}
	}

	document.getElementById("timing-table").innerHTML = `<tr>
    <th id="top-pos"></th>
    <th id="top-carnum"></th>
    <th id="top-name"></th>
    <th id="top-gap">GAP</th>
    <th id="top-int">INT</th>
    <th id="top-lastlaptime"></th>
    <th id="top-status"></th>
    <th id="top-sector1">00.0</th>
    <th id="top-sector2">00.0</th>
    <th id="top-sector3">00.0</th>
    <th id="top-pitnum"></th>
	</tr>`;

	for (let lines of Object.entries(multiviewTimingData).sort(
		(a, b) => parseInt(a[1].Position) - parseInt(b[1].Position)
	)) {
		let linesData = lines;
		for (var i = 1; i < linesData.length; i++) {
			let carPos = linesData[i].Position;
			let carShowPosition = linesData[i].showPosition;
			let carNum = linesData[i].RacingNumber;
			let carName = multiviewData.DriverList[carNum].BroadcastName;
			let carGap = linesData[i].TimeDiffToFastest;
			let carInt = linesData[i].TimeDiffToPositionAhead;
			let carLastLap = linesData[i].LastLapTime.Value;
			let carStatus = "";
			let carSector1 = linesData[i].Sectors[0].Value;
			let carSector2 = linesData[i].Sectors[1].Value;
			let carSector3 = linesData[i].Sectors[2].Value;
			let carSector1dec = parseFloat(carSector1).toFixedNoRounding(1);
			let carSector2dec = parseFloat(carSector2).toFixedNoRounding(1);
			let carSector3dec = parseFloat(carSector3).toFixedNoRounding(1);

			if (carSector1dec === undefined) {
				carSector1dec = "";
			}
			if (carSector2dec === undefined) {
				carSector2dec = "";
			}
			if (carSector3dec === undefined) {
				carSector3dec = "";
			}

			if (carShowPosition === false) {
				carPos = "";
			}

			let table_carPos = `<td id="cyan">${carPos}</td>`;
			let table_carNum = `<td>${carNum}</rd>`;
			let table_carName = `<td  id="yellow">${carName}`;
			let table_carGap = `<td>${carGap}</td>`;
			let table_carInt = `<td>${carInt}</td>`;
			let table_carLastLapTime = `<td>${carLastLap}</td>`;
			let table_carStatus = `<td>${carStatus}`;
			let table_carSector1 = `<td>${carSector1dec}`;
			let table_carSector2 = `<td>${carSector2dec}`;
			let table_carSector3 = `<td>${carSector3dec}`;
			let table_pitNum = `<td></td>`;

			document.getElementById("timing-table").innerHTML += `
            ${table_carPos}
            ${table_carNum}
            ${table_carName}
            ${table_carGap}
            ${table_carInt}
            ${table_carLastLapTime}
            ${table_carStatus}
            ${table_carSector1}
            ${table_carSector2}
            ${table_carSector3}
            ${table_pitNum}
            `;
		}

		if ((sessionTrackStatus = "AllClear")) {
			var flagbar = document.getElementById("flag-bar");
			flagbar.setAttribute("id", "flag-bar");
			document.getElementById("flag-bar").innerText = `${sessionOfficialName}`;
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
	const clockData = await response.json();
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

	const extrapolatedClockResponse = await fetch(
		"http://localhost:10101/api/v2/live-timing/state/ExtrapolatedClock",
		{
			mode: "cors",
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}
	);
	const extrapolatedClockData = await extrapolatedClockResponse.json();
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

getMultiviewData();
if (debug === false) {
	setInterval(getMultiviewData, 100);
}
getClock();
if (debug === false) {
	setInterval(getClock, 100);
}
