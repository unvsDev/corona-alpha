// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: asterisk;
// Corona Alpha v1.5 - by unvsDev (Minseo Kang)
// Full-fledged Covid-19 Information for Korea
// Learn more: https://github.com/unvsDev/corona-alpha

// 아이클라우드 동기화 문제가 발생할 경우, 데이터 초기화 후 로컬 저장소에 데이터를 저장하세요.

// 본 위젯은 코로나 라이브의 API를 이용해 정보를 수집합니다. 이는 민간이 취합한 집계가 일부 포함되어 있으므로 본 위젯의 정보를 공식적인 근거 자료로 활용하는 것은 부적절할 수 있습니다. 또한 본 위젯의 정보를 이용하거나 공유해 문제가 발생할 시 해당 책임은 전적으로 사용자에게 있음을 알려드립니다.

// 코로나 알파 위젯은 외부로의 무단 재배포 및 재공유가 엄격히 금지되어 있습니다. 위젯은 공식 깃허브를 통해 공유하실 수 있습니다.
// Unauthorized Redistribution is strictly prohibited. Please report abuse at my Discord.

// Do not edit this area
const dataURL = "https://apiv2.corona-live.com/stats.json"
const data = await new Request(dataURL).loadJSON()
const key = "https://gist.github.com/unvsDev/7c1a65545bdf5ef869db4b3764574195/raw/532fa49460a9b59234d3a40983a77231a9a8dc75/Key"
const sourceURL = "https://corona-live.com"
const version = 150

const today = new Date()

const orgData = {
  region : 0,
  gu : -1,
  guname : "재설정 필요",
  alert : 0,
  limit : 100,
  hour : 1,
  link : "live",
  total : "total",
  wall : "",
  walldark : "",
  hidereg : 0
}

const regionsArr = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주']

const regionsArrEn = ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Gwangju', 'Daejeon', 'Ulsan', 'Sejong', 'Gyeonggi', 'Gangwon', 'Chungbuk', 'Chungnam', 'Gyeongbuk', 'Gyeongnam', 'Jeonbuk', 'Jeonnam', 'Jeju']

const alertArr = ['끄기', '확진자 증가 알림', '매 시간마다 알림']

const alertArrEn = ['Turn off', 'Alert by cases growth width', 'Alert by several hours']

var resetmode = 0

let tempFm = FileManager.local()
let tempPath = tempFm.joinPath(tempFm.documentsDirectory(), "calphaConfig.txt")

if(!tempFm.fileExists(tempPath)){
  if(config.runsInWidget){
    let errorWidget = new ListWidget()
    let title = errorWidget.addText("앱 내에서 위젯을 실행해 주세요.\nPlease run the widget in the app.")
    title.font = Font.boldMonospacedSystemFont(16)
    errorWidget.backgroundColor = new Color("#4661a3")
    Script.setWidget(errorWidget)
    return 0
  }
  var dataPath = ""
  var language = ""
  
  var alert = new Alert()
  alert.title = "Select Language"
  alert.message = "It will be displayed in the widget."
  alert.addAction("한국어 - Korean")
  alert.addAction("영어 - English")
  alert.addCancelAction("Cancel")
  var response = await alert.present()
  if(response == -1) { return 0 }
  else if(response == 0){
    language = "ko"
  } else {
    language = "en"
  }
  
  var alert = new Alert()
  alert.title = language == "ko" ? "위젯 데이터 저장 경로를 선택하세요" : "Select widget data source"
  alert.message = language == "ko" ? "iCloud에 저장하는 것을 추천드립니다. iCloud가 비활성화되어 있거나 여러 기기에서 액세스하는 데 어려움이 있을 경우, 데이터를 로컬에 저장하세요." : "We recommend you to select iCloud. if you're using this widget in multi devices and having trouble to access the widget, select Local Storage."
  alert.addAction(language == "ko" ? "iCloud Drive에 저장 (추천)" : "iCloud Drive(Recommended)")
  alert.addAction(language == "ko" ? "로컬에 저장" : "Local Storage")
  alert.addCancelAction(language == "ko" ? "취소" : "Cancel")
  var response = await alert.present()
  if(response == -1) { return 0 }
  else if(response == 0){
    dataPath = "icloud"
  } else {
    dataPath = "local"
  }
  
  tempFm.writeString(tempPath, language + "," + dataPath)
}

var configData = tempFm.readString(tempPath)
var dataPath = configData.split(",")[1]
var language = configData.split(",")[0]
var alertActivator = configData.split(",")[2]

if(alertActivator != "OK"){
  try{
    await sendNotification("Corona Alpha", "알림 기능이 활성화되었습니다!")
    tempFm.writeString(tempPath, language + "," + dataPath + ",OK")
  }catch(e){
    let errorWidget = new ListWidget()
    let title = errorWidget.addText("설정에서 알림을 활성화한 뒤 다시 시도해 주세요.\nPlease activate alert in settings.")
    title.font = Font.boldMonospacedSystemFont(16)
    errorWidget.backgroundColor = new Color("#4661a3")
    Script.setWidget(errorWidget)
    
    if(config.runsInApp){
      let alert = new Alert()
      alert.title = language == "ko" ? "오류" : "Error"
      alert.message = language == "ko" ? "설정에서 알림을 활성화한 뒤 다시 시도해 주세요." : "Please activate alert in settings."
      alert.addAction(language == "ko" ? "확인" : "OK")
      await alert.present()
    }
    return 0
  }
}

