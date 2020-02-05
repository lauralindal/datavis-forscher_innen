# Gendered collaboration amongst German researchers

## tl;dr 
A visualization of gendered collaboration amongst researchers funded by the DFG in order to explore gender equality within academia.

## Table of Contents

* [Project description](#project-description)
  * [Target audience](#target)
  * [Domain problem characterization](#domain)
  * [Target audience](#target)
  * [Functionality](#functionality)
  * [External Data](#external)
 * [Design Decicions based on “Four Nested Levels of Visualization Design” by Munzner](#design)
  * [Data / task abstraction](#abstraction)
  * [Visual encoding / interaction design](#encoding)
  * [Algorithm design](#algorithm)
  * [Validation](#validation)
* [Installation](#installation)
* [Manual](#manual)
* [Contributors](#contributors)
* [Copyright](#copyright)

## <a name="project-description"></a> Project description
As one of the largest German instutition to fund research is [commited to gender equality](https://www.dfg.de/en/service/press/press_releases/2017/press_release_no_24/index.html "Press Release No. 24 | 5 July 2017"), it makes sense to look at their own data in order to analyze how and where measures need to be taken to own up to these promises. We're using parts of the GEPRIS data to look at collaborations within research project that are funded by the DFG. As [research](https://www.equityinstem.org/networks-metaanalysis/) shows, people tend to form their networks with people who are similar to them, which can hinder gender inclusion in fields that have traditionally been shaped by male networks. To find out whether this is the case for German academia and research as well, we are visualizing the collaboration amongst researchers funded by DFG.

###  <a name="target"></a> Target audience
The target audience for this project are equal opportunity commissioners at universities and people interested in gender equality. It should give you an opportunity to explore different universities' degrees of gender equality to see where there's still work to be done.

###  <a name="functionality"></a> Functionality
###  <a name="external"></a> External data

(The description of the project should not be too extensive but help people understand the project and your design decisions in detail. Describe the idea behind the visualization project, the target group, and what its functionality is (e.g., interaction). Please complete this description with said design decisions as stated above. Do not forget to describe external data sources you used, and mention libraries you used in addition to d3.js.)

##  <a name="design"></a> Design Decicions based on “Four Nested Levels of Visualization Design” by Munzner

### <a name="domain"></a> Domain problem characterization
see above for domain situation & target users & domain of interest & How gender diverse are research teams at German universities? How gender diverse is the collaboration between universities?. Our data is the GEPRIS dataset that contains projects funded by the DFG, including the people involved in those project upon application. We've also derived a probable gender based on the first name. This data stems from Lax-Martinez, G., Raffo, J. and Saito, K. 2016. "Identifying the Gender of PCT inventors", WIPO Economic Research Working Paper 33. 

There are 20% of first names that could not be assigned a gender. Please note that the GEPRIS data does not consider time, meaning that locations and titles represent the most current dat while change over time is not represented. This could lead to bias an spurious links between institutions.
           
### <a name="abstraction"></a> Data / task abstraction
Dataset overall: tables
Project IDs: nominal
Person IDs: nominal
Person Gender: nominal
Project role: nominal
Insitution adress: position

Discovery distribution. Browse topology. Identify & compare universities & individuals.
(Formulate the tasks in a domain-independent vocabulary. How did you prepare (aggregate, filter...) the data to support the tasks?)
           
### <a name="encoding"></a> Visual encoding / interaction design
(Describe the visual encoding and why you decided for it. What interaction types did you use and why?)
           
### <a name="algorithm"></a>Algorithm design
(How did you make sure that the computational complexity of your solution is appropriate? What is the bottleneck with respect to performance?)
            
## <a name="validation"></a> Validation 
(Validate your design and document lessons learned: Conduct an informal validation with at least one person who has not seen the visualization before. Let the person use the visualization and comment on it (“think aloud”; https://en.wikipedia.org/wiki/Think_aloud_protocol). Try to address the threats mentioned in the Munzner 2009 paper for the first three categories (domain, data/task, and visual encoding / interaction) and summarize the person’s answers. What did you learn from the validation for possible improvements of your visualization?)

## <a name="installation"></a> Installation
(How can I install the visualization project (step-by-step manual)? 

## <a name="manual"></a> Manual
(A brief manual about how to use the software. For this it makes sense to use screencasts or screenshots.)

## <a name="contributors"></a> Contributors
Johannes P. and Laura L.

## <a name="copyright"></a> Data copyright
Data derived from original data provided by https://gepris.dfg.de (c) Deutsche Forschungsgemeinschaft
