const findShortestPathWithDijkstra = require("./shortestPathWithDijkstra");
var _ = require('lodash');

const graph = {
    Miami: {Tampa: 280, Orlando: 236, Jacksonville: 347},
    Tampa: {Tallahassee: 276, Orlando: 84, Atlanta: 456, Miami: 280},
    Orlando: {Tampa: 84, Jacksonville: 141, Atlanta: 438, Tallahassee: 257, Miami: 236},
    Jacksonville: {Atlanta: 346, Miami: 347, Orlando: 141},
    Tallahassee: {New_Orleans: 387, Atlanta: 272, Orlando: 257, Tampa: 276, Nashville: 490},
    New_Orleans: {Houston: 348, Tallahassee: 387, Dallas: 492, Jackson: 188, Nashville: 533},
    Houston: {Dallas: 348, New_Orleans: 348},
    Atlanta: {Tallahassee: 272, Charlotte: 245, Nashville: 265, Jaskson: 381, Orlando: 438, Tampa: 456, Jacksonville: 346},
    Charlotte: {Nashville: 409, Atlanta: 245},
    Dallas: {Nashville: 664, Jackson: 402, Houston: 239, New_Orleans: 492},
    Jackson: {Dallas: 402, Atlanta: 381, Nashville: 415, New_Orleans: 188},
    Nashville: {Dallas: 664, Charlotte: 409, Atlanta: 265, Jackson: 415, New_Orleans: 533, Tallahassee: 490},

};

var orders = [
    {
        "order": 4,
        "pickCity": "Miami",
        "dropCity": "Nashville",
        "pallets": 5
    },
    {
        "order": 3,
        "pickCity": "Miami",
        "dropCity": "Atlanta",
        "pallets": 5
    },
    {
        "order": 1,
        "pickCity": "Miami",
        "dropCity": "Jacksonville",
        "pallets": 5
    },
    {
        "order": 2,
        "pickCity": "Miami",
        "dropCity": "Orlando",
        "pallets": 5
    }

]
    

    
var callback = function(error, retval){
    if (error){
        console.log(error)
        return;
    }
    
    retval.forEach(value => {
        console.log(value);
    });

};

var optimizeLoads = function(incomingOrders, executeFor, callback){   
    
    try {

        if (executeFor == null || executeFor < 0){
            executeFor = 30000;
        }

        var loads = handleOrders(incomingOrders, executeFor);

        //when done
        callback(null, loads);


    }
    catch(err) {
        callback(new Error(err));
    }
}

function handleOrders(orders, executeFor) {

    var loads = [];

    var currentLoad = 1;
    var endLoop = false;
    var stopIfAfter = Date.now() + executeFor;

    while (endLoop == false) {
        while (orders.length > 0){

            if (Date.now() > stopIfAfter){
                endLoop = true;
                return loads;
            }

            var arrayForLoad = [];

            var currentOrder;
            var path;
            var distance = 0;

            orders.forEach(order => {
                var currentPath = findShortestPathWithDijkstra(graph, order.pickCity, order.dropCity).path;
                var currentDistance = findShortestPathWithDijkstra(graph, order.pickCity, order.dropCity).distance;

                if (currentDistance > distance){
                    distance = currentDistance;
                    path = currentPath;
                    distance = currentDistance;
                    currentOrder = order;
                } 

            });

            arrayForLoad.push(currentOrder);

            _.remove(orders, function(e) {
                return e === currentOrder;
            })


            orders.forEach(order => {
                //is this order on path
                if (isOrderOnPath(order.dropCity, path)){
                        //does order exceed pallet count
                        if (orderCanFit(arrayForLoad, order.pallets)){
                            arrayForLoad.push(order);
                        }
                }
            });

            arrayForLoad.forEach(loadOrder => {
                orders.forEach(order => {
                    if (loadOrder == order){
                        _.remove(orders, function(e) {
                            return e === order;
                        })
                    }
                });
            })


            loads.push(convertToLoad(arrayForLoad, path, distance, currentLoad));
            currentLoad++;
        }
        return loads;
    }

}


function isOrderOnPath(dropCity, listOfCities){

    var f = false;
    var t = false;

    listOfCities.forEach(drop => {
        if (drop == dropCity){
            t = true;
        }
    });

    if (t){
        return t;
    }
    else {
        return f;
    }
}

function orderCanFit(arrayForLoad, pallets){
    var totalPallets = 0;
    arrayForLoad.forEach(order => {
        totalPallets += order.pallets;
    });

    if (totalPallets <= 26){
        if ((totalPallets + pallets) <= 26){
            return true;
        }
    }

    return false;
}

function convertToLoad(arrayForLoad, path, totalMiles, currentLoad){

    var route = [];

    var currentIndex = 0;

    var s = "";

    arrayForLoad.forEach(order => {
        if (currentIndex == (arrayForLoad.length - 1)){
            s += order.order.toString();
        }

        else {
            s += order.order.toString() + ", ";
        }
        currentIndex++;
    });

    currentIndex = 0;
    var totalPallets = 0;

    path.forEach(location => {
        arrayForLoad.forEach(order => {
            
            if (currentIndex == 0){
                route.push({
                    "city": arrayForLoad[0].pickCity,
                    "type": "pick",
                    "orders": "[" + s + "]"
                });
            }
            currentIndex++;
            if (order.dropCity == location){
                totalPallets += order.pallets;
                route.push({
                    "city": order.dropCity,
                    "type": "drop",
                    "orders": "[" + order.order + "]"
                })
            }
        });
    });

    var json = [
        {
            "load": currentLoad,
            "route": JSON.stringify(route),
            "pallets": totalPallets,
            "totalMiles": totalMiles
        }
    ]

    return (json);

}


optimizeLoads(orders, 10, callback);
process.exit(1);