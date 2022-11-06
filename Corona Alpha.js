// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: bullhorn;
// Corona Alpha v5 - by unvsDev
// Korea Covid-19 Information for Scriptable

// 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주, 검역
// 관심지역을 최대 4개까지 설정할 수 있습니다.
const USER_CITY = ["서울", "부산", "대구", "인천"]

const VERSION = "5.0.1"

const GIST_ID = "unvsDev/f5a2db2046629f6352c0b8c616f8a458"
const DATA_URL = "https://gist.githubusercontent.com/" + GIST_ID + "/raw/covidData.json"

let fm = FileManager.local()
const CACHE_PATH = fm.documentsDirectory() + "/covidCache.json"

let cache = {}
if(fm.fileExists(CACHE_PATH)){ cache = JSON.parse(fm.readString(CACHE_PATH)) }

try{
  cache = await new Request(DATA_URL).loadJSON()
  await fm.writeString(CACHE_PATH, JSON.stringify(cache))
} catch(e){
  if(cache.dataTime == undefined){
    throw new Error("네트워크 오류. 데이터 갱신에 실패했습니다.")
  }
}

if(cache.widgetVersion != VERSION){
  try{
    let fm = FileManager.iCloud()
    let source = await new Request(cache.widgetSource).loadString()
    await fm.writeString(fm.documentsDirectory() + "/" + Script.name() + ".js", source)
  } catch(e){ }
}

let widget = new ListWidget()

