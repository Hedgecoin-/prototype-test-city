
$(document).ready(function(){
  var that = this;


  var gameState = {
    infectionRate: 10,
    unhousedInfectionRate: 20,
    population: {
      idle: 5,
      infected: 0,
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
      shelterSize: 5,
      food: 0,
      foodStorage: 10,
      foodStorageDefault: 5,
      materials: 0,
      materialsStorage: 10,
      materialsStorageDefault: 5,
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
        max: $('#res-materials-max'),
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
      housed: $('#pop-housed'),
      maxHoused: $('#pop-max-housed'),
      infected: $('#pop-infected'),
      idle: $('#pop-idle'),
      useMedicine: $('#pop-use-medicine'),
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
      createMedicine: $('#create-medicine'),
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
    },
    alert: $('#alert-wrapper'),
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
    // infection first
    UpdateInfections();

    // update the numbers
    UpdateFood();
    UpdateMaterials();

    gameState.resources.fuel.number += CalculateFuelDelta();
    gameState.resources.medicine.number += CalculateMedicineDelta();

    // run explore
    for(var i=0; i< gameState.population.exploring; i++){
      Explore();
    }
  }

  function UpdateInfections() {
    var currentInfected = gameState.population.infected;
    var numberOfNewlyInfected = 0;
    for(var i=0; i<currentInfected; i++){
      numberOfNewlyInfected += SimulateInfection(gameState.infectionRate);
    }

    var unhousedPopulation = CalculateNotHousedPopulation();
    for(var i=0; i<unhousedPopulation; i++){
      numberOfNewlyInfected += SimulateInfection(gameState.unhousedInfectionRate);
    }

    if(numberOfNewlyInfected > 0){
      DisplayPopupMessage('danger', 'Infection!', (numberOfNewlyInfected == 1 ? 'Oh no! Someone has' : 'Oh no! ' + numberOfNewlyInfected + ' people have') + ' been infected!');
    }
  }


  function UpdateMaterials() {
    // collect new materials
    gameState.resources.materials.number += CalculateMaterialsDelta();

    // rot excess materials
    var excessMaterials = Math.max(0, gameState.resources.materials.number - CalculateMaxMaterialsStorage());
    gameState.resources.materials.number -= excessMaterials;

  }

  function UpdateFood(){
    // collect new food
    gameState.resources.food.number += CalculateFoodDelta();

    // rot excess food
    var excessFood = Math.max(0, gameState.resources.food.number - CalculateMaxFoodStorage());
    gameState.resources.food.number -= excessFood;

    if(gameState.resources.food.number < 0){
      var cannibalizedPop = 0 - gameState.resources.food.number;
      DisplayPopupMessage('danger', 'Not enough food!', "You didn't have enough food, " + cannibalizedPop + (cannibalizedPop == 1 ? " person has" :" people have") + " left.");
    }

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

  function UpdateUI(){
    // resources
    var rRes = refs.resources;
    var res = gameState.resources;
    rRes.food.number.text(res.food.number);
    rRes.food.max.text(CalculateMaxFoodStorage());
    rRes.materials.number.text(res.materials.number);
    rRes.materials.max.text(CalculateMaxMaterialsStorage());
    rRes.fuel.number.text(res.fuel.number);
    rRes.medicine.number.text(res.medicine.number);
    CalculateDeltas();

    // population
    var rPop = refs.population;
    var pop = gameState.population;
    rPop.total.text(CalculateTotalPopulation());
    CalculateHousedPopulation();
    rPop.maxHoused.text(CalculateMaxHousedPopulation());
    rPop.infected.text(pop.infected);
    rPop.useMedicine.fadeTo('slow', gameState.population.infected > 0 && gameState.resources.medicine.number > 0 ? 1 : 0.2);
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
    rBld.clearInfected.fadeTo('slow', gameState.buildings.infected > 0 ? 1 : 0.2);
    rBld.shelter.number.text(bld.shelter);
    rBld.food.number.text(bld.food);
    rBld.materials.number.text(bld.materials);
    rBld.createMedicine.fadeTo('slow', gameState.resources.materials.number >= 10 && gameState.resources.fuel.number > 0 ? 1 : 0.2);

    // lose conditions
    if(CalculateTotalPopulation() == 0 || CalculateTotalPopulation() == gameState.population.infected){
      Lose();
    }
  }

  function CannibalizeDueToInsufficientFood(job){
    if(gameState.population[job] > 0){
      gameState.population[job]--;
      gameState.resources.food.number++;
    }
  }

  function Explore(){
    switch (GetRandomInt(1, 15)) {
      case 1:
        gameState.buildings.empty++;
        DisplayPopupMessage('success', 'Building Found', 'We found an empty building for use!');
        break;
      case 2:
        gameState.buildings.infected++;
        DisplayPopupMessage('warning', 'Infected Building Found', 'We found an infected building, if we use 5 Materials we could use it.');
        break;
      case 4:
        gameState.resources.fuel.number++;
        DisplayPopupMessage('info', 'We found Fuel!', 'We found some fuel!');
        break;
      case 5:
        gameState.resources.medicine.number++;
        DisplayPopupMessage('info', 'We found Medicine!', 'This is great! We found some medicine.');
        break;
      case 6:
      case 7:
      case 8:
        var newPopCount = GetRandomInt(1, 4);
        gameState.population.idle += newPopCount;
        newPopCount == 1 ? 
          DisplayPopupMessage('success', 'We found someone!', 'Another survivor!'):
          DisplayPopupMessage('success', 'We found ' + newPopCount + ' people!', 'More survivors!');
        
        break;
      case 9:
      case 10:
      case 11:
        gameState.population.exploring--;
        DisplayPopupMessage('danger', 'Missing!', "An explorer hasn't returned, we can only hope...");
      default: // do nothing
        break;
    }
  }

  function DisplayPopupMessage(status, title, body) {
    var alert = $(
      '<div style="display:none;" class="alert alert-dismissible alert-' + status + '">' +
        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
        '<h4>' + title + '</h4>' +
        '<p>' + body + '</p>' +
      '</div>');

    refs.alert.append(alert);
    alert.fadeIn();
    setTimeout(function(){
      alert.fadeOut();
    }, 4000);
    setTimeout(function(){
      alert.remove();
    }, 5000);
  }

  function SimulateInfection(rate){
    switch (GetRandomInt(1, rate)) {
      case 1:
        InfectSomeone();
        return 1;
      default:
        break;
    }
    return 0;
  }

  function InfectSomeone(){
    var infectedSomeone = false;
    while(!infectedSomeone){
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

      if(gameState.population[job] > 0){
        gameState.population[job]--;
        gameState.population.infected++;
        infectedSomeone = true;
      }
    }
  }






  function CalculateTotalPopulation(){
    var pop = gameState.population;
    return pop.idle + pop.foraging + pop.salvaging + pop.exploring + pop.infected;
  }

  function CalculateHousedPopulation(){
    var rPop = refs.population;
    rPop.housed.removeClass('decrease increase');
    rPop.housed.addClass(IsSufficientHousing() ? 'increase' : 'decrease');
    rPop.housed.text(CalculateTotalPopulation());
  }

  function CalculateNotHousedPopulation() {
    return Math.max(0, CalculateTotalPopulation() - CalculateMaxHousedPopulation());
  }

  function IsSufficientHousing() {
    return CalculateTotalPopulation() <= CalculateMaxHousedPopulation();
  }

  function CalculateMaxHousedPopulation(){
    return gameState.buildings.shelter * gameState.buildings.shelterSize;
  }

  function CalculateMaxFoodStorage(){
    return gameState.buildings.food * gameState.buildings.foodStorage + gameState.buildings.foodStorageDefault;
  }

  function CalculateMaxMaterialsStorage(){
    return gameState.buildings.materials * gameState.buildings.materialsStorage + gameState.buildings.materialsStorageDefault;
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

    $('#add-fuel').click(function() {
      gameState.resources.fuel.number++;
      UpdateUI();
    });

    $('#add-medicine').click(function() {
      gameState.resources.medicine.number++;
      UpdateUI();
    });

    $('#add-empty').click(function() {
      gameState.buildings.empty++;
      UpdateUI();
    });

    // population
    var pop = refs.population;
    pop.useMedicine.click(function() { UseMedicine(); });
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

    // create medicine
    bld.createMedicine.click(CreateMedicine);
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

  function CreateMedicine(){
    if(gameState.resources.materials.number >= 10 && gameState.resources.fuel.number > 0){
      gameState.resources.materials.number -= 10;
      gameState.resources.fuel.number--;
      gameState.resources.medicine.number += 5;
      UpdateUI();
    }
  }

  function UseMedicine() {
    if(gameState.resources.medicine.number > 0 && gameState.population.infected > 0){
      gameState.resources.medicine.number--;
      gameState.population.infected--;
      gameState.population.idle++;
      UpdateUI();
    }
  }


  function GetRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function Lose(){
    $('#game').hide();
    $('#alert-wrapper').hide();
    $('#lose-wrapper').show();
    $('#lose').click(function(){
      location.reload();
    });
  }

});
