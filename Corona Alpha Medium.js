// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: vial;
// Corona Alpha v1.0.2 Medium - by unvsDev
// Full-fledged Covid-19 Information for Korea
// Learn more: https://github.com/unvsDev/corona-alpha

const dataURL = "https://apiv2.corona-live.com/stats.json"
const data = await new Request(dataURL).loadJSON()
const sourceURL = "https://corona-live.com"

const today = new Date()

const orgData = {
  region : 0,
  alert : 0,
  limit : 100,
  hour : 1
}

const regionsArr = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주']

const alertArr = ['끄기', '확진자 증가 알림', '매 시간마다 알림']

var resetmode = 0

let fm = FileManager.iCloud()
const prefPath = fm.joinPath(fm.documentsDirectory(), "coronaAlpha.txt")
const prevPath = fm.joinPath(fm.documentsDirectory(), "coronaData.txt")

if(!fm.fileExists(prefPath)){
  let alert = new Alert()
  alert.title = "환영합니다!"
  alert.message = "대한민국 코로나19 확진자 현황을\n위젯을 통해 직관적으로 보여주는\n코로나 알파에 오신 것을 환영합니다 💜\nDeveloped by unvsDev"
  alert.addAction("확인")
  await alert.present()
  fm.writeString(prefPath, JSON.stringify(orgData))
}

if(config.runsInApp) {
  var usrData = JSON.parse(fm.readString(prefPath))
  let menu = new UITable()
  menu.showSeparators = true
  
  const option1 = new UITableRow()
  option1.dismissOnSelect = false
  option1.addText("🇰🇷 라이브 지역 설정")
  menu.addRow(option1)
  
  option1.onSelect = async (number) => {
    let regionMenu = new UITable()
    regionMenu.showSeparators = true
    for(reg in regionsArr){
      const regOption = new UITableRow()
      regOption.dismissOnSelect = true
      regOption.addText(regionsArr[reg])
      regionMenu.addRow(regOption)
      
      regOption.onSelect = async (number) => {
        usrData["region"] = number
        let regAlert = new Alert()
        regAlert.title = "라이브 지역 설정"
        regAlert.message = "지역이 " + regionsArr[number] + "(으)로 설정되었습니다."
        regAlert.addAction("확인")
        await regAlert.present()
      }
    }
    await regionMenu.present(false)
  }
  
  const option2 = new UITableRow()
  option2.dismissOnSelect = false
  option2.addText("🤖 실시간 알림 설정")
  menu.addRow(option2)
  
  option2.onSelect = async () => {
    let alAlert = new Alert()
    alAlert.title = "실시간 알림"
    alAlert.message = "알림 여부를 선택해주세요.\n현재 설정값은 \"" + alertArr[usrData.alert] + "\" 입니다!"
    for(opt in alertArr){
      alAlert.addAction(alertArr[opt])
    }
    var choice = await alAlert.present()
    usrData.alert = choice
  }
  
  const option3 = new UITableRow()
  option3.dismissOnSelect = false
  option3.addText("📈 확진자 증가폭 설정 (알림)")
  menu.addRow(option3)
  
  option3.onSelect = async () => {
    if(usrData.alert == 1){
      let limAlert = new Alert()
      limAlert.title = "증가폭 설정"
      limAlert.message = "알림을 수신할 최소 증가폭을 설정하세요.\n효율적인 수신은 100~200명을 추천합니다.\n현재 설정값은 \"" + usrData.limit.toString() + "명\" 입니다!"
      
      limAlert.addTextField("증가폭 입력", usrData["limit"].toString())
      limAlert.addAction("확인")
      limAlert.addCancelAction("취소")
      if(await limAlert.present() != -1){
        usrData.limit = parseInt(limAlert.textFieldValue())
      }
    } else {
      let limAlert = new Alert()
      limAlert.title = "음.. 🤔"
      limAlert.message = "증가폭 알림만 설정 가능한 옵션입니다."
      limAlert.addAction("확인")
      await limAlert.present()
    }
  }
  
  const option4 = new UITableRow()
  option4.dismissOnSelect = false
  option4.addText("⏰ 고정 시간 간격 설정 (알림)")
  menu.addRow(option4)
  
  option4.onSelect = async () => {
    if(usrData.alert == 2){
      let hrAlert = new Alert()
      hrAlert.title = "시간 간격 설정"
      hrAlert.message = "알림을 수신할 시간 간격(시간)을 설정하세요.\n효율적인 수신은 1시간을 추천합니다.\n현재 설정값은 \"" + usrData.hour.toString() + "시간\" 입니다!"
      
      hrAlert.addTextField("시간 간격 입력", usrData["hour"].toString())
      
      hrAlert.addAction("확인")
      hrAlert.addCancelAction("취소")
      if(await hrAlert.present() != -1){
        usrData.hour = parseInt(hrAlert.textFieldValue())
      }
    } else {
      let hrAlert = new Alert()
      hrAlert.title = "음.. 🤔"
      hrAlert.message = "매시간 알림만 설정 가능한 옵션입니다."
      hrAlert.addAction("확인")
      await hrAlert.present()
    }
  }
  
  const option5 = new UITableRow()
  option5.dismissOnSelect = true
  option5.addText("🔥 데이터 초기화")
  menu.addRow(option5)
  
  option5.onSelect = async () => {
    resetmode = 1
    let resetAlert = new Alert()
    resetAlert.title = "정말요..? 😭"
    resetAlert.message = "타노스가 데이터를 대신 삭제해주기 때문에, 절대 되돌릴 수 없어요! 정말 초기화하시겠어요?"
    resetAlert.addDestructiveAction("초기화")
    resetAlert.addCancelAction("취소")
    
    if(await resetAlert.present() != -1){
      fm.remove(prefPath)
      if(fm.fileExists(prevPath)){
        fm.remove(prevPath)
      }
    }
  }
  
  const option6 = new UITableRow()
  option6.dismissOnSelect = false
  option6.addText("🎄 Github")
  menu.addRow(option6)
  
  option6.onSelect = () => {
    Safari.openInApp("https://github.com/unvsDev/corona-alpha", false)
  }
  
  await menu.present(false)
  
  fm.writeString(prefPath, JSON.stringify(usrData))
}

