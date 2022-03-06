// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: chart-bar;
// Corona Alpha - developed by unvsDev
// 위젯 파일 및 제공되는 코드의 무단 재배포, 공유 및 판매는 엄격히 금지됩니다.


const version = "4.0"

const subWidth = 140
// Medium 위젯에서 우측 블럭의 너비
const layoutPadding = [11, 11, 11, 11]
// 레이아웃 여백 - Top, Bottom, Left(leading), Right(trailing)


let fm = FileManager.local()
let mainPath = fm.documentsDirectory()
let prefPath = `${mainPath}/alpha-pref.json`

let prefs = {
  "lang": 0,
  "region": 0,
  "pass": "naver",
}

const source = "https://raw.githubusercontent.com/unvsDev/corona-alpha/main/Corona%20Alpha.js"

const serv = "https://raw.githubusercontent.com/unvsDev/corona-alpha/main/service.json"

async function isDeviceOnline(){
  const wv = new WebView()
  await wv.loadURL('about:blank')
  let js = "navigator.onLine"
  let r = await wv.evaluateJavaScript(js)
  return r
}

async function checkUpdate(){
  let service = await new Request(serv).loadJSON()
  
  if(service.version != version){
    let code = await new Request(source).loadString()
    let fm = FileManager.iCloud()
    
    await fm.writeString(`${fm.documentsDirectory()}/${Script.name()}.js`, code)
    
    if(config.runsInApp){ Safari.open(URLScheme.forRunningScript()) }
    return 1
  }
  
  return 0
}

let checkedFlag = false
if(await isDeviceOnline()){
  if(await checkUpdate()){ return 0 }
  checkedFlag = true
}

const regionArr = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주']
const regionArrEn = ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Gwangju', 'Daejeon', 'Ulsan', 'Sejong', 'Gyeonggi', 'Gangwon', 'Chungbuk', 'Chungnam', 'Gyeongbuk', 'Gyeongnam', 'Jeonbuk', 'Jeonnam', 'Jeju']

const passArr = {
  "naver": ["네이버", "naversearchapp://opennadot?cardId=QRCheckIn"],
  "toss": ["토스", "supertoss://qr-checkin?referrer=widget"],
  "kakaotalk": ["카카오톡", "kakaotalk://qrcheckin?callingPkg=TalkWidgetExtension"],
  "naver-ext": ["네이버 (Web)", "https://nid.naver.com/login/privacyQR"],
  "coov": ["COOV 앱", "coov://"]
}


function refreshPref(){
  if(fm.fileExists(prefPath)){
    let prev = JSON.parse(fm.readString(prefPath))
    for(index in prev){
      prefs[index] = prev[index]
    }
  }
}

function savePref(){
  fm.writeString(prefPath, JSON.stringify(prefs))
}

