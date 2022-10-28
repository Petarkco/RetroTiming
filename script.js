var debug = false;
// Classic for Manana, Classic-Bold for Manana in bold and F1Digital for Futura.
var font = document.cookie;
//Use three letter code (i.e. HAM) instead of driver name
var timingUseThreeLetters = false;

const url =
	"http://localhost:10101/api/v2/live-timing/state/TrackStatus,TimingData,DriverList,SessionInfo,TimingStats";

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
		console.log(timingData);
	}

	document.getElementById("font-choice").onchange = function () {
		font = document.getElementById("font-choice").value;
		document.cookie = `${font}; max-age=31536000;`;
	};

	//Set font
	if (font === "Classic") {
		document.getElementById("main").style.fontFamily = "manana, sans-serif";
	}
	if (font === "ClassicBold") {
		document.getElementById("main").style.fontFamily =
			"manana-bold, sans-serif";
	}
	if (font === "F1Digital") {
		document.getElementById("main").style.fontFamily =
			"futura-pt-condensed, sans-serif";
	}

	const sessionType = timingData.SessionInfo.Type;
	const sessionPart = timingData.TimingData.SessionPart;

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
	const liveTimingData = timingData.TimingData.Lines;
	var timingFastestS1;
	var timingFastestS2;
	var timingFastestS3;
	for (let lines of Object.entries(liveTimingData).sort(
		(a, b) => parseInt(a[1].Position) - parseInt(b[1].Position)
	)) {
		let linesData = lines;
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
	document.getElementById("position-Data").innerHTML = `<tr>
		<th id="pos-head"></th>
		<th id="carnum-head"></th>
		<th id="name-head"></th>
		<th id="gap-head">GAP</th>
		<th id="int-head">INT</th>
		<th id="lastlap-head"></th>
		<th id="status-head"></th>
		<th id="s1-head">${timingFastestS1}</th>
		<th id="s2-head">${timingFastestS2}</th>
		<th id="s3-head">${timingFastestS3}</th>
		<th id="pit-head"></th>
	</tr>`;

	for (let lines of Object.entries(liveTimingData).sort(
		(a, b) => parseInt(a[1].Position) - parseInt(b[1].Position)
	)) {
		let linesData = lines;
		for (var i = 1; i < linesData.length; i++) {
			window.addEventListener("resize", function () {
				if (window.matchMedia("(max-width: 845px)").matches) {
					timingUseThreeLetters = true;
				} else {
					timingUseThreeLetters = false;
				}
			});
			if (sessionType === "Practice") {
				let timingCarPos = linesData[i].Position;
				let timingShowPos = linesData[i].ShowPosition;
				let timingCarNum = linesData[i].RacingNumber;
				var timingDriverName =
					timingData.DriverList[timingCarNum].BroadcastName;
				let timingGap = linesData[i].TimeDiffToFastest;
				let timingGapDec = parseFloat(timingGap).toFixedNoRounding(1);
				let timingInt = linesData[i].TimeDiffToPositionAhead;
				let timingIntDec = parseFloat(timingInt).toFixedNoRounding(1);
				let timingLastLap = linesData[i].LastLapTime.Value;
				let timingS1 = linesData[i].Sectors[0].Value;
				let timingS1_dec = parseFloat(timingS1).toFixedNoRounding(1);
				let timingS2 = linesData[i].Sectors[1].Value;
				let timingS2_dec = parseFloat(timingS2).toFixedNoRounding(1);
				let timingS3 = linesData[i].Sectors[2].Value;
				let timingS3_dec = parseFloat(timingS3).toFixedNoRounding(1);
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

				if (timingStopped === true) {
					carStatus = "STOPPED";
				}
				if (timingInPits === true) {
					carStatus = "IN PIT";
				}
				if (timingPitOut === true) {
					carStatus = "OUT";
				}
				if (timingGapDec === undefined) {
					timingGapDec = "";
				}
				if (timingIntDec === undefined) {
					timingIntDec = "";
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

				if (timingShowPos === false) {
					var timingPosLine = `<td id="tab-pos"></td>`;
				}
				var timingPosLine = `<td id="tab-pos">${timingCarPos}</td>`;
				var timingCarNumLine = `<td id="tab-carnum">${timingCarNum}</td>`;
				var timingDriverNameLine = `<td id="tab-name">${timingDriverName}</td>`;
				var timingGapLine = `<td id="tab-gap">${timingGapDec}</td>`;
				if (timingCarPos === "1") {
					var timingGapLine = `<td id="tab-p1-gap" colspan="2">${timingGap}</td>`;
				}
				var timingIntLine = `<td id="tab-int">${timingIntDec}</td>`;
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
				if (is_driverSector1_fastest === true) {
					timingSector1Row = `<td id="tab-s1-fastest">${timingS1_dec}</td>`;
					var timingBestS1 = timingS1_dec;
				}
				if (is_driverSector2_fastest === true) {
					timingSector2Row = `<td id="tab-s2-fastest">${timingS2_dec}</td>`;
					var timingBestS2 = timingS2_dec;
				}
				if (is_driverSector3_fastest === true) {
					timingSector3Row = `<td id="tab-s3-fastest">${timingS3_dec}</td>`;
					var timingBestS3 = timingS2_dec;
				}
				if (
					is_driverSector1_pb === true &&
					is_driverSector1_fastest === false
				) {
					timingSector1Row = `<td id="tab-s1-pb">${timingS1_dec}</td>`;
				}
				if (
					is_driverSector2_pb === true &&
					is_driverSector2_fastest === false
				) {
					timingSector2Row = `<td id="tab-s2-pb">${timingS2_dec}</td>`;
				}
				if (
					is_driverSector3_pb === true &&
					is_driverSector3_fastest === false
				) {
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
			</tr>`;
			}
			if (sessionType === "Qualifying" && sessionPart === 1) {
				let timingCarPos = linesData[i].Position;
				let timingShowPos = linesData[i].ShowPosition;
				let timingCarNum = linesData[i].RacingNumber;
				var timingDriverName =
					timingData.DriverList[timingCarNum].BroadcastName;
				let timingGap = linesData[i].Stats[0].TimeDiffToFastest;
				let timingGapDec = parseFloat(timingGap).toFixedNoRounding(1);
				let timingInt = linesData[i].Stats[0].TimeDifftoPositionAhead;
				let timingIntDec = parseFloat(timingInt).toFixedNoRounding(1);
				let timingLastLap = linesData[i].LastLapTime.Value;
				let timingS1 = linesData[i].Sectors[0].Value;
				let timingS1_dec = parseFloat(timingS1).toFixedNoRounding(1);
				let timingS2 = linesData[i].Sectors[1].Value;
				let timingS2_dec = parseFloat(timingS2).toFixedNoRounding(1);
				let timingS3 = linesData[i].Sectors[2].Value;
				let timingS3_dec = parseFloat(timingS3).toFixedNoRounding(1);
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

				if (timingStopped === true) {
					carStatus = "STOPPED";
				}
				if (timingInPits === true) {
					carStatus = "IN PIT";
				}
				if (timingPitOut === true) {
					carStatus = "OUT";
				}
				if (timingGapDec === undefined) {
					timingGapDec = "";
				}
				if (timingIntDec === undefined) {
					timingIntDec = "";
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

				if (timingShowPos === false) {
					var timingPosLine = `<td id="tab-pos"></td>`;
				}
				var timingPosLine = `<td id="tab-pos">${timingCarPos}</td>`;
				var timingCarNumLine = `<td id="tab-carnum">${timingCarNum}</td>`;
				var timingDriverNameLine = `<td id="tab-name">${timingDriverName}</td>`;
				var timingGapLine = `<td id="tab-gap">${timingGapDec}</td>`;
				if (timingCarPos === "1") {
					var timingGapLine = `<td id="tab-p1-gap" colspan="2">${timingGap}</td>`;
				}
				var timingIntLine = `<td id="tab-int">${timingIntDec}</td>`;
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
				if (is_driverSector1_fastest === true) {
					timingSector1Row = `<td id="tab-s1-fastest">${timingS1_dec}</td>`;
				}
				if (is_driverSector2_fastest === true) {
					timingSector2Row = `<td id="tab-s2-fastest">${timingS2_dec}</td>`;
				}
				if (is_driverSector3_fastest === true) {
					timingSector3Row = `<td id="tab-s3-fastest">${timingS3_dec}</td>`;
				}
				if (
					is_driverSector1_pb === true &&
					is_driverSector1_fastest === false
				) {
					timingSector1Row = `<td id="tab-s1-pb">${timingS1_dec}</td>`;
				}
				if (
					is_driverSector2_pb === true &&
					is_driverSector2_fastest === false
				) {
					timingSector2Row = `<td id="tab-s2-pb">${timingS2_dec}</td>`;
				}
				if (
					is_driverSector3_pb === true &&
					is_driverSector3_fastest === false
				) {
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
			</tr>`;
			}

			if (sessionType === "Qualifying" && sessionPart === 2) {
				let timingCarPos = linesData[i].Position;
				let timingShowPos = linesData[i].ShowPosition;
				let timingCarNum = linesData[i].RacingNumber;
				var timingDriverName =
					timingData.DriverList[timingCarNum].BroadcastName;
				let timingGap = linesData[i].Stats[1].TimeDiffToFastest;
				let timingGapDec = parseFloat(timingGap).toFixedNoRounding(1);
				let timingInt = linesData[i].Stats[1].TimeDifftoPositionAhead;
				let timingIntDec = parseFloat(timingInt).toFixedNoRounding(1);
				let timingLastLap = linesData[i].LastLapTime.Value;
				let timingS1 = linesData[i].Sectors[0].Value;
				let timingS1_dec = parseFloat(timingS1).toFixedNoRounding(1);
				let timingS2 = linesData[i].Sectors[1].Value;
				let timingS2_dec = parseFloat(timingS2).toFixedNoRounding(1);
				let timingS3 = linesData[i].Sectors[2].Value;
				let timingS3_dec = parseFloat(timingS3).toFixedNoRounding(1);
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

				if (timingStopped === true) {
					carStatus = "STOPPED";
				}
				if (timingInPits === true) {
					carStatus = "IN PIT";
				}
				if (timingPitOut === true) {
					carStatus = "OUT";
				}
				if (timingGapDec === undefined) {
					timingGapDec = "";
				}
				if (timingIntDec === undefined) {
					timingIntDec = "";
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

				if (timingShowPos === false) {
					var timingPosLine = `<td id="tab-pos"></td>`;
				}
				var timingPosLine = `<td id="tab-pos">${timingCarPos}</td>`;
				var timingCarNumLine = `<td id="tab-carnum">${timingCarNum}</td>`;
				var timingDriverNameLine = `<td id="tab-name">${timingDriverName}</td>`;
				var timingGapLine = `<td id="tab-gap">${timingGap}</td>`;
				var timingGapLine = `<td id="tab-gap">${timingGapDec}</td>`;
				if (timingCarPos === "1") {
					var timingGapLine = `<td id="tab-p1-gap" colspan="2">${timingGap}</td>`;
				}
				var timingIntLine = `<td id="tab-int">${timingIntDec}</td>`;
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
				if (is_driverSector1_fastest === true) {
					timingSector1Row = `<td id="tab-s1-fastest">${timingS1_dec}</td>`;
				}
				if (is_driverSector2_fastest === true) {
					timingSector2Row = `<td id="tab-s2-fastest">${timingS2_dec}</td>`;
				}
				if (is_driverSector3_fastest === true) {
					timingSector3Row = `<td id="tab-s3-fastest">${timingS3_dec}</td>`;
				}
				if (
					is_driverSector1_pb === true &&
					is_driverSector1_fastest === false
				) {
					timingSector1Row = `<td id="tab-s1-pb">${timingS1_dec}</td>`;
				}
				if (
					is_driverSector2_pb === true &&
					is_driverSector2_fastest === false
				) {
					timingSector2Row = `<td id="tab-s2-pb">${timingS2_dec}</td>`;
				}
				if (
					is_driverSector3_pb === true &&
					is_driverSector3_fastest === false
				) {
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
			</tr>`;
			}
			if (sessionType === "Qualifying" && sessionPart === 3) {
				let timingCarPos = linesData[i].Position;
				let timingShowPos = linesData[i].ShowPosition;
				let timingCarNum = linesData[i].RacingNumber;
				var timingDriverName =
					timingData.DriverList[timingCarNum].BroadcastName;
				let timingGap = linesData[i].Stats[2].TimeDiffToFastest;
				let timingGapDec = parseFloat(timingGap).toFixedNoRounding(1);
				let timingInt = linesData[i].Stats[2].TimeDifftoPositionAhead;
				let timingIntDec = parseFloat(timingInt).toFixedNoRounding(1);
				let timingLastLap = linesData[i].LastLapTime.Value;
				let timingS1 = linesData[i].Sectors[0].Value;
				let timingS1_dec = parseFloat(timingS1).toFixedNoRounding(1);
				let timingS2 = linesData[i].Sectors[1].Value;
				let timingS2_dec = parseFloat(timingS2).toFixedNoRounding(1);
				let timingS3 = linesData[i].Sectors[2].Value;
				let timingS3_dec = parseFloat(timingS3).toFixedNoRounding(1);
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
				if (timingStopped === true) {
					carStatus = "STOPPED";
				}
				if (timingInPits === true) {
					carStatus = "IN PIT";
				}
				if (timingPitOut === true) {
					carStatus = "OUT";
				}
				if (timingGapDec === undefined) {
					timingGapDec = "";
				}
				if (timingIntDec === undefined) {
					timingIntDec = "";
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

				if (timingShowPos === false) {
					var timingPosLine = `<td id="tab-pos"></td>`;
				}
				var timingPosLine = `<td id="tab-pos">${timingCarPos}</td>`;
				var timingCarNumLine = `<td id="tab-carnum">${timingCarNum}</td>`;
				var timingDriverNameLine = `<td id="tab-name">${timingDriverName}</td>`;
				var timingGapLine = `<td id="tab-gap">${timingGapDec}</td>`;
				if (timingCarPos === "1") {
					var timingGapLine = `<td id="tab-p1-gap" colspan="2">${timingGap}</td>`;
				}
				var timingIntLine = `<td id="tab-int">${timingIntDec}</td>`;
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
				if (is_driverSector1_fastest === true) {
					timingSector1Row = `<td id="tab-s1-fastest">${timingS1_dec}</td>`;
				}
				if (is_driverSector2_fastest === true) {
					timingSector2Row = `<td id="tab-s2-fastest">${timingS2_dec}</td>`;
				}
				if (is_driverSector3_fastest === true) {
					timingSector3Row = `<td id="tab-s3-fastest">${timingS3_dec}</td>`;
				}
				if (
					is_driverSector1_pb === true &&
					is_driverSector1_fastest === false
				) {
					timingSector1Row = `<td id="tab-s1-pb">${timingS1_dec}</td>`;
				}
				if (
					is_driverSector2_pb === true &&
					is_driverSector2_fastest === false
				) {
					timingSector2Row = `<td id="tab-s2-pb">${timingS2_dec}</td>`;
				}
				if (
					is_driverSector3_pb === true &&
					is_driverSector3_fastest === false
				) {
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
			</tr>`;
			}

			if (sessionType === "Race") {
				let timingCarPos = linesData[i].Position;
				let timingShowPos = linesData[i].ShowPosition;
				let timingCarNum = linesData[i].RacingNumber;
				var timingDriverName =
					timingData.DriverList[timingCarNum].BroadcastName;
				let timingGap = linesData[i].GapToLeader;
				let timingGapDec = parseFloat(timingGap).toFixedNoRounding(1);
				let timingInt = linesData[i].IntervalToPositionAhead.Value;
				let timingIntDec = parseFloat(timingInt).toFixedNoRounding(1);
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

				if (timingUseThreeLetters === true) {
					timingDriverName = timingData.DriverList[timingCarNum].Tla;
				}

				if (timingGapDec === undefined) {
					timingGapDec = "";
				}
				if (timingIntDec === undefined) {
					timingIntDec = "";
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

				if (timingShowPos === false) {
					var timingPosLine = `<td id="tab-pos"></td>`;
				}
				var timingPosLine = `<td id="tab-pos">${timingCarPos}</td>`;
				var timingCarNumLine = `<td id="tab-carnum">${timingCarNum}</td>`;
				var timingDriverNameLine = `<td id="tab-name">${timingDriverName}</td>`;
				var timingGapLine = `<td id="tab-gap">${timingGapDec}</td>`;
				if (timingCarPos === "1") {
					var timingGapLine = `<td id="tab-p1-gap" colspan="2">${timingGap}</td>`;
				}
				var timingIntLine = `<td id="tab-int">${timingIntDec}</td>`;
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
				if (
					is_driverSector1_pb === true &&
					is_driverSector1_fastest === false
				) {
					timingSector1Row = `<td id="tab-s1-pb">${timingS1_dec}</td>`;
				}
				if (
					is_driverSector2_pb === true &&
					is_driverSector2_fastest === false
				) {
					timingSector2Row = `<td id="tab-s2-pb">${timingS2_dec}</td>`;
				}
				if (
					is_driverSector3_pb === true &&
					is_driverSector3_fastest === false
				) {
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
	if (debug === true) {
		console.log(extrapolatedClockData);
	}

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

	// //Display 2 hour timer
	// const liveTimingStartTime = clockData.liveTimingStartTime;
	// console.log(liveTimingStartTime);
	// const isExtrapolatedClockStopped = clockData.paused;
	// console.log(isExtrapolatedClockStopped);
	// const sessionTimeElapsed = trackTimeLiveRaw - liveTimingStartTime;
	// console.log(sessionTimeElapsed2);
	// var sessionTimeRemaining = extrapolatedClockData.Remaining;
	// document.getElementById("race-time").innerText = sessionTimeRemaining;
}

getTimingData();
if (debug === false) {
	setInterval(getTimingData, 100);
}
getClock();
if (debug === false) {
	setInterval(getClock, 100);
}
