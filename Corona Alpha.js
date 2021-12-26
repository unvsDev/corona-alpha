// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: street-view;
// Corona Alpha - developed by unvsDev
// 위젯 파일 및 제공되는 코드의 무단 재배포, 공유 및 판매는 엄격히 금지됩니다.


const version = "3.3"

const qrCheckInScheme = {
  "naver": ["네이버", "naversearchapp://opennadot?cardId=QRCheckIn"],
  "toss": ["토스", "supertoss://qr-checkin?referrer=widget"],
  "kakaotalk": ["카카오톡", "kakaotalk://qrcheckin?callingPkg=TalkWidgetExtension"],
  "naver-ext": ["네이버 (Web)", "https://nid.naver.com/login/privacyQR"]
}


const uifonts = {
  bold: "Spoqa Han Sans Neo Bold",
  medium: "Spoqa Han Sans Neo Medium",
  light: "Spoqa Han Sans Neo Light"
}

const uicolors = {
  bg01: "0E172A",
  bg02: "182133",
  bg03: "152E64",
  tx01: "ffffff",
  red: "EB5374",
  blue: "5673EB",
  darkgray: "828284",
  gray: "CFCFCF"
}

let fm = FileManager.local()

async function readString(filePath){
  if(fm.fileExists(filePath)){
    if(fm.isFileStoredIniCloud(filePath) && !fm.isFileDownloaded(filePath)){
      await fm.downloadFileFromiCloud(filePath)
    }
    return await fm.readString(filePath)
  } else {
    return null
  }
}

async function readJSON(filePath){
  return JSON.parse(await readString(filePath))
}

async function writeString(filePath, content){
  await fm.writeString(filePath, content)
}

async function writeJSON(filePath, content){
  await writeString(filePath, JSON.stringify(content))
}


let dataTime = new Date().getTime()
let dataUrl = "https://apiv3.corona-live.com"

let statDom; let liveDom;

let dataPath = `${fm.documentsDirectory()}/corona-alpha`
let mPath = `${fm.documentsDirectory()}/ca-config.json`

if(!fm.fileExists(`${dataPath}-stat.json`)){
  if(config.runsInApp){
    await Safari.openInApp("https://www.scriptable-kr.app/ifp")
  } else { throw new Error("앱 내에서 위젯을 실행해주세요.") }
}

try{
  statDom = await new Request(`${dataUrl}/domestic/stat.json?timestamp=${dataTime}`).loadJSON()
  
  liveDom = await new Request(`${dataUrl}/domestic/live.json?timestamp=${dataTime}`).loadJSON()

  await writeJSON(`${dataPath}-stat.json`, statDom)
  await writeJSON(`${dataPath}-live.json`, liveDom)
  
  console.log("코로나 라이브에서 정보를 가져오는 데 성공했습니다.")
} catch(e){
  statDom = await readJSON(`${dataPath}-stat.json`)
  
  liveDom = await readJSON(`${dataPath}-live.json`)
}

const checkUpdate = async () => {
  try{
    let versions = await new Request("https://gist.githubusercontent.com/unvsDev/e4d9aa9cfd95dd5e4bdad4a1791cba5d/raw/ca-versions.json").loadJSON()
    let latestVersion = versions.version[0]
    if(latestVersion.build != version){
      let fm = FileManager.iCloud()
      let raw = await new Request(latestVersion.raw).loadString()
      await fm.writeString(`${fm.documentsDirectory()}/${Script.name()}.js`, raw)
      if(config.runsInApp){ Safari.open(URLScheme.forRunningScript()) }
    } else {
      console.log("최신 버전을 사용하고 있습니다.")
    }
  } catch(e){ }
}

const checkConfigData = async (alwaysReplaceLegacyData) => {
  let mData = {
    "qrSchemeKeyword": "kakaotalk"
  }
  if(alwaysReplaceLegacyData){ return mData }
  if(fm.fileExists(mPath)){
    let prevData = await readJSON(mPath)
    for(index in prevData){
      mData[index] = prevData[index]
    }
  }
  
  return mData
}

let mData = await checkConfigData()

async function elementsAlert(title, subtitle, input){
  let alert = new Alert()
  alert.title = title
  alert.message = subtitle
  alert.addCancelAction(input[input.length - 1])
  
  for(let i = 0; i < input.length - 1; i++){
    alert.addAction(input[i])
  }
  
  return await alert.presentAlert()
}