async function showTable(){
  refreshPref()
  
  let table = new UITable()
  table.showSeparators = true
  
  function loadTable(){
    let row1 = new UITableRow()
    row1.height = 70
    row1.dismissOnSelect = false
    
    let option1 = ["Korean", "English"]
    let text1 = row1.addText(`🌏 Language: ${option1[prefs.lang]}`, "This property only affects widget.")
    text1.titleFont = Font.boldSystemFont(15)
    text1.subtitleFont = Font.systemFont(14)
    
    table.addRow(row1)
    
    row1.onSelect = async () => {
      let alert = new Alert()
      alert.addAction("Korean")
      alert.addAction("English")
      alert.addCancelAction("Cancel")
      let r = await alert.presentSheet()
      if(r != -1){ prefs.lang = r }
      refreshTable()
    }
    
    let row2 = new UITableRow()
    row2.height = 70
    row2.dismissOnSelect = false
    
    let text2 = row2.addText(`📲 폰트 프로파일 설치`, "위젯에는 스포카 한 산스가 적용되어 있습니다.")
    text2.titleFont = Font.boldSystemFont(15)
    text2.subtitleFont = Font.systemFont(14)
    
    table.addRow(row2)
    
    row2.onSelect = () => {
      Safari.openInApp("https://www.scriptable-kr.app/ifp", false)
    }
    
    let row3 = new UITableRow()
    row3.height = 70
    row3.dismissOnSelect = false
    
    let text3 = row3.addText(`📍 지역 데이터: ${`${regionArr[prefs.region]} ${regionArrEn[prefs.region]}`}`, "중형 위젯에서 지역 데이터를 확인할 수 있습니다.")
    
    text3.titleFont = Font.boldSystemFont(15)
    text3.subtitleFont = Font.systemFont(14)
    
    table.addRow(row3)
    
    row3.onSelect = async () => {
      let opt = new UITable()
      opt.showSeparators = true
      
      for(index in regionArr){
        let bt = new UITableRow()
        bt.height = 55
        
        let text = bt.addText(`${regionArr[index]} ${regionArrEn[index]}`)
        text.titleFont = Font.boldSystemFont(15)
        
        opt.addRow(bt)
        
        bt.onSelect = (number) => {
          prefs.region = number
        }
      }
      
      await opt.present()
      refreshTable()
    }
    
    let row4 = new UITableRow()
    row4.height = 70
    row4.dismissOnSelect = false
    
    let text4 = row4.addText(`🔗 연결 앱: ${passArr[prefs.pass][0]}`, "위젯에서 빠르게 방역 패스에 접근할 수 있습니다.")
    
    text4.titleFont = Font.boldSystemFont(15)
    text4.subtitleFont = Font.systemFont(14)
    
    table.addRow(row4)
    
    row4.onSelect = async () => {
      let opt = new UITable()
      opt.showSeparators = true
      
      for(index in passArr){
        let bt = new UITableRow()
        bt.height = 55
        
        let text = bt.addText(`${passArr[index][0]}`)
        text.titleFont = Font.boldSystemFont(15)
        
        opt.addRow(bt)
        
        bt.onSelect = (number) => {
          prefs.pass = Object.keys(passArr)[number]
        }
      }
      
      await opt.present()
      refreshTable()
    }
    
    let row5 = new UITableRow()
    row5.height = 70
    
    let text5 = row5.addText(`위젯 버전: ${version}`, checkedFlag ? "최신 버전입니다." : null)
    text5.titleFont = Font.boldSystemFont(15)
    text5.subtitleFont = Font.systemFont(14)
    
    table.addRow(row5)
  }
  
  function refreshTable(){
    table.removeAllRows()
    loadTable()
    table.reload()
  }
  
  loadTable()
  await table.present()
  
  savePref()
}


if(config.runsInApp){
  await showTable()
}

refreshPref()


const useEnglishUI = prefs.lang

const loadRegionData = true
const dataRegion = prefs.region

const dataPass = prefs.pass


const fontBold = (fontSize) => {
  return new Font("Spoqa Han Sans Neo Bold", fontSize)
}

const fontMedium = (fontSize) => {
  return new Font("Spoqa Han Sans Neo Medium", fontSize)
}

const fontLight = (fontSize) => {
  return new Font("Spoqa Han Sans Neo Light", fontSize)
}

let dataTime = new Date().getTime()
let dataUrl = "https://apiv3.corona-live.com"

async function loadData(reqUrl, dataPath){
  let target
  let path = `${mainPath}/ca-${dataPath}.json`
  
  try{
    let req = new Request(reqUrl)
    req.timeoutInterval = 5
    target = await req.loadJSON()
    
    target.timestamp = dataTime
    
    fm.writeString(path, JSON.stringify(target))
  } catch(e){
    if(fm.fileExists(path)){
      target = JSON.parse(fm.readString(path))
    } else {
      throw new Error("데이터를 불러오는 중 문제가 발생했습니다.")
    }
  }
  
  return target
}

let liveDom = await loadData(`${dataUrl}/domestic/live.json?timestamp=${dataTime}`, "livedom")

let statDom = await loadData(`${dataUrl}/domestic/stat.json?timestamp=${dataTime}`, "statdom")

let liveLoc; let statLoc;

