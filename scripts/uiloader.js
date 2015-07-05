define(["texxt!!html/ui.html"], function(ui) {
  document.body.insertAdjacentHtml("afterbegin", ui);
  require(["main"], function(main) {
    main();
  });
});