var fm
if(dataPath = "icloud"){
  fm = FileManager.iCloud()
} else {
  fm = FileManager.local()
}

const prefPath = fm.joinPath(fm.documentsDirectory(), "coronaAlpha.txt")
const prevPath = fm.joinPath(fm.documentsDirectory(), "coronaData.txt")

if(!fm.fileExists(prefPath)){
  let alert = new Alert()
  alert.title = language == "ko" ? "환영합니다!" : "Welcome!"
  alert.message = language == "ko" ? "대한민국 코로나19 확진자 현황을\n위젯을 통해 직관적으로 보여주는\n코로나 알파에 오신 것을 환영합니다 💜\nDeveloped by unvsDev (Minseo Kang)" : "This widget shows the status of Covid-19 in South Korea with rich detail. Developed by unvsDev!"
  alert.addAction(language == "ko" ? "확인" : "OK")
  await alert.present()
  fm.writeString(prefPath, JSON.stringify(orgData))
}

if(dataPath == "icloud" && fm.fileExists(prefPath)){
  fm.downloadFileFromiCloud(prefPath)
}

if(config.runsInApp) {
  const annServer = "https://github.com/unvsDev/corona-alpha/raw/main/Announcement.txt"
  let annPath = fm.joinPath(fm.documentsDirectory(), "annVer.txt")
  var curAnn = fm.fileExists(annPath) ? fm.readString(annPath) : 0
  if(version != parseInt(curAnn)){
    await Safari.openInApp(annServer, true)
    await fm.writeString(annPath, version.toString())
  }
  
  var usrData = JSON.parse(fm.readString(prefPath))
  
  // Auto Update Preferences
  var cnt = 0
  for(i in orgData){
    if(usrData[i] == undefined){
      cnt = cnt + 1
      usrData[i] = orgData[i]
      console.log("[!] Updating Preferences... (" + cnt + ")")
    }
  }
  
  let menu = new UITable()
  menu.showSeparators = true
  
  const title = new UITableRow()
  title.dismissOnSelect = false
  title.addText("Corona Alpha v1.5", language == "ko" ? "대한민국 1등 iOS 코로나 위젯! (누르면 공지사항 표시)" : "Developed by unvsDev")
  menu.addRow(title)
  
  title.onSelect = () => {
    Safari.openInApp(annServer, true)
  }
  
  const option1 = new UITableRow()
  option1.dismissOnSelect = false
  option1.addText(language == "ko" ? "🇰🇷 라이브 지역 설정" : "🇰🇷 Select Local Area")
  menu.addRow(option1)
  
  option1.onSelect = async (number) => {
    var guJSON = await new Request("https://github.com/unvsDev/corona-alpha/raw/main/guData.json").loadJSON()
    var guSupport = guJSON.support
    
    let regionMenu = new UITable()
    regionMenu.showSeparators = true
    
    var finalRegionArr = language == "ko" ? regionsArr : regionsArrEn
    for(reg in finalRegionArr){
      const regOption = new UITableRow()
      regOption.dismissOnSelect = true
      regOption.addText(finalRegionArr[reg])
      regionMenu.addRow(regOption)
      
      regOption.onSelect = async (number) => {
        var isSearchGu = false
        
        if(guSupport.indexOf(number) != -1 && language == "ko"){
          let guAlert = new Alert()
          guAlert.title = "지역 범위 설정(BETA)"
          guAlert.message = "해당하는 지역에서는 더 좁은 범위에서 코로나 확진자를 확인할 수 있습니다! 위젯에 나타낼 지역의 범위를 설정해주세요."
          guAlert.addAction(finalRegionArr[number] + " 전체로 설정")
          guAlert.addAction("우리 동네로 설정")
          let guResponse = await guAlert.present()
          if(guResponse == 1){ isSearchGu = true }
        }
        
        if(isSearchGu == false){
          usrData["region"] = number
          usrData["gu"] = -1
          let regAlert = new Alert()
          regAlert.title = language == "ko" ? "라이브 지역 설정" : "Local Area set"
          regAlert.message = language == "ko" ? "지역이 " + finalRegionArr[number] + "(으)로 설정되었습니다." : "Your local area has set to " + finalRegionArr[number] + "."
          regAlert.addAction(language == "ko" ? "확인" : "OK")
          await regAlert.present()
        } else {
          var guList = guJSON[number]
          
          let guMenu = new UITable()
          guMenu.showSeparators = true
        
          for(gu in guList){
            const guOption = new UITableRow()
            guOption.dismissOnSelect = true
            guOption.addText(guList[gu])
            guMenu.addRow(guOption)
            
            guOption.onSelect = async (gu) => {
              usrData["region"] = number
              usrData["gu"] = gu
              usrData["guname"] = guList[gu]
              
              let guSetAlert = new Alert()
              guSetAlert.title = "라이브 지역 설정"
              guSetAlert.message = "지역이 " + regionsArr[number] + " " + guList[gu] + "(으)로 설정되었습니다."
              guSetAlert.addAction("확인")
              await guSetAlert.present()
            }
          }
          
          await guMenu.present()
        }
      }
    }
    await regionMenu.present(false)
  }
  
  const option2 = new UITableRow()
  option2.dismissOnSelect = false
  option2.addText(language == "ko" ? "🤖 실시간 알림 설정" : "🤖 Set Live Alert")
  menu.addRow(option2)
  
  option2.onSelect = async () => {
    const FinalAlertArr = language == "ko" ? alertArr : alertArrEn
    
    let alAlert = new Alert()
    alAlert.title = language == "ko" ? "실시간 알림" : "Live Alert"
    alAlert.message = language == "ko" ? "알림 여부를 선택해주세요.\n현재 설정값은 \"" + FinalAlertArr[usrData.alert] + "\" 입니다!" : "Select whether to be notified for Covid-19 confirmed cases. Currently set to \"" + FinalAlertArr[usrData.alert] + "\"."
    for(opt in FinalAlertArr){
      alAlert.addAction(FinalAlertArr[opt])
    }
    var choice = await alAlert.present()
    usrData.alert = choice
  }
  
  const option3 = new UITableRow()
  option3.dismissOnSelect = false
  option3.addText(language == "ko" ? "📈 확진자 증가폭 설정 (알림)" : "📈 Minimum growth width of Confirmed cases", language != "ko" ? "For Live Alert" : null)
  menu.addRow(option3)
  
  option3.onSelect = async () => {
    if(usrData.alert == 1){
      let limAlert = new Alert()
      limAlert.title = language == "ko" ? "증가폭 설정" : "Minimum growth width"
      limAlert.message = language == "ko" ? "알림을 수신할 최소 증가폭을 설정하세요.\n효율적인 수신은 100~200명을 추천합니다.\n현재 설정값은 \"" + usrData.limit.toString() + "명\" 입니다!" : "Set the minimum growth width of confirmed cases of Covid-19 for receiving your live alert. It is recommended to set it to 100 people.\nCurrently set to " + usrData.limit.toString() + " people."
      
      limAlert.addTextField(language == "ko" ? "증가폭 입력" : "(number)", usrData["limit"].toString())
      limAlert.addAction(language == "ko" ? "확인" : "OK")
      limAlert.addCancelAction(language == "ko" ? "취소" : "Cancel")
      if(await limAlert.present() != -1){
        usrData.limit = parseInt(limAlert.textFieldValue())
      }
    } else {
      let limAlert = new Alert()
      limAlert.title = language == "ko" ? "음.. 🤔" : "Unable to edit"
      limAlert.message = language == "ko" ? "증가폭 알림만 설정 가능한 옵션입니다." : "You can modify this option if you are receiving live alert."
      limAlert.addAction(language == "ko" ? "확인" : "OK")
      await limAlert.present()
    }
  }
  
  const option4 = new UITableRow()
  option4.dismissOnSelect = false
  option4.addText(language == "ko" ? "⏰ 고정 시간 간격 설정 (알림)" : "⏰ Minimum hour width", language != "ko" ? "For Live Alert" : null)
  menu.addRow(option4)
  
  option4.onSelect = async () => {
    if(usrData.alert == 2){
      let hrAlert = new Alert()
      hrAlert.title = language == "ko" ? "시간 간격 설정" : "Minimum hour width"
      hrAlert.message = language == "ko" ? "알림을 수신할 시간 간격(시간)을 설정하세요.\n효율적인 수신은 1시간을 추천합니다.\n현재 설정값은 \"" + usrData.hour.toString() + "시간\" 입니다!" : "Set the minimum hour width for receiving your live alert. It is recommended to set it to 1 hour.\nCurrently set to " + usrData.hour.toString() + " hour(s)."
      
      hrAlert.addTextField(language == "ko" ? "시간 간격 입력" : "(number)", usrData["hour"].toString())
      
      hrAlert.addAction(language == "ko" ? "확인" : "OK")
      hrAlert.addCancelAction(language == "ko" ? "취소" : "Cancel")
      if(await hrAlert.present() != -1){
        usrData.hour = parseInt(hrAlert.textFieldValue())
      }
    } else {
      let hrAlert = new Alert()
      hrAlert.title = language == "ko" ? "음.. 🤔" : "Unable to edit"
      hrAlert.message = language == "ko" ? "매시간 알림만 설정 가능한 옵션입니다." : "You can modify this option if you are receiving live alert."
      hrAlert.addAction(language == "ko" ? "확인" : "OK")
      await hrAlert.present()
    }
  }
  
  const option5 = new UITableRow()
  option5.dismissOnSelect = false
  option5.addText(language == "ko" ? "🦋 총합 표시 기준 설정" : "🦋 Total Cases Filter")
  menu.addRow(option5)
  
  option5.onSelect = async () => {
    var menu1 = language == "ko" ? "전체 총합 표시" : "All time"
    var menu2 = language == "ko" ? "어제 총합만 표시" : "Yesterday total"  
    var menu3 = "검역 확진자 표시"
    var currentTot
    if(usrData.total == "total") { currentTot = menu1 }
    else if(usrData.total == "prev") { currentTot = menu2 }
    else if(usrData.total == "quar") { currentTot = menu3 }
    let totAlert = new Alert()
    totAlert.title = language == "ko" ? "총합 표시 기준 설정" : "Total Cases Filter"
    totAlert.message = language == "ko" ? "확진자 총합을 표시할 기준을 선택하세요.\n현재 설정값은 \"" + currentTot + "\"입니다.\n이 옵션은 작은 크기의 위젯에만 적용됩니다." : "Set filter for counting total confirmed cases.\nCurrently set to " + currentTot + ".\nThis option only works for small size of the widget."
    totAlert.addAction(menu1)
    totAlert.addAction(menu2)
    if(language == "ko"){ totAlert.addAction(menu3) }
    totAlert.addCancelAction(language == "ko" ? "취소" : "Cancel")
    
    let response = await totAlert.present()
    
    if(response == 0){ usrData.total = "total" }
    else if(response == 1){ usrData.total = "prev" }
    else if(response == 2){ usrData.total = "quar" }
  }
  
  const option6 = new UITableRow()
  option6.dismissOnSelect = false
  option6.addText(language == "ko" ? "🔗 위젯 바로가기 설정" : "🔗 Set Widget Shortcut")
  menu.addRow(option6)
  
  option6.onSelect = async () => {
    var menu1 = language == "ko" ? "코로나 라이브 사이트" : "Corona Live Website"
    var menu2 = language == "ko" ? "네이버 QR 체크인" : "Naver QR Check-In"
    var menu3 = language == "ko" ? "카카오 QR 체크인" : "Kakao QR Check-In"
    var currentLink
    if(usrData.link == "live") { currentLink = menu1 }
    else if(usrData.link == "naver") { currentLink = menu2 }
    else if(usrData.link == "kakao") { currentLink = menu3 }
    let shortcutAlert = new Alert()
    shortcutAlert.title = language == "ko" ? "위젯 바로가기 설정" : "Set widget shortcut"
    shortcutAlert.message = language == "ko" ? "위젯을 클릭했을 때 원하는 링크로 빠르게 이동할 수 있습니다.\n현재 설정값은 \"" + currentLink + "\"입니다." : "Tap widget in home screen to surf through Covid-19 Services for South Korea. Currently set to \"" + currentLink + "\"."
    shortcutAlert.addAction(menu1)
    shortcutAlert.addAction(menu2)
    shortcutAlert.addAction(menu3)
    shortcutAlert.addCancelAction(language == "ko" ? "취소" : "Cancel")
    
    let response = await shortcutAlert.present()
    
    if(response == 0){ usrData.link = "live" }
    else if(response == 1){ usrData.link = "naver" }
    else if(response == 2){ usrData.link = "kakao" }
  }
  
  const wallOption = new UITableRow()
  wallOption.dismissOnSelect = false
  wallOption.addText(language == "ko" ? "🎨 위젯 배경 설정하기" : "🎨 Set Widget Wallpaper")
  menu.addRow(wallOption)
  
  wallOption.onSelect = async () => {
    var alert = new Alert()
    alert.title = language == "ko" ? "배경화면 설정하기" : "Set wallpaper"
    alert.message = language == "ko" ? "적용할 배경화면의 File Bookmark 이름을 입력하세요. 빈칸으로 저장할 시 기본 색상을 불러옵니다." : "Type File Bookmark name of your wallpaper. Leave it blank to set it as default."
    alert.addTextField("기본 파일 북마크 이름", usrData.wall)
    alert.addTextField("다크모드 파일 북마크 이름(선택)", usrData.walldark)
    alert.addAction(language == "ko" ? "완료" : "OK")
    alert.addCancelAction(language == "ko" ? "취소" : "Cancel")
    var response = await alert.present()
    if(response != -1){
      usrData.wall = alert.textFieldValue(0)
      usrData.walldark = alert.textFieldValue(1)
    }
  }
  
  if(language == "ko"){
    const hideOption = new UITableRow()
    hideOption.dismissOnSelect = false
    hideOption.addText("📸 위젯 표시 지역명 숨기기")
    menu.addRow(hideOption)
    
    hideOption.onSelect = async () => {
      var menu1 = "그대로 표시하기"
      var menu2 = "\"내 지역\"으로 표시"
      var menu3 = "\"스위트홈\"으로 표시"
      var currentHide
      if(usrData.hidereg == 0) { currentHide = menu1 }
      else if(usrData.hidereg == "내 지역") { currentHide = menu2 }
      else if(usrData.hidereg == "스위트홈") { currentHide = menu3 }
      let hideAlert = new Alert()
      hideAlert.title = "위젯 표시 지역명 설정"
      hideAlert.message = "타인에게 개인정보를 표시하지 않기 위해서는, 위젯에 표시되는 지역명을 변경할 수 있습니다.\n현재 설정값은 \"" + currentHide + "\"입니다."
      hideAlert.addAction(menu1)
      hideAlert.addAction(menu2)
      hideAlert.addAction(menu3)
      hideAlert.addCancelAction("취소")
      
      let response = await hideAlert.present()
      
      if(response == 0){ usrData.hidereg = 0 }
      else if(response == 1){ usrData.hidereg = "내 지역" }
      else if(response == 2){ usrData.hidereg = "스위트홈" }
    }
  }
  
  const option7 = new UITableRow()
  option7.dismissOnSelect = true
  option7.addText(language == "ko" ? "🔥 데이터 초기화" : "🔥 Erase all data")
  menu.addRow(option7)
  
  option7.onSelect = async () => {
    resetmode = 1
    let resetAlert = new Alert()
    resetAlert.title = language == "ko" ? "정말요..? 😭" : "Erase confirmation"
    resetAlert.message = language == "ko" ? "타노스가 데이터를 대신 삭제해주기 때문에, 절대 되돌릴 수 없어요! 정말 초기화하시겠어요?" : "Are you sure you want to delete all data and restore to default? This action cannot be undone."
    resetAlert.addDestructiveAction(language == "ko" ? "초기화" : "Erase All")
    resetAlert.addCancelAction(language == "ko" ? "취소" : "Cancel")
    
    if(await resetAlert.present() != -1){
      fm.remove(prefPath)
      if(fm.fileExists(prevPath)){
        fm.remove(prevPath)
      }
      tempFm.remove(tempPath)
    }
  }
  
  const option8 = new UITableRow()
  option8.dismissOnSelect = false
  option8.addText("🎄 Github")
  menu.addRow(option8)
  
  option8.onSelect = () => {
    Safari.openInApp("https://github.com/unvsDev/corona-alpha", false)
  }
  
  const option9 = new UITableRow()
  option9.dismissOnSelect = false
  option9.addText("🙌 Scriptable Lab", language == "ko" ? "더 많은 위젯을 알아보고, 개발자와 소통하실 수 있습니다." : "For contacting developer, or asking questions!")
  menu.addRow(option9)
  
  option9.onSelect = () => {
    Safari.openInApp("https://discord.gg/BCP2S7BdaC", false)
  }
  
  if(language == "ko"){
    const dkey = await new Request("https://github.com/unvsDev/key/raw/main/Kakaopay").loadString()
    const durl = "https://qr.kakaopay.com/"

    const optionSecret = new UITableRow()
    optionSecret.dismissOnSelect = false
    optionSecret.addText("💵 카카오페이로 후원하기", "위젯 개발에 도움을 주실 수 있습니다!")
    menu.addRow(optionSecret)
    
    optionSecret.onSelect = async () => {
      var alert = new Alert()
      alert.title = "잠깐! 계속하기 전 확인하세요."
      alert.message = "후원해주셔서 감사합니다. 코로나 알파를 원본이 아닌 다른 제공처에서 설치했을 경우에는 링크가 손상되었을 수 있으므로 꼭 공식 버전을 설치해주세요!"
      alert.addAction("후원 링크로 이동하기")
      alert.addCancelAction("취소")
      var response = await alert.present()
      if(response != -1){
        const final = await new Request(key).loadString()
        Safari.openInApp(final, false)
      }
    }
  }
  
  await menu.present(false)
  
  fm.writeString(prefPath, JSON.stringify(usrData))
}