const gapLayout = (value, target, fixedColor) => {
  let selectedColor = fixedColor ? fixedColor : (value > 0 ? "EB5374" : "5673EB")
  
  let bx1 = target.addStack()
  bx1.centerAlignContent()
  bx1.setPadding(0,4,0,4)
  bx1.cornerRadius = 7

  bx1.backgroundColor = new Color(selectedColor, 0.2)

  let gapTx = bx1.addText(value ? `${value > 0 ? "+" : ""}${value.toLocaleString()}` : "-")
  gapTx.font = fontMedium(12)
  gapTx.textColor = new Color(selectedColor)
}

const addGapBlock = (string, value, target) => {
  let stgap = target.addStack()
  stgap.centerAlignContent()

  let stDescTx = stgap.addText(string)
  stDescTx.font = fontMedium(11)
  stDescTx.textColor = new Color("ffffff", 0.8)

  stgap.addSpacer(5)

  gapLayout(value, stgap)
}

const UIdsOrigin = {
  "ds01": ["실시간", "New cases"],
  "ds02": ["명", ""],
  "ds04": ["집계 중", "No Data"],
  "ds11": ["vs 어제", "vs 1Day"],
  "ds12": ["vs 1주전", "vs 1Week"],
  "ds13": ["어제 총합", "Prev 1D"],
  "ds05": ["확진자", "Confirmed"],
  "ds15": ["확진자", "Total"],
  "ds20": ["방역 패스", "QR Check-in"],
  "ds30": ["어제 입원환자", "Inpatient 1D"],
  "ds31": ["어제 위중증자", "ICU Prev 1D"],
}

let UIDataSet = {}
let lcode = useEnglishUI ? 1 : 0
for(ds in UIdsOrigin){
  UIDataSet[ds] = UIdsOrigin[ds][lcode]
}

function loadWidget(){
  let widget = new ListWidget()
  
  let df = new DateFormatter()
  df.locale = useEnglishUI ? "en" : "ko-kr"
  df.useShortTimeStyle()
  
  let titleText = widget.addText(`${UIDataSet.ds01} | ${df.string(new Date(liveDom.timestamp))}`)
  titleText.font = fontMedium(11)
  titleText.textColor = new Color("ffffff")
  titleText.centerAlignText()
  
  widget.addSpacer(2.5)
  
  let liveStack = widget.addStack()
  liveStack.layoutHorizontally()
  liveStack.centerAlignContent()
  
  liveStack.addSpacer()
  
  let liveConfirmed = liveStack.addText(liveDom.live.today.toLocaleString())
  liveConfirmed.font = fontBold(23)
  liveConfirmed.textColor = new Color("ffffff")
  
  let liveUnit = liveStack.addText(UIDataSet.ds02)
  liveUnit.font = fontMedium(17)
  liveUnit.textColor = new Color("ffffff")
  
  liveStack.addSpacer()
  
  widget.addSpacer(5)
  
  // 어제 총합
  let confirmed1 = statDom.overview.confirmed[1]
  
  // 동시간대 차이
  let yesterdayGap = liveDom.live.today - liveDom.live.yesterday
  let weekGap = liveDom.live.today - liveDom.live.weekAgo
  
  function addRow(title, message){
  
  let stack = widget.addStack()
  stack.layoutHorizontally()
  stack.centerAlignContent()
  stack.setPadding(0,11,0,11)
  
  let titleText = stack.addText(title)
  titleText.font = fontMedium(11)
  titleText.textColor = new Color("ffffff", 0.8)
  
  stack.addSpacer()
  
  let messageText = stack.addText(message)
  messageText.font = fontBold(12)
  messageText.textColor = new Color("ffffff")
  
  }
  
  addRow(UIDataSet.ds13, confirmed1 ? `${confirmed1.toLocaleString()}${UIDataSet.ds02}` : UIDataSet.ds04)

  widget.addSpacer(10)
  
  let st1 = widget.addStack()
  st1.setPadding(0,11,0,0)
  
  addGapBlock(UIDataSet.ds11, yesterdayGap, st1)
  
  widget.addSpacer(4)
  
  let st2 = widget.addStack()
  st2.setPadding(0,11,0,0)
  
  addGapBlock(UIDataSet.ds12, weekGap, st2)
  
  
  widget.backgroundColor = new Color("0E172A")

  widget.url = passArr[dataPass][1]
  
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120)
  widget.setPadding(0,0,0,0)
  return widget
}

