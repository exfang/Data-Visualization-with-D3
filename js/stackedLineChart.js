class StackedLineChart {
  constructor(_parentElement) {
    this.parentElement = _parentElement

    this.initVis()
  }
  
  initVis() {
    
    const vis = this

    vis.MARGIN = { LEFT: 45, RIGHT: 100, TOP: 80, BOTTOM: 80 }
    vis.WIDTH = 650 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 370 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM

    vis.svg = d3.select(vis.parentElement).append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)

      vis.color = d3.scaleOrdinal(d3.schemeTableau10).domain(["2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"])

    vis.x = d3.scaleTime().range([0, vis.WIDTH])
    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])

    vis.yAxisCall = d3.axisLeft()
      .ticks(6)
      .tickSize(-vis.WIDTH, 0)

    vis.xAxisCall = d3.axisBottom()
      .tickSize(-vis.HEIGHT, 0)
      
    vis.xAxis = vis.g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${vis.HEIGHT})`)
 
    vis.yAxis = vis.g.append("g")
      .attr("class", "y axis")

    // X axis Label
		vis.xLabel = vis.g.append("text")
      .attr("class", "x axisLabel")
      .attr("y", vis.HEIGHT + 60)
      .attr("x", vis.WIDTH / 2)
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .text("Year")

    // Y axis Label
    vis.yLabel = vis.g.append("text")
      .attr("class", "y axisLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -vis.HEIGHT/2)
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      
      
    vis.title = vis.g.append("text")
      .attr("class", "title")
      .attr("y", -40)
      .attr("x", 55)
      .attr("font-size", "20px")
      .attr("text-anchor", "start")

    // Create a tooltip div
    vis.tooltip = d3.select(vis.parentElement)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    vis.addLegend()

    vis.wrangleData()
  }

  wrangleData() {
    // NEW IDEA: Filter by resale price and qty sold?
    
    const vis = this
    
    vis.variable = $("#flat-select").val()
    vis.valueSelected = $("#value-select").val()
    
    // Calculate average values for each flat type
    const flatTypes = ["2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"]

    vis.dateNest = dateNest

    if (!vis.averageData || reCalculateFlag) { // only recalculate when timeline filter or initial page load (reduce computational time)

      vis.averageData = new Map()
      // if (reCalculateFlag) {
      //   vis.xAxisCall = d3.axisBottom()
      // }
      
      // console.log("Calculating averages for the StackedAreaChart.js")
      flatTypes.forEach(flatType => {
        const filteredData = Array.from(vis.dateNest, ([key, values]) => {
          const filteredData = {
            year: key,
          }
    
          let total = 0
          let counter = 0
    
          values.forEach(current => {
            if (current.flat_type === flatType) {
              total += current.resale_price
              counter++
            }
          })
    
          const average = counter > 0 ? total/counter : 0
          
          if (vis.valueSelected === 'Units Sold') {
            filteredData[flatType] = counter
          }
          else {
            filteredData[flatType] = average
          }
          // filteredData['Units'] = counter
          return filteredData
        })
        
        vis.averageData.set(flatType, filteredData)
      })
      
    }
    
    // Filter the data based on the selected value
    if (vis.variable !== "ALL") {
      vis.dataFiltered = vis.averageData.get(vis.variable)
    } 
    else {
      // If the selected value is "ALL", show all room types
      vis.dataFiltered = Array.from(vis.dateNest, ([key, values]) => {
        const filteredData = {
          year: key,
        }
  
        flatTypes.forEach(flatType => {
          const data = vis.averageData.get(flatType)
          const average = data.find(d => d.year === key)[flatType]
  
          filteredData[flatType] = average
        })
  
        return filteredData
      })
    }
    console.log(vis.dataFiltered)
    vis.updateVis()
  }

  updateVis() {
    const vis = this
    // const startTime = performance.now()
    vis.t = d3.transition().duration(750)
    
    vis.maxDateVal = d3.max(vis.dataFiltered, d => {
      const flatTypes = Object.keys(d).filter(key => key !== 'year')
      return d3.sum(flatTypes, key => d[key]) // Get the sum of values for each data point
    })
    
    if (vis.valueSelected === 'Units Sold') {
      vis.yLabel.text("Number of Units Sold")
      vis.title.text("Units Sold of Flat Types over the Years")
    }
    else {
      vis.yLabel.text("Average Resale Price ($)")
      vis.title.text("Resale Price of Flat Types over the Years")
    }
    // fix for format values
		const formatSi = d3.format(".2s")
		function formatAbbreviation(x) {
			const s = formatSi(x)
			switch (s[s.length - 1]) {
        case "M": 
          return s.slice(0, -1) + "M"
				case "k": 
          return s.slice(0, -1) + "K" // thousands
			}
			return s
		}

    if (vis.variable === "ALL") {
      vis.maxVal = d3.max(vis.dataFiltered, d => {
        const flatTypes = Object.keys(d).filter(key => key !== 'year')
        return d3.max(flatTypes, key => d[key])
      })
    } else {
      vis.maxVal = d3.max(vis.dataFiltered, d => d[vis.variable])
    }
      
    // Update scales
    vis.x.domain(d3.extent(vis.dataFiltered, d => d.year))
    vis.y.domain([0, vis.maxVal])
    
    // Update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-89)")
    
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall.tickFormat(formatAbbreviation))
    
    // Remove the previous line charts
    vis.g.selectAll(".line").remove()

    const flatTypes = Object.keys(vis.dataFiltered[0]).filter(key => key !== 'year')
    
    flatTypes.forEach(flatType => {
      const data = vis.dataFiltered.map(d => ({
        year: d.year,
        value: d[flatType]
      }))
    
      const line = d3.line()
        .x(d => vis.x(d.year))
        .y(d => vis.y(d.value))
  
      vis.g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", vis.color(flatType))
        .style('stroke-width', '3px')
        .style("fill", "none")
        .on("mouseover", (event, d) => {
          // Show tooltip on mouseenter
          const mouseX = d3.pointer(event)[0]
          const bisect = d3.bisector(d => d.year).left
          const x0 = vis.x.invert(mouseX)
          const i = bisect(d, x0, 1)
          const d0 = d[i - 1]
          const d1 = d[i]
          const currentData = x0 - parseTime(d0.year) > parseTime(d1.year) - x0 ? d1 : d0
          vis.tooltip.style("opacity", 1)
          if (vis.valueSelected === 'Units Sold') {
            vis.tooltip.html(`<strong>${flatType}</strong>:<br> ${currentData.value} units`)
            .style("left", `${20+event.offsetX}px`)
            .style("top", `${event.offsetY+100}px`)
          }
          else {
            vis.tooltip.html(`<strong>${flatType}</strong>:<br> $${(formatSi(currentData.value))}`)
            .style("left", `${20+event.offsetX}px`)
            .style("top", `${event.offsetY+100}px`)
          }
        })
        .on("mousemove", (event) => {
          vis.tooltip
            .style("left", `${20+event.offsetX}px`)
            .style("top", `${event.offsetY+20}px`)
        })
        .on("mouseleave", () => {
          vis.tooltip.style("opacity", 0)
        })
      }
    )
    reCalculateFlag = false
    reFilterTown = false
    // const duration = performance.now() - startTime
    // console.log(`total update vis duration ${duration}ms`)
  }
  
  addLegend() {
    const vis = this
    const legend = vis.g.append("g")
      .attr("transform", "translate(10, -25)")

    const legendArray = [
      { label: "2 ROOM", color: vis.color("2 ROOM")},
      { label: "3 ROOM", color: vis.color("3 ROOM")},
      { label: "4 ROOM", color: vis.color("4 ROOM")},
      { label: "5 ROOM", color: vis.color("5 ROOM")},
      { label: "EXECUTIVE", color: vis.color("EXECUTIVE")}
    ]

    const legendCol = legend.selectAll(".legendCol")
      .data(legendArray)
      .enter().append("g")
        .attr("class", "legendCol")
        .attr("transform", (d, i) => `translate(${i * 90}, 0)`)
        
    legendCol.append("rect")
      .attr("class", "legendRect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.color)
      .attr("fill-opacity", 1)

    legendCol.append("text")
      .attr("class", "legendText")
      .attr("x", 20)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .text(d => d.label)
  } 
}