if(resetmode){ return 0 }

async function sendNotification(title, message){
  let noti = new Notification()
  noti.title = title
  noti.body = message
  await noti.schedule()
}

// Script Auto Update
const uServer = "https://github.com/unvsDev/corona-alpha/raw/main/VERSION"
const cServer = "https://github.com/unvsDev/corona-alpha/raw/main/Corona%20Alpha.js"
var minVer = parseInt(await new Request(uServer).loadString())
if(version < minVer){
  var code = await new Request(cServer).loadString()
  await sendNotification("Corona Alpha", language == "ko" ? "위젯을 업데이트하는 중입니다.. 변경사항을 적용하려면 앱을 재시작하세요." : "Updating widget.. Please launch the app again.")
  fm.writeString(fm.joinPath(fm.documentsDirectory(), Script.name() + ".js"), code)
  return 0
}

var aprPath = fm.joinPath(fm.documentsDirectory(), "coronaApr.txt")
var darkMode
// Preparing Device Appearance
if(config.runsInApp){
  darkMode = Device.isUsingDarkAppearance()
  // darkMode = !(Color.dynamic(Color.white(),Color.black()).red)
  fm.writeString(aprPath, (darkMode == true ? 1 : 0).toString())
} else if(!fm.fileExists(aprPath)){
  darkMode = 0 // 임시 지정
} else {
  darkMode = parseInt(fm.readString(aprPath))
}