function elementsText(rowHeight, dismissOnSelect, title, subtitle, titleSize, subtitleSize, table){
  let element = new UITableRow()
  element.height = rowHeight
  element.dismissOnSelect = dismissOnSelect
  
  let text = UITableCell.text(title, subtitle)
  text.titleFont = Font.boldSystemFont(titleSize)
  text.subtitleFont = Font.regularSystemFont(subtitleSize)

  // text.titleFont = new Font(uifonts.bold, titleSize)
  // text.subtitleFont = new Font(uifonts.medium, subtitleSize)
  
  element.addCell(text)
  table.addRow(element)
  return [element, text]
}

function elementsSwitch(rowHeight, title, subtitle, description, titleSize, subtitleSize, options, input, table){
  let val = mData[input.keyword]
  
  let element = new UITableRow()
  element.height = rowHeight
  element.dismissOnSelect = false
  
  let text = UITableCell.text(title, subtitle)
  text.widthWeight = 50
  text.leftAligned()
  text.titleFont = Font.boldSystemFont(titleSize)
  text.subtitleFont = Font.regularSystemFont(subtitleSize)

  element.addCell(text)
  
  let btLeft = UITableCell.button("⬅️")
  btLeft.widthWeight = 10
  btLeft.leftAligned()
  
  btLeft.onTap = () => {
    if(val - input.unit >= input.leftlimit){
      mData[input.keyword] -= input.unit
      refreshElements(table)
    }
  }
  
  element.addCell(btLeft)
  
  let indicator = UITableCell.text(options[val])
  indicator.titleFont = Font.boldSystemFont(titleSize)
  indicator.widthWeight = 20
  indicator.centerAligned()
  
  element.addCell(indicator)
  
  let btRight = UITableCell.button("➡️")
  btRight.widthWeight = 10
  btRight.rightAligned()
  
  btRight.onTap = () => {
    if(val + input.unit <= input.rightlimit){
      mData[input.keyword] += input.unit
      refreshElements(table)
    }
  }
  
  element.addCell(btRight)
  
  options.push("취소")
  element.onSelect = async () => {
    let choicer = await elementsAlert(title, description, options)
    if(choicer != -1){
      mData[input.keyword] = choicer
      refreshElements(table)
    }
  }
  
  table.addRow(element)
  return [element, text, indicator]
}

function loadElements(table){
  let title = elementsText(100, false, "코로나 알파", "코로나19 상황을 위젯으로 빠르게 알아보세요.", 20, 13, table)
  
  let fontProfileMaster = elementsText(65, false, "폰트 설치하기", "위젯에 어울리는 폰트 프로파일을 설치하세요.", 14, 13, table)

  let fontProfileGuider = fontProfileMaster[0]
  
  fontProfileGuider.onSelect = () => {
    Safari.openInApp("https://www.scriptable-kr.app/ifp")
  }
  
  let qrCheckInMaster = elementsText(65, false, "QR 체크인 경로", `${qrCheckInScheme[mData.qrSchemeKeyword][0]}에서 QR 체크인 하도록 설정했어요.`, 14, 13, table)

  let qrCheckInSelection = qrCheckInMaster[0]

  qrCheckInSelection.onSelect = async () => {
    let options = []
    for(index in qrCheckInScheme){
      options.push(qrCheckInScheme[index][0])
    }
    options.push("취소")
    let alert = await elementsAlert("어느 앱에서 QR 체크인 하시나요?", "자주 사용하는 앱을 선택하면 위젯에서 아래 방법을 통해 빠르게 접근할 수 있어요.\n\n- 소형 위젯: 위젯 클릭\n- 중형 위젯: 위젯에서 \"QR 체크인\" 클릭", options)
    
    if(alert != -1){
      mData.qrSchemeKeyword = Object.keys(qrCheckInScheme)[alert]
      refreshElements(table)
    }
  }
  
  let qrCheckInSelectionText = qrCheckInMaster[1]
  qrCheckInSelectionText.widthWeight = 80
  
  let qrCheckInTester = UITableCell.button("테스트")
  qrCheckInTester.widthWeight = 20
  qrCheckInTester.rightAligned()
  qrCheckInSelection.addCell(qrCheckInTester)
  
  qrCheckInTester.onTap = () => {
    Safari.open(qrCheckInScheme[mData.qrSchemeKeyword][1])
  }
  
  let fontDebugMaster = elementsText(65, false, "공지사항", "코로나 알파에 관한 소식을 확인하실 수 있어요.", 14, 13, table)

  let fontDebugElement = fontDebugMaster[0]
  
  fontDebugElement.onSelect = () => {
    Safari.openInApp("https://www.scriptable-kr.app/ifp")
  }
  
  let widgetVersionMaster = elementsText(65, false, "위젯 버전", version, 14, 13, table)

  let widgetVersion = widgetVersionMaster[0]
}