if(resetmode){ return 0 }

var aftData = JSON.parse(fm.readString(prefPath))

// Getting Data
let overview = data["overview"]
let regionData = data["current"][aftData.region.toString()]["cases"]

var currentCnt = overview["current"][0]
var currentGap = overview["current"][1]
var totalCnt = overview["confirmed"][0]
var totalGap = overview["confirmed"][1]
var regionCnt = regionData[0]
var regionGap = regionData[1]

const incColor = new Color("#ff3800")
const decColor = new Color("#32d9cb")

function getGapStr(number) {
  var result = new String("코로나19에 맞서 열심히 싸워주시는 의료진분들께 진심으로 감사드립니다 👍") // Easter Egg!
  if(number == 0) {
    return result = "0"
  } else if(number > 0) {
    return result = "+" + addComma(number)
  } else {
    return result = addComma(number)
  }
}

function getGapColor(number) {
  if(number <= 0) {
    return decColor
  } else {
    return incColor
  }
}

async function writeCovidReport() {
  await fm.writeString(prevPath, JSON.stringify({"date":today.getDate(), "hour":today.getHours(), "confirmed":currentCnt}))
  console.log("[*] 로그 저장이 완료되었습니다!")
}

async function sendNotification(title, message){
  let noti = new Notification()
  noti.title = title
  noti.body = message
  await noti.schedule()
}

if(aftData.alert == 1){ // 확진자 증가폭 알림
  if(!fm.fileExists(prevPath)){
    await writeCovidReport()
    await sendNotification("확진자 증가폭 알림", "이전 데이터가 없어 최초 1회는 알림이 오지 않습니다.")
  } else {
    var prevData = JSON.parse(fm.readString(prevPath))
    var diff = currentCnt - prevData.confirmed
    if(today.getDate() != prevData.date){
      await sendNotification("코로나19 어제 확진자 최소 " + prevData.confirmed + "명", "손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎")
      await fm.writeString(prevPath, JSON.stringify({"date":today.getDate(), "hour":today.getHours(), "confirmed":0}))
    } else if((diff >= aftData.limit) && (9 <= today.getHours()) && (today.getHours() <= 23)) {
      await sendNotification("코로나19 확진자 +" + diff + "명", "현재까지 총 확진자는 " + currentCnt + "명입니다.\n손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎")
      await writeCovidReport()
    }
  }
}

