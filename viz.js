$(document).ready(function() {

    // constants
    var backgroundColor = "#ccc";

    // problem hue range not good for viz, better brightness range
    var color = d3.scaleLinear()
        .domain([0, 1])
        .range(["DodgerBlue", "DeepPink"]);

    var radius = d3.scaleLinear()
        .domain([1, 2922])
        .rangeRound([3, 10]) // instead of range, to avoid blurry

    var chartPadding = 20;

    // for the hover tooltip
    var currentMousePos = { x: -1, y: -1 };

    // helper function to render float values nicely
    function round2dezimals(float) {
        return (Math.round(float * 100) / 100)
    }

    // load researcher data
    var topResearchers = d3.csv("data/top_researchers_by_projects_detailed.csv").then(function(data) {
        topResearchers = data;
    });

    var allResearchersGender = d3.csv("data/gender_ratio_in_dataset.csv").then(function(data) {
        allResearchersGender = data;
    });

    // load person data (person_id, name, first_name, gender)
    var personData = d3.csv("data/reduced_data_person.csv").then(function(data) {
        personData = data;
    });

    // remove all institutes with no coordinates
    institute_data.features = institute_data.features.filter(function(d) {
        return d.geometry.coordinates[0];
    })

    // get the dynamic dims of chart for responsive rendering
    var dim = d3.select('.chart').node().getBoundingClientRect();
    var width = dim.width - 2 * chartPadding,
        height = dim.height - 2 * chartPadding;

    // first chart
    var showWelcome = function() {
        // clear chart
        $('.chart').fadeOut(100, function() {
            d3.select('.chart').selectAll("*").remove();
            d3.select('.chart')
                .append('div')
                .attr('class', 'welcome-pic');
            $('.chart').fadeIn(100)
        });
    };

    // second chart
    var showOverallGenderData = function() {
        // clear chart
        $('.chart').fadeOut(100, function() {
            d3.select('.chart').selectAll("*").remove();

            // load data for this chart
            var profGenderData = d3.csv("data/gender_ratio_in_dataset.csv").then(function(data) {

                // create barchart
                var svg = d3.select('.chart')
                    .append('svg')
                    .attr('width', dim.width)
                    .attr('height', 500);

                // margins for the rectangles
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 100
                    },
                    width = +svg.attr("width") - margin.left - margin.right,
                    height = +svg.attr("height") - margin.top - margin.bottom,
                    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var x = d3.scaleBand()
                    .rangeRound([0, width])
                    .domain(data.map(function(d) {
                        return d.gender;
                    }))
                    .paddingOuter(0.3)
                    .paddingInner(0.3);

                var y = d3.scaleLinear()
                    .rangeRound([height, 0])
                    .domain([0, d3.max(data, function(d) {
                        return Number(d.count);
                    })])

                // create the x axis
                g.append("g")
                    .call(d3.axisBottom(x))
                    .attr("transform", "translate(0," + (height + 6) + ")");

                // create the y axis
                g.append("g")
                    .call(
                        d3.axisLeft(y).tickSize(6)
                    )
                    //.attr("y", 6)
                    .append("text")

                // create the bars
                g.selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("fill", function(d) {
                        if (d.gender == "male") {
                            return color(0);
                        } else if (d.gender == "female") {
                            return color(1);
                        } else if (d.gender == "unclear") {
                            return "#333";
                        } else {
                            return "#aaa";
                        }
                    })
                    .attr("x", function(d) {
                        return x(d.gender);
                    })
                    .attr("y", function(d) {
                        return height;
                    })
                    .attr("width", function(d) {
                        return x.bandwidth();
                    }).style("cursor", "pointer")
                    .append("svg:title") // hover effect
                    .text(function(d) {
                        return d.count;
                    });

                // transition animation
                g.selectAll("rect")
                    .transition()
                    .transition().delay(function(d, i) { return i * 500; })
                    .duration(500)
                    .attr("height", function(d) {
                        return height - y(d.count) //height-y(Number(d.count));
                    })
                    .attr("y", function(d) { return y(d.count); });

                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("transform", "rotate(-90)")
                    .attr("text-anchor", "end")
                    .attr("y", 30)
                    .attr("x", -150)
                    //.attr("dy", -20)
                    .text("Researcher Count");

                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("text-anchor", "end")
                    .attr("x", width - 200)
                    .attr("y", height + margin.bottom + margin.top)
                    .text("Gender");


                $('.chart').fadeIn(100);
            });
        });
    };

    var showProfGenderValidation = function() {

        $('.chart').fadeOut(100, function() {
            d3.select('.chart').selectAll("*").remove();

            // reformat the data for the stacked barchart
            var profGenderData = d3.csv("data/prof_gender_data.csv", function(d) {
                return {
                    correct: +d.correct,
                    mismatch: +d.mismatch,
                    unassigned: +d.unassigned,
                    unclear: +d.unclear,
                    gender: d.gender_title
                }
            }).then(function(data) {

                //convert the data for barchart
                total1 = data[0].correct + data[0].mismatch + data[0].unassigned + data[0].unclear;
                total2 = data[1].correct + data[1].mismatch + data[1].unassigned + data[1].unclear;


                data[0].correctP = data[0].correct / total1
                data[0].mismatchP = data[0].mismatch / total1
                data[0].unassignedP = data[0].unassigned / total1
                data[0].unclearP = data[0].unclear / total1

                data[1].correctP = data[1].correct / total2
                data[1].mismatchP = data[1].mismatch / total2
                data[1].unassignedP = data[1].unassigned / total2
                data[1].unclearP = data[1].unclear / total2

                var bars = []
                bars.push({ gender: data[0].gender, type: "correct", count: data[0].correct, percent: data[0].correctP });
                bars.push({ gender: data[0].gender, type: "mismatch", count: data[0].mismatch, percent: data[0].mismatchP });
                bars.push({ gender: data[0].gender, type: "unassigned", count: data[0].unassigned, percent: data[0].unassignedP });
                bars.push({ gender: data[0].gender, type: "unclear", count: data[0].unclear, percent: data[0].unclearP });

                bars.push({ gender: data[1].gender, type: "correct", count: data[1].correct, percent: data[1].correctP });
                bars.push({ gender: data[1].gender, type: "mismatch", count: data[1].mismatch, percent: data[1].mismatchP });
                bars.push({ gender: data[1].gender, type: "unassigned", count: data[1].unassigned, percent: data[1].unassignedP });
                bars.push({ gender: data[1].gender, type: "unclear", count: data[1].unclear, percent: data[1].unclearP });

                // create barchart
                var svg = d3.select('.chart')
                    .append('svg')
                    .attr('width', dim.width)
                    .attr('height', 500);

                // margins for the rectangles
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 100
                    },
                    width = +svg.attr("width") - margin.left - margin.right,
                    height = +svg.attr("height") - margin.top - margin.bottom,
                    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var x = d3.scaleBand()
                    .rangeRound([0, width])
                    .domain(["Male", "Female"])
                    .paddingOuter(0.3)
                    .paddingInner(0.3);

                var y = d3.scaleLinear()
                    .range([height, 0])
                    .domain([0, 1])

                // create the x axis
                g.append("g")
                    .call(d3.axisBottom(x))
                    .attr("transform", "translate(0," + (height + 6) + ")");

                // create the y axis
                g.append("g")
                    .call(d3.axisLeft(y).tickSize(6))

                // keep track of stack bar value
                var stack = 0;

                // create the bars
                g.selectAll(".bar")
                    .data(bars)
                    .enter()
                    .append("rect")
                    .attr("fill", function(d) {
                        if (d.gender == "prof_male" & d.type == "correct") {
                            return "#579d1c"; // color(0); // #579d1c
                        } else if (d.gender == "prof_female" & d.type == "correct") {
                            return "#579d1c"; //color(1); // #579d1c
                        } else if (d.type == "unclear") {
                            return "#ffd320"; //"#777"; // #ffd320
                        } else if (d.type == "unassigned") {
                            return "#004586"; //"#ccc"; //  #004586
                        } else if (d.type == "mismatch") {
                            return "#ff420e"; //"#000"; // #ff420e
                        }
                    })
                    .attr("x", function(d) {
                        if (d.gender == "prof_male") return x("Male")
                        else
                            return x("Female");
                    })
                    .attr("y", function(d, i) {
                        console.log(i % 4 + ": " + stack + " " + d.type)
                        stack = stack + d.percent;
                        if ((i + 1) % 4 == 0) stack = 0;
                        return y(stack) - 6; 
                    }).attr("height", function(d) {
                        return height - y(d.percent)
                    })
                    .attr("width", function(d) {
                        return x.bandwidth();
                    }).style("cursor", "pointer")
                    .append("svg:title") 
                    .text(function(d) {
                        return d.type + "\n" + round2dezimals(d.percent) + "\n" + d.count;
                    })

                // add axis labels
                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("transform", "rotate(-90)")
                    .attr("text-anchor", "end")
                    .attr("y", 30)
                    .attr("x", -150)
                    .text("Percent");

                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("text-anchor", "end")
                    .attr("x", width - 200)
                    .attr("y", height + margin.bottom + margin.top)
                    .text("Professor Gender");

                // d3 legend ;)
                d3.select('.chart')
                    .append('div')
                    .attr('class', 'prof_gender_data_legend');

                $('.chart').fadeIn(100);
            });
        });
    };

    // histogramm
    var showProjectGenderIndex = function() {
        // clear chart
        $('.chart').fadeOut(100, function() {
            d3.select('.chart').selectAll("*").remove();
            d3.select('.chart')
                .append('div')
                .attr('class', 'project_gender_index');
            $('.chart').fadeIn(100)
        });
    };


    // map viz
    var map;
    var zoom = d3.zoom();
    var deutschland;
    var institute;
    var showMap = function() {

        // clear chart
        $('.chart').fadeOut(100, function() {

            // clear chart
            d3.select('.chart').selectAll("*").remove();

            map = d3.select('.chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'map')
                .style('background-color', backgroundColor);

            deutschland = map.append('g');

            var projection = d3.geoAlbers()
                .scale(4000)
                .center([11.0, 50.8])
                .rotate([0, 0])
                .translate([width / 2, height / 2]);

            var geoPath = d3.geoPath()
                .projection(projection)
                .pointRadius([5]);

            deutschland.selectAll('path')
                .data(schland.features)
                .enter()
                .append('path')
                .attr("class", "schland")

                .attr('fill', '#888')
                .attr('stroke', '#000')
                .attr('d', geoPath);

            // show barchart of institute, top10 researchers
            institute = map.append('g');
            institute.selectAll('circle')
                .attr("class", "institute")
                .data(institute_data.features.filter(function(d) {
                    return d.properties.total_projects_count > 5;
                }))
                .enter()
                .append('circle')
                .attr('r', function(d, i) {
                    return radius(d.properties.total_projects_count);
                })
                .attr('cx', function(d) {
                    return projection(d.geometry.coordinates)[0]
                })
                .attr('cy', function(d) {
                    return projection(d.geometry.coordinates)[1]
                })
                .attr('fill', function(d, i) {
                    return color(d.properties.institution_gender_index);
                })
                .attr('stroke-width', 0)
                .attr('class', 'institute-circle')
                .on('click', clickMapCircle)
                .append("svg:title")
                .text(function(institut) {
                    return institut.properties.name + "\n" + (Math.round(institut.properties.institution_gender_index * 100) / 100);
                });

            // zoom handling
            map.call(d3.zoom()
                .extent([
                    [0, 0],
                    [dim.width, dim.height]
                ])
                .scaleExtent([1, 50])
                .on("zoom", zoomed));

            function zoomed() {
                deutschland.attr("transform", d3.event.transform);
                institute.attr("transform", d3.event.transform);

                var scaleFactor = d3.event.transform.k;

                institute.selectAll('circle')
                    .attr('r', function(d, i) {
                        return radius(d.properties.total_projects_count) / (scaleFactor * 0.8);
                    })
            }

            $('.chart').fadeIn(100)
        });
    };

    function clickMapCircle(institut) {

        $('.info').fadeIn();

        // clear old data
        var info = d3.selectAll('.info');
        info.style('display', 'block').selectAll("*").remove();
        console.log(institut.properties.name + ":" + institut.properties.institution_gender_index);

        info.append('div')
            .attr('class', 'institute-gi')
            .style('background-color', color(institut.properties.institution_gender_index))
            .text(round2dezimals(institut.properties.institution_gender_index));
        info.append('div')
            .attr('class', 'institute-name')
            .text(institut.properties.name);

        // get researchers from this institute, and only get those with gender index defined
        var instituteResearchers = topResearchers.filter(function(d) {
            return d.institution_id == institut.properties.institution_id && d.person_gender_index != "";
        });

        // sort by project count
        instituteResearchers.sort((a, b) => d3.descending(Number(a.project_count), Number(b.project_count))).reverse();

        // create barchart
        var svg = info
            .style('background-color', backgroundColor)
            .append('svg')
            .attr('width', dim.width)
            .attr('height', (instituteResearchers.length + 1) * 38);

        // margins for the rectangles
        var margin = {
                top: 20,
                right: 20,
                bottom: 60,
                left: 280
            },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var x = d3.scaleLinear()
            .rangeRound([0, width])
            .domain([0, d3.max(instituteResearchers, function(d) {
                return Number(d.project_count);
            })])
            .nice();

        var y = d3.scaleBand()
            .rangeRound([height, 0])
            .domain(instituteResearchers.map(function(d) {
                return d.name;
            }))
            .paddingInner(0.3);

        console.log(instituteResearchers.map(function(d) {
            return d.name;
        }))

        // create the x axis
        g.append("g")
            .call(
                d3.axisBottom(x)
            )
            .attr("transform", "translate(0," + (height + 6) + ")");

        // create the y axis
        g.append("g")
            .call(
                d3.axisLeft(y).tickSize(6)
            ).attr("stroke-width", 0)
            .append("text")

        // create the bars
        g.selectAll(".bar")
            .data(instituteResearchers)
            .enter()
            .append("rect")
            .attr("fill", function(d) {
                return color(d.person_gender_index);
            })
            .attr("x", function(d) {
                return 0;
            })
            .attr("y", function(d) {
                return y(d.name);
            })
            .attr("width", function(d) {
                return x(Number(d.project_count));
            })
            .attr("height", y.bandwidth())
            .style("cursor", "pointer")
            .on('mouseover', function(d) {
                var gender = (d.gender == "F" ? "Female" : "Male");

                $(".tooltip").show()
                    .html('<div><div class="institute-gi" style="background-color: ' + color(d.person_gender_index) + '">' + round2dezimals(d.person_gender_index) + '</div><div class="person-name">' + d.name + '</div></div><div style="claer:both"><b>Project Count:</b> ' + d.project_count + '<br><b>Gender:</b> ' + gender + '</di>')
                    .css({ 'top': currentMousePos.y + 'px', 'left': currentMousePos.x + 'px' });


            }).on('mouseout', function(d) {

                $(".tooltip").hide()

            });

        svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "end")
            .attr("x", width + margin.left)
            .attr("y", height + margin.top)
            .text("Project Count");
    }

    function resetZoom() {
        deutschland.attr("transform", d3.zoomIdentity);
        institute.attr("transform", d3.zoomIdentity);


        institute.selectAll('circle')
            .attr('r', function(d, i) {
                return radius(d.properties.total_projects_count);
            })
    }

    var showSorted = function() {

        $('.info').fadeOut();
        $('.schland').fadeOut();
        resetZoom();

        var institute = institute_data.features.filter(function(d) {
            return d.properties.total_projects_count > 5;
        })

        institute.sort((a, b) => d3.descending(Number(a.properties.total_projects_count), Number(b.properties.total_projects_count)));

        var topUnis = institute.slice(0, 40)
        console.log(topUnis)

        var y = d3.scaleBand()
            .rangeRound([0, dim.height - 50])
            .domain(topUnis.map(function(d) {
                return d.properties.name;
            }))
            .paddingInner(0.5);


        map.style('background-color', '#fff');


        map.selectAll('g').call(zoom.transform, d3.zoomIdentity);

        var circles = d3.selectAll('.institute-circle')
            .transition()
            .duration(2000)
            .attr("cx", function(d, i) {
                //console.log(d);
                //return 1;

                if (topUnis.some(e => d.properties.name == e.properties.name)) {
                    return 30; //y(d.properties.name);
                } else {
                    return -999;
                }

            })
            .attr("cy", function(d, i) {
                //console.log(d);

                if (topUnis.some(e => d.properties.name == e.properties.name)) {
                    return y(d.properties.name) + 25;
                } else {
                    return 100
                }

            });

        var t = map.append('g');
        t.selectAll('g')
            .data(topUnis)
            .enter()
            .append('text')
            .attr("class", "institute-labels")
            .transition()
            .duration(0)
            .delay(1500)
            .attr('x', function(d, i) {
                return 50;
            })
            .attr('y', function(d, i) {
                return y(d.properties.name) + 30;
            })
            .text(function(d, i) {
                return d.properties.name;
            })
    };

    // scroll handling

    //waypoints scroll constructor
    function scroll(selector, offset, func1, func2) {
        return new Waypoint({
            element: document.getElementById(selector),
            handler: function(direction) {
                direction == 'down' ? func1() : func2();
            },
            offset: offset
        });
    };

    showWelcome();

    scroll('overall_gender_data', '75%', showOverallGenderData, showWelcome);
    scroll('prof_gender_data', '75%', showProfGenderValidation, showOverallGenderData);
    scroll('project_gender_index', '75%', showProjectGenderIndex, showProfGenderValidation);
    scroll('map', '75%', showMap, showProjectGenderIndex);
    scroll('sort_values', '75%', showSorted, showMap);
});

$(document).mousemove(function(event) {
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
});