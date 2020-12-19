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
this_id = 'Qgs0iTBcKXmQM1lI';

for (this_scene in game.scenes.entities){
    if (this_scene.id == this_id){
        this_scene.view();
    };
}
