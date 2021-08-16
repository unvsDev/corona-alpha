var currentCnt; var currentGap; var totalGap;
  
const getData = async () => {
  const dataURL = "https://apiv2.corona-live.com/domestic-init.json"
  const data = await new Request(dataURL).loadJSON()
  
  currentCnt = data.statsLive.today
  let prevCnt = data.statsLive.yesterday
  currentGap = currentCnt - prevCnt
  totalGap = data.stats.cases[1]
  
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