async function loadMediumWidget(){
  let widget = new ListWidget()
  
  if(loadRegionData){
    liveLoc = await loadData(`${dataUrl}/domestic/${dataRegion}/live.json?timestamp=${dataTime}`, "liveLoc")
    
    statLoc = await loadData(`${dataUrl}/domestic/${dataRegion}/stat.json?timestamp=${dataTime}`, "statLoc")
  }
  
  let hstack = widget.addStack()
  hstack.layoutHorizontally()
  
  let leftv = hstack.addStack()
  leftv.layoutVertically()
  
  let mainh = leftv.addStack()
  mainh.backgroundColor = new Color("182133")
  mainh.cornerRadius = 13
  mainh.setPadding(8,8,5,8)
  
  mainh.url = "https://corona-live.com"
  
  let mainv = mainh.addStack()
  mainv.layoutVertically()
  
  let df = new DateFormatter()
  df.locale = useEnglishUI ? "en" : "ko-kr"
  df.useShortTimeStyle()
  
  let titleText = mainv.addText(`${UIDataSet.ds01} | ${df.string(new Date(liveDom.timestamp))}`)
  titleText.font = fontMedium(11)
  titleText.textColor = new Color("ffffff")
  
  mainv.addSpacer(2)
  
  let liveStack = mainv.addStack()
  liveStack.centerAlignContent()
  
  let liveConfirmed = liveStack.addText(liveDom.live.today.toLocaleString())
  liveConfirmed.font = fontBold(23)
  liveConfirmed.textColor = new Color("ffffff")

  let liveUnit = liveStack.addText(UIDataSet.ds02)
  liveUnit.font = fontMedium(23)
  liveUnit.textColor = new Color("ffffff")
  
  
  leftv.addSpacer(8)
  
  let stath = leftv.addStack()
  stath.backgroundColor = new Color("182133")
  stath.cornerRadius = 13
  stath.setPadding(8,8,8,8)
  
  stath.url = passArr[dataPass][1]
  
  let statv0 = stath.addStack()
  statv0.layoutVertically()
  statv0.addSpacer()
  
  let statv = stath.addStack()
  statv.layoutVertically()
  
  // 어제 총합
  let confirmed1 = statDom.overview.confirmed[1]
  
  // 동시간대 차이
  let yesterdayGap = liveDom.live.today - liveDom.live.yesterday
  let weekGap = liveDom.live.today - liveDom.live.weekAgo

  // 국내 확진자 총합
  let confirmed0 = statDom.overview.confirmed[0]

  let stath1 = statv.addStack()
  stath1.centerAlignContent()
  let statT0 = stath1.addText(`${UIDataSet.ds13} `)
  statT0.font = fontMedium(12)
  statT0.textColor = new Color("ffffff", 0.6)
  
  let statT1 = stath1.addText(confirmed1 ? `${confirmed1.toLocaleString()}` : UIDataSet.ds04)
  statT1.font = fontBold(13)
  statT1.textColor = new Color("ffffff")
  
  let stath2 = statv.addStack()
  stath2.centerAlignContent()
  let statT3 = stath2.addText(`${UIDataSet.ds05} `)
  statT3.font = fontMedium(12)
  statT3.textColor = new Color("ffffff", 0.6)
  
  let statT4 = stath2.addText(`${confirmed0.toLocaleString()}`)
  statT4.font = fontBold(13)
  statT4.textColor = new Color("EB5374")
  
  statv.addSpacer(2)
  
  let stath3 = statv.addStack()
  stath3.centerAlignContent()
  let statI1 = stath3.addImage(SFSymbol.named("qrcode").image)
  statI1.imageSize = new Size(14,14)
  statI1.tintColor = new Color("ffffff")
  stath3.addSpacer(2)
  
  let statT5 = stath3.addText(UIDataSet.ds20)
  statT5.font = fontMedium(11)
  statT5.textColor = new Color("ffffff")
  
  mainh.addSpacer()
  stath.addSpacer()
  
  hstack.addSpacer(9)
  
  let subh = hstack.addStack()
  subh.size = new Size(subWidth, 0)
  subh.backgroundColor = new Color("182133")
  subh.cornerRadius = 13
  subh.setPadding(8,8,8,8)
  
  subh.url = `https://corona-live.com/city/${dataRegion}/`
  
  let subv0 = subh.addStack()
  subv0.layoutVertically()
  subv0.addSpacer()
  
  let subv = subh.addStack()
  subv.layoutVertically()
  
  let subh1 = subv.addStack()
  subh1.centerAlignContent()
  let subT1 = subh1.addText(`${useEnglishUI ? regionArrEn[dataRegion] : regionArr[dataRegion]} | ${df.string(new Date(liveLoc.timestamp))}`)
  subT1.font = fontMedium(11)
  subT1.textColor = new Color("ffffff")
  
  subv.addSpacer(2)
  
  let liveStack2 = subv.addStack()
  liveStack2.centerAlignContent()
  
  let liveConfirmed2 = liveStack2.addText(liveLoc.live.today.toLocaleString())
  liveConfirmed2.font = fontBold(23)
  liveConfirmed2.textColor = new Color("ffffff")

  let liveUnit2 = liveStack2.addText(UIDataSet.ds02)
  liveUnit2.font = fontMedium(23)
  liveUnit2.textColor = new Color("ffffff")
  
  // 지역 누적 확진자
  let locConf0 = statLoc.overview.confirmed[0]
  
  // 지역 어제 확진자
  let locConf1 = statLoc.overview.confirmed[1]

  let subh3 = subv.addStack()
  subh3.centerAlignContent()
  let subT5 = subh3.addText(`${UIDataSet.ds13} `)
  subT5.font = fontMedium(12)
  subT5.textColor = new Color("ffffff", 0.6)
  
  let subT6 = subh3.addText(`${locConf1.toLocaleString()}`)
  subT6.font = fontBold(13)
  subT6.textColor = new Color("ffffff")
  
  let subh2 = subv.addStack()
  subh2.centerAlignContent()
  let subT3 = subh2.addText(`${UIDataSet.ds15} `)
  subT3.font = fontMedium(12)
  subT3.textColor = new Color("ffffff", 0.6)
  
  let subT4 = subh2.addText(`${locConf0.toLocaleString()}`)
  subT4.font = fontBold(13)
  subT4.textColor = new Color("EB5374")
  
  subv.addSpacer(5)
  
  // 입원환자 증감
  let hospd1 = statDom.overview.hospitalised[1]
  
  let stath5 = subv.addStack()
  stath5.centerAlignContent()
  let statT7 = stath5.addText(`${UIDataSet.ds30} `)
  statT7.font = fontMedium(12)
  statT7.textColor = new Color("ffffff", 0.6)
  
  let statT8 = stath5.addText(`${hospd1 >= 0 ? "+" : ""}${hospd1.toLocaleString()}`)
  statT8.font = fontBold(13)
  statT8.textColor = new Color("5673EB")
  
  // 위중증자 증감
  let crit1 = statDom.overview.confirmedCritical[1]
  
  let stath6 = subv.addStack()
  stath6.centerAlignContent()
  let statT9 = stath6.addText(`${UIDataSet.ds31} `)
  statT9.font = fontMedium(12)
  statT9.textColor = new Color("ffffff", 0.6)
  
  let statTA = stath6.addText(`${crit1 >= 0 ? "+" : ""}${crit1.toLocaleString()}`)
  statTA.font = fontBold(13)
  statTA.textColor = new Color("CFCFCF")
  
  subh.addSpacer()
  
  widget.backgroundColor = new Color("0E172A")

  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120)
  widget.setPadding(layoutPadding[0], layoutPadding[2], layoutPadding[1], layoutPadding[3])
  
  return widget
}

let widget
if(config.runsInWidget){
  if(config.widgetFamily == "small"){
    widget = loadWidget()
  } else if(config.widgetFamily == "medium"){
    widget = await loadMediumWidget()
  }
  
  Script.setWidget(widget)
} else {
  widget = await loadMediumWidget()
  widget.presentMedium()
}
