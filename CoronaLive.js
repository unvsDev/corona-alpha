// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: street-view;
// Corona Live - developed by unvsDev
// https://github.com/unvsDev/corona-alpha

let devmode = false // 데이터 json 보기
let useEditor = true // 내부 편집기 사용

const build = 200

const source = "https://apiv2.corona-live.com/domestic-init.json"
const url = "https://corona-live.com/"

const regionsArr = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주']

let fm = FileManager.local()
let fDir = `${fm.documentsDirectory()}/coronalive.json`
let dDir = `${fm.documentsDirectory()}/corona-prefs.json`

let init_wdata = {
  "layout": "V2",
  "bgbookmark": ""
}

if(!fm.fileExists(dDir)){
  fm.writeString(dDir, JSON.stringify(init_wdata))
}


const getData = async () => {
  let request = new Request(source)
  let data = await request.loadJSON()
  console.log("* [Stats] 데이터를 받아왔습니다.")
  
  return {
   "liveToday": data.statsLive.today,
   "liveYesterday": data.statsLive.yesterday,
   "liveWeekAgo": data.statsLive.weekAgo,
   "liveTwoWeeks": data.statsLive.twoWeeksAgo,
   "liveMonthAgo": data.statsLive.monthAgo,
   "casesAll": data.stats.cases[0],
   "casesGap": data.stats.cases[1],
   "deathsAll": data.stats.deaths[0],
   "deathsGap": data.stats.deaths[1],
   "recoverAll": data.stats.recovered[0],
   "recoverGap": data.stats.recovered[1],
   "testsGap": data.stats.testing[1] + data.stats.negatives[1]
  }
  
  /*
    liveToday : 실시간 확진자 수
    liveYesterday : 동시간대 비교 (어제)
    liveWeekAgo : 동시간대 비교 (1주)
    liveTwoWeeks : 동시간대 비교 (2주)
    liveMonthAgo : 동시간대 비교 (1달)
    casesAll : 누적 확진자 수
    casesGap : 전일 확진자 총합
    deathsAll : 누적 사망자 수
    deathsGap : 전일 사망자 총합
    recoverAll : 누적 완치자 수
    recoverGap : 전일 완치자 총합
    testsGap : 전일 검사완료 + 음성판정 총합
  */
}

const getCityData = async (regioncode, gucode) => {
  /*
    regioncode : 지역 코드
    gucode : 세부 코드 (-1은 도시 전체)
  */
  
  let citysource = `https://apiv2.corona-live.com/city-init/${regioncode}.json`
  let request = new Request(citysource)
  let data = await request.loadJSON()
  data = data.data
  console.log("* [City] 데이터를 받아왔습니다.")
  
  if(gucode != -1){
    return {
      "cityLive": data.gusLive[gucode][0],
      "cityAll": data.gus[gucode][0],
      "cityGap": data.gus[gucode][1]
    }
  
  } else {
    return {
      "cityLive": data.statsLive.today,
      "cityAll": data.stats.cases[0],
      "cityGap": data.stats.cases[1]
    }
  }
  
  /*
    cityLive : 지역의 라이브 확진자 수
    cityAll : 지역의 총 확진자 수
    cityGap : 지역의 어제 확진자 총합
  */
}

const getVaccineData = async () => {
  let vacsource = "https://apiv2.corona-live.com/vaccine.json"
  let request = new Request(vacsource)
  let data = await request.loadJSON()
  data = data.stats.fullyVaccinated
  console.log("* [Vaccine] 데이터를 받아왔습니다.")
  
  return {
    "vacTotal": data.total,
    "vacGap": data.delta,
    "vacPercent": data.percentage
  }
  
  /*
    vacTotal : 백신 접종 완료 총합
    vacGap : 백신 접종 완료 어제 총합
    vacPercent : 전체 대비 백신 접종 완료 (%)
  */
}

const selectRegion = async () => {
  let regioncode = -1
  
  let table = new UITable()
  table.showSeparators = true
  
  let header = new UITableRow()
  header.isHeader = true
  header.addText("지역 설정")
  header.height = 80
  table.addRow(header)
  
  for(i in regionsArr){
    let option = new UITableRow()
    option.addText(regionsArr[i])
    option.height = 50
    
    option.onSelect = (number) => {
      regioncode = number - 1
    }
    
    table.addRow(option)
  }
  
  await table.present()
  
  if(regioncode == -1){
    throw new Error("지역 설정이 완료되지 않았습니다.")
  }
  return regioncode
}