var aftData = JSON.parse(fm.readString(prefPath))
var aftRegCode = aftData.region
var aftGuCode = aftData.gu

// Getting Data
let overview = data["overview"]
let regionData = data["current"][aftRegCode.toString()]["cases"]

// Gu Data
var guData
var guName = aftData.guname
var isShowGu = false
if(aftGuCode != -1){
  isShowGu = true
  guData = data["current"][aftRegCode]["gu"][aftGuCode]
}

// Quarantine Data
var quarData
var quarCnt
var quarGap
if(aftData.total == "quar"){
  quarData = data["overall"][17]["cases"]
  quarCnt = quarData[0]
  quarGap = quarData[1]
}

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
  console.log(language == "ko" ? "[*] 로그 저장이 완료되었습니다!" : "[*] Log saved.")
}

if(aftData.alert == 1){ // 확진자 증가폭 알림
  if(!fm.fileExists(prevPath)){
    await writeCovidReport()
    await sendNotification(language == "ko" ? "확진자 증가폭 알림" : "Live Alert", language == "ko" ? "이전 데이터가 없어 최초 1회는 알림이 오지 않습니다." : "Service started. You will be able to receive alert from the next time.")
  } else {
    if(dataPath == "icloud"){
      fm.downloadFileFromiCloud(prevPath)
    }
    var prevData = JSON.parse(fm.readString(prevPath))
    var diff = currentCnt - prevData.confirmed
    if(today.getDate() != prevData.date){
      await sendNotification(language == "ko" ? "코로나19 어제 확진자 최소 " + prevData.confirmed + "명" : "Predicted confirmed cases: from " + prevData.confirmed + " people", language == "ko" ? "손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎" : "Please keep social distancing and Stay healthy!")
      await fm.writeString(prevPath, JSON.stringify({"date":today.getDate(), "hour":today.getHours(), "confirmed":0}))
    } else if((diff >= aftData.limit) && (9 <= today.getHours()) && (today.getHours() <= 23)) {
      await sendNotification(language == "ko" ? "코로나19 확진자 +" + diff + "명" : "Covid-19 Live Cases: +" + diff + " people", language == "ko" ? "현재까지 총 확진자는 " + currentCnt + "명입니다.\n손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎" : "Today's total cases are " + currentCnt + " people up to now. Please keep social distancing and Stay healthy!")
      await writeCovidReport()
    }
  }
}

