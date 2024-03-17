class Timeline {
	constructor(_parentElement) {
		this.parentElement = _parentElement
		this.initVis()
	}

	initVis() {
		const vis = this

		vis.MARGIN = { LEFT: 45, RIGHT: 100, TOP: 0, BOTTOM: 20 }
		vis.WIDTH = 650 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
		vis.HEIGHT = 80 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
		
		vis.svg = d3
			.select(vis.parentElement)
			.append("svg")
			.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
			.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

		vis.g = vis.svg
			.append("g")
			.attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)

		vis.x = d3.scaleTime().range([0, vis.WIDTH])
		vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])

		vis.xAxisCall = d3.axisBottom()
		vis.xAxis = vis.g
			.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${vis.HEIGHT})`)

		vis.areaPath = vis.g.append("path")
			.attr("fill", "#ccc")

		// initialize brush component
		vis.brush = d3.brushX()
			.handleSize(10)
				.extent([[0, 0], [vis.WIDTH, vis.HEIGHT]])
				.on("brush", brushed)
				.on("end", brushed)
				

		// append brush component
		vis.brushComponent = vis.g
			.append("g")
			.attr("class", "brush")
			.call(vis.brush)

		vis.wrangleData()
	}

	wrangleData() {
		const vis = this
		// convert this to average.
		vis.variable = "resale_price"
		// const dayNest = d3.group(calls, (d) => formatTime(d.date))

		vis.dataFiltered = Array.from(dateNest, ([key, values]) => ({
			year: key,
			sum: d3.mean(values, (d) => d[vis.variable]),
		}))

		vis.updateVis()
	}

	updateVis() {
		const vis = this

		vis.t = d3.transition().duration(750)

		// update scales
		vis.x.domain(d3.extent(vis.dataFiltered, (d) => d.year))
		vis.y.domain([0, d3.max(vis.dataFiltered, (d) => d.sum)])

		// update axes
		vis.xAxisCall.scale(vis.x)
		vis.xAxis.transition(vis.t).call(vis.xAxisCall)

		// area path generator
		vis.area = d3
			.area()
			.x((d) => vis.x(d.year))
			.y0(vis.HEIGHT)
			.y1((d) => vis.y(d.sum))

		vis.areaPath
			.data([vis.dataFiltered])
			.attr("d", vis.area)
	}
}

function brushed(event) {
	if (!event.selection) return
	const [x0, x1] = event.selection.map(Timeline.x.invert)
}
