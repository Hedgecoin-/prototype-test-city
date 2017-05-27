
$(document).ready(function(){
  var that = this;


  var gameState = {
    population: {
      idle: 5,
      foraging: 0,
      salvaging: 0,
      exploring: 0,
    },
    resources: {
      food: {
        number: 10,
        delta: 0,
      },
      materials: {
        number: 5,
        delta: 0,
      },
      fuel: {
        number: 0,
        delta: 0,
      },
      medicine: {
        number: 0,
        delta: 0,
      },
    },
    buildings: {
      empty: 1,
      infected: 1,
      shelter: 0,
      food: 0,
      materials: 0,
    },
  }

  var refs = {
    resources: {
      food: {
        number: $('#res-food'),
        delta: $('#res-food-delta'),
      },
      materials: {
        number: $('#res-materials'),
        delta: $('#res-materials-delta'),
      },
      fuel: {
        number: $('#res-fuel'),
        delta: $('#res-fuel-delta'),
      },
      medicine: {
        number: $('#res-medicine'),
        delta: $('#res-medicine-delta'),
      },
    },
    population: {
      total: $('#pop-total'),
      notHoused: $('#pop-not-housed'),
      idle: $('#pop-idle'),
      foraging: {
        min: $('#pop-foraging-min'),
        number: $('#pop-foraging'),
        max: $('#pop-foraging-max'),
      },
      salvaging: {
        min: $('#pop-salvaging-min'),
        number: $('#pop-salvaging'),
        max: $('#pop-salvaging-max'),
      },
      exploring: {
        min: $('#pop-exploring-min'),
        number: $('#pop-exploring'),
        max: $('#pop-exploring-max'),
      }
    },
    buildings: {
      total: $('#bld-total'),
      empty: $('#bld-empty'),
      infected: $('#bld-infected'),
      shelter: {
        min: $('#bld-shelter-min'),
        number: $('#bld-shelter'),
        max: $('#bld-shelter-max'),
      },
      food: {
        min: $('#bld-food-min'),
        number: $('#bld-food'),
        max: $('#bld-food-max'),
      },
      materials: {
        min: $('#bld-materials-min'),
        number: $('#bld-materials'),
        max: $('#bld-material-max'),
      },
    }
  }


  // Set Handlers
  SetHandlers();

  // Turn 0
  UpdateUI();

  function Update(){


    UpdateUI();
  }

  function UpdateUI(){
    // resources
    var rRes = refs.resources;
    var res = gameState.resources;
    rRes.food.number.text(res.food.number);
    rRes.food.delta.text(res.food.delta);
    rRes.materials.number.text(res.materials.number);
    rRes.materials.delta.text(res.materials.delta);
    rRes.fuel.number.text(res.fuel.number);
    rRes.fuel.delta.text(res.fuel.delta);
    rRes.medicine.number.text(res.medicine.number);
    rRes.medicine.delta.text(res.medicine.delta);

    // population
    var rPop = refs.population;
    var pop = gameState.population;
    rPop.total.text(CalculateTotalPopulation());
    rPop.notHoused.text(CalculateNotHousedPopulation());
    rPop.idle.text(pop.idle);
    rPop.foraging.number.text(pop.foraging);
    rPop.salvaging.number.text(pop.salvaging);
    rPop.exploring.number.text(pop.exploring);

    // buildings
    var rBld = refs.buildings;
    var bld = gameState.buildings;
    rBld.total.text(CalculateTotalBuildings());
    rBld.empty.text(bld.empty);
    rBld.infected.text(bld.infected);
    rBld.shelter.number.text(bld.shelter);
    rBld.food.number.text(bld.food);
    rBld.materials.number.text(bld.materials);

  }

  function CalculateTotalPopulation(){
    var pop = gameState.population;
    return pop.idle + pop.foraging + pop.salvaging + pop.exploring;
  }

  function CalculateNotHousedPopulation(){
    return CalculateTotalPopulation();
  }

  function CalculateTotalBuildings(){
    var bld = gameState.buildings;
    return bld.empty + bld.shelter + bld.food + bld.materials;
  }


  function SetHandlers() {
    // end turn
    $('#turn').click(function(){ Update(); });

    // add population
    $('#add-population').click(function() {
      gameState.population.idle++;
      UpdateUI();
    });

    // population
    var pop = refs.population;
    pop.foraging.min.click(function() { RemovePop('foraging'); });
    pop.foraging.max.click(function() { AddPop('foraging'); });

    pop.salvaging.min.click(function() { RemovePop('salvaging'); });
    pop.salvaging.max.click(function() { AddPop('salvaging'); });

    pop.exploring.min.click(function() { RemovePop('exploring'); });
    pop.exploring.max.click(function() { AddPop('exploring'); });

    // buildings
    var bld = refs.buildings;
    bld.shelter.min.click(function() { RemoveBuilding('shelter'); });
    bld.shelter.max.click(function() { AddBuilding('shelter'); });

    bld.food.min.click(function() { RemoveBuilding('food'); });
    bld.food.max.click(function() { AddBuilding('food'); });

    bld.materials.min.click(function() { RemoveBuilding('materials'); });
    bld.materials.max.click(function() { AddBuilding('materials'); });
  }

  function AddPop(job){
    if(gameState.population.idle > 0){
      gameState.population.idle--;
      gameState.population[job]++;
      UpdateUI();
    }
  }

  function RemovePop(job){
    if(gameState.population[job] > 0){
      gameState.population.idle++;
      gameState.population[job]--;
      UpdateUI();
    }
  }

  function AddBuilding(job){
    if(gameState.buildings.empty > 0){
      gameState.buildings.empty--;
      gameState.buildings[job]++;
      UpdateUI();
    }
  }

  function RemoveBuilding(job){
    if(gameState.buildings[job] > 0){
      gameState.buildings.empty++;
      gameState.buildings[job]--;
      UpdateUI();
    }
  }


});