if(aftData.alert == 2){ // 매시간 확진자 알림
  if(!fm.fileExists(prevPath)){
    await writeCovidReport()
    await sendNotification(language == "ko" ? "매 시간 확진자 알림" : "Live Alert", language == "ko" ? "이전 데이터가 없어 최초 1회는 알림이 오지 않습니다." : "Service started. You will be able to receive alert from the next time.")
  } else {
    if(dataPath == "icloud"){
      fm.downloadFileFromiCloud(prevPath)
    }
    var prevData = JSON.parse(fm.readString(prevPath))
    var lastDate = prevData.date
    var lastHour = prevData.hour
    if(today.getDate() != lastDate){
      await sendNotification(language == "ko" ? "코로나19 어제 확진자 최소 " + prevData.confirmed + "명" : "Predicted confirmed cases: from " + prevData.confirmed + " people", language == "ko" ? "손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎" : "Please keep social distancing and Stay healthy!")
      await fm.writeString(prevPath, JSON.stringify({"date":today.getDate(), "hour":today.getHours(), "confirmed":0}))
    }else if(((today.getHours() - lastHour) >= aftData.hour) && (9 <= today.getHours()) && (today.getHours() <= 23)){
      var diff = currentCnt - prevData.confirmed
      await sendNotification(language == "ko" ? "코로나19 " + today.getHours() + "시 기준 +" + diff + "명" : "Covid-19 Live Cases: +" + diff + " people", language == "ko" ? "현재까지 총 확진자는 " + currentCnt + "명입니다.\n손씻기 생활화, 어디서든 마스크 착용을 통해 코로나를 이겨내요! 😎" : "Today's total cases are " + currentCnt + " people up to now. Please keep social distancing and Stay healthy!")
      await writeCovidReport()
    }
  }
}

