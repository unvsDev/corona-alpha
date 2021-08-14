// Corona Live - developed by unvsDev
// https://github.com/unvsDev/corona-alpha

let devmode = false // 데이터 json 보기
let resetmode = false // 지역 초기화

const build = 100

const source = "https://apiv2.corona-live.com/domestic-init.json"
const url = "https://corona-live.com/"

const regionsArr = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주']

let fm = FileManager.local()
let fDir = `${fm.documentsDirectory()}/coronalive.json`

const getData = async () => {
  let request = new Request(source)
  let data = await request.loadJSON()
  console.log("* [Stats] 데이터를 받아왔습니다.")
  
  return {
   "casesLive": data.statsLive.today,
   "casesAll": data.stats.cases[0],
   "casesGap": data.stats.cases[1],
   "deathsAll": data.stats.deaths[0],
   "deathsGap": data.stats.deaths[1],
   "recoverAll": data.stats.recovered[0],
   "recoverGap": data.stats.recovered[1],
   "testsGap": data.stats.testing[1] + data.stats.negatives[1]
  }
  
  /*
    casesLive : 실시간 확진자 수
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
  alert.title = `지역으로\n${regionsArr[regioncode]}을(를) 설정하셨습니다.`
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
    alert.title = "지역을 설정합니다."
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

const getLevelColor = (count) => {
    if (count >= 2000) return '#222831'
    else if (count >= 1200) return '#dc143c'
    else if (count >= 500) return '#f05454'
    else return '#0099ff'
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

const addComma = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const setWidget = async () => {
  // 정보 준비
  let prefs = await getDeviceData(resetmode)
  let regioncode = prefs[0]
  let gucode = prefs[1]
  let guname = prefs[2]
  
  console.log(`* 설정한 지역은 [${regionsArr[regioncode]} ${guname}] 입니다.`)
  
  // 정보 가져오기
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
  let liveText = topStack.addText(addComma(stats.casesLive))
  liveText.font = Font.ultraLightSystemFont(37)
  
  let inStack = topStack.addStack()
  inStack.layoutVertically()
  inStack.addSpacer(15)
  
  let liveSub = inStack.addText("명")
  liveSub.font = Font.systemFont(16)
  topStack.addSpacer()
  
  widget.addSpacer(7)
  let prevStack = widget.addStack()
  prevStack.layoutHorizontally()
  
  let prevTitle = prevStack.addText("어제 총합 ")
  prevTitle.font = Font.systemFont(13)
  
  let prevText = prevStack.addText(`${addComma(stats.casesGap)}명`)
  prevText.font = Font.boldSystemFont(13)
  
  vacs.vacTotal = vacs.vacTotal / 1000000
  
  widget.addSpacer(3)
  let totStack = widget.addStack()
  totStack.layoutHorizontally()
  
  let totTitle = totStack.addText("총 확진자 ")
  totTitle.font = Font.systemFont(13)
  
  let totText = totStack.addText(`${addComma(stats.casesAll)}명`)
  totText.font = Font.boldSystemFont(13)
  
  widget.addSpacer(6)
  let vacStack = widget.addStack()
  vacStack.layoutHorizontally()
  
  let vacTitle = vacStack.addText("접종 완료 ")
  vacTitle.font = Font.systemFont(10)
  
  let vacText = vacStack.addText(`${vacs.vacTotal.toFixed(2)}백만 (${vacs.vacPercent}%)`)
  vacText.font = Font.boldSystemFont(10)
  
  widget.addSpacer(3)
  let cityStack = widget.addStack()
  cityStack.layoutHorizontally()
  
  let cityTitle = cityStack.addText(`${regionsArr[regioncode]} ${guname} `)
  cityTitle.font = Font.systemFont(10)
  
  let cityText = cityStack.addText(`${addComma(locals.cityLive)}명 (어제 ${addComma(locals.cityGap)}명)`)
  cityText.font = Font.boldSystemFont(10)
  
  widget.url = url
  widget.backgroundColor = new Color(getLevelColor(stats.casesLive))

  widget.refreshAfterDate = new Date(Date.now() + 1000 * 120) // 120초마다 리프레시 요청

  widget.setPadding(7,12,7,12)
  return widget
}

await checkUpdate()
let widget = await setWidget()
if(config.runsInWidget){
  Script.setWidget(widget)
} else {
  widget.presentSmall()
}
Script.complete()
