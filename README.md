# Gendered collaboration amongst German researchers

## tl;dr
A visualization of gendered collaboration among researchers funded by the DFG in order to explore gender equality within academia. To try the visualization, look [no further than right here](http://m16.feste-ip.net/datavis-forscher_innen/prototype.html).

## Table of Contents

* [Project description](#project-description)
  * [Target audience](#target)
  * [Functionality](#functionality)
  * [External Data](#external)
* [Design Decicions based on “Four Nested Levels of Visualization Design” by Munzner](#design)
  * [Domain problem characterization](#domain)
  * [Data / task abstraction](#abstraction)
  * [Visual encoding / interaction design](#encoding)
  * [Algorithm design](#algorithm)
* [Validation](#validation)
* [Installation](#installation)
* [Manual](#manual)
* [Contributors](#contributors)
* [Copyright](#copyright)

## <a name="project-description"></a> Project description
As one of the largest German instutition to fund research is [commited to gender equality](https://www.dfg.de/en/service/press/press_releases/2017/press_release_no_24/index.html "Press Release No. 24 | 5 July 2017"), it makes sense to look at their own data in order to analyze how and where measures need to be taken to own up to these promises. We're using parts of the [GEPRIS data](https://gepris.dfg.de/gepris/OCTOPUS) to look at collaborations within research project that are funded by the DFG. As [research](https://www.equityinstem.org/networks-metaanalysis/) shows, people tend to form their networks with people who are similar to them, which can hinder gender inclusion in fields that have traditionally been shaped by male networks. To find out whether this is the case for German academia and research as well, we are visualizing the collaboration amongst researchers funded by DFG.

###  <a name="target"></a> Target audience
The target audience for this project are equal opportunity commissioners at universities and people interested in gender equality.

###  <a name="functionality"></a> Functionality
We're giving you the opportunity to explore different universities' degrees of gender equality to see where there's still work to be done.

###  <a name="external"></a> External data
[GEPRIS data](https://gepris.dfg.de/gepris/OCTOPUS)

[Worldwide Gender-Name Dictionary](https://ideas.repec.org/c/wip/eccode/10.html)

[Geodata from Open Streetmap](https://www.openstreetmap.org/copyright)

External libraries in addition to d3.js: [jQuery](https://jquery.com/), [Waypoints.js](http://imakewebthings.com/waypoints/)

##  <a name="design"></a> Design Decisions based on “Four Nested Levels of Visualization Design” by Munzner

### <a name="domain"></a> Domain problem characterization
"There is now abundant data that diversity is essential to scientific excellence, with experiments showing that diverse teams have cognitive diversity that allows them to outperform homogeneous teams." reads a [statement](https://fas.columbia.edu/files/fas/content/Columbia-ArtsandSciences-PPC-Equity-Reports-2018.pdf) by Columbia University in 2018. While their statement focuses on students, the same applies to researchers.

We are thus interested in gender relations (as one aspect of diversity) within German academia. This is important knowledge for equal opportunity commissioners at German universities: How diverse are research projects regarding the gender ratios of their teams? How diverse are individual researchers' collaborations? And how diverse are universities regarding the gender ratio of projects that they host?

Our data is the [GEPRIS dataset](https://gepris.dfg.de/gepris/OCTOPUS) that contains projects funded by the DFG, including the people and institutions involved in those projects upon application. Please note that the GEPRIS data does not consider time, meaning that locations and titles represent the most current data. This could lead to bias and spurious links. We've also derived a probable gender for each person based on the first name. This data stems from [Lax-Martinez, G., Raffo, J. and Saito, K. 2016. "Identifying the Gender of PCT inventors", WIPO Economic Research Working Paper 33.](https://ideas.repec.org/c/wip/eccode/10.html). We validated this assignment by picking the title "Professor" and "Professorin", and comparing them to the gender assignment. Less than 1% of the assignments were in contrast to the titles, meaning that we would assume a similar error ratio for the entire data set. Additionally, around 19% of first names could not be assigned a gender at all.

### <a name="abstraction"></a> Data / task abstraction

The original GEPRIS dataset is made up of tables of mainly nominal data (project IDs, person IDs, institution IDs, names, institution address...). We've created additional nominal data for an inferred gender and spatial data (geological position) for the institutions. Beyond that, we calculated a project_gender_index. This is value between 0 and 1, based on the gender ratio of all people involved in a specific project (that has more than one person). 0 indicates that there are only men in a project whereas 1 indicates that there are only women in a project. Following, the person_gender_index is the mean of project_gender_index for all projects a person is involved in and institution_gender_index is the mean of person_gender_index of all people related to that institution. Ordinal data consists of the amount of projects that a researcher is involved in (in order to find the top 10 researchers per institution) as well as that number summed up for each institution.

The tasks for this data are to discover distributions, browse the topology and identify & compare institutions.

### <a name="encoding"></a> Visual encoding / interaction design

We decided to explain a bit about the data we used and how we used it first in order to allow for critical thinking. Thus, some information is displayed in scrollable interaction before we display the main visualization. Said information is about the general gender ratio in the dataset (*bar chart* for quick orientation) as well as the ratio of correctly inferred gender (*bar chart* for the same reason). Additionally, there is a *histogram* to show the distribution of our project gender index. In bold text, at the end of each introductory paragraph for each visualization, we added the caption of the graph.

We decided to use a *map* to display the institutions in an *overview* and *bar charts for detail*. The map helps the user to find an orientation but also to get a first impression of the general distribution of data. The *dot size* for each institution represents the amount of projects that people belonging to that institution are involved in. The *color* of each dot represents the institution_gender_index. Users can zoom into the map in order to identify individual institutions. On click, we will provide further detail about the institution. Assuming that the researchers involved in the most projects can also have the most impact on future projects and their gender ratios, we show these 10 researchers per institution with their person_gender_index, using the same color scheme as before, and the amount of projects they are involved in. This provides an option to real life interaction in which researchers could be approached about strategies they are already using or that can help them diversify their collaborations - depending on said gender index.

Finally, we display a *ranking* of the top 30 institutions by their project count to illustrate how the most actively supported institutions are doing regarding their gender index. We're keeping the meaning of *dot size* and *dot color* from out previous visualization, thus providing linked highlighting.

More details on our design decision will now follow.

#### Bar Chart

We added a transition animation to the first bar chart to capture the user's attention and to highlight the fact that this is a interactive visualization so that the user is invited to interact with the bar chart. On hover, we show the exact values for each category. With this bar chart, we also first introduce the user to the color scheme which we will stick to thereafter.

Color encoding: We tried various color schemes, but settled for blue - pink because it is widely used for color encoding gender and as such users will quickly and intuitively understand the meaning. Later on, we add a gradient to the color. We picked this specific blue and pink so the differences in the gradient are very pronounced and small changes are noticeable. We are, nonetheless, critical about how this color scheme reproduces gender stereotypes.

#### Stacked Barchart

The stacked bar chart shows our validation of the data. The color scheme was chosen so the user quickly notices that "there is a lot of green", meaning most of the gender inference was correct. Green here representing that standard color for "good", yellow for "not so good" and red for "bad", which is very intuitive. The missing data was encoded in a neutral blue. On hover, we show the exact value in addition to the percentage.

#### Histogram

The histogram links back to our color coding. Since the bins are double encoded with both the color as well as the gender index value, a legend for the color is not needed. The histogram illustrates how skewed the data is towards male domination of teams, while also giving an overview about the total distribution of the data. The text explains our "gender index" metric, as well as add some more basic facts about the distribution. We chose to keep it really light on the statistics, as not to overwhelm the user, and keep them focused on the main question.

#### Map

The map invites the user to *explore* the data. This statial representation facilitates searching and browsing: the user might know where the institution of interest is located, so they can quickly find them, much faster than e.g. a long alphabetical list. If they are interested in a specific institution, they may want to compare it to other institutions in that region: so the "interest" is space correlated. Lastly, a map is visually appealing and a welcome variety after displaying bar charts only, so far.

To prevent overlapping of the circles, we do not scale the circles when zooming in. The farther the user zooms in, the less overlapping occurs.

An overview-detail approach was chosen because while we do want to show the data about individual researchers, the researcher dataset is very large. We thus aggregated our data per institution and show this aggregated data on the map. Once the user clicks on an institution, they find out more detail specific to the top 10 most important researchers at the institution (measured by number of projects).
In the "Top 10 researcher bar chart", the user can hover over the bars to see even more details about the person of interest. The "gender index" is displayed prominently for both the institution and the researchers in a consistent way: as a "badge" double encoded with the value of the index as well as the color.

#### Top 30 Institutions

We added a transition animation to show the linkage between this visualization and the previous map. The 30 most important institutions (again measured be the number of projects) from the map are rearranged in a sequential way, ordered by importance.
This visualization was added to complement the map, to focus on the largest institutions and provide an alternative way of exploring the data. Here again, the user can interact and click on the institution to achieve the same results as with the map.


### <a name="algorithm"></a>Algorithm design
The dataset was already small due to the data preprocessing that we needed to create the gender index. However, we also decided to display only institutions that have more than five projects (TODO stimmt das noch? ja) related to them. Thus, we could ensure a quick visualization with focus on those institutions that matter on a larger scale of this context.

## <a name="validation"></a> Validation
We validated the design with one person who is doing their PhD in sociology and gender studies, and is thus very interested in this visualization. According to Munzner, possible threats are: addressing the wrong problem, bad data / operation abstraction, ineffective encoding / interaction technique, slow algorithm. We focused on the first three threats.

The scrollytelling part of the visualization was appreciated by the user, as the aim was clearly stated and context as well as criticism was given about the data.


(Validate your design and document lessons learned: Conduct an informal validation with at least one person who has not seen the visualization before. Let the person use the visualization and comment on it (“think aloud”; https://en.wikipedia.org/wiki/Think_aloud_protocol). Try to address the threats mentioned in the Munzner 2009 paper for the first three categories (domain, data/task, and visual encoding / interaction) and summarize the person’s answers. What did you learn from the validation for possible improvements of your visualization?)

## <a name="installation"></a> Installation
1. Clone this Repo
2. run prototype.html via http

*A hosted version is available [here](http://m16.feste-ip.net/datavis-forscher_innen/prototype.html)*

## <a name="manual"></a> Manual
[Video: screencast.mp4](screencast.mp4)

## <a name="contributors"></a> Contributors
Johannes P. and Laura L.

## <a name="copyright"></a> Data copyright
Data derived from original data provided by [GEPRIS](https://gepris.dfg.de) (c) Deutsche Forschungsgemeinschaft
