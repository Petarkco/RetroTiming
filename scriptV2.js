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
	let weatherData = multiviewData.WeatherData;
	let sessionOfficialName = multiviewData.SessionInfo.Meeting.OfficialName;
	let sessionTrackStatus = multiviewData.TrackStatus.Message;
	let sessionType = multiviewData.TimingStats.SessionType;
	let trackOffset = multiviewData.SessionInfo.GmtOffset;
	let qualifyingPart = await multiviewData.TimingData.SessionPart;
	let trackTimezone = getTrackTimezone(trackOffset);

	let pageSelected;
	function pageSelector() {
		let ele = document.getElementsByName("page-select");

		for (i = 0; i < ele.length; i++) {
			if (ele[i].checked) pageSelected = ele[i].value;
		}
	}
	pageSelector();

	let cutOffTime = multiviewData.TimingData.CutOffTime;
	let cutOffPercent = multiviewData.TimingData.CutOffPercentage;

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

			if (
				is_driverSector1_fastest ||
				is_driverSector2_fastest ||
				is_driverSector3_fastest
			) {
				if (is_driverSector1_fastest) timingFastestS1 = timingS1_dec;
				if (is_driverSector2_fastest) timingFastestS2 = timingS2_dec;
				if (is_driverSector3_fastest) timingFastestS3 = timingS3_dec;
			}

			if (
				timingFastestS1 === undefined ||
				timingFastestS2 === undefined ||
				timingFastestS3 === undefined
			) {
				timingFastestS1 = timingFastestS1 || "";
				timingFastestS2 = timingFastestS2 || "";
				timingFastestS3 = timingFastestS3 || "";
			}
		}
	}

	if (pageSelected === "mix") {
		document.getElementById("trackWeatherData").innerHTML = ``;
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
		document.getElementById("trackWeatherData").innerHTML = ``;
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
		document.getElementById("trackWeatherData").innerHTML = ``;
		document.getElementById("timing-table").innerHTML = `<tr>
    <th id="top-pos"></th>
    <th id="top-carnum"></th>
    <th id="top-name"></th>
    <th id="top-bestlaptime">BEST LAP</th>
	<th id="top-gap">GAP</th>
    <th id="top-sector-1"></th>
    <th id="top-sector-2"></th>
    <th id="top-sector-3"></th>
    <th id="top-lapcount"></th>
	</tr>`;
	}
	if (sessionType === "Qualifying") {
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
		<th id="top-nameQ">Q1 ${cutOffPercent}% TIME</th>
		<th id="top-bestlaptime">${cutOffTime}</th>
		<th id="top-gap">GAP</th>
		<th id="top-sector-1"></th>
		<th id="top-sector-2"></th>
		<th id="top-sector-3"></th>
		<th id="top-lapcount"></th>
		</tr>`;
		}
	}
	if (sessionType === "Race") {
		if (pageSelected === "mix") {
			document.getElementById("timing-table").innerHTML = `<tr>
		<th id="top-pos"></th>
		<th id="top-carnum"></th>
		<th id="top-name"></th>
		<th id="top-bestlaptime">BEST LAP</th>
		<th id="top-lastlaptime">LAST LAP</th>
		<th id="top-gap">GAP</th>
		<th id="top-int">INT</th>
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
		<th id="top-sector-1"></th>
		<th id="top-sector-2"></th>
		<th id="top-sector-3"></th>
		<th id="top-lapcount"></th>
		</tr>`;
		}
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
			let carPitCount = linesData[i].NumberOfPitStops;
			let carIsKnockedOut = linesData[i].KnockedOut;
			let carIsCutOff = linesData[i].Cutoff;

			if (sessionType === "Qualifying") {
				carGap = linesData[i].Stats[qualifyingPart - 1].TimeDiffToFastest;
				if (carGap === undefined) {
					carGap = "";
				}
				carInt = linesData[i].Stats[qualifyingPart - 1].TimeDifftoPositionAhead;
				if (carInt === undefined) {
					carInt = "";
				}
			}
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

			if (carInPit) {
				carStatus = "IN PIT";
			} else if (carStopped) {
				carStatus = "STOPPED";
			} else if (carPitOut) {
				carStatus = "PIT OUT";
			} else if (carisRetired) {
				carStatus = "OUT";
			} else {
				carStatus = "";
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

			if (carPitCount === undefined) {
				carPitCount = "   ";
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
			let table_PitCount = `<td id="carlapcount">${carPitCount}</td>`;
			if (carIsKnockedOut === true || carIsCutOff === true) {
				table_carName = `<td id="carNameKO">${carName}</td>`;
			}

			// if ((carPos = 1)) {
			// 	table_carGap = `<td id="carGap" colspan=2>${carGap}</td>`;
			// 	table_carInt = ``;
			// }

			// set sector time colours for personal best and overall fastest
			if (carSector1isOF) {
				table_carSector1 = `<td id="sector1of">${carSector1}</td>`;
				table_carSector1dec = `<td id="sector1of">${carSector1dec}</td>`;
			} else if (carSector1isPB) {
				table_carSector1 = `<td id="sector1pb">${carSector1}</td>`;
				table_carSector1dec = `<td id="sector1pb">${carSector1dec}</td>`;
			}

			if (carSector2isOF) {
				table_carSector2 = `<td id="sector2of">${carSector2}</td>`;
				table_carSector2dec = `<td id="sector2of">${carSector2dec}</td>`;
			} else if (carSector2isPB) {
				table_carSector2 = `<td id="sector2pb">${carSector2}</td>`;
				table_carSector2dec = `<td id="sector2pb">${carSector2dec}</td>`;
			}

			if (carSector3isOF) {
				table_carSector3 = `<td id="sector3of">${carSector3}</td>`;
				table_carSector3dec = `<td id="sector3of">${carSector3dec}</td>`;
			} else if (carSector3isPB) {
				table_carSector3 = `<td id="sector3pb">${carSector3}</td>`;
				table_carSector3dec = `<td id="sector3pb">${carSector3dec}</td>`;
			}

			// set speed colours for personal best and overall fastest
			if (carSector1speedisOF) {
				table_carSector1speed = `<td id="sector1speedof">${carSector1speed}</td>`;
			} else if (carSector1speedisPB) {
				table_carSector1speed = `<td id="sector1speedpb">${carSector1speed}</td>`;
			}

			if (carSector2speedisOF) {
				table_carSector2speed = `<td id="sector2speedof">${carSector2speed}</td>`;
			} else if (carSector2speedisPB) {
				table_carSector2speed = `<td id="sector2speedpb">${carSector2speed}</td>`;
			}

			if (carSector3speedisOF) {
				table_carSector3speed = `<td id="sector3speedof">${carSector3speed}</td>`;
			} else if (carSector3speedisPB) {
				table_carSector3speed = `<td id="sector3speedpb">${carSector3speed}</td>`;
			}

			if (carStatus === "PIT OUT" && pageSelected === "p4") {
				table_carNum = `<td id="carNumRed">${carNum}</td>`;
			}

			if (sessionType === "Practice") {
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

			if (sessionType === "Qualifying") {
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
			if (sessionType === "Race") {
				if (pageSelected === "mix") {
					document.getElementById("timing-table").innerHTML += `
				${table_carPos}
				${table_carNum}
				${table_carName}
				${table_carBestLapTime}
				${table_carLastLapTime}
				${table_carGap}
				${table_carInt}
				${table_carSector1}
				${table_carSector1speed}
				${table_carSector2}
				${table_carSector2speed}
				${table_carSector3}
				${table_carSector3speed}
				${table_carStatus}
				${table_PitCount}
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
				${table_PitCount}
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
				${table_PitCount}
				`;
				}
			}
		}

		if (sessionOfficialName == undefined) {
			sessionOfficialName = multiviewData.SessionInfo.Meeting.Name;
		}

		if (sessionTrackStatus == "AllClear") {
			document.getElementById(
				"flag-bar"
			).innerText = `${sessionOfficialName} - ${sessionType}`;
			document.getElementById("flag-bar").style.color =
				"rgba(255, 255, 255, 1)";
			document.getElementById("flag-bar").style.backgroundColor = "black";
			document.getElementById("flag-bar").style.width = "100%";
			document.getElementById("flag-bar").style.animation = "none";
		}
		if (sessionTrackStatus == "SCDeployed") {
			document.getElementById("flag-bar").innerText = "SC";
			document.getElementById("flag-bar").style.color = "rgba(0, 0, 0, 0)";
			document.getElementById("flag-bar").style.backgroundColor = "#f8ff2c";
			document.getElementById("flag-bar").style.animation =
				"blink normal 1.2s infinite ease-in-out";
		}
		if (sessionTrackStatus == "VSCDeployed") {
			document.getElementById("flag-bar").innerText = "SC";
			document.getElementById("flag-bar").style.color = "rgba(0, 0, 0, 0)";
			document.getElementById("flag-bar").style.backgroundColor = "#f8ff2c";
			document.getElementById("flag-bar").style.animation =
				"blink normal 1.2s infinite ease-in-out";
		}
		if (sessionTrackStatus == "Red") {
			document.getElementById("flag-bar").innerText = "RED";
			document.getElementById("flag-bar").style.color = "rgba(0, 0, 0, 0)";
			document.getElementById("flag-bar").style.backgroundColor = "red";
			document.getElementById("flag-bar").style.width = "100%";
			document.getElementById("flag-bar").style.animation = "none";
		}
	}
	// console.log(weatherData);
	raceControlMessagesData.Messages.reverse();
	for (
		var i = 0;
		i <
		(raceControlMessagesData.Messages.length < 12
			? raceControlMessagesData.Messages.length
			: 12);
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
	let trackAirTemp = weatherData.AirTemp;
	let trackHumidity = weatherData.Humidity;
	let trackPressure = weatherData.Pressure;
	let trackRainfall = weatherData.Rainfall;
	let trackTrackTemp = weatherData.TrackTemp;
	let trackWindDirection = weatherData.WindDirection;
	let trackWindSpeed = weatherData.WindSpeed;

	if (pageSelected === "p3") {
		document.getElementById(
			"trackWeatherData"
		).innerHTML = `<table id="weatherTable">
		<th id="weatherTableColA"></th><th id="weatherTableColB"></th>
		<tr id="trackTemp"><td>TRACK TEMP</td><td>${trackTrackTemp}</td></tr>
		<tr id="airTemp"><td>AIR TEMP</td><td>${trackAirTemp}</td></tr>
		<tr id="wetDry"><td>WET / DRY</td><td>${trackRainfall}</td></tr>
		<tr id="windSpeed"><td>WIND SPEED</td><td>${trackWindSpeed}</td></tr>
		<tr id="humidity"><td>HUMIDITY</td><td>${trackHumidity}</td></tr>
		<tr id="pressure"><td>PRESSURE</td><td>${trackPressure}</td></tr>
		</table>`;
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
	const sessionInfo = await sessionResponse.json();
	let trackOffset = sessionInfo.GmtOffset;
	let trackTimezone = getTrackTimezone(trackOffset);
	let systemTime = clockData.systemTime;
	let trackTime = clockData.trackTime;
	let now = Date.now();
	let trackTimeLiveRaw = (now -= systemTime -= trackTime);
	let isClockPaused = clockData.paused;

	let trackTimeLive = isClockPaused
		? new Date(trackTime).toLocaleTimeString("en-GB", {
				timeZone: trackTimezone,
		  })
		: new Date(trackTimeLiveRaw).toLocaleTimeString("en-GB", {
				timeZone: trackTimezone,
		  });
	document.getElementById("track-time").innerText = trackTimeLive;
	if (trackTimeLive === "Invalid Date") {
		document.getElementById("track-time").innerText = "00:00:00";
	}
}

async function getRemainingTime() {
	const clockResponse = await fetch(
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
	const clockData = await clockResponse.json();
	const ExtrapolatedClockResponse = await fetch(
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
	const exapolatedClockData = await ExtrapolatedClockResponse.json();
	const now = new Date();
	const paused = clockData.paused;
	const extrapolatedClockStart = new Date(exapolatedClockData.Utc);
	const extrapolatedTime = exapolatedClockData.Remaining;
	const systemTime = clockData.systemTime;
	const trackTime = clockData.trackTime;
	const extrapolating = exapolatedClockData.Extrapolating;
	const sessionDuration = parseTime(extrapolatedTime) + 1000;

	const timer = extrapolating
		? paused
			? getTime(sessionDuration - (trackTime - extrapolatedClockStart))
			: getTime(
					sessionDuration -
						(now - (systemTime - trackTime) - extrapolatedClockStart)
			  )
		: extrapolatedTime;
	document.getElementById("session-time").innerText = timer;

	return parseTime(timer);
}

function parseTime(time) {
	const [seconds, minutes, hours] = time
		.split(":")
		.reverse()
		.map((number) => parseInt(number));
	if (hours === undefined) return (minutes * 60 + seconds) * 1000;
	return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
function getTime(ms) {
	const date = new Date(ms);
	const hours = date.getUTCHours().toString().padStart(2, "0");
	const minutes = date.getUTCMinutes().toString().padStart(2, "0");
	const seconds = date.getUTCSeconds().toString().padStart(2, "0");
	if (parseInt(hours) === 0) {
		return `${hours}:${minutes}:${seconds}`;
	}
	return `${hours}:${minutes}:${seconds}`;
}

function getTrackTimezone(trackOffset) {
	switch (trackOffset) {
		case "-12:00:00":
			return "Etc/GMT+12";
		case "-11:00:00":
			return "Etc/GMT+11";
		case "-10:00:00":
			return "Etc/GMT+10";
		case "-09:00:00":
			return "Etc/GMT+9";
		case "-08:00:00":
			return "Etc/GMT+8";
		case "-07:00:00":
			return "Etc/GMT+7";
		case "-06:00:00":
			return "Etc/GMT+6";
		case "-05:00:00":
			return "Etc/GMT+5";
		case "-04:00:00":
			return "Etc/GMT+4";
		case "-03:00:00":
			return "Etc/GMT+3";
		case "-02:00:00":
			return "Etc/GMT+2";
		case "-01:00:00":
			return "Etc/GMT+1";
		case "00:00:00":
			return "Etc/GMT-0";
		case "01:00:00":
			return "Etc/GMT-1";
		case "02:00:00":
			return "Etc/GMT-2";
		case "03:00:00":
			return "Etc/GMT-3";
		case "04:00:00":
			return "Etc/GMT-4";
		case "05:00:00":
			return "Etc/GMT-5";
		case "06:00:00":
			return "Etc/GMT-6";
		case "07:00:00":
			return "Etc/GMT-7";
		case "08:00:00":
			return "Etc/GMT-8";
		case "09:00:00":
			return "Etc/GMT-9";
		case "10:00:00":
			return "Etc/GMT-10";
		case "11:00:00":
			return "Etc/GMT-11";
		case "12:00:00":
			return "Etc/GMT-12";
		case "13:00:00":
			return "Etc/GMT-13";
		case "14:00:00":
			return "Etc/GMT-14";
		default:
			// Handle the case where the trackOffset doesn't match any of the cases
			console.error("Invalid trackOffset value:", trackOffset);
			return null;
	}
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

getRemainingTime();
if (debug === false) {
	setInterval(getRemainingTime, 100);
}

getMultiviewData();
if (debug === false) {
	setInterval(getMultiviewData, 100);
}
getClock();
if (debug === false) {
	setInterval(getClock, 100);
}