function refreshElements(table){
  table.removeAllRows()
  loadElements(table)
  table.reload()
}

async function showLauncher(){
  let table = new UITable()
  table.showSeparators = true
  loadElements(table)
  await table.present(false)
}

if(config.runsInApp){
  await showLauncher()
  await writeJSON(mPath, mData)
}




const addComma = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getLinearGradient = (color1, color2) => {
  let lg = new LinearGradient()
  color1 = new Color(color1)
  color2 = new Color(color2)
  lg.colors = [color1, color2]
  lg.locations = [0, 1]
  lg.startPoint = new Point(0,0)
  lg.endPoint = new Point(1,1)
  
  return lg
}

const addText = (content, font, textColor, target, alignCenter) => {
  let st
  if(alignCenter){
    st = target.addStack()
    target = st
    st.addSpacer()
  }
  
  let obj = target.addText(content)
  obj.font = font
  obj.textColor = textColor
  
  if(alignCenter){ st.addSpacer() }
  
  return obj
}

const gapLayout = (value, target, fixedColor) => {
  let selectedColor = fixedColor ? fixedColor : (value > 0 ? uicolors.red : uicolors.blue)
  
  let bx1 = target.addStack()
  bx1.centerAlignContent()
  bx1.setPadding(0,4,0,4)
  bx1.cornerRadius = 7

  bx1.backgroundColor = new Color(selectedColor, 0.2)

  let gapTx = addText(
  content = value ? `${value > 0 ? "+" : ""}${addComma(value)}` : "-",
  font = new Font(uifonts.medium, 12),
  textColor = new Color(selectedColor),
  target = bx1)
}

const addGapBlock = (string, value, target) => {
  let stgap = target.addStack()
  stgap.centerAlignContent()

  let stDescTx = addText(
  content = string,
  font = new Font(uifonts.medium, 12),
  textColor = new Color(uicolors.tx01, 0.8),
  target = stgap)

  stgap.addSpacer(5)

  gapLayout(value, stgap)
}


// 위젯 레이아웃
const smallLayout = () => {
  let widget = new ListWidget()
  
  // 라이브 확진자 수
  let descTx = addText(
  content = "코로나19",
  font = new Font(uifonts.medium, 13),
  textColor = new Color(uicolors.tx01),
  target = widget)
  
  descTx.centerAlignText()
  
  let liveConfirmed = liveDom.live.today
  
  let st1 = widget.addStack()
  st1.centerAlignContent()
  st1.addSpacer()
  
  let liveConfirmedTx = addText(
  content = addComma(liveConfirmed),
  font = new Font(uifonts.medium, 27),
  textColor = new Color(uicolors.tx01),
  target = st1)
  
  st1.addSpacer(2)
  
  let unitTx = addText(
  content = "명",
  font = new Font(uifonts.medium, 14),
  textColor = new Color(uicolors.tx01),
  target = st1)
  
  st1.addSpacer()
  
  // 어제 총합
  let confirmed1 = statDom.overview.confirmed[1]
  
  if(confirmed1){
    widget.addSpacer(3)
    
    let stys = widget.addStack()
    stys.addSpacer()
    
    gapLayout(confirmed1, stys)
    
    stys.addSpacer()
  } else {
    let nullTx = addText(
    content = "확진자 집계중",
    font = new Font(uifonts.bold, 11),
    textColor = new Color(uicolors.gray),
    target = widget, true)
    
    widget.addSpacer(2)
  }
  
  widget.addSpacer(15)
  
  // 동시간대 차이
  let yesterdayGap = liveConfirmed - liveDom.live.yesterday
  let weekGap = liveConfirmed - liveDom.live.weekAgo
  
  addGapBlock("vs 어제", yesterdayGap, widget)
  
  widget.addSpacer(4)
  
  addGapBlock("vs 1주전", weekGap, widget)
  
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120)
  widget.backgroundColor = new Color(uicolors.bg01)
  widget.url = qrCheckInScheme[mData.qrSchemeKeyword][1]
  return widget
}