const selectGu = async (regioncode) => {
  let supportUrl = "https://github.com/unvsDev/corona-alpha/raw/main/guData.json"
  let guData = await new Request(supportUrl).loadJSON()
  
  let supports = guData.support
  if(supports.indexOf(regioncode) == -1){
    return [-1, "전체"]
  }
  
  let alert = new Alert()
  alert.title = "코로나 라이브"
  alert.message = `관심 지역으로 ${regionsArr[regioncode]}이(가) 설정되었습니다.\n탐색 범위를 선택해 주세요.`
  alert.addAction("지역 전체")
  alert.addAction("우리 동네로 설정")
  
  let response = await alert.present()
  
  if(response == 0){ return [-1, "전체"] }
  
  let guList = guData[regioncode]
  
  let gucode = -1
  let guname
  let table = new UITable()
  table.showSeparators = true
  
  let header = new UITableRow()
  header.isHeader = true
  header.addText(`${regionsArr[regioncode]} ➡️ 시/구 설정`)
  header.height = 80
  table.addRow(header)
  
  for(i in guList){
    let option = new UITableRow()
    option.addText(guList[i])
    option.height = 50
    
    option.onSelect = (number) => {
      gucode = number - 1
      guname = guList[number - 1]
    }
    
    table.addRow(option)
  }
  
  await table.present()
  
  if(gucode == -1){
    throw new Error("시/구 설정이 완료되지 않았습니다.")
  }
  return [gucode, guname]
}

const getDeviceData = async (resetmode) => {
  let regioncode, gucode, guname
  if((config.runsInApp && resetmode) || !fm.fileExists(fDir)){
    let alert = new Alert()
    alert.title = "코로나 라이브"
    alert.message = "확진자 현황을 확인할 지역을 설정합니다."
    alert.addAction("확인")
    await alert.present()
    
    regioncode = await selectRegion()  
    let guresponse = await selectGu(regioncode)
    gucode = guresponse[0]
    guname = guresponse[1]
    
    await fm.writeString(fDir, JSON.stringify({
      "region": regioncode,
      "gu": gucode,
      "guname": guname
    }))
    
    console.log("* 데이터 저장이 완료되었습니다!")
  } else {
    let data = JSON.parse(fm.readString(fDir))
    regioncode = data.region
    gucode = data.gu
    guname = data.guname
  }
  
  return [regioncode, gucode, guname]
}

const fetchUpdate = async (buildnum) => {
  let noti = new Notification()
  noti.title = "코로나 라이브 위젯"
  noti.body = `신규 버전을 자동으로 설치합니다. (${build} -> ${buildnum})`
  
  await noti.schedule()
  
  let codeurl = "https://github.com/unvsDev/corona-alpha/raw/main/CoronaLive.js"
  let request = await new Request(codeurl).loadString()
  
  let fm2 = FileManager.iCloud()
  let wDir = `${fm2.documentsDirectory()}/${Script.name()}.js`
  await fm2.writeString(wDir, request)
}

const checkUpdate = async () => {
  let buildurl = "https://github.com/unvsDev/corona-alpha/raw/main/VERSION2"
  let latestbuild = await new Request(buildurl).loadString()
  
  latestbuild = parseInt(latestbuild)
  
  if(build != latestbuild){
    await fetchUpdate(latestbuild)
  } else {
    console.log("* 위젯이 최신 버전입니다.")
  }
}

const dataUpdate = async () => {
  let wdata = JSON.parse(fm.readString(dDir))
  let i = 0
  
  for(option in init_wdata){
    if(wdata[option] == undefined){
      wdata[option] = init_wdata[option]
      i = i + 1
      console.log(`* 데이터 업데이트 (${i})`)
    }
  }
  
  if(i > 0){
    await fm.writeString(dDir, JSON.stringify(wdata))
  }
}

