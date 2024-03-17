// global variables
let allCalls
let calls
let nestedCalls
let donut
let revenueBar
let durationBar
let unitBar
let stackedLine
let timeline
let treemap
let startTime
let duration
let dateNest
let reCalculateFlag
let uniqueTowns
let townDictionary
let uniqueFlats
let reCalcCounts
let reTabulate
let reFilterTown
let changeValue

const parseTime = d3.timeParse("%Y-%m")
const formatTime = d3.timeFormat("%Y")
const parseYear = d3.timeParse("%Y")

d3.csv("data/hdb-resale-prices_2000-2023May.csv").then(data => {    

	data = data.filter(d => d.flat_type !== "1 ROOM" && d.flat_type !== "MULTI-GENERATION") // remove the flat type as not all years record the data.

	data.forEach(d => {
		d.resale_price = Number(d.resale_price)
		d.year = parseYear(d.month.split('-')[0])
	})

	console.log(parseYear('2023'.split('-')[0]))
	allCalls = data
	calls = data
	
	dateGroup = data
	nestedCalls = d3.group(calls, (d) => d.town)

	// Get all unique towns in an array
	uniqueTowns = Array.from(new Set(data.map(d => d.town)))
	uniqueTowns.sort((a, b) => a.localeCompare(b))	

	// Get all unique flats in an array
	uniqueFlats = ["2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"]

    townPriceDictionary = {}

	// Create keys in the townPriceDictionary
    uniqueTowns.forEach((town) => {
		townPriceDictionary[town] = {}
		townPriceDictionary[town]['ALL'] = 0
      	uniqueFlats.forEach((flatType) => {
        townPriceDictionary[town][flatType] = 0
      })
    })
	
    // Group data based on town and flat type
    const groupedData = d3.group(calls, (d) => d.town, (d) => d.flat_type)

    // Calculate the average resale price for each flat type within each town
    groupedData.forEach((townData, town) => {
      townData.forEach((flatTypeData, flatType) => {
        const resalePrices = flatTypeData.map((d) => d.resale_price)
        const averageResalePrice = d3.mean(resalePrices)
        townPriceDictionary[town][flatType] = averageResalePrice
		townPriceDictionary[town]['ALL'] += averageResalePrice
      })
	  townPriceDictionary[town]['ALL'] = townPriceDictionary[town]['ALL']/5
    })
	
	console.log(groupedData)
	donut = new DonutChart("#pie-chart")
	bar = new BarChart("#bar-chart", "resale_price", "Resale Price Distribution and Units Sold by Town")

	// Group by date for stackedLineChart
	dateNest = d3.group(calls, d => d.year)
	stackedLine = new StackedLineChart("#stacked-area")
	// treemap = new TreeMap("#tree-map")	
	timeline = new Timeline("#timeline")
})

$("#flat-select").on("change", () => {
	reCalcCounts = true
	stackedLine.wrangleData()
	bar.wrangleData()
})

$("#town-select").on("change", () => {
	reFilterTown = true
	// stackedLine.wrangleData() // decided not to use the town filter on stackedLinez
	donut.wrangleData()
})

$("#value-select").on("change", () => {
	reCalculateFlag = true
	changeValue = true
	stackedLine.wrangleData()
})

function brushed(event) {

	const selection = event.selection

	if (!selection) { // reset the date :D
		const defaultValue = [
			parseYear('2000'),
			parseYear('2023')
		]
		changeDates(defaultValue)
	}
	else {
		const newValues = selection.map(timeline.x.invert)
		changeDates(newValues)
	}
  }


function changeDates(values) {
	reCalculateFlag = true
	reCalcCounts = true
	reTabulate = true
	calls = allCalls.filter(d => ((d.year >= values[0]) && (d.year <= values[1])))
	dateNest = d3.group(calls, d => d.year)

	nestedCalls = d3.group(calls, d=>d.flat_type)
	

	$("#dateLabel1").text(formatTime(values[0]))
	$("#dateLabel2").text(formatTime(values[1]))

	donut.wrangleData()
	stackedLine.wrangleData()
	
	// Recalculate for Town
	townPriceDictionary = {}

	// Create keys in the townPriceDictionary
    uniqueTowns.forEach((town) => {
		townPriceDictionary[town] = {}
		townPriceDictionary[town]['ALL'] = 0
      	uniqueFlats.forEach((flatType) => {
        townPriceDictionary[town][flatType] = 0
      })
    })
	
    // Group data based on town and flat type
    const groupedData = d3.group(calls, (d) => d.town, (d) => d.flat_type)

    // Calculate the average resale price for each flat type within each town
    groupedData.forEach((townData, town) => {
      townData.forEach((flatTypeData, flatType) => {
        const resalePrices = flatTypeData.map((d) => d.resale_price)
        const averageResalePrice = d3.mean(resalePrices)
        townPriceDictionary[town][flatType] = averageResalePrice
		townPriceDictionary[town]['ALL'] += averageResalePrice
      })
	  townPriceDictionary[town]['ALL'] = townPriceDictionary[town]['ALL']/5
    })

	
	bar.wrangleData()
	
}