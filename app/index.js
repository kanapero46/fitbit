import clock from "clock";
let document = require("document");
import { me } from "appbit";
import { preferences } from "user-settings";
import * as untils from "../common/until";

//充電
import { battery } from "power";


//心拍数
import { HeartRateSensor } from "heart-rate";
var hrm = new HeartRateSensor();

//権限
if (me.permissions.granted("access_heart_rate")) {
  let hrm = new HeartRateSensor();
  hrm.start();
}

clock.granularity = "seconds"; // seconds, minutes, hours

//ラベル宣言
let hLabel = document.getElementById("myClockH");
let mLabel = document.getElementById("myClockM");
let hrtLabel = document.getElementById("heartRate");
//console.log(document.getElementById("myClock"));
let bat = document.getElementById("Battery");
let arc1 = document.getElementById("s1m");
let arc2 = document.getElementById("s2m");
let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");

//スリープ用
let shourHand = document.getElementById("hour");
let sminHand = document.getElementById("min");

let screen1 = document.getElementById("offsleep");
let screen2 = document.getElementById("onsleep");

var latestmins;
var boolSleepFlag = 0　　　　　　　　　　　　　//スリープしているかどうかのフラグ
var boolSleepSettingFlag = 0; //スリープ状態セットフラグ
const SLEEP_TIMER = 20;

//初期化処理
init();

//1秒ごとに処理
clock.ontick = (evt) => {
  let hours = evt.date.getHours();
  let mins = evt.date.getMinutes();
  let secs = evt.date.getSeconds();

//日付  
   let d = evt.date.getDate();
  console.log(`${d}`);

  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    //そのまま
  }
  
  console.log(`${secs}`);
  CheckSleepMode(`${hours}`,`${secs}`);
  
  //バッテリー状態
  battery.onchange = function()
 {
    console.log(Math.floor(battery.chargeLevel) + "%");
    bat.text = (Math.floor(battery.chargeLevel) );
    arc2.sweepAngle = (ConvBattery(Math.floor(battery.chargeLevel)));
 }
  
  console.log(`${hours}:${mins}:${secs}`);
  if(boolSleepFlag == 0){
      updateClock("normal");
  }
  else if(boolSleepFlag == 1){
      updateClock("dark");
  }
  
  hLabel.text = (ConvTimeFormat(`${hours}`));
  mLabel.text = (ConvTimeFormat(`${mins}`)); //00表示
  
}

//アナログ時計の処理コピー

console.log(document.getElementById("hours"));

let secHand = document.getElementById("secs");

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

//////////////////////
hrm.onreading = function()
{
  console.log(hrm.heartRate);
  hrtLabel.text = (hrm.heartRate);
  //arc1.sweepAngle = (hrm.heartRate);
}
hrm.start();

//////////////////////

//初回起動時の処理
function init()
{
  
}

// Rotate the hands every tick
function updateClock(status) {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  if(status == "normal"){
    hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
    minHand.groupTransform.rotate.angle = minutesToAngle(mins);
    secHand.groupTransform.rotate.angle = secondsToAngle(secs);
  }
  else
  {
    shourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
    sminHand.groupTransform.rotate.angle = minutesToAngle(mins);
  }
}


// 1→01に変換関数
function ConvTimeFormat(time)
{
  return ("00" + time).slice(-2); //00でreturn  
}

//100→360に変換
function ConvBattery(battery){ return (battery*3.6); }

//日付(31)→360に変換(だいたい)
function ConvDate(date){ return (date/31)*3.6; }

function CheckSleepMode(hours, sec)
{

 　　if(boolSleepFlag == 1) {
     console.log("CheckSleepMode return0");
     return　(0); //sleep中・sleep設定後のためそのまま
   } 
  if(latestmins == sec){
    console.log("■EconomyModeOn");
    ChangeDarkMode(hours);
    return(1);
  }
  if(boolSleepSettingFlag == 1){
    return(0);
  }
  
  latestmins = parseInt(sec) + parseInt(SLEEP_TIMER);
  boolSleepSettingFlag = 1;　　　//設定完了を通知する。
   console.log("■" + latestmins);
  if(latestmins > 60)
  {
    latestmins = latestmins - 60;    //60秒以上の場合は-60にする。
  }  
  console.log("SetTimer" + latestmins);
}

//時針・分針のみ表示
function ChangeDarkMode(hours)
{
  //TODO：すべてのfillをブラックに
  console.log("func");
//  var context = hourHand.getContext("2d");
  screen1.style.display = "none";
  screen2.style.display = "inline";
  boolSleepFlag = 1;
  updateClock("dark");
}

function ChangeNormalMode()
{
  hours.groupFill = "#FFFFFF";
  mins.fill = "e0e0e0";
boolSleepFlag = 0;
screen1.style.display = "inline";
screen2.style.display = "none";
}

