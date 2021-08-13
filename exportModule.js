let overview; var currentCnt; var currentGap; var totalGap; var resDate;
  
const getData = async () => {
  const dataURL = "https://apiv2.corona-live.com/stats.json"
  const data = await new Request(dataURL).loadJSON()
  overview = data["overview"]

  currentCnt = overview["current"][0]
  currentGap = overview["current"][1]
  // totalGap = overview["confirmed"][1]
  
  const dataURL2 = 'http://ncov.mohw.go.kr'
  let webView = new WebView()
  await webView.loadURL(dataURL2)

  let covid = await webView.evaluateJavaScript(`
      const baseSelector = 'div.mainlive_container div.liveboard_layout '
      let date = document.querySelector(baseSelector + 'h2 span.livedate').innerText
      let domestic = document.querySelector(baseSelector + 'div.liveNum_today_new ul li:nth-child(1) span.data').innerText
      let overseas = document.querySelector(baseSelector + 'div.liveNum_today_new ul li:nth-child(2) span.data').innerText

      completion({date, count: {
          domestic: domestic.replace(",", ""), overseas
      }, wpsData: WPS_data })
  `, true)

  totalGap = parseInt(covid.count.domestic) + parseInt(covid.count.overseas)
  resDate = covid.date.replace(/\(|\)/g, '').split(',')[0]
    
  return [currentCnt, currentGap, totalGap]
}

const getDefString = (target, org) => {
  if(org > 0) { return "+" + target.toString() }
  else { return target.toString() }
}

const addComma = (target) => {
  return target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

module.exports = {
  getData: async () => {
    await getData()
  },
  getCurrent: async () => {
    return [addComma(currentCnt), getDefString(addComma(currentGap), currentGap)]
  },
  getPrevTot: async () => {
    return addComma(totalGap)
  }
}