const showEditor = async () => {
  let wdata = JSON.parse(fm.readString(dDir))
  
  let editor = new UITable()
  editor.showSeparators = true
  
  async function loadAllRows(){
    let prefs = await getDeviceData()
    let regioncode = prefs[0]
    let gucode = prefs[1]
    let guname = prefs[2]
    
    let header = new UITableRow()
    header.height = 120
    let title = UITableCell.text("Corona Live", "코로나19 정보를 위젯에 알기 쉽게 표시해 보세요.")
    title.titleFont = Font.boldSystemFont(25)
    
    header.addCell(title)
    editor.addRow(header)
    
    let BTSetRegion = new UITableRow()
    BTSetRegion.height = 60
    BTSetRegion.addText("지역 설정", `${regionsArr[regioncode]} ${guname}`)
    BTSetRegion.dismissOnSelect = false
    editor.addRow(BTSetRegion)
    
    BTSetRegion.onSelect = async () => {
      await getDeviceData(true)
      await refreshAllRows()
    }
    
    let BTLayout = new UITableRow()
    BTLayout.height = 60
    BTLayout.addText("위젯 레이아웃", wdata.layout)
    BTLayout.dismissOnSelect = false
    editor.addRow(BTLayout)
    
    BTLayout.onSelect = async () => {
      let alert = new Alert()
      alert.title = "위젯 레이아웃을 선택해 주세요"
      alert.addAction("V1")
      alert.addAction("V2")
      alert.addCancelAction("취소")
      let response = await alert.presentSheet()
      
      if(response == 0){
        wdata.layout = "V1"
      } else if(response == 1){
        wdata.layout = "V2"
      }
      
      await refreshAllRows()
    }
    
    let BTBookmark = new UITableRow()
    BTBookmark.height = 60
    BTBookmark.addText("배경 이미지", wdata.bgbookmark != "" ? wdata.bgbookmark : "기본 배경")
    BTBookmark.dismissOnSelect = false
    editor.addRow(BTBookmark)
    
    BTBookmark.onSelect = async () => {
      let alert = new Alert()
      alert.title = "배경 설정"
      alert.message = "배경 이미지로 설정할 파일 북마크의 이름을 입력해 주세요."
      alert.addTextField("", wdata.bgbookmark)
      alert.addAction("확인")
      alert.addCancelAction("취소")
      let response = await alert.presentAlert()
      
      if(response == 0){
        wdata.bgbookmark = alert.textFieldValue()
      }
      
      await refreshAllRows()
    }
  }
  
  await loadAllRows()
  await editor.present()
    
  async function refreshAllRows() {
    editor.removeAllRows()
    await loadAllRows()
    editor.reload()
  }
  
  await fm.writeString(dDir, JSON.stringify(wdata))
}

const addComma = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getLevelColor = (count) => {
    if (count >= 2000) return '#222831'
    else if (count >= 1200) return '#dc143c'
    else if (count >= 500) return '#f05454'
    else return '#0099ff'
}

const setTextColor = (target) => {
  target.textColor = new Color("ffffff")
}

const addIntSymbol = (string) => {
  return string.indexOf('-') != -1 ? string : `+${string}`
}

const setZeroToStr = (string) => {
  return string.indexOf("0명") != -1 ? "집계 중" : string
}

const setWidgetV1 = async () => {
  let prefs = await getDeviceData()
  let regioncode = prefs[0]
  let gucode = prefs[1]
  let guname = prefs[2]
  
  console.log(`* 설정한 지역은 [${regionsArr[regioncode]} ${guname}] 입니다.`)
  
  let stats = await getData()
  let locals = await getCityData(regioncode, gucode)
  let vacs = await getVaccineData()
  
  if(devmode){
    console.log(stats)
    console.log(locals)
    console.log(vacs)
  }

  // 위젯 레이아웃
  let widget = new ListWidget()
  
  let topStack = widget.addStack()
  
  topStack.addSpacer()
  let liveText = topStack.addText(addComma(stats.liveToday))
  liveText.font = Font.ultraLightSystemFont(37)
  setTextColor(liveText)
  
  let inStack = topStack.addStack()
  inStack.layoutVertically()
  inStack.addSpacer(15)
  
  let liveSub = inStack.addText("명")
  liveSub.font = Font.systemFont(16)
  topStack.addSpacer()
  setTextColor(liveSub)
  
  widget.addSpacer(7)
  let prevStack = widget.addStack()
  prevStack.layoutHorizontally()
  
  let prevTitle = prevStack.addText("어제 총합 ")
  prevTitle.font = Font.systemFont(13)
  setTextColor(prevTitle)
  
  let prevText = prevStack.addText(setZeroToStr(`${addComma(stats.casesGap)}명`))
  prevText.font = Font.boldSystemFont(13)
  setTextColor(prevText)
  
  vacs.vacTotal = vacs.vacTotal / 1000000
  
  widget.addSpacer(3)
  let totStack = widget.addStack()
  totStack.layoutHorizontally()
  
  let totTitle = totStack.addText("총 확진자 ")
  totTitle.font = Font.systemFont(13)
  setTextColor(totTitle)
  
  let totText = totStack.addText(`${addComma(stats.casesAll)}명`)
  totText.font = Font.boldSystemFont(13)
  setTextColor(totText)
  
  widget.addSpacer(6)
  let vacStack = widget.addStack()
  vacStack.layoutHorizontally()
  
  let vacTitle = vacStack.addText("접종 완료 ")
  vacTitle.font = Font.systemFont(10)
  setTextColor(vacTitle)
  
  let vacText = vacStack.addText(`${vacs.vacTotal.toFixed(1)}백만 (${vacs.vacPercent}%)`)
  vacText.font = Font.boldSystemFont(10)
  setTextColor(vacText)
  
  widget.addSpacer(3)
  let cityStack = widget.addStack()
  cityStack.layoutHorizontally()
  
  let cityTitle = cityStack.addText(`${regionsArr[regioncode]} ${guname} `)
  cityTitle.font = Font.systemFont(10)
  setTextColor(cityTitle)
  
  let cityText = cityStack.addText(`${addComma(locals.cityLive)}명 (` + setZeroToStr(`어제 ${addComma(locals.cityGap)}명`) + `)`)
  cityText.font = Font.boldSystemFont(10)
  setTextColor(cityText)
  
  widget.url = url
  widget.backgroundColor = new Color(getLevelColor(stats.liveToday))

  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120) // 120초마다 리프레시 요청

  widget.setPadding(7,12,7,12)
  return widget
}

