//NOTE: Must view firedata.html with VS Code Live Server extension. Otherwise CORS blocks the csv reading.
console.log("script.js loaded");

// load & parse fire_df.csv -- fire_df.csv is NASA csv, preprocessed in python to create new columns for 'Year', 'Month', 'Date', 'Time'
let fireDF;
d3.csv("fire_df.csv")
    .then(data => {
    fireDF = data
    //console.log(fireDF) //check if data is parsed
    graph(fireDF) //function call to create graph
    })
    .catch(error => console.log(error.message));


const graph = fireDF => {
    // get year column from fire_df.csv
    const years = []
    for(let i = 0; i < fireDF.length; i++) {
        years.push(fireDF[i].Year);
    }


    //count occurrences of each year in years array
    const count = {}
    for(const yr of years) {
        if(count[yr]) {
            count[yr]++;
        } else {
            count[yr] = 1;
        }
    }
    //console.log(count) //to check if year object array is created.


    //save last 6 objects in array  
    const last6 = Object.keys(count).slice(-6);
    const last6Count = last6.map(key => count[key]);


    //create graph  --  https://www.chartjs.org/docs/latest/getting-started/
     const chartData = {
        labels: last6, //x axis labels
        datasets: [{
            label: 'Fireball Frequency - Past 6 Years',
            backgroundColor: 'rgb(150, 134, 142)',
            borderColor: 'rgb(255, 99, 132)',
            data: last6Count, //y axis data
        }]
    };
        

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    reverse: true,
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Number of Fireballs'
                    }
                }
            }
        }
    };


    //Injects the chart into the canvas element
    const myChart = new Chart(
        document.getElementById('myChart'),
        config
        );
    


    //FUNCTION TO UPDATE GRAPH WITH SELECTED YEAR
    const updateGraph = () => {
        const year = parseInt(document.getElementById('year').value); //get value from text input
        //input validation
        if(isNaN(year) || year < 1988 || year > 2022) {
            alert("Invalid Input. \nYear must be numeric and between 1988 and 2022."); //alerts are kinda annoying, but it works
            return;
        } else {
            const count = {} //create empty object to store year data
            for(let i = 0; i < fireDF.length; i++) { //loops through all fire_df.csv data
                if(fireDF[i].Year == year) { //if year input matches fireDF year column
                    if(count[fireDF[i].Month]) { //if month already present in count object
                        count[fireDF[i].Month]++; //increment month count
                    } else {
                        count[fireDF[i].Month] = 1; //else month set to one if not already present in count object
                    }
                }
            }
            //console.log(count) //(test) check if count object is created
    
            const months = Object.keys(count); //get months from count object keys
            const monthCount = months.map(key => count[key]); //get month count from count object values
            //console.log(monthCount) //(test) check if monthCount array is created
    
            //Setup chart with selected year data
            myChart.data.labels = months; //x axis labels
            myChart.data.datasets[0].data = monthCount; //y axis data
            myChart.options.scales.x.reverse = true; //reverse x axis. by default it was december --> january
            myChart.options.scales.x.title.text = "Months"; //set x axis title to 'Months'
            myChart.data.datasets[0].label = `Fireball Frequency - ${year}`; //update dataset title with selected year
            myChart.update();

            //pass graph data to interpretation function
            interpretYear(year, months, monthCount);
        }
        
    }


    //FUNCTION TO UPDATE GRAPH WITH YEAR SPAN
    const updateSpan = () => {
        const startYear = parseInt(document.getElementById('startYear').value); //get start year value
        const endYear = parseInt(document.getElementById('endYear').value); //get end year value
        //input validation
        if((startYear > endYear) || isNaN(startYear) || isNaN(endYear)) { //alert if year span is invalid or not numeric
            alert("Invalid Input. \nStart year must be less than end year");
            return;
        } else {
            const count = {} //create empty object to store year data
            for(let i = 0; i < fireDF.length; i++) { //loops through all fire_df.csv data
                if(fireDF[i].Year >= startYear && fireDF[i].Year <= endYear) { //if fireDF year column is between start and end year
                    if(count[fireDF[i].Year]) { //if count object already has year
                        count[fireDF[i].Year]++; //increment the year's count
                    } else {
                        count[fireDF[i].Year] = 1; //if year not present in count object, set to 1
                    }
                }
            }

            const years = Object.keys(count); //get years from count object keys. used for labeling x axis
            const yearCount = years.map(key => count[key]); //create array of year object values

            //setup chart with selected year span data
            myChart.data.labels = years; //x axis labels
            myChart.options.scales.x.title.text = "Years"; //set x axis title to 'Years'
            myChart.data.datasets[0].data = yearCount; //y axis data
            myChart.options.scales.x.reverse = false; 
            myChart.data.datasets[0].label = `Fireball Frequency - ${startYear} to ${endYear}`; //update dataset label with selected year span
            myChart.update(); //update chart
            interpretSpan(startYear, endYear, years, yearCount); //pass graph data to interpretation function
        }
        
    }

    //Data Interpretation from update graph by year
    const interpretYear = (year, months, monthCount) => {
        //get max value in monthCount array
        const max = Math.max(...monthCount);
        //get months with the most number of fireballs
        const maxMonth = [];
        for(let i = 0; i < monthCount.length; i++) {
            if(monthCount[i] == max) {
                maxMonth.push(months[i]);
            }
        }
        maxMonth.reverse();
        //console.log('maxMonth ' + maxMonth)
        //get months with the least number of fireballs
        const min = [];
        for(let i = 0; i < monthCount.length; i++) {
            if(monthCount[i] == 1) {
                min.push(months[i]);
            }
        }
        min.reverse();
        //console.log('min ' + min)
        //get min value in monthCount array
        const minCount = Math.min(...monthCount);
        
        //get total number of fireballs in year
        const total = monthCount.reduce((a, b) => a + b, 0);
        //console.log('total ' + total)
        
        //get average number of fireballs per month in ${year}
        const average = (total / 12);

        //write interpretation to html
        document.getElementById('interpret').innerHTML= `
            <h3>Team Fireball's Data Interpretation: ${year}</h3>
            <ul>
                <li>The year ${year} had a total of ${total} fireballs </li>
                <li>The month(s) with the most recorded fireballs was ${maxMonth.join(', ')}</li>
                <li>${maxMonth.join(', ')} had recorded ${max} fireballs</li>
                <li>The month(s) with the least recorded fireballs was ${min.join(', ')}</li>
                <li>${min.join(', ')} had recorded ${minCount} fireballs</li>
                <li>Average number of fireballs per month in ${year}: ${average.toFixed(2)}</li>
            </ul>`
    }
    //Data Interpretation from update graph by year span
    const interpretSpan = (startYear, endYear, years, yearCount) => {
        //get max value in yearCount array
        const max = Math.max(...yearCount);
        //get years with the most number of fireballs
        const maxYear = [];
        for(let i = 0; i < yearCount.length; i++) {
            if(yearCount[i] == max) {
                maxYear.push(years[i]);
            }
        }
        //get min value in yearCount array
        const min = Math.min(...yearCount);
        //get years with the least number of fireballs
        const minYear = [];
        for(let i = 0; i < yearCount.length; i++) {
            if(yearCount[i] == min) {
                minYear.push(years[i]);
            }
        }
        //get total number of fireballs in year span
        const total = yearCount.reduce((a, b) => a + b, 0);

        const average = (total / (endYear - startYear));
        
        //write interpretation to html
        document.getElementById('interpret').innerHTML= `
            <h3>Team Fireball's Data Interpretation: ${startYear} to ${endYear}</h3>
            <ul>
                <li>The year span of ${startYear} to ${endYear} had a total of ${total} fireballs </li>
                <li>The year(s) with the most recorded fireballs was ${maxYear.join(', ')}</li>
                <li>${maxYear.join(', ')} had recorded ${max} fireballs</li>
                <li>The year(s) with the least recorded fireballs was ${minYear.join(', ')}</li>
                <li>${minYear.join(', ')} had recorded ${min} fireballs</li>
                <li> Average number of fireballs per year: ${average.toFixed(2)}</li>
            </ul>`
    }


    //event listener for update single year button
    document.getElementById('update').addEventListener('click', updateGraph);

    //event listener for year span button
    document.getElementById('updateSpan').addEventListener('click', updateSpan);
}