if(aftData.alert == 2){ // 매시간 확진자 알림
  if(!fm.fileExists(prevPath)){
    await writeCovidReport()
    await sendNotification("매시간 확진자 알림", "이전 데이터가 없어 최초 1회는 알림이 오지 않습니다.")
  } else {
    var prevData = JSON.parse(fm.readString(prevPath))
    var lastDate = prevData.date
    var lastHour = prevData.hour
    if(today.getDate() != lastDate){
      await sendNotification("코로나19 어제 확진자 최소 " + prevData.confirmed + "명", "손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎")
      await fm.writeString(prevPath, JSON.stringify({"date":today.getDate(), "hour":today.getHours(), "confirmed":0}))
    }else if(((today.getHours() - lastHour) >= aftData.hour) && (9 <= today.getHours()) && (today.getHours() <= 23)){
      var diff = currentCnt - prevData.confirmed
      await sendNotification("코로나19 " + today.getHours() + "시 기준 +" + diff + "명", "현재까지 총 확진자는 " + currentCnt + "명입니다.\n손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎")
      await writeCovidReport()
    }
  }
}

// Widget Layout
let cwidget = new ListWidget()

let title = cwidget.addText("CORONA ALPHA")
title.textColor = new Color("#fff")
title.font = Font.blackMonospacedSystemFont(8)

cwidget.addSpacer(5)

let cStack1 = cwidget.addStack()
cStack1.layoutHorizontally()
cStack1.centerAlignContent()

let inStack1 = cStack1.addStack()
inStack1.layoutHorizontally()
inStack1.centerAlignContent()

let liveTitle = inStack1.addText("라이브")
liveTitle.textColor = new Color("#fff")
liveTitle.font = Font.blackMonospacedSystemFont(13)

inStack1.addSpacer(6)

let liveCompare = inStack1.addText(getGapStr(currentGap))
liveCompare.textColor = getGapColor(currentGap)
liveCompare.font = Font.boldMonospacedSystemFont(11)

cStack1.addSpacer()

let liveLabel = cStack1.addText(addComma(currentCnt))
liveLabel.textColor = new Color("#fff")
liveLabel.font = Font.boldMonospacedSystemFont(27)

let cStack2 = cwidget.addStack()
cStack2.layoutHorizontally()
cStack2.centerAlignContent()

let inStack2 = cStack2.addStack()
inStack2.layoutHorizontally()
inStack2.centerAlignContent()

let localTitle = inStack2.addText(regionsArr[aftData.region])
localTitle.textColor = new Color("#fff")
localTitle.font = Font.blackMonospacedSystemFont(13)

inStack2.addSpacer(6)

let localCompare = inStack2.addText(getGapStr(regionGap))
localCompare.textColor = getGapColor(regionGap)
localCompare.font = Font.boldMonospacedSystemFont(11)

cStack2.addSpacer()

let localLabel = cStack2.addText(addComma(regionCnt))
localLabel.textColor = new Color("#fff")
localLabel.font = Font.boldMonospacedSystemFont(27)

let cStack3 = cwidget.addStack()
cStack3.layoutHorizontally()
cStack3.centerAlignContent()

let inStack3 = cStack3.addStack()
inStack3.layoutHorizontally()
inStack3.centerAlignContent()

let totalTitle = inStack3.addText("총합")
totalTitle.textColor = new Color("#fff")
totalTitle.font = Font.blackMonospacedSystemFont(13)

inStack3.addSpacer(6)

let totalCompare = inStack3.addText(getGapStr(totalGap))
totalCompare.textColor = getGapColor(totalGap)
totalCompare.font = Font.boldMonospacedSystemFont(11)

cStack3.addSpacer()

let totalLabel = cStack3.addText(addComma(totalCnt))
totalLabel.textColor = new Color("#fff")
totalLabel.font = Font.boldMonospacedSystemFont(27)

cwidget.addSpacer(5)

function formatTime(date) {
    let df = new DateFormatter()
    df.useNoDateStyle()
    df.useShortTimeStyle()
    return df.string(date)
}

let updateLabel = cwidget.addText("업데이트: " + formatTime(today))
updateLabel.textColor = new Color("#fff")
updateLabel.font = Font.systemFont(8)
updateLabel.textOpacity = 0.7

function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

cwidget.refreshAfterDate = new Date(Date.now() + 1000 * 90) // Refresh every 90 Second

cwidget.url = sourceURL
cwidget.setPadding(12, 12, 12, 12)
cwidget.backgroundColor = new Color("#333")
cwidget.presentMedium()
Script.complete()
