// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: street-view;
// Corona Alpha - developed by unvsDev
// BETA Version

const version = "1.0"


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
      let raw = await new Request("https://raw.githubusercontent.com/unvsDev/corona-alpha/main/Corona%20Alpha.js").loadString()
      await writeString(`${fm.documentsDirectory()}/${Script.name()}.js`, raw)
    } else {
      console.log("최신 버전을 사용하고 있습니다.")
    }
  } catch(e){ }
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
}