function formatTime(date) {
  let df = new DateFormatter()
  df.useNoDateStyle()
  df.useShortTimeStyle()
  return df.string(date)
}

var previewSize = ""

if(config.runsInApp){
  let prevAlert = new Alert()
  prevAlert.title = language == "ko" ? "위젯 미리보기 선택" : "Widget Preview"
  prevAlert.addAction(language == "ko" ? "작은 크기" : "Small")
  prevAlert.addAction(language == "ko" ? "중간 크기" : "Medium")
  prevAlert.addCancelAction(language == "ko" ? "취소" : "Cancel")
  var prevMode = await prevAlert.present()
  
  if(prevMode == 0){ previewSize = "small" }
  else if(prevMode == 1){ previewSize = "medium" }
  else{ return 0 }
} else if(config.widgetFamily == "small"){
  previewSize = "small"
} else if(config.widgetFamily == "medium"){
  previewSize = "medium"
} else {
  let errorWidget = new ListWidget()
  let title = errorWidget.addText("큰 크기의 위젯은 지원하지 않습니다.\nThis widget doesn't support big size.")
  title.font = Font.boldMonospacedSystemFont(16)
  errorWidget.backgroundColor = new Color("#4661a3")
  Script.setWidget(errorWidget)
  return 0
}

// Widget Layout
let cwidget = new ListWidget()

