var debug = false;

const url = 'http://127.0.0.1:10101/api/v2/live-timing/state/TrackStatus,ExtrapolatedClock,TimingData';

async function getTimingData(){
    const response = await fetch (url,
        {   mode: 'cors',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
          } );
    console.log('Grabbing Timing Data')
    const timingData = await response.json();
    if (debug === true){
        console.log(timingData);
    }

    //Display 2 hour timer
    var sessionTimeRemaining = timingData.ExtrapolatedClock.Remaining;
    document.getElementById('race-time').innerText = sessionTimeRemaining;

    //Display SC/VSC and Red flags
    var trackStatus = timingData.TrackStatus.Message;
    if (trackStatus === 'AllClear'){
        document.getElementById("foot-flag").innerText = "";
        document.getElementById("foot-flag").style.backgroundColor = '';
    }if(trackStatus === 'Red'){
        document.getElementById("foot-flag").innerText = "";
        document.getElementById("foot-flag").style.backgroundColor = '#c80000';
        document.getElementById("foot-flag").style.animation = 'blink normal 1.2s infinite ease-in-out';
    }if(trackStatus === "SCDeployed"){
        document.getElementById("foot-flag").innerText = "";
        document.getElementById("foot-flag").style.backgroundColor = '#f8ff2c';
        document.getElementById("foot-flag").style.animation = 'blink normal 1.2s infinite ease-in-out';
    }if(trackStatus === "VSCDeployed"){
        document.getElementById("foot-flag").innerText = "";
        document.getElementById("foot-flag").style.backgroundColor = '#f8ff2c';
        document.getElementById("foot-flag").style.animation = 'blink normal 1.2s infinite ease-in-out';
    }

    //Allows sector times to have 2 decimals without rounding down
    Number.prototype.toFixedNoRounding = function(n) {
        try{
        const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
        const a = this.toString().match(reg)[0];
        const dot = a.indexOf(".");
        if (dot === -1) { // integer, insert decimal dot and pad up zeros
            return a + "." + "0".repeat(n);
        }
        const b = n - (a.length - dot) + 1;
        return b > 0 ? (a + "0".repeat(b)) : a;}
        catch(err){
        
        }
     }
    //Display positions
    var pos1_pos = '1';
    var pos1_carnum = timingData.TimingData.Lines[1].RacingNumber;
    var pos1_name = 'M. VERSTAPPEN';
    var pos1_gap = timingData.TimingData.Lines[1].GapToLeader;
    var pos1_int = '';
    var pos1_lastlap = timingData.TimingData.Lines[1].LastLapTime.Value;
    var pos1_lastlap_isFL = timingData.TimingData.Lines[1].LastLapTime.OverallFastest;
    var pos1_lastlap_isPB = timingData.TimingData.Lines[1].LastLapTime.PersonalFastest;
    var pos1_status = '';
    var pos1_s1 = timingData.TimingData.Lines[1].Sectors[0].Value;
    var pos1_s1_flt = parseFloat(pos1_s1);
    var pos1_s1_dec = pos1_s1_flt.toFixedNoRounding(1);
    var pos1_s1_fast = timingData.TimingData.Lines[1].Sectors[0].OverallFastest;
    var pos1_s1_pb = timingData.TimingData.Lines[1].Sectors[0].PersonalFastest;   
    var pos1_s2 = timingData.TimingData.Lines[1].Sectors[1].Value;
    var pos1_s2_flt = parseFloat(pos1_s2);
    var pos1_s2_dec = pos1_s2_flt.toFixedNoRounding(1);
    var pos1_s2_fast = timingData.TimingData.Lines[1].Sectors[1].OverallFastest;    
    var pos1_s2_pb = timingData.TimingData.Lines[1].Sectors[1].PersonalFastest;
    var pos1_s3 = timingData.TimingData.Lines[1].Sectors[2].Value;
    var pos1_s3_flt = parseFloat(pos1_s3);
    var pos1_s3_dec = pos1_s3_flt.toFixedNoRounding(1);
    var pos1_s3_fast = timingData.TimingData.Lines[1].Sectors[2].OverallFastest;    
    var pos1_s3_pb = timingData.TimingData.Lines[1].Sectors[2].PersonalFastest;  
    var pos1_pit = timingData.TimingData.Lines[1].NumberOfPitStops;
     
    document.getElementById('position-Data').innerHTML = `
    <td id="tab-pos">${pos1_pos}</td>
    <td id="tab-carnum">${pos1_carnum}</td>
    <td id="tab-name">${pos1_name}</td>
    <td id="tab-p1-gap" colspan="2">${pos1_gap}</td>
    <td id="tab-lastlap">${pos1_lastlap}</td>
    <td id="tab-status">${pos1_status}</td>
    <td id="tab-s1">${pos1_s1_dec}</td>
    <td id="tab-s2">${pos1_s2_dec}</td>
    <td id="tab-s3">${pos1_s3_dec}</td>
    <td id="tab-pit">${pos1_pit}</td>`;

    //Hide sector time if there is no sector time.
    if (pos1_s1_dec === undefined){
        document.getElementById('tab-s1').style.visibility = 'hidden';
    }
    if (pos1_s2_dec === undefined){
        document.getElementById('tab-s2').style.visibility = 'hidden';
    }
    if (pos1_s3_dec === undefined){
        document.getElementById('tab-s3').style.visibility = 'hidden';
    }

    //Hide pit counter if driver has not pitted
    if (pos1_pit === undefined){
        document.getElementById('tab-pit').style.visibility = 'hidden';   
    }
    if (pos1_s1_fast === true){
        document.getElementById('tab-s1').style.color = '#d24ae0';
    }
    if ((pos1_s1_pb === true) && (pos1_s1_fast === false)){
        document.getElementById('tab-s1').style.color = '#f8ff2c';
    }
    if (pos1_s2_fast === true ){
        document.getElementById('tab-s2').style.color = '#d24ae0';
    }
    if ((pos1_s2_pb === true) && (pos1_s2_fast === false)){
        document.getElementById('tab-s2').style.color = '#f8ff2c';
    }
    if (pos1_s3_fast === true ){
        document.getElementById('tab-s3').style.color = '#d24ae0';
    }
    if ((pos1_s3_pb === true) && (pos1_s3_fast = false)){
        document.getElementById('tab-s3').style.color = "#f8ff2c";
    }
    if (pos1_lastlap_isFL === true){
        document.getElementById('tab-lastlap').style.color = '#d24ae0';
    }
    if ((pos1_lastlap_isFL === false) && (pos1_lastlap_isPB === true)){document.getElementById('tab-lastlap').style.color = '#f8ff2c';}
}



getTimingData();
if (debug === false){setInterval(getTimingData, 500)
}