//define(["text!html/main.html"], function(html) {
define(["text!html/main_new.html"], function(html) {

    // add HTML
    document.body.insertAdjacentHTML("afterbegin", html);

    // run app
    require(["main"], function(main) {
        main();
    });
});
