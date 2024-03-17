class DonutChart {
  constructor(_parentElement) {
    this.parentElement = _parentElement

    this.initVis()
  }

  initVis() {
    const vis = this

    vis.MARGIN = { LEFT: 300, RIGHT: 100, TOP: 40, BOTTOM: 0 }
    vis.WIDTH = 600 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 150 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
    vis.RADIUS = Math.min(vis.WIDTH, vis.HEIGHT) / 2

    vis.svg = d3
      .select(vis.parentElement)
      .append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

    vis.g = vis.svg
      .append("g")
      .attr("transform",`translate(${(vis.MARGIN.LEFT + vis.WIDTH / 2)}, ${vis.MARGIN.TOP + vis.HEIGHT / 2})`)

    vis.pie = d3.pie()
      // .padAngle(0.01)
      .value((d) => d.count)
      .sort(null)

    vis.arc = d3.arc().innerRadius(0).outerRadius(vis.RADIUS)

    vis.tooltip = d3
      .select(vis.parentElement)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    vis.g
      .append("text")
      .attr("y", -80) // -90 moves it up, -70 moves it down
      .attr("x", -vis.WIDTH/2+70)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Distribution of Flat Types")
        
    vis.color = d3.scaleOrdinal(d3.schemeTableau10).domain(["2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"])
    vis.addLegend()

    vis.wrangleData()
  }

  wrangleData() {
    const vis = this
    vis.townSelect = $("#town-select").val()
  
    vis.filteredCalls = calls
    if (reCalculateFlag === true) {
      if (vis.townSelect !== "ALL") {
        vis.filteredCalls = calls.filter((d) => d.town === vis.townSelect)
      } else {
        vis.filteredCalls = calls
        
      }
    }
    vis.dataLength = vis.filteredCalls.length
    const flatTypes = ["2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"]
  
    const sizeNest = d3.rollup(
      vis.filteredCalls,
      (v) => ({ count: v.length }),
      (d) => d.flat_type
    )
  
    vis.dataFiltered = flatTypes.map((flatType) => ({
      value: flatType,
      count: sizeNest.get(flatType)?.count || 0,
    }))
  
    vis.updateVis()
  }
  

  updateVis() {
    const vis = this

    vis.t = vis.svg.transition().duration(750)
    
    vis.path = vis.g.selectAll("path")
      .data(vis.pie(vis.dataFiltered))  

    vis.path.exit().remove()
    vis.path
      .transition(vis.t)
      .attrTween("d", (d) => vis.arcTween(vis, d))
    
    vis.path
      .enter()
      .append("path")
      .attr("fill", (d) => vis.color(d.data.value))
      .attr("d", vis.arc)
      .on("mouseover", (event, d) => vis.showTooltip(event, d))
      .on("mouseout", (event, d) => vis.hideTooltip(event, d))
  }

  arcTween(vis, d) {
    const i = d3.interpolate(vis._current, d)
    vis._current = i(1)
    return (t) => vis.arc(i(t))
  }

  showTooltip(event, d) {
    const vis = this
    const formatSi = d3.format(".4s")
    vis.tooltip.style("opacity", 1)
    vis.tooltip
      .html(`<strong>${d.data.value}</strong><br>
            <strong>Count:</strong> ${d.data.count}<br>
            <strong>Percentage:</strong> ${formatSi((d.data.count/vis.dataLength)*100)}%`)
      .style("left", `${20+event.offsetX}px`)
      .style("top", `${event.offsetY-20}px`)
    
  }

  hideTooltip(event) {
    const vis = this
    vis.tooltip.style("opacity", 0)
  }

  addLegend() {
    const vis = this

    const legend = vis.g.append("g").attr("transform", "translate(-100, -50)")

    const legendArray = [
      { label: "2 ROOM", color: vis.color("2 ROOM") },
      { label: "3 ROOM", color: vis.color("3 ROOM") },
      { label: "4 ROOM", color: vis.color("4 ROOM") },
      { label: "5 ROOM", color: vis.color("5 ROOM") },
      { label: "EXECUTIVE", color: vis.color("EXECUTIVE") },
    ]

    const legendRow = legend
      .selectAll(".legendRow")
      .data(legendArray)
      .join("g")
      .attr("class", "legendRow")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)

    legendRow
      .append("rect")
      .attr("class", "legendRect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => d.color)

    legendRow
      .append("text")
      .attr("class", "legendText")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .text((d) => d.label)
  }
}
