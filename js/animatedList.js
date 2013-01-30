/**
 * Список со сворачивающимися вложенными списками
 * Вместо UL и LI можно использовать и другие элементы, например DIV с классами
 */
(function(jQuery){

    animatedListVersion = '0.65';
    
    /*Class*/
    animatedList = function(user_options)
    {
        
        var defaults = {
            /**
              * Основная обертка списками, как правило корневой UL
              * @var string | jQuery object
              */
            wrapper: false,
            
            /**
              * CSS Селектор для вложенных списков
              * @var string
              */
            subListSelector: 'ul',
            
            /**
              * CSS Селектор для элементов списка
              * @var string
              */
            itemSelector: 'li',
            
            /**
              * CSS Класс добавляемый к элементам вложенные списки которых развернуты
              * @var string
              */
            selectedClass: 'selected',
            
            /**
              * Сворачивать другие списки
              * Если TRUE, то все списки, кроме текущего автоматически сворачиваются
              * @var boolean
              */
            collapseOthers: true,
            
            /**
              * Скорость анимации сворачивания и разворачивания вложенных списков
              * см. Duration http://api.jquery.com/slideUp/
              * @var string | integer
              */
            slideSpeed: 'slow',
            
            /**
              * CSS класс добавляемый к элементам, которые в данный момент не должны сворачиваться
              * Как правило это родители текущего элемента, в случае с многоуровневыми списками
              * @var string
              */
            doNotCollapseClass: 'animated_list_do_not_collapse',
            
            /**
              * CSS класс добавляемый к элементам у которых есть вложенные списки
              * @var string
              */
            hasChildrenClass: 'has_children',
            
            /**
              * Функция выполняемая при клике по одному из "листьев", т.е. по элементу, который не имеет вложенного списками
              * @var function
              */
            onLeafClick: function(leaf){},
                
            /**
              * Функция выполняемая при клике по разветвлению, т.е. по элементу, который имеет не менее одного вложенного списка
              * @var function
              */
            onBranchClick: function(branch){},
            
            /*
              * Помечать родителей выбранного элемента как выбранные
              * @var boolean
              */
            markParentsAsSelected: false
        };
        
        /**
         * Link to galleryFitter itself ( like "this" operator)
         * available anywhere in the jQuery wrapper
         * returned by galleryFitter
         */
        var instance = {};
            
        /**
         * Options after megring defaults and user options
         * var object
         */
        var options;
        
        /**
         * Merging of defaults and user options
         * @param object user_options
         */
        function setOptions(user_options)
        {
            if (jQuery.type(user_options)==='string') {
                /*if options is string then assume it's wrapper's CSS selector*/
                options = jQuery.extend({}, defaults, options);
                options.wrapper = user_options;
            } else {
                options = jQuery.extend({}, defaults, options, user_options);
            }
        };
        
        /**
         * Initialization of the main elements
         */
        instance.init = function()
        {
            instance.wrapper = $(options.wrapper);
            var wrapper = instance.wrapper;
            if (true==options.markParentsAsSelected) {
                wrapper.find(options.itemSelector).each(function() {
                    if ($(this).hasClass(options.selectedClass)) {
                        var parents_items = $(this).parentsUntil(instance.wrapper,options.itemSelector);
                        parents_items.addClass(options.selectedClass);
                        parents_items.show();
                    }
                });
            }
            wrapper.find(options.itemSelector).each(function()
            {
                var submenu = $(this).find(options.subListSelector);
                if (submenu.length > 0) {
                    /*ветви*/
                    if (options.hasChildrenClass!=false) {
                        $(this).addClass(options.hasChildrenClass);
                    }
                    if (!$(this).hasClass(options.selectedClass)) {
                        submenu.hide();
                    } else {
                        submenu.show();
                    };
                    $(this).click(function(event){
                        toggleSubList($(this));
                        options.onBranchClick();
                        event.stopPropagation();
                        return false;
                    });
                } else {
                    /*листья*/
                    $(this).click(function(event){
                        options.onLeafClick();
                        event.stopPropagation();
                    });
                };
            });
        };
        
        /**
         * Разворачивает вложенный список переданного элемента списка
         * @param jQuery элемент разворачиваемого элемента списка
         */
        function toggleSubList(currentList)
        {
            var submenu = currentList.children(options.subListSelector);
            if (currentList.hasClass(options.selectedClass)) {
                /*selected*/
                submenu.slideUp();
                currentList.removeClass(options.selectedClass);
            } else {
                /*collapsed*/
                if (true==options.collapseOthers) {
                    var others_items = instance.wrapper.find('.'+options.selectedClass);
                    var parents = currentList.parentsUntil(instance.wrapper,options.subListSelector);
                    parents.addClass(options.doNotCollapseClass);
                    submenu.addClass(options.doNotCollapseClass);
                    var others_submenu = instance.wrapper.find(options.subListSelector);
                    others_submenu.each(function(){
                        /*Свернем все остальные вложенные списки, кроме тех, которые помечены классом options.doNotCollapseClass*/
                        if (!$(this).hasClass(options.doNotCollapseClass)) {
                            $(this).slideUp(options.slideSpeed,function()
                            {
                                others_items.removeClass(options.selectedClass);
                                //$(this).hide();
                            });
                        }
                    });
                };
                /*Разворачиваем вложенный список элемента по которому кликнули*/
                submenu.slideDown(options.slideSpeed,function(){
                    /*Убераем класс options.doNotCollapseClass, если был где-то добавлен*/
                    $('.'+options.doNotCollapseClass).removeClass(options.doNotCollapseClass);
                });
                currentList.addClass(options.selectedClass);
            };
        };
        
        /**
         * Constructor
         */
        {
            setOptions(user_options);
            instance.init();
            return instance;
        }
        
    };
})(jQuery);