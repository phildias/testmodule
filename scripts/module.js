(() => { })();

Hooks.once('init', async function() {
    console.log('!!!!!!!!!!!!TESTING ONE!!!!!!!!!!!!');
});

Hooks.once('ready', async function() {
    console.log('!!!!!!!!!!!!TESTING TWO!!!!!!!!!!!!');
});


console.log('!!!!!!!!!!!!TESTING THREE!!!!!!!!!!!!');