const setWidgetV2 = async () => {
  let prefs = await getDeviceData()
  let regioncode = prefs[0]
  let gucode = prefs[1]
  let guname = prefs[2]
  
  console.log(`* 설정한 지역은 [${regionsArr[regioncode]} ${guname}] 입니다.`)
  
  let stats = await getData()
  let locals = await getCityData(regioncode, gucode)
  let vacs = await getVaccineData()
  
  if(devmode){
    console.log(stats)
    console.log(locals)
    console.log(vacs)
  }

  // 위젯 레이아웃
  let widget = new ListWidget()
  
  let header = widget.addText("코로나19")
  setTextColor(header)
  header.font = Font.boldSystemFont(21)
  header.textOpacity = 0.7
  
  let todayStack = widget.addStack()
  todayStack.centerAlignContent()
  
  let liveText = todayStack.addText(`${addComma(stats.liveToday)}명`)
  setTextColor(liveText)
  liveText.font = Font.boldSystemFont(22)
  
  todayStack.addSpacer(6)
  let box = todayStack.addStack()
  box.backgroundColor = new Color("ffffff")
  box.setPadding(2,2,2,2)
  box.cornerRadius = 5
  
  let liveDayGap = stats.liveToday - stats.liveYesterday
  
  let liveGap = box.addText(`${addIntSymbol(addComma(liveDayGap))}`)
  liveGap.textColor = new Color("000000")
  liveGap.font = Font.boldSystemFont(13)
  
  todayStack.addSpacer()
  
  widget.addSpacer()
  
  let prevStack = widget.addStack()
  prevStack.layoutHorizontally()
  
  let prevTitle = prevStack.addText("어제 총합 ")
  prevTitle.font = Font.systemFont(13)
  
  let prevText = prevStack.addText(setZeroToStr(`${addComma(stats.casesGap)}명`))
  prevText.font = Font.boldSystemFont(13)
  
  setTextColor(prevTitle)
  setTextColor(prevText)
  prevStack.addSpacer()
  
  widget.addSpacer(4)
  
  let totStack = widget.addStack()
  totStack.layoutHorizontally()
  
  let totTitle = totStack.addText("총 확진자 ")
  totTitle.font = Font.systemFont(13)
  
  let totText = totStack.addText(setZeroToStr(`${addComma(stats.casesAll)}명`))
  totText.font = Font.boldSystemFont(13)
  
  setTextColor(totTitle)
  setTextColor(totText)
  totStack.addSpacer()
  
  widget.addSpacer(4)
  
  vacs.vacTotal = vacs.vacTotal / 1000000
  
  let vacStack = widget.addStack()
  vacStack.layoutHorizontally()
  
  let vacTitle = vacStack.addText("접종 완료 ")
  vacTitle.font = Font.systemFont(10)
  setTextColor(vacTitle)
  
  let vacText = vacStack.addText(`${vacs.vacTotal.toFixed(1)}백만 (${vacs.vacPercent}%)`)
  vacText.font = Font.boldSystemFont(10)
  setTextColor(vacText)
  
  vacStack.addSpacer()
  
  widget.addSpacer(3)
  
  let cityStack = widget.addStack()
  cityStack.layoutHorizontally()
  
  let cityTitle = cityStack.addText(`${regionsArr[regioncode]} ${guname} `)
  cityTitle.font = Font.systemFont(10)
  setTextColor(cityTitle)
  
  let cityText = cityStack.addText(`${addComma(locals.cityLive)}명 (` + setZeroToStr(`어제 ${addComma(locals.cityGap)}명`) + `)`)
  cityText.font = Font.boldSystemFont(10)
  setTextColor(cityText)
  
  cityStack.addSpacer()
  
  widget.addSpacer(12)
  
  widget.url = url
  widget.backgroundColor = new Color("00334e")
  
  if(wdata.bgbookmark != ""){
    widget.backgroundImage = await fm.readImage(fm.bookmarkedPath(wdata.bgbookmark))
  }

  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120) // 120초마다 리프레시 요청

  widget.setPadding(12,10,7,10)
  return widget
}

await checkUpdate()
await dataUpdate()
if(config.runsInApp && useEditor) await showEditor()

let wdata = JSON.parse(fm.readString(dDir))
let layout = wdata.layout
let widget = await eval(`setWidget${layout}()`)
if(config.runsInWidget){
  Script.setWidget(widget)
} else {
  widget.presentSmall()
}
Script.complete()
