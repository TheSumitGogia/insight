define(["text!html/main.html"], function(html) {
  document.body.insertAdjacentHTML("afterbegin", html);
  require(["main"], function(main) {
    main();
  });
});
