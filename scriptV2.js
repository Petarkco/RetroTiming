const debug = false;
const MultiView_url =
	"http://localhost:10101/api/v2/live-timing/state/TrackStatus,TimingData,DriverList,SessionInfo,TimingStats,RaceControlMessages,WeatherData";

async function getMultiviewData() {
	const multviewDataResponse = await fetch(MultiView_url, {
		mode: "cors",
	});
	let multiviewData = await multviewDataResponse.json();
	let multiviewTimingData = multiviewData.TimingData.Lines;
	let raceControlMessagesData = multiviewData.RaceControlMessages;
	let sessionOfficialName = multiviewData.SessionInfo.Meeting.OfficialName;
	let sessionTrackStatus = multiviewData.TrackStatus.Message;
	let sessionType = multiviewData.TimingStats.SessionType;
	let trackOffset = multiviewData.SessionInfo.GmtOffset;
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

	let pageSelected;
	function pageSelector() {
		let ele = document.getElementsByName("page-select");

		for (i = 0; i < ele.length; i++) {
			if (ele[i].checked) pageSelected = ele[i].value;
		}
	}
	pageSelector();

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
		let timingFastestS1;
		let timingFastestS2;
		let timingFastestS3;
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
				timingFastestS1 = "      ";
			}
			if (timingFastestS2 === undefined) {
				timingFastestS2 = "      ";
			}
			if (timingFastestS3 === undefined) {
				timingFastestS3 = "      ";
			}
		}
	}

	if (pageSelected === "mix") {
		document.getElementById("timing-table").innerHTML = `<tr>
    <th id="top-pos"></th>
    <th id="top-carnum"></th>
    <th id="top-name"></th>
    <th id="top-bestlaptime">BEST LAP</th>
    <th id="top-lastlaptime">LAST LAP</th>
    <th id="top-gap">GAP</th>
    <th id="top-sector-1"></th>
	<th id="top-sector1speed</th>
    <th id="top-sector-2"></th>
	<th id="top-sector2speed</th>
    <th id="top-sector-3"></th>
	<th id="top-sector3speed</th>
    <th id="top-status"></th>
    <th id="top-lapcount"></th>
	</tr>`;
	}
	if (pageSelected === "p1") {
		document.getElementById("timing-table").innerHTML = `<tr>
    <th id="top-pos"></th>
    <th id="top-carnum"></th>
    <th id="top-name"></th>
    <th id="top-bestlaptime">BEST LAP</th>
    <th id="top-sector-1"></th>
	<th id="top-sector1speed</th>
    <th id="top-sector-2"></th>
	<th id="top-sector2speed</th>
    <th id="top-sector-3"></th>
	<th id="top-sector3speed</th>
    <th id="top-status"></th>
    <th id="top-lapcount"></th>
	</tr>`;
	}
	if (pageSelected === "p3") {
		document.getElementById("timing-table").innerHTML = ``;
		document.getElementById("timing-table").innerHTML += `<tr>
			<th id="top-rcmtime">TIME</th>
			<th id="top-rcmmessages">MESSAGE</th>`;
	}

	if (pageSelected === "p4") {
		document.getElementById("timing-table").innerHTML = `<tr>
    <th id="top-pos"></th>
    <th id="top-carnum"></th>
    <th id="top-name"></th>
    <th id="top-bestlaptime">BEST LAP</th>
	<th id="top-gap">GAP</th>
    <th id="top-sector-1">${top_sector1OF}</th>
    <th id="top-sector-2">${top_sector2OF}</th>
    <th id="top-sector-3">${top_sector3OF}</th>
    <th id="top-lapcount"></th>
	</tr>`;
	}

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
			let carBestLap = linesData[i].BestLapTime.Value;
			let carLastLap = linesData[i].LastLapTime.Value;
			let carIsLapOF = linesData[i].LastLapTime.OverallFastest;
			let carIsLapPB = linesData[i].LastLapTime.PersonalFastest;
			let carInPit = linesData[i].InPit;
			let carStopped = linesData[i].Stopped;
			let carPitOut = linesData[i].PitOut;
			let carisRetired = linesData[i].Retired;
			let carSector1 = linesData[i].Sectors[0].Value;
			let carSector1isPB = linesData[i].Sectors[0].PersonalFastest;
			let carSector1isOF = linesData[i].Sectors[0].OverallFastest;
			let carSector1speed = linesData[i].Speeds.I1.Value;
			let carSector1speedisOF = linesData[i].Speeds.I1.OverallFastest;
			let carSector1speedisPB = linesData[i].Speeds.I1.PersonalFastest;
			let carSector2 = linesData[i].Sectors[1].Value;
			let carSector2isPB = linesData[i].Sectors[1].PersonalFastest;
			let carSector2isOF = linesData[i].Sectors[1].OverallFastest;
			let carSector2speed = linesData[i].Speeds.I2.Value;
			let carSector2speedisOF = linesData[i].Speeds.I2.OverallFastest;
			let carSector2speedisPB = linesData[i].Speeds.I2.PersonalFastest;
			let carSector3 = linesData[i].Sectors[2].Value;
			let carSector3isPB = linesData[i].Sectors[2].PersonalFastest;
			let carSector3isOF = linesData[i].Sectors[2].OverallFastest;
			let carSector3speed = linesData[i].Speeds.FL.Value;
			let carSector3speedisOF = linesData[i].Speeds.FL.OverallFastest;
			let carSector3speedisPB = linesData[i].Speeds.FL.PersonalFastest;
			let carSector1dec = parseFloat(carSector1).toFixedNoRounding(1);
			let carSector2dec = parseFloat(carSector2).toFixedNoRounding(1);
			let carSector3dec = parseFloat(carSector3).toFixedNoRounding(1);
			let carStatus;
			let carLapCount = linesData[i].NumberOfLaps;

			if (sessionType === "Race") {
				carGap = linesData[i].GapToLeader;
				carInt = linesData[i].IntervalToPositionAhead.Value;
			}

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

			if (carInPit === true) {
				carStatus = "IN PIT";
			}
			if (carStopped === true) {
				carStatus = "STOPPED";
			}
			if (carPitOut === true) {
				carStatus = "PIT OUT";
			}
			if (carisRetired === true) {
				carStatus = "OUT";
			}
			if (
				carInPit === false &&
				carStopped === false &&
				carPitOut === false &&
				carisRetired === false
			) {
				carStatus = "    ";
			}

			if (
				carInPit === false &&
				carStopped === false &&
				carPitOut === false &&
				carisRetired === false &&
				pageSelected === "p1"
			) {
				carStatus = carLastLap;
			}

			if (carLapCount === undefined) {
				carLapCount = "   ";
			}

			let table_carPos = `<td id="carPos">${carPos}</td>`;
			let table_carNum = `<td id="carNum">${carNum}</td>`;
			let table_carName = `<td>${carName}</td>`;
			let table_carGap = `<td id="carGap">${carGap}</td>`;
			let table_carInt = `<td id="carInt">${carInt}</td>`;
			let table_carBestLapTime = `<td>${carBestLap}</td>`;
			let table_carLastLapTime = `<td>${carLastLap}</td>`;
			let table_carSector1 = `<td id="sector1">${carSector1}</td>`;
			let table_carSector1dec = `<td id="sector1">${carSector1dec}</td>`;
			let table_carSector1speed = `<td id="sector1speed">${carSector1speed}</td>`;
			let table_carSector2 = `<td id="sector2">${carSector2}</td>`;
			let table_carSector2dec = `<td id="sector2">${carSector2dec}</td>`;
			let table_carSector2speed = `<td id="sector2speed">${carSector2speed}</td>`;
			let table_carSector3 = `<td id="sector3">${carSector3}</td>`;
			let table_carSector3dec = `<td id="sector3">${carSector3dec}</td>`;
			let table_carSector3speed = `<td id="sector3speed">${carSector3speed}</td>`;
			let table_carStatus = `<td id="carstatus">${carStatus}</td>`;
			let table_LapCount = `<td id="carlapcount">${carLapCount}</td>`;

			// set sector time colours for personal best and overall fastest
			if (carSector1isPB === true && carSector1isOF === true) {
				table_carSector1 = `<td id="sector1of">${carSector1}</td>`;
				table_carSector1dec = `<td id="sector1of">${carSector1dec}</td>`;
			}
			if (carSector1isPB === true && carSector1isOF === false) {
				table_carSector1 = `<td id="sector1pb">${carSector1}</td>`;
				table_carSector1dec = `<td id="sector1pb">${carSector1dec}</td>`;
			}
			if (carSector1isPB === false && carSector1isOF === true) {
				table_carSector1 = `<td id="sector1of">${carSector1}</td>`;
				table_carSector1dec = `<td id="sector1of">${carSector1dec}</td>`;
			}
			if (carSector2isPB === true && carSector2isOF === false) {
				table_carSector2 = `<td id="sector2pb">${carSector2}</td>`;
				table_carSector2dec = `<td id="sector2pb">${carSector2dec}</td>`;
			}
			if (carSector2isPB === false && carSector2isOF === true) {
				table_carSector2 = `<td id="sector2of">${carSector2}</td>`;
				table_carSector2dec = `<td id="sector2of">${carSector2dec}</td>`;
			}
			if (carSector2isPB === true && carSector2isOF === true) {
				table_carSector2 = `<td id="sector2of">${carSector2}</td>`;
				table_carSector2dec = `<td id="sector2of">${carSector2dec}</td>`;
			}
			if (carSector3isPB === true && carSector3isOF === false) {
				table_carSector3 = `<td id="sector3pb">${carSector3}</td>`;
				table_carSector3dec = `<td id="sector3pb">${carSector3dec}</td>`;
			}
			if (carSector3isPB === false && carSector3isOF === true) {
				table_carSector3 = `<td id="sector3of">${carSector3}</td>`;
				table_carSector3dec = `<td id="sector3of">${carSector3dec}</td>`;
			}
			if (carSector3isPB === true && carSector3isOF === true) {
				table_carSector3 = `<td id="sector3of">${carSector3}</td>`;
				table_carSector3dec = `<td id="sector3of">${carSector3dec}</td>`;
			}

			// set speed colours for personal best and overall fastest
			if (carSector1speedisOF === true && carSector1speedisPB === false) {
				table_carSector1speed = `<td id="sector1speedof">${carSector1speed}</td>`;
			}
			if (carSector1speedisOF === false && carSector1speedisPB === true) {
				table_carSector1speed = `<td id="sector1speedpb">${carSector1speed}</td>`;
			}
			if (carSector1speedisOF === true && carSector2speedisPB === true) {
				table_carSector1speed = `<td id="sector1speedof">${carSector1speed}</td>`;
			}
			if (carSector2speedisOF === true && carSector2speedisPB === false) {
				table_carSector2speed = `<td id="sector2speedof">${carSector2speed}</td>`;
			}
			if (carSector2speedisOF === false && carSector2speedisPB === true) {
				table_carSector2speed = `<td id="sector2speedpb">${carSector2speed}</td>`;
			}
			if (carSector2speedisOF === true && carSector2speedisPB === true) {
				table_carSector2speed = `<td id="sector2speedof">${carSector2speed}</td>`;
			}
			if (carSector3speedisOF === true && carSector3speedisPB === false) {
				table_carSector3speed = `<td id="sector3speedof">${carSector3speed}</td>`;
			}
			if (carSector3speedisOF === false && carSector3speedisPB === true) {
				table_carSector3speed = `<td id="sector3speedpb">${carSector3speed}</td>`;
			}
			if (carSector3speedisOF === true && carSector3speedisPB === true) {
				table_carSector3speed = `<td id="sector3speedof">${carSector3speed}</td>`;
			}

			if (carStatus === "PIT OUT" && pageSelected === "p4") {
				table_carNum = `<td id="carNumRed">${carNum}</td>`;
			}

			if (pageSelected === "mix") {
				document.getElementById("timing-table").innerHTML += `
            ${table_carPos}
            ${table_carNum}
            ${table_carName}
            ${table_carBestLapTime}
			${table_carLastLapTime}
			${table_carGap}
            ${table_carSector1}
			${table_carSector1speed}
            ${table_carSector2}
			${table_carSector2speed}
            ${table_carSector3}
			${table_carSector3speed}
            ${table_carStatus}
			${table_LapCount}
            `;
			}
			if (pageSelected === "p1") {
				document.getElementById("timing-table").innerHTML += `
            ${table_carPos}
            ${table_carNum}
            ${table_carName}
            ${table_carBestLapTime}
            ${table_carSector1}
			${table_carSector1speed}
            ${table_carSector2}
			${table_carSector2speed}
            ${table_carSector3}
			${table_carSector3speed}
            ${table_carStatus}
			${table_LapCount}
            `;
			}

			if (pageSelected === "p4") {
				document.getElementById("timing-table").innerHTML += `
            ${table_carPos}
            ${table_carNum}
            ${table_carName}
            ${table_carBestLapTime}
			${table_carGap}
            ${table_carSector1dec}
            ${table_carSector2dec}
            ${table_carSector3dec}
			${table_LapCount}
            `;
			}
		}

		if (sessionOfficialName === undefined) {
			sessionOfficialName = multiviewData.SessionInfo.Meeting.Name;
		}

		if (sessionTrackStatus === "AllClear") {
			document.getElementById("flag-bar").innerText = `${sessionOfficialName}`;
			document.getElementById("flag-bar").style.color =
				"rgba(255, 255, 255, 1)";
			document.getElementById("flag-bar").style.backgroundColor = "black";
			document.getElementById("flag-bar").style.width = "100%";
			document.getElementById("flag-bar").style.animation = "none";
		}
		if (sessionTrackStatus === "SCDeployed") {
			document.getElementById("flag-bar").innerText = "SC";
			document.getElementById("flag-bar").style.color = "rgba(0, 0, 0, 0)";
			document.getElementById("flag-bar").style.backgroundColor = "#f8ff2c";
			document.getElementById("flag-bar").style.animation =
				"blink normal 1.2s infinite ease-in-out";
		}
		if (sessionTrackStatus === "VSCDeployed") {
			document.getElementById("flag-bar").innerText = "SC";
			document.getElementById("flag-bar").style.color = "rgba(0, 0, 0, 0)";
			document.getElementById("flag-bar").style.backgroundColor = "#f8ff2c";
			document.getElementById("flag-bar").style.animation =
				"blink normal 1.2s infinite ease-in-out";
		}
		if (sessionTrackStatus === "Red") {
			document.getElementById("flag-bar").innerText = "RED";
			document.getElementById("flag-bar").style.color = "rgba(0, 0, 0, 0)";
			document.getElementById("flag-bar").style.backgroundColor = "red";
			document.getElementById("flag-bar").style.width = "100%";
			document.getElementById("flag-bar").style.animation = "none";
		}
	}
	raceControlMessagesData.Messages.reverse();

	for (
		var i = 0;
		i <
		(raceControlMessagesData.Messages.length < 13
			? raceControlMessagesData.Messages.length
			: 13);
		i++
	) {
		var raceControlMessageTime =
			raceControlMessagesData.Messages[i].Utc + "+00:00";
		var raceControlMessage = raceControlMessagesData.Messages[i].Message;
		if (pageSelected === "p3") {
			document.getElementById(
				"timing-table"
			).innerHTML += `<td id="table-rcm-time">${new Date(
				raceControlMessageTime
			).toLocaleTimeString("en-GB", {
				timeZone: trackTimezone,
				hour: "2-digit",
				minute: "2-digit",
			})}</td><td id="table-rcm-message">${raceControlMessage}</td>`;
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
	const sessionInfo = await sessionResponse.json();
	let trackOffset = sessionInfo.GmtOffset;
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

	let systemTime = clockData.systemTime;
	let trackTime = clockData.trackTime;
	let now = Date.now();
	let trackTimeLiveRaw = (now -= systemTime -= trackTime);
	let trackTimeLive = new Date(trackTimeLiveRaw).toLocaleTimeString("en-GB", {
		timeZone: trackTimezone,
	});
	document.getElementById("track-time").innerText = trackTimeLive;
	if (trackTimeLive === "Invalid Date") {
		document.getElementById("track-time").innerText = "00:00:00";
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
