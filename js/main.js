
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
        number: 0,
        delta: 0,
        consumption: 1,
        production: 2,
      },
      materials: {
        number: 0,
        delta: 0,
        consumption: 0,
        production: 1,
      },
      fuel: {
        number: 0,
        delta: 0,
        consumption: 0,
        production: 1,
      },
      medicine: {
        number: 0,
        delta: 0,
        consumption: 0,
        production: 1,
      },
    },
    buildings: {
      empty: 0,
      infected: 0,
      clearInfectedCost: 5,
      shelter: 0,
      food: 0,
      foodStorage: 10,
      materials: 0,
      materialsStorage: 10,
    },
  }

  var refs = {
    resources: {
      food: {
        number: $('#res-food'),
        delta: $('#res-food-delta'),
        max: $('#res-food-max'),
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
      clearInfected: $('#bld-clear-infected'),
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
        max: $('#bld-materials-max'),
      },
    }
  }


  // Set Handlers
  SetHandlers();

  // Turn 0
  UpdateUI();

  function Update(){
    UpdateGameState();
    UpdateUI();
  }

  function UpdateGameState(){
    // update the numbers
    UpdateFood();
    gameState.resources.materials.number += CalculateMaterialsDelta();
    gameState.resources.fuel.number += CalculateFuelDelta();
    gameState.resources.medicine.number += CalculateMedicineDelta();

    // run explore
    for(var i=0; i< gameState.population.exploring; i++){
      Explore();
    }
  }

  function UpdateFood(){
    // collect new food
    gameState.resources.food.number += CalculateFoodDelta();

    // rot excess food
    var excessFood = Math.max(0, gameState.resources.food.number - CalculateMaxFoodStorage());
    gameState.resources.food.number -= excessFood;

    while(gameState.resources.food.number < 0){
      var job;
      switch (GetRandomInt(1, 4)) {
        case 1:
          job = 'idle';
          break;
        case 2:
          job = 'foraging';
          break;
        case 3:
          job = 'salvaging';
          break;
        case 4:
          job = 'exploring';
          break;
        default:
          break;
      }
      CannibalizeDueToInsufficientFood(job);
    }
  }

  function CannibalizeDueToInsufficientFood(job){
    if(gameState.population[job] > 0){
      gameState.population[job]--;
      gameState.resources.food.number++;
    }
  }

  function Explore(){
    switch (GetRandomInt(1, 12)) {
      case 1:
        gameState.buildings.empty++;
        break;
      case 2:
      case 3:
        gameState.buildings.infected++;
        break;
      case 4:
        gameState.resources.fuel.number++;
        break;
      case 5:
        gameState.resources.medicine.number++;
        break;
      case 6:
      case 7:
      case 8:
        gameState.population.idle++;
        break;
      default: // do nothing
        break;
    }
  }


  function UpdateUI(){
    // resources
    var rRes = refs.resources;
    var res = gameState.resources;
    rRes.food.number.text(res.food.number);
    rRes.food.max.text(CalculateMaxFoodStorage());
    rRes.materials.number.text(res.materials.number);
    rRes.fuel.number.text(res.fuel.number);
    rRes.medicine.number.text(res.medicine.number);
    CalculateDeltas();

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
    rBld.clearInfected.toggle(gameState.buildings.infected > 0);
    rBld.shelter.number.text(bld.shelter);
    rBld.food.number.text(bld.food);
    rBld.materials.number.text(bld.materials);

    // lose conditions
    if(CalculateTotalPopulation() == 0){
      Lose();
    }
  }

  function CalculateTotalPopulation(){
    var pop = gameState.population;
    return pop.idle + pop.foraging + pop.salvaging + pop.exploring;
  }

  function CalculateNotHousedPopulation(){
    return CalculateTotalPopulation();
  }

  function CalculateMaxFoodStorage(){
    return gameState.buildings.food * gameState.buildings.foodStorage;
  }

  function CalculateFoodDelta(){
    gameState.resources.food.delta = gameState.population.foraging * gameState.resources.food.production - CalculateTotalPopulation() * gameState.resources.food.consumption;
    return gameState.resources.food.delta;
  }

  function CalculateMaterialsDelta(){
    gameState.resources.materials.delta = gameState.population.salvaging * gameState.resources.materials.production - CalculateTotalPopulation() * gameState.resources.materials.consumption;
    return gameState.resources.materials.delta;
  }

  function CalculateFuelDelta(){
    return 0;
  }

  function CalculateMedicineDelta(){
    return 0;
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

    // clear infected building
    bld.clearInfected.click(ClearInfectedBuilding);
  }


  function CalculateDeltas(){
    FormatDelta(CalculateFoodDelta(), refs.resources.food.delta);
    FormatDelta(CalculateMaterialsDelta(), refs.resources.materials.delta);
    FormatDelta(CalculateFuelDelta(), refs.resources.fuel.delta);
    FormatDelta(CalculateMedicineDelta(), refs.resources.medicine.delta);
  }

  function FormatDelta(delta, ref) {
    ref.removeClass('decrease increase');

    if(delta > 0){
      ref.addClass('increase');
      ref.text("+" + delta);
    }
    else if(delta < 0){
      ref.addClass('decrease');
      ref.text(delta);
    }
    else {
      ref.text(delta);
    }
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

  function ClearInfectedBuilding(){
    if(gameState.buildings.infected > 0 && gameState.resources.materials.number >= gameState.buildings.clearInfectedCost){
      gameState.buildings.infected--;
      gameState.buildings.empty++;
      gameState.resources.materials.number -= gameState.buildings.clearInfectedCost;
      UpdateUI();
    }
  }


  function GetRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function Lose(){
    $('#game').hide();
    $('#lose-wrapper').show();
    $('#lose').click(function(){
      location.reload();
    });
  }

});
