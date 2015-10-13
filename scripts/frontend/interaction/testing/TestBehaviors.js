define([
    "jquery"
], function($) {
    
    var TestBehaviors = {

        currentTaskCounter: 2,

        initialize: function() {
            this.startSidebar();
            this._adjustDimensions();
            this.startImageSearch();

            var searchButton = $("#searchButton");
            var addTaskButton = $("#addTask");
            searchButton.on("click", this._onSearchEntry.bind(this));
            addTaskButton.on("click", this._onAddTask.bind(this));
        },

        startTestMenu: function() {

        },
                
        startSidebar: function() {
            var sidebar = $("#sidebar");
            sidebar.sidebar({
                dimPage: false
            });
        },

        startImageSearch: function() {
            var searchEl = $(".ui.search");
            var searchInput = $(".prompt");
            searchEl.search({
                source: [
                    {title: "sunflowers"}, 
                    {title: "fieldsOfGold"}, 
                    {title: "greenscape"}, 
                    {title: "urban_fantasy"},
                    {title: "peace-in-unicorns"}
                ],
                onSelect: function(result, response) {
                    var currentText = searchInput.val();
                    var currTextSplit = currentText.split(" ");
                    var previousTagString = currTextSplit.slice(0, -1).join(" ");
                    searchEl.focus();
                    searchEl.search("set value", (previousTagString + result.title));
                    searchEl.search("hide results"); 
                    searchInput.focus();
                    return false;
                }
            });
        },

        _onSearchEntry: function() {
            // TODO: get images from server
            var placeholders = [
                "sunflower",
                "bubblesAreGreat",
                "whenTheWindRises",
                "canYouFeelMe"
            ];

            var numbers = [3, 4, 5];
            numbers.map(function(num) { return num + 1; });
            var listElements = placeholders.map(this._imgToListEl);
            var imageList = $("#imageList");
            listElements.forEach(function(elHTML) {
                imageList.append(elHTML);
            });
        },

        _imgToListEl: function(imgName) {
            var html =
                "<div class='item'> "                       +
                   "<div class='right floated content'>"    +
                       "<i class='close icon'></i>"         +
                   "</div>"                                 +
                   imgName                                  +
                "</div>";

            return html;  
        },

        _onAddTask: function(event) {
            var newTaskName = "Task" + " " + this.currentTaskCounter.toString();
            var taskList = $("#taskList");
            taskList.append(this._taskToListEl(newTaskName));
            this.currentTaskCounter += 1;
        },

        _taskToListEl: function(taskName) {
            var html = 
                "<div class='item'> "                       +
                    "<div class='right floated content'>"   +
                        "<i class='close icon'></i>"        +
                    "</div>"                                +
                    taskName                                +
                "</div>";

            return html;
        },

        startBrowser: function() {
            var browseSidebar = $("#browseSidebar");
            browseSidebar.sidebar({
                context: $("#drawContainer"),
                dimPage: false,
                transition: "overlay"
            });
            browseSidebar.sidebar("attach events", "#browseButton");
        },

        _adjustDimensions: function() {
            var onWindowResize = function() {
                var winWidth = $(window).width();
                var sidebarWidth = $("#sidebar").width();
                $("#drawContainer").css("width", winWidth - sidebarWidth);

                var winHeight = $(window).height();
                var menuHeight = $("#testMenu").height();
                $("#inputContainer").css("height", winHeight - menuHeight - 30);
            };

            onWindowResize();
            $(window).resize(onWindowResize);
        }
    };

    return TestBehaviors;
});
