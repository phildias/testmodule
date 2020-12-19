(() => { })();

Hooks.once('init', async function() {
    console.log('!!!!!!!!!!!!TESTING ONE!!!!!!!!!!!!');
});

Hooks.once('ready', async function() {
    console.log('!!!!!!!!!!!!TESTING TWO!!!!!!!!!!!!');
});


console.log('!!!!!!!!!!!!TESTING THREE!!!!!!!!!!!!');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

x = game.scenes.values()
result = x.next();
while (!result.done) {
    result.value.activate()
    console.log('!!!!!!!!!!!! ACTIVATING!!!!!!!!!!!!!!!!!!!!!!'); 
    console.log(result.value.data.name); 
    sleep(3000);
 result = x.next();
}

// get directory-item entity from "HTML Elements"
// find its ID
// compare with all ids in game.scenes
this_id = 'Qgs0iTBcKXmQM1lI';

for (const this_scene in game.scenes.entities){
    console.log('FUCK');
    console.log('${this_scene.id}');

    //if (this_scene.id == this_id){
    //    this_scene.view();
    //};
}


var obj = {a: 1, b: 2, c: 3};

for (const prop in obj) {
  console.log(`obj.${prop} = ${obj[prop]}`);
}