if(config.runsInApp || config.widgetFamily == "small"){
  let stack1 = widget.addStack()
  stack1.centerAlignContent()
  
  let baseText1 = stack1.addText("전국")
  baseText1.font = Font.boldSystemFont(12)
  baseText1.textColor = new Color("ffffff")
  
  stack1.addSpacer(4)
  
  let baseText2 = stack1.addText("어제 확진자")
  baseText2.font = Font.systemFont(12)
  baseText2.textOpacity = 0.8
  baseText2.textColor = new Color("ffffff")
  
  let prevConfirmedText = widget.addText(cache['합계'].prevConfirmed[0].toLocaleString())
  prevConfirmedText.font = Font.lightSystemFont(30)
  prevConfirmedText.textColor = new Color("ffffff")
  
  widget.addSpacer(5)
  
  let totalConfirmedText = widget.addText("총 " + cache['합계'].totalConfirmed.toLocaleString() + "명")
  totalConfirmedText.font = Font.boldSystemFont(13)
  totalConfirmedText.textOpacity = 0.8
  totalConfirmedText.textColor = new Color("ffffff")
  
  let df = new DateFormatter()
  df.dateFormat = "yyyyMMddHHmm"
  
  let df2 = new DateFormatter()
  df2.dateFormat = "M월 d일 HH시 기준"
  
  widget.addSpacer(3)
  
  let dataTimeText = widget.addText(df2.string(df.date(cache.dataTime)))
  dataTimeText.font = Font.systemFont(13)
  dataTimeText.textOpacity = 0.8
  dataTimeText.textColor = new Color("ffffff")
  
  widget.addSpacer()
  
  let stack2 = widget.addStack()
  stack2.centerAlignContent()
  
  let baseText3 = stack2.addText(USER_CITY[0])
  baseText3.font = Font.boldSystemFont(12)
  baseText3.textColor = new Color("ffffff")
  
  stack2.addSpacer(4)
  
  let baseText4 = stack2.addText("어제 ")
  baseText4.font = Font.systemFont(12)
  baseText4.textOpacity = 0.8
  baseText4.textColor = new Color("ffffff")
  
  let cityPrevText = stack2.addText(cache[USER_CITY[0]].prevConfirmed[0].toLocaleString() + "명")
  cityPrevText.font = Font.boldSystemFont(12)
  cityPrevText.textOpacity = 0.8
  cityPrevText.textColor = new Color("ffffff")
  
} else if(config.widgetFamily == "medium"){
  let hStack = widget.addStack()
  
  let vStack1 = hStack.addStack()
  vStack1.layoutVertically()
  
  let hSpacer1 = vStack1.addStack()
  hSpacer1.addSpacer()
  
  let stack1 = vStack1.addStack()
  stack1.centerAlignContent()
  
  let baseText1 = stack1.addText("전국")
  baseText1.font = Font.boldSystemFont(12)
  baseText1.textColor = new Color("ffffff")
  
  stack1.addSpacer(4)
  
  let baseText2 = stack1.addText("어제 확진자")
  baseText2.font = Font.systemFont(12)
  baseText2.textOpacity = 0.8
  baseText2.textColor = new Color("ffffff")
  
  let prevConfirmedText = vStack1.addText(cache['합계'].prevConfirmed[0].toLocaleString())
  prevConfirmedText.font = Font.lightSystemFont(30)
  prevConfirmedText.textColor = new Color("ffffff")
  
  vStack1.addSpacer(5)
  
  let stack2 = vStack1.addStack()
  stack2.centerAlignContent()
  
  let symbol1 = stack2.addImage(SFSymbol.named("person.2.fill").image)
  symbol1.tintColor = new Color("ffffff")
  symbol1.imageSize = new Size(14, 14)
  symbol1.imageOpacity = 0.8
  
  let baseText3 = stack2.addText("10만 명당 ")
  baseText3.font = Font.boldSystemFont(12)
  baseText3.textOpacity = 0.8
  baseText3.textColor = new Color("ffffff")
  
  let confirmedRateText = stack2.addText(cache['합계'].confirmedPer100k.toLocaleString() + "명")
  confirmedRateText.font = Font.systemFont(12)
  confirmedRateText.textOpacity = 0.8
  confirmedRateText.textColor = new Color("ffffff")
  
  vStack1.addSpacer(4)
  
  let stack3 = vStack1.addStack()
  stack3.centerAlignContent()
  
  let baseText4 = stack3.addText("사망자 ")
  baseText4.font = Font.boldSystemFont(12)
  baseText4.textOpacity = 0.8
  baseText4.textColor = new Color("ffffff")
  
  let totalDeceasedText = stack3.addText(cache['합계'].totalDeceased.toLocaleString() + "명")
  totalDeceasedText.font = Font.systemFont(12)
  totalDeceasedText.textOpacity = 0.8
  totalDeceasedText.textColor = new Color("ffffff")
  
  vStack1.addSpacer(4)
  
  let stack4 = vStack1.addStack()
  stack4.centerAlignContent()
  
  let baseText5 = stack4.addText("총 확진 ")
  baseText5.font = Font.boldSystemFont(12)
  baseText5.textOpacity = 0.8
  baseText5.textColor = new Color("ffffff")
  
  let totalConfirmedText = stack4.addText(cache['합계'].totalConfirmed.toLocaleString() + "명")
  totalConfirmedText.font = Font.systemFont(12)
  totalConfirmedText.textOpacity = 0.8
  totalConfirmedText.textColor = new Color("ffffff")
  
  vStack1.addSpacer()
  
  let df = new DateFormatter()
  df.dateFormat = "yyyyMMddHHmm"
  
  let df2 = new DateFormatter()
  df2.dateFormat = "M월 d일 HH시 기준"
  
  let dataTimeText = vStack1.addText(df2.string(df.date(cache.dataTime)))
  dataTimeText.font = Font.systemFont(10)
  dataTimeText.textOpacity = 0.8
  dataTimeText.textColor = new Color("ffffff")
  
  let vStack2 = hStack.addStack()
  vStack2.layoutVertically()
  
  for(let i = 0; i < 4 || i < USER_CITY.length; i++){
    let cityStack = vStack2.addStack()
    
    let cityName = cityStack.addText(USER_CITY[i] + " ")
    cityName.font = Font.boldSystemFont(12)
    cityName.textColor = new Color("ffffff")
    
    let cityPrevText = cityStack.addText(cache[USER_CITY[i]].prevConfirmed[0].toLocaleString() + "명 ")
    cityPrevText.font = Font.lightMonospacedSystemFont(12)
    cityPrevText.textOpacity = 0.8
    cityPrevText.textColor = new Color("ffffff")
    
    let symbol2 = cityStack.addImage(SFSymbol.named("person.2.fill").image)
    symbol2.tintColor = new Color("ffffff")
    symbol2.imageSize = new Size(14, 14)
    symbol2.imageOpacity = 0.8
    
    let cityConfirmedRateText = cityStack.addText(cache[USER_CITY[i]].confirmedPer100k.toLocaleString() + "명")
    cityConfirmedRateText.font = Font.mediumMonospacedSystemFont(12)
    cityConfirmedRateText.textOpacity = 0.8
    cityConfirmedRateText.textColor = new Color("ffffff")
    
    vStack2.addSpacer(7)
  }
  
  vStack2.addSpacer()
  
  let stack5 = vStack2.addStack()
  stack5.centerAlignContent()
  stack5.url = "https://ncov.kdca.go.kr"
  
  let symbol3 = stack5.addImage(SFSymbol.named("arrow.up.right").image)
  symbol3.tintColor = new Color("ffffff")
  symbol3.imageSize = new Size(14, 14)
  symbol3.imageOpacity = 0.8
  
  let baseText6 = stack5.addText(" 질병관리청 • 코로나19")
  baseText6.font = Font.systemFont(12)
  baseText6.textOpacity = 0.8
  baseText6.textColor = new Color("ffffff")
  
} else if(config.widgetFamily == "accessoryRectangular"){
  let stack1 = widget.addStack()
  stack1.centerAlignContent()
  let baseText1 = stack1.addText("어제 ")
  baseText1.font = Font.boldSystemFont(11)
  let prevConfirmedText = stack1.addText(cache['합계'].prevConfirmed[0].toLocaleString() + "명")
  stack1.addSpacer()
  
  let stack2 = widget.addStack()
  stack2.centerAlignContent()
  let baseText2 = stack2.addText(USER_CITY[0] + " ")
  baseText2.font = Font.boldSystemFont(11)
  let cityPrevText = stack2.addText(cache[USER_CITY[0]].prevConfirmed[0].toLocaleString() + "명")
  stack2.addSpacer()
  
  let stack3 = widget.addStack()
  stack3.centerAlignContent()
  let baseText3 = stack3.addText("전체 ")
  baseText3.font = Font.boldSystemFont(11)
  let totalConfirmedText = stack3.addText(cache['합계'].totalConfirmed.toLocaleString() + "명")
  stack3.addSpacer()
  
}

let simpleGradient = new LinearGradient()
simpleGradient.colors = [new Color("0f1228"), new Color("1a1e43")]
simpleGradient.locations = [0, 1]
simpleGradient.startPoint = new Point(0, 0)
simpleGradient.endPoint = new Point(1, 1)

widget.backgroundGradient = simpleGradient

widget.refreshAfterDate = new Date(Date.now() + 1000 * 300)

Script.setWidget(widget)
if(config.runsInApp){ widget.presentSmall() }
