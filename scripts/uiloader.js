define(["text!html/main.html"], function(html) {
  document.body.insertAdjacentHTML("afterbegin", html);
  // run app
  require(["main"], function(main) {
    main();
  });
});
