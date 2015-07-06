define(["text!html/main.html"], function(html) {
  document.body.insertAdjacentHtml("afterbegin", html);
  require(["main"], function(main) {
    main();
  });
});