const mediumLayout = () => {
  let widget = new ListWidget()
  
  let blocks = widget.addStack()
  blocks.layoutHorizontally()
  
  const addSegment = (title, value, gapvalue, color) => {
    let block = blocks.addStack()
    block.layoutVertically()
    
    block.size = new Size(94,0)
    block.backgroundColor = new Color(uicolors.bg02)
    block.cornerRadius = 10
    
    block.addSpacer()
    
    let descTx = addText(
    content = title,
    font = new Font(uifonts.medium, 12),
    textColor = new Color(uicolors.gray),
    target = block, true)
    
    let liveConfirmedTx = addText(
    content = addComma(value),
    font = new Font(uifonts.bold, 18),
    textColor = new Color(color),
    target = block, true)
    
    block.addSpacer(3)
  
    let stys = block.addStack()
    stys.addSpacer()
    
    gapLayout(gapvalue, stys, color)
    
    stys.addSpacer()
    
    block.addSpacer()
  }
  
  let confirmed0 = statDom.overview.confirmed[0]
  let confirmed1 = statDom.overview.confirmed[1]
  
  addSegment("확진자", confirmed0, confirmed1, uicolors.red)
  blocks.addSpacer(7)
  
  let severe0 = statDom.overview.confirmedSevereSymptoms[0]
  let severe1 = statDom.overview.confirmedSevereSymptoms[1]

  addSegment("위중증자", severe0, severe1, uicolors.blue)
  blocks.addSpacer(7)

  let omicron0 = statDom.overview.confirmedOmicron[0]
  let omicron1 = statDom.overview.confirmedOmicron[1]

  addSegment("오미크론", omicron0, omicron1, uicolors.darkgray)
  
  widget.addSpacer(7)
  
  let bottom = widget.addStack()
  bottom.layoutHorizontally()
  
  let stlive = bottom.addStack()
  stlive.size = new Size(144.5, 35)
  stlive.backgroundColor = new Color(uicolors.bg02)
  stlive.cornerRadius = 10
  
  stlive.centerAlignContent()
  
  let liveConfirmed = liveDom.live.today
  
  let liveTx = addText(
  content = `${addComma(liveConfirmed)}명 `,
  font = new Font(uifonts.bold, 13),
  textColor = new Color(uicolors.gray),
  target = stlive)
  
  // 동시간대 차이
  let yesterdayGap = liveConfirmed - liveDom.live.yesterday
  gapLayout(yesterdayGap, stlive)
  
  bottom.addSpacer(7)
  
  let stqr = bottom.addStack()
  stqr.size = new Size(144.5, 35)
  stqr.backgroundColor = new Color(uicolors.bg02)
  stqr.cornerRadius = 10
  
  stqr.centerAlignContent()
  
  let qricon = stqr.addImage(SFSymbol.named("qrcode").image)
  qricon.tintColor = new Color(uicolors.darkgray)
  qricon.imageSize = new Size(14,14)
  
  let qrdescTx = addText(
  content = " QR 체크인",
  font = new Font(uifonts.bold, 12),
  textColor = new Color(uicolors.gray),
  target = stqr)
  
  stqr.url = qrCheckInScheme[mData.qrSchemeKeyword][1]
  
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120)
  widget.backgroundColor = new Color(uicolors.bg01)
  return widget
}

const errorLayout = (message) => {
  let widget = new ListWidget()
  
  let errorTx = widget.addText(message)
  errorTx.font = new Font(uifonts.bold, 16)
  errorTx.textColor = new Color(uicolors.tx01)
  
  errorTx.centerAlignText()
  
  widget.backgroundColor = new Color(uicolors.bg01)
  return widget
}

await checkUpdate()

if(config.runsInWidget){
  let size = config.widgetFamily
  let supports = ["small", "medium"]
  let widget = supports.includes(size) ? eval(`${size}Layout()`) : errorLayout("해당 위젯 사이즈는 지원하지 않습니다.")
  
  Script.setWidget(widget)
} else if(config.runsInApp){
  let widget = mediumLayout()
  widget.presentMedium()
}
