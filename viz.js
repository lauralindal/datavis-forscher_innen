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
    var dim = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    var chartPadding = 20;
    if(dim.width < 700) {
        chartPadding = 10;
    }


    var chartWidth = Math.round(dim.width/2 - 2 * chartPadding),
        chartHeight = Math.round(dim.height - 100 - 2 * chartPadding);

    if(dim.width < 700) {
        chartWidth = Math.round(dim.width - 2 * chartPadding);
        chartHeight = Math.round(dim.height/2 - 2 * chartPadding);
    }

    console.log("chart width: " + chartWidth);
    console.log("chart height: " + chartHeight);

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
                    .attr('width', chartWidth)
                    .attr('height', chartHeight);

                console.log(chartWidth);

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
                    .attr("x", -Math.round(height/2))
                    //.attr("dy", -20)
                    .text("Researcher Count");

                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("text-anchor", "end")
                    .attr("x", Math.round(width/2) + margin.right + margin.left)
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
                    .attr('width', chartWidth)
                    .attr('height', chartHeight);

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
                    .attr("y", margin.left - 40)
                    .attr("x", -height/2)
                    .text("Percent");

                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("text-anchor", "end")
                    .attr("x", Math.round(width/2) + margin.right + margin.left)
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

            // load data for this chart
            var genderHistData = d3.csv("data/project_gender_index.csv").then(function(data) {

                //console.log(data);

                // create barchart
                var svg = d3.select('.chart')
                    .append('svg')
                    .attr('width', chartWidth)
                    .attr('height', chartHeight);

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

                var x = d3.scaleLinear()
                  .domain([0, 1])
                  .range([0, width]);
                g.append("g")
                  .attr("transform", "translate(0," + height + ")")
                  .call(d3.axisBottom(x));

                var histogram = d3.histogram()
                  .value(function(d) { return d.gender_index; })
                  .domain(x.domain())
                  .thresholds(10);


                  var bins = histogram(data);

                  console.log(bins)
                  var y = d3.scaleLinear()
                      .range([height, 0]);
                      y.domain([0, d3.max(bins, function(d) { return d.length; })]); 
                  g.append("g")
                      .call(d3.axisLeft(y));


                 // append the bar rectangles to the svg element
                  g.selectAll("rect")
                      .data(bins)
                      .enter()
                      .append("rect")
                        .attr("x", 1) // 1
                        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                        .attr("height", function(d) { return height - y(d.length); })
                        .style("fill", function(d){ return color(d3.mean(d,  function(d2) { 
                            return Number(d2.gender_index); 
                        })); })
                    .style("cursor", "pointer")
                    .append("svg:title") // hover effect
                    .text(function(d) {
                        return d.length;
                    });


                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("transform", "rotate(-90)")
                    .attr("text-anchor", "end")
                    .attr("y", 30)
                    .attr("x", -Math.round(height/2))
                    //.attr("dy", -20)
                    .text("Project Count");

                svg.append("text")
                    .attr("class", "barchart-label")
                    .attr("text-anchor", "end")
                     .attr("x", Math.round(width/2) + margin.right + margin.left)
                    .attr("y", height + margin.bottom + margin.top)
                    .text("Gender Index");
                  /*

               

                
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

                
*/
            $('.chart').fadeIn(100);
        });
        });
    };


    // map viz
    var map;
    var zoom = d3.zoom();
    var deutschland;
    var institute;
    var instituteNamen;
    var map1;
    var showMap = function() {

        map1 = true;
        map2 = false;

        // clear chart
        $('.chart').fadeOut(100, function() {

            // clear chart
            d3.select('.chart').selectAll("*").remove();

            map = d3.select('.chart')
                .append('svg')
                .attr('width', chartWidth)
                .attr('height', chartHeight)
                .attr('class', 'map')
                .style('background-color', backgroundColor);

            deutschland = map.append('g');

            var scale = 4000;
            if(dim.width < 700)
                scale = 2000;
            var projection = d3.geoAlbers()
                .scale(scale)
                .center([11.0, 50.8])
                .rotate([0, 0])
                .translate([chartWidth / 2, chartHeight / 2]);

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
            instituteNamen = map.append("g");

            // zoom handling
            map.call(d3.zoom()
                .extent([
                    [0, 0],
                    [chartWidth, chartHeight]
                ])
                .scaleExtent([1, 50])
                .on("zoom", zoomed));

            function zoomed() {
                deutschland.attr("transform", d3.event.transform);
                institute.attr("transform", d3.event.transform);
                instituteNamen.attr("transform", d3.event.transform);

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

        if(dim.width < 700){
            if(map1)
                $('.map-text1').hide()
            if(map2)
                $('.map-text2').hide()
        }

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

        var leftMargin = 280;
        var barChartWidth = chartWidth - 20;
        if(dim.width <700){
            leftMargin = 10;
            barChartWidth = barChartWidth - 20;
        }

        // create barchart
        var svg = info
            .style('background-color', backgroundColor)
            .append('svg')
            .attr('width', barChartWidth)
            .attr('height', (instituteResearchers.length + 1) * 38);

        // margins for the rectangles
        var margin = {
                top: 20,
                right: 20,
                bottom: 60,
                left: leftMargin
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

        var mouseEvent = 'mouseover';
        if(dim.width <700)
            mouseEvent = 'click';

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
            .on(mouseEvent, function(d) {
                var gender = (d.gender == "F" ? "Female" : "Male");

                var xpos = currentMousePos.x;
                var ypos = currentMousePos.y;
                if(dim.width < 700) {
                    var offset = $('.info1').offset();
                    xpos = d3.event.clientX - (offset.top - $(window).scrollTop());
                    ypos = d3.event.clientY ;//- offset.left + $(window).scrollLeft();

                    console.log(offset.top);
                }

                $(".tooltip").show()
                    .html('<div><div class="institute-gi" style="background-color: ' + color(d.person_gender_index) + '">' + round2dezimals(d.person_gender_index) + '</div><div class="person-name">' + d.name + '</div></div><div style="claer:both"><b>Project Count:</b> ' + d.project_count + '<br><b>Gender:</b> ' + gender + '</di>')
                    .css({ 'top': ypos + 'px', 'left': xpos + 'px' });

            }).on('mouseout', function(d) {
                if(dim.width >= 700)
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
        instituteNamen.attr("transform", d3.zoomIdentity);

        institute.selectAll('circle')
            .attr('r', function(d, i) {
                return radius(d.properties.total_projects_count);
            })
    }

    var showSorted = function() {

        map1 = false;
        map2 = true;

        $('.info').fadeOut();
        $('.schland').fadeOut();
        $(".tooltip").hide()
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

        // resset zoom
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

        //var t = map.append('g');
        // add name labels
        instituteNamen.selectAll('g')
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

    
    var offset = '75%';
    if(dim.width < 700) {
        offset = '100%';
    }

    scroll('overall_gender_data', offset, showOverallGenderData, showWelcome);
    scroll('prof_gender_data', offset, showProfGenderValidation, showOverallGenderData);
    scroll('project_gender_index', offset, showProjectGenderIndex, showProfGenderValidation);
    scroll('map', offset, showMap, showProjectGenderIndex);
    scroll('sort_values', offset, showSorted, showMap);

    $(document).mousemove(function(event) {
        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
    });
});