if(previewSize == "small"){
  let title = cwidget.addText("CORONA ALPHA")
  title.textColor = new Color("#fff")
  title.font = Font.blackMonospacedSystemFont(8)
  
  cwidget.addSpacer(5)
  
  let cStack1 = cwidget.addStack()
  cStack1.layoutHorizontally()
  cStack1.centerAlignContent()
  
  let inStack1 = cStack1.addStack()
  inStack1.layoutVertically()
  inStack1.centerAlignContent()
  
  let liveTitle = inStack1.addText(language == "ko" ? "라이브" : "Live")
  liveTitle.textColor = new Color("#fff")
  liveTitle.font = Font.blackMonospacedSystemFont(10)
  
  let liveCompare = inStack1.addText(getGapStr(currentGap))
  liveCompare.textColor = getGapColor(currentGap)
  liveCompare.font = Font.boldMonospacedSystemFont(8)
  
  cStack1.addSpacer()
  
  let liveLabel = cStack1.addText(addComma(currentCnt))
  liveLabel.textColor = new Color("#fff")
  liveLabel.font = Font.lightMonospacedSystemFont(26)
  
  let cStack2 = cwidget.addStack()
  cStack2.layoutHorizontally()
  cStack2.centerAlignContent()
  
  let inStack2 = cStack2.addStack()
  inStack2.layoutVertically()
  inStack2.centerAlignContent()
  
  let localTitle = inStack2.addText(aftData.hidereg ? aftData.hidereg : (isShowGu ? (guName) : (language == "ko" ? regionsArr[aftRegCode] : regionsArrEn[aftRegCode])))
  localTitle.textColor = new Color("#fff")
  localTitle.font = Font.blackMonospacedSystemFont(10)
  
  let localCompare = inStack2.addText(isShowGu ? getGapStr(guData[1]) : getGapStr(regionGap))
  localCompare.textColor = isShowGu ? getGapColor(guData[1]) : getGapColor(regionGap)
  localCompare.font = Font.boldMonospacedSystemFont(8)
  
  cStack2.addSpacer()
  
  let localLabel = cStack2.addText(isShowGu ? addComma(guData[0]) : addComma(regionCnt))
  localLabel.textColor = new Color("#fff")
  localLabel.font = Font.lightMonospacedSystemFont(26)
  
  let cStack3 = cwidget.addStack()
  cStack3.layoutHorizontally()
  cStack3.centerAlignContent()
  
  if(aftData.total == "total"){
    let inStack3 = cStack3.addStack()
    inStack3.layoutVertically()
    inStack3.centerAlignContent()
    
    let totalTitle = inStack3.addText(language == "ko" ? "총합" : "Total")
    totalTitle.textColor = new Color("#fff")
    totalTitle.font = Font.blackMonospacedSystemFont(10)
    
    let totalCompare = inStack3.addText(getGapStr(totalGap))
    totalCompare.textColor = getGapColor(totalGap)
    totalCompare.font = Font.boldMonospacedSystemFont(8)
    
    cStack3.addSpacer()
    
    let totalLabel = cStack3.addText(addComma(totalCnt))
    totalLabel.textColor = new Color("#fff")
    totalLabel.font = Font.lightMonospacedSystemFont(26)
  } else if(aftData.total == "prev"){
    let totalTitle = cStack3.addText(language == "ko" ? "어제" : "Prev")
    totalTitle.textColor = new Color("#fff")
    totalTitle.font = Font.blackMonospacedSystemFont(10)
    
    cStack3.addSpacer()
    
    let totalLabel = cStack3.addText(addComma(totalGap))
    totalLabel.textColor = new Color("#fff")
    totalLabel.font = Font.lightMonospacedSystemFont(26)
  } else if(aftData.total == "quar"){
    let inStack3 = cStack3.addStack()
    inStack3.layoutVertically()
    inStack3.centerAlignContent()
    
    let totalTitle = inStack3.addText("검역")
    totalTitle.textColor = new Color("#fff")
    totalTitle.font = Font.blackMonospacedSystemFont(10)
    
    let totalCompare = inStack3.addText(getGapStr(quarGap))
    totalCompare.textColor = getGapColor(quarGap)
    totalCompare.font = Font.boldMonospacedSystemFont(8)
    
    cStack3.addSpacer()
    
    let totalLabel = cStack3.addText(addComma(quarCnt))
    totalLabel.textColor = new Color("#fff")
    totalLabel.font = Font.lightMonospacedSystemFont(26)
  }
  
  cwidget.addSpacer(6)
  
  let updateLabel = cwidget.addText(language == "ko" ? "업데이트: " + formatTime(today) : "Updated: " + formatTime(today))
  updateLabel.textColor = new Color("#fff")
  updateLabel.font = Font.systemFont(8)
  updateLabel.textOpacity = 0.7
  
} else if(previewSize == "medium"){
  cwidget.addSpacer(2)
  
  let topStack = cwidget.addStack()
  topStack.layoutHorizontally()
  
  let title = topStack.addText("CORONA ALPHA")
  title.textColor = new Color("#fff")
  title.font = Font.blackMonospacedSystemFont(8)
  
  topStack.addSpacer()
  
  let updateLabel = topStack.addText(language == "ko" ? "업데이트: " + formatTime(today) : "Updated: " + formatTime(today))
  updateLabel.textColor = new Color("#fff")
  updateLabel.font = Font.systemFont(8)
  updateLabel.textOpacity = 0.7
  
  cwidget.addSpacer(20)
  
  let mainStack = cwidget.addStack()
  mainStack.layoutHorizontally()
  
  let liveStack = mainStack.addStack()
  liveStack.layoutVertically()
  
  let inStack1 = liveStack.addStack()
  inStack1.layoutHorizontally()
  
  inStack1.addSpacer()
  
  let liveTitle = inStack1.addText(language == "ko" ? "라이브" : "Live")
  liveTitle.textColor = new Color("#fff")
  liveTitle.font = Font.blackMonospacedSystemFont(12)
  
  inStack1.addSpacer()
  
  let inStack4 = liveStack.addStack()
  inStack4.layoutHorizontally()
  
  inStack4.addSpacer()
  
  let liveLabel = inStack4.addText(addComma(currentCnt))
  liveLabel.textColor = new Color("#fff")
  liveLabel.font = Font.ultraLightMonospacedSystemFont(45)
  
  inStack4.addSpacer()
  
  let inStack7 = liveStack.addStack()
  inStack7.layoutHorizontally()
  
  inStack7.addSpacer()
  
  let liveCompare = inStack7.addText(getGapStr(currentGap))
  liveCompare.textColor = getGapColor(currentGap)
  liveCompare.font = Font.lightMonospacedSystemFont(12)
  liveCompare.centerAlignText()
  
  inStack7.addSpacer()
  
  let localStack = mainStack.addStack()
  localStack.layoutVertically()
  
  let inStack2 = localStack.addStack()
  inStack2.layoutHorizontally()
  
  inStack2.addSpacer()
  
  let localTitle = inStack2.addText(aftData.hidereg ? aftData.hidereg : (isShowGu ? (guName) : (language == "ko" ? regionsArr[aftRegCode] : regionsArrEn[aftRegCode])))
  localTitle.textColor = new Color("#fff")
  localTitle.font = Font.blackMonospacedSystemFont(12)
  
  inStack2.addSpacer()
  
  let inStack5 = localStack.addStack()
  inStack5.layoutHorizontally()
  
  inStack5.addSpacer()
  
  let localLabel = inStack5.addText(isShowGu ? addComma(guData[0]) : addComma(regionCnt))
  localLabel.textColor = new Color("#fff")
  localLabel.font = Font.ultraLightMonospacedSystemFont(45)
  
  inStack5.addSpacer()
  
  let inStack8 = localStack.addStack()
  inStack8.layoutHorizontally()
  
  inStack8.addSpacer()
  
  let localCompare = inStack8.addText(isShowGu ? getGapStr(guData[1]) : getGapStr(regionGap))
  localCompare.textColor = isShowGu ? getGapColor(guData[1]) : getGapColor(regionGap)
  localCompare.font = Font.lightMonospacedSystemFont(12)
  
  inStack8.addSpacer()
  
  let totalStack = mainStack.addStack()
  totalStack.layoutVertically()
  
  let inStack3 = totalStack.addStack()
  inStack3.layoutHorizontally()
  
  inStack3.addSpacer()
  
  let totalTitle = inStack3.addText(language == "ko" ? "어제" : "Prev")
  totalTitle.textColor = new Color("#fff")
  totalTitle.font = Font.blackMonospacedSystemFont(12)
  
  inStack3.addSpacer()
  
  let inStack6 = totalStack.addStack()
  inStack6.layoutHorizontally()
  
  inStack6.addSpacer()
  
  let totalLabel = inStack6.addText(addComma(totalGap))
  totalLabel.textColor = new Color("#fff")
  totalLabel.font = Font.ultraLightMonospacedSystemFont(45)
  
  inStack6.addSpacer()
  
  let inStack9 = totalStack.addStack()
  inStack9.layoutHorizontally()
  
  inStack9.addSpacer()
  
  let totalCompare = inStack9.addText(addComma(totalCnt))
  totalCompare.textColor = new Color("#639cd4")
  totalCompare.font = Font.lightMonospacedSystemFont(12)
    
  inStack9.addSpacer()
  
  cwidget.addSpacer()
}

function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

cwidget.refreshAfterDate = new Date(Date.now() + 1000 * 120) // Refresh every 120 Second

if(aftData.link == "live") { cwidget.url = "https://corona-live.com" }
else if(aftData.link == "naver") { cwidget.url = "https://nid.naver.com/login/privacyQR" }
else if(aftData.link == "kakao") { cwidget.url = "kakaotalk://con/web?url=https://accounts.kakao.com/qr_check_in" }
cwidget.setPadding(12, 12, 12, 12)
if(aftData.wall == ""){
  cwidget.backgroundColor = new Color("#333")
} else {
  if(darkMode){
    try{
      cwidget.backgroundImage = fm.readImage(fm.bookmarkedPath(aftData.walldark))
    }catch(e){
      cwidget.backgroundImage = fm.readImage(fm.bookmarkedPath(aftData.wall))
    }
  } else {
    cwidget.backgroundImage = fm.readImage(fm.bookmarkedPath(aftData.wall))
  }
}

if(previewSize == "small"){ cwidget.presentSmall() }
else if(previewSize == "medium"){ cwidget.presentMedium() }
Script.complete()
