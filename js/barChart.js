class BarChart {
  constructor(_parentElement, _variable, _title) {
    this.parentElement = _parentElement
    this.variable = _variable
    this.title = _title

    this.initVis()
  }

  initVis() {
    const vis = this

    vis.MARGIN = { LEFT: 80, RIGHT: 100, TOP: 50, BOTTOM: 110 }
    vis.WIDTH = 700 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 345 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM

    vis.svg = d3
      .select(vis.parentElement)
      .append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)

    vis.x = d3.scaleBand().range([0, vis.WIDTH]).padding(0.5)

    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])

    vis.yAxisCall = d3.axisLeft().ticks(5).tickSize(-vis.WIDTH, 0)

    vis.xAxisCall = d3.axisBottom()
    vis.xAxis = vis.g
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${vis.HEIGHT})`)
    vis.yAxis = vis.g.append("g").attr("class", "y axis")
    vis.color = d3.scaleOrdinal(d3.schemeTableau10).domain(["2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"])

    vis.z = d3.scaleLinear().range([vis.HEIGHT, 0])
    vis.zAxis = vis.g.append("g").attr("class", "z axis")
    vis.zAxisCall = d3.axisRight().ticks(5).tickSize(vis.WIDTH, 0)
    
    vis.lineGroup = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)
    
    vis.tooltip = d3
      .select(vis.parentElement)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    // vis.g
    //   .append("text")
    //   .attr("class", "x-axis label")
    //   .attr("y", vis.HEIGHT+130)
    //   .attr("x", (vis.WIDTH/ 2))
    //   .attr("font-size", "16px")
    //   .attr("text-anchor", "middle")
    //   .text('Town')

    vis.g
      .append("text")
      .attr("class", "y-axis label")
      .attr("y", -60)
      .attr("x", -vis.HEIGHT / 2)
      .attr("font-size", "16px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-89)")
      .text("Average Resale Price ($)")

    vis.g
      .append("text")
      .attr("class", "z-axis label")
      .attr("y", -vis.WIDTH-50)
      .attr("x", vis.HEIGHT/2)
      .attr("font-size", "16px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(90)")
      .text("Units Sold")

    vis.g
      .append("text")
      .attr("class", "title")
      .attr("y", -15)
      .attr("x", vis.WIDTH / 2)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text(vis.title)

    vis.wrangleData()
  }

  wrangleData() {
    const vis = this
  
    vis.townPriceDictionary = townPriceDictionary
    vis.variable = $("#flat-select").val()
    
    
    
    let filteredData = {}


    // Filter the townDictionary to include only the selected flat type
    Object.entries(vis.townPriceDictionary).forEach(([town, flatTypes]) => {
      const averageResalePrice = flatTypes[vis.variable]
      filteredData[town] = {[vis.variable]: averageResalePrice}
    })
    
    
    if (!vis.flatCount || reTabulate) {
      // Counting the occurrence for line chart
      vis.flatCount = uniqueTowns.map((town) => {
        const flatOccurrence = {}
        uniqueFlats.forEach((flatType) => {
          const count = calls.filter((d) => d.town === town && d.flat_type === flatType).length
          flatOccurrence[flatType] = count
        })

        // Sum all flat type occurrences in each flat type
        const allCount = Object.values(flatOccurrence).reduce((sum, count) => sum + count, 0)
        flatOccurrence["ALL"] = allCount

        return { town, flatOccurrence }
        })
    }
  
    if (!vis.maxOccurrence || reCalcCounts || reTabulate) {
      vis.maxOccurrence = Math.max(...vis.flatCount.map((flatCount) => flatCount.flatOccurrence[vis.variable]))
    }
    
    vis.filteredData = filteredData
    console.log(vis.filteredData)
    vis.updateVis()
  }

  updateVis() {
    const vis = this
  
    vis.t = d3.transition().duration(750)
  
    // Filter data to exclude empty flat types for each town
    const filteredData = Object.entries(vis.filteredData).map(([town, flatTypes]) => ({
      town,
      flatTypes: Object.entries(flatTypes)
        .map(([flatType, averageResalePrice]) => ({
          flatType,
          averageResalePrice,
        }))
        .filter((d) => d.averageResalePrice !== 0),
    }))
    
    // Update scales
    vis.x.domain(filteredData.map((d) => d.town))
    vis.y.domain([0,d3.max(filteredData, (d) => d3.sum(d.flatTypes, (flatType) => flatType.averageResalePrice))])
    vis.z.domain([0, vis.maxOccurrence])
  
    // Update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis
      .transition(vis.t)
      .call(vis.xAxisCall)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "-0.6em")
      .attr("transform", "rotate(-89)")
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)
    vis.zAxisCall.scale(vis.z)
    vis.zAxis.transition(vis.t).call(vis.zAxisCall)
  
    // Update stacked bars
    const townGroups = vis.g.selectAll(".townGroup").data(filteredData, (d) => d.town)
  
    townGroups.exit().remove()
  
    const enterTownGroups = townGroups
      .enter()
      .append("g")
      .attr("class", "townGroup")
      .attr("transform", (d) => `translate(${vis.x(d.town)},0)`)
  
    enterTownGroups
      .merge(townGroups)
      .selectAll("rect")
      .data((d) => d.flatTypes, (d) => d.flatType)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", vis.HEIGHT)
            .attr("height", 0)
            .attr("width", vis.x.bandwidth())
            .attr("fill", (d) => vis.color(d.flatType))
            .on("mouseover", (event, d) => vis.showTooltip(event, d))
            .on("mouseout", () => vis.hideTooltip()),
        (update) => update,
        (exit) =>
          exit.transition(vis.t).attr("y", vis.HEIGHT).attr("height", 0).remove()
      )
      .transition(vis.t)
      .attr("x", 0)
      .attr("y", function (d) {
        const townData = d3.select(this.parentNode).datum()
        const currentIndex = townData.flatTypes.findIndex(
          (flatType) => flatType.flatType === d.flatType
        )
        const previousSums = townData.flatTypes
          .slice(0, currentIndex)
          .map((flatType) => flatType.averageResalePrice)
        const sum = d3.sum(previousSums, (averageResalePrice) => averageResalePrice)
        return vis.y(sum + d.averageResalePrice)
      })
      .attr("height", (d) => vis.y(0) - vis.y(d.averageResalePrice))
      .attr("width", vis.x.bandwidth())
    
    const line = d3.line()
      .x(d => vis.x(d.town) + vis.x.bandwidth() / 2)
      .y(d => vis.z(d.flatOccurrence[vis.variable]))
    
    const linePath = vis.lineGroup.selectAll(".line-path")
      .data([vis.flatCount])
    
    linePath.enter()
      .append("path")
      .attr("class", "line-path")
      .merge(linePath)
      .transition(vis.t)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("transform", `translate(0, ${vis.lineY(0)})`)
    
    linePath.exit().remove()

    reCalcCounts = false
    reTabulate = false
  }

  lineY(value) {
    const vis = this
    return vis.HEIGHT - vis.y(value)
  }

  showTooltip(event, d) {
    const vis = this
    const formatSi = d3.format(".2s")
		function formatAbbreviation(x) {
			const s = formatSi(x)
			switch (s[s.length - 1]) {
				case "k": return s.slice(0, -1) + "K" // thousands
			}
			return s
		}

    vis.tooltip.style("opacity", 1)
    
    const flatType = d.flatType
    const averageResalePrice = d.averageResalePrice
  
    // Update the tooltip content and position
    vis.tooltip
      .html(`<strong>Flat Type:</strong> <br>${flatType}<br>
             <strong>Average Resale Price:</strong> <br>$${formatSi(averageResalePrice/1000)}K`)
      .style("left", `${20+event.offsetX}px`)
      .style("top", `${event.offsetY+100}px`)
  }

  hideTooltip() {
    const vis = this

    // Hide the tooltip
    vis.tooltip.style("opacity", 0)
  }
}
