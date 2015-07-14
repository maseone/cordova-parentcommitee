;(function(){'use strict';

window.InfinniUI = window.InfinniUI || {};

window.InfinniUI.Utils = window.InfinniUI.Utils || {};

window.InfinniUI.Template = window.InfinniUI.Template || {};

window.InfinniUI.config = window.InfinniUI.config || {};

window.InfinniUI.global = window.InfinniUI.global || {};

window.InfinniUI.Metadata = window.InfinniUI.Metadata || {};

window.InfinniUI.localizations = window.InfinniUI.localizations || {
    'ru-RU': {
        caption: 'Русский'
    },
    'en-US': {
        caption: 'English'
    }
};
InfinniUI.Metadata["RadioGroupOrientation"] = {
    "Vertical": "Vertical",
    "Horizontal": "Horizontal"
};

InfinniUI.config.lang = 'ru-RU';
InfinniUI.config.maxLengthUrl = 2048;
InfinniUI.config.cacheMetadata = false; //boolean - enable/disable cache | milliseconds
InfinniUI.config.serverUrl = 'http://10.222.222.68:9900';
InfinniUI.config.configId = 'PTA_mobile';
InfinniUI.config.configName = 'Родительский коммитет';
/**
 * Набор утилит для работы с BlobData объектами
 **/


window.InfinniUI.BlobUtils = (function () {

    return  {
        createFromFile: function(file) {
            var blobData = {
                Info:{
                    Name:   file.name,
                    Type:   file.type,
                    Size:   file.size,
                    Time:   file.lastModifiedDate
                }
            };

            return blobData;
        }
    }

})();





var Cache = function () {
    this.cleanup();
};

/**
 * @description Возвращает закешированное значение по ключу или false, если значения нет в кеше
 * @param {String|Object} key
 * @returns {*}
 */
Cache.prototype.get = function (key) {
    var hash = this.getKeyHash(key);
    var data = this.data[hash];

    if (typeof data === 'undefined') {
        return false;
    }

    if (this.isValid(hash)) {
        data.count = data.count + 1;
        return data.value;
    }

    return false;
};

/**
 * @description Сохраняет значение для указанного ключа
 * @param {*} key
 * @param {*} value
 * @returns {*}
 */
Cache.prototype.set = function (key, value) {
    var hash = this.getKeyHash(key);
    this.data[hash] = {
        value: value,
        date: new Date(),
        count: 0
    };

    return value;
};

/**
 * @description Сброс кеша
 * @returns {Cache}
 */
Cache.prototype.flush = function () {
    this.cleanup();
    return this
};

/**
 * @description Установка времени жизни кеша в лиллисекундах. 0 - Неограниченное время.
 * @param {numeric} lifetime
 * @returns {Cache}
 */
Cache.prototype.setLifetime = function (lifetime) {
    var value = parseInt(lifetime, 0);
    if (!isNaN(value)) {
        this.lifetime = value;
    }

    return this;
};

Cache.prototype.validFor = function (func) {
    if (typeof func !== 'function') {
        return;
    }
    if (this.list.indexOf(func) === -1) {
        this.list.push(func);
    }
};

Cache.prototype.cleanup = function () {
    this.count = 0;
    this.data = {};
    this.lifetime = 0;
    this.list = [];
};

Cache.prototype.invalidate = function (hash) {
    delete this.data[hash];
};

Cache.prototype.isValid = function (hash) {
    var data = this.data[hash];
    if (this.lifetime < 0) {
        this.invalidate(hash);
    } else if (this.lifetime > 0){
        if (Date.now() - data.date.getTime() > this.lifetime) {
            this.invalidate(hash);
            return false;
        }
    }

    for (var i = 0, ln = this.list.length; i < ln; i = i + 1) {
        if (this.list[i].call() === false) {
            this.invalidate(hash);
            return false;
        }
    }

    return true;
};

Cache.prototype.getKeyHash = function (key) {
    return JSON.stringify(key);
};

_.mixin({
    deepClone: function (value) {
        if (value !== null && typeof value !== 'undefined') {
            return JSON.parse(JSON.stringify(value));
        }
        return value;
    }
});
var OpenedViewCollection = function () {

    var list = [];

    this.appendView = function (metadata, viewMetadata, view) {

        list.push({
            metadata:metadata,
            viewMetadata: viewMetadata,
            view: view
        });
    };

    this.removeView = function (view) {
        for (var i = 0, ln = list.length; i < ln; i = i + 1) {
            if (view === list[i].view) {
                list.splice(i, 1);
                break;
            }
        }
    };

    this.getLastView = function () {
        if (list.length === 0) {
            return;
        }

        return list[list.length - 1];
    };

    this.getList = function () {
        return list;
    }

};

window.InfinniUI.views = new OpenedViewCollection();


window.InfinniUI.DateUtils = (function () {

    var padInt = function (value, size) {
        var str = '' + value;
        var pad = '';
        if (str.length < size) {
            pad = Array(size - str.length + 1).join('0');
        }
        return pad + str;
    };

    /**
     * @description Возвращает строковое представление даты в формате YYYY-MM-DDTHH:mm:ss.sss+HH:MM
     * @param {Date} date
     * @returns {string}
     */
    var toISO8601 = function (date) {

        if (typeof date === 'undefined' || date === null) {
            return null;
        }

        if (date.constructor !== Date) {
            return null;
        }

        var datePart = [
            padInt(date.getFullYear(), 4),
            padInt(date.getMonth() + 1, 2),
            padInt(date.getDate(), 2)
        ].join('-');

        var timePart = [
            padInt(date.getHours(), 2),
            padInt(date.getMinutes(), 2),
            padInt(date.getSeconds(), 2)
        ].join(':');

        var sssPart = padInt(date.getMilliseconds(), 4);

        var tz = Math.abs(date.getTimezoneOffset());
        var tzOffsetPart = Math.sign(date.getTimezoneOffset()) > 0 ? '-' : '+';
        var tzPart = [
            padInt(Math.floor(tz / 60), 2),
            padInt(tz % 60, 2)
        ].join(':');

        return datePart + 'T' + timePart + '.' + sssPart + tzOffsetPart + tzPart;
    };

    return {
        toISO8601: toISO8601
    };
})();
/**
 * Синглтон для работы с путями построенными по dot-notation
 **/

window.InfinniUI.ObjectUtils = (function () {

    /**
     * Возвращает значение свойства.
     *
     * @private
     * @param {*} target Исходный объект.
     * @param {array} propertyPathTerms Путь к свойству объекта в виде коллекции термов.
     * @returns {*} Значение свойства.
     */
    function getPropertyByPath(target, propertyPathTerms) {
        if (target !== null && target !== undefined
            && propertyPathTerms !== null && propertyPathTerms !== undefined) {

            var parent = target;
            var length = propertyPathTerms.length;

            for (var i = 0; i < length; ++i) {
                if (parent !== null && parent !== undefined) {
                    var term = propertyPathTerms[i];

                    var termCollectionIndex = parseCollectionIndex(term);

                    if (termCollectionIndex >= 0) {
                        parent = getCollectionItem(parent, termCollectionIndex);
                    }
                    else {
                        parent = getObjectProperty(parent, term);
                    }
                }
                else {
                    return null;
                }
            }

            return parent;
        }

        return target;
    }

    /**
     * Возвращает значение свойства.
     *
     * @private
     * @param {*} target Исходный объект.
     * @param {array} propertyPathTerms Путь к свойству объекта в виде коллекции термов.
     * @param {*} propertyValue Значение свойства объекта.
     * @returns {*} Значение свойства.
     */
    function setPropertyByPath(target, propertyPathTerms, propertyValue) {
        var parent = target;
        var length = propertyPathTerms.length - 1;

        var term = propertyPathTerms[0];
        var termCollectionIndex = parseCollectionIndex(term);

        for (var i = 0; i < length; ++i) {
            var termValue = (termCollectionIndex >= 0)
                ? getCollectionItem(parent, termCollectionIndex)
                : getObjectProperty(parent, term);

            var nextTerm = propertyPathTerms[i + 1];
            var nextTermCollectionIndex = parseCollectionIndex(nextTerm);

            if (termValue === null || termValue === undefined) {
                if (nextTermCollectionIndex >= 0) {
                    termValue = [ ];
                }
                else {
                    termValue = { };
                }

                if (termCollectionIndex >= 0) {
                    setCollectionItem(parent, termCollectionIndex, termValue);
                }
                else {
                    setObjectProperty(parent, term, termValue);
                }
            }

            parent = termValue;
            term = nextTerm;
            termCollectionIndex = nextTermCollectionIndex;
        }

        if (termCollectionIndex >= 0) {
            setCollectionItem(parent, termCollectionIndex, propertyValue);
        }
        else {
            setObjectProperty(parent, term, propertyValue);
        }
    }


    /**
     * Разбивает путь к свойству, записанному в dot-notation, на термы.
     *
     * @private
     * @param {string} propertyPath Имя свойства.
     */
    function splitPropertyPath(propertyPath) {
        if (_.isEmpty(propertyPath)) {
            return null;
        }

        return propertyPath.split(".");
    }

    /**
     * Пытается интерпретировать имя свойства, как индекс элемента коллекции.
     *
     * @private
     * @param {string} propertyName Имя свойства.
     * @returns {number} Индекс элемента коллекции или -1.
     */
    function parseCollectionIndex(propertyName) {
        var index = -1;

        if (propertyName === "$") {
            index = 0;
        }
        else {
            var tryParse = parseInt(propertyName);

            if (!isNaN(tryParse)) {
                index = tryParse;
            }
        }

        return index;
    }


    /**
     * Возвращает элемент коллекции.
     *
     * @private
     * @param {array} target Исходная коллекция.
     * @param {number} index Индекс элемента.
     * @returns {*} Элемент коллекции.
     */
    function getCollectionItem(target, index) {
        if (target !== null && target !== undefined
            && Object.prototype.toString.call(target) === "[object Array]"
            && index >= 0 && index < target.length) {

            return target[index];
        }

        return null;
    }

    /**
     * Устанавливает элемент коллекции.
     *
     * @private
     * @param {array} target Исходная коллекция.
     * @param {number} index Индекс элемента.
     * @param {*} item Элемент коллекции.
     */
    function setCollectionItem(target, index, item) {
        if (target !== null && target !== undefined
            && Object.prototype.toString.call(target) === "[object Array]"
            && index >= 0 && index < target.length) {

            target[index] = item;
        }
    }


    /**
     * Возвращает значение свойства объекта.
     *
     * @private
     * @param {object} target Исходный объект.
     * @param {string} propertyName Наименование свойства.
     * @returns {*} Значение свойства.
     */
    function getObjectProperty(target, propertyName) {
        if (target !== null && target !== undefined
            && Object.prototype.toString.call(target) === "[object Object]"
            && propertyName !== null && propertyName !== undefined) {

            return target[propertyName];
        }

        return null;
    }

    /**
     * Устанавливает значение свойства объекта.
     *
     * @private
     * @param {object} target Исходный объект.
     * @param {string} propertyName Наименование свойства.
     * @param {*} propertyValue Значение свойства.
     */
    function setObjectProperty(target, propertyName, propertyValue) {
        if (target !== null && target !== undefined
            && Object.prototype.toString.call(target) === "[object Object]"
            && propertyName !== null && propertyName !== undefined) {

            target[propertyName] = propertyValue;
        }
    }

    return {

        /**
         * Возвращает значение свойства.
         *
         * @public
         * @param {*} target Исходный объект.
         * @param {string|Object} propertyPath Путь к свойству или объект для построения значения.
         * @returns {*} Значение свойства.
         */
        getPropertyValue: function (target, propertyPath) {
            var result;

            var getPropertyValue = function (target, propertyPath) {
                var propertyPathTerms = splitPropertyPath(propertyPath);
                var result = getPropertyByPath(target, propertyPathTerms);
                return typeof result === 'undefined' ? null : result;
            };

            if (_.isObject(propertyPath)) {
                result = {};
                _.each(propertyPath, function (v, n) {
                    result[n] = getPropertyValue(target, v);
                });
            } else {
                result = getPropertyValue(target, propertyPath);
            }
            return result;
        },

        /**
         * Устанавливает значение свойства.
         *
         * @public
         * @param {*} target Исходный объект.
         * @param {string} propertyPath Путь к свойству.
         * @param {*} propertyValue Значение свойства.
         */
        setPropertyValue: function (target, propertyPath, propertyValue) {
            if (target !== null && target !== undefined && !_.isEmpty(propertyPath)) {
                var propertyPathTerms = splitPropertyPath(propertyPath);
                setPropertyByPath(target, propertyPathTerms, _.clone(propertyValue));
            }
        }
    };
})();



/**
 * @description Выводит в консоль информацию о времени выполнения функции
 * Напр. var someFunc = function () {// .... //}.estimate('someFunc');
 */
Function.prototype.estimate = function (name) {
    var func = this;

    return function () {
        var args  = Array.prototype.slice.call(arguments);
        var error = new Error("Stack trace");
        var start = Date.now();
        var result = func.apply(this, args);
        var end = Date.now();

        showInfo();
        return result;

        function showInfo() {
            console.groupCollapsed('%s: %s ms', name, (end - start).toLocaleString());
            console.log(Date(start));
            console.groupCollapsed('arguments');
            console.log(args);
            console.groupEnd();
            console.groupCollapsed('Stack trace');
            console.log(error.stack);
            console.groupEnd();
            console.groupEnd();
        }
    }
};
function adaptRowsHeightModel(availableH, rowHeightList){
    var summ = 0,
        maxI = 0,
        diff, newH;

    for(var i = 0, ii = rowHeightList.length; i < ii; i++){
        summ += rowHeightList[i];
        if(rowHeightList[i] > rowHeightList[maxI]){
            maxI = i;
        }
    }

    if(summ <= availableH){
        return rowHeightList;
    }

    if(summ > availableH){
        if(rowHeightList[maxI] < availableH/2.0){
            return rowHeightList;
        }

        diff = summ - availableH;
        newH = rowHeightList[maxI] - diff;
        if(newH < 100){
            newH = 100;
        }
        rowHeightList[maxI] = newH;
        return rowHeightList;
    }
}

function adaptHeightInsideElement($el){
    console.info('call adaptHeightInsideElement');
    return;
    var $panels = $el.find('.pl-stack-panel:not(.horizontal-orientation), .pl-scroll-panel, .modal-scrollable').filter(':visible'),
        $modals = $el.find('.modal-scrollable');

    if($modals.length){
        setTimeout(function(){
            adaptAction($panels);
        }, 850);
    }else{
        adaptAction($panels);
    }
}

function adaptAction($panels){
    for(var i = 0, ii = $panels.length; i < ii; i++){
        if($panels.eq(i).hasClass('pl-stack-panel')){
            adaptStackPanelHeight($panels.eq(i));
        }

        if($panels.eq(i).hasClass('pl-scroll-panel')){
            adaptScrollPanelHeight($panels.eq(i));
        }

        if($panels.eq(i).hasClass('modal-scrollable')){
            adaptModalHeight($panels.eq(i));
        }
    }
}

function adaptStackPanelHeight($el){
    var $parent = $el.parent(),
        parentHeight = $parent.height() - siblingsHeight($el),
        $children = $el.children(),
        childrenHeight = $children.map(function(i, el){
            var $el = $(el),
                $child = $el.children().eq(0);
            $child.data('last-scroll', $child.scrollTop());
            $el.css('height', 'auto');
            return $el.height();
        }).get(),
        newchildrenHeight = adaptRowsHeightModel(parentHeight, childrenHeight);

    $children.each(function(i, el){
        var $el = $(el),
            $child = $el.children().eq(0);
        if($el.height() != newchildrenHeight[i]){
            $el.height(newchildrenHeight[i]);
            $child.scrollTop($child.data('last-scroll'));
        }
    });
}

function adaptScrollPanelHeight($el){

}

function adaptModalHeight($el){
    var wh = $(window).height(),
        $header = $el.find('.modal-header'),
        $body = $el.find('.modal-body'),
        headerH = $header.outerHeight(),
        avalableH = wh - headerH - 30;

    $body.css('max-height', avalableH + 'px');
}

function siblingsHeight($el){
    var result = 0,
        $siblings = $el.siblings(':visible');
    for( var i = 0, ii = $siblings.length; i < ii; i++ ){
        result += $siblings.eq(i).outerHeight(true);
    }
    return result;
}
function hiddenScreen() {
    this.middleElement = $('<div></div>').css({
        'position': 'absolute',
        top: '-10000px'
    });
}
hiddenScreen.prototype = {
    add: function (element) {
        $('body').prepend(this.middleElement);
        this.middleElement.append(element);
    }
};
_.mixin({
    'inherit': function (child, parent) {
        var f = new Function();
        f.prototype = parent.prototype;

        child.prototype = new f();
        child.prototype.constructor = child;

        child.superclass = parent.prototype;
    },

    'superClass': function (obj, context, values) {
        var args = _.toArray(arguments);
        args.splice(0, 2);

        obj.superclass.constructor.apply(context, args);
    }
});
var layoutManager = {
    windowHeight: 0,
    clientHeight: 0,
    exchange: null,

    setOuterHeight: function ($el, height, fix) {
        var delta = 0;
        'border-top-width,border-bottom-width,padding-top,padding-bottom,margin-top,margin-bottom'
            .split(',')
            .forEach(function(name) {
                delta += parseInt($el.css(name));
            });
        var contentHeight = height - delta;
        if (fix) {
            contentHeight += fix;
        }

        //@TODO Разобраться с багом, при задании clearfix.height = 0 вылезает лишний 1 пиксел. Временное решение:
        //contentHeight = (contentHeight > 0) ? contentHeight - 1 : contentHeight;

        $el.height(contentHeight);

        return contentHeight;
    },

    getModalSelector: function () {
        return '.modal-scrollable';
    },

    getSelector: function () {
        //return '.pl-data-grid, .pl-scroll-panel, .pl-document-viewer, .pl-menu.vertical, .pl-tab-panel, .pl-treeview';
        return '.verticalAlignmentStretch:not(:hidden)';
    },

    resize: function (el, pageHeight) {
        var $el = $(el);
        var contentHeight = this.setOuterHeight($el, pageHeight);
        var elements = $el.find(this.getSelector());

        if (elements.length === 0) {
            return;
        }

        var $parent;
        var list = [];
        var $element;
        var element;

        //Строим дерево элементов: от концевых элементов поднимается к корневому элементу
        for (var i = 0, ln = elements.length; i < ln; i = i + 1) {
            element = elements[i];
            $element = $(element);
            do {
                $parent = $element.parent();

                var a = _.findWhere(list, {element: element});
                if (typeof a !== 'undefined') {
                    //Элемент уже занесен в список
                    break;
                }
                list.push({
                    element: element,
                    $element: $element,
                    parent: $parent.get(0),
                    $parent: $parent
                });

                $element = $parent;
                element = $parent.get(0);
            } while (element !== el);
        }

        var tree = (function f(items, parentEl, $parentEl) {
            var items = _.where(list, {parent: parentEl});

            return {
                isElement: _.indexOf(elements, parentEl) !== -1,
                element: parentEl,
                $element: $parentEl,
                child: _.map(items, function (item) {
                    return f(items, item.element, item.$element);
                })
            };
        })(list, el, $el);

        /**
         * Если внутри child один элемент:
         *   - устанавливаем высоту в 100%
         * Если внутри child несколько элементов
         *   - offsetTop совпадают - устанавливаем высоту в 100%
         *   - offsetTop не совпадают - устанавливаем высоту в (100 / child.length)%
         */

        var manager = this;
        (function h(node, height) {
            var children = node.$element.children(':not(:hidden):not(.modal-scrollable):not(.modal-backdrop)');
            /**
             * @TODO Возможно правильнее исключать из обсчета все элементы с абсолютным позиционированием
             */
            var originalHeight;
            var fixedHeight = 0;
            var setHeight = function (node, height) {
                originalHeight = node.$element.attr('data-height-original');
                if (originalHeight === '') {
                    node.$element.attr('data-height-original', node.element.style.height);
                }
                return manager.setOuterHeight(node.$element, height);
            };

            var nodeHeight = setHeight(node, height);
            if (node.$element.hasClass('pl-scroll-panel') || node.$element.hasClass('modal-scrollable')) {
                //Т.к. скроллпанель бесконечная по высоте, контролы внутри нее по высоте не растягиваем
                return;
            }


            if (node.$element.hasClass('tab-content')) {
                _.each(node.child, function (node) {
                    h(node, nodeHeight);
                });
            } else if (node.child.length > 0) {

                var grid = _.chain(children)
                    .filter(function (el) {
                        var position = $(el).css('position');
                        return ['absolute', 'fixed'].indexOf(position) === -1;
                    })
                    .groupBy('offsetTop')
                    .value();

                var heights = [];

                _.each(grid, function (row, i) {
                    var nodes = [];
                    _.each(row, function (e) {
                        var n = _.find(node.child, function (c) {return c.element === e;});
                        if (n) nodes.push(n);
                    });

                    heights.push(nodes.length ? 0 : _.reduce(row, function (height, e) {
                        return Math.max(height, $(e).outerHeight(true));
                    }, 0));

                    grid[i] = nodes;
                }, this);

                fixedHeight = _.reduce(heights, function (total, height) {return total + height}, 0);
                var count = _.reduce(grid, function (count, row) {return row.length ? count + 1 : count}, 0);

                var heightForNode = Math.floor((nodeHeight - fixedHeight) / count);

                _.each(grid, function (row) {
                    if (row.length === 0) return;
                    _.each(row, function (node) {
                        h(node, heightForNode);
                    }, this);
                }, this);

            }
        })(tree, pageHeight);

    },

    resizeView: function (container, clientHeight) {
        var $page = $('#page-content', container);
        //$page.height(clientHeight);
        var contentHeight = this.setOuterHeight($page, clientHeight);
        var that = this;

        this.resize($page.get(0), contentHeight);

        //$page.children().each(function (i, el) {
        //    if (el.style.display !== 'none') {
        //        //Обработка активной вкладки
        //        var $tab = $(el);
        //
        //        var $bar = $(".pl-active-bar:not(:hidden)", $tab);
        //
        //        var barHeight = $bar.length ? $bar.outerHeight(true) : 0;
        //        //var barHeight = $(".pl-active-bar", $tab).outerHeight(true);
        //        $tab.children().each(function (i, el) {
        //            if (false === el.classList.contains('pl-active-bar') && el.style.display !== 'none') {
        //                var pageHeight = contentHeight - barHeight;
        //                that.resize(el, pageHeight);
        //            }
        //        });
        //    }
        //});
    },

    resizeDialog: function () {
        var manager = this;
        $(this.getModalSelector()).each(function (i, el) {
            manager._resizeDialog($(el));
        });
    },

    _resizeDialog: function ($modal) {
        //var $modal = $(".modal-scrollable");
        var space = 10;//Высота отступа от вертикальных границ диалога до границ экрана

        var $container = $modal.children();

        $container.css('margin-top', 0);
        //var marginTop = parseInt($container.css('margin-top'), 10);

        var $header = $('.modal-header', $container);
        var $body = $('.modal-body', $container);

        var headerHeight = $header.outerHeight(true);
        $body.css('max-height', this.windowHeight - headerHeight);

        $container.css('margin-top', 0);

        var el = $(this.getSelector(), $modal);
        if (el.length === 0) {
            //Если диалог не содержит элементы которые должны растягиваться по вертикали на 100%
            //Выравниваем по вертикали в центр
            $container.css('top', (this.windowHeight - headerHeight - $body.outerHeight(true)) / 2);
            return;
        }

        $body.css('min-height', (this.windowHeight - $header.outerHeight(true) - space * 2) / 2);
        var containerHeight = this.setOuterHeight($modal, this.windowHeight - space * 2);

        //Высота для содержимого окна диалога
        var clientHeight = this.setOuterHeight($container, containerHeight) - $header.outerHeight();

        this.resize($body[0], clientHeight);
        $container.css('top', (this.windowHeight - headerHeight - clientHeight) / 2);
    },

    init: function (container) {
        container = container || document;
        this.windowHeight = $(window).height();
        this.onChangeLayout(container);
        if (this.exchange === null) {
            this.exchange = messageBus.getExchange('global');
            this.exchange.subscribe('OnChangeLayout', _.debounce(this.onChangeLayout.bind(this), 42));
        }


        var exchange = messageBus.getExchange('modal-dialog');
        exchange.subscribe(messageTypes.onLoading, function () {
            this.resizeDialog();
        }.bind(this));
    },

    onChangeLayout: function (container) {
        if (_.isEmpty(container)) {
            container = document;
        }

        var clientHeight = this.windowHeight
            - $("#page-top:not(:hidden)", container).outerHeight()
            - $("#page-bottom:not(:hidden)", container).outerHeight()
            - $("#menu-area:not(:hidden)", container).outerHeight();
        this.resizeView(container, clientHeight);
        this.resizeDialog();
    }
};

var LocalStorageData = function () {
    this.namePrefix = 'InfinniUI.';
};

LocalStorageData.prototype.getKeyName = function (name) {
    return [this.namePrefix, name].join('');
};

LocalStorageData.prototype.getData = function (name, defaultValue) {
    var value = window.localStorage.getItem(this.getKeyName(name));

    if (typeof value === 'undefined') {
        value = defaultValue;
    }

    return value;
};

LocalStorageData.prototype.setData = function (name, value) {
    window.localStorage.setItem(this.getKeyName(name), value);
};

LocalStorageData.prototype.clear = function () {
    window.localStorage.clear();
};
var LOG_LEVEL = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    trace: 5
}

function Logger(level){
    this.messages = [];
    this.setLevel(level || LOG_LEVEL.debug);


    this.showMessages = true;
};

_.extend(Logger.prototype, {
    getLevel: function(){
        return this.level;
    },

    setLevel: function(level){
        this.level = level;
    },

    addMessage: function(messageType, message){
        this.messages.push({
            type: messageType,
            message: message
        });
    },

    debug: function(message){
        if(this.level > LOG_LEVEL.debug){
            return;
        }

        if(this.showMessages){
            console.debug(message.message || message);
        }

        this.addMessage(LOG_LEVEL.debug, message);
    },

    info: function(message){
        if(this.level > LOG_LEVEL.info){
            return;
        }

        if(this.showMessages){
            console.info(message.message || message);
        }

        this.addMessage(LOG_LEVEL.info, message);
    },

    warn: function(message){
        if(this.level > LOG_LEVEL.warn){
            return;
        }

        if(this.showMessages){
            console.warn(message.message || message);
        }

        this.addMessage(LOG_LEVEL.warn, message);
    },

    error: function(message){
        if(this.level > LOG_LEVEL.error){
            return;
        }

        if(this.showMessages){
            console.error(message.message || message);
        }

        this.addMessage(LOG_LEVEL.error, message);
    },

    trace: function(message){
        if(this.level > LOG_LEVEL.trace){
            return;
        }

        if(this.showMessages){
            console.error(message.message || message);
        }

        this.addMessage(LOG_LEVEL.trace, message);
    }
})

var logger = new Logger();
var MessageBox = Backbone.View.extend({
    tagName: 'div',

    className: 'modal hide fade',

    events: {
        'click .btn': 'btnHandler'
    },

    template: _.template(
            '   <div class="modal-body">' +
            '       <p>' +
            '           <i class="fa-lg fa fa-warning" style="color: <%= color %>"></i>' +
            '           <%= text %>' +
            '       </p>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <% _.each( buttons, function(button, i){ %>' +
            '           <a href="javascript:;" class="btn <%= button.classes %> <%= button.type %>-modal" data-index="<%= i %>"><%= button.name %></a>' +
            '       <% }); %>' +
            '   </div>'
    ),

    initialize: function (options) {
        this.options = options;

        this.addButtonClasses();
        this.addColor();

        this.render();

        this.$el
            .modal({show: true})
            .removeClass('hide')
            .css({
                top: '25%'
            });
    },

    render: function () {
        var $parent = this.options.$parent || $('body');

        this.$el
            .html($(this.template(this.options)));

        $parent
            .append(this.$el);

        return this;
    },

    addColor: function(){
        if(this.options.type){
            if(this.options.type == 'error'){
                this.options.color = '#E74C3C;';
            }
            if(this.options.type == 'warning'){
                this.options.color = '#F1C40F;';
            }
        }else{
            this.options.color = '#2ECC71;';
        }
    },

    addButtonClasses: function(){

        var button;

        for(var k in this.options.buttons){
            button = this.options.buttons[k];

            if(button.type){
                if(button.type == 'action'){
                    button.classes = 'blue';
                }
            }else{
                button.classes = 'default';
            }
        }

    },

    btnHandler: function (e) {
        var $el = $(e.target),
            i = parseInt( $el.data('index') ),
            handler = this.options.buttons[i].onClick;

        if(handler){
            handler.apply(this);
        }

        this.closeAndRemove();
    },

    closeAndRemove: function () {
        if (this.options.onClose) {
            this.options.onClose();
        }

        this.$el.modal('hide');
    }
});

/*new MessageBox({
    type: 'error',
    text:'asdasd',
    buttons:[
        {
            name:'Ok',
            onClick: function(){
                alert('ckicked');
            }
        },
        {
            name:'Error btn',
            type: 'action',
            onClick: function(){
                alert('error ckicked');
            }
        }
    ]
});*/
var ApplicationState = function (storage) {
    var defaultMenu = 'MainMenu';

    this.getMenuName = function () {
        return storage.getData('MenuName', defaultMenu);
    };

    this.setMenuName = function (value) {
        storage.setData('MenuName', value);
    };

    this.getConfigId = function () {
        return storage.getData('ConfigId');
    };

    this.setConfigId = function (value) {
        storage.setData('ConfigId', value);
    };

    this.clear = function () {
        storage.clear();
    }

};

window.InfinniUI.State = new ApplicationState(new LocalStorageData());


var stringUtils = {
    format: function(value,args){
        return value.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    },

    formatBinding: function(value,index){
        return value.replace('$', index);
    }
};

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * @description Работа с ValueProperty @see {@link http://demo.infinnity.ru:8081/display/MC/BaseListElement|BaseListElement}
 */
window.InfinniUI.ValueProperty = (function () {

    function getPropertyValue(item, valueProperty) {
        return InfinniUI.ObjectUtils.getPropertyValue(item, valueProperty);
    }

    var getValue = function (item, valueProperty) {
        var value;

        if (_.isEmpty(valueProperty)) {
            value = item;
        } else if (_.isObject(valueProperty)) {
            value = {};
            for (var i in valueProperty) {
                if (!valueProperty.hasOwnProperty(i)) {
                    continue;
                }
                value[i] = getPropertyValue(item, valueProperty[i]);
            }
        } else {
            value = getPropertyValue(item, valueProperty);
        }

        return value;
    };

    return {
        getValue: getValue
    }
})();
function MessageBus() {
    var messageExchanges = {};

    this.getExchange = function (exchangeName) {
        if (_.isEmpty(exchangeName)) {
            throw new Error('exchangeName should be specified');
        }

        if (!messageExchanges.hasOwnProperty(exchangeName)) {
            messageExchanges[exchangeName] = new MessageExchange();
        }

        return messageExchanges[exchangeName];
    };
}

window.messageBus = new MessageBus();
function MessageExchange() {
    var subscriptions = [];

    this.send = function (messageType, messageBody) {
        _.each(subscriptions, function (subscription) {
            if (subscription.messageType.name == messageType.name) {
                subscription.handle(messageBody);
            }
        });
    };

    this.subscribe = function (messageType, messageHandler) {
        var subscription = new Subscription(messageType, messageHandler);
        subscriptions.push(subscription);

        return subscription;
    };
}
window.messageTypes = {
    onViewOpened: { name: 'onViewOpened' },
    onViewClosed: { name: 'onViewClosed' },
    onViewClosing: {name: 'onViewClosing'},
    onViewTextChange: {name: 'onViewTextChange'},

    onLoaded: { name: 'onLoaded' },
    onLoading: { name: 'onLoading' },   //Вызывается, когда выполнен рендеринг формы
    onSetSelectedItem: { name: 'onSetSelectedItem' },
    onSetTextFilter: { name: 'onSetTextFilter' },
    onSetPropertyFilters: { name: 'onSetPropertyFilters' },
    onSetPageSize: { name: 'onSetPageSize' },
    onSetPageNumber: { name: 'onSetPageNumber' },

    onShowView: {name: 'onShowView'},
    onRequestSwitchView: {name: 'onRequestSwitchView'},

    onSelectedItemChanged: {name: 'onSelectedItemChanged'},

    onValidate: {name: 'onValidate'},

    onKeyDown: {name: 'onKeyDown'},

    onCreateLayoutPanel: {name: 'onCreateLayoutPanel'},
    onRemoveLayoutPanel: {name: 'onRemoveLayoutPanel'},
    //onOpenViewInContainer: {name: 'onOpenViewInContainer'}

};
function Subscription(messageType, messageHandler) {
    this.messageType = messageType;

    this.handle = function (messageBody) {
        messageHandler(messageBody);
    };
}
var backgroundPropertyMixin = {

    initBackground: function () {
        this.listenTo(this.model, 'change:background', this.updateBackground);
    },

    updateBackground: function () {
        if (!this.wasRendered) {
            return;
        }
        this.switchClass('background', this.model.get('background'));
    }

};


var baseTextControlMixin = {

};


var bindUIElementsMixin = {
    /**
     * Сохраняет в поле ui элементы по селектору в UI
     *
     * UI: {"name1": "selector1", "name2": "selector2"}
     */
    bindUIElements: function () {
        this.ui = {};

        if (typeof this.UI === 'undefined') {
            return;
        }

        for (var i in this.UI) {
            if (!this.UI.hasOwnProperty(i)) continue;

            this.ui[i] = this.$(this.UI[i]);
        }
    }
};
var errorTextPropertyMixin = {

    initErrorText: function () {
        this.listenTo(this.model, 'change:errorText', this.updateErrorText);
    },

    updateErrorText: function () {
        if (!this.wasRendered) {
            return;
        }
        var errorText = this.model.get('errorText');
        var validationState = 'success';
        var validationMessage = '';
        if (_.isEmpty(errorText) === false) {
            validationMessage = errorText;
            validationState = 'error';
        }

        this.model.set('validationState', validationState);
        this.model.set('validationMessage', validationMessage);
    }
};

var eventHandlerMixin = {

    /**
     *
     * @param {String} name
     * @callback handler
     * @returns {boolean}
     */
    addEventHandler: function (name, handler) {

        this.initEventHandlerMixin();

        if (name === null || typeof name === 'undefined') {
            return false;
        }

        if (handler === null || typeof handler === 'undefined') {
            return false;
        }

        if (typeof this.eventHandlers[name] === 'undefined') {
            this.eventHandlers[name] = [];
        }

        var handlers = this.eventHandlers[name];

        if (handlers.indexOf(handler) === -1) {
            handlers.push(handler);
        }
    },

    /**
     * @description Вызывает обработчики указанного события.
     * Формат вызова callEventHandler(name, [data],[handler])
     * @param {string} name Название события
     * @param {Array} [data] Параметры, которые будут переданы в обработчик
     * @callback [callback] Функцию в которую будут переданы результат вызова каждого обработчика
     */
    callEventHandler: function (name) {
        if (typeof this.eventHandlers === 'undefined' || name === null || typeof name === 'undefined') {
            return;
        }
        var handlers = this.eventHandlers[name];

        if (typeof handlers === 'undefined') {
            return;
        }

        var args = Array.prototype.slice.call(arguments, 1);

        var params = args.pop();
        var callback;

        if (typeof params === 'function') {
            callback = params;
        }
        params = args.pop();

        _.each(handlers, function (handler) {
            var result = handler.apply(undefined, params);
            if (typeof callback !== 'undefined') {
                callback(result);
            }
        });
    },

    /**
     * @private
     */
    initEventHandlerMixin: function () {
        if (typeof this.eventHandlers === 'undefined') {
            this.eventHandlers = {};
        }
    }


};
var foregroundPropertyMixin = {

    initForeground: function () {
        this.listenTo(this.model, 'change:foreground', this.updateForeground);
    },

    updateForeground: function () {
        if (!this.wasRendered) {
            return;
        }
        this.switchClass('foreground', this.model.get('foreground'));
    }

};


var hintTextPropertyMixin = {

    initHintText: function () {
        this.listenTo(this.model, 'change:hintText', this.updateHintText);
    },

    updateHintText: function () {
        if (!this.wasRendered) {
            return;
        }

        var text = this.model.get('hintText');
        if (typeof text === 'undefined' || text === null) {
            text = '';
        }
        this.ui.hintText.text(text);
    }

};


var horizontalTextAlignmentPropertyMixin = {

    initHorizontalTextAlignment: function () {
        this.listenTo(this.model, 'change:horizontalTextAlignment', this.updateHorizontalTextAlignment);
    },

    updateHorizontalTextAlignment: function () {
        if (!this.wasRendered) {
            return;
        }
        var value = this.model.get('horizontalTextAlignment');

        if (InfinniUI.Metadata.HorizontalTextAlignment.indexOf(value) === -1) {
            return;
        }
        this.switchClass('horizontalTextAlignment', value);
    }

};

var labelTextPropertyMixin = {

    initLabelText: function () {
        this.listenTo(this.model, 'change:labelText', this.updateLabelText);
    },

    updateLabelText: function () {
        if (!this.wasRendered) {
            return;
        }

        this.ui.rerender();
    }

};

var lineCountPropertyMixin = {

    updateLineCount: function () {
        if (!this.wasRendered) {
            return;
        }

        var lineCount = this.model.get('lineCount');

        if (lineCount > 0) {
            this.switchClass('line-count',  lineCount, this.ui.container);
            //this.ui.container.removeAttr('class');
            //this.ui.container.addClass('line-count-' + lineCount);
        }
    },

    initUpdateLineCount: function () {
        this.listenTo(this.model, 'change:lineCount', this.updateLineCount);
    }

};

/**
 * Миксин для контрола с использованием масок ввода.
 *
 * Для использования редактора маски ввода в контроле необходимо:
 *  - создать редактор методом {@see textEditorMixin.renderEditor} c указанием необходимых параметров
 *  - реализовать метод onEditorValidate(value) для проверки на допустимость введенного значения
 *
 * Для обработки дополнительной логике при показе/скрытии редактора масок
 * можно использовать события editor:show и editor:hide.
 *
 */
var textEditorMixin = {

    /**
     *
     * options.el Контейнер для редактора
     * options.validate Коллбек для проверки введеного в редакторе значения
     * options.done Коллбек для применения введеного в редакторе значения
     * options.show Функция для отображения поля ввода
     * options.hide Функция для скрытия поля ввода
     *
     * @param options
     */
    renderEditor: function (options) {

        var convert = function (value) {
            if (this.onEditorConvertValue) {
                return this.onEditorConvertValue(value);
            }
            return value;
        }.bind(this);

        var editor = new TextEditor({
            parent: this,
            el: options.el,
            validate: this.onEditorValidate.bind(this),
            convert: convert,
            done: this.onEditorDone.bind(this),
            editMask: this.model.get('editMask'),
            multiline: options.multiline,
            lineCount: options.lineCount,
            inputType: options.inputType
        });

        this.editor = editor;

        this.listenTo(editor, 'editor:show', function () {
            //При показе поля редактирование - скрытить поле ввода элемента
            this.onEditorHideControl();
            //Проброс события от редактора маски к контролу
            this.trigger('editor:show');
        });

        this.listenTo(editor, 'editor:hide', function () {
            //При скрытии поля редактирование - показать поле ввода элемента
            this.onEditorShowControl();
            //Проброс события от редактора маски к контролу
            this.trigger('editor:hide');
        });

        this.listenTo(editor, 'onKeyDown', function (data) {
            //Проброс события от редактора маски к контролу
            this.trigger('onKeyDown', data);
        });

        this.listenTo(this.model, 'change:value', function (model, value) {
            editor.trigger('editor:update', value);
        });

        //Метод для показа поля редактирования
        //Обычно необходимо вызывать при получении фокуса полем ввод а элемента управления
        this.showEditor = function (value, skipRefocus) {
            editor.trigger('editor:show', value, skipRefocus);
        };


    },


    /**
     * Обработчик получения фокуса ввода полем ввода элемента.
     * Показывает поле редактирования с маской ввода и скрывает исходное поле
     * @param event
     */
    onFocusControlHandler: function (event) {
        if(this.model.get('enabled')) {
            this.showEditor(this.model.get('value'), false);
            this.onEditorHideControl();
        }
    },

    onMouseenterControlHandler: function (event) {
        //TODO: при ховере показывается маска (UI-854: убрал) по просьбе TeamLead'a
        //При ховере Editor нужен, чтобы при клике по полю, курсор выставлялся в указаннкю позицию
        if(this.model.get('enabled')) {
            this.showEditor(this.model.get('value'), true);
            this.onEditorHideControl();
        }
    },

    /**
     * Обработчик проверки значения из поля ввода с маской
     * @param value
     * @returns {boolean}
     */
//    onEditorValidate: function (value) {
//        return true;
//    },

    /**
     * Обработчик применения значения из поля ввода с маской
     * @param value
     */
    onEditorDone: function (value) {
        if(typeof value === 'undefined' || value === null || !value.toString().length) {
            value = undefined;
        }
        this.model.set('value', value);
    },

    /**
     * Метод для восстановления видимости поля ввода элемента
     */
    onEditorShowControl: function () {
        this.ui.control.show();
    },

    /**
     * Метод для скрытия поля ввода элемента
     */
    onEditorHideControl: function () {
        this.ui.control.hide();
    },

    /**
     * Метод выполняющий синхронизацию значения из эдитора в элемент
     */
    synchValueHandler: function () {
        if(this.editor.isInFocus()){
            var val = this.editor.getValue();
            this.model.set('value', val);
        }
    }


};
var textStylePropertyMixin = {

    initTextStyle: function () {
        this.listenTo(this.model, 'change:textStyle', this.updateTextStyle);
    },

    updateTextStyle: function () {
        if (!this.wasRendered) {
            return;
        }
        this.switchClass('textstyle', this.model.get('textStyle'));
    }

};

var textWrappingPropertyMixin = {

    initTextWrapping: function () {
        this.listenTo(this.model, 'change:textWrapping', this.updateLinkText);
    },

    updateTextWrapping: function () {
        var textWrapping = this.model.get('textWrapping');
        this.$el.toggleClass('TextWrapping', textWrapping);
        this.$el.toggleClass('NoTextWrapping', !textWrapping);
    }
};
var controlValuePropertyMixin = {

    onValueChanged: function(handler){
        this.controlModel.on('change:value', handler);
    }

};
/**
 * @description Базовый класс контролов
 * @class Control
 */
var Control = function () {
    this.controlModel = this.createControlModel();
    this.controlView = this.createControlView(this.controlModel);

    this.initHandlers();

};

_.extend(Control.prototype, {

    createControlModel: function () {
        throw ('Не перегружен абстрактный метод Control.createControlModel()');
    },

    createControlView: function (model) {
        throw ('Не перегружен абстрактный метод Control.createControlView()');
    },

    initHandlers: function () {
        this.controlView.on('onLoaded', function () {
            this.controlModel.set('isLoaded', true);
        }, this);
    },

    set: function (key, value) {
        this.controlModel.set(key, value);
    },

    get: function (key) {
        return this.controlModel.get(key);
    },

    render: function () {
        return this.controlView.render().$el;
    },

    getChildElements: function () {
        return [];
    },

    onLoaded: function (handler) {
        this.controlModel.on('change:isLoaded', function (isLoaded) {
            if (isLoaded) {
                handler();
            }
        });
    },

    onKeyDown: function (handler) {
        this.controlView.on('onKeyDown', handler);
    }
});

_.mixin({
    'inherit': function (child, parent) {
        var f = new Function();
        f.prototype = parent.prototype;

        child.prototype = new f();
        child.prototype.constructor = child;

        child.superclass = parent.prototype;
    },

    'superClass': function (obj, context, values) {
        var args = _.toArray(arguments);
        args.splice(0, 2);

        obj.superclass.constructor.apply(context, args);
    }
});
var ControlModel = Backbone.Model.extend({
    defaults: {
        text: null,
        name: null,
        enabled: true,
        parentEnabled: true,
        visible: true,
        horizontalAlignment: 'Stretch',
        verticalAlignment: 'Top',
        isLoaded: false,
        validationState: 'success',
        validationMessage: ''
    },

    initialize: function(){

    }
});
var ControlView = Backbone.View.extend({

    initialize: function () {
        this.wasRendered = false;

        this.initVisible();
        this.initHorizontalAlignment();
        this.initVerticalAlignment();
        this.initEnabled();
        this.initName();
        this.initText();
        this.initValidationState();
        this.initStyle();
    },

    initVisible: function () {
        this.listenTo(this.model, 'change:visible', this.updateVisible);
        this.updateVisible();
    },

    initHorizontalAlignment: function () {
        this.listenTo(this.model, 'change:horizontalAlignment', this.updateHorizontalAlignment);
        this.updateHorizontalAlignment();
    },

    initVerticalAlignment: function () {
        this.listenTo(this.model, 'change:verticalAlignment', this.updateVerticalAlignment);
        this.updateVerticalAlignment();
    },

    initEnabled: function () {
        this.listenTo(this.model, 'change:enabled', this.updateEnabled);
        this.updateEnabled();
    },

    initName: function () {
        this.listenTo(this.model, 'change:name', this.updateName);
        this.updateName();
    },

    initStyle: function () {
        this.listenTo(this.model, 'change:style', this.updateStyle);
        this.updateStyle();
    },

    initText: function () {
        this.listenTo(this.model, 'change:text', this.updateText);
        this.updateText();
    },

    initValidationState: function(){
        this.listenTo(this.model, 'change:validationState', this.updateValidationState);
        this.updateValidationState();
    },

    updateVisible: function () {
        var isVisible = this.model.get('visible');
        this.$el
            .toggleClass('hidden', !isVisible);

        this.onUpdateVisible();
    },

    onUpdateVisible: function () {
        var exchange = messageBus.getExchange('global');
        exchange.send('OnChangeLayout', {});
    },

    updateEnabled: function () {
        var isEnabled = this.model.get('enabled');
        this.$el
            .toggleClass('pl-disabled', !isEnabled);
    },

    updateVerticalAlignment: function () {
        var verticalAlignment = this.model.get('verticalAlignment');
        var prefix = 'verticalAlignment';
        var regexp = new RegExp('(^|\\s)' + prefix + '\\S+', 'ig');

        this.$el.removeClass(function (i, name) {
            return (name.match(regexp) || []).join(' ');
        })
            .addClass(prefix + verticalAlignment);
    },

    updateHorizontalAlignment: function () {
        var horizontalAlignment = this.model.get('horizontalAlignment');
        switch (horizontalAlignment) {
            case 'Left':
            {
                this.$el
                    .removeClass('center-block pull-right')
                    .addClass('pull-left');
                break;
            }
            case 'Right':
            {
                this.$el
                    .removeClass('pull-left center-block')
                    .addClass('pull-right');
                break;
            }
            case 'Center':
            {
                this.$el
                    .removeClass('pull-left pull-right')
                    .addClass('center-block');
                break;
            }
            case 'Stretch':
            {
                this.$el
                    .removeClass('pull-left pull-right center-block')
                    .addClass('full-width');
                break;
            }
        }
    },

    updateName: function () {
        var newName = this.model.get('name'),
            currentName = this.$el.attr('data-pl-name');
        if (newName != currentName && typeof newName == 'string') {
            this.$el.attr('data-pl-name', newName);
        }
    },

    updateText: function () {

    },

    updateStyle: function () {
        var customStyle = this.model.get('style');
        this.$el
            .addClass(customStyle);
    },

    updateValidationState: function () {
        var newState = this.model.get('validationState'),
            message = this.model.get('validationMessage');
        switch(newState){

            case 'success': {
                this.$el
                    .removeClass('has-warning has-error');
                this.hideErrorMessage();
            }break;

            case 'warning': {
                this.$el
                    .removeClass('has-error')
                    .addClass('has-warning');
                this.showErrorMessage(message);
            }break;

            case 'error': {
                this.$el
                    .removeClass('has-warning')
                    .addClass('has-error');
                this.showErrorMessage(message);
            }break;

        }

    },

    showErrorMessage: function(message){
        var $errorIcn = $(_.template('<i class="2 error-icn fa fa-warning" data-placement="left" title="<%-message%>"></i>')({message:message}));

        this.hideErrorMessage();
        this.$el.find('.form-control:first')
            .before($errorIcn);

        $errorIcn.tooltip({'container': 'body'});
    },

    hideErrorMessage: function(){
        this.$el.find('.error-icn')
            .remove();
    },

    rerender: function () {
        if (this.wasRendered) {
            this.render();
        }
    },

    prerenderingActions: function () {
        this.wasRendered = true;
    },

    /**
     *
     * @param {Boolean} [onLoaded=true]
     */
    postrenderingActions: function (onLoaded) {
        var triggerEvent = typeof onLoaded === 'undefined' ? true : onLoaded;
        this.delegateEvents();
        if (triggerEvent) {
            this.trigger('onLoaded');
        }
    },

    switchClass: function (name, value, $el) {

        var startWith = name + '-';
        var regexp = new RegExp('(^|\\s)' + startWith + '\\S+', 'ig');
        var $element = $el || this.$el;
        $element.removeClass(function (i, name) {
            return (name.match(regexp) || []).join(' ');
        })
            .addClass(startWith + value);
    }

});

_.extend(ControlView.prototype, bindUIElementsMixin, eventHandlerMixin);
/**
 * Редактор значений, используемый при вводе текста с использованием масок ввода данных
 *
 * Активизируется при получении фокуса ввода элементом {@see textEditorMixin.onFocusControlHandler},
 * скрывая поле ввода элемента и отображая собственное поле редактирование с заданной маской ввода.
 *
 * Подключается к элементу ввода посредством миксина {@see textEditorMixin}.
 */
var TextEditor = Backbone.View.extend({

    templateTextBox: InfinniUI.Template["controls/_base/editor/template/editorTextBox.tpl.html"],
    templateTextArea: InfinniUI.Template["controls/_base/editor/template/editorTextArea.tpl.html"],

    UI: {
        editor: ".pl-control-editor",
        icon: "i"
    },

    events: {
        'blur .pl-control-editor': 'onBlurEditorHandler',
        'keydown .pl-control-editor': 'onKeyDownEditorHandler',
        'keypress .pl-control-editor': 'onKeyPressEditorHandler',
        'keyup .pl-control-editor': 'onKeyUpEditorHandler',
        'click .pl-control-editor': 'onClickEditorHandler',
        'focus .pl-control-editor': 'onFocusEditorHandler',
        'paste .pl-control-editor': 'onPasteEditorHandler',
        'contextmenu .pl-control-editor': 'onContextMenuEditorHandler',
        'mousewheel .pl-control-editor': 'onMouseWheelEditorHandler',
        'mouseleave .pl-control-editor': 'onMouseLeaveEditorHandler'
    },

    /**
     * options.parent {Backbone.View} ролительский элемент управления
     * options.el Элемент в который рендерить редактор
     * options.validate Коллбек для проверки введенного значения
     * options.done Коллбек для установки значения в контроле
     * @param options
     */
    initialize: function (options) {
        //Сразу скрываем редактор
        this.$el.hide();
        this.options = options;
        this.inFocus = false;
        this.on('editor:show', this.onShowEditorHandler);
        this.on('editor:hide', this.onHideEditorHandler);
        this.on('editor:update', this.onUpdateEditorHandler);
        this.isValid = true;

        return this.render();
    },

    render: function () {
        if (this.options.multiline) {
            this.$el.html(this.templateTextArea({lineCount: this.options.lineCount}));
        } else {
            this.$el.html(this.templateTextBox({inputType: this.options.inputType}));
        }
        this.bindUIElements();

        return this;
    },

    setIsValid: function (isValid) {
        if (isValid === this.isValid) return;
        this.isValid = isValid;
        this.toggleValidateState(isValid);
    },

    toggleValidateState: function (isValid) {
        var error;
        this.$el.toggleClass('input-icon right has-error', isValid !== true);
        this.ui.icon.toggle(isValid !== true);
    },

    setValue: function (value) {
        var editMask = this.getOptions('editMask');
        var displayValue;
        //Если указана маска ввода - форматируем значение, иначе выводим как есть.
        if (typeof editMask === 'undefined' || editMask === null) {
            displayValue = value;
        } else {
            editMask.reset(value);
            displayValue = editMask.getText();
        }
        this.ui.editor.val(displayValue);
        this.setIsValid(true);//По умолчанию считаем переданное значение валидно
    },

    getValue: function () {
        var editMask = this.getOptions('editMask');
        var convert = this.getOptions('convert');
        if (editMask) {
            return editMask.getValue();
        } else {
            return convert(this.ui.editor.val());
        }
    },

    isInFocus: function () {
        return this.inFocus;
    },

    /**
     * @description Обработчик события установки значения поля редактирования
     * @param {*} value
     */
    onUpdateEditorHandler: function (value) {
        this.setValue(value);
    },

    /**
     * Обработчик сообщения на отображение поля ввода
     * Показать поле редактирование и установить на нем фокус ввода
     * @param value
     */
    onShowEditorHandler: function (value, skipRefocus) {
        this.cancelled = false;
        this.setValue(value);
        this.$el.show();
        if (!skipRefocus) {
            this.ui.editor.focus();
        }
        this.checkCurrentPosition();
        this.inFocus = true;
    },

    onHideEditorHandler: function () {
        this.$el.hide();
    },
    onKeyDownEditorHandler: function (event) {

        if (event.ctrlKey || event.altKey) {
            return;
        }

        if (event.which === 27) {    //Escape
            //Отменить изменения и выйти из режима редактирования
            this.cancelled = true;
            this.trigger('editor:hide');
        }

        var maskEdit = this.getOptions('editMask');
        if (typeof maskEdit === 'undefined' || maskEdit === null) {
            return;
        }
        var editor = this.ui.editor;
        var elem = editor.get(0);
        var position;

        switch (event.which) {
            case 36:    //Home
                if(event.shiftKey) {
                    elem.selectionEnd = parseInt(elem.selectionEnd, 10);
                }else {
                    position = maskEdit.moveToPrevChar(0);
                    if (position !== false) {
                        this.setCaretPosition(position);
                        event.preventDefault();
                    }
                }
                break;
            case 37:    //Left arrow
                if(event.shiftKey) {
                    elem.selectionEnd = parseInt(elem.selectionEnd, 10);
                }else {
                    if (this.getSelectionLength() > 0){
                        event.preventDefault();
                        this.setCaretPosition(parseInt(elem.selectionStart, 10));
                    }else {
                        position = maskEdit.moveToPrevChar(this.getCaretPosition());
                        if (position !== false) {
                            this.setCaretPosition(position);
                            event.preventDefault();
                        }
                    }
                }
                break;
            case 39:    //Right arrow
                if(event.shiftKey) {
                    elem.selectionEnd = parseInt(elem.selectionEnd, 10);
                }else {
                    if (this.getSelectionLength() > 0){
                        event.preventDefault();
                        this.setCaretPosition(parseInt(elem.selectionEnd, 10));
                    }else {
                        position = maskEdit.moveToNextChar(this.getCaretPosition());
                        if (position !== false) {
                            this.setCaretPosition(position);
                            event.preventDefault();
                        }
                    }
                }
                break;
            case 35:    //End
                position = maskEdit.moveToNextChar(editor.val().length);
                if (position !== false) {
                    this.setCaretPosition(position);
                    event.preventDefault();
                }
                break;
            case 38:    //Up arrow
                if(event.shiftKey) {
                    elem.selectionEnd = parseInt(elem.selectionEnd, 10);
                }else {
                    if (this.getSelectionLength() > 0){
                        event.preventDefault();
                        this.setCaretPosition(parseInt(elem.selectionStart, 10));
                    }else {
                        position = maskEdit.setNextValue(this.getCaretPosition());
                        if (position !== false) {
                            event.preventDefault();
                            editor.val(maskEdit.getText());
                            this.setCaretPosition(position);
                        }
                    }
                }
                break;
            case 40:    //Down arrow
                if(event.shiftKey) {
                    elem.selectionEnd = parseInt(elem.selectionEnd, 10);
                }else {
                    if (this.getSelectionLength() > 0){
                        event.preventDefault();
                        this.setCaretPosition(parseInt(elem.selectionEnd, 10));
                    }else {
                        position = maskEdit.setPrevValue(this.getCaretPosition());
                        if (position !== false) {
                            event.preventDefault();
                            editor.val(maskEdit.getText());
                            this.setCaretPosition(position);
                        }
                    }
                }
                break;
            case 46:    //Delete
                // @TODO Если выделена вся строка - очистить поле редактирования
                //TODO: доделать SelectionLength
                if (this.getSelectionLength() > 0 && !(maskEdit.value instanceof Date)) {
                    event.preventDefault();
                    this.removeSelection(maskEdit);
                } else {
                    position = maskEdit.deleteCharRight(this.getCaretPosition(), this.getSelectionLength());
                    if (position !== false) {
                        event.preventDefault();
                        editor.val(maskEdit.getText());
                        this.setCaretPosition(position);
                    }
                }
                break;
            case 8:    //Backspace
                // @TODO Если выделена вся строка - очистить поле редактирования
                //TODO: доделать SelectionLength
                if (this.getSelectionLength() > 0 && !(maskEdit.value instanceof Date)) {
                    event.preventDefault();
                    this.removeSelection(maskEdit);
                } else {
                    position = maskEdit.deleteCharLeft(this.getCaretPosition(), this.getSelectionLength());
                    if (position !== false) {
                        event.preventDefault();
                        editor.val(maskEdit.getText());
                        this.setCaretPosition(position);
                    }
                }
                break;
            case 32:    //Space
                if (this.getSelectionLength() > 0 && !(maskEdit.value instanceof Date)) {
                    event.preventDefault();
                    this.removeSelection(maskEdit);
                }else {
                    position = maskEdit.getNextItemMask(this.getCaretPosition());
                    if (position !== false) {
                        event.preventDefault();
                        this.setCaretPosition(position);
                    }
                }
                break;

            default:
                //TODO: не работает для DateTimeFormat
                //TODO: доделать SelectionLength замена выделенного текста, по нажатию

                var inp = String.fromCharCode(event.keyCode);
                if (/[a-zA-Z0-9-_ ]/.test(inp)) {
                    if (this.getSelectionLength() > 0 && !(maskEdit.value instanceof Date)) {
                        event.preventDefault();
                        //Data
                        this.removeSelection(maskEdit, String.fromCharCode(event.keyCode));
                    }
                }
                break;
        }
    },

    removeSelection: function(mask, char){
        var res = mask.deleteSelectedText(this.getCaretPosition(), this.getSelectionLength(), char);

        this.ui.editor.val(mask.getText());

        if(!res.result){
            this.setCaretPosition(0);
        }else{
            this.setCaretPosition(res.position);
        }
    },

    checkCurrentPosition: function () {
        var maskEdit = this.getOptions('editMask');
        if (typeof maskEdit === 'undefined' || maskEdit === null) {
            return;
        }
        var currentPosition = this.getCaretPosition();
        var position = currentPosition === 0 ? maskEdit.moveToPrevChar(0) : maskEdit.moveToNextChar(currentPosition - 1);
        if (position !== currentPosition) {
            this.setCaretPosition(position);
        }

    },

    onClickEditorHandler: function (event) {
        this.checkCurrentPosition();
        event.preventDefault();
    },

    onFocusEditorHandler: function () {
        var maskEdit = this.getOptions('editMask');
        if (typeof maskEdit === 'undefined' || maskEdit === null) {
            return;
        }
        var position = maskEdit.moveToPrevChar(0);
        this.setCaretPosition(position);
        this.inFocus = true;
    },

    onKeyUpEditorHandler: function (event) {
        this.trigger('onKeyDown', {
            keyCode: event.which,
            value: this.parseInputValue()
        });
    },

    onKeyPressEditorHandler: function (event) {
        if (event.altKey || event.ctrlKey) {
            return;
        }

        var maskEdit = this.getOptions('editMask');
        if (typeof maskEdit === 'undefined' || maskEdit === null) {
            return;
        }

        var editor = this.ui.editor;
        var char = this.getCharFromKeypressEvent(event);
        var position;

        if (char === null) {
            return;
        }


        position = maskEdit.setCharAt(char, this.getCaretPosition(), this.getSelectionLength());
        if (position !== false) {
            event.preventDefault();
            editor.val(maskEdit.getText());
            this.setCaretPosition(position);
        }
    },

    onPasteEditorHandler: function (event) {
        var maskEdit = this.getOptions('editMask');
        var editor = this.ui.editor;

        if (typeof maskEdit === 'undefined' || maskEdit === null) {
            return;
        }

        var text = (event.originalEvent || event).clipboardData.getData('text/plain') || prompt('Paste something..');
        maskEdit.pasteStringToMask(text, this.getCaretPosition());

        event.preventDefault();
        editor.val(maskEdit.getText());
        //@TODO Реализовать обработку вставки значения из буфера обмена
    },

    onContextMenuEditorHandler: function (event) {
        event.preventDefault();
        this.checkCurrentPosition();
    },

    onMouseWheelEditorHandler: function (event) {
        var maskEdit = this.getOptions('editMask');
        if (typeof maskEdit === 'undefined' || maskEdit === null) {
            return;
        }

        event.preventDefault();
        //@TODO Реализовать изменение значений при прокретке колеса
    },

    onMouseLeaveEditorHandler: function (event) {
        var inFocus = event.currentTarget == document.activeElement;
        if (!inFocus && this.isValid) {
            this.$el.hide();
            this.onBlurEditorHandler();
        }
    },

    /**
     * @private
     * Получение нажатого символа в событии keypress
     * @see {@link http://learn.javascript.ru/keyboard-events#получение-символа-в-keypress}
     * @param event
     * @returns {String}
     */
    getCharFromKeypressEvent: function (event) {
        if (event.which == null) {  // IE
            if (event.keyCode < 32) return null; // спец. символ
            return String.fromCharCode(event.keyCode)
        }

        if (event.which != 0 && event.charCode != 0) { // все кроме IE
            if (event.which < 32) return null; // спец. символ
            return String.fromCharCode(event.which); // остальные
        }

        return null; // спец. символ
    },

    /**
     * @private
     * Получение позиции курсора в поле редактирования
     * @see {@link http://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field}
     * @returns {number}
     */
    getCaretPosition: function () {
        var elem = this.ui.editor.get(0);
        // Initialize
        var position = 0;

        // IE Support
        if (document.selection) {

            // Set focus on the element
            elem.focus();

            // To get cursor position, get empty selection range
            var selection = document.selection.createRange();

            // Move selection start to 0 position
            selection.moveStart('character', -elem.value.length);

            // The caret position is selection length
            position = selection.text.length;
        }

        // Firefox support
        else if (elem.selectionStart || elem.selectionStart == '0')
            position = elem.selectionStart;

        return position;
    },

    getSelectionLength: function () {
        var elem = this.ui.editor.get(0);
        var len = 0;
        var startPos = parseInt(elem.selectionStart, 10);
        var endPos = parseInt(elem.selectionEnd, 10);


        if (!isNaN(startPos) && !isNaN(endPos)) {
            len = endPos - startPos;
        }

        return len;
    },

    /**
     * @private
     * Установка позиции курсора в поле редактирования
     * @see {@link http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox}
     * @param {Integer} [position=0]
     */
    setCaretPosition: function (position) {
        var elem = this.ui.editor.get(0);

        if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', position);
            range.select();
        }
        else {
            if (typeof elem.selectionStart !== 'undefined') {
                elem.setSelectionRange(position, position);
            }
        }
    },

    /**
     * Обработка ппотери фокуса полем ввода
     *
     * При потере фокуса надо проверить что введенное значение удовлетваряет контрол.
     * Если значение контрол принял - скрыть поле ввода, отобразить исходный контрол и вызвать setValue
     * Если контрол значение не принял - поле ввода не скрывать, установить ошибку
     */
    onBlurEditorHandler: function () {
        this.inFocus = false;

        if (this.cancelled) {
            //Выход из поля редактора с отменой изменений
            return;
        }
        var control = this.getOptions('parent');
        var done = this.getOptions('done');
        var validate = this.getOptions('validate');
        var convert = this.getOptions('convert');
        var value = convert(this.ui.editor.val());
        var editMask = this.getOptions('editMask');
        var complete = true;

        //Убираем маску при потере фокуса
        if (typeof editMask !== 'undefined' && editMask !== null) {
            if (!editMask.getIsComplete(this.ui.editor.val())) {
                value = null;
                editMask.reset(value);
                this.trigger('editor:hide');
            } else {
                complete = editMask.getIsComplete(value);
                value = editMask.getValue();
            }
        }

        if (typeof validate !== 'undefined' && validate !== null) {
            var isValid = complete && validate(value);
            this.setIsValid(isValid);

            if (!isValid) {
                //Если значение невалидно - редактор не закрываемю
                return;
            }
        }

        if (typeof done !== 'undefined' && done !== null) {
            //Если указан коллбек на установку значения - вызываем его
            done(editMask ? editMask.getData() : value);
        }
        //Триггерим событие для скрытия поля редактирования
        this.trigger('editor:hide');
    },

    parseInputValue: function () {
        var control = this.getOptions('parent');
        var done = this.getOptions('done');
        var validate = this.getOptions('validate');
        var convert = this.getOptions('convert');
        var value = convert(this.ui.editor.val());
        var editMask = this.getOptions('editMask');
        var complete = true;

        if (typeof editMask !== 'undefined' && editMask !== null) {
            if (!editMask.getIsComplete(this.ui.editor.val())) {
                return;
            } else {
                complete = editMask.getIsComplete(value);
                value = editMask.getValue();
            }
        }

        if (typeof validate !== 'undefined' && validate !== null) {
            var isValid = complete && validate(value);
            if (!isValid) {
                //Если значение невалидно
                return;
            }
        }

        return editMask ? editMask.getData() : value;
    },

    getOptions: function (name) {
        if (typeof name === 'undefined' || name === '' || name === null) {
            return;
        }
        return this.options[name];
    }

});

_.extend(TextEditor.prototype, bindUIElementsMixin);
var builderEditMaskPropertyMixin = {

    initEditMaskProperty: function(params){
        var metadata = params.metadata;
        var builder = params.builder;
        var data = metadata.EditMask;

        //data = {NumberEditMask: {Mask: "n3"}}}

        if(typeof data !== 'undefined' && data !== null && data !== '' ) {
            var editMask = builder.build(params.parent, data);
            params.element.setEditMask(editMask);
        }
    }

};
var builderFormatPropertyMixin = {

    initFormatProperty: function(params){
        var metadata = params.metadata;
        var builder = params.builder;
        var formatField = metadata.DisplayFormat || metadata.ItemFormat;

        if(formatField !== undefined){
            var format = builder.build(params.parent, formatField);
            params.element.setFormat(format);
        }
    }

};
var builderHorizontalTextAlignmentPropertyMixin = {

    initHorizontalTextAlignmentProperty: function(params){
        var metadata = params.metadata;

        if(metadata.HorizontalTextAlignment !== undefined){
            params.element.setHorizontalTextAlignment(metadata.HorizontalTextAlignment);
        }
    }

};
var builderPropertyBindingMixin = {

    /**
     * @description Инициализация датабиндинга для заданного свойства
     * @param propertyName Атрибут в метаданных
     * @param params.metadata
     * @param params.parent
     * @param params.collectionProperty
     * @param params.builder
     * @param params.element
     * @param {function} callbackSetValue Функция для установки значения из DataBinding
     * @param {function|undefined} callbackGetValue Функция для установки значения в DataBinding
     * @returns {*}
     */
    initPropertyBinding: function (propertyName, params, callbackSetValue, callbackGetValue) {

        var setValue = function (value) {
            if (callbackSetValue === null || typeof callbackSetValue === 'undefined') {
                return;
            }
            callbackSetValue(value);
        };

        var getValue = function () {
            if (callbackGetValue === null || typeof callbackGetValue === 'undefined') {
                return;
            }
            return callbackGetValue();
        };



        var metadata = params.metadata;

        if (metadata !== undefined && metadata[propertyName]) {
            var dataBinding = params.builder.build(params.parent, metadata[propertyName], params.collectionProperty);


            if (dataBinding != null) {
                dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                    setValue(dataBinding.getPropertyValue());
                });

                setValue(dataBinding.getPropertyValue());
            }

            return dataBinding;
        }
    }

};
var builderValuePropertyMixin = {

    /**
     * @param {Object} params
     * @param {Boolean|false} useValidation Использовать валидацию
     * @returns {*}
     */
    initValueProperty: function (params, useValidation) {
        var metadata = params.metadata;

        if (typeof useValidation === 'undefined') {
            useValidation = false;
        }

        if (metadata.Value !== undefined) {
            var dataBinding = params.builder.build(params.parent, metadata.Value, params.collectionProperty);

            dataBinding.setElement(params.element);

            if (dataBinding != null) {
                dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                    params.element.setValue(dataBinding.getPropertyValue());
                });

                var data = dataBinding.getPropertyValue();
                if (data !== null && typeof data !== 'undefined') {
                    params.element.setValue(data);
                }

                params.element.onValueChanged(function (dataSourceName, value) {
                    dataBinding.setPropertyValue(value);
                });
            }


            if (useValidation && dataBinding) {
                params.element.onLostFocus(function () {
                    dataBinding.validate();
                });
            }

            return dataBinding;
        }
    }

};
var editMaskPropertyMixin = {

    /**
     * Устанавливает маску ввода данных.
     * @param editMask
     */
    setEditMask: function(editMask){
        this.control.set('editMask', editMask);
    }

};
var formatPropertyMixin = {

    /**
     * Возвращает формат отображения данных.
     * @returns {BooleanFormat|DateTimeFormat|NumberFormat|ObjectFormat}
     */
    getFormat: function(){
        return this.control.get('format');
    },

    /**
     * Устанавливает формат отображения данных.
     * @param {BooleanFormat|DateTimeFormat|NumberFormat|ObjectFormat} format
     * @returns {*}
     */
    setFormat: function(format){
        return this.control.set('format', format);
    }

};
var valuePropertyMixin = {

    getValue: function(){
        return this.control.get('value');
    },

    setValue: function(value){
        return this.control.set('value', value);
    },

    onValueChanged: function(handler){
        this.control.onValueChanged(handler);
    }

};
var Element = function (parentView) {
    this.parentView = parentView;
    this.control = this.createControl();
    this.state = {
        Enabled: true
    };
    this.eventStore = new EventStore();
};

_.extend(Element.prototype, {

    createControl: function () {
        throw ('Не перегружен абстрактный метод Element.createControl');
    },

    getView: function () {
        return this.parentView;
    },

    getName: function () {
        return this.control.get('name');
    },

    setName: function (name) {
        if (typeof name == 'string') {
            this.control.set('name', name);
        }
    },

    getText: function () {
        return this.control.get('text');
    },

    setText: function (text) {
        if (typeof text !== 'undefined') {
            this.control.set('text', text);
        }
    },

    getEnabled: function () {
        return this.control.get('enabled');
    },

    setEnabled: function (isEnabled) {
        if (typeof isEnabled !== 'boolean') {
            return;
        }

        this.setState('Enabled', isEnabled);

        var parentEnabled = this.control.get('parentEnabled');
        var old = this.control.get('enabled');

        isEnabled = parentEnabled && isEnabled;

        if (isEnabled === old) {
            return;
        }

        this.control.set('enabled', isEnabled);
        this.setParentEnabledOnChild(isEnabled);
    },

    setParentEnabledOnChild: function (value) {
        var elements = this.getChildElements();
        if (_.isEmpty(elements) === false) {
            for (var i = 0, ln = elements.length; i < ln; i = i + 1) {
                if (typeof elements[i].setParentEnabled === 'undefined') {
                    continue;
                }
                elements[i].setParentEnabled(value);
            }
        }
    },

    setParentEnabled: function (value) {

        if (typeof value !== 'boolean') {
            return;
        }

        var old = this.control.get('parentEnabled');
        this.control.set('parentEnabled', value);

        if (old !== value) {
            var enabled = value && this.getState('Enabled');
            this.control.set('enabled', enabled);
            this.setParentEnabled(enabled);
            this.setParentEnabledOnChild(enabled);
        }
    },

    getVisible: function () {
        return this.control.get('visible');
    },

    setVisible: function (isVisible) {
        if (typeof isVisible == 'boolean') {
            this.control.set('visible', isVisible);
        }
    },

    getStyle: function(){
        return this.control.get('style');
    },

    setStyle: function(style){
        if(typeof style == 'string'){
            this.control.set('style', style);
        }
    },


    getHorizontalAlignment: function () {
        return this.control.get('horizontalAlignment');
    },

    setHorizontalAlignment: function (horizontalAlignment) {
        if (typeof horizontalAlignment == 'string') {
            this.control.set('horizontalAlignment', horizontalAlignment);
        }
    },

    getVerticalAlignment: function () {
        return this.control.get('verticalAlignment');
    },

    setVerticalAlignment: function (verticalAlignment) {
        if (typeof verticalAlignment == 'string') {
            this.control.set('verticalAlignment', verticalAlignment);
        }
    },

    getChildElements: function () {
        return this.control.getChildElements();
    },

    onLoaded: function (handler) {
        this.control.onLoaded(handler);
    },

    onLostFocus: function (handler) {
        this.control.controlView.addEventHandler('OnLostFocus', handler);
    },

    onGotFocus: function (handler) {
        this.control.controlView.addEventHandler('OnGotFocus', handler);
    },

    getIsLoaded: function () {
        return this.control.get('isLoaded');
    },

    setIsLoaded: function () {
        this.control.set('isLoaded', true);
    },

    render: function () {
        return this.control.render();
    },

    getWidth: function () {
    },

    getHeight: function () {
    },

    getScriptsStorage: function () {
        return this.parentView;
    },

    /**
     * Установка состояния валидации элеменат
     * @param {String} [state="success"]
     * @param {String} [message]
     */
    setValidationState: function (state, message) {
        this.control.set('validationMessage', message);
        this.control.set('validationState', state);
    },

    /**
     * Получение состояния валидации элеменат
     * @return {String} [state="success"]
     */
    getValidationState: function () {
        return this.control.get('validationState');
    },

    getState: function (name) {
        return this.state[name];
    },

    setState: function (name, value) {
        this.state[name] = value;
    },

    onKeyDown: function (handler) {
        var element = this;
        var callback = function (data) {
            data.source = element;
            handler(data);
        };
        return this.control.onKeyDown(callback);
    }
});
var ElementBuilder = function () {
};

//о боги, зачем все это???
_.extend(ElementBuilder.prototype, {

    build: function (builder, parent, metadata, collectionProperty, params) {
        var params = {
                builder: builder,
                parent: parent,
                metadata: metadata,
                collectionProperty: collectionProperty,
                params: params
            },
            element = this.createElement(params);

        params.element = element;

        this.applyMetadata(params);

        if (parent && parent.registerElement) {
            parent.registerElement(element);
        }

        return element;
    },
    createElement: function () {
        throw ('Не перегружен абстрактный метод ElementBuilder.createElement()');
    },

    applyMetadata: function (params) {
        var metadata = params.metadata,
            element = params.element,
            parent = params.parent,
            collectionProperty = params.collectionProperty;

        if(metadata.Text && typeof metadata.Text == 'object'){
            this.initTextBinding(params, metadata.Text);
        }else{
            element.setText(metadata.Text);
        }

        //element.setVisible(metadata.Visible);
        this.initBindingToProperty(params, metadata.Visible, 'Visible', true);

        element.setHorizontalAlignment(metadata.HorizontalAlignment);
        element.setVerticalAlignment(metadata.VerticalAlignment);
        element.setName(metadata.Name);
        element.setEnabled(metadata.Enabled);

        element.setStyle(metadata.Style);

        if (metadata.OnLoaded) {
            element.onLoaded(function () {
                new ScriptExecutor(element.getScriptsStorage()).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (metadata.OnGotFocus){
            params.element.onGotFocus(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnGotFocus.Name);
            });
        }

        if (metadata.OnLostFocus){
            params.element.onLostFocus(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLostFocus.Name);
            });
        }
    },

    initTextBinding: function(params, bindingMetadata){
        var metadata = params.metadata;

        var dataBinding = params.builder.build(params.parent, metadata.Text, params.collectionProperty);

        dataBinding.setElement(params.element);

        if (dataBinding != null) {
            dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                params.element.setText(dataBinding.getPropertyValue());
            });

            var data = dataBinding.getPropertyValue();
            if (data) {
                params.element.setText(data);
            }
        }

        //dataBinding.refresh();
        return dataBinding;
    },

    initBindingToProperty: function(params, bindingMetadata, propertyName, isBooleanBinding){
        var metadata = params.metadata;

        if(!metadata[propertyName] || typeof metadata[propertyName] != 'object'){
            params.element['set' + propertyName](metadata[propertyName]);
            return null;
        }else{
            var dataBinding = params.builder.build(params.parent, metadata[propertyName], params.collectionProperty);
            dataBinding.setSetterName('set' + propertyName);
            dataBinding.setElement(params.element);

            if (dataBinding != null) {
                dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                    if(isBooleanBinding){
                        params.element['set' + propertyName](!!dataBinding.getPropertyValue());
                    }else{
                        params.element['set' + propertyName](dataBinding.getPropertyValue());
                    }
                });

                var data = dataBinding.getPropertyValue();
                if(isBooleanBinding){
                    params.element['set' + propertyName](!!data);
                }else{
                    if (data) {
                        params.element['set' + propertyName](data);
                    }
                }

            }

            return dataBinding;
        }
    }

});
function AcceptActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);
        action.setAction(function (callback) {
            if (callback) {
                parent.onClosed(function () {
                    callback();
                });
            }
            parent.close(dialogResult.accept);
        });

        return action;
    }
}
function AddActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);
        action.setAction(function (callback) {
            var parentDataSource = parent.getDataSource(metadata.DataSource);
            var linkView = builder.build(parent, metadata.View);
            if (linkView) {
                linkView.createView(function (editView) {
                    var editDataSource = _.find(editView.getDataSources(), function (ds) {
                        return isMainDataSource(ds);
                    });

                    editDataSource.suspendUpdate();
                    editDataSource.setEditMode();
                    editDataSource.resumeUpdate();

                    editDataSource.updateItems();

                    editView.onClosed(function (closeResult) {
                        if (callback) {
                            if (closeResult == dialogResult.accept) {
                                callback(editDataSource.getDataItems()[0]);
                            } else {
                                callback(null);
                            }
                        }

                        if (parentDataSource != null) {
                            parentDataSource.updateItems();
                        }
                    });

                    editView.open();
                });
            }
        });

        return action;
    }
}
function AddItemActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseItemActionBuilder().build(builder, parent, metadata);
        action.setAction(function (callback) {
            var linkView = builder.build(parent, metadata.View);
            if (linkView) {
                linkView.createView(function (editView) {
                    var itemDataSource = _.find(editView.getDataSources(), function (ds) {
                        return isMainDataSource(ds);
                    });

                    itemDataSource.suspendUpdate();
                    itemDataSource.setEditMode();
                    itemDataSource.resumeUpdate();

                    itemDataSource.updateItems();

                    editView.onClosed(function (acceptResult) {
                        if (acceptResult == dialogResult.accept) {
                            var newItem = itemDataSource.getSelectedItem();

                            if (newItem !== null) {
                                action.addItem(newItem);
                                action.setSelectedItem(newItem);
                            }
                        }
                    });

                    editView.open();

                    if (callback) {
                        callback(editView);
                    }
                });
            }
        });

        return action;
    }
}
function BaseAction(view) {
    var action;

    this.setAction = function (actionFunc) {
        action = actionFunc;
    };

    this.getAction = function () {
        return action;
    };

    this.execute = function (callback) {
        action(callback);
    };
}
function BaseItemAction(view) {

    var baseAction = new BaseAction();

    var selectedItem = null;

    // TODO
    var context = null;

    baseAction.getSelectedItem = function () {
        return selectedItem;
    };

    var eventStore = new EventStore();
    baseAction.onSetSelectedItem = function (handler) {
        eventStore.addEvent('onSetSelectedItem', handler);
    };
    baseAction.onValueChanged = function (handler) {
        eventStore.addEvent('onValueChanged', handler);
    };
    baseAction.onItemAdded = function (handler) {
        eventStore.addEvent('onItemAdded', handler);
    };
    baseAction.onItemRemoved = function (handler) {
        eventStore.addEvent('onItemRemoved', handler);
    };

    baseAction.setSelectedItem = function (value) {
        if (value !== selectedItem) {
            selectedItem = value;
            eventStore.executeEvent('onSetSelectedItem', context, { value: selectedItem });
        }
    };

    var items = [];

    baseAction.getItems = function () {
        return items;
    };

    baseAction.setItems = function (value) {
        items = value || [];
    };

    baseAction.addItem = function (value) {
        items.push(value);

        eventStore.executeEvent('onValueChanged', context, { value: items });
        eventStore.executeEvent('onItemAdded', context, { value: value });
    };

    baseAction.replaceItem = function (oldItem, newItem) {
        var index = findItem(items, oldItem);

        var itemsRemove = items.slice();
        itemsRemove.splice(index, 1);

        if (index !== -1) {
            items[index] = newItem;
        }

        eventStore.executeEvent('onValueChanged', context, { value: items });

        /*TODO добавить вызов обработчика replaceItem*/
    };

    baseAction.getView = function () {
        return view;
    };

    baseAction.removeItem = function (item) {
        var index = findItem(items, item);

        if (index !== -1) {
            items.splice(index, 1);
            eventStore.executeEvent('onValueChanged', context, { value: items });
            eventStore.executeEvent('onItemRemoved', context, { value: item });
        }
    };

    var findItem = function (array, item) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === item) {
                return i;
            }
        }
        return -1;
    };

    return baseAction;
}
function BaseItemActionBuilder() {

    this.build = function (builder, parent, metadata) {

        var action = new BaseItemAction(parent);

        var itemsDataBinding = builder.build(parent, metadata.Items);

        if (itemsDataBinding !== null) {

            itemsDataBinding.onPropertyValueChanged(function (context, args) {

                var collectionItems = itemsDataBinding.getPropertyValue();

                action.setItems(collectionItems);
            });


            action.onValueChanged(function (context, args) {
                itemsDataBinding.setPropertyValue( args.value);
            });


            //если источник данных двунаправленный
            if (itemsDataBinding.getDataSource) {

                var dataSourceName = itemsDataBinding.getDataSource();
                var propertyName = itemsDataBinding.getProperty();

                //TODO: Необходимо добавить обработку событий OnItemAdded
                //TODO: и OnItemDeleted и пересмотреть концепции байдинга коллекций
/*                action.onItemAdded(function(context,args){
                    parent.getDataSource(dataSourceName).updateItems();
                });

                action.onItemRemoved(function(context,args){
                    parent.getDataSource(dataSourceName).updateItems();
                });*/

                var exchange = parent.getExchange();

                //при изменении выбранного элемента в AddAction (при добавлении нового элемента)
                //уведомляем всех подписчиков - dataBindings
                action.onSetSelectedItem(function(context, args){
                    action.getView().getExchange().send(messageTypes.onSetSelectedItem,{
                        dataSource : dataSourceName,
                        property : propertyName,
                        //@TODO Разобраться почему иногда приходит уже вложенное значени в args.value.
                        value : (typeof args.value === 'undefined') ? args : args.value,
                        isActionSource : true //добавлено с целью избежания зацикливания обработчиков
                    });
                });

                exchange.subscribe(messageTypes.onSetSelectedItem, function (value) {
                    if (dataSourceName === value.dataSource && value.property !== null && value.property !== undefined && !value.isActionSource ) {
                        action.setSelectedItem(value.value);
                    }
                });
            }

        }

        return action;
    }
}
function CancelActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);
        action.setAction(function (callback) {
            if (callback) {
                parent.onClosed(function () {
                    callback();
                });
            }
            parent.close(dialogResult.cancel);
        });

        return action;
    }
}
function DeleteActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);
        action.setAction(function (callback) {
            new MessageBox({
                text: 'Вы уверены, что хотите удалить?',
                buttons: [
                    {
                        name: 'Да',
                        type: 'action',
                        onClick: function () {
                            var parentDataSource = parent.getDataSource(metadata.DataSource),
                                editItem = parentDataSource.getSelectedItem(),
                                idProperty = parentDataSource.getIdProperty();

                            if (editItem && idProperty) {
                                var editItemId = InfinniUI.ObjectUtils.getPropertyValue(editItem, idProperty);

                                if (editItemId) {
                                    parentDataSource.onItemDeleted(function (dataSourceName, value) {
                                        parentDataSource.updateItems();

//                                      TODO: Переделать механизм удаления обработчиков
//                                      parentDataSource.onItemDeleted = null;
                                        if (callback) {
                                            callback();
                                        }

                                    });
                                    parentDataSource.deleteItem(editItemId);
                                }
                            }
                        }
                    },
                    {
                        name: 'Нет'
                    }
                ]
            });
        });

        return action;
    }
}
function DeleteItemActionBuilder() {

    var baseItemActionBuilder = null;

    var getConfirm = function (metadata) {
        var defer = $.Deferred();

        if (metadata.Accept) {
            defer.resolve();
        } else {
            new MessageBox({
                text: 'Вы уверены, что хотите удалить?',
                buttons: [
                    {
                        name: 'Да',
                        type: 'action',
                        onClick: function () {
                            defer.resolve();
                        }
                    },
                    {
                        name: 'Нет'
                    }
                ]
            });
        }

        return defer.promise();
    };


    this.build = function(builder, parent, metadata, collectionProperty){

        var action = new BaseItemActionBuilder(this.executeAction).build(builder,parent,metadata, collectionProperty);

        var that = this;
        action.setAction(function (callback) {
            if(collectionProperty){
                var baseIndex = collectionProperty.getBaseIndex();
                var items = action.getItems();
                action.setSelectedItem(items[baseIndex]);
            }

            that.executeAction(builder, action, metadata, callback, collectionProperty);
        });

        return action;
    };

    this.executeAction = function (builder, action, metadata, callback, itemBinding, collectionProperty) {

        var selectedItem = action.getSelectedItem();

        if(typeof selectedItem === undefined || selectedItem === null) {
            return;
        }

        getConfirm(metadata).then(function () {
            action.removeItem(selectedItem);
            if (typeof callback === 'function') {
                callback();
            }
        });

    };


}
function EditActionBuilder() {
    this.build = function (builder, parent, metadata, itemCollection, itemId) {
        var action = new BaseAction(parent);

        action.setAction(function (callback) {
            var parentDataSource = parent.getDataSource(metadata.DataSource),
                editItem, idProperty, editItemId;

            if(itemId){
                editItemId = itemId;
            }else{
                editItem = parentDataSource.getSelectedItem();

                if(!editItem){
                    new MessageBox({
                        type: 'error',
                        text:'Не выбран объект для редактирования.',
                        buttons:[
                            {
                                name:'Закрыть'
                            }
                        ]
                    });
                    return;
                }

                idProperty = parentDataSource.getIdProperty();
                editItemId = InfinniUI.ObjectUtils.getPropertyValue(editItem, idProperty);
            }

            var linkView = builder.build(parent, metadata.View);
            linkView.createView(function (editView) {
                var editDataSource = _.find(editView.getDataSources(), function (ds) {
                    return isMainDataSource(ds);
                });

                editDataSource.suspendUpdate();
                editDataSource.setEditMode();
                editDataSource.setIdFilter(editItemId);

                editView.onClosed(function (closeResult) {
                    parentDataSource.updateItems();

                    if (callback && closeResult == dialogResult.accept) {

                        callback(editItemId);
                    }
                });

                editView.open();
            });
        });

        return action;
    };
}
function EditItemActionBuilder() {

    var baseItemActionBuilder = null;

    this.build = function(builder, parent, metadata, collectionProperty){

        var action = new BaseItemActionBuilder(this.executeAction).build(builder,parent,metadata, collectionProperty);

        action.setAction(function (callback) {
            if(collectionProperty){
                var baseIndex = collectionProperty.getBaseIndex();
                var items = action.getItems();
                action.setSelectedItem(items[baseIndex]);
            }
            this.executeAction(builder, action, metadata, callback);
        }.bind(this));

        return action;
    };

    this.executeAction = function (builder, action, metadata, callback) {

        var selectedItem = action.getSelectedItem();

        if(selectedItem) {

            var itemLinkView = builder.build(action.getView(), metadata.View);

            if (itemLinkView != null) {

                itemLinkView.createView(function (view) {

                    var dataSources = view.getDataSources();

                    var itemDataSource = null;
                    if(dataSources.length > 0) {
                        itemDataSource = dataSources[0];
                    }

                    if(itemDataSource) {

                        itemDataSource.suspendUpdate();
                        itemDataSource.setEditMode();
                        itemDataSource.resumeUpdate();

                        //var copy = {};
                        //for(var property in selectedItem){
                        //
                        //    copy[property] = selectedItem[property];
                        //}


                        itemDataSource.setSelectedItem(_.clone(selectedItem));

                        view.onClosed(function(acceptResult){
                            if(acceptResult == dialogResult.accept) {

                                var newItem = itemDataSource.getSelectedItem();

                                if (newItem !== null) {

                                    action.replaceItem(selectedItem, newItem);
                                    action.setSelectedItem(newItem);
                                }
                            }

                        });

                        if (callback) {
                            view.onLoaded(function () {
                                callback();
                            })
                        }
                        view.open();
                    }
                })
            }
        }
    }

}
function OpenViewActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);
        action.setAction(function (callback) {
            builder.build(parent, metadata.View).createView(function (view) {
                if (callback) {
                    view.onLoaded(function () {
                        callback(view);
                    });
                }

                view.open();
            });
        });

        return action;
    }
}
function PrintReportActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);

        this.template = function(data){
            return '<form id="form" enctype="application/x-www-form-urlencoded" target="frame" action="http://ic:9900/SystemConfig/UrlEncodedData/Reporting/GetReport" method="post">' +
                '<input type="text" style="display:none" name="Form" value='+data+'>'+
                '</form>'
        };
        this.modalTemplate = function(){
            return '<div class="custom-modal modal container fade" id="full-width" tabindex="-1">'+
                '<div class="modal-header">'+
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                    '<h3>Отчет</h3>'+
                '</div>'+
                    '<div class="modal-body">'+
                        '<iframe name="frame" style="width: 100%; height: 600px"></iframe>'+
                    '</div>'+
                '</div>'
        };

        var data = {};
        var params = [];

        action.setParameters = function (parameters) {
            params.push(parameters);
        };

        action.getParameters = function(){
            return params;
        };

        $.each(metadata.Parameters, function(index, el){
            action.setParameters(el);
        });

        data.Configuration = metadata.Configuration;
        data.Template = metadata.Template;
        data.Parameters = action.getParameters();
        data.FileFormat = 0; //metadata.FileFormat;

        var formData = (JSON.stringify(data)).replace(/"/g, '\'');
        $('body').append(this.template(formData));

        var self = this;
        action.setAction(function (callback) {
            if (!self.$modal) {
                self.$modal = $(self.modalTemplate());
                self.$modal.appendTo('body');
            }

            if (callback) {
                self.$modal.one('shown.bs.modal', function () {
                    callback();
                });
            }

            $('#form').on('submit', function(e) {
                self.$modal.modal('show');
            }).submit();
        });

        return action;
    }
}
function PrintViewActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent);

        this.template = function(data){
            var url = InfinniUI.config.serverUrl+"/SystemConfig/UrlEncodedData/Reporting/GetPrintView";

            return '<form id="form" enctype="application/x-www-form-urlencoded" target="frame" action="'+url+'" method="post">' +
                '<input type="text" maxlength="'+InfinniUI.config.maxLengthUrl+'" style="display:none" name="Form" value="'+data+'">'+
                '</form>';
        };
        this.modalTemplate = function(frameId){
            return '<div class="custom-modal modal container fade" id="full-width" tabindex="-1">'+
                '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                //'<h3>Отчет</h3>'+
                '</div>'+
                '<div class="modal-body">'+
                '<iframe name="frame' + frameId + '" src="/app/utils/pdf/web/viewer.html#' + frameId + '" id="print-report" style="width: 100%; height: 600px"></iframe>'+
                '</div>'+
                '<button type="button" class="btn btn-default btn-close' + frameId + '" style="float: right; margin: 0 10px 10px 0; border: none">Закрыть</button>'+
                '<button type="button" class="btn btn-default btn-print' + frameId + '" style="float: right; margin: 0 10px 10px 0; border: none">Печать</button>'+
                '</div>'
        };

        var self = this;
        action.setAction(function (callback) {
            var dataSource = parent.getDataSource(metadata.DataSource);
            var data = {
                PrintViewId : metadata.PrintViewId,
                PrintViewType : metadata.PrintViewType,
                ConfigId : dataSource.getConfigId(),
                DocumentId : dataSource.getDocumentId(),
                PageNumber : dataSource.getPageNumber(),
                PageSize : dataSource.getPageSize(),
                ActionId: dataSource.getUpdateAction(),
                Item: dataSource.getSelectedItem(),
                Query : dataSource.getQueryFilter().items
            };
            var url = InfinniUI.config.serverUrl+"/SystemConfig/UrlEncodedData/Reporting/GetPrintView";

            window.pdfDocs = window.pdfDocs || [];
            var frameId = window.pdfDocs.length;
            window.pdfDocs.push(null);

            self.sendRequest(data, function(message){
                window.pdfDocs[frameId] = message;
                var _$modal = $(self.modalTemplate(frameId));
                _$modal.appendTo('body');

                if (callback) {
                    _$modal.one('shown.bs.modal', function () {
                        callback();
                    });
                }

                _$modal.modal('show');

                $('.btn-close'+ frameId).on('click', function(e){
                    _$modal.modal('hide');
                });

                $('.btn-print' + frameId).on('click', function(e){
                    var frame = self.getFrame('frame'+frameId);
                    var printButtonElement = frame.window.document.getElementById('print');
                    printButtonElement.click();
                });
            });
        });

        return action;
    };

    this.getFrame = function(fName)
    {
        for(var i=0; i<frames.length; i++){
            try{
                if(window.frames[i].name == fName)
                return frames[i];
            }catch(e) {}

        }

    };

    this.sendRequest = function(params, handler){
        var url = InfinniUI.config.serverUrl+"/SystemConfig/UrlEncodedData/Reporting/GetPrintView";
        var xmlhttp = this.getXmlHttp();

        xmlhttp.open('POST', url, true);
        xmlhttp.withCredentials = true;
        xmlhttp.responseType = 'arraybuffer';
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    handler(xmlhttp.response);
                }
            }
        };
        xmlhttp.send($.param({
            Form: (JSON.stringify(params)).replace(/"/g, '\'')
        }));
    };

    this.getXmlHttp = function(){
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e1) {
                xmlhttp = false;
            }
        }

        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }

        return xmlhttp;
    }
}

function SaveActionBuilder() {
    this.build = function (builder, parent, metadata) {
        var action = new BaseAction(parent),
            parentDataSource = parent.getDataSource(metadata.DataSource),
            canClose = metadata.CanClose;
            canClose == undefined ? canClose = true : canClose = false;

        parentDataSource.onItemSaved(function (dataSourceName, value) {
            parentDataSource.setSelectedItem(value.value);
            if(canClose) {
                parent.close(dialogResult.accept);
            }
        });

        action.setAction(function (callback) {
            var editItem = parentDataSource.getSelectedItem();
            var validation = parentDataSource.validation;
            var validate = validation.validate();

            if (validate === false) {
                validation.notifyElements();
            } else {
                parentDataSource.saveItem(editItem, callback);
            }
        });

        return action;
    }
}
function SaveItemActionBuilder(metadataView) {

    var baseItemActionBuilder = null;

    var parentView = null;

    this.build = function (builder, parent, metadata) {
        var action = new BaseItemAction();

        var that = this;
        action.setAction(function (callback) {
            that.executeAction(builder, action, metadataView, callback);
        });

        parentView = parent;

        return action;
    };

    this.executeAction = function (builder, action, metadata, callback) {
        if (callback) {
            parentView.onClosed(function () {
                callback();
            });
        }
        parentView.close(dialogResult.accept);
    }
}
function SelectActionBuilder() {
}

SelectActionBuilder.prototype.build = function (builder, parent, metadata) {

    var action = new BaseAction(parent);
    action.setAction(function (callback) {
        this.executeAction(builder, parent, metadata, callback);
    }.bind(this));

    return action;
};

SelectActionBuilder.prototype.executeAction = function (builder, parent, metadata, callback) {

    var dstBinding = builder.build(parent, metadata.DestinationValue);

    builder.build(parent, metadata.View).createView(function (view) {

        var srcBinding = builder.build(view, metadata.SourceValue);
        view.onClosed(function (result) {
            if (result == dialogResult.accept) {
                var value = srcBinding.getPropertyValue();
                dstBinding.setPropertyValue(value);

                if (callback) {
                    callback(value);
                }
            }
        });

        view.open();
    });
};


function ApplicationBuilder() {
    if(!this.builder){
        this.builder = new Builder();
        this.registerElementBuilders();
    }
}

_.extend(ApplicationBuilder.prototype, {
    builder: null,

    registerElementBuilders: function(){
        var builder = this.builder;

        builder.register('View', new ViewBuilder());
        builder.register('InlineView', new InlineViewBuilder());
        builder.register('ChildView', new ChildViewBuilder());
        builder.register('AutoView', new MetadataViewBuilder());
        builder.register('ExistsView', new MetadataViewBuilder());

        builder.register('StackPanel', new StackPanelBuilder());
        builder.register('GridPanel', new GridPanelBuilder());
        builder.register('ScrollPanel', new ScrollPanelBuilder());
        builder.register('Panel', new PanelBuilder());
        builder.register('ScrollPanel', new ScrollPanelBuilder());
        builder.register('ViewPanel', new ViewPanelBuilder());
        builder.register('TabPanel', new TabPanelBuilder());
        builder.register('TabPage', new TabPageBuilder());

        builder.register('MenuBar', new MenuBarBuilder());
        
        builder.register('DataGrid', new DataGridBuilder());
        builder.register('DataGridColumn', new DataGridColumnBuilder());
        builder.register('ListBox', new ListBoxBuilder());

        builder.register('TextBox', new TextBoxBuilder());
        builder.register('CheckBox', new CheckBoxBuilder());
        builder.register('ImageBox', new ImageBoxBuilder());
        builder.register('UploadFileBox', new UploadFileBoxBuilder());
        builder.register('Label', new LabelBuilder());
        builder.register('LinkLabel', new LinkLabelBuilder());
        builder.register('DatePicker', new DatePickerBuilder());
        builder.register('ToggleButton', new ToggleButtonBuilder());
        builder.register('NumericBox', new NumericBoxBuilder());
        builder.register('Button', new ButtonBuilder());
        builder.register('ToolBar', new ToolBarBuilder());
        builder.register('ToolBarButton', new ButtonBuilder());
        builder.register('ToolBarSeparator', new ToolBarSeparatorBuilder());
        builder.register('ComboBox', new ComboBoxBuilder());
        builder.register('RadioGroup', new RadioGroupBuilder());
        builder.register('SearchPanel', new SearchPanelBuilder());
        builder.register('ExtensionPanel', new ExtensionPanelBuilder());
        builder.register('FilterPanel', new FilterPanelBuilder());
        builder.register('PopupButton', new PopupButtonBuilder());
        builder.register('DataNavigation', new DataNavigationBuilder());
        builder.register('DocumentViewer', new DocumentViewerBuilder());
        builder.register('TreeView', new TreeViewBuilder());

        builder.register('DocumentDataSource', new DocumentDataSourceBuilder());
        builder.register('PropertyBinding', new PropertyBindingBuilder());
        builder.register('ParameterBinding', new ParameterBindingBuilder());
        builder.register('FileBinding', new FileBindingBuilder());
        builder.register('ObjectBinding', new ObjectBindingBuilder());
        builder.register('ObjectDataSource', new ObjectDataSourceBuilder());
        builder.register('Parameter', new ParameterBuilder());
        builder.register('Validation', new ValidationBuilder());
        builder.register('Criteria', new CriteriaBuilder());

        builder.register('OpenViewAction', new OpenViewActionBuilder());
        builder.register('AddAction', new AddActionBuilder());
        builder.register('EditAction', new EditActionBuilder());
        builder.register('SaveAction', new SaveActionBuilder());
        builder.register('DeleteAction', new DeleteActionBuilder());
        builder.register('CancelAction', new CancelActionBuilder());
        builder.register('AddItemAction', new AddItemActionBuilder());
        builder.register('SaveItemAction', new SaveItemActionBuilder());
        builder.register('EditItemAction', new EditItemActionBuilder());
        builder.register('DeleteItemAction', new DeleteItemActionBuilder());
        builder.register('SelectAction', new SelectActionBuilder());
        builder.register('AcceptAction', new AcceptActionBuilder());
        builder.register('PrintReportAction', new PrintReportActionBuilder());
        builder.register('PrintViewAction', new PrintViewActionBuilder());

        builder.register('BooleanFormat', new BooleanFormatBuilder());
        builder.register('DateTimeFormat', new DateTimeFormatBuilder());
        builder.register('NumberFormat', new NumberFormatBuilder());
        builder.register('ObjectFormat', new ObjectFormatBuilder());

        builder.register('DateTimeEditMask', new DateTimeEditMaskBuilder());
        builder.register('NumberEditMask', new NumberEditMaskBuilder());
        builder.register('TemplateEditMask', new TemplateEditMaskBuilder());
        builder.register('RegexEditMask', new RegexEditMaskBuilder());

        builder.register('Comparator', new ComparatorBuilder());
        builder.register('GlobalNavigationBar', new GlobalNavigationBarBuilder());
        builder.register('ActionBar', new ActionBarBuilder());

    },

    build: function(){
        var args = _.toArray(arguments);

        return this.builder.build.apply(this.builder, args);
    },

    buildType: function(){
        var args = _.toArray(arguments);
        return this.builder.buildType.apply(this.builder, args);
    },

    buildMany: function(){
        var args = _.toArray(arguments);
        return this.builder.buildMany.apply(this.builder, args);
    }
});
function Builder() {
    var objectBuilders = [];

    this.appView = null;

    this.register = function (metadataType, objectBuilder) {
        objectBuilders[metadataType] = objectBuilder;
    };

    this.buildType = function (parentView, metadataType, metadataValue, collectionProperty, params) {
        if (objectBuilders[metadataType] === undefined) {
            return null;
        }

        return objectBuilders[metadataType].build(this, parentView, metadataValue, collectionProperty, params);
    };

    this.build = function (parentView, metadataValue, collectionProperty) {
        var key,
            value,
            result = null;

        for (var p in metadataValue) {
            key = p;
            break; // берем первое найденное свойство в объекте! Остальное игнорируем
        }

        if (typeof key === 'undefined' || key === null) {
            console.error('Builder: Не переданы метаданные');
        } else {
            value = metadataValue[key];
            result = this.buildType(parentView, key, value, collectionProperty);
        }
        return result;
    };

    this.buildMany = function (parentView, metadataValue, collectionProperty) {

        var items = [];

        if (metadataValue) {
            for (var i = 0; i < metadataValue.length; i++) {
                var item = this.build(parentView, metadataValue[i], collectionProperty);

                if (item !== null) {
                    items.push(item);
                }
            }
        }

        return items;
    }
}

var AbstractGridPanelControl = function(){
    _.superClass(AbstractGridPanelControl, this);
};

_.inherit(AbstractGridPanelControl, Control);

_.extend(AbstractGridPanelControl.prototype, {

    addRow: function(row){
        this.controlModel.addRow(row);
    },

    getRows: function(){
        return this.controlModel.getRows();
    }

});
var AbstractGridPanelModel = ControlModel.extend({

    defaults: _.defaults({
        rows: null
    }, ControlModel.prototype.defaults),

    initialize: function(){
        this.set('rows', [])

        ControlModel.prototype.initialize.apply(this);
    },

    addRow: function(row){
        this.get('rows').push(row);
        this.trigger('rowsIsChange', this.get('rows'));
        this.initRowHandlers(row);
    },

    getRows: function(){
        return this.get('rows');
    },

    initRowHandlers: function(row){
        var self = this;

        row.onCellsChange( function(){
            self.trigger('cellsIsChange');
        });

        row.onItemsChange( function(){
            self.trigger('itemsIsChange');
        });
    }

});
var AbstractGridPanelView = ControlView.extend({

    templates: {
        row: null,
        cell: null
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'rowsIsChange', this.rerender);
        this.listenTo(this.model, 'cellsIsChange', this.rerender);
        this.listenTo(this.model, 'itemsIsChange', this.rerender);
    },

    render: function () {
        var $row;
        this.prerenderingActions();

        this.$el
            .empty();

        _.each(this.model.getRows(), function(row){
            $row = this.renderRow(row);
            this.$el
                .append($row);
        }, this);

        this.postrenderingActions();
        return this;
    },

    renderRow: function(row){
        var $row = $(this.templates.row({})),
            $cell;

        _.each(row.getCells(), function(cell){
            $cell = this.renderCell(cell);
            $row.append($cell);
        }, this);

        return $row;
    },

    renderCell: function(cell){
        var $cell = $(this.templates.cell({colSpan: cell.colSpan})),
            $item;

        _.each(cell.getItems(), function(item){
            $item = this.renderItem(item);
            $cell.append($item);
        }, this);

        return $cell;
    },

    renderItem: function(item){
        return item.render();
    }

});
var ActionBarControl = function () {
    _.superClass(ActionBarControl, this);
};

_.inherit(ActionBarControl, Control);

_.extend(ActionBarControl.prototype, {
    createControlModel: function () {
        return new ActionBarModel();
    },

    createControlView: function (model) {
        return new ActionBarView({model: model});
    }
});

var ActionBarModel = ControlModel.extend({

    initialize: function () {
        this.set('pages', []);
        ControlModel.prototype.initialize.apply(this);
    }

});

var ActionBarView = ControlView.extend({

    className: 'pl-action-bar',

    template: {
        //panel: InfinniUI.Template["controls/filterPanel/template/template.tpl.html"],
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:pages', this.onPagesChange);
    },

    render: function () {
        this.renderButtons();
        return this;
    },

    renderButtons: function () {
        var pages = this.model.get('pages');
        var buttons = _.map(pages, function (pageView) {
            var button = new ActionBarButtonView({
                key: pageView.getGuid(),
                text: pageView.getText()
            });
        }, this);
    },

    onPagesChange: function () {

        var pages = this.model.get('pages');
        console.log(pages);
        for (var i = 0, ln = pages.length; i < ln; i = i + 1) {

        }
    }

});
var ActionBarButtonModel = Backbone.Model.extend({

});

var ActionBarButtonView = Backbone.Model.extend({

    initialize: function (options) {
        this.model = new ActionBarButtonModel(options);
    }
});
var ActiveBarModel = Backbone.Model.extend({
	
	defaults: {
		tabs: null,
		title: '',
		appId: '',
		appName: '',
		viewId: ''
	},

	initialize: function () {
		var appId = this.get('appId');
		var tabs = new ActiveBarTabCollection();
		this.set('tabs', tabs);

		messageBus.getExchange(appId)
			.subscribe(messageTypes.onViewOpened, this.onViewOpenedHandler.bind(this));

		messageBus.getExchange(appId)
			.subscribe(messageTypes.onViewClosed, this.onViewClosedHandler.bind(this));
	},

	/**
	 * @description Обработчик события открытия представления приложения
	 */
	onViewOpenedHandler: function (message) {
		var tabs = this.get('tabs');
		tabs.add({
			title: message.view.getText(),
			view: message.view,
			viewId: message.viewId,
			appId: this.get('appId')
		});
	},

	/**
	 * @description Обработчик события закрытия представления приложения
	 */
	onViewClosedHandler: function (message) {
		var tabs = this.get('tabs');
		var viewId = message.viewId;
		var deleted = tabs.where({viewId: viewId});
		_.forEach(deleted, function (tab) {
			tabs.remove(tab);
		});

	}
});

var ActiveBarView = Backbone.View.extend({

	className: 'pl-active-bar',

	template: InfinniUI.Template['controls/application/activeBar/template/template.tpl.html'],
	
	UI: {
		navbar: '.navbar-nav',
		list: '.navigation-list',
		popup: '.navbar-list-container'
	},

	events: {
		'click .navigation-list': 'onTogglePopupHandler'
	},

	initialize: function () {
		var tabs = this.model.get('tabs');

		this.listenTo(tabs, 'add', this.onAddTabHandler.bind(this));
		this.listenTo(tabs, 'view:close', this.onCloseView);
		this.listenTo(tabs, 'view:active', this.onActiveView);

		this.once('render', function (){
			tabs.add({
				home: true,
                view: this.model.get('view'),
				appId: this.model.get('appId'),
				viewId: this.model.get('viewId'),
				appName: this.model.get('appName')
			});
		});
	},

	/**
	 * @description Обработчик добавления вкладки в коллекцию
	 * @param model
	 * @param collection
	 */
	onAddTabHandler: function (model, collection) {
		var tabView = new ActiveBarTabView({
			model: model
		});
        var view = model.get('view');
        view.onTextChange(function () {
            collection.trigger('onTextChange');
        });
		this.renderTab(tabView);
		model.set('active', true);
	},

	onCloseView: function(viewModel){
		//Отправить в шину сообщение на закрытие представления
		var appId = viewModel.get('appId');
		var exchange = messageBus.getExchange(appId);
		exchange.send(messageTypes.onViewClosing, {
			viewId: viewModel.get('viewId'),
			appId: appId
		});
	},

	onActiveView: function(viewModel){
		var collection = viewModel.collection;
		var viewId = viewModel.get('viewId');
		if (!viewModel.get('active') === true) {
			// Сброс атрибута активности у других вкладок
			collection.forEach(function (tab) {
				tab.set('active', tab === viewModel);
			});

			messageBus.getExchange(viewModel.get('appId')).send(messageTypes.onShowView, {viewId: viewId});
		}
	},

	render: function () {
		var data = this.model.toJSON();
		this.$el.html(this.template(data));
		this.bindUIElements();

		var list = new ActiveBarPopup({collection: this.model.get('tabs')});
		this.ui.popup.append(list.render().$el);

		this.trigger('render');
		return this;
	},

	renderTab: function (tabView) {
		this.ui.navbar.append(tabView.render().$el);
	},

	requestClose: function (callback) {
		var exchange;
		var tabs = this.model.get('tabs');
		var messages = tabs.map(function (tab) {
			return {
				viewId: tab.get('viewId'),
				appId: tab.get('appId')
			};
		});
		messages.shift();//Пропускаем home

		if (messages.length === 0) {
			//Нечего закрывать
			callback();
		} else {

			this.listenTo(tabs, 'remove', function () {
				if (tabs.length === 1) {
					callback()
				}
			});

			_.forEach(messages, function (message) {
				exchange = messageBus.getExchange(message.appId);
				exchange.send(messageTypes.onViewClosing, message);
			});
		}
	},

	onTogglePopupHandler: function (event) {
		event.preventDefault();
		this.toggleList();
	},

	toggleList: function () {
		var tabs = this.model.get('tabs');
		var messages = tabs.map();
		messages.shift();//Пропускаем home

		if (messages.length != 0) {
			if (this.ui.popup.hasClass('hidden')) {
				this.ui.popup.toggleClass('hidden', false);
			} else {
				this.ui.popup.toggleClass('hidden', true);
			}
		}
	}

});

_.extend(ActiveBarView.prototype, bindUIElementsMixin);

var ActiveBarControl = function (appId, view, viewId) {
    this.appId = appId;
    this.appName = view.getText();
    this.viewId = viewId;
    this.view = view;

    _.superClass(ActiveBarControl, this);
};
_.inherit(ActiveBarControl, Control);
_.extend(ActiveBarControl.prototype, {
    createControlModel: function () {
        return new ActiveBarModel({appId: this.appId, appName: this.appName, viewId: this.viewId, view: this.view});
    },
    createControlView: function (model) {
        return new ActiveBarView({model: model});
    },

    /**
     * @description Закрытие дочерних представлений приложения
     * @param {Function} callback
     */
    closingViews: function (callback) {
        this.controlView.requestClose(callback);
        //var views = this.controlModel.get('views');
        //this.controlView.onClosedAllViews = callback;
        //if (views.length > 0) {
        //    var exchange = messageBus.getExchange(this.appId);
        //    // Рассылка всем представлениям из ActiveBar запроса на закрытие
        //    views.each(function (data) {
        //        exchange.send(messageTypes.onViewClosing, {viewId: data.get('viewId'), appId: this.appId});
        //    });
        //} else {
        //    //Нет открытых дочерних представлений
        //    callback();
        //}
    },

    remove: function () {
        this.controlView.remove();
    }

});
var ActiveBarTabModel = Backbone.Model.extend({
	defaults: {
		title: '',
		view: null,
		viewId: null,
		appId: null,
		home: false,
		active: false
	},

	initialize: function () {
		this.on('change:active', this.onChangeActiveHandler);
	},

	onChangeActiveHandler: function (model, value) {
		var collection = this.collection;
		var viewId = this.get('viewId');
		if (value === true) {
			// Сброс атрибута активности у других вкладок
			collection.forEach(function (tab) {
				tab.set('active', tab === model);
			});

			messageBus.getExchange(this.get('appId')).send(messageTypes.onShowView, {viewId: viewId});
		}
	},

	requestClose: function () {
		//Отправить в шину сообщение на закрытие представления
		var appId = this.get('appId');
		var exchange = messageBus.getExchange(appId);
		exchange.send(messageTypes.onViewClosing, {
			viewId: this.get('viewId'), 
			appId: appId
		});
	}
});

var ActiveBarTabCollection = Backbone.Collection.extend({
	model: ActiveBarTabModel,

	initialize: function () {
		this.on('remove', this.onRemoveHandler);
	},

	onRemoveHandler: function (model, collection) {
		var model = collection.findWhere({active: true});
		if (typeof model !== 'undefined') {
			return;
		}

		//Активные вкладки были закрыты
		model = collection.at(0);
		if (typeof model !== 'undefined') {
			model.set('active', true);
		}

	}
});

var ActiveBarTabView = Backbone.View.extend({

	tagName: 'li',

	template: {
		normal: InfinniUI.Template['controls/application/activeBar/template/button/normal.tpl.html'],
		home: InfinniUI.Template['controls/application/activeBar/template/button/home.tpl.html']
	},

	UI: {
		close: '.close'
	},

	events: {
		'click .close-inset': 'onClickCloseHandler',
		'click': 'onClickHandler'
	},

	initialize: function () {
		this.listenTo(this.model, 'change', this.onChangeHandler);
		this.listenTo(this.model, 'remove', this.onRemoveHandler);
        var view = this.model.get('view');
        view.onTextChange(this.render.bind(this));
	},

	/** @description Обработчик удаления модели из коллекции. Удаляем Представление модели **/
	onRemoveHandler: function () {
		this.remove();
	},

	onChangeHandler: function (model) {
		var viewId = this.model.get('viewId');
		var $app = this.$el.parents('.app-area');

		$app.children('[data-view-id]').hide();

		if (model.get('active') === true) {
			var $el = $app.children('[data-view-id="' + viewId + '"]').show();
		}
		this.render();// @TODO Возможно лучше произвести изменения в DOM, чем перерендеривать представление
	},

	render: function () {
		var data = this.model.toJSON();
		this.$el.toggleClass('active', data.active);
		this.$el.toggleClass('home', this.model.get('home'));

		var template = (this.model.get('home')) ? this.template['home'] : this.template['normal'];

        var view = this.model.get('view');
		this.$el.html(template({
            viewId: this.model.get('viewId'),
            appName: view.getText(),
            title: view.getText()
        }));
		this.bindUIElements();
		return this;
	},

	/** @description Обработчик нажатия на кнопку закрытия вкладки **/	
	onClickCloseHandler: function (event) {
		this.model.requestClose();
		event.preventDefault();
		event.stopPropagation();
	},

	/** @description Обработчик нажатия на вкладку, для переключения ее активизации **/
	onClickHandler: function (event) {
		event.preventDefault();
		this.model.set('active', true);
	}

});

_.extend(ActiveBarTabView.prototype, bindUIElementsMixin);

var ActiveBarPopup = Backbone.View.extend({

    tagName: 'ul',

    className: 'navbar-list-items',

    template: {
        item: InfinniUI.Template['controls/application/activeBar/template/item.tpl.html']
    },

    UI: {
        items: '.items'
    },

    events: {
        'click .navbar-list-item': 'onItemClickHandler',
        'click .navbar-list-item-close': 'onCloseClickHandler',
        'mouseleave': 'onMouseOutHandler'
    },

    /**
     * @param {*} options
     * @param {ActiveBarTabsCollection} options.collection
     */
    initialize: function (options) {
        var collection = options.collection;

        this.listenTo(collection, 'add', this.onChangeHandler);
        this.listenTo(collection, 'remove', this.onChangeHandler);
        this.listenTo(collection, 'onTextChange', this.onChangeHandler);

        this.collection = collection;
    },

    onChangeHandler: function (model, collection) {
        this.renderItems();
    },

    renderItems: function () {
        var collection = this.collection;
        var template = this.template.item;
        var $items = this.$el;
        $items.empty();

        collection.forEach(function (model) {
            if (model.get('home') !== true) {
                var view = model.get('view');
                $items.append(template({
                    viewId: model.get('viewId'),
                    title: view.getText()
                }));
            }
        }, this);
    },

    render: function () {
        this.$el.empty();
        this.renderItems();
        return this;
    },

    onItemClickHandler: function (event) {
        event.preventDefault();
        var $el = $(event.target);
        var viewId = $el.attr('data-view-id');
        var view = this.collection.findWhere({viewId: viewId});
        view.trigger('view:active', view);
    },

    onCloseClickHandler: function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $el = $(event.target);
        var viewId = $el.attr('data-view-id');
        var view = this.collection.findWhere({viewId: viewId});
        view.trigger('view:close', view);
    },

    onMouseOutHandler: function () {
        this.$el.parent().addClass('hidden');
    }

});
function ApplicationView() {

    var $top;
    var $bottom;
    var $container;

    var template = InfinniUI.Template['controls/application/applicationView/template.tpl.html'];

    this.getContainer = function () {
        return $container;
    };

    this.open = function ($el) {
        $el.prepend(template({}));

        $top = $('#page-top', $el);
        $bottom = $('#page-bottom', $el);
        $container = $('#page-content', $el);

        $('#page-top')
            .empty()
            .append(new StatusBarControl().render());
        $('#page-bottom')
            .empty()
            .append(new GlobalNavigationBarControl().render());
    };

    this.getApplicationView = function () {
        return this;
    }

}

var GlobalNavigationBarApplicationModel = Backbone.Model.extend({

    defaults: {
        appId: null,
        viewId: null,
        name: null,
        pinned:false,
        active: false,
        home: false
    }

});

var GlobalNavigationBarApplicationCollection = Backbone.Collection.extend({
    model: GlobalNavigationBarApplicationModel,

    initialize: function () {
        this.on('add', this.onAddHandler, this);
    },

    onAddHandler: function (model) {
        this.listenTo(model, 'change:active', this.onChangeModelHandler.bind(this));
    },

    onChangeModelHandler: function (model, value) {
        var index = this.indexOf(model);
        var button;

        if (value === true) {
            for (var i = 0; i < this.length; i = i + 1) {
                button = this.at(i);
                button.set('before-active', i === index - 1);
                button.set('after-active', i === index + 1);
                button.set('last', this.length === i + 1);
            }
        }
    }

});


var GlobalNavigationBarApplicationView = Backbone.View.extend({

    className: 'pl-gn-button',

    tagName: 'div',

    template: {
        home: InfinniUI.Template['controls/application/globalNavigationBar/template/button/home.tpl.html'],
        pinned: InfinniUI.Template['controls/application/globalNavigationBar/template/button/pinned.tpl.html'],
        normal: InfinniUI.Template['controls/application/globalNavigationBar/template/button/normal.tpl.html']
    },

    activeClass: 'pl-active',

    UI: {
        link: '.pl-gn-button-link',
        close: '.pl-gn-button-close'
    },

    events: {
        'click .pl-gn-button-link': 'onClickLinkHandler',
        'click .pl-gn-button-close': 'onClickCloseHandler'
    },

    onClickLinkHandler: function (event) {
        this.model.trigger('application:active', this.model);
        event.preventDefault();
    },

    onClickCloseHandler: function (event) {
        this.model.trigger('application:close', this.model);
        event.preventDefault();
    },

    initialize: function () {
        this.listenTo(this.model, 'change', this.onChangeHandler);
    },

    render: function () {
        var model = this.model;
        var pinned = model.get('pinned');
        var active = model.get('active');
        var home = model.get('home');
        var view = model.get('view');
        var template;

        if (home === true) {
            template = this.template.home;
        } else {
            template = pinned ? this.template.pinned : this.template.normal;
        }

        this.$el.html(template({
            appId: model.get('appId'),
            name: view.getText()
        }));

        this.$el.toggleClass('pl-before-active', !!model.get('before-active'));
        this.$el.toggleClass('pl-after-active', !!model.get('after-active'));
        this.$el.toggleClass('last', !!model.get('last'));
        this.$el.toggleClass(this.activeClass, active);
        this.$el.toggleClass(this.activeClass, active);
        this.$el.toggleClass('pl-gn-button-home', home);

        this.bindUIElements();
        this.delegateEvents();

        return this;
    },

    onChangeHandler: function () {
        //При ищменении атрибутов приложения - перерисовка кнопки
        this.render();
    }

});

_.extend(GlobalNavigationBarApplicationView.prototype, bindUIElementsMixin);

var GlobalNavigationBarControl = function () {
    _.superClass(GlobalNavigationBarControl, this);
};

_.inherit(GlobalNavigationBarControl, Control);

_.extend(GlobalNavigationBarControl.prototype, {
    createControlModel: function () {
        return new GlobalNavigationBarModel();
    },
    createControlView: function (model) {
        return new GlobalNavigationBarView({model: model});
    }
});

var GlobalNavigationBarModel = ControlModel.extend({
    defaults: _.defaults({}, ControlModel.prototype.defaults)
});


var GlobalNavigationBarView = ControlView.extend({

    className: 'pl-global-navigation-bar',

    UI: {
        fixed: '.pl-gn-buttons-fixed',
        pinned: '.pl-gn-buttons-pinned',
        normal: '.pl-gn-buttons-applications',
        list: '.pl-global-navigation-list',
        popup: '.pl-gn-list-container'
    },

    template: InfinniUI.Template['controls/application/globalNavigationBar/template/template.tpl.html'],

    events: {
        'click .home': 'onClickHomeHandler',
        'click .pl-global-navigation-list': 'onTogglePopupHandler'
    },

    homePageHandler: true,

    initialize: function () {
        var applications = new GlobalNavigationBarApplicationCollection();
        this.model.set('applications', applications);
        this.listenTo(applications, 'add', this.onAddApplicationHandler);
        this.listenTo(applications, 'remove', this.onRemoveApplicationHandler);

        window.applications = applications;

        this.buttons = {};
        messageBus.getExchange('global').subscribe(messageTypes.onViewOpened, this.onAddViewEventHandler.bind(this));
    },

    /**
     * @description Обработчик добавления данных о приложении в список приложений
     * @param application
     */
    onAddApplicationHandler: function (application, applications) {
        var appId = application.get('appId');
        var pinned = application.get('pinned');
        var home = application.get('home');
        var view = application.get('view');

        view.onTextChange(function () {
            applications.trigger('onTextChange');
        });

        this.listenTo(application, 'change:pinned', this.onChangePinnedHandler);

        var button = new GlobalNavigationBarApplicationView({model: application});

        this.buttons[appId] = button;

        var $container;
        $container = this.ui.normal;
        //
        //if (home) {
        //    $container = this.ui.fixed;
        //} else {
        //    $container = pinned ? this.ui.pinned : this.ui.normal;
        //}
        var $el = button.render().$el;
        $container.append($el);
        view.onTextChange(function ($el, view) {
            $el.find('.pl-gn-button-link > span').text(view.getText());
        }.bind(this, $el, view));

        this.listenTo(application, 'application:close', this.onCloseApplication);
        this.listenTo(application, 'application:active', this.onActiveApplication);

        this.setActiveApplication(appId);
    },

    onRemoveApplicationHandler: function (application) {
        var appId = application.get('appId');
        var button = this.buttons[appId];
        button.remove();
    },

    setActiveApplication: function (appId) {
        var applications = this.model.get('applications');
        var application = applications.findWhere({appId: appId});
        /** @TODO Скрыть другие приложения, показать выбранное приложение **/

        /** @TODO Отрефакторить! Нужно сделать ч/з getApplicationView **/
        $('#page-content').find('[data-app-id]').hide();
        $('#page-content').find('[data-app-id="' + appId + '"]').show();

        var button = this.buttons[appId];
        this.setActiveButton(appId);
    },


    onActiveApplication: function (application) {
        this.setActiveApplication(application.get('appId'));
        this.toggleList(false);
    },

    /**
     * @description Обработчик нажатия кнопки закрытия вкладки приложения
     * @param application
     */
    onCloseApplication: function (application) {
        var appId = application.get('appId');
        this.closeApplication(appId);
        this.toggleList(false);
    },

    /**
     * @description Закрытие приложения
     * @param appId
     */
    closeApplication: function (appId) {
        var application = applications.findWhere({appId: appId});
        var activeBar = application.get('activeBar');
        activeBar.closingViews(this.closingApplicationView.bind(this, appId));
    },

    /**
     * #description Закрытие представления приложения
     * @param appId
     */
    closingApplicationView: function (appId) {
        var application = applications.findWhere({appId: appId});
        var view = application.get('view');
        var exchange = messageBus.getExchange('global');

        var message = {appId: appId, viewId: application.get('viewId')};
        exchange.send(messageTypes.onViewClosing, message);
    },

    /**
     * Установка признака активности кнопки преключения указанного приложения
     * @param button
     */
    setActiveButton: function (appId) {
        _.each(this.buttons, function (btn, id) {
            btn.model.set('active', id === appId);
        });
    },

    /**
     * @description Обработчик изменения признака закрепления кнопки на панели задач. Перемещает кнопку в нужный раздел
     * @param application
     * @param {Boolean} pinned
     */
    onChangePinnedHandler: function (application, pinned) {
        var appId = application.get('appId');
        var button = this.buttons[appId];
        //var $container = pinned ? this.ui.pinned : this.ui.normal;
        var $container = this.ui.normal;
        button.$el.detach().appendTo($container);
    },

    /**
     * @description Обработчик открытия представления.
     * @param message
     */
    onAddViewEventHandler: function (message) {
        var activeBar;
        var applications = this.model.get('applications');
        var application = applications.add({
            name: message.view.getText(),
            appId: message.appId,
            viewId: message.viewId,
            view: message.view,
            home: this.homePageHandler
        });


        if (this.homePageHandler) {
            this.homePageHandler = false;
        } else {
            activeBar = new ActiveBarControl(message.appId, message.view, message.viewId);
            application.set('activeBar', activeBar, {silent: true});
            message.container.prepend(activeBar.render());
            this.show(message.appId);
        }

        var exchange = messageBus.getExchange('global');
        exchange.subscribe(messageTypes.onViewClosed, this.onViewClosedHandler.bind(this, message.appId));

        //exchange.subscribe(messageTypes.onViewClosing, this.closingApplicationView.bind(this, message.appId));
    },

    /**
     * @description Обработчик закрытия представления приложения
     * @param appId
     * @param message
     */
    onViewClosedHandler: function (appId, message) {
        var applications = this.model.get('applications');
        var application = applications.findWhere({appId: appId});
        var activeBar;

        if (application && message.viewId === application.get('viewId')) {
            activeBar = application.get('activeBar');
            applications.remove(application);
            activeBar.remove();
            // @TODO Активировать соседнее приложение
            application = applications.last(1).pop();
            this.setActiveApplication(application.get('appId'));
        }

    },

    show: function (appId) {
        if (_.isEmpty(appId)) {
            alert('appId is null');
            return;
        }

        this.setActiveButton(appId);


    },

    hide: function (appId, appIdActive) {
        if (_.isEmpty(appId)) {
            alert('appId is null');
            return;
        }
        if (_.isEmpty(appIdActive)) {
            appIdActive = this.$el.find('.navbar-nav li:first a').data('app-anchor');
        }

        $('#page-content').find('[data-app-id]').hide();
        $('#page-content').find('[data-app-id="' + appId + '"]').remove();
        $('#page-content').find('[data-app-id="' + appIdActive + '"]').show();
    },

    render: function () {
        this.$el.html(this.template({}));
        this.bindUIElements();

        var list = new GlobalNavigationPopup({collection: this.model.get('applications')});

        this.ui.popup.append(list.render().$el);
        return this;
    },

    /**
     * Обработка нажатия ссылки переходна на домашнюю страницу
     * @param event
     */
    onClickHomeHandler: function (event) {

    },

    onTogglePopupHandler: function (event) {
        event.preventDefault();
        this.toggleList();
    },

    toggleList: function (show) {
        if (typeof show === 'boolean') {
            this.ui.popup.toggleClass('hidden', !show);
        } else {
            this.ui.popup.toggleClass('hidden');
        }

    }

});
var GlobalNavigationPopup = Backbone.View.extend({

    tagName: 'ul',

    className: 'pl-gn-list',

    template: {
        item: InfinniUI.Template['controls/application/globalNavigationBar/template/item.tpl.html']
    },

    UI: {
        items: '.items'
    },

    events: {
        'click .pl-application-item': 'onItemClickHandler',
        'click .pl-application-close': 'onCloseClickHandler',
        'mouseleave': 'onMouseOutHandler'
    },

    /**
     * @param {*} options
     * @param {GlobalNavigationBarApplicationCollection} options.collection
     */
    initialize: function (options) {
        var collection = options.collection;

        this.listenTo(collection, 'add', this.onChangeHandler);
        this.listenTo(collection, 'remove', this.onChangeHandler);
        this.listenTo(collection, 'onTextChange', this.onChangeHandler);

        this.collection = collection;
    },

    onChangeHandler: function (model, collection) {
        this.renderItems();
    },

    renderItems: function () {
        var collection = this.collection;
        var template = this.template.item;
        var $items = this.$el;
        $items.empty();

        collection.forEach(function (model) {
            if (model.get('home') !== true) {
                var view = model.get('view');
                $items.append(template({
                    name: view.getText(),
                    appId: model.get('appId')
                }));
            }
        }, this);
    },

    render: function () {
        this.$el.empty();
        this.renderItems();
        return this;
    },

    onItemClickHandler: function (event) {
        event.preventDefault();
        var $el = $(event.target);
        var appId = $el.attr('data-app-id');
        var application = this.collection.findWhere({appId: appId});
        application.trigger('application:active', application);
    },

    onCloseClickHandler: function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $el = $(event.target);
        var appId = $el.attr('data-app-id');
        var application = this.collection.findWhere({appId: appId});
        application.trigger('application:close', application);
    },

    onMouseOutHandler: function () {
        this.$el.parent().addClass('hidden');
    }

});
jQuery(document).ready(function () {
    refreshUserInfo();
});

function getUserInfo(self){
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);
    authProvider.getCurrentUser(
        function (result) {
            self.model.set('result', result);
        },
        function (error) {
            showObject('#signInInternalResult', error);
        }
    );
}

function refreshUserInfo() {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);
    authProvider.getCurrentUser(
        function (result) {
            setUserInfo(result);
        },
        function (error) {
            showObject('#getCurrentUserResult', error);
        }
    );
}

function changePassword() {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);

    authProvider.changePassword(
        $('#oldPassword').val(),
        $('#newPassword').val(),
        function (result) {
            refreshUserInfo();
        },
        function (error) {
            showObject('#changePasswordResult', error);
        }
    );
}

function changeProfile() {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);

    authProvider.changeProfile(
        $('#displayName').val(),
        $('#description').val(),
        function (result) {
            refreshUserInfo();
        },
        function (error) {
            showObject('#changeProfileResult', error);
        }
    );
}

function changeActiveRole() {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);

    authProvider.changeActiveRole(
        $('#activeRole').val(),
        function (result) {
            refreshUserInfo();
        },
        function (error) {
            showObject('#сhangeActiveRoleResult', error);
        }
    );
}

function getLinkExternalLoginForm() {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);

    authProvider.getLinkExternalLoginForm(
        getAbsoluteUri('/Home/SignInSuccess'),
        getAbsoluteUri('/Home/SignInFailure'),
        function (result) {
            $('#linkExternalLoginForm').append(result);
        },
        function (error) {
            showObject('#linkExternalLoginResult', error);
        }
    );
}

function unlinkExternalLogin(provider, providerKey) {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);

    authProvider.unlinkExternalLogin(
        provider,
        providerKey,
        function (result) {
            refreshUserInfo();
        },
        function (error) {
            showObject('#unlinkExternalLoginResult', error);
        }
    );
}

function signOut(self) {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);

    onSuccessSignOut(getHomePageContext());

    authProvider.signOut(
        function (result) {


            window.getCurrentUserName = function(){
                return null;
            };

            //self.model.set('result', result);
            self.model.set('result', null);
            location.reload();
//            window.location = '/Home/SignIn';
        },
        function (error) {
            showObject('#getCurrentUserResult', error.responseJSON);
        }
    );
}

function setUserInfo(userInfo) {
    //showObject('#getCurrentUserResult', userInfo);
    //$('#displayName').val(userInfo.DisplayName);
    //$('#description').val(userInfo.Description);
    //$('#activeRole').val(userInfo.ActiveRole);

    if (userInfo.Logins !== null && userInfo.Logins !== undefined) {
        var externalLogins = $('#externalLogins');

        for (var i = 0; i < userInfo.Logins.length; ++i) {
            var loginInfo = userInfo.Logins[i];
            var provider = loginInfo.Provider;
            var providerKey = loginInfo.ProviderKey;

            var unlinkButton = $(document.createElement('input'));
            unlinkButton.attr('type', 'button');
            unlinkButton.attr('value', provider);
            unlinkButton.attr('onclick', 'unlinkExternalLogin(\'' + provider + '\', \'' + providerKey + '\')');
            externalLogins.append(unlinkButton);
        }
    }
    getLinkExternalLoginForm();
}

function getAbsoluteUri(relativeUri) {
    return location.protocol + '//' + location.host + relativeUri;
}

function showObject(element, object) {
    var text = formatObject(object);
    $(element).text(text);
}

function formatObject(object) {
    return JSON.stringify(object, null, 4);
}
jQuery(document).ready(function () {
    getSignInExternalForm();
});

function signInInternal(self) {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);
    authProvider.signInInternal(
        $('#userName').val(),
        $('#password').val(),
        $('#remember').is(':checked'),
        function (result) {


            window.getCurrentUserName = function(){
                return result.UserName;
            };

            self.model.set('result', result);
            self.$modal.modal('hide');
            location.reload();
        },
        function (error) {
            if(error.Error.indexOf('Invalid username or password') > -1){
                toastr.error('Неверный логин или пароль', "Ошибка!");
            }
            showObject('#signInInternalResult', error);
        }
    );
}

function getSignInExternalForm() {
    var authProvider = new AuthenticationProvider(InfinniUI.config.serverUrl);
    authProvider.getSignInExternalForm(
        getAbsoluteUri('/Home/SignInSuccess'),
        getAbsoluteUri('/Home/SignInFailure'),
        function (result) {
            $('#signInExternalForm').append(result);
        },
        function (error) {
            showObject('#signInExternalResult', error);
        }
    );
}

function getAbsoluteUri(relativeUri) {
    return location.protocol + '//' + location.host + relativeUri;
}

function showObject(element, object) {
    var text = formatObject(object);
    $(element).text(text);
}

function formatObject(object) {
    return JSON.stringify(object, null, 4);
}
/**
  * Провайдер аутентификации.
  *
  * @constructor
  */
function AuthenticationProvider(baseAddress) {
    this.baseAddress = baseAddress;
}


_.extend(AuthenticationProvider.prototype, {
    handlers: {
        onActiveRoleChanged: $.Callbacks(),
        onSignInInternal: $.Callbacks(),
        onSignOut: $.Callbacks()
    },

    /**
     * Возвращает информацию о текущем пользователе.
     *
     * @public
     */
    getCurrentUser: function(resultCallback, errorCallback) {
        this.sendGetRequest('/Auth/GetCurrentUser', resultCallback, errorCallback);
    },

    /**
     * Изменяет пароль текущего пользователя.
     *
     * @public
     */
    changePassword: function (oldPassword, newPassword, resultCallback, errorCallback) {
        var changePasswordForm = {
            OldPassword: oldPassword,
            NewPassword: newPassword
        };

        this.sendPostRequest('/Auth/ChangePassword', changePasswordForm, resultCallback, errorCallback);
    },

    /**
     * Изменяет персональную информацию текущего пользователя.
     *
     * @public
     */
    changeProfile: function (displayName, description, resultCallback, errorCallback) {
        var changeProfileForm = {
            DisplayName: displayName,
            Description: description
        };

        this.sendPostRequest('/Auth/ChangeProfile', changeProfileForm, resultCallback, errorCallback);
    },

    /**
     * Изменяет активную роль текущего пользователя.
     *
     * @public
     */
    changeActiveRole: function (activeRole, resultCallback, errorCallback) {
        var changeActiveRoleForm = {
            ActiveRole: activeRole
        };

        this.sendPostRequest('/Auth/ChangeActiveRole', changeActiveRoleForm, function(){
            var args = _.toArray(arguments);
            args.push(activeRole);
            if(resultCallback){
                resultCallback.apply(this, args);
            }

            this.handlers.onActiveRoleChanged.fire.apply(this.handlers.onActiveRoleChanged, args);
            var exchange = messageBus.getExchange('global');
            exchange.send('OnActiveRoleChanged', {value: args});
        }, errorCallback);
    },

    /**
     * Осуществляет вход пользователя в систему через внутренний провайдер.
     *
     * @public
     */
    signInInternal: function (userName, password, remember, resultCallback, errorCallback) {
        var signInInternalForm = {
            "id" : null,
            "changesObject" : {
                "UserName" : userName,
                "Password" : password,
                "Remember" : remember
            },
            "replace" : false
        };

        var that = this;
        this.sendPostRequest('/RestfulApi/StandardApi/authorization/signin', signInInternalForm, function() {

                var args = _.toArray(arguments);
                if(resultCallback){
                    resultCallback.apply(this, args);
                }

                that.handlers.onSignInInternal.fire.apply(that.handlers.onSignInInternal, args);
                var exchange = messageBus.getExchange('global');
                exchange.send('OnSignInInternal', {value: args});

        }, errorCallback);



    },

    /**
     * Возвращает форму входа пользователя в систему через внешний провайдер.
     *
     * @public
     */
    getSignInExternalForm: function (successUrl, failureUrl, resultCallback, errorCallback) {
        this.getExternalLoginForm('/Auth/SignInExternal', successUrl, failureUrl, resultCallback, errorCallback);
    },

    /**
     * Возвращает форму добавления текущему пользователю имени входа у внешнего провайдера.
     *
     * @public
     */
    getLinkExternalLoginForm: function (successUrl, failureUrl, resultCallback, errorCallback) {
        this.getExternalLoginForm('/Auth/LinkExternalLogin', successUrl, failureUrl, resultCallback, errorCallback);
    },

    /**
     * Удаляет у текущего пользователя имя входа у внешнего провайдера.
     *
     * @public
     */
    unlinkExternalLogin: function (provider, providerKey, resultCallback, errorCallback) {
        var unlinkExternalLoginForm = {
            Provider: provider,
            ProviderKey: providerKey
        };

        this.sendPostRequest('/Auth/UnlinkExternalLogin', unlinkExternalLoginForm, resultCallback, errorCallback);
    },

    /**
     * Выход пользователя из системы.
     *
     * @public
     */
    signOut: function (resultCallback, errorCallback) {
        var signOutInternalForm = {
            "id" : null,
            "changesObject" : {},
            "replace" : false
        };
        this.sendPostRequest('/RestfulApi/StandardApi/authorization/signout', signOutInternalForm);
        this.sendPostRequest('/Auth/SignOut', null, function(){
            var args = _.toArray(arguments);
            if(resultCallback){
                resultCallback.apply(this, args);
            }

            this.handlers.onSignOut.fire.apply(this.handlers.onSignOut, args);
            var exchange = messageBus.getExchange('global');
            exchange.send('OnSignOut', {value: args});
        }.bind(this), errorCallback);
    },

    getExternalLoginForm: function (requestUri, successUrl, failureUrl, resultCallback, errorCallback) {
        var url = this.baseAddress + requestUri;
        this.sendGetRequest('/Auth/GetExternalProviders',
            function (result) {
                var formElement = $(document.createElement('form'));
                formElement.attr('method', 'POST');
                formElement.attr('action', url);

                var successUrlElement = $(document.createElement('input'));
                successUrlElement.attr('type', 'hidden');
                successUrlElement.attr('name', 'SuccessUrl');
                successUrlElement.attr('value', successUrl);
                formElement.append(successUrlElement);

                var failureUrlElement = $(document.createElement('input'));
                failureUrlElement.attr('type', 'hidden');
                failureUrlElement.attr('name', 'FailureUrl');
                failureUrlElement.attr('value', failureUrl);
                formElement.append(failureUrlElement);

                if (result !== null && result !== undefined) {
                    for (var i = 0; i < result.length; ++i) {
                        var providerInfo = result[i];
                        var providerType = providerInfo.Type;
                        var providerName = providerInfo.Name;

                        var loginButton = $(document.createElement('button'));
                        loginButton.attr('type', 'submit');
                        loginButton.attr('name', 'Provider');
                        loginButton.attr('value', providerType);
                        loginButton.text(providerName);
                        formElement.append(loginButton);
                    }
                }

                resultCallback(formElement);
            },
            errorCallback
        );
    },

    sendGetRequest: function (requestUri, resultCallback, errorCallback) {
        $.ajax(this.baseAddress + requestUri, {
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if(resultCallback) {
                    resultCallback(data);
                }
            },
            error: function (error) {
                if(errorCallback) {
                    errorCallback(error.responseJSON);
                }
            }
        });
    },

    sendPostRequest: function (requestUri, requestData, resultCallback, errorCallback) {
        if (requestData !== null) {
            requestData = JSON.stringify(requestData);
        }
        $.ajax(this.baseAddress + requestUri, {
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            data: requestData,
            contentType: 'application/json',
            success: function (data) {
                if(resultCallback) {
                    resultCallback(data);
                }
            },
            error: function (error) {
                if(errorCallback) {
                    errorCallback(error.responseJSON);
                }
            }
        });
    },

    onActiveRoleChanged: function(handler){
        this.handlers.onActiveRoleChanged.add(handler);
    },

    onSignInInternal: function(handler){
        this.handlers.onSignInInternal.add(handler);
    },

    onSignOut: function(handler){
        this.handlers.onSignOut.add(handler);
    }
});
var StatusBarControl = function () {
    _.superClass(StatusBarControl, this);
};
_.inherit(StatusBarControl, Control);
_.extend(StatusBarControl.prototype, {
    createControlModel: function () {
        return new StatusBarModel();
    },
    createControlView: function (model) {
        return new StatusBarView({model: model});
    }
});

var StatusBarModel = ControlModel.extend({
    defaults: _.defaults({}, ControlModel.prototype.defaults, {
        time: '',
        date: '',
        result: null
    })
});

var StatusBarView = ControlView.extend({
    className: 'pl-status-bar',

    events: {
        'click .signIn': 'signInHandler',
        'click .signOut': 'signOutHandler',
        'click .status-bar-menu': 'openMenuHandler'
    },

    template: InfinniUI.Template['controls/application/statusBar/template.tpl.html'],
    loginTemplate: InfinniUI.Template['controls/application/statusBar/authentication/loginTemplate.tpl.html'],

    enterTemplate: InfinniUI.Template['controls/application/statusBar/authentication/enterTemplate.tpl.html'],
    successTemplate: InfinniUI.Template['controls/application/statusBar/authentication/successTemplate.tpl.html'],

    initialize: function () {
        var self = this;
        self.model.set('time', moment().format('HH:mm'));
        self.model.set('date', moment().format('D MMMM'));

        window.setInterval(function () {
            self.model.set('time', moment().format('HH:mm'));
            self.model.set('date', moment().format('D MMMM'));
            self.dateRender();
        }, 10 * 1000);

        getUserInfo(this);
        this.listenTo(this.model, 'change:result', this.render);
    },

    dateRender: function () {
        this.$el.find('.time').text(this.model.get('time'));
        this.$el.find('.date').text(this.model.get('date'));
    },

    signInHandler: function () {
        var self = this;
        if (!this.$modal) {
            this.$modal = $(this.loginTemplate({}));
            this.$modal.appendTo('body');
        }

        this.$modal.modal('show');
        this.$modal.on('hidden.bs.modal', function () {
            $(this).find('#password, #userName').val('');
            $(this).find('#remember').attr('checked', false);
        });
        this.$modal.find('.post').on('click', function () {
            signInInternal(self);
        })
    },
    openMenuHandler: function(){
        var menu = $('.app-area').find('.pl-menu');
        var area = menu.closest('.app-area');

        if(menu.length && area.length) {
            if($(area).is(':visible')) {
                area.css({
                    'display': 'none'
                });
            }else{
                area.css({
                    'position': 'absolute',
                    'width': '100%',
                    'display': 'block',
                    'overflow': 'hidden'
                });
            }
        }
    },

    signOutHandler: function () {
        signOut(this);
    },

    render: function () {
        var result = this.model.get('result');debugger;
        var header = InfinniUI.config.configName;
        var $wrap = $(this.template({header: header}));
        var $loginTemplate,
            self = this;

        window.adjustLoginResult(result).then(function(r){
            if (result) {
                $loginTemplate = $(self.successTemplate({
                    displayName: r.UserName,
                    activeRole: r.ActiveRole,
                    roles: _.pluck(result.Roles, 'DisplayName').join(', ')
                }));
            } else {
                $loginTemplate = $(self.enterTemplate({}));
            }

            $wrap.find('.page-header-inner').prepend($loginTemplate);
            self.$el
                .empty()
                .append($wrap);
        });

        this.$el.find('.calendar').datepicker({
            todayHighlight: true,
            language: 'ru'
        });

        //~fix DatePicker auto close
        this.$el.find('.dropdown-toggle').on('click.bs.dropdown', function() {
            var clicks = $(this).data('clicks');
            if (clicks) {
                $(this).parent('.dropdown').off('hide.bs.dropdown');
            } else {
                $(this).parent('.dropdown').on('hide.bs.dropdown', function () {return false;});
            }
            $(this).data("clicks", !clicks);
        });

        return this;
    }
});
var ButtonControl = function(){
    _.superClass(ButtonControl, this);
};

_.inherit(ButtonControl, Control);

_.extend(ButtonControl.prototype, {

    createControlModel: function () {
        return new ButtonModel();
    },

    createControlView: function (model) {
        return new ButtonView({model: model});
    },

    click: function(){
        this.controlView.trigger('onClick');
    },

    onClick: function(handler){
        this.controlView.on('onClick', handler);
    },

    onEnabledChange: function (handler) {
        this.controlModel.on('change:enabled', handler);
    }
});
var ButtonModel = ControlModel.extend({
    defaults: _.defaults({
        action: null,
        horizontalAlignment: 'Left',
        image: null,
        parentEnabled: true
    }, ControlModel.prototype.defaults)
});

var ButtonView = ControlView.extend({
    className: 'pl-button',

    template: InfinniUI.Template["controls/button/template/button.tpl.html"],

    events: {
        'click .btn.default': 'onClickHandler'
    },

    UI: {
        button: 'button'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:text', this.updateText);
        this.listenTo(this.model, 'change:enabled', this.updateEnabled);
        this.listenTo(this.model, 'change:parentEnabled', this.updateEnabled);

    },

    render: function () {
        this.prerenderingActions();

        this.$el
            .html(this.template({image: this.model.get('image')}));

        this.bindUIElements();
        this.updateText();
        this.updateEnabled();

        this.postrenderingActions();
        return this;
    },

    updateText: function(){
        var $button = this.$el.find('.btntext');
        var text = this.model.get('text');

        if(this.wasRendered){
            if (typeof text === 'undefined' || text === null) {
                text = '';
            }
            if(_.isEmpty(text)){
                this.$el.find('.fa-'+this.model.get('image')).css('margin-right','0');
            }
            $button.text(text);
        }
    },

    onClickHandler: function(){
        this.trigger('onClick');
    },

    updateEnabled: function () {
        if (!this.wasRendered) {
            return;
        }
        var pEnabled = this.model.get('parentEnabled');
        var isEnabled = this.model.get('enabled');

        this.ui.button.prop('disabled', !isEnabled || !pEnabled);
    }

});
var CheckBoxControl = function(){
    _.superClass(CheckBoxControl, this);
};

_.inherit(CheckBoxControl, Control);

_.extend(CheckBoxControl.prototype, {
    createControlModel: function(){
        return new CheckBoxModel();
    },

    createControlView: function(model){
        return new CheckBoxView({model: model});
    }
},
    controlValuePropertyMixin
);
var CheckBoxModel = ControlModel.extend({
    defaults: _.defaults({
        value: false,
        foreground: 'Black',
        textStyle: 'Body1'
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});
var CheckBoxView = ControlView.extend({
    className: 'pl-check-box',

    template: InfinniUI.Template["controls/checkBox/template/checkbox.tpl.html"],

    events: {
        'click [type="checkbox"]': 'onClick',
        'focusin [type="checkbox"]': 'onFocusInDebounceHandler',
        'focusout [type="checkbox"]': 'onFocusOutDebounceHandler',
        'focus [type="checkbox"]': 'onFocusControlHandler'

    },

    onFocusInHandler: function (event) {
        this.callEventHandler('OnGotFocus');
    },

    onFocusOutHandler: function (event) {
        this.callEventHandler('OnLostFocus');
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.initHorizontalTextAlignment();
        this.initForeground();
        this.initTextStyle();

        this.onFocusInDebounceHandler = _.debounce(this.onFocusInHandler, 100);
        this.onFocusOutDebounceHandler = _.debounce(this.onFocusOutHandler, 100);

        this.listenTo(this.model, 'change:value', this.updateValue);
        this.listenTo(this.model, 'change:enabled', this.applyEnabled);
        this.listenTo(this.model, 'change:text', this.updateText);
    },

    render: function () {
        this.prerenderingActions();

        this.$el.html(this.template({}));
        this.$el.find('input:checkbox').uniform();

        this.updateText();
        this.updateValue();
        this.applyEnabled();

        this.updateForeground();
        this.updateTextStyle();
        this.updateHorizontalTextAlignment();

        this.postrenderingActions();
        return this;
    },

    onClick: function (event) {
        this.model.set('value', event.target.checked);
    },

    updateValue: function () {
        var $control = this.$el.find('.pl-control'),
            val = this.model.get('value');

        if (this.wasRendered) {
            $control.prop('checked', val);
            $.uniform.update($control);
        }
    },

    applyEnabled: function () {
        var enabled = this.model.get('enabled');
        var $control = this.$el.find('.pl-control');
        var $checker = this.$el.find('.checker');

        if (enabled) {
            $control.prop('disabled', false);
            $checker.removeClass('disabled');
        } else {
            $control.prop('disabled', 'disabled');
            $checker.addClass('disabled');
        }
    },

    updateText: function () {
        if (this.wasRendered) {

            var text = this.model.get('text');
            if (typeof text == 'string') {
                this.$el.find('.pl-control-text').html(text);
            }

        }
    }
});

_.extend(CheckBoxView.prototype,
    horizontalTextAlignmentPropertyMixin,
    foregroundPropertyMixin,
    textStylePropertyMixin
);
var ComboBoxControl = function () {
    _.superClass(ComboBoxControl, this);
};

_.inherit(ComboBoxControl, Control);

_.extend(ComboBoxControl.prototype, {

    createControlModel: function () {
        return new ComboBoxModel();
    },

    createControlView: function (model) {
        return new ComboBoxView({model: model});
    },

    onChangeTerm: function (handler) {
        var fn = function (model, value) {
            handler(value);
        };
        this.controlModel.on('change:term', fn);
    },

    setOpenListFunction: function(f){
        this.controlView.setOpenListFunction(f);
    },

    onFirstOpening: function(handler){
        this.controlView.on('firstOpening', handler);
    },

    getSelectedItems: function () {
        return this.controlView.getSelectedItems();
    },

    getDisplayValue: function (value) {
        return this.controlView.getDisplayValue(value);
    },

    getItem: function () {
        return this.controlModel.get('item');
    },

    onItemChanged: function (handler) {
        this.controlModel.on('change:item', handler);
    }

}, controlValuePropertyMixin);
var ComboBoxModel = ControlModel.extend({

    defaults: _.extend({
        text: null,
        showPopup: true,
        showSelect: false,
        autocomplete: 'none',
        multiSelect: false,
        readOnly: false,
        //term: '',    //Строка поиска
        displayProperty: 'DisplayName',
        selectView: false,
        itemFormat: null,
        showClear: true,
        item: null
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
        this.set('items', []);
        this.set('term', '');
        this.list = {};//{id, text} для select2.iniSelection
        //Значение по умолчанию для DisplayProperty
        this.on('change:displayProperty', function (model, value) {
            if (typeof value === 'undefined' || value === null || value === '') {
                this.set('displayProperty', 'DisplayName', {silent: true});
            }
        });

        this.on('change:value', this.updateItemHandler);
        this.on('change:items', this.updateItemHandler);
    },

    updateItemHandler: function () {
        var item = null;
        var items = this.get('items');
        var value = this.get('value');

        if (!_.isEmpty(value) && _.isArray(items)) {
            var method = _.isArray(value) ? 'where' : 'findWhere';

            item = _[method].call(_, items, {Id: value.Id});

            if (typeof item === 'undefined') {
                item = null;
            }
        }

        this.set('item', item);
    }
});
/**
 * @description Стратегия работы с выделенными элементами выпадающего списка
 * @class ComboBoxMultiSelectAbstractStrategy
 */
var ComboBoxMultiSelectAbstractStrategy = function () {

};

_.extend(ComboBoxMultiSelectAbstractStrategy.prototype, {
    buildSelectedFromValue: function (value) {},

    /**
     * Возвращает элемент из списка выбора по указанным идентификаторам
     * @param id
     * @param {Object[]} list
     * @returns {*}
     */
    getListDataItem: function (id, list) {
        var item;

        if (typeof id !== 'undefined' && id !== null) {
            item = _.find(list, function (item) {
                return item.id == id;
            });

        }
        return item;
    },
    buildValueFromSelected: function (selected, list) {},
    buildSelection: function (selected, value, list) {},

    _initSelectionData: function (value,  valueProperty, getDisplayValue) {
        var data;

        if (value !== null && typeof value !== 'undefined') {

            var id = value.Id || InfinniUI.ObjectUtils.getPropertyValue(value, valueProperty);
            var text = getDisplayValue(value);

            if (typeof text === 'undefined' || text === null) {
                text = value.DisplayName;
            }

            data = {
                id: id,
                text: text
            }
        }
        return data;
    }
});

/**
 * @description Реализация для выпадающего списка с множественным выбором значений
 * @class ComboBoxMultiSelectStrategy
 */
var ComboBoxMultiSelectStrategy = function () {

};

_.inherit(ComboBoxMultiSelectStrategy, ComboBoxMultiSelectAbstractStrategy);

_.extend(ComboBoxMultiSelectStrategy.prototype, {
    /**
     * @description Формирует значения для выделения выбранных значений в выпадающем списке
     * @param {Object[]} value  = [{Id: Number, DisplayName: String}]
     * @returns {Array|null}
     */
    buildSelectedFromValue: function (value) {
        var id = null;

        if (typeof value !== 'undefined' && value !== null) {
            id = _.map(value, function (item) {
                return item.Id;
            });
        }

        return id;
    },

    /**
     * @description Возвращает элементы из списка выбора по указанным идентификаторам
     * @param {Number[]} id
     * @param {Object[]} list
     * @returns {Object[]|null}
     */
    getListDataItems: function (id, list) {
        var items = null;

        if (typeof id !== 'undefined' && id !== null) {

            items = _.map(id, function (id) {
                return this.getListDataItem(id, list);
            }, this);

            items = _.compact(items);
        }
        return items;
    },

    /**
     * @description Формирует список значений контрола по списку выбранных значений в выпадающем списке
     * @param {Number[]}selected
     * @param {Object[]}list
     * @returns {Object[]|null}
     */
    buildValueFromSelected: function (selected, list) {
        var items = this.getListDataItems(selected, list);

        return (typeof items === 'undefined') ? null : _.map(items, function (item) {
            return {Id: item.id, DisplayName: item.text};
        });
    },

    /**
     * Формирует список выбранных значений для выпадающего спсика
     * @param {Number[]} selected
     * @param {Object[]} value
     * @param {Object[]} list
     * @returns {Object[]|null}
     */
    buildSelection: function (selected, value, list) {
        var data;

        if (typeof value === 'undefined' || value === null) {
            value = [];
        }

        data = _.map(selected, function (id) {
            var item = this.getListDataItem(id, list);
            var data = null;

            if (typeof item === 'undefined') {    // В списке допустимых значений нет такого элемента
                // ищем значение в списке текущих значений
                item = _.find(value, function (item) {
                    return item.Id == id;
                });

                if (typeof item !== 'undefined') {
                    data = {id: item.Id, text: item.DisplayName};
                }
            } else {    //Есть такой элемент в списке значений
                data = item;
            }

            return data;
        }, this);

        if (_.isArray(data)) {
            data = _.compact(data);
        } else if (typeof data === 'undefined') {
            data = null;
        }

        return data;
    },

    initSelectionData: function (value,  valueProperty, getDisplayValue) {
        var data = [];
        if (_.isArray(value)) {
            data = _.map(value, function (val) {
                return this._initSelectionData(value, getDisplayValue);
            }, this)
        }
        return data;
    }
});

/**
 * @description Реализация для выпадающего списка с единственным выбором значения
 * @class ComboBoxSingleSelectStrategy
 */
var ComboBoxSingleSelectStrategy = function () {

};

_.inherit(ComboBoxSingleSelectStrategy, ComboBoxMultiSelectAbstractStrategy);

_.extend(ComboBoxSingleSelectStrategy.prototype, {

    /**
     * @description Формирует значения для выделения выбранных значений в выпадающем списке
     * @param {Object} value  = {Id: Number, DisplayName: String}
     * @returns {*}
     */
    buildSelectedFromValue: function (value) {
        var id = null;

        if (typeof value !== 'undefined' && value !== null) {
            id = value.Id;
        }

        return id;
    },

    /**
     * Формирует список значений контрола по списку выбранных значений в выпадающем списке
     * @returns {null}
     */
    buildValueFromSelected: function (selected, list) {
        var item = this.getListDataItem(selected, list);

        return (typeof item === 'undefined') ? null : {Id: item.id, DisplayName: item.text};
    },

    buildSelection: function (selected, value, list) {
        var item = this.getListDataItem(selected, list);
        var data = null;

        if (typeof item === 'undefined') {
            // Элемент не найдено в списке значений
            if (typeof value !== 'undefined' && value !== null && value.Id == selected) {
                data = {
                    id: value.Id,
                    text: value.DisplayName
                };
            }
        } else {
            data = item;
        }
        return data;
    },

    initSelectionData: function (value,  valueProperty, getDisplayValue) {
        return this._initSelectionData(value, valueProperty, getDisplayValue);
    }

});

/**
 * @class ComboBoxView
 * @property {object[]} listData Список значений для плагина Select2
 * @property {ComboBoxModel} model
 * @property {ComboBoxMultiSelectStrategy|ComboBoxSingleSelectStrategy} multiSelectStrategy
 * @extends ControlView
 */
var ComboBoxView = ControlView.extend({
    className: 'pl-combo-box',

    template: InfinniUI.Template["controls/comboBox/template/combobox.tpl.html"],
    selectViewTemplate: InfinniUI.Template["controls/comboBox/template/selectView.tpl.html"],

    UI: {
        control: 'input',
        selectedViewValue: '.select-view-value',
        clearValue: '.clear-value',
        btnSelectView: 'button.select-view'
    },

    events: {
        'change input': 'onChangeInputHandler',
        'select2-focus input': 'onFocusHandler',
        'select2-blur input': 'onBlurHandler',
        'click .select-view': 'onSelectViewSearch',
        'click .clear-value': 'onClearValueHandler',
        'mouseenter': 'onMouseenterHandler',
        'mouseleave': 'onMouseleaveHandler'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:value', this.onUpdateValueHandler);
        this.listenTo(this.model, 'change:items', this.onUpdateItemsHandler);
        this.listenTo(this.model, 'change:multiSelect', this.onChangeMultiSelect);
        this.listenTo(this.model, 'change:readOnly', this.onChangeReadOnly);
        this.listenTo(this.model, 'change:enabled', this.onChangeEnabledHandler);
        this.listenTo(this.model, 'change:placeholder', this.onChangePlaceholderHandler);

        //Список значений выпадающего списка.
        //элементы списка в select2 беруться по ссылке на этот массив
        //  Items in such an array must have id and text keys!!! Из документации select2

        this.listData = [];

        this.openListFunction = null;

        this.isListWasFirstOpened = false;
        this.isOpen = false;

        this.initMultiSelectStrategy();
    },

    initMultiSelectStrategy: function () {
        var multiSelect = this.model.get('multiSelect');

        if (multiSelect === true) {
            this.multiSelectStrategy = new ComboBoxMultiSelectStrategy();
        } else {
            this.multiSelectStrategy = new ComboBoxSingleSelectStrategy();
        }
    },

    render: function () {
        this.prerenderingActions();
        var data = this.model.toJSON(),
            needSearch = this.model.get('autocomplete') == 'Client' || this.model.get('autocomplete') == 'Server',
            that = this,
            options = {
                readonly: data.readOnly,
                placeholder: data.placeholder,
                multiple: data.multiSelect,
                allowClear: data.showClear,
                width: "off",
                minimumResultsForSearch: needSearch ? 5 : -1,
                initSelection: this.initSelection.bind(this)
            };


        var autocomplete = this.model.get('autocomplete');
        if(autocomplete !== 'Server'){
            options.data = this.listData;
        }else{
            options.query = this.select2Query.bind(this);
        }

        if(this.model.get('selectView')){
            this.$el.html(this.selectViewTemplate(data));
        }else {
            this.$el.html(this.template(data));
        }

        this.bindUIElements();
        this.ui.control.select2(options);

        this.setEnabled(data.enabled);

        this.ui.control.on('select2-opening', function(event){
            if (that.model.get('showPopup') !== true) {
                event.preventDefault();
            }

            that.isOpen = true;
            if(!that.isListWasFirstOpened){
                that.isListWasFirstOpened = true;
                that.trigger('firstOpening');
            }
        });

        this.ui.control.on('select2-close', function(){
            that.isOpen = false;
        });


        this.setSelectedValue();

        this.postrenderingActions();
        return this;
    },

    /**
     * @private
     * @description Запрос списка значений выпадающего списка
     * @param options
     */
    select2Query: function (options) {
        if(options.term == this.model.get('term')){
            this.select2callback(options.callback)
        }else{
            var that = this;
            var autocomplete = this.model.get('autocomplete');
            var delay = autocomplete === 'Server' ? 400 : 0;

            if(this.lastQueryId){
                clearTimeout(this.lastQueryId);
            }

            this.lastQueryId = setTimeout(function(){
                that.lastQueryId = null;

                var term = that.model.get('term');

                that.callback2query = that.callback2query || {};
                that.callback2query[options.term] = options.callback;
                that.model.set('term', options.term);
                that.select2callback(options.callback);
            } , delay);
        }
    },

    /**
     * @private
     * @description Вызов функции обраьтного вызова плагина select2 для списка значений
     * @param callback
     */
    select2callback: function (callback) {
        if (typeof callback === 'undefined' || callback === null) {
            return;
        }

        callback({
            results: this.listData,
            more: false
        });
    },

    /**
     * @protected
     * Обработчик изменения value в модели.
     * Отображает в элементе выбранные значения, если они были изменены
     */
    onUpdateValueHandler: function () {
        var value = this.model.get('value');

        if (!this.wasRendered) {
            return;
        }

        this.setSelectedValue();

    },

    setSelectedValue: function () {
        var value = this.model.get('value');

        this.ui.control.select2('val', this.buildSelectedFromValue(value));
    },

    initSelection: function (element, callback) {
        var model = this.model;
        var value = model.get('value');
        var valueProperty = model.get('valueProperty');
        var getDisplayValue = this.getDisplayValue.bind(this);
        var data = this.multiSelectStrategy.initSelectionData(value, valueProperty, getDisplayValue);
        callback(data);
    },


    onUpdateItemsHandler: function (model, value) {
        var valueProperty = model.get('valueProperty');
        var displayProperty = model.get('displayProperty');
        var list = this.listData;
        var items = [];
        var that = this;

        if (_.isEmpty(valueProperty)) {
            valueProperty = 'Id';
        }

        list.length = 0;

        if (typeof value === 'undefined' || value === '') {
            return;
        }
        //При изменении списка значений, переформируем список значений для плагина Select2
        items = _.map(value, function (item) {
            return {
                id: InfinniUI.ObjectUtils.getPropertyValue(item, valueProperty),
                text: that.getDisplayValue(item) || '-Не найдено поле [' + displayProperty + '] -'
            };
        });

        Array.prototype.push.apply(list, items);

        //Если задан термин для автокомплита - пропускаем результаты ч/з callback select2
        var term = this.model.get('term');
        if (this.callback2query && this.callback2query[term]) {
            this.select2callback(this.callback2query[term]);
        }

        if (this.wasRendered) {
            this.setSelectedValue();
        }

        if(this.isOpen){
            //this.ui.control.select2('close');
            //this.ui.control.select2('open');

            //Триггеринг события, для вызова метода обновления списка значений select2.updateResults
            // т.к. прямой вызов этого метода невозможен в плагине select2
            this.ui.control.select2('dropdown').find('input.select2-input').trigger('input')
        }
    },

    getDisplayValue: function(fullValue){
        var value = '';

        if(fullValue === undefined || fullValue === null){
            return '';
        }

        var itemFormat = this.model.get('itemFormat'),
            displayProperty = this.model.get('displayProperty');

        var props = _.reduce(_.keys(fullValue), function (amount, name) {
            return (['Id', 'DisplayName'].indexOf(name) === -1) ? amount + 1 : amount;
        }, 0);

        if (props && itemFormat) {
            //Если fullValue содержит атрибуты кроме Id и DisplayName + задан ItemFormat
            value = itemFormat.format(fullValue);
            if (typeof value !== 'undefined' && value !== null && value !== '') {
                return value;
            }
        }

        if(displayProperty){
            value = InfinniUI.ObjectUtils.getPropertyValue(fullValue, displayProperty);
            if (value !== null && typeof value !== 'undefined') {
                return value;
            }
        }

        return InfinniUI.ObjectUtils.getPropertyValue(fullValue, 'DisplayName');

        //return '---';
    },

    onChangeMultiSelect: function (/*model, value*/) {

        this.initMultiSelectStrategy();

        if (!this.wasRendered) return;

        throw ('В runtime нельзя изменить MultiSelect');
    },

    onChangeReadOnly: function (model, value) {
        if (!this.wasRendered) return;
        this.ui.control.select2('readonly', value);
        this.ui.btnSelectView.prop('disabled', value);
    },

    onChangeEnabledHandler: function (model, value) {
        if (!this.wasRendered) return;
        this.setEnabled(value);
    },

    setEnabled: function (value) {
        this.ui.control.select2('enable', value);
        this.ui.btnSelectView.prop('disabled', value !== true);
    },

    /**
     * Обработчик выбора элемента в выпадающем списке
     * @param event
     */
    onChangeInputHandler: function (event) {
        var selected = event.val;
        var model = this.model;

        model.set('value', this.buildValueFromSelected(selected, this.listData));
    },

    onChangePlaceholderHandler: function (model, value) {
        if (!this.wasRendered) {
            return;
        }

        value = (typeof value === 'undefined' || value === null) ? '' : value;
        this.ui.control.select2({
            placeholder: value
        });
    },

    //initSelection: function (element, callback) {
    //    var id = element.val();
    //    var value = this.model.get('value');
    //    var data = this.buildSelection(id, value, this.listData);
    //    callback(data);
    //},


    /**
     * @description Формирует значения для выделения выбранных значений в выпадающем списке
     * @param {Object} value
     * @param {Number} value.Id
     * @param {String} value.DisplayName
     * @returns {*}
     */
    buildSelectedFromValue: function (value) {
        return this.multiSelectStrategy.buildSelectedFromValue(value);
    },

    /**
     * @description Формирует список значений контрола по списку выбранных значений в выпадающем списке
     * @returns {*}
     */
    buildValueFromSelected: function (selected, list) {
        return this.multiSelectStrategy.buildValueFromSelected(selected, list);
    },

    buildSelection: function (selected, value, list) {
        return this.multiSelectStrategy.buildSelection(selected, value, list);
    },

    setOpenListFunction: function(f){
        this.openListFunction = f;
    },

    onSelectViewSearch: function(){
        this.openListFunction();
    },

    onClearValueHandler: function(e){
        var model = this.model;
        if (model.get('enabled') && !model.get('readOnly')) {
            this.model.set('value', null);
            this.ui.clearValue.hide();
        }
    },

    onMouseenterHandler: function () {
        if(this.model.get('value') && this.model.get('showClear')){
            this.ui.clearValue.show();
        }
    },

    onMouseleaveHandler: function () {
        this.ui.clearValue.hide();
    },

    /**
     * @description Возвращает объект из исходного списка значений для выбранного значения
     * @returns {*}
     */
    getSelectedItems: function () {
        var multiSelect = this.model.get('multiSelect');
        var value = this.model.get('value');
        var items = this.model.get('items');
        var result = null;

        if (typeof value === 'undefined' || value === null) {
            return multiSelect ? [] : null;
        }

        if (multiSelect) {
            result = _.map(value, function (valueItem) {
                return _.findWhere(items, {Id: valueItem.Id});
            });
        } else if (typeof value.Id !== 'undefined' && value.Id !== null) {
            result = _.findWhere(items, {Id: value.Id});
        }

        return result;
    },

    /**
     * @private
     */
    onFocusHandler: function () {
        $("#select2-drop-mask").click();
        this.callEventHandler('OnGotFocus');
    },

    /**
     * @private
     */
    onBlurHandler: function () {
        this.callEventHandler('OnLostFocus');
    }

});

/**
 * @description Класс колонки контрола для {@link DataGrid}
 * @class DataGridColumnControl
 */
var DataGridColumnControl = function () {
    this.controlModel = new DataGridColumnModel();
};

_.extend(DataGridColumnControl.prototype, {

    /**
     * @description Получает значение метаданных по имени
     * @memberOf DataGridColumnControl.prototype
     * @param {String} name
     * @returns {*}
     */
    get: function (name) {
        return this.controlModel.get(name);
    },

    /**
     * @description Устанавливает значение метаданных
     * @memberOf DataGridColumnControl.prototype
     * @param {String} name
     * @param {*} value
     */
    set: function (name, value) {
        this.controlModel.set(name, value);
    }

});

var DataGridColumnResize = function (view) {
    this.view = view;
    this.events = {};

    this._drag = this.drag.bind(this);
    this._drop = this.drop.bind(this);
};

DataGridColumnResize.prototype.start = function (event) {
    $(document).on('mousemove', this._drag);
    $(document).on('mouseup', this._drop);
    this.invokeEvent('onStart', event.pageX, event.pageY);
};

DataGridColumnResize.prototype.drag = function (event) {
    event.preventDefault();

    this.invokeEvent('onDrag', event.pageX, event.pageY);
};

DataGridColumnResize.prototype.drop = function (event) {
    $(document).off('mouseup', this._drop);
    $(document).off('mousemove', this._drag);
    this.invokeEvent('onStop', event.pageX, event.pageY);
};

DataGridColumnResize.prototype.bindEvent = function (name, handler) {
    if (typeof handler !== 'function' || handler === null) {
        return;
    }

    if (typeof this.events[name] === 'undefined') {
        this.events[name] = [];
    }

    var handlers = this.events[name];

    if (handlers.indexOf(handler) !== -1) {
        return;
    }

    handlers.push(handler);
};

DataGridColumnResize.prototype.invokeEvent = function (name) {
    var args = Array.prototype.slice.call(arguments, 1);

    if (!this.events[name]) {
        return;
    }

    _.forEach(this.events[name], function (handler) {
        handler.apply(undefined, args);
    }, this);

};

DataGridColumnResize.prototype.onStart = function (handler) {
    this.bindEvent('onStart', handler)
};

DataGridColumnResize.prototype.onDrag = function (handler) {
    this.bindEvent('onDrag', handler)
};

DataGridColumnResize.prototype.onStop = function (handler) {
    this.bindEvent('onStop', handler)
};
/**
 * @description Контрол для отображения данных в виде таблицы
 * @extends Control
 * @mixes controlValuePropertyMixin
 * @class DataGridControl
 */

var DataGridControl = function () {
    _.superClass(DataGridControl, this);
};

_.inherit(DataGridControl, Control);

_.extend(DataGridControl.prototype, {

        /**
         * @description Создает экземпляр модели
         * @memberOf DataGridControl.prototype
         * @returns {DataGridModel}
         */
        createControlModel: function () {
            return new DataGridModel();
        },

        /**
         * @description Создает экземпляр представления
         * @memberOf DataGridControl.prototype
         * @param {DataGridModel} model
         * @returns {DataGridView}
         */
        createControlView: function (model) {
            return new DataGridView({model: model});
        },

        onScrollToTheEnd: function(handler){
            this.controlView.on('scrollToTheEnd', handler);
        },

        onDoubleClick: function(handler){
            this.controlView.on('dblclick', handler);
        },

        //setSelectedItem: function (value) {
        //    this.controlModel.set('selectedItem', value);
        //},
        //
        //getSelectedItem: function () {
        //    return this.controlModel.get('selectedItem');
        //},

        onSelectedItemChanged: function (handler) {
            this.controlModel.on('change:selectedItem', handler);

        }

    }, controlValuePropertyMixin
);

var DataGridGroup = Backbone.Model.extend({
    defaults: {
        groupBy: []
    },

    group: function(items){
        if(this.get('groupBy').length > 0){
            return {
                items: items,
                groups: this.subGroup(items, 0)
            };
        }else{
            return {
                items: items
            };
        }
    },

    /*
     *
     * {
     *   items: [...],
     *   groups: {
     *       Москва:{
     *           items: [...],
     *           groups: {...}
     *       }
     *   }
     * }
     * */

    subGroup: function(items, deep){
        var groupedProperty = this.get('groupBy')[deep],
            grouped = this.groupItems(items, groupedProperty);

        if(deep < this.get('groupBy').length - 1){
            for(var k in grouped){
                grouped[k].groups = this.subGroup(grouped[k].items, deep + 1);
            }
        }

        return grouped;
    },

    groupItems: function(items, propertyName){
        var result = {},
            propertyVal;
        for(var i = 0, ii = items.length; i < ii; i++){
            propertyVal = InfinniUI.ObjectUtils.getPropertyValue(items[i], propertyName);
            if(typeof result[propertyVal] == "undefined"){
                result[propertyVal] = {
                    items: []
                };
            }
            result[propertyVal].items.push(items[i]);
        }

        return result;
    }
});
/**
 * @description Модель колонки контрола DataGrid
 * @class DataGridColumnModel
 * @extends Backbone.Model
 */
var DataGridColumnModel = Backbone.Model.extend({

    defaults: {
        resizable: true,
        visible: true,
        itemFormat: null,
        sortable: false
    }

}, {
    SORTING_ASC: 'asc',
    SORTING_DESC: 'desc',
    SORTING_NONE: 'none'
});

/**
 * @description Модель контрола DataGrid
 * @extends ControlModel
 * @class DataGridModel
 */
var DataGridModel = ControlModel.extend({

    defaults: _.defaults({
        horizontalAlignment: 'Stretch',
        verticalAlignment: 'Stretch',
        multiSelect: false,
        readOnly: false,
        groups: null,
        autoLoad: true
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
        this.set('items', []);
        this.set('columns', []);
        this.set('selectedItem', null);
    }
});

/**
 * @private
 * @description Представление для рендеринга ячейки строки тела таблицы
 * @class DataGridBodyCell
 * @property {DataGridColumnModel} model
 * @extend Backbone.View
 */
var DataGridBodyCell = Backbone.View.extend({

    tagName: 'td',

    template: InfinniUI.Template['controls/dataGrid/template/cells/bodyCell.tpl.html'],

    initialize: function (options) {
        this.options = options;
        this.row = options.row;
        this.listenTo(this.model, 'change:visible', this.onChangeVisibleHandler);
    },

    UI: {
        expand: '.expand'
    },

    render: function () {
        this.applyVisible();
        var val = InfinniUI.ObjectUtils.getPropertyValue(this.row, this.model.get('displayProperty'));
        var format = this.model.get('itemFormat');
        var options = this.options;

        this.wasRendered = true;

        //this.$el.empty();

        var itemTemplate = this.model.get('itemTemplate');

        if (typeof itemTemplate === 'function') {
            var itemTemplateElement = itemTemplate(options.index);
            var $itemTemplate = itemTemplateElement.render();

            var onClickRowHandler = function (event) {
                options.click();
            };

            (function f($el) {;
                _.each($el, function (el) {;
                    var $el = $(el);
                    $el.on('click', onClickRowHandler);
                    var handlers = $._data(el, 'events').click;
                    if (handlers !== null && typeof handlers !== 'undefined') {
                        var handler = handlers.pop();
                        handlers.splice(0,0, handler);
                    }
                    f($(el).children());
                });
            })($itemTemplate);

            this.$el.html(this.template({
                text: '',
                canExpand: options.canExpand
            }));
            this.bindUIElements();
            this.$el.append($itemTemplate);
        } else {
            if (format){
                val = format.format(val);
            }

            this.$el.html(this.template({
                text: val,
                canExpand: options.canExpand
            }));
            this.$el.attr('title', val);

            this.bindUIElements();
        }

        var that = this;
        if (this.ui.expand.length) {
            this.ui.expand.on('click', function (event) {
                event.stopPropagation();
                that.trigger('expanded');
            });
        }

        return this;
    },

    applyVisible: function () {
        this.$el.toggleClass('hidden', this.model.get('visible') === false);
    },

    onChangeVisibleHandler: function () {
        if (this.wasRendered === true) {
            this.applyVisible();
        }
    }

});


_.extend(DataGridBodyCell.prototype, bindUIElementsMixin);
var DataGridBodyCheckBoxCell = Backbone.View.extend({

    tagName: 'td',

    template: InfinniUI.Template['controls/dataGrid/template/cells/bodyCheckBoxCell.tpl.html'],

    UI: {
        container: 'div'
    },

    initialize: function () {
        this.checkbox = new CheckBox();
        this.checkbox.onValueChanged(this.onClickHandler.bind(this));
    },

    onClickHandler: function () {
        this.trigger('check', this.checkbox.getValue());
    },

    render: function () {
        this.$el.html(this.template());
        this.bindUIElements();
        this.ui.container.append(this.checkbox.render());

        return this;
    },

    check: function (value) {
        this.checkbox.setValue(value);
    }
});

_.extend(DataGridBodyCheckBoxCell.prototype, bindUIElementsMixin);

/**
 * @description Представление для рендеринга ячеек заголовка таблицы
 * @class ataGridHeaderCell
 */
var DataGridHeaderCell = Backbone.View.extend({

    tagName: 'th',

    UI: {
        resize: '.pl-datagrid-resize'
    },

    template: InfinniUI.Template['controls/dataGrid/template/cells/headerCell.tpl.html'],

    initialize: function (options) {
        this.listenTo(this.model, 'change:text', this.onChangeTextHandler);
        this.listenTo(this.model, 'change:visible', this.onChangeVisibleHandler);
        this.listenTo(this.model, 'change:image', this.onChangeImageHandler);
        this.listenTo(this.model, 'change:sortable', this.onChangeSortableHandler);
        this.listenTo(this.model, 'change:sorting', this.onChangeSortingHandler);
        this.listenTo(this.model, 'change:Resizable', this.onChangeResizableHandler);

        this.resize = new DataGridColumnResize(this, options.columnIndex);

        var header = this;

        this.resize.onStart(function (x, y) {
            header.trigger('resize:start', x, y, options.columnIndex);
        });

        this.resize.onDrag(function (x, y) {
            var $el = header.$el;
            var offset = $el.offset();
            if (offset.left < x) {
                header.trigger('resize', x, y, options.columnIndex);
            } else {
                //@TODO Ограничить минимальную ширину колонки
                header.trigger('resize', offset.left, y, options.columnIndex);
            }

        });

        this.resize.onStop(function (x, y) {
            var $el = header.$el;

            var offset = $el.offset();
            var position = $el.position();

            var width = x - offset.left;

            header.trigger('resize:stop', x, y, width, options.columnIndex);

        });
    },

    events: {
        click: 'onClickHandler',
        'mousedown .pl-datagrid-resize': 'onClickResizeHandler'
    },

    onClickResizeHandler: function (event) {
        this.resize.start(event);
    },

    render: function () {
        this.wasRendered = true;
        this.applyVisible();
        this.applySortable();
        this.$el.html(this.template(this.model.toJSON()));
        this.bindUIElements();

        this.applyResizable();
        return this;
    },

    applyVisible: function () {
        this.$el.toggleClass('hidden', this.model.get('visible') === false);
    },

    onChangeTextHandler: function () {
        if (this.wasRendered) {
            this.render();
        }
    },

    onChangeVisibleHandler: function () {
        if (this.wasRendered) {
            this.applyVisible();
        }
    },

    onChangeImageHandler: function () {
        if (this.wasRendered) {
            this.render();
        }
    },

    onChangeSortableHandler: function (sortable) {
        if (this.wasRendered) {
            this.applySortable();
        }
    },

    onChangeResizableHandler: function () {
        if (this.wasRendered) {
            this.applyResizable();
        }
    },

    applyResizable: function () {
        this.ui.resize.toggleClass('hidden', !this.model.get('resizable'));
    },

    applySortable: function () {
        var sortable = this.model.get('sortable');

        this.model.set('sorting', sortable ? DataGridColumnModel.SORTING_NONE : false);
    },



    onClickHandler: function (event) {
        event.stopPropagation();
        this.toggleSorting();
    },

    onChangeSortingHandler: function () {
        var sorting = this.model.get('sorting');

        this.$el.toggleClass('sorting_asc', sorting === DataGridColumnModel.SORTING_ASC);
        this.$el.toggleClass('sorting_desc', sorting === DataGridColumnModel.SORTING_DESC);
        this.$el.toggleClass('sorting', sorting === DataGridColumnModel.SORTING_NONE);
    },

    toggleSorting: function () {
        var sortable = this.model.get('sortable');
        var sorting = this.model.get('sorting');

        if (!sortable) {
            return;
        }

        switch (sorting) {
            case DataGridColumnModel.SORTING_ASC:
                sorting = DataGridColumnModel.SORTING_DESC;
                break;
            case DataGridColumnModel.SORTING_DESC:
            default:
                sorting = DataGridColumnModel.SORTING_ASC;
        }

        this.model.set('sorting', sorting);
    }

});

_.extend(DataGridHeaderCell.prototype, bindUIElementsMixin);

var DataGridHeaderCheckBoxCell = DataGridBodyCheckBoxCell.extend({

    tagName: 'th',

    template: InfinniUI.Template['controls/dataGrid/template/cells/headerCheckBoxCell.tpl.html']

});
var DataGridPopupMenuModel = Backbone.Model.extend({
    initialize: function () {
        this.set('items', []);
    }
});

var DataGridPopupMenuView = Backbone.View.extend({

    className: 'pl-data-grid-popupmenu',

    template: InfinniUI.Template['controls/dataGrid/template/popupMenu.tpl.html'],

    initialize: function () {
        this.model = new DataGridPopupMenuModel();
        this.timerId = null;
    },

    events: {
        contextmenu: 'onContextMenuHandler',
        mouseleave: 'onMouseleaveHandler',
        mouseover: 'onMouseoverHandler',
        'click button': 'onClickMenuItem'
    },

    render: function () {
        var items = this.model.get('items'),
            $html = $('<ul></ul>');

        for(var i = 0, ii = items.length; i<ii; i++){
            $('<li></li>')
                .append( items[i].render() )
             .appendTo($html);
        }

        this.$el
            .empty()
            .append($html);
        return this;
    },

    setItems: function (items) {
        this.model.set('items', items);
    },

    show: function (x, y) {
        this.render();
        var $window = $(window),
            windowHeight = $window.height(),
            windowWidth = $window.width(),
            $el = this.$el,
            el = this.el;

        $('body').append(this.$el);

        setTimeout(function () {
            var rect = el.getBoundingClientRect();

            var dx = 0,
                dy = 0;
            if (x + rect.width > windowWidth) {
                dx = (x - rect.width < 0) ? 0 : -rect.width;
            }

            if (y + rect.height > windowHeight) {
                dy = (y + rect.height > windowHeight) ? -rect.height : 0;
            }

            $el.css('left',  x + dx);
            $el.css('top',  y + dy);
        }, 10);
    },

    hide: function () {
        this.$el.css({
            position: 'absolute',
            left: -99999,
            top: -99999
        });
    },

    onClickMenuItem: function (event) {
        event.preventDefault();
        this.hide();
    },

    onContextMenuHandler: function (event) {
        event.preventDefault();
    },

    cancelHide: function () {
        clearTimeout(this.timerId);
    },

    onMouseleaveHandler: function (event) {
        this.cancelHide();
        var menu = this;
        this.timerId = setTimeout(function () {
            menu.hide();
        }, 200);
    },

    onMouseoverHandler: function (event) {
        this.cancelHide();
    }

});
/**
 * @description Представление контрола DataGrid
 * @class DataGridView
 * @extends ControlView
 * @property {DataGridModel} model
 */
var DataGridView = ControlView.extend({

    className: 'pl-data-grid',

    template: InfinniUI.Template['controls/dataGrid/template/datagrid.tpl.html'],

    templateFakeCell: InfinniUI.Template['controls/dataGrid/template/cells/fakeCell.tpl.html'],

    events: {
        'click .group-title': 'onClickOnGroup',
        mousedown: 'onMouseDownHandler',
        contextmenu: 'onContextMenuHandler',
        'focus tr': 'onFocusHandler',
        'blur tr': 'onBlurHandler',
        'keydown tr': 'onKeyDown'
    },

    UI: {
        thead: 'thead tr',
        header: 'thead',
        tbody: 'tbody',
        head: '.pl-datagrid-head',
        body: '.pl-datagrid-body',
        bodyContainer: '.pl-datagrid-body > div',
        firstRow: '.pl-dataGrid-first-row',
        headTable: '.pl-datagrid-head-table',
        bodyTable: '.pl-datagrid-body-table',
        mark: '.pl-datagrid-mark'
    },

    /**
     *
     * @param {Object} options
     */
    initialize: function (options) {
        ControlView.prototype.initialize.apply(this);

        this.options = options;
        this.listenTo(this.model, 'change:items', this.onChangeItemsHandler);
        this.listenTo(this.model, 'change:value', this.onChangeValueHandler);
        this.listenTo(this.model, 'change:selectedItem', this.onChangeSelectedItemHandler);
        this.listenTo(this.model, 'change:groups', this.onChangeGroupsHandler);
        this.on('toggle', this.onToggleHandler);
        this.on('select', this.onSelectHandler);
        this.on('popupmenu:show', this.onShowPopupMenuHandler);
        //this.listenTo('dblclick');

        this.initGroups(this.model.get('groups'));

        this.rows = [];
        this.colspan = null; // будет известно при установке первых данных

        this.initVerticalResize();
    },

    /**
     * @description При изменении высоты контейнера - изменить высоту контейнера для прокрутки таблицы
     */
    initVerticalResize: function () {
        var handler = _.throttle(
            function () {
                var hh = this.ui.head.height();
                this.ui.body.height(this.$el.height() - hh);
            }.bind(this), 400, {leading: false});
        var observer = new MutationObserver(handler);
        observer.observe(this.el, {attributes: true, characterData:true});
    },

    onShowPopupMenuHandler: function (data) {
        var popupMenu = this.model.get('popupMenu');
        if (popupMenu) {
            popupMenu.show(data.pageX, data.pageY);
        }
    },

    render: function () {
        this.prerenderingActions();

        this.$el.html(this.template());
        this.bindUIElements();
        this.syncHorizontalScroll();
        this.renderHeader();

        this.renderBody();


        this.postrenderingActions();
        return this;
    },

    postrenderingActions: function(){
        ControlView.prototype.postrenderingActions.call(this);

        var that = this;
        this.$el.find('.pl-datagrid-body')
            .scroll(function(){
                that.onScroll();
            });
    },

    /**
     * @description Синхронизирует горизонтальный скролл заголовка таблицы с его содержимым
     */
    syncHorizontalScroll: function () {
        var body = this.ui.body;
        var head = this.ui.head;

        body.on('scroll', function () {
            head.scrollLeft(body.scrollLeft());
        });
    },

    /**
     * @private
     * @description Рендеринг заголовка таблицы
     * @memberOf DataGridView.prototype
     */
    renderHeader: function () {
        var fragment = document.createDocumentFragment();
        var cell;
        var model;
        var itemTemplate = this.model.get('itemTemplate');
        var itemFormat = this.model.get('itemFormat');

        var useDetail = typeof itemTemplate === 'function' || typeof itemFormat !== 'undefined' && itemFormat !== null;

        this.ui.thead.empty();


        if (this.model.get('multiSelect')) {
            var cb = new DataGridHeaderCheckBoxCell();
            this.ui.thead.append(cb.render().el);
            this.listenTo(cb, 'check', this.onCheckAll);
        }

        this.ui.firstRow.empty();
        if (this.model.get('multiSelect')) {
            var html = this.templateFakeCell({text: '', colspan: 1});
            $(html).addClass('pl-datagrid-checkbox').appendTo(this.ui.firstRow);
        }

        _.each(this.model.get('columns'), function (column, index) {
            var colspan;
            model = column.control.controlModel;
            this.listenTo(model, 'change:sorting', this.onChangeSortingHandler);

            cell = new DataGridHeaderCell({model: model, columnIndex: index});

            this.listenTo(cell, 'resize', this.onResizeColumn);
            this.listenTo(cell, 'resize:start', this.onStartResizeColumn);
            this.listenTo(cell, 'resize:stop', this.onStopResizeColumn);

            colspan = (useDetail && index === 0) ? 2 : 1;
            cell.$el.attr('colspan', colspan);

            fragment.appendChild(cell.render().el);
            this.ui.firstRow.append(this.templateFakeCell({text: model.get('text'), colspan: colspan}));
        }, this);

        this.ui.thead.append(fragment);

        //this.renderTableHeader();
    },

    onCheckAll: function (value) {
        if (value) { //Выделить все элементы
            var values = this.rows.map(function (row) {
                return row.getValue();
            });
            this.model.set('value', values);
        } else { //Снять выделение со всех элементов
            this.model.set('value', []);
        }
    },

    onStartResizeColumn: function (pageX, pageY, columnIndex) {
        this.ui.mark.removeClass('hidden');
        this.updateMarkPosition(pageX, pageY);
    },

    onResizeColumn: function (pageX, pageY, columnIndex) {
        this.updateMarkPosition(pageX, pageY);
    },

    onStopResizeColumn: function (pageX, pageY, width, columnIndex) {
        this.updateMarkPosition(pageX, pageY, columnIndex);

        var index = this.model.get('multiSelect') ? columnIndex + 2 : columnIndex + 1;
        var $el = this.ui.firstRow.find('th:nth-child(' + index+ ')');
        $el.width(width);

        this.ui.mark.addClass('hidden');
    },

    updateMarkPosition: function (pageX, pageY) {
        var position = this.ui.mark.position();
        var offset = this.ui.mark.offset();
        this.ui.mark.css('left', pageX - (offset.left - position.left));
    },

    renderTableHeader: function () {
        var $headers = _.map(this.ui.thead.children(), function (el) {return $(el);});
        var $firstRow = _.map(this.ui.firstRow.children(), function (el) {return $(el);});

        //Копирование стилей из заголовка таблицы в фейковый
        // @TODO Разобраться. Тпймаут добавлен т.к. при отображении в диалоге, стилей у элемента th почему то еще нет
        setTimeout(function () {
            _.each($firstRow, function ($el, i) {
                'font,padding-left,padding-right'.split(',')
                    .forEach(function (name) {
                        var $div = $el.find('div');
                        if ($div.length) {
                            $div.css(name, $headers[i].css(name));
                        }
                    });
            });

            this.syncColumnWidth($headers, $firstRow);
        }.bind(this), 42);

    },

    /**
     *
     * @param {String|Array}attributes
     * @param $el
     * @returns {Number}
     */
    getSumCssProperties: function (attributes, $el) {
        if (_.isString(attributes)) {
            attributes = attributes.split(',');
        }
        var result = _.reduce(attributes, function (result, name) {
            return result + parseInt($el.css(name));
        }, 0);

        return result;
    },

    /**
     * @private
     * @description Синхронизация ширины колонок заголовка и содержимого
     */
    syncColumnWidth: function ($headers, $firstRow) {
        //Создать обсеревер для отслеживания изменений ширины firstRow и изменять соотв. заголовки колонок
        var syncColumnWidth = _.throttle(function () {

            var headers = this.ui.thead.children();
            _.each($firstRow, function ($el, i) {
                var $th = $headers[i];
                var delta = this.getSumCssProperties('padding-left,padding-right', $th);
                var width = $el.width();

                if (parseInt(width, 10) < 0) {
                    //Некорректная ширина, пересчитываем
                    syncColumnWidth();
                }

                if($headers.length-1 != i){
                    $th.width(Math.max($el.width() - delta, 0));
                }else{ //Если последняя колонка, прибавляем ширину скроллбара
                    var widthScrollBar = this.ui.body.width() - this.ui.bodyContainer.width();
                    $th.width(Math.max($el.width() - delta + widthScrollBar, 0));
                }

            }, this);

            var headTable = this.ui.headTable;
            var delta = this.getSumCssProperties('padding-left,padding-right', headTable);
            headTable.width(Math.max(this.ui.bodyTable.width() - delta, 0));
            //headTable.css('margin-right', this.ui.body.width() - this.ui.bodyContainer.width());

        }.bind(this), 100);

        if (typeof this.syncColumnWidthObserver !== 'undefined') {
            this.syncColumnWidthObserver.disconnect();
        }
        var observer = new MutationObserver(syncColumnWidth);
        this.syncColumnWidthObserver = observer;
        var target = this.ui.body.get(0);
        observer.observe(target, {attributes: true, childList: true, characterData: true, subtree: true});
    },

    /**
     * @private
     * @description Рендеринг содержимого таблицы
     * @memberOf DataGridView.prototype
     */
    renderBody: function () {
        _.each(this.rows, function (row) {
            row.remove();
        });
        this.rows.length = 0;

        // test
        //if( this.model.get('items').length && this.model.get('items')[0].Name ){
        //this.model.set('groups', new DataGridGroup({groupBy: ['Name']}));
        //}
        // end of test

        var fragment = document.createDocumentFragment(),
            items = this.model.get('items'),
            groupedItems = this.groups.group(items),
            that = this;

        if(this.model.get('items').length){
            this.colspan = _.size(this.model.get('items')[0]);
            if (typeof itemTemplate === 'function' || typeof itemFormat !== 'undefined'){
                this.colspan++;
            }
        }

        //_.each(this.model.get('items'), this.renderBodyRow.bind(this, fragment));
        this.renderGroup(groupedItems, fragment);
        this.ui.tbody.append(fragment);

        this.closeAllGroup();



        this.renderTableHeader();
        var that = this;

        that.$el.find('.pl-datagrid-body').css('height', 'auto');
        layoutManager.init();

        //this.adaptHeaders();
        //setTimeout(function(){
        //    that.adaptHeaders();
        //}, 200);
    },

    renderGroup: function(group, fragment){
        this.renderSubgroup(group, 0, fragment);
    },

    renderSubgroup: function(subgroup, deep, fragment){
        if(subgroup.groups){
            for(var k in subgroup.groups){
                this.renderGroupTitle(k, deep, fragment);
                this.renderSubgroup(subgroup.groups[k], deep + 1, fragment); //InfinniUI.ObjectUtils.getPropertyValue(fullValue, displayProperty);
            }
        }else{
            _.each(subgroup.items, this.renderBodyRow.bind(this, fragment));
        }
    },

    /**
     * @private
     * @description Рендеринг строк данных таблицы
     * @param fragment
     * @param {*} row Данные
     * @param {Number} index Номер строки п/п
     */
    renderBodyRow: function (fragment, row, index) {
        var model = this.model;
        var itemTemplate = model.get('itemTemplate');
        var itemFormat = model.get('itemFormat');
        var constructors;
        var rowView;
        var params = {
            row: row,
            index: index,
            columns: model.get('columns'),
            valueProperty: model.get('valueProperty'),
            grid: this,
            itemTemplate: itemTemplate,
            itemFormat: itemFormat
        };

        if (typeof itemTemplate === 'function' || typeof itemFormat !== 'undefined') {
            constructors = [DataGridMasterRow, DataGridDetailRow];
        } else {
            constructors = [DataGridBaseRow];
        }

        _.each(constructors, function (fn) {
            rowView = new fn(params);

            /**
             * Подписываемся на событие dblclick из DataGridBaseRow
             */
            this.listenTo(rowView, 'dblclick', this.onDoubleClick);

            this.rows.push(rowView);
            fragment.appendChild(rowView.render().el);
        }, this);
    },

    /**
     * Прокидываем событие dblclick в Control
     * @param args
     */
    onDoubleClick: function(args) {
        this.trigger('dblclick', args);
    },


    renderGroupTitle: function(title, deep, fragment){
        var el = $(_.template('<tr class="group-title"><td colspan="' + this.colspan + '"><span class="fa fa-caret-right"></span>'+title+'</td></tr>')()).get(0);
        fragment.appendChild(el);
    },

    /**
     * @private
     * @description Обработчик изменения списка значений
     * @memberOf DataGridView.prototype
     */
    onChangeItemsHandler: function (model, items) {
        if (this.wasRendered) {
            this.renderBody();
        }
    },

    /**
     * @private
     * @description Обработчик изменения значения
     * @memberOf DataGridView.prototype
     */
    onChangeValueHandler: function (model, value) {
        // Публикуем событие об изменении значения для строчек таблицы
        this.trigger('change:value', value);
    },

    onChangeSelectedItemHandler: function (model, value) {
        // Публикуем событие об изменении значения для строчек таблицы
        this.trigger('change:selectedItem', value);
    },

    onChangeGroupsHandler: function(model, value){
        this.initGroups(value);
//new DataGridGroup()
        if (this.wasRendered) {
            this.render();
        }
    },

    /**
     * @private
     * @description Обработчик переключения значения
     * @memberOf DataGridView.prototype
     * @param {*} value Переключаемое значение
     * @param {undefined|boolean} toggle
     */
    onToggleHandler: function (value, toggle) {
        var model = this.model;
        var current = model.get('value');
        var comparator = model.get('comparator');
        if (model.get('readOnly') || !model.get('enabled')) {
            return;
        }

        var multiSelect = model.get('multiSelect');

        if (multiSelect === true) {
            var newValue = [];
            var matched = false;
            if (typeof toggle === 'undefined' || toggle=== true) { //Установить значения
                if (_.isArray(current) === false) {
                    newValue.push(value);
                    model.set('value', newValue);
                } else {
                    current.forEach(function (v) {
                        if (comparator.isEqual(v, value)) {
                            matched = true;
                        }
                    });
                    if (!matched) {
                        newValue = current.slice();
                        newValue.push(value);
                        model.set('value', newValue);
                    }
                }
            } else { //Исключить значение
                if (_.isArray(current)) {
                    _.each(current, function (val) {
                        if (!comparator.isEqual(val, value)) {
                            newValue.push(val);
                        } else {
                            matched = true;
                        }
                    });
                    if (matched) {
                        model.set('value', newValue);
                    }
                }
            }
        } else {
            model.set('value', value);
        }

    },

    /**
     * @description Обработчик установки выделенного элемента (SelectedItem)
     * @param value
     */
    onSelectHandler: function (value) {
        var model = this.model;
        if (model.get('readOnly') || !model.get('enabled')) {
            return;
        }

        model.set('selectedItem', value);
    },

    /**
     * @description Обработчик изменения режима сортировки колонки
     * @memberOf DataGridView.prototype
     * @param {DataGridColumnModel} model
     * @param {*} sorting
     */
    onChangeSortingHandler: function (model, sorting) {
        if (sorting === DataGridColumnModel.SORTING_NONE) {
            return;
        }

        // Сброс состояния сортировки по другим колонкам
        var columns = this.model.get('columns');
        _.each(columns, function (column) {
            if (column.control.controlModel === model) {
                return;
            }
            if (column.control.controlModel.get('sortable')) {
                column.control.controlModel.set('sorting', DataGridColumnModel.SORTING_NONE);
            }
        });

        this.sortRowByColumn(model, sorting);
    },

    /**
     * @private
     * @description Переупорядочивает данные по заданной колонке
     * @memberOf DataGridView.prototype
     * @param {DataGridColumnModel} model
     * @param {*} sorting
     */
    sortRowByColumn: function (model, sorting) {
        var items = this.model.get('items');
        if (typeof items === 'undefined' || items === null || items.length === 0) {
            return;
        }

        var value1;
        var value2;
        var name = model.get('displayProperty');

        var data;
        var result;

        items.sort(function (a, b) {
            value1 = InfinniUI.ObjectUtils.getPropertyValue(a, name);
            value2 = InfinniUI.ObjectUtils.getPropertyValue(b, name);

            if (value1 === value2) {
                return 0;
            }
            data = [value1, value2];

            result = (data.sort().indexOf(value1) === 0) ? -1 : 1;
            return (sorting === DataGridColumnModel.SORTING_ASC) ? result : -result;
        });

        if (this.wasRendered) {
            this.renderBody();
        }
    },

    onClickOnGroup: function(e){
        var $el = $(e.currentTarget);

        this.toggleGroup($el);
    },

    onScroll: function(){
        this.checkEndOfScroll();
    },

    checkEndOfScroll: function(){
        if(this.model.get('autoLoad')){
            var $current = this.$el.find('.pl-datagrid-body'),
                scrollBottom = $current[0].scrollHeight - $current.height() - $current.scrollTop();
            if(scrollBottom < 10){
                this.trigger('scrollToTheEnd', this.model.get('items').length);
            }
        }
    },

    toggleGroup: function($el, visibleStatus){
        var $current = $el.next(),
            isVisible = $current.is(':visible');

        if(visibleStatus == 'hide'){
            isVisible = true;
        }
        if(visibleStatus == 'show'){
            isVisible = false;
        }
        while($current.length && !$current.hasClass('group-title')){
            if(isVisible){
                $current.hide();
            }else{
                $current.show();
            }

            $current = $current.next();
        }

        $el.toggleClass('expanded', !isVisible );
    },

    closeAllGroup: function(){
        var that = this;
        this.$el.find('.group-title').each(function(i, el){
            that.toggleGroup($(el), 'hide');
        });
    },


    initGroups: function(groups){
        if(!groups){
            this.groups = new DataGridGroup();
        }else{
            this.groups = new DataGridGroup({groupBy: this.adaptGroups(groups)});
        }
    },

    adaptGroups: function(groups){
        var result = [];

        if(!groups){
            return result;
        }

        for(var i= 0, ii = groups.length; i < ii; i++){
            result.push(groups[i].ValueProperty);
        }
        return result;
    },

    onFocusHandler: function(e){

        var items = this.model.get('items'),
            $focused = $(e.target),
            self = this;

        this.$el.on('keydown.forFocusMove', function(e){
            switch (e.which) {
                case 38: //UP
                    if($focused.prev()){
                        $focused.prev().focus();
                    }
                    break;

                case 40: //DOWN
                    if($focused.next()) {
                        $focused.next().focus();
                    }
                    break;

                case 32: //SPACE
                    if(items && $focused) {
                        self.model.set('selectedItem', items[$focused.index() - 1]);
                    }
                    break;
            }
        });

    },

    onBlurHandler: function(e){
        this.$el.off('keydown.forFocusMove');
    },

    onKeyDown: function(event){
        this.trigger('onKeyDown', {
            keyCode: event.which
        });
    },

    /**
     * @description Обработчик стандартного события контекстного меню.
     * @param e
     */
    onContextMenuHandler: function (e) {
        e.preventDefault();//Запрещаем стандартное контекстное меню браузера
    },

    /**
     * @private
     * @description Отслеживание нажатия на правую кнопку. Обрабатывает нажатие правой кнопки, если данное событие не
     * было перехвачено обработчиком строки таблицы (щелчок по пустой части таблицы)
     * @param e
     */
    onMouseDownHandler: function (e) {
        if( e.button == 2 ) {
            e.preventDefault();
            this.trigger('popupmenu:show', {pageX: e.pageX, pageY: e.pageY});
        }
    },

    /**
     * @private
     * @description Адаптация фиксированных заголовков
     */
    adaptHeaders: function(){
        var $th = this.ui.thead.find('th'),
            $thIn = $th.find('.pl-data-grid-th-in'),
            w;

        for(var i = 0, ii = $th.length; i < ii; i++){
            w = $th.eq(i).innerWidth() - parseInt($thIn.eq(i).css('padding-right')) - parseInt($thIn.eq(i).css('padding-left')) + 1;
            $thIn.eq(i).width(w);
        }
    }

});

/**
 * @description Представление строки DataGrid
 * @class DataGridBaseRow
 * @extends Backbone.View
 */
var DataGridBaseRow = Backbone.View.extend({

    tagName: 'tr',

    attributes: {
        tabindex: 0
    },

    template: InfinniUI.Template['controls/dataGrid/template/rows/base.tpl.html'],

    UI: {
        checkbox: 'input',
        checkboxCell: '.cell-checkbox'
    },

    events: {
        click: 'onClickHandler',
        dblclick:'onDoubleClickHandler',
        mousedown: 'onMouseDownHandler',
        mouseover: 'onMouseOverHandler',
        mouseleave: 'onMouseLeaveHandler',
        hover: 'onHoverHandler',
        contextmenu: 'onContextMenuHandler'
    },

    initialize: function (options) {
        this.options = options;
        this.listenTo(options.grid, 'change:value', this.OnChangeValueHandler);
        this.listenTo(options.grid, 'change:selectedItem', this.OnChangeSelectedItemHandler);

    },

    render: function () {
        this.bindUIElements();
        this.bindUIEvents();
        this.renderCells();

        this.applyActiveRow();
        this.applySelectedRow();

        return this;
    },

    bindUIEvents: function () {

    },

    renderCells: function () {
        var
            options = this.options,
            row = options.row,
            grid = options.grid,
            columns = options.columns,
            fragment = document.createDocumentFragment(),
            cell;

        if(this.options.grid.model.get('multiSelect') === true) {
            cell = new DataGridBodyCheckBoxCell();
            this.checkbox = cell;

            this.listenTo(cell, 'check', function (value) {
                grid.trigger('toggle', this.getValue(), value);
            });

            fragment.appendChild(cell.render().el);
        }

        _.each(columns, function (column, columnIndex) {
            cell = new DataGridBodyCell({
                model: column.control.controlModel,
                row: row,
                index: options.index,
                click: this.selectRow.bind(this)
            });
            fragment.appendChild(cell.render().el);
        }, this);
        this.$el.append(fragment);
    },

    selectRow: function () {
        var options = this.options;
        var grid = options.grid;
        var multiSelect = grid.model.get('multiSelect');

        grid.trigger('select', this.options.row);
        if (multiSelect !== true) {
            grid.trigger('toggle', this.getValue());
        }
    },

    /**
     * @private
     * @description Обрабочик щелчка по строке таблицы
     * @memberOf DataGridBodyRow.prototype
     */
    onClickHandler: _.debounce(function (event) {
        var grid = this.options.grid;
        var multiSelect = this.options.grid.model.get('multiSelect');

        grid.trigger('select', this.options.row);

        /**
         * Если не множественный выбор - значения выбираются щелчком по строке.
         * Иначе для выбора надо щелкать по checkbox
         */

        if (multiSelect !== true) {
            grid.trigger('toggle', this.getValue());
        }
    }),

    onDoubleClickHandler: function(event){
        this.doubleclicked = true;
        this.trigger('dblclick', this.getValue());
        this.trigger('select', this.options.row);
    },

    /**
     * @private
     * @description Отслеживание нажатия на правую кнопку
     * @param e
     */
    onMouseDownHandler: function (e) {
        if( e.button == 2 ) {
            e.preventDefault();
            e.stopPropagation();
            var grid = this.options.grid;
            this.selectRow();
            //@TODO Возможны гонки?
            grid.trigger('popupmenu:show', {pageX: e.pageX, pageY: e.pageY});
        }
    },

    /**
     * @description Обработчик стандартного события контекстного меню.
     * @param e
     */
    onContextMenuHandler: function (e) {
        e.preventDefault();//Запрещаем стандартное контекстное меню браузера
    },

    /**
     * @private
     * @description Обработчик изменения значения
     * @memberOf DataGridBodyRow.prototype
     * @param {*} value
     */
    OnChangeValueHandler: function () {
        this.applyActiveRow();
    },

    OnChangeSelectedItemHandler: function () {
        this.applySelectedRow();
    },

    /**
     * @protected
     * @description Стилизация строки текущего значения
     * @memberOf DataGridBodyRow.prototype
     */
    applyActiveRow: function () {
        var grid = this.options.grid;
        var value = grid.model.get('value');
        var comparator = grid.model.get('comparator');
        var currentColor = this.$el.css('background-color');

        if (_.isArray(value)) {
            var found = false;
            for (var i = 0, ln = value.length; i < ln; i = i + 1) {
                if (comparator.isEqual(this.getValue(), value[i])) {
                    found = true;
                    break;
                }
            }
            this.$el.toggleClass('select', found);
            this.checkbox.check(found);
        } else {
            this.$el.toggleClass('select', comparator.isEqual(this.getValue(), value));
        }

        var customColors  = grid.model.get('customColors');
        var color;
        if (typeof customColors !== 'undefined' && customColors !== null) {
            color = customColors.getColor(this.getValue());
            if (color !== false) {
                this.$el.css('background-color', color);
            }else{
                this.$el.css('background-color', '#fff');
            }
        }
        if(this.$el.hasClass('select')){
            this.$el.css('background-color', this.ColorLuminance(this.$el.css('background-color'), -0.2));
        }
        this.onHoverHandler();
    },

    applySelectedRow: function () {
        var options = this.options;
        var grid = options.grid;
        var selectedItem = grid.model.get('selectedItem');
        var comparator = grid.model.get('comparator');

        var isSelected = comparator.isEqual(options.row, selectedItem);

        this.$el.toggleClass('selected', isSelected);
    },

    /**
     * @private
     * @description Возвращает значение, которое соответсвует текущему набору данных
     * @memberOf DataGridBodyRow.prototype
     */
    getValue: function () {
        return InfinniUI.ObjectUtils.getPropertyValue(this.options.row, this.options.valueProperty);
    },

    onMouseOverHandler: function () {
        //this.$el.addClass('hover');
    },

    onMouseLeaveHandler: function () {
        //this.$el.removeClass('hover');
    },

    onHoverHandler:function(){
        var color = this.$el.css('background-color');

        var self = this;
        this.$el.hover(
            function(){
                self.$el.css('background-color', self.ColorLuminance(color, -0.05))
            },function(){
                self.$el.css('background-color', color);
            }
        )
    },

    ColorLuminance: function(rgb, lum) {
        var hex = rgb2hex(rgb);

        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }

            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }

        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        var returnRgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            returnRgb += ("00"+c).substr(c.length);
        }
        return returnRgb;
    }
});

_.extend(DataGridBaseRow.prototype, bindUIElementsMixin);
var DataGridDetailRow = DataGridBaseRow.extend({

    className: 'datagrid-row-detail',

    UI: {
        detail: '.data-grid-detail'
    },

    template: InfinniUI.Template['controls/dataGrid/template/rows/detail.tpl.html'],

    initialize: function (options) {
        this.options = options;
        this.listenTo(options.grid, 'change:value', this.OnChangeValueHandler);
    },

    initTemplate: function () {
        var options = this.options;
        var columns = options.columns;

        this.$el.html(this.template({
            colspan: columns.length + 1
        }));

        //По умолчанию скрываем
        this.$el.addClass('hidden');
    },

    renderCells: function () {
        var options = this.options;
        var itemTemplate = options.itemTemplate;
        var itemFormat = options.itemFormat;
        var index = options.index;
        var itemTemplateElement;
        var text;

        if (typeof itemTemplate === 'function') {
            itemTemplateElement = itemTemplate(index).render();
            this.ui.detail.append(itemTemplateElement);
        } else if (typeof itemFormat !== 'undefined' && itemFormat !== null) {
            text = itemFormat.format(options.row);
            this.ui.detail.append(text);
        }

    }

});

var DataGridMasterRow = DataGridBaseRow.extend({

    className: 'datagrid-row-master',

    template: InfinniUI.Template['controls/dataGrid/template/rows/master.tpl.html'],

    UI: {
        expand: '.datagrid-expand',
        collapse: '.datagrid-collapse'
    },

    initialize: function (options) {
        this.options = options;
        this.listenTo(options.grid, 'change:value', this.OnChangeValueHandler);
    },

    bindUIEvents: function () {
        this.ui.expand.on('click', this.onExpandClick.bind(this));
        this.ui.collapse.on('click', function (event) {event.preventDefault();});
    },

    /**
     * @description Обработчик expand/collapse для master/detail
     */
    onExpandClick: function (event) {
        event.stopPropagation();
        this.$el.toggleClass('expanded');
        var expanded = this.$el.hasClass('expanded');

        this.$el.next().toggleClass('hidden', !expanded);
    }


});

var DataNavigationControl = function () {
    _.superClass(DataNavigationControl, this);
};

_.inherit(DataNavigationControl, Control);

_.extend(DataNavigationControl.prototype, {
    createControlModel: function () {
        return new DataNavigationModel();
    },

    createControlView: function (model) {
        return new DataNavigationView({model: model});
    },

    onSetPageNumber: function (handler) {
        this.controlModel.on('change:pageNumber', function (model) {
            handler(model.get('pageNumber'));
        });
    },

    onSetPageSize: function (handler) {
        this.controlModel.on('change:pageSize', function (model) {
            handler(model.get('pageSize'));
        });
    }

});
var DataNavigationModel = ControlModel.extend({
    defaults: _.defaults({
        pageNumber: 0,
        pageSize: 1,
        availablePageSizes: [1]
    }, ControlModel.prototype.defaults),

    initialize: function(){
        ControlModel.prototype.initialize.apply(this);
    }
});
var DataNavigationView = ControlView.extend({
    className: 'pl-data-navigation',

    template: _.template(''+
        '<div class="navigation-bar">' +
            '<div class="navigation"></div>' +
        '</div>'),

    events: {
        'click .update': 'updateHandler'
        //TODO: 'click .refresh': 'updateItems'
    },

    //TODO: AvailablePageSize [20, 40, 60] (Визуальный элемент, с количеством элементов на странице)
    //TODO: PageCount - количество страниц (приходит с сервера)

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:enabled', this.onChangeEnabledHandler);
//        this.listenTo(this.model, 'change:pageSize', this.onSetPageSize);
//        this.listenTo(this.model, 'change:pageNumber', this.onSetPageNumber);
//        this.listenTo(this.model, 'change:availablePageSizes', this.onAvailablePageSizes)
    },

    render: function () {
        this.prerenderingActions();
        this.$el.html(this.template({}));

        var self = this;
        this.$el.find('.navigation').bootpag({
            total: 50,
            page: this.model.get('pageNumber'),
            maxVisible: 10,
            leaps: false,
            next: 'Вперед ››',
            prev: '‹‹ Назад'
        }).on("page", function (event, num) {
            self.model.set('pageNumber', num-1);
        });

        this.onChangeEnabledHandler(this.model, this.model.get('enabled'));
        this.postrenderingActions();
        return this;
    },

    onPageSizeHandler: function(){
        this.trigger('onSetPageSize', this.model.get('pageSize'));
    },

    onPageNumberHandler: function(){
        this.trigger('onSetPageNumber', this.model.get('pageNumber'));
    },

    onChangeEnabledHandler: function (model, value) {
        if (!this.wasRendered) return;

        if(value) {
            this.$el.find('.bootpag').removeClass('disabled');
//            this.$el.find('.bootpag').find('a').bind('click', true);
        }else{
            this.$el.find('.bootpag').addClass('disabled');
            this.$el.find('.bootpag.disabled').find('a').bind('click', false);
        }
    }
});
var DatePickerControl = function(){
    _.superClass(DatePickerControl, this);
};

_.inherit(DatePickerControl, Control);

_.extend(DatePickerControl.prototype, {

    createControlModel: function () {
        return new DatePickerModel();
    },

    createControlView: function (model) {
        return new DatePickerView({model: model});
    },

    set: function(key, val){
        if(key == 'value' && this.get('mode') == 'Date'){
            if(val instanceof Date){
                val = InfinniUI.DateUtils.toISO8601(val);
            }

            Control.prototype.set.call(this, key, val);
        }else{
            Control.prototype.set.call(this, key, val);
        }
    }
},
    controlValuePropertyMixin,
    baseTextControlMixin
);

var DatePickerModel = ControlModel.extend({
    defaults: _.defaults({
        mode: 'Date',
        minDate: null,
        maxDate: null,
        format: null,
        readonly: false,
        value: null,
        foreground: 'Black',
        background: 'Transparent',
        textStyle: 'Body1'
    }, ControlModel.prototype.defaults)
});

var DatePickerView = ControlView.extend({
    className: 'pl-datePicker',

    templates: {
        date: InfinniUI.Template["controls/datePicker/template/datepicker.tpl.html"],
        datetime: InfinniUI.Template["controls/datePicker/template/datetimepicker.tpl.html"],
        time: InfinniUI.Template["controls/datePicker/template/timepicker.tpl.html"],
        labeldate: InfinniUI.Template["controls/datePicker/template/label-datepicker.tpl.html"],
        labeldatetime: InfinniUI.Template["controls/datePicker/template/label-datetimepicker.tpl.html"],
        labeltime: InfinniUI.Template["controls/datePicker/template/label-timepicker.tpl.html"]
    },

    UI: {
        control: 'input.datePicker, input.datetimepicker, input.timepicker',
        editor: '.pl-control-editor',
        hintText: '.pl-control-hint-text',
        validationMessage: '.pl-control-validation-message'
    },

    events: {
        //Обработчик для показа поля редактирования с использованием маски ввода
        'focus .datePicker': 'onFocusControlHandler',
        'focus .datetimepicker': 'onFocusControlHandler',
        'focus .timepicker': 'onFocusControlHandler',
        'mouseenter .datePicker': 'onMouseenterControlHandler',
        'mouseenter .datetimepicker': 'onMouseenterControlHandler',
        'mouseenter .timepicker': 'onMouseenterControlHandler',
        'focusin .pl-control-editor' : 'onFocusInDebounceHandler',
        'focusout .pl-control-editor' : 'onFocusOutDebounceHandler'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.initHorizontalTextAlignment();
        this.initForeground();
        this.initBackground();
        this.initTextStyle();
        this.initHintText();
        this.initErrorText();

        this.on('editor:show', this.hideDatePickerHandler);
        this.on('editor:hide', this.showDatePickerHandler);
        this.onFocusInDebounceHandler = _.debounce(this.onFocusInHandler, 100);
        this.onFocusOutDebounceHandler = _.debounce(this.onFocusOutHandler, 100);

        this.updateMode();
        this.listenTo(this.model, 'change:mode', this.updateMode);
        this.listenTo(this.model, 'change:value', this.updateValue);
        this.listenTo(this.model, 'change:validationMessage', this.updateValidation);
        this.listenTo(this.model, 'change:validationState', this.updateValidation);
        this.listenTo(this.model, 'change:enabled', this.applyEnabled);
        this.listenTo(this.model, 'change:minDate', this.updateMinDate);
        this.listenTo(this.model, 'change:maxDate', this.updateMaxDate);
    },

    hideDatePickerHandler: function () {
        if (typeof this.hideDatePicker !== 'undefined') {
            this.hideDatePicker();
        }
    },

    showDatePickerHandler: function () {
        if (typeof this.showDatePicker !== 'undefined') {
            this.showDatePicker();
        }
    },

    render: function () {
        this.prerenderingActions();
        this.renderControl();

        this.initOnUiValueChangeHandler();
        this.updateValue();
        this.applyEnabled();
        this.updateMinDate();
        this.updateMaxDate();

        this.updateHorizontalTextAlignment();
        this.updateForeground();
        this.updateBackground();
        this.updateTextStyle();
        this.updateErrorText();
        this.updateValidation(); //При повторном рендере, принудительно выставляем Error текст
        this.updateHintText();

        this.postrenderingActions();
        return this;
    },

    updateMode: function () {
        var mode = this.model.get('mode');

        _.extend(this, pickersStrategy[mode]);
    },

    updateValue: function () {
        var value = this.model.get('value');

        if (this.wasRendered && this.inAllowableRange(value)) {
            this.setValueOnPicker(value);
        }
    },

    applyEnabled: function () {
        var enabled = this.model.get('enabled');
        if (this.wasRendered) {
            this.setEnabledOnPicker(enabled);
        }
    },

    updateMinDate: function () {
        if (this.wasRendered) {
            var minDate = this.model.get('minDate');
            this.setMinDateOnPicker(minDate);
        }
    },

    updateMaxDate: function () {
        if (this.wasRendered) {
            var maxDate = this.model.get('maxDate');
            this.setMaxDateOnPicker(maxDate);
        }
    },

    inAllowableRange: function (value) {
        var minDate = this.model.get('minDate');
        var maxDate = this.model.get('maxDate');

        if (typeof value === 'undefined' || value === null) {
            return true;
        } else {
            if (typeof value === 'string') {
                value = new Date(value);
            }
        }

        if (minDate && value < minDate)
            return false;

        if (maxDate && value > maxDate)
            return false;

        return true;
    },

    isValidDate: function (value) {
        return ((value instanceof Date) && (!isNaN(value.getTime()))) || (typeof value == 'string' && value.length == 10);
    },

    /**
     * Рендеринг редактора значений
     */
    initEditor: function () {
        //Создание редактора значений
        var editor = this.renderEditor({
            el: this.ui.editor
        });

    },

    /**
     * Обработчик проверки значения из поля ввода с маской
     * @param value
     * @returns {boolean}
     */
    onEditorValidate: function (value) {
        //@TODO Добавить проверку указанной даты на валидность
        return this.inAllowableRange(value);
    },

    timeToString: function(value){
        if(value instanceof Date){
            var hours = value.getHours().toString(),
                minutes = value.getMinutes().toString();

            if(hours.length == 1){
                hours = '0' + hours;
            }
            if(minutes.length == 1){
                minutes = '0' + minutes;
            }
            return hours + ':' + minutes;
        }else{
            return value;
        }
    },

    updateValidation: function () {
        var model = this.model;

        var state = model.get('validationState');
        var message = model.get('validationMessage');

        var hideMessage = _.isEmpty(message) || ['error', 'warning'].indexOf(state) === -1;

        this.ui.validationMessage.toggleClass('hidden', hideMessage);
        this.ui.validationMessage.text(message);

        //state = success, error, warning
    },

    onFocusInHandler: function (event) {
        this.callEventHandler('OnGotFocus');
    },

    onFocusOutHandler: function (event) {
        this.callEventHandler('OnLostFocus');
    },

    datePickerZindex: function(){
        var zIndex = [];
        _.each($('.modal-scrollable'), function (el) {
            var num = parseInt($(el).css("z-index"));
            if(num){
                zIndex.push(num);
            }
        });
        return Math.max.apply(Math, zIndex) + 1;
    }
});

var pickersStrategy = {
    'Date': {
        renderControl: function(){
            var labelText = this.model.get('labelText');
            var format = this.model.get('format');
            if(!format){
                format = "dd.mm.yyyy";
            }else{
                format = format.formatRule;
            }

            if(typeof labelText === 'undefined' || labelText === null){
                this.$el.html(this.templates.date({}));
            }else{
                this.$el.html(this.templates.labeldate({
                    labelText: labelText
                }));
            }

            this.bindUIElements();
            this.initEditor();
            var self = this;

            this.$el.find('.date').datepicker({
                autoclose: true,
                format: format,
                language: InfinniUI.config.lang.substr(0, 2),
                todayHighlight: true
            }).on('show', function(e){
                var $elem = $('.modal-open > .datepicker');
                var zIndexStyle = 'z-index:'+self.datePickerZindex()+' !important';
                if($elem.attr('style').indexOf(zIndexStyle) <= 0) {
                    $elem.attr('style', $elem.attr('style') + zIndexStyle);
                }
            });
        },

        hideDatePicker: function () {
            //@TODO Иначе скрыть всплывающий календарь плагина bootstrap-datepicker, при получении фокуса не получиться
            //var control = this.$('.date');
            //setTimeout(function () {
            //    control.datepicker('hide');
            //}, 10);
        },

        initOnUiValueChangeHandler: function(){
            var $datePicker = this.$el.find('.date'),
                self = this;

            $datePicker.on('changeDate', function(e){
                if(e.date) {
                    var newVal = InfinniUI.DateUtils.toISO8601(e.date);
                    if (! self.isEqualDate(newVal, self.model.get('value'))) {
                        self.model.set('value', newVal);
                    }
                }
            });
        },

        isEqualDate: function(d1, d2){
            if(d1 == d2){
                return true;
            }

            if(typeof(d1) == 'string' && typeof(d2) == 'string'){
                return d1.substr(0, 10) == d2.substr(0, 10);
            }

            return false;
        },

        /**
         * @description Установка даты в плагине календаря
         * @param {String} value
         */
        setValueOnPicker: function(value){
            var self = this,
                date,
                current,
                $datePicker = this.$el.find('.date');

            if (typeof value === 'undefined' || value === null) {
                $datePicker.datepicker('setDate', null);
            } else {
                date = new Date(value);
                $datePicker.datepicker('setDate', date);
            }
        },

        setEnabledOnPicker: function (enabled) {
            var $datePickerInnerNodes = this.$el.find('button, input');

            $datePickerInnerNodes.removeAttr('disabled');

            if (!enabled) {
                $datePickerInnerNodes.attr('disabled', 'disabled');
            }
        },

        setMinDateOnPicker: function(minDate){
            var $datePicker = this.$el.find('.date');
            $datePicker.datepicker('setStartDate', minDate);
        },

        setMaxDateOnPicker: function(maxDate){
            var $datePicker = this.$el.find('.date');
            $datePicker.datepicker('setEndDate', maxDate);
        }
    },

    //----------
    'DateTime': {
        renderControl: function(){
            var labelText = this.model.get('labelText');
            var format = this.model.get('format');
            if(!format){
                format = "dd.mm.yyyy - hh:ii";
            }else{
                format = format.formatRule;
            }

            if(typeof labelText === 'undefined' || labelText === null){
                this.$el.html(this.templates.datetime({}));
            }else{
                this.$el.html(this.templates.labeldatetime({
                    labelText: labelText
                }));
            }

            this.bindUIElements();
            this.initEditor();
            var self = this;

            this.$el.find('.form_datetime').datetimepicker({
                autoclose: true,
                format: format,
                language: InfinniUI.config.lang.substr(0, 2),
                pickerPosition: "bottom-left"
            }).on('show', function(e){
                var $elem = $('.modal-open > .datetimepicker');
                $elem.attr('style', $elem.attr('style') + 'z-index:'+self.datePickerZindex()+' !important');
            });
        },

        hideDatePicker: function () {
            //@TODO Скрыть плагин

        },

        initOnUiValueChangeHandler: function(){
            var $picker = this.$el.find('.form_datetime'),
                self = this;

            $picker.on('changeDate', function(e){
                if(e.date){
                    var d = new Date();
                    //Костыль для плагина bootstrap-datetimepicker, т.к. этот плагин удаляет временную зону
                    var date = new Date(e.date.getTime() + d.getTimezoneOffset() * 60000);
                    var newVal = InfinniUI.DateUtils.toISO8601(date);
                    self.model.set('value', newVal);
                }
            });
        },

        /**
         * @description Установка даты в плагине календаря
         * @param {String} value
         */
        setValueOnPicker: function(value){
            var self = this,
                $picker = this.$el.find('.form_datetime');

            if (typeof value === 'undefined' || value === null) {
                this.$('.datetimepicker').val('');
                $picker.datetimepicker('update');
            } else {
                var date = new Date(value);
                $picker.data('datetimepicker').setDate(date);
            }
        },

        setEnabledOnPicker: function (enabled) {
            var $datePickerInnerNodes = this.$el.find('.open-button .form-control');

            if (!enabled){
                $datePickerInnerNodes.attr('disabled', 'disabled');
            }else{
                $datePickerInnerNodes.removeAttr('disabled');
            }
        },

        setMinDateOnPicker: function(minDate){
            var $datePicker = this.$el.find('.date');
            $datePicker.datetimepicker('setStartDate', minDate);
        },

        setMaxDateOnPicker: function(maxDate){
            var $datePicker = this.$el.find('.date');
            $datePicker.datetimepicker('setEndDate', maxDate);
        }
    },

    //----------
    'Time': {
        renderControl: function(){
            var labelText = this.model.get('labelText');

            if(typeof labelText === 'undefined' || labelText === null){
                this.$el.html(this.templates.time({}));
            }else{
                this.$el.html(this.templates.labeltime({
                    labelText: labelText
                }));
            }

            this.bindUIElements();
            this.initEditor();

            var $control = this.$el.find('.timepicker-control');

            $control.timepicker({
                autoclose: true,
                minuteStep: 5,
                showSeconds: false,
                showMeridian: false
            });

            this.$el.find('.open-picker').click(function(){
                $control.timepicker('showWidget');
            });
        },

        hideDatePicker: function () {
            //@TODO Скрыть плагин
            var control = this.$(".timepicker-control");

            setTimeout(function () {
                control.timepicker('hideWidget');
            }, 42);
        },

        initOnUiValueChangeHandler: function(){
            var $picker = this.$el.find('.timepicker-control'),
                self = this;

            $picker.on('changeTime.timepicker', function(e) {
                var value = self.model.get('value');
                if (typeof value === 'undefined' || value === null) {
                    value = new Date(0);
                }
                value = new Date(value);
                value.setMinutes(e.time.minutes);
                value.setHours(e.time.hours);

                self.model.set('value', InfinniUI.DateUtils.toISO8601(value));
            });
        },

        /**
         * @description Установка даты в плагине календаря
         * @param {String} value
         */
        setValueOnPicker: function(value){
            var $picker = this.$el.find('.timepicker-control'),
                self = this;

            var date = null;

            if (typeof value === 'undefined' || value === null) {

            } else {
                date = new Date(value);
            }

            $picker.timepicker('setTime', date);
        },

        setEnabledOnPicker: function (enabled) {
            var $field = this.$el.find('.timepicker-control');
            $field.prop('disabled', !enabled);
        },

        setMinDateOnPicker: function(minDate){

        },

        setMaxDateOnPicker: function(maxDate){

        }
    }
};

_.extend(DatePickerView.prototype,
    textEditorMixin,
    foregroundPropertyMixin,
    backgroundPropertyMixin,
    textStylePropertyMixin,
    horizontalTextAlignmentPropertyMixin,
    hintTextPropertyMixin,
    errorTextPropertyMixin,
    labelTextPropertyMixin
);
var DocumentViewerControl = function () {
    _.superClass(DocumentViewerControl, this);
};

_.inherit(DocumentViewerControl, Control);

_.extend(DocumentViewerControl.prototype, {
    createControlModel: function () {
        return new DocumentViewerModel();
    },

    createControlView: function (model) {
        return new DocumentViewerView({model: model});
    },

    onValueChanged: function(handler){
        this.controlModel.on('change:value', handler);
    }
});
var DocumentViewerModel = ControlModel.extend({
    defaults: _.defaults({
        verticalAlignment: 'Stretch'
    }, ControlModel.prototype.defaults),

    initialize: function(){
        ControlModel.prototype.initialize.apply(this);
    }
});
var DocumentViewerView = ControlView.extend({
    className: 'pl-document-viewer',

    template: _.template(
        '<div class="pl-documentViewer">' +
        '   <iframe id="documentViewer" name="documentViewer" style="width:100%;" src="/app/utils/pdf/web/viewer.html#<%= frameId %>"></iframe>' +
        '</div>'),

    events: {
        'click .print': 'onButtonPrintClickHandler'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:dataSource', this.onChangeDataSource);
    },

    onChangeDataSource: function () {
        if (!this.wasRendered) {
            return;
        }
        this.renderDocument();
    },

    render: function () {
        this.prerenderingActions();

        this.renderDocument();

        this.postrenderingActions();
        return this;
    },

    renderDocument: function () {
        var valueExist = this.model.get('valueExist');
        if(valueExist){
            this.urlRender();
            //this.normalRender();
        }else{
            this.normalRender();
        }
    },

    normalRender: function(){
        var that = this,
            renderFrame = function(){
            this.$el.empty();
            var query = dataSource.getQueryFilter();
            var requestData = {
                PrintViewId: this.model.get('viewId'),
                PrintViewType : 'ListView',
                ConfigId: dataSource.getConfigId(),
                DocumentId: dataSource.getDocumentId(),
                PageNumber: dataSource.getPageNumber(),
                PageSize: dataSource.getPageSize(),
                Query: query == null ? null : query.items
            };

            var urlParams = $.param({Form: JSON.stringify(requestData)}).replace(/%22/g, '%27');
            this.sendRequest(InfinniUI.config.serverUrl+'/SystemConfig/UrlEncodedData/Reporting/GetPrintView/?' + urlParams, function(data){
                that.renderPdf(data);
            });
        }.bind(this);

        var dataSource = this.model.get('view').getDataSource(this.model.get('dataSource'));

        //dataSource.addDataBinding({onSetPropertyValue: $.noop, bind: $.noop});

        if (typeof this.onDataSourceItemsUpdated !== 'undefined') {
            this.onDataSourceItemsUpdated.unsubscribe();
        }

        this.onDataSourceItemsUpdated = dataSource.onItemsUpdated(function(){
            renderFrame();
        });

        renderFrame();
    },

    urlRender: function(){
        var that = this,
            renderFrame = function(){
                if(this.model.get('url')){
                    var url = encodeURI(this.model.get('url'));
                    this.sendRequest(url, function(data){
                        that.renderPdf(data);
                    });
                }
            }.bind(this);

        renderFrame();

        this.listenTo(this.model, 'change:url', renderFrame);
    },

    renderPdf: function(data){
        window.pdfDocs = window.pdfDocs||[];

        var frameId = this.genId();
        window.pdfDocs[frameId] = data;
        var template = this.template({frameId: frameId});
        this.$el.html(template);
    },

    onButtonPrintClickHandler: function () {
        $('#documentViewer').get(0).contentWindow.print();
    },

    genId: function(){
        return Math.round((Math.random() * 100000));
    },

    sendRequest: function(url, handler){
        var xmlhttp = this.getXmlHttp();

        xmlhttp.open('GET', url, true);
        xmlhttp.withCredentials = true;
        xmlhttp.responseType = 'arraybuffer';
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    handler(xmlhttp.response);
                }
            }
        };
        xmlhttp.send();
    },

    getXmlHttp: function(){
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e1) {
                xmlhttp = false;
            }
        }

        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }

        return xmlhttp;
    }
});
var ExtensionPanelControl = function () {
    _.superClass(ExtensionPanelControl, this);
};

_.inherit(ExtensionPanelControl, Control);

_.extend(ExtensionPanelControl.prototype, {

    createControlModel: function () {
        return new ExtensionPanelModel();
    },

    createControlView: function (model) {
        return new ExtensionPanelView({model: model});
    }
});
var ExtensionPanelModel = ControlModel.extend({
    defaults: _.extend({
        extensionName: null//,
        //context: null
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});
var ExtensionPanelView = ControlView.extend({
    className: 'pl-extension-panel',

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.extensionObject = null;
    },

    render: function () {
        this.prerenderingActions();

        if (!this.extensionObject) {
            this.initAndRenderExtensionObject();
        } else {
            this.renderExtensionObject();
        }

        this.postrenderingActions();
        return this;
    },

    initAndRenderExtensionObject: function () {
        var extensionName = this.model.get('extensionName'),
            context = this.model.getContext(),
            parameters = this.model.get('parameters');

        this.extensionObject = new window[extensionName]();
        var self = this;
        var $render = self.extensionObject.render(self.$el, parameters, context);
        if($render){
            self.$el
                .empty()
                .append($render);
        }

    },

    renderExtensionObject: function () {
        var $render = this.extensionObject.render(this.$el, this.model.get('parent'));
        if($render){
            self.$el
                .empty()
                .append($render);
        }
    }
});
var FilterPanelControl = function () {
    _.superClass(FilterPanelControl, this);
};

_.inherit(FilterPanelControl, Control);

_.extend(FilterPanelControl.prototype, {
    createControlModel: function () {
        return new FilterPanelModel();
    },

    createControlView: function (model) {
        return new FilterPanelView({model: model});
    },

    onValueChanged: function (handler) {
        this.controlView.on('onValueChanged', handler);
    },

    filter: function () {
        this.controlView.trigger('applyFilter');
    }

});
var FilterPanelModel = ControlModel.extend({
    defaults: _.defaults({
    }, ControlModel.prototype.defaults),

    initialize: function(){
        ControlModel.prototype.initialize.apply(this);
        this.set({
            text: 'Найти'
        }, {silent: true});
    }
});
var FilterPanelView = ControlView.extend({
    className: 'pl-filter-panel',

    template: {
        panel: InfinniUI.Template["controls/filterPanel/template/template.tpl.html"],
        item: InfinniUI.Template["controls/filterPanel/template/item.tpl.html"]
    },


    controlsPerLine: 6,

    events: {
        'click .btn_reset': 'onButtonResetClickHandler',
        'submit form': 'submitFormHandler'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.listenTo(this.model, 'change:enabled', this.updateEnabled);
        this.on('applyFilter', this.onApplyFilterHandler);
    },

    render: function () {
        this.prerenderingActions();
        var filters = this.model.get('filters');
        var $item;

        this.$el.html(this.template.panel({
            text: this.model.get('text')
        }));
        var $controls = this.$('.pl-filter-controls');

        for (var i = 0; i < filters.length; i = i + 1) {
            $item = $(this.template.item());
            $('.pl-filter-panel-label', $item).append(filters[i].text.render());
            for (var j = 0; j < filters[i].operators.length; j++) {
                $('.pl-filter-panel-control', $item).append(filters[i].operators[j].el.render());
            }

            $controls.append($item);
        }

        this.updateEnabled();

        this.postrenderingActions();
        return this;
    },

    onApplyFilterHandler: function () {
        this.$el.find('.pl-text-box').trigger('synchValue');
        this.onButtonSearchClickHandler();
    },

    submitFormHandler: function(event){
        event.preventDefault();
        this.trigger('applyFilter');
    },

    onButtonSearchClickHandler: function () {
        var query = this.collectFormQuery();

        if(this.model.get('value') !== undefined && JSON.stringify(this.model.get('value')) == JSON.stringify(query)) {
            return;
        }

        this.model.set('value', query);
        this.trigger('onValueChanged', this.model.get('value'));
    },

    filter:function(){
        this.onButtonSearchClickHandler();
    },

    onButtonResetClickHandler: function () {
        var filters = this.model.get('filters');
        var value = [];

        for (var i = 0; i < filters.length; i++) {
            for (var j = 0; j < filters[i].operators.length; j++) {
                filters[i].operators[j].el.control.set('value', null);
            }
        }

        this.model.set('value', value);
        this.trigger('onValueChanged', this.model.get('value'));
    },

    collectFormQuery: function(){
        var query = [];
        var filters = this.model.get('filters');

        for (var i = 0; i < filters.length; i++) {
            for (var j = 0; j < filters[i].operators.length; j++) {
                var val = filters[i].operators[j].el.getValue();
                if(val) {
                    var obj = {};
                    obj.Property = filters[i].property;
                    if(obj.Property) {
                        obj.CriteriaType = toEnum(filters[i].operators[j].operator);

                        if (typeof val == 'object' && !(val instanceof Date)) {
                            obj.Value = val.Id;
                        } else {
                            obj.Value = val;
                        }
                        query.push(obj);
                    }
                }
            }
        }
        query.push.apply(query, this.model.get('query'));
        //console.log(query);
        return query;
    },

    updateEnabled: function(){
        this.$el.find('input, button').prop('disabled', !this.model.get('enabled'));
    }
});
var GlobalNavigationBarButtonModel = Backbone.Model.extend({
    defaults: {
        key: '',
        text: '',
        active: false,
        description: ''
    }
});

var GlobalNavigationBarButtonView = Backbone.View.extend({

    //className: 'pl-global-navigation-bar-button',
    className: 'pl-gn-button',

    activeClass: 'pl-active',

    template: InfinniUI.Template["controls/globalNavigationBar/buttons/template/template.tpl.html"],
    //template: _.template('<a data-key="<%=key%>"><%=text%><i class="fa fa-times"></i></a>'),

    events: {
        'click .pl-gn-button-link': 'onClickHandler',
        'click .pl-gn-button-close': 'onClickCloseHandler'
    },

    initialize: function (options) {
        this.model = new GlobalNavigationBarButtonModel(options);
        this.listenTo(this.model, 'change:text', this.render);
        this.listenTo(this.model, 'change:active', this.onChangeActiveHandler);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    setText: function (text) {
        this.model.set('text', text);
    },

    setActive: function (active) {
        var activate = this.model.get('key') == active;
        this.model.set('active', activate);
    },

    getKey: function () {
        return this.model.get('key');
    },

    onClickHandler: function (event) {
        event.preventDefault();

        this.trigger('application:activate', this.model.get('key'));
    },

    onClickCloseHandler: function (event) {
        event.preventDefault();
        this.trigger('application:closing');
    },

    onClick: function (handler) {
        this.on('click', handler)
    },

    onChangeActiveHandler: function () {
        var active = this.model.get('active');

        this.$el.toggleClass(this.activeClass, active);
    }

});
var GlobalNavigationBarControl = function () {
    _.superClass(GlobalNavigationBarControl, this);
};

_.inherit(GlobalNavigationBarControl, Control);

_.extend(GlobalNavigationBarControl.prototype, {
    createControlModel: function () {
        return new GlobalNavigationBarModel();
    },

    createControlView: function (model) {
        return new GlobalNavigationBarView({model: model});
    },

    addApplicationView: function (view) {
        var model = this.controlModel;
        var applications = model.get('applications').slice();
        if (applications.indexOf(view) === -1) {
            applications.push(view);
            model.set('applications', applications);
        }
        model.set('active', view.getGuid());
    },

    removeApplicationView: function (view) {
        var model = this.controlModel;
        var applications = model.get('applications').slice();
        var i = applications.indexOf(view);
        if (i === -1) {
            return;
        }
        var active = model.get('active');
        if (active === view.getGuid()) {
            model.set('active', null);
        }
        applications.splice(i, 1);
        model.set('applications', applications);
    },

    onActivateApplication: function (handler) {
        this.controlView.on('application:activate', handler);
    },

    onClosingApplication: function (handler) {
        this.controlView.on('application:closing', handler)
    },

    onCloseApplication: function (handler) {
        this.controlView.on('application:close', handler);
    },

    setApplications: function (applications) {
        this.set('applications', applications.slice());
    },

    setApplicationText: function (view) {
        var applications = this.controlModel.get('applications');

        if (applications.indexOf(view) === -1) {
            return;
        }

        this.controlModel.trigger('application:text', {
            key: view.getGuid(),
            text: view.getText()
        });


    }

});
var GlobalNavigationBarModel = ControlModel.extend({

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
        this.set('applications', []);
    }

});

var GlobalNavigationBarView = ControlView.extend({

    className: 'pl-global-navigation-bar',

    UI: {
        buttons: '.pl-gn-buttons'
    },

    template: InfinniUI.Template["controls/globalNavigationBar/template/template.tpl.html"],

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.listenTo(this.model, 'change:applications', this.onChangeApplicationsHandler);
        this.listenTo(this.model, 'change:active', this.onChangeActiveHandler);
        this.model.set('buttons', []);
        this.model.set('list', []);
    },

    onChangeApplicationsHandler: function () {
        //@TODO Обновить список приложений (кнопки выбора и список)
        var applications = this.model.get('applications');
        this.renderApplications();
    },

    onChangeActiveHandler: function () {
        var buttons = this.model.get('buttons');

        var active = this.model.get('active');

        var index = _.findIndex(buttons, function (button) {
            return button.getKey() == active;
        });

        var button;
        for (var i = 0, ln = buttons.length; i < ln; i = i + 1) {
            button = buttons[i];
            button.$el.toggleClass('pl-before-active', i + 1 === index);
            button.$el.toggleClass('pl-after-active', i === index + 1);
            button.$el.toggleClass('last', i === ln - 1);
        }
    },

    render: function () {

        this.$el.html(this.template({}));
        this.bindUIElements();

        this.renderApplications();
        return this;
    },

    renderApplications: function () {
        this.renderButtons();
        this.renderList();
    },

    renderButtons: function () {
        //@TODO Рендеринг список кнопок выбора приложений
        var applications = this.model.get('applications');

        var control = this;

        var buttons = this.model.get('buttons');

        _.forEach(buttons, function (button) {
            button.remove();
        });


        if (_.isEmpty(applications)) {
            return;
        }

        var active = this.model.get('active');


        buttons = _.map(applications, function (app){
            var button = new GlobalNavigationBarButtonView({
                key: app.getGuid(),
                text: app.getText() || app.getGuid(),
                active: app.getGuid() === active
            });

            button.listenTo(this.model, 'application:text', function (data) {
                if (app.getGuid() === data.key) {
                    this.setText(data.text);
                }
            });

            button.listenTo(this.model, 'change:active', function (model, active) {
                button.setActive(active);
            });

            this.listenTo(button, 'application:closing', function () {
                control.trigger('application:closing', app);
            });

            this.listenTo(button, 'application:activate', function () {
                control.trigger('application:activate', app);
            });




            button.onClick(this.onActivateApplicationHandler);
            //this.$el.append(button.render().$el);
            this.ui.buttons.append(button.render().$el);
            return button;
        }, this);

        this.model.set('buttons', buttons);

    },

    onActivateApplicationHandler: function (key) {
        var applications = this.model.get('applications');

        var app = _.find(applications, function (app) {
            return app.getGuid() === key;
        });

        if (typeof app !== 'undefined') {
            this.trigger('application:activate', app);
        }
    },


    renderList: function () {
        //@TODO Рендеринг выпадающего списка приложений
    }

});
var GridPanelControl = function () {
    _.superClass(GridPanelControl, this);
};

_.inherit(GridPanelControl, AbstractGridPanelControl);

_.extend(GridPanelControl.prototype, {
    createControlModel: function () {
        return new GridPanelModel();
    },

    createControlView: function (model) {
        return new GridPanelView({model: model});
    },

    getChildElements: function () {
        var rows = this.controlModel.getRows();
        var elements = [];
        for (var i = 0, ln = rows.length; i < ln; i = i + 1) {
            var cells = rows[i].getCells();
            for (var j = 0, ln2 = cells.length; j < ln2; j = j + 1) {
                Array.prototype.push.apply(elements, cells[j].getItems());
            }
        }

        return elements;
    }
});

var GridPanelModel = AbstractGridPanelModel.extend({
    defaults: _.defaults({
        horizontalAlignment: 'Stretch'
    }, AbstractGridPanelModel.prototype.defaults)
});
var GridPanelView = AbstractGridPanelView.extend({
    className: 'pl-grid-panel',

    templates: {
        row: _.template('<div class="pl-grid-row row"></div>'),
        cell: _.template('<div class="pl-grid-cell col-md-<%=colSpan%> col-xs-<%=colSpan%>"></div>')
    }
});
var ImageBoxControl = function () {
    _.superClass(ImageBoxControl, this);
};

_.inherit(ImageBoxControl, Control);

_.extend(ImageBoxControl.prototype, {
    createControlModel: function () {
        return new ImageBoxModel();
    },

    createControlView: function (model) {
        return new ImageBoxView({model: model});
    },

    onValueChanged: function(handler){
        this.controlModel.on('change:value', handler);
    },

    onUrlChanged: function (handler) {
        this.controlModel.on('change:url', handler);
    }
});

var ImageBoxModel = ControlModel.extend({
    defaults: _.defaults({
        value: null,
        readOnly: false,
        maxSize: 0
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});

var ImageBoxView = ControlView.extend({
    className: 'pl-image-box',

    template: InfinniUI.Template["controls/imageBox/template/imagebox.tpl.html"],

    UI: {
        input: 'input[type=file]',
        image: 'img',
        thumbnail: '.pl-thumbnail'
    },


    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:value', this.updateValueHandler);
        this.listenTo(this.model, 'change:readOnly', this.updateReadOnly);
        this.listenTo(this.model, 'change:acceptTypes', this.applyAcceptTypes);
        this.listenTo(this.model, 'change:url', this.onChangeUrlHandler);

        this.fileLoader = null;
    },

    render: function () {

        this.prerenderingActions();

        this.$el
            .html(this.template({}));

        this.bindUIElements();
        this.setPreviewUrl(this.model.get('url'));
        var self = this;

        this.ui.input.change(function (e) {
            if (this.files.length == 0) return;
            var file = this.files[0];
            self.readValue(file);
        });

        this.applyAcceptTypes();
        this.applyBlobData();

        this.postrenderingActions();
        this.updateReadOnly();
        return this;
    },

    readValue : function (file) {
        this.cancelLoadPreview();
        var maxSize = this.model.get('maxSize');
        var model = this.model;

        if(typeof maxSize !== 'undefined' && maxSize > 0 && file.size >= this.model.get('maxSize')){
            alert('размер выбранного файла больше максимального ' + file.size);
            return;
        }

        var blobData = InfinniUI.BlobUtils.createFromFile(file);
        model.set({value: blobData, file: file});
        this.loadPreview(file);
    },

    /**
     * @private
     * @description Отменяет активную загрузку изображения для предпросмотра
     */
    cancelLoadPreview: function () {
        if (this.fileLoader !== null && this.fileLoader.state() === 'pending') {
            //Если в данный момент идет загрузка выбранного файла - отменяем его
            this.fileLoader.reject();
        }
    },

    /**
     * @private
     * @description Загрузка выбранного для загрузки изображения для предпросмотра
     * @param file
     */
    loadPreview: function (file) {
        var model = this.model;
        var defer = $.Deferred();

        this.fileLoader = defer.promise();
        this.fileLoader
            .done(function (file, content) {
                model.set('url', content);
            })
            .fail(function (err) {
                console.log(err);
            });

        var reader = new FileReader();
        reader.onload = (function (file) {
            return function (evt) {

                defer.resolve(file, evt.target.result);
            };
        }(file));

        reader.onerror  = function (event) {
            defer.reject(event);
        };

        reader.readAsDataURL(file);
    },

    updateValueHandler: function(){

        if (!this.wasRendered) {
            return;
        }
        this.applyBlobData();
    },

    applyBlobData: function () {
        if (typeof value === 'undefined' || value === null) {
            //Файл не выбран. Очистить, если он был показан.
            return;
        }

        if(typeof value.Id !== 'undefined' || value.Id !== null){
            //Файл был загружен ранее, для отображения нужно запросить URL у binding
        }else{
            //Файл был загружен, для отображения надо обработать DataUrl

        }
    },

    applyAcceptTypes: function () {
        if (!this.wasRendered) {
            return;
        }
        var accept = this.model.get("acceptTypes");
        if(typeof accept !== 'undefined' && accept != null){
            this.ui.input.attr("accept", accept.join(','));
        }
    },

    updateReadOnly: function(){
        if(!this.wasRendered) {
            return;
        }

        this.ui.input.toggleClass('hidden', !!this.model.get('readOnly'));
        this.ui.thumbnail.toggleClass('thumbnail', !this.model.get('readOnly'));
    },

    onChangeUrlHandler: function (model, url) {
        this.setPreviewUrl(url);
    },

    setPreviewUrl: function (url) {
        if (!this.wasRendered) {
            return;
        }
        if (typeof url === 'string' && url.length > 0) {
            this.ui.image.attr('src', url);
        } else {
            var file = this.model.get('file');
            if(file && typeof file.name === 'string'){
                this.loadPreview(file);
            }else{
                this.ui.image.attr('src', null);
            }

        }
    }


});

var LabelControl = function () {
    _.superClass(LabelControl, this);
};

_.inherit(LabelControl, Control);

_.extend(LabelControl.prototype, {

    createControlModel: function () {
        return new LabelModel();
    },

    createControlView: function (model) {
        return new LabelView({model: model});
    }

}, controlValuePropertyMixin);
var LabelModel = ControlModel.extend({
    defaults: _.defaults({
        horizontalTextAlignment: 'Left',
        verticalAlignment: 'Top',
        foreground: 'Black',
        background: 'Transparent',
        textStyle: 'Body1',
        textWrapping: true
    }, ControlModel.prototype.defaults)
});
var LabelView = ControlView.extend({
    className: 'pl-label',

    template: InfinniUI.Template["controls/label/template/label.tpl.html"],

    UI: {
        control: 'label',
        container: 'div'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.initHorizontalTextAlignment();
        this.initUpdateLineCount();
        this.initTextWrapping();
        this.initForeground();
        this.initBackground();
        this.initTextStyle();
        this.initValue();
    },

    initValue: function () {
        this.listenTo(this.model, 'change:value', this.updateValue);
        this.listenTo(this.model, 'change:lineCount', this.updateValue);
        this.listenTo(this.model, 'change:text', this.updateValue);
        this.updateValue();
    },

    render: function () {
        this.prerenderingActions();

        this.$el
            .html(this.template({}));

        this.bindUIElements();
        this.updateBackground();
        this.updateForeground();
        this.updateTextStyle();
        this.updateValue();
        this.updateLineCount();
        this.updateTextWrapping();
        this.updateHorizontalAlignment();
        this.updateHorizontalTextAlignment();
        this.postrenderingActions();
        return this;
    },

    /**
     * @private
     * Установка значение Name у контейнера элемента
     */
    applyName: function () {
        this.$el.attr('data-name', this.model.get('name'));
    },

    /**
     * @private
     */
    updateValue: function () {
        var control, text;

        if(!this.wasRendered) {
            return;
        }

        control = this.ui.control;
        text = this.getTextLabel();

        //var lineCount = this.model.get('lineCount');

        control.attr('title', text);
        //this.$el.toggleClass('pl-label-oneline', lineCount === 1);

        //Сохраняем форматирование пробелами и экранируем <>
        //text = text.replace(/</g, '&lt;')
        //    .replace(/>/g, '&gt;');
        //
        //
        //
        //var line = 0;
        //if (typeof lineCount === 'undefined' || lineCount === null) {
        //    text = text.replace(/\n/g, '<br>');
        //} else {
        //    text = text.replace(/\n/g, function (char) {
        //        line++;
        //        return line < lineCount ? '<br>' : char;
        //    });
        //}
        //text = text.replace(/\s/g, '&nbsp;');
        control.text(text);
    },

    /**
     * @private
     * Возвращает текст для контрола.
     * @returns {String}
     */
    getTextLabel: function () {
        var text = this.model.get('value');
        var format = this.model.get('format');

        if (typeof text !== 'undefined' && text !== null) {
            if (typeof format !== 'undefined' && format !== null) {
                text = format.format(text);
            }
        }else{
            text = this.model.get('text');
            if (typeof text === 'undefined' || text == null) {
                text = '';
            }
        }

        return text;
    }
});

_.extend(LabelView.prototype,
    horizontalTextAlignmentPropertyMixin,
    foregroundPropertyMixin,
    backgroundPropertyMixin,
    textStylePropertyMixin,
    lineCountPropertyMixin,
    textWrappingPropertyMixin
);
var LinkLabelControl = function () {
    _.superClass(LinkLabelControl, this);
};

_.inherit(LinkLabelControl, Control);

_.extend(LinkLabelControl.prototype, {

    createControlModel: function () {
        return new LinkLabelModel();
    },

    createControlView: function (model) {
        return new LinkLabelView({model: model});
    },

    onClick: function(handler){
        this.controlView.onClick(handler);
    }

}, controlValuePropertyMixin);
var LinkLabelModel = ControlModel.extend({
    defaults: _.defaults({
        horizontalTextAlignment: 'Left'
    }, ControlModel.prototype.defaults)
});
var LinkLabelView = ControlView.extend({
    className: 'pl-link-label TextWrapping',

    template: InfinniUI.Template["controls/linkLabel/template/linkLabel.tpl.html"],

    UI: {
        link: 'a',
        label: 'label',
        container: 'div'
    },

    events: {
        'click a': 'onClickHandler'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.updateLinkText = _.debounce(this._updateLinkText, 50);
        this.initModelHandlers();
    },

    updateReferenceHandler: function (model, value) {
        this.updateReference();
    },

    updateReference: function () {
        if(!this.wasRendered){
            return;
        }
        var href = this.model.get('reference');
        if(href == null || href == undefined || href == ''){
            this.ui.link.prop('href', 'javascript:;');
        }else{
            this.ui.link.prop('href', href);
        }
    },

    initModelHandlers: function () {
        this.listenTo(this.model, 'change:value', this.updateLinkText);
        this.listenTo(this.model, 'change:reference', this.updateReferenceHandler);
        this.listenTo(this.model, 'change:textTrimming', this.updateLinkText);
        //this.listenTo(this.model, 'change:textWrapping', this.updateLinkText);
        this.initHorizontalAlignment();
        this.initHorizontalTextAlignment();
        this.initForeground();
        this.initBackground();
        this.initTextStyle();
        this.initUpdateLineCount();
        this.initTextWrapping();
    },

    render: function () {
        this.prerenderingActions();

        this.$el
            .html(this.template({}));

        this.bindUIElements();
        this.updateLineCount();
        this.updateTextWrapping();
        this.updateLinkText();
        this.updateHorizontalTextAlignment();
        this.updateBackground();
        this.updateForeground();
        this.updateTextStyle();

        this.updateReference();

        this.postrenderingActions();
        return this;
    },

    /**
     * @private
     */
    _updateLinkText: function () {
        var text;

        if(!this.wasRendered){
            return;
        }

        var link = this.ui.link;
        var $container = this.ui.container;

        var model = this.model;
        var textTrimming = this.model.get('textTrimming');
        //var textWrapping = this.model.get('textWrapping');

        text = this.getTextLabel();

        //this.$el.toggleClass('TextWrapping', textWrapping);
        //this.$el.toggleClass('NoTextWrapping', !textWrapping);


        this.model.set('lineHeight', this.ui.label.innerHeight());

        /*
        @TODO Режим ellipsis не применяем т.к.
        setTimeout(function () {
            var txt = '';
            var txt2 = '';
            var ellipsis = ' ...';
            var lineCount = model.get('lineCount');

            if (textWrapping) {
                if (typeof lineCount === 'undefined' || lineCount === null) {
                    link.text(text);
                    return;
                }
            } else {
                if (!textTrimming) {
                    link.text(text);
                    return;
                }
            }

            var chars = [" ", "\n"];
            var fromPosition = 0;

            var maxWidth = $container.innerWidth();
            var lineHeight = model.get('lineHeight');

            var pos;
            while(fromPosition < text.length) {
                pos = Math.min.apply(Math, _.map(chars, function (char) {
                    var index = text.indexOf(char, fromPosition);
                    return index === -1 ? text.length : index;
                }));

                txt2 = text.substring(0, pos);

                if (textTrimming && pos < text.length) {
                    txt2 = txt2 + ellipsis;
                }
                link.text(txt2);

                if (textWrapping) {
                    if (link.innerHeight() > lineHeight * lineCount) {
                        break;
                    } else {
                        txt = txt2;
                    }
                } else {
                    if (link.innerWidth() > maxWidth) {
                        break;
                    } else {
                        txt = txt2;
                    }
                }
                fromPosition = pos + 1;
            }

            link.text(txt);
        }, 150);//Trimming применяется с задержкой
        */

        link.text(text);//Устанавливаем текст, Trimming примениться позже (см. setTimeOut выше)
        link.attr('title', text);

    },

    /**
     * @private
     * Возвращает текст для контрола.
     * @returns {String}
     */
    getTextLabel: function () {
        var text = this.model.get('value');
        var format = this.model.get('format');

        if (typeof text !== 'undefined' && text !== null) {
            if (typeof format !== 'undefined' && format !== null) {
                text = format.format(text);
            }
        }else{
            text = this.model.get('text');
            if (typeof text === 'undefined' || text == null) {
                text = '';
            }
        }

        return text;
    },

    /**
     * @description Обработчик щелчка. Если один из обработчиков вернул false - переход по ссылке отменяется
     * @private
     * @param event
     */
    onClickHandler: function (event) {
        var cancel = false;

        var enabled = this.model.get('enabled');

        if (!enabled) {
            event.preventDefault();
            return;
        }

        this.callEventHandler('OnClick', function (response) {
            if (response === false) {
                cancel = true;
            }
        });

        if (cancel) {
            event.preventDefault();
        }
    }

});

_.extend(LinkLabelView.prototype,
    foregroundPropertyMixin,
    backgroundPropertyMixin,
    textStylePropertyMixin,
    lineCountPropertyMixin,
    textWrappingPropertyMixin,
    horizontalTextAlignmentPropertyMixin
);

var MenuBarControl = function () {
    _.superClass(MenuBarControl, this);
};

_.inherit(MenuBarControl, Control);

_.extend(MenuBarControl.prototype, {

    createControlModel: function () {
        return new MenuBarModel();
    },

    createControlView: function (model) {
        return new MenuBarView({model: model});
    },

    setItems: function (items) {
        this.controlModel.setItems(items);
    },

    getItems: function () {
        return this.controlModel.getItems();
    },

    getChildElements: function () {
        return this.getItems();
    },

    setMenuList: function (list) {
        this.controlModel.set('menus', list);
    },

    getMenuList: function () {
        return this.controlModel.get('menus');
    },

    setMenuName: function (value) {
        this.controlModel.set('menuName', value);
    },

    getMenuName: function () {
        return this.controlModel.get('menuName');
    },

    setConfigId: function (value) {
        this.controlModel.set('configId', value);
    },

    getConfigId: function () {
        return this.controlModel.get('configId');
    },

    onChangeConfigId: function (handler) {
        this.controlModel.on('change:configId', handler);
    },

    onChangeMenuName: function (handler) {
        this.controlModel.on('change:menuName', handler);
    },

    onChangeMenuList: function (handler) {
        this.controlModel.on('change:menus', handler);
    }

});
var MenuBarModel = ControlModel.extend({
    defaults: _.defaults({
        items: null,
        menus: null,
        horizontalAlignment: null,
        verticalAlignment: 'Stretch'
    }, ControlModel.prototype.defaults),

    initialize: function () {
        this.set('items', []);
        ControlModel.prototype.initialize.apply(this);

    },

    setItems: function (items) {
        this.set('items', items);
        //this.trigger('itemsIsChange', this.get('items'));
    },

    getItems: function () {
        return this.get('items');
    }
});
var MenuBarView = ControlView.extend({
    tagName: 'div',
    className: 'pl-menu page-sidebar',

    templateMenu: _.template('<ul class="sidebar-menu"></ul>'),
    templateListContainer: _.template('<div class="sub-menu"><ul></ul></div>'),
    templateItemDefault: _.template('<li><a href="javascript:;"><i class="fa fa-<%=image%>"></i><span class="title"></span></a></li>'),
    templateItemRight: _.template('<li><a href="javascript:;"><span class="title"></span><i class="fa fa-file-o"></i></a></li>'),
    template: {
        menuListItem: _.template('<option data-config="<%=ConfigId%>" value="<%=ConfigId%>/<%=Name%>" data-name="<%=Name%>"><%=Caption%></option>')
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:items', this.rerender);
        this.listenTo(this.model, 'change:menus', this.renderMenuList);
        this.listenTo(this.model, 'change:menuName', this.selectCurrentMenu);
        this.listenTo(this.model, 'change:configId', this.selectCurrentMenu);
    },

    UI: {
        menuListContainer: '#menu-configs-container',
        menuList: '#menu-configs'
    },

    events: {
        'change #menu-configs': 'onSelectChangeHandler'
    },

    render: function () {
        this.prerenderingActions();

        this.$el.empty();
        this.menuStrategy();

        this.$el.html(this.templateMenu({}));
        this.$el.find('.sidebar-menu').append('<li id="menu-configs-container" class="hidden"><select id="menu-configs" style="width: 100%; height: 30px; padding: 0 10px;"></select></li>');

        this.bindUIElements();

        //this.$el.find('#menu-configs').children().remove();
        //this.arr = this.getMenuSelect();
        this.renderMenuList();
        this.renderCompositeItems(this.model.getItems(), this.$el.find('.sidebar-menu'));
        this.postrenderingActions(false);
        return this;
    },

    onSelectChangeHandler: function(e){
        var selectedItem = $('#menu-configs').find('option:selected');
        var configId = selectedItem.data('config');//$('#menu-configs').val();
        var menuName = selectedItem.data('name');

        //localStorage.setItem('menuName', menuName);
        this.model.set('menuName', menuName);

        $('.sidebar-menu').children('li').not(':first').remove();

        if (configId != '') {
            //location.href = location.href.replace(/#?\S*$/, '#/' + configId);
            this.model.set('configId', configId);
            location.reload(true);
        }
    },

    renderMenuList: function () {
        if (typeof this.ui.menuListContainer === 'undefined' || this.ui.menuListContainer === null) {
            return;
        }

        var menuList = this.model.get('menus');
        var hidden = _.isEmpty(menuList) || (menuList.length === 1 && !_.isEmpty(this.model.getItems())) ;

        this.ui.menuListContainer.toggleClass('hidden', hidden);

        if (hidden) {
            localStorage.removeItem('menuName');
            return;
        }

        var items = _.map(menuList, this.template.menuListItem);

        this.ui.menuList.html(items);
        this.selectCurrentMenu();
        //var model = this.model;

        //var self = this;
        //var configId = model.get('configId');
        //var menuName = model.get('menuName');
        //_.forEach(items, function(item){
        //    //if($(item).data('config') == location.hash.substr(2) && $(item).data('name') == localStorage.getItem('menuName')) {
        //
        //    if($(item).data('config') == configId && $(item).data('name') == menuName) {
        //        self.ui.menuList.val([configId, menuName].join('/'));
        //    }
        //})
    },

    selectCurrentMenu: function () {
        if(!this.wasRendered) {
            return;
        }
        var model = this.model;
        var configId = model.get('configId');
        var menuName = model.get('menuName');
        this.ui.menuList.val([configId, menuName].join('/'));
    },

    menuStrategy: function(){
        if(this.model.get('horizontalAlignment')) {
            this.$el.addClass('horizontal');
            return this.model.get('horizontalAlignment');
        }else{
            this.$el.addClass('vertical');
            return this.model.get('verticalAlignment');
        }
    },

    renderCompositeItems: function (items, $container) {
        _.each(items, function(item){
            var $item = $(this.templateItemDefault({image: item.Image || 'file'}));
            $item.find('.title').append(item.Text);
            $item.find('.title').attr('title', item.Text);

            if (item.Action || !item.Items) {
                this.setAction($item, item.Action);
            } else {
                $item.find('a').parent().addClass('sub-menu-container');
                $item.find('a').append('<span class="arrow"></span>');
            }

            if (item.Items !== undefined && item.Items.length !== 0) {
                $item.append($(this.templateListContainer({})));
                this.renderCompositeItems(item.Items, $item.find('ul'));
            }
            $container.append($item);
        }, this);

        this.mouseHoverHandler($container);
    },

    mouseHoverHandler: function($container){
        var self = this;
        $container.find('.sub-menu-container').hover(function(){
            var subMenu = $(this).children('.sub-menu');

            subMenu.stop().fadeIn(100);

            //добавление стрелок верх, вниз, при заполнении items
            var odds = 0;
            if($(subMenu).children('ul').find('.sub-scroll').length == 0) {
                if ($(subMenu).children('ul').height() > $(document).height() - 92) {
                    if (parseInt($(subMenu).children('ul').css('margin-top')) >= 0) {
                        $(subMenu).find('.sub-scroll').remove();
                        $(subMenu).append('<div class="sub-scroll down"><i></i></div>');
                    } else {
                        $(subMenu).find('.sub-scroll').remove();
                        $(subMenu).append('<div class="sub-scroll top"><i></i></div>');
                    }
                    odds = (parseInt($(subMenu).children('ul').height()) - parseInt($(document).height())+100);
                }
            }

            $(subMenu).bind('mousewheel', function(event) {
                event.preventDefault();
                var $subscroll = $('.sub-scroll');

                if (event.originalEvent.wheelDelta >= 0) {
                    if(parseInt($(subMenu).children('ul').css('margin-top')) != 0) {
                        $(subMenu).children('ul').stop().animate({
                            marginTop: 0
                        }, 200, function () {
                            $subscroll.fadeOut(100, function () {
                                $(this).removeClass('top').addClass('down');
                                $(this).fadeIn(200)
                            });
                        });
                    }
                }else{
                    var razn = (odds < 0) ? odds : -odds;
                    if(parseInt($(subMenu).children('ul').css('margin-top')) != razn) {
                        $(subMenu).children('ul').stop().animate({
                            marginTop: razn
                        }, 200, function () {
                            $subscroll.fadeOut(100, function () {
                                $(this).removeClass('down').addClass('top');
                                $(this).fadeIn(200)
                            });
                        });
                    }
                }
            });

            $('.sub-scroll').on('mouseenter', function() {
                var self = this;
                if ($(this).hasClass('down')) {
                    $(subMenu).children('ul').stop().animate({
                        marginTop: (odds < 0) ? odds : -odds
                    }, 200, function () {
                        $(self).fadeOut(100, function () {
                            $(self).removeClass('down').addClass('top');
                            $(self).fadeIn(200)
                        });
                    });
                }else{
                    $(subMenu).children('ul').stop().animate({
                        marginTop: 0
                    }, 200, function(){
                        $(self).fadeOut(100,function(){
                            $(self).removeClass('top').addClass('down');
                            $(self).fadeIn(200)
                        });
                    });
                }
            });
            //

            //fix при вылазки меню за пределы экрана
            if(self.model.get('horizontalAlignment')) { //При горизонтальном меню, не дает вылезти за рамки
                if (subMenu.offset().left + subMenu.width() > $(document).width()) {
                    subMenu.addClass('right');
                }else{
                    //TODO: при ресайзе окна, удалять right
                    //subMenu.removeClass('right');
                }
            }
            //

        },function(){
            var subMenu = $(this).children('.sub-menu');

            if(!self.model.get('horizontalAlignment')){
                subMenu.stop().fadeOut(200); //при вертикальном меню, небольшая задержка
            }else{
                subMenu.stop().fadeOut(100); //минимальная задержка при горизонтальном меню
            }
        });
    },

    setAction: function($item, action) {
        $item.click(function () {
            action.execute();
        });
    }
});
var NumericBoxControl = function () {
    _.superClass(NumericBoxControl, this);
};

_.inherit(NumericBoxControl, Control);

_.extend(NumericBoxControl.prototype, {

    createControlModel: function () {
        return new NumericBoxModel();
    },

    createControlView: function (model) {
        return new NumericBoxView({model: model});
    }
},
    controlValuePropertyMixin,
    baseTextControlMixin
);
var NumericBoxModel = ControlModel.extend({
    defaults: _.defaults({
        value: 0,
        readOnly: false,
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        increment: 1,
        foreground: 'Black',
        background: 'Transparent',
        textStyle: 'Body1'
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});
var NumericBoxView = ControlView.extend({
    className: 'pl-numeric-box',

    template: {
        default: InfinniUI.Template["controls/numericBox/template/numericbox.tpl.html"],
        label: InfinniUI.Template["controls/numericBox/template/label-numericbox.tpl.html"]
    },
    //template: InfinniUI.Template["controls/numericBox/template/numericbox.tpl.html"],

    UI: {
        control: '.pl-spin-control',
        input: '.pl-spin-input',
        editor: '.pl-control-editor',
        hintText: '.pl-control-hint-text',
        validationMessage: '.pl-control-validation-message',
        buttonMin: '.nm-min',
        buttonMax: '.nm-max'
    },

    events: {
        //Обработчик для показа поля редактирования с использованием маски ввода
        'focus .pl-spin-input': 'onFocusControlHandler',
        'focusin .pl-control-editor' : 'onFocusInDebounceHandler',
        'focusout .pl-control-editor' : 'onFocusOutDebounceHandler',
        'click .nm-min' : 'onClickDecrementHandler',
        'click .nm-max' : 'onClickIncrementHandler'
    },

    onFocusInHandler: function (event) {
        this.callEventHandler('OnGotFocus');
    },

    onFocusOutHandler: function (event) {
        this.callEventHandler('OnLostFocus');
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.initHorizontalTextAlignment();
        this.initForeground();
        this.initBackground();
        this.initTextStyle();
        this.initHintText();
        this.initErrorText();

        this.onFocusInDebounceHandler = _.debounce(this.onFocusInHandler, 100);
        this.onFocusOutDebounceHandler = _.debounce(this.onFocusOutHandler, 100);

        this.listenTo(this.model, 'change:value', this.updateValue);
        this.listenTo(this.model, 'change:validationMessage', this.updateValidation);
        this.listenTo(this.model, 'change:validationState', this.updateValidation);
        this.listenTo(this.model, 'change:minValue', this.updateMinValue);
        this.listenTo(this.model, 'change:maxValue', this.updateMaxValue);
        this.listenTo(this.model, 'change:increment', this.updateIncrement);
        this.listenTo(this.model, 'change:enabled', this.updateEnabled);

    },

    render: function () {
        this.prerenderingActions();

        var labelText = this.model.get('labelText');
        var style = typeof labelText === 'undefined' || labelText === null ? 'default' : 'label';

        var template = this.template[style];

        this.$el.html(template({
            labelText: labelText
        }));

        this.bindUIElements();
        this.initEditor();

        this.updateValue();
        this.updateMaxValue();
        this.updateMinValue();
        this.updateIncrement();
        this.updateEnabled();

        this.updateBackground();
        this.updateForeground();
        this.updateTextStyle();
        this.updateErrorText();
        this.updateValidation(); //При повторном рендере, принудительно выставляем Error текст
        this.updateHintText();
        this.updateHorizontalTextAlignment();

        this.postrenderingActions();
        return this;
    },

    updateEnabled: function () {
        if (this.wasRendered) {
            var isEnabled = this.model.get('enabled');
            this.ui.input.prop('disabled', !isEnabled);
            this.$el.find('button').prop('disabled', !isEnabled);
            (!isEnabled) ? this.$el.addClass('disabled') : this.$el.removeClass('disabled');
        }
    },

    DecrementLengthAfterDot: function(increment, value){
        var lengthAfterDot = increment.toString().split('.')[1];

        value = parseFloat(value) - parseFloat(increment);

        if(lengthAfterDot){
            value = value.toFixed(lengthAfterDot.length);
        }
        return value;
    },

    IncrementLengthAfterDot: function(increment, value){
        var lengthAfterDot = increment.toString().split('.')[1];

        value = parseFloat(value) + parseFloat(increment);

        if(lengthAfterDot){
            value = value.toFixed(lengthAfterDot.length);
        }
        return value;
    },

    onClickDecrementHandler: function(){
        var value = this.model.get('value');
        var increment = this.model.get('increment');

        value = this.DecrementLengthAfterDot(increment, value);

        this.model.set('value', value);
    },

    onClickIncrementHandler: function(){
        var value = this.model.get('value');
        var increment = this.model.get('increment');

        value = this.IncrementLengthAfterDot(increment, value);

        this.model.set('value', value);
    },

    updateValue: function () {
        var value = this.model.get('value');
        var min = this.model.get('minValue');
        var max = this.model.get('maxValue');
        var format = this.model.get('format');
        var text;

        if(value == 'undefined' || isNaN(value) || value == null){
            value = min;
        }

        if(typeof max !== 'undefined' && value  > max) {
            value = max;
        }
        if(typeof min !== 'undefined' && value < min){
            value = min;
        }

        if (typeof value !== 'undefined') {
            if (typeof format !== 'undefined' && format !== null) {
                text = format.format(value);
            } else {
                text = value;
            }
        }

        if(this.model.get('value') != value){
            this.model.set('value', value);
        }


        if (this.wasRendered) {
            this.ui.input.val(text);
        }
    },

    updateIncrement: function () {
        if (this.wasRendered) {
            var increment = this.model.get('increment');

            if (increment === 0){
                increment = 1;
            }

            this.model.set('increment', increment);
        }
    },

    updateMinValue: function () {
        if (this.wasRendered) {
            var min = this.model.get('minValue');
            var value = this.model.get('value');

            if(value < min){
                value = min;
            }

            this.model.set('value', value);
        }
    },

    updateMaxValue: function () {
        if (this.wasRendered) {
            var max = this.model.get('maxValue');
            var value = this.model.get('value');

            if(value > max){
                value = max;
            }

            this.model.set('value', value);
        }
    },

    /**
     * Рендеринг редактора значений
     */
    initEditor: function () {
        //Создание редактора значений
        var editor = this.renderEditor({
            el: this.ui.editor
        });

    },

    onEditorConvertValue: function (value) {
        if (value === '' || value === null || typeof value === 'undefined') {
            return undefined;
        }
        return parseInt(value, 10);
    },


    updateValidation: function () {
        var model = this.model;

        var state = model.get('validationState');
        var message = model.get('validationMessage');

        var hideMessage = _.isEmpty(message) || ['error', 'warning'].indexOf(state) === -1;

        this.ui.validationMessage.toggleClass('hidden', hideMessage);
        this.ui.validationMessage.text(message);

        //state = success, error, warning
    },

    /**
     * Обработчик проверки значения из поля ввода с маской
     * @param value
     * @returns {boolean}
     */
    onEditorValidate: function (value) {
        if (typeof value === 'undefined' || value === null) {
            return true;
        }

        var min = this.model.get('minValue');
        var max = this.model.get('maxValue');

        if (typeof min !== 'undefined' && min !== null && value < min) {
            return false;
        }

        if (typeof max !== 'undefined' && max !== null && value > max) {
            return false;
        }

        return true;
    }



});

_.extend(NumericBoxView.prototype,
    textEditorMixin,
    horizontalTextAlignmentPropertyMixin,
    foregroundPropertyMixin,
    backgroundPropertyMixin,
    textStylePropertyMixin,
    hintTextPropertyMixin,
    errorTextPropertyMixin,
    labelTextPropertyMixin
);
var PanelControl = function () {
    _.superClass(PanelControl, this);
};

_.inherit(PanelControl, Control);

_.extend(PanelControl.prototype, {
    createControlModel: function () {
        return new PanelModel();
    },

    createControlView: function (model) {
        return new PanelView({model: model});
    },

    setText: function (value) {
        this.controlModel.set('text', value);
    },

    addItem: function (item) {
        this.controlModel.get('items').push(item);
    },

    onExpanded: function (handler) {
        this.controlModel.on('change:collapsed', function (model) {
            if (model.get('collapsed')) {
                handler();
            }
        });
    },

    onCollapsed: function (handler) {
        this.controlModel.on('change:collapsed', function (model) {
            if (!model.get('collapsed')) {
                handler();
            }
        });
    }
});

//TODO: copy-paste from stackPanel
var PanelModel = Backbone.Model.extend({
    defaults: _.defaults({
        collapsible: false,
        collapsed: true,
        items: null
    }, ControlModel.prototype.defaults),

    initialize: function () {
        this.set('items', [])
    },

    getItems: function () {
        return this.get('items');
    }
});

var PanelView = ControlView.extend({
    className: 'pl-panel',

    UI: {
        caption: '.caption'
    },

    events: {
        'click .collapse': 'onButtonCollapseClickHandler',
        'click .expand': 'onButtonExpandClickHandler'
    },

    template: InfinniUI.Template["controls/panel/template/panel.tpl.html"],

    templateCollapse: _.template('<div class="tools"><a href="javascript:;" class="collapse"></a></div>'),

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.isFirstCollapse = true;
    },

    updateText: function () {
        if (!this.wasRendered) {
            return;
        }

        this.ui.caption.text(this.model.get('text'));
    },

    render: function () {
        this.prerenderingActions();

        var $wrap = $(this.template(this.model.toJSON()));

        this.$el
            .empty()
            .append($wrap);
        this.bindUIElements();
        var $body = this.$el.find('.portlet-body .items');
        _.each(this.model.getItems(), function (item) {
            $body.append(item.render());
        });

        if (this.model.get('collapsible')) {
            $wrap.children('.portlet-title').append(this.templateCollapse({}));
        }

        this.onCollapsedHandler(this.model.get('collapsed'));

        this.postrenderingActions();
        return this;
    },

    onButtonCollapseClickHandler: function (e) {
        var parentsEl = $(e.target).parentsUntil(this.$el);

        if ($(e.target).hasClass('collapse') && parentsEl.length < 4) {
            this.model.set('collapsed', false);
            this.onCollapsedHandler(this.model.get('collapsed'));
        }
    },

    onButtonExpandClickHandler: function (e) {
        var parentsEl = $(e.target).parentsUntil(this.$el);

        if ($(e.target).hasClass('expand') && parentsEl.length < 4) {
            this.model.set('collapsed', true);
            this.onCollapsedHandler(this.model.get('collapsed'));
        }
    },

    onCollapsedHandler: function (collapsed) {
        if (!collapsed) {
            this.$el.find('.collapse').removeClass('collapse').addClass('expand');
            if (this.isFirstCollapse) {
                this.$el.find('.portlet-body').css('display', 'none');
            } else {
                this.$el.find('.portlet-body').slideUp(200);
            }

            this.trigger('onExpanded', this.model.get('collapsed'));
        } else {
            this.$el.find('.expand').removeClass('expand').addClass('collapse');
            this.$el.find('.portlet-body').slideDown(200);
            this.isFirstCollapse = false;

            this.trigger('onCollapsed', this.model.get('collapsed'));
        }
    }
});


//
///**
// * @constructor
// */
//function PopupButton(){
//
//    var $element = $(InfinniUI.Template["controls/popupButton/template/popupbutton.tpl.html"]());
//
//    var _action = null;
//
//    var items = [];
//
//    this.render = function(){
//
//        $element.find('li').detach();
//        for(var i = 0 ; i < items.length ; i++){
//
//            var $el = items[i].render();
//            $element.find(".dropdown-menu").append($('<li></li>').append($el));
//        };
//
//        return $element;
//    }
//
//    this.addItem = function(item){
//        items.push(item);
//        this.render();
//    }
//
//    this.removeItem = function(element){
//        items.splice(items.indexOf(element),1);
//        this.render();
//    }
//
//    this.getItems = function(){
//        return items;
//    }
//
//    this.getItem = function(name){
//        for(var i = 0 ; i < items.length; i++){
//            if(items[i].getName() === name) return items[i];
//        }
//        return null;
//    }
//
//    this.setText = function(text){
//        $element.find('.pl-popup-btn-main').text(text);
//    }
//
//    this.getText = function(){
//        return $element.find('.pl-popup-btn-main').text();
//    }
//
//    this.setVisible = function(visibility){
//        if(visibility === undefined) return;
//
//        if(!visibility){
//            $element.addClass('display-hide');
//        }
//        else{
//            $element.removeClass('display-hide');
//        }
//    }
//
//    this.getVisible = function(){
//        return $element.hasClass('display-hide');
//    }
//
//
//    this.getAction = function () {
//        return _action;
//    }
//
//    this.setAction = function (action) {
//        var self = this;
//        _action = action;
//        $element.find('.pl-popup-btn-main').off('click.ACTION');
//        $element.find('.pl-popup-btn-main').on('click.ACTION',function(){
//            if(self.getAction()!=null)self.getAction().execute();
//        });
//
//    }
//
//    this.click = function () {
//        $element.find('.pl-popup-btn-main').click();
//    }
//
//    this.onClick = function (handler) {
//        $element.find('.pl-popup-btn-main').click(handler);
//    }
//
//    this.setHorizontalAlignment = function(){
//        //todo add alignment
//    }
//
//    this.setVerticalAlignment = function () {
//
//    }
//
//    this.setName = function () {
//
//    }
//
//    this.getName = function () {
//
//    };
//
//    this.setEnabled = function () {
//
//    }
//
//    this.setStyle = function () {
//
//    }
//
//    this.setImage = function () {
//
//    }
//}
//

//function PopupButtonBuilder() {
//    this.build = function (builder, parent, metadata) {
//        //debugger
//        var buttonBuilder = new ButtonBuilder(PopupButton);
//        var popupButton = buttonBuilder.build(builder, parent, metadata);
//        this.initScriptsHandlers(parent, metadata, popupButton);
//
//        _.each(metadata.Items, function (metadataItem) {
//            popupButton.addItem(builder.build(parent, metadataItem));
//        });
//
//        return popupButton;
//    };
//
//    this.initScriptsHandlers = function(parent, metadata, popupButton){
//        //Скриптовые обработчики на события
//        if (parent && metadata.OnClick){
//            popupButton.onClick(function() {
//                new ScriptExecutor(parent).executeScript(metadata.OnClick.Name);
//            });
//        }
//    };
//}

var PopupButtonControl = function () {
    _.superClass(PopupButtonControl, this);
};

_.inherit(PopupButtonControl, ButtonControl);

_.extend(PopupButtonControl.prototype, {
    createControlModel: function () {
        return new PopupButtonModel();
    },

    createControlView: function (model) {
        return new PopupButtonView({model: model});
    },

    getItems: function () {
        return this.controlModel.get('items');
    },

    getItem: function (name) {
        var item = _.find(this.getItems(), function (data) {
            return data.getName() === name;
        });

        if (typeof item === 'undefined') {
            item = null;
        }
        return item;
    },

    addItem: function(item){
        var items = this.getItems();
        items.push(item);
        this.controlModel.set('items', items);
    },

    removeItem: function (item) {
        var items = this.controlModel.get('items');
        var i = items.indexOf(item);

        if (i > -1) {
            items.splice(i, 1);
            this.controlModel.set('items', items);
        }
    },

    onClick: function(handler){
        if (typeof handler === 'function') {
            this.controlModel.set('useDefaultAction', true);
            this.controlView.on('onClick', handler);
        }
    }


});
var PopupButtonModel = Backbone.Model.extend({
    defaults: _.defaults({
        useDefaultAction: false
    }, ControlModel.prototype.defaults),

    initialize: function () {
        this.set('items', []);
    }
});


var PopupButtonView = ControlView.extend({
    className: 'pl-popup-button',

    UI: {
        caption: '.caption',
        items: '.dropdown-menu',
        button: '.pl-popup-btn-main',
        toggle: '.pl-popup-btn-toggle'
    },

    events: {
        'click .pl-popup-btn-main': 'onClickHandler'
    },

    template: InfinniUI.Template["controls/popupButton/template/popupbutton.tpl.html"],

    templateItem: InfinniUI.Template["controls/popupButton/template/popupbuttonitem.tpl.html"],

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:items', this.onChangeItemsHandler);
        this.listenTo(this.model, 'change:text', this.onChangeTextHandler);
        this.listenTo(this.model, 'change:useDefaultAction', this.onChangeUseDefaultAction);
        this.listenTo(this.model, 'change:enabled', this.updateEnabled);
    },

    render: function () {
        this.prerenderingActions();

        this.$el.html(this.template({}));
        this.bindUIElements();

        this.onChangeTextHandler();
        this.updateEnabled();
        this.renderItems();

        this.postrenderingActions();
        return this;
    },

    onChangeItemsHandler: function () {
        this.rerender();
    },

    onChangeTextHandler: function () {
        if (!this.wasRendered) {
            return;
        }

        var useDefaultAction = this.model.get('useDefaultAction');
        var text = this.model.get('text');
        this.ui.button.toggleClass('hidden', !useDefaultAction);
        this.ui.button.text(text);
        this.ui.toggle.text(useDefaultAction ? '' : text);

    },

    renderItems: function () {
        var items = this.model.get('items');
        var wrap = this.templateItem();
        _.each(items, function (item) {
            var $item = item.render();
            this.ui.items.append($item);
            $item.wrap(wrap);
        }, this);

    },

    onClickHandler: function(){
        this.trigger('onClick');
    },

    onChangeUseDefaultAction: function () {
        this.onChangeTextHandler();
    },

    updateEnabled: function () {
        if (!this.wasRendered) {
            return;
        }
        var enabled = this.model.get('enabled');
        this.ui.button.prop('disabled', !enabled);
        this.ui.toggle.prop('disabled', !enabled);
    }


});
var RadioGroupControl = function () {
    _.superClass(RadioGroupControl, this);
};

_.inherit(RadioGroupControl, Control);

_.extend(RadioGroupControl.prototype, {

    createControlModel: function () {
        return new RadioGroupModel();
    },

    createControlView: function (model) {
        return new RadioGroupView({model: model});
    }

}, controlValuePropertyMixin);
var RadioGroupItemModel = Backbone.Model.extend({

});

var RadioGroupItemView = Backbone.View.extend({

    className: "pl-radio-group-item",

    events: {
        "click": "onClickHandler"
    },

    UI: {
        radio: 'input',
        label: '.pl-radio-group-label'
    },

    template: InfinniUI.Template["controls/radioGroup/template/item.text.tpl.html"],

    initialize: function (options) {
        this.model = new RadioGroupItemModel();
        this.model.set('item', options.item);
        this.model.set('index', options.index);
        this.model.set('readOnly', options.readOnly);
        this.model.set('enabled', options.enabled);

        this.model.set('name', _.isEmpty(options.name) ? guid() : options.name);

        this.on('check', this.onCheckHandler);
        this.on('toggle', this.onToggleHandler);
        this.on('readOnly', this.onReadOnlyHandler);
        this.on('enabled', this.onEnabledHandler);

        this.on('change:readOnly', this.updateEnabled);
        this.on('change:enabled', this.updateEnabled);
    },

    getIsAvailable: function () {
        return !this.model.get('readOnly') && this.model.get('enabled');
    },

    updateEnabled: function () {
        this.ui.radio.prop('disabled', !this.getIsAvailable());
    },

    onReadOnlyHandler: function (readOnly) {
        this.model.set('readOnly', readOnly);
    },

    onEnabledHandler: function (enabled) {
        this.model.set('enabled', enabled);
    },

    render: function () {
        var item = this.model.get('item');
        var index = this.model.get('index');
        this.$el.html(this.template({name: this.model.get('name')}));
        this.bindUIElements();

        this.updateEnabled();
        this.ui.radio.uniform();
        this.ui.label
            .empty()
            .append(this.renderStrategy.render(item, index));
        return this;
    },

    update: function () {
        $.uniform.update(this.ui.radio);
    },

    setRenderStrategy: function (strategy) {
        this.renderStrategy = strategy;
    },

    onClickHandler: function () {
        if (this.getIsAvailable()) {
            this.trigger('check', this.model.get('item'), this.model.get('index'));
        }
    },

    checkItem: function (checked) {
        if (typeof checked === 'undefined') {
            checked = true;
        }

        this.ui.radio.prop('checked', checked);
        this.update();
    },

    onCheckHandler: function () {
        this.checkItem(true);
    },

    onToggleHandler: function (item) {
        var checked = _.isEqual(item, this.model.get('item'));
        this.checkItem(checked);
    }

});


_.extend(RadioGroupItemView.prototype, bindUIElementsMixin);
var RadioGroupModel = ControlModel.extend({

    defaults: _.defaults({
        "readOnly": false,
        "orientation": InfinniUI.Metadata.RadioGroupOrientation.Vertical
    }, ControlModel.prototype.defaults)

});
var RadioGroupView = ControlView.extend({
    className: 'pl-radio-group',

    template: InfinniUI.Template["controls/radioGroup/template/template.tpl.html"],
    templateItem: InfinniUI.Template["controls/radioGroup/template/item.text.tpl.html"],

    UI: {
        items: '.pl-radio-group-items'
    },

    initialize: function () {

        this.listenTo(this.model, 'change:items', this.onChangeItemsHandler);
        this.listenTo(this.model, 'change:readOnly', this.onChangeReadOnlyHandler);
        this.listenTo(this.model, 'change:enabled', this.onChangeEnabledHandler);
        this.listenTo(this.model, 'change:orientation', this.onChangeOrientationHandler);
    },

    onChangeOrientationHandler: function () {
        this.applyOrientation();
    },

    applyOrientation: function () {
        var orientation = this.model.get('orientation');

        var horizontal = orientation === InfinniUI.Metadata.RadioGroupOrientation.Horizontal;
        this.$el.toggleClass('pl-radio-group_horizontal', horizontal);
        this.$el.toggleClass('pl-radio-group_vertical', !horizontal);
    },

    onChangeReadOnlyHandler: function () {
        this.notifyAllItems('enabled', this.model.get('readOnly'));
    },

    onChangeEnabledHandler: function () {
        this.notifyAllItems('enabled', this.model.get('enabled'));
    },

    notifyAllItems: function (name, value) {
        var viewItems = this.model.get('viewItems');

        if (_.isArray(viewItems)) {
            viewItems.forEach(function(view) {
                view.trigger(name, value);
            });
        }
    },

    render: function () {
        this.prerenderingActions();
        this.$el.html(this.template());
        this.bindUIElements();
        this.applyOrientation();
        this.renderItems();
        this.postrenderingActions();
        return this;
    },

    onChangeItemsHandler: function () {
        if (this.wasRendered) {
            this.renderItems();
        }
    },

    cleanViewItems: function () {
        var views = this.model.get('viewItems');

        if (_.isEmpty(views)) {
            return;
        }

        views.forEach(function (view) {
            view.remove();
        });

        this.model.set('viewItems', null);
    },

    renderItems: function () {
        this.cleanViewItems();
        var model = this.model;
        var value = model.get('value');
        var items = model.get('items');
        if (_.isArray(items) === false) {
            return;
        }


        var itemRenderStrategy = this.getItemRenderStrategy();

        var views = items.map(function (item, index) {
            var viewItem = new RadioGroupItemView({
                item: item,
                index: index,
                readOnly: model.get('readOnly'),
                enabled: model.get('enabled'),
                name: model.get('name')
            });
            viewItem.setRenderStrategy(itemRenderStrategy);
            this.ui.items.append(viewItem.render().$el);
            this.listenTo(viewItem, 'check', this.onCheckItemHandler);
            viewItem.listenTo(model, 'change:value', function (model, value) {
                var item = this.getItemByValue(value);
                viewItem.trigger('toggle', item);
            }.bind(this));

            //Отмечаем пункт, соответсвующий текущему значению.
            var itemValue = InfinniUI.ValueProperty.getValue(item, model.get('valueProperty'));
            if (_.isEqual(value, itemValue)) {
                viewItem.trigger('toggle', item);
            }
            return viewItem;
        }, this);

        model.set('viewItems', views);
    },

    getItemByValue: function (value) {
        var items = this.model.get('items');
        var item;
        var valueProperty = this.model.get('valueProperty');

        if (_.isArray(items)) {
            item = _.find(items, function (item) {
                var val = InfinniUI.ValueProperty.getValue(item, valueProperty);
                return _.isEqual(val, value);
            });
        }

        return item;
    },

    onCheckItemHandler: function (item, index) {
        var model = this.model;
        var value = InfinniUI.ValueProperty.getValue(item, model.get('valueProperty'));
        var oldValue = model.get('value');

        if (!_.isEqual(value, oldValue)) {
            model.set('value', value);
            model.set('item', item);
        }
    },

    getItemRenderStrategy: function () {
        var strategy;

        var itemTemplate = this.model.get('itemTemplate');
        var itemFormat = this.model.get('itemFormat');
        var displayProperty = this.model.get('displayProperty');

        if (typeof itemTemplate === 'function') {
            strategy = new ItemTemplateRenderStrategy(itemTemplate);
        } else if (typeof itemFormat !== 'undefined' && itemFormat !== null) {
            strategy = new ItemFormatRenderStrategy(itemFormat)
        } else if (_.isEmpty(displayProperty) === false) {
            strategy = new DisplayPropertyRenderStrategy(displayProperty);
        } else {
            strategy = new DefaultRenderStrategy();
        }

        return strategy;
    }

});
/** Используется toString() **/
var DefaultRenderStrategy = function () {

};

DefaultRenderStrategy.prototype.render = function (value) {
    return 'DefaultRenderStrategy' + value;
};


/** используется ItemTemplate **/
var ItemTemplateRenderStrategy = function (itemTemplate) {
    this.itemTemplate = itemTemplate;
};

ItemTemplateRenderStrategy.prototype.render = function (value, index) {
    var itemTemplate = this.itemTemplate(index);
    return itemTemplate.render();

};

/** Используется ItemFormat **/
var ItemFormatRenderStrategy = function (itemFormat) {
    this.itemFormat = itemFormat;
};

ItemFormatRenderStrategy.prototype.render = function (value, index) {
    return this.itemFormat.format(value);
};

/** Используется DisplayProperty **/
var DisplayPropertyRenderStrategy = function (displayProperty) {
    this.displayProperty = displayProperty;
};

DisplayPropertyRenderStrategy.prototype.render = function (value, index) {
    return InfinniUI.ObjectUtils.getPropertyValue(value, this.displayProperty);
};


var ScrollPanelControl = function () {
    _.superClass(ScrollPanelControl, this);
};

_.inherit(ScrollPanelControl, Control);

ScrollPanelControl.prototype.createControlModel = function () {
    return new ScrollPanelModel();
};

ScrollPanelControl.prototype.createControlView = function (model) {
    return new ScrollPanelView({model: model});
};

ScrollPanelControl.prototype.getChildElements = function () {
    return [this.controlModel.get('layoutPanel')];
};

var ScrollPanelModel = Backbone.Model.extend({
    defaults: _.defaults({
        verticalScroll: '',
        verticalAlignment: 'Stretch',
        horizontalScroll: '',
        layoutPanel: null
    }, ControlModel.prototype.defaults)
});

var ScrollPanelView = ControlView.extend({
    className: 'pl-scroll-panel',

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
    },

    render: function () {
        this.prerenderingActions();

        //this.$el.html(this.model.get('layoutPanel').render());


        this.$el.empty();
        this.$el.append(this.model.get('layoutPanel').render());

        //this.$el.children().slimScroll({
            //height: '250px'
        //});

        this.postrenderingActions();
        return this;
    }
});
var SearchPanelControl = function () {
    _.superClass(SearchPanelControl, this);
};

_.inherit(SearchPanelControl, Control);

_.extend(SearchPanelControl.prototype, {
    createControlModel: function () {
        return new SearchPanelModel();
    },

    createControlView: function (model) {
        return new SearchPanelView({model: model});
    },

    onValueChanged: function (handler) {
        this.controlView.on('onValueChanged', handler);
    }
});
var SearchPanelModel = ControlModel.extend({
    defaults: _.extend({
        value: null
    }, ControlModel.prototype.defaults),

    initialize: function(){
        ControlModel.prototype.initialize.apply(this);
        this.set({
            text: 'Найти'
        }, {silent: true});
    }
});
var SearchPanelView = ControlView.extend({
    className: 'pl-search-panel',

    template: InfinniUI.Template["controls/searchPanel/template/template.tpl.html"],

    events: {
        'submit form': 'submitFormHandler',
        'click .btn_remove': 'onButtonRemoveClickHandler',
        'input .form-control': 'onUpdateUIValue'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:value', this.updateValue);
    },

    render: function () {
        this.prerenderingActions();

        this.$el
            .html(this.template({
                placeholder: this.model.get('text')
            }));

        this.updateValue();
        this.updateEnabled();

        this.postrenderingActions();
        return this;
    },

    submitFormHandler: function(event){
        event.preventDefault();
        this.trigger('onValueChanged',this.model.get('value'));
    },

    updateEnabled: function () {
        ControlView.prototype.updateEnabled.apply(this);

        if (this.wasRendered) {
            var isEnabled = this.model.get('enabled'),
                $control = this.$el.find('.form-control'),
                $button_search = this.$el.find('.btn_search'),
                $button_remove = this.$el.find('.btn_remove');
            $control.prop('disabled', !isEnabled);
            $button_search.prop('disabled', !isEnabled);
            $button_remove.prop('disabled', !isEnabled);
        }
    },

    updateValue : function () {

        if (this.wasRendered) {
            this.$el.find('.form-control').val(this.model.get('value'));
        }
    },

    onUpdateUIValue : function(e){
        var newVal = $(e.target).val();
        this.model.set('value', newVal);
    },

    onButtonRemoveClickHandler: function() {
        this.model.set('value','');
        this.render();
        this.trigger('onValueChanged',this.model.get('value'));
    }
});
var StackPanelControl = function () {
    _.superClass(StackPanelControl, this);
};

_.inherit(StackPanelControl, Control);

_.extend(StackPanelControl.prototype, {
    createControlModel: function () {
        return new StackPanelModel();
    },

    createControlView: function (model) {
        return new StackPanelView({model: model});
    },

    addItem: function (item) {
        this.controlModel.addItem(item);
    },

    getItems: function () {
        return this.controlModel.getItems();
    },

    getChildElements: function () {
        return this.getItems();
    }
});
var StackPanelModel = ControlModel.extend({
    defaults: _.defaults({
        items: null,
        orientation: 'Vertical',
        horizontalAlignment: 'Stretch'
    }, ControlModel.prototype.defaults),

    initialize: function(){
        this.set('items', []);

        ControlModel.prototype.initialize.apply(this);
    },

    addItem: function(item){
        this.get('items').push(item);
        this.trigger('itemsIsChange', this.get('items'));
    },

    getItems: function(){
        return this.get('items');
    }
});
var StackPanelView = ControlView.extend({
    tagName: 'ul',
    className: 'pl-stack-panel',

    template: _.template(
        '<li class="pl-stack-panel-i"><div class="clearfix"></div></li>'
    ),

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'itemsIsChange', this.rerender);

        this.initOrientation();
    },

    initOrientation: function () {
        this.listenTo(this.model, 'change:orientation', this.updateOrientation);
        this.updateOrientation();
    },

    updateOrientation: function () {
        var orientation = this.model.get('orientation');
        this.$el.toggleClass('horizontal-orientation', orientation == 'Horizontal');
    },

    render: function () {
        this.prerenderingActions();

        this.$el.empty();

        var magicConstant = 75;
        var magicConstant2 = 40;
        var orientation = this.model.get('orientation'),
            elementMeasures = [],
            items = this.model.getItems(),
            window = $('#page-content').height() - magicConstant - magicConstant2, //magic!!!
            fluid = 0;

        //_.each(items, function (item) {
        //    var measure = item.getHeight ? item.getHeight() : 0 ;//orientation == 'Vertical' ? item.getHeight() : item.getWidth();
        //
        //    if (measure === undefined) {
        //        fluid++;
        //    } else {
        //        window -= measure;
        //    }
        //
        //    elementMeasures.push(measure);
        //});

        var fluidHeight = window / fluid;

        for (var i = 0; i < items.length; i++) {
            var $item = this.renderItem(items[i]);

            //$item.height(elementMeasures[i] || fluidHeight);

            if(items[i].getWidth) {
                $item.width(items[i].getWidth());
            }

            this.$el.append($item);
        }

        this.postrenderingActions();

        return this;
    },

    renderItem: function (item) {
        var $wrap = $(this.template({})),
            $item = item.render();

        return $wrap.prepend($item);
    }
});
var TabPageControl = function(){
    _.superClass(TabPageControl, this);
};

_.inherit(TabPageControl, Control);

_.extend(TabPageControl.prototype, {

    createControlModel: function(){
        return new TabPageModel();
    },

    createControlView: function(model){
        return new TabPageView({
            model: model,
            id: this.getId()
        });
    },

    getId: function () {
        return this.controlModel.getId();
    },

    close: function () {

    }
});
var TabPageModel = ControlModel.extend({

    defaults: _.defaults({
        image: null,
        canClose: false,
        horizontalAlignment: 'Stretch'
    }, ControlModel.prototype.defaults),

    initialize: function(options){
        ControlModel.prototype.initialize.apply(this);
    },

    getId: function () {
        return "TabPage_" + this.cid;
    }

});
var TabPageView = ControlView.extend({

    className: 'pl-tab-page tab-pane',

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:layoutPanel', this.onChangeLayoutPanelHandler);
    },

    render: function () {
        var layoutPanel = this.model.get('layoutPanel');
        this.prerenderingActions();
        this.$el.empty();

        if (typeof layoutPanel !== 'undefined') {
            this.$el.append(layoutPanel.render());
        }

        this.postrenderingActions();
        return this;
    },

    /**
     * @private
     */
    onChangeLayoutPanelHandler: function () {
        this.rerender();
    }

});
var TabPanelControl = function(){
    _.superClass(TabPanelControl, this);
};

_.inherit(TabPanelControl, Control);

_.extend(TabPanelControl.prototype, {

    createControlModel: function(){
        return new TabPanelModel();
    },

    createControlView: function(model){
        return new TabPanelView({model: model});
    },

    /**
     * @param {TabPage} page
     */
    addPage: function (page) {
        this.controlModel.addPage(page);
    },

    /**
     * @param {TabPage} page
     */
    removePage: function (page) {
        this.controlModel.removePage(page);
    },

    /**
     * @param {String} name
     * @return {TabPage}
     */
    getPage: function (name) {
        return this.controlModel.getPage(name);
    },

    /**
     * @return {TabPage[]}
     */
    getPages: function () {
        return this.controlModel.getPages();
    },

    /**
     * @returns {TabPage}
     */
    getSelectedPage: function () {
        return this.controlModel.getSelectedPage()
    },

    /**
     *
     * @param {TabPage} page
     */
    setSelectedPage: function (page) {
        this.controlModel.setSelectedPage(page);
    },

    onSelectionChanged: function (handler) {
        this.controlView.on('onSelectionChanged', handler);
    }

});
var TabPanelModel = ControlModel.extend({
    defaults: _.defaults({
        headerLocation: 'Top',
        headerOrientation: 'Horizontal',
        horizontalAlignment: 'Stretch',
        verticalAlignment: 'Stretch',
        defaultPage: null
    }, ControlModel.prototype.defaults),

    initialize: function(){
        ControlModel.prototype.initialize.apply(this);
        this.set('pages', []);
    },

    addPage: function (page) {
        var pages = this.getPages();
        pages.push(page);
        this.trigger('add:page', page);
    },

    /**
     * @param {TabPage} page
     */
    removePage: function (page) {
        var pages = this.getPages(),
            i = pages.indexOf(page);

        if (i !== -1) {
            pages.splice(i, 1);
            this.trigger('remove:page', page);
        }
    },

    /**
     * @params {String} name
     * @returns {TabPage}
     */
    getPage: function (name) {
        return _.find(this.getPages(), function (page) {
            return name === page.getName();
        });
    },

    /**
     * @returns {TabPage[]}
     */
    getPages: function () {
        return this.get('pages');
    },

    /**
     * @private
     * Возвращает порядковый номер активной вкладки
     * @returns {Number}
     */
    getActivePageIndex: function () {
        var defaultPage = this.get('defaultPage'),
            pages = this.get('pages'),
            active;
        if (defaultPage !== null) {
            _.find(pages, function (page, index) {
                if (page.getName() === defaultPage) {
                    active = index;
                    return true;
                }
                return false;
            });
        }

        return typeof active === 'undefined' ? 0 : active;
    },

    /**
     * Возвращает выделенную вкладку
     * @returns {TabPage}
     */
    getSelectedPage: function () {
        var index = this.getActivePageIndex(),
            pages = this.get('pages');

        return pages[index];
    },

    /**
     * Устанавливает выделенную вкладку
     * @param {TabPage} page
     */
    setSelectedPage: function (page) {
        var pages = this.get('pages'),
            index = _.indexOf(pages, page);

        if (index !== -1) {
            this.set('defaultPage', page.getName());
        }
    }

});
var TabPanelView = ControlView.extend({

    className: 'pl-tab-panel',

    template: {
        //Шаблонов для различных вариантов расположения кнопок панели
        Top: InfinniUI.Template["controls/tabPanel/template/top.tpl.html"],
        Right: InfinniUI.Template["controls/tabPanel/template/right.tpl.html"],
        Bottom: InfinniUI.Template["controls/tabPanel/template/bottom.tpl.html"],
        Left: InfinniUI.Template["controls/tabPanel/template/left.tpl.html"],
        None: InfinniUI.Template["controls/tabPanel/template/none.tpl.html"],
        //Шаблон кнопок навигации панели
        nav: InfinniUI.Template["controls/tabPanel/template/nav.tpl.html"]
    },

    events: {
        'click .pl-tab-close': 'onClickTabCloseHandler'
    },

    UI: {
        content: '.tab-content',
        nav: '.nav-tabs'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.listenTo(this.model, 'add:page', this.onAddPageHandler);
        this.listenTo(this.model, 'remove:page', this.onRemovePageHandler);
        this.listenTo(this.model, 'change:headerLocation', this.onChangeHeaderLocationHandler);
        this.listenTo(this.model, 'change:defaultPage', this.onChangeDefaultPageHandler);
    },

    render: function () {
        var template = this.template[this.model.get('headerLocation')];

        this.prerenderingActions();

        this.$el.empty();

        this.$el.html(template());

        this.bindUIElements();

        this.applyHeaderLocation();

        this.renderPages();

        this.postrenderingActions();
        return this;
    },

    /**
     * @private
     * Рендеринг вкладок
     */
    renderPages: function () {
        var pages = this.model.get('pages'),
            $nav = this.ui.nav;

        if (typeof pages !== 'undefined') {
            var contentFragment = document.createDocumentFragment(),
                activePageIndex = this.model.getActivePageIndex();

            if(this.model.get('headerLocation') == 'Top'){
                var percentWidth = 100/pages.length;
            }

            _.each(pages, function (page, index) {
                //Рендеринг содержимого вкладки
                var $page = page.render();
                $page.toggleClass('active', activePageIndex === index);
                contentFragment.appendChild($page[0]);
                //Рендеринг кнопки для навигации

                $nav.append(this.template.nav({
                    id: page.getId(),
                    text: page.getText(),
                    active: activePageIndex === index,
                    canClose: page.getCanClose(),
                    name: page.getName(),

                    width: percentWidth,
                    location: this.model.get('headerLocation')
                }));
            }, this);
            this.bindNavEvents();
            this.ui.content.append(contentFragment);
        }
    },

    /**
     * @private
     * Установка обработчиков для отслеживания переключения вкладок
     */
    bindNavEvents: function () {
        var model = this.model;
        var view = this;

        $('a[data-toggle="tab"]', this.ui.nav)
            .off('shown.bs.tab')
            .on('shown.bs.tab', function (event) {
                var el = event.target;
                //Запоминаем имя выделенной вкладки
                model.set('defaultPage', $(el).attr('data-pageName'), {silent: true});
                view.trigger('onSelectionChanged')
            });
    },

    /**
     * @private
     * Применение стиля расположения закладок
     */
    applyHeaderLocation: function () {
        var headerLocation = this.model.get('headerLocation');
        var cssClasses = {
            Bottom: "tabs-below",
            Left: "tabs-left",
            Right: "tabs-right"
        };

        this.$el.toggleClass('row', headerLocation === 'Left' || headerLocation === 'Right');

        for (var i in cssClasses) {
            if (!cssClasses.hasOwnProperty(i)) continue;
            this.$el.toggleClass(cssClasses[i], i === headerLocation);
            this.ui.nav.toggleClass(cssClasses[i], i === headerLocation);
        }
    },

    /**
     * @private
     * Обработчик события при добавлении страницы
     */
    onAddPageHandler: function () {
        //@TODO Переделать на рендеринг новой вкладки
        this.rerender();
    },

    /**
     * @private
     * Обработчик события при удалении страницы
     */
    onRemovePageHandler: function (page) {
        //@TODO Переделать на удаление нужной вкладки
        this.rerender();
    },

    /**
     * @private
     * Обработчик изменения положения панели навигации вкладок
     */
    onChangeHeaderLocationHandler: function () {
        this.rerender();
    },

    /**
     * @private
     * Обрабочик изменения выделенной вкладки
     */
    onChangeDefaultPageHandler: function () {
        if (this.wasRendered) {
            var index = this.model.getActivePageIndex(),
                selector = "li:eq(index) a".replace('index', index);
            $(selector, this.ui.nav).tab('show');
        }
    },

    onClickTabCloseHandler: function (event) {
        var $el = $(event.target).prev();

        var page = this.model.getPage($el.attr('data-pageName'));
        page.close();
        //this.model.removePage(page);
    }


});
var TextBoxControl = function(){
    _.superClass(TextBoxControl, this);
};

_.inherit(TextBoxControl, Control);

_.extend(TextBoxControl.prototype, {

    createControlModel: function(){
        return new TextBoxModel();
    },

    createControlView: function(model){
        return new TextBoxView({model: model});
    }
},
    controlValuePropertyMixin,
    baseTextControlMixin
);
var TextBoxModel = ControlModel.extend({
    defaults: _.defaults({
        value: null,
        multiline: false,
        lineCount: 0,
        foreground: 'Black',
        background: 'Transparent',
        textStyle: 'Body1',
        horizontalTextAlignment: 'Left'
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});
var TextBoxView = ControlView.extend({
    className: 'pl-text-box',

    template: {
        textBox: {
            default: InfinniUI.Template["controls/textBox/template/textbox.tpl.html"],
            label: InfinniUI.Template["controls/textBox/template/label-textbox.tpl.html"]
        },
        textArea: {
            default: InfinniUI.Template["controls/textBox/template/textarea.tpl.html"],
            label: InfinniUI.Template["controls/textBox/template/label-textarea.tpl.html"]
        }
    },

    UI: {
        control: ".pl-control",
        editor: '.pl-control-editor',
        validationMessage: '.pl-control-validation-message',
        hintText: '.pl-control-hint-text'
    },

    events: {
        'change .pl-text-box-input': 'onUIChangeHandler',
        //Обработчик для показа поля редактирования с использованием маски ввода
        'focus .pl-text-box-input': 'onFocusControlHandler',
        'mouseenter .pl-text-box-input': 'onMouseenterControlHandler',

        'change .pl-text-area-input': 'onUIChangeHandler',
        //Обработчик для показа поля редактирования с использованием маски ввода
        'focus .pl-text-area-input': 'onFocusControlHandler',
        'mouseenter .pl-text-area-input': 'onMouseenterControlHandler',
        'focusin .pl-control-editor' : 'onFocusInDebounceHandler',
        'focusout .pl-control-editor' : 'onFocusOutDebounceHandler',
        'synchValue': 'synchValueHandler'
    },

    onFocusInHandler: function (event) {
        this.callEventHandler('OnGotFocus');
    },

    onFocusOutHandler: function (event) {
        this.callEventHandler('OnLostFocus');
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.initForeground();
        this.initBackground();
        this.initTextStyle();
        this.initErrorText();
        this.initHintText();
        this.initLabelText();
        this.initHorizontalTextAlignment();

        this.onFocusInDebounceHandler = _.debounce(this.onFocusInHandler, 100);
        this.onFocusOutDebounceHandler = _.debounce(this.onFocusOutHandler, 100);

        this.listenTo(this.model, 'change:value', this.updateValue);
        this.listenTo(this.model, 'change:validationMessage', this.updateValidation);
        this.listenTo(this.model, 'change:validationState', this.updateValidation);
    },

    renderTemplate: function () {
        var multiline = this.model.get('multiline');
        var labelText = this.model.get('labelText');
        var lineCount = this.model.get('lineCount');
        var inputType = this.model.get('inputType');

        var kind = multiline ? 'textArea' : 'textBox';
        var style = typeof labelText === 'undefined' || labelText === null ? 'default' : 'label';

        var template = this.template[kind][style];
        this.$el.html(template({
            multiline: multiline,
            labelText: labelText,
            lineCount: lineCount,
            inputType: inputType
        }));

    },

    render: function () {
        this.prerenderingActions();
        this.renderTemplate();
        //if(this.model.get('multiline')) {
        //    this.$el.html(this.templateTextArea({lineCount: this.model.get('lineCount')}));
        //}else{
        //    this.$el.html(this.templateTextBox({inputType: this.model.get('inputType')}));
        //}

        this.bindUIElements();
        this.initEditor();

        this.updateValue();
        this.updateEnabled();

        this.updateBackground();
        this.updateForeground();
        this.updateTextStyle();
        this.updateErrorText();
        this.updateValidation(); //При повторном рендере, принудительно выставляем Error текст
        this.updateHintText();
        this.updateHorizontalTextAlignment();

        this.postrenderingActions();
        return this;
    },

    /**
     * Рендеринг редактора значений
     */
    initEditor: function () {
        //@TODO Возможно при отсутвии maskEdit поле редактирования использовать не надо?
        //Создание редактора значений
        var editor = this.renderEditor({
            el: this.ui.editor,
            multiline: this.model.get('multiline'),
            lineCount: this.model.get('lineCount'),
            inputType: this.model.get('inputType')
        });
    },

    updateEnabled: function () {
        ControlView.prototype.updateEnabled.apply(this);

        if (this.wasRendered) {
            var isEnabled = this.model.get('enabled'),
                $control = this.$el.find('.pl-control');

            $control.prop('disabled', !isEnabled);
        }
    },

    onUIChangeHandler: function () {
        var val = this.$el.find('.pl-control').val();

        if (val != this.model.get('value')) {
            this.model.set('value', val);
        }
    },

    updateValue: function () {
        var format = this.model.get('format');
        var value = this.model.get('value');
        var text;

        if (!this.wasRendered) {
            return;
        }

        if (typeof value !== 'undefined') {
            if (typeof format !== 'undefined' && format !== null) {
                text = format.format(value);
            } else {
                text = value;
            }
        }

        this.ui.control.val(text);

    },

    updateValidation: function () {
        var model = this.model;

        var state = model.get('validationState');
        var message = model.get('validationMessage');

        var hideMessage = _.isEmpty(message) || ['error', 'warning'].indexOf(state) === -1;

        this.ui.validationMessage.toggleClass('hidden', hideMessage);
        this.ui.validationMessage.text(message);

        //state = success, error, warning
    },

    onEditorValidate: function (value) {
        return true;
    }
});

_.extend(TextBoxView.prototype,
    textEditorMixin,
    horizontalTextAlignmentPropertyMixin,
    foregroundPropertyMixin,
    backgroundPropertyMixin,
    textStylePropertyMixin,
    errorTextPropertyMixin,
    hintTextPropertyMixin,
    labelTextPropertyMixin
);
var ToggleButtonControl = function () {
    _.superClass(ToggleButtonControl, this);
};

_.inherit(ToggleButtonControl, Control);

_.extend(ToggleButtonControl.prototype, {
    createControlModel: function () {
        return new ToggleButtonModel();
    },

    createControlView: function (model) {
        return new ToggleButtonView({model: model});
    }
},
    controlValuePropertyMixin
);
var ToggleButtonModel = ControlModel.extend({
    defaults: _.defaults({
        value: true,
        textOn: 'ON',
        textOff: 'OFF',
        horizontalAlignment: 'Left'
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});
var ToggleButtonView = ControlView.extend({
    className: 'pl-toggle-button',
    template: _.template('<input type="checkbox" class="pl-control" name="my-checkbox" checked="checked">'),

    events: {
        'switchChange.bootstrapSwitch input[type="checkbox"]': 'updateModelVal',
        'focusin input[type="checkbox"]': 'onFocusInDebounceHandler',
        'focusout input[type="checkbox"]': 'onFocusOutDebounceHandler'
    },

    onFocusInHandler: function (event) {
        this.callEventHandler('OnGotFocus');
    },

    onFocusOutHandler: function (event) {
        this.callEventHandler('OnLostFocus');
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.initValue();
        this.initOnText();
        this.initOffText();

        this.onFocusInDebounceHandler = _.debounce(this.onFocusInHandler, 100);
        this.onFocusOutDebounceHandler = _.debounce(this.onFocusOutHandler, 100);

        this.listenTo(this.model, 'change', this.updateValue);
    },

    render: function () {
        this.prerenderingActions();

        this.$el.html(this.template({}));
        hideScreen.add(this.$el);
        this.$el.find('input').bootstrapSwitch();
        this.$el.detach();

        this.updateValue();
        this.updateTextOn();
        this.updateTextOff();
        this.updateEnabled();

        this.postrenderingActions();
        return this;
    },

    initValue: function () {
        this.listenTo(this.model, 'change:value', this.updateValue);
        this.updateValue();
    },
    initOnText: function () {
        this.listenTo(this.model, 'change:textOn', this.updateTextOn);
        this.updateTextOn();
    },
    initOffText: function () {
        this.listenTo(this.model, 'change:textOff', this.updateTextOff);
        this.updateTextOff();
    },

    updateEnabled: function () {
        ControlView.prototype.updateEnabled.apply(this);

        if (this.wasRendered) {
            var isEnabled = this.model.get('enabled');
            this.$el.find('input').bootstrapSwitch('disabled', !isEnabled);
        }
    },
    updateModelVal: function (event) {
        var val = event.target.checked;
        this.model.set({value: val});
    },
    updateTextOn: function () {
        if (this.wasRendered) {
            var textOn = this.model.get('textOn');
            this.$el.find('input').bootstrapSwitch('onText', textOn);
        }
    },
    updateTextOff: function () {
        if (this.wasRendered) {
            var textOff = this.model.get('textOff');
            this.$el.find('input').bootstrapSwitch('offText', textOff);
        }
    },
    updateValue: function () {
        if (this.wasRendered) {
            var value = this.model.get('value');
            this.$el.find('input').bootstrapSwitch('state', value);
        }
    }
});

var hideScreen = new hiddenScreen();
var ToolBarControl = function () {
    _.superClass(ToolBarControl, this);
};

_.inherit(ToolBarControl, Control);

_.extend(ToolBarControl.prototype, {
    createControlModel: function () {
        return new ToolBarModel();
    },

    createControlView: function (model) {
        return new ToolBarView({model: model});
    },

    addItem: function (item) {
        this.controlModel.addItem(item);
    },

    setItems: function(items){
        this.controlModel.setItems(items);
    },

    getChildElements: function () {
        return this.controlModel.getItems();
    },

    onEnabledChange: function (handler) {
        this.controlModel.on('change:enabled', handler);
    }
});
var ToolBarModel = ControlModel.extend({
    defaults: _.defaults({
        items: null
    }, ControlModel.prototype.defaults),

    initialize: function () {
        this.set('items', []);
        ControlModel.prototype.initialize.apply(this);
    },

    addItem: function (item) {
        this.get('items').push(item);
    },

    setItems: function (items){
        this.set('items', items);
    },

    getItems: function () {
        return this.get('items');
    }
});
var ToolBarSeparatorControl = function () {
    _.superClass(ToolBarSeparatorControl, this);
};

_.inherit(ToolBarSeparatorControl, Control);

_.extend(ToolBarSeparatorControl.prototype, {

    createControlModel: function () {
        return new ToolBarSeparatorModel();
    },

    createControlView: function (model) {
        return new ToolBarSeparatorView({model: model});
    }

});
var ToolBarSeparatorModel = ControlModel.extend({

    defaults: _.defaults({}, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }

});
var ToolBarSeparatorView = ControlView.extend({

    className: 'pl-tool-bar-separator',

    UI: {
        text: 'span'
    },

    template: InfinniUI.Template["controls/toolBar/toolBarSeparator/template/template.tpl.html"],

    initialize: function () {
        ControlView.prototype.initialize.apply(this);

        this.listenTo(this.model, 'change:value', this.updateText);
        this.listenTo(this.model, 'change:text', this.updateText);
        this.listenTo(this.model, 'change:visible', this.updateVisible);
    },

    render: function () {
        this.prerenderingActions();

        var $html = $(this.template({}));

        this.$el.append($html);
        this.bindUIElements();
        this.updateText();
        this.updateVisible();

        this.postrenderingActions();

        return this;
    },

    updateText: function () {
        if (!this.wasRendered) {
            return false;
        }

        var text = this.model.get('value');

        if (typeof text === 'undefined') {
            text = this.model.get('text');
        }

        this.ui.text.text(text);
    },

    updateVisible: function () {
        if (!this.wasRendered) {
            return false;
        }
        this.$el.toggleClass('hidden', !this.model.get('visible'));
    }

});
var ToolBarView = ControlView.extend({
    className: 'pl-tool-bar',

    template: _.template('<ul class="page-breadcrumb breadcrumb"></ul>'),
    templateItem: _.template('<li class="btn-group"></li>'),

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
    },

    render: function () {
        this.prerenderingActions();

        this.$el.empty();

        var $toolbar = $(this.template({}));

        _.each(this.model.getItems(), function (item) {
            var $itemTemplate = $(this.templateItem({}));

            $itemTemplate.append($(item.render()));
            $toolbar.append($itemTemplate);
        }, this);

        this.$el.append($toolbar);

        this.postrenderingActions();

        return this;
    }
});
var TreeViewControl = function () {
    _.superClass(TreeViewControl, this);
};

_.inherit(TreeViewControl, Control);

_.extend(TreeViewControl.prototype, {

    createControlModel: function () {
        return new TreeViewModel();
    },

    createControlView: function (model) {
        return new TreeViewView({model: model});
    },

    getSelectedItem: function () {
        return this.controlView.getSelectedItem();
    }

    //onChangeTerm: function (handler) {
    //    var fn = function (model, value) {
    //        handler(value);
    //    };
    //    this.controlModel.on('change:term', fn);
    //},
    //
    //setOpenListFunction: function(f){
    //    this.controlView.setOpenListFunction(f);
    //},
    //
    //onFirstOpening: function(handler){
    //    this.controlView.on('firstOpening', handler);
    //}

}, controlValuePropertyMixin);
var TreeViewModel = ControlModel.extend({
    defaults: _.extend({
        multiSelect: false,
        showNodeImages: false,
        keyProperty: '',
        parentProperty: '',
        imageProperty: '',
        verticalAlignment: 'Stretch',
        /** Inherited from BaseListElement */
        readOnly: false,
        items: []
    }, ControlModel.prototype.defaults)
});

var TreeViewView = ControlView.extend({

    className: 'pl-treeview',

    template: InfinniUI.Template["controls/treeView/template/treeview.tpl.html"],

    UI: {
        container: 'div'
    },

    initialize: function () {
        this.listenTo(this.model, 'change:value', this.onUpdateValueHandler);
        this.listenTo(this.model, 'change:items', this.onUpdateItemsHandler);
        this.listenTo(this.model, 'change:readOnly', this.onUpdateMultipleHandler);
    },

    render: function () {
        this.prerenderingActions();
        var html = this.template();

        this.$el.html(html);
        this.bindUIElements();

        this.renderData();
        this.bindTreeEvent();

        this.postrenderingActions();
        return this;
    },

    /**
     * @descroption Конвертирует данные из источника данных в формат, подходящий для используемого плагина TreeView
     * @param {Array} data
     * @returns *
     */
    convertData: function (data) {
        var parentProperty = this.model.get('parentProperty');
        var keyProperty = this.model.get('keyProperty');
        var displayProperty = this.model.get('displayProperty');
        var disabled = this.model.get('readOnly');
        var roots = _.pluck(data, keyProperty);
        roots = _.unique(roots);

        return _.map(data, function (item) {
            var id = InfinniUI.ObjectUtils.getPropertyValue(item, keyProperty);
            var result = {
                id: id,
                parent: "#",
                text: this.getDisplayNameValue(item),//item[displayProperty],
                state: {
                    disabled: disabled
                }
            };
            var parentValue;

            if (typeof parentProperty !== 'undefined' && parentProperty !== null) {
                parentValue = InfinniUI.ObjectUtils.getPropertyValue(item, parentProperty);

                if (typeof parentValue !== 'undefined' && parentValue !== null && _.contains(roots, parentValue)) {
                    result.parent = parentValue;
                }
            }

            return result;
        }, this);
    },

    getSelectedItem: function () {
        var items = this.model.get('items');
        var value = this.model.get('value');
        var keyProperty = this.model.get('keyProperty');

        if (value === null || typeof value === 'undefined') {
            return;
        }

        var condition;
        var result;

        var f = function (value) {
            (condition = {})[keyProperty] = value.Id;
            return _.findWhere(items, condition);
        };

        result = (value.constructor === Array) ? _.map(value, f) : f(value);

        return result;
    },

    /**
     * @description Рендеринг дерева
     */
    renderData: function () {
        var $el = this.ui.container;
        var data = this.model.get('items');
        var multiple = this.model.get('multiSelect');

        var plugins = ['wholerow'];
        if (multiple) {
            plugins.push('checkbox');
        }
        $el.jstree({
            plugins: plugins,
            checkbox: {
                three_state: false
            },
            core: {
                multiple: multiple,
                data: this.convertData(data),
                themes: {
                    name: 'proton',
                    responsive: true
                }
            }
        });
        this.updateTree();
    },


    /**
     * @description Конвертирование информации об элементе из плагина jsTree в значение контрола
     * @param data
     * @returns {*}
     */
    buildValueFromTreeData: function (data) {
        var convertData = function (item) {
            var data;
            if (item !== null && typeof item !== 'undefined') {
                data = {
                    Id: item.id,
                    DisplayName: item.text
                };
            }

            return data;
        };

        return (_.isArray(data)) ? _.map(data, convertData) : convertData(data);
    },

    /**
     * @description Обработка выборки элемента
     */
    bindTreeEvent: function () {
        var $el = this.ui.container;

        $el.on('changed.jstree', function() {
            var model = this.model;
            var multiple = model.get('multiSelect');
            var value;

            var data;

            if (multiple) {
                data = $el.jstree("get_checked", true);
            } else {
                data = $el.jstree("get_selected", true);
                if (_.isArray(data) && data.length > 0) {
                    data = data[0];
                }
            }

            value = this.buildValueFromTreeData(data);

            model.set('value', value);
        }.bind(this));
    },


    /**
     * @description Обновляет дерево данными из модели
     */
    updateTree: function () {
        if (!this.wasRendered) {
            return;
        }

        var $el = this.ui.container;
        var data = this.model.get('items');

        if (typeof data === 'undefined' || data === null) {
            data = [];
        }
        $el.jstree(true).settings.core.data = this.convertData(data);
        $el.jstree(true).refresh();
        this.updateTreeState();
    },

    /**
     * @description Обработчик установки значения. Отмечает соотвествующие элементы в TreeView
     */
    onUpdateValueHandler: function (/*model, value*/) {
        this.updateTreeState();
    },

    /**
     * @description Возвращает текстовое значение элемента из дерева.
     * Приоритет: ItemTemplate, ItemFormat, DisplayProperty, toString()
     * @param {Object} item
     */
    getDisplayNameValue: function (item) {
        var itemFormat = this.model.get('itemFormat');
        var displayProperty = this.model.get('displayProperty');
        var result = '' + item;//Вариант по умолчанию - toString()

        /**
         * @TODO Необходимо реализовать поддержку ItemTemplate
         */
        if (typeof itemFormat !== 'undefined' && itemFormat !== null) {
            result = itemFormat.format(item);
        } else if (typeof displayProperty !== 'undefined' && displayProperty !== null){
            result = InfinniUI.ObjectUtils.getPropertyValue(item, displayProperty);
        }

        return result;
    },

    /**
     * @private
     * @description Отмечает выбранные элементы в дереве, по значениям Value компонента
     */
    updateTreeState: function () {
        if (!this.wasRendered) {
            return;
        }

        var value = this.model.get('value');
        var $el = this.ui.container;
        var selected = $el.jstree(true).get_selected();
        var data;
        var deselect;

        if (_.isArray(value)) {
            data = _.pluck(value, 'Id');

            deselect = _.difference(selected, data);
            var select = _.difference(data, selected);
            if (deselect.length > 0) {
                $el.jstree(true).deselect_node(deselect, true);
            }
            if (select.length > 0) {
                $el.jstree(true).select_node(select, true);
            }
        } else {
            deselect = _.without(selected, value);
            $el.jstree(true).deselect_node(deselect, true);

            if (typeof value !== 'undefined' && value !== null) {
                $el.jstree(true).select_node(value.Id, true);
            }
        }
    },

    onUpdateItemsHandler: function (/*model, value*/) {
        this.updateTree();
    },

    onUpdateMultipleHandler: function () {
        this.updateTree();
    }

});

var UploadFileBoxControl = function(){
    _.superClass(UploadFileBoxControl, this);
};

_.inherit(UploadFileBoxControl, Control);

_.extend(UploadFileBoxControl.prototype, {
    createControlModel: function(){
        return new UploadFileBoxModel();
    },

    createControlView: function(model){
        return new UploadFileBoxView({model: model});
    },

    onValueChanged: function(handler){
        this.controlModel.on('change:value', handler);
    }
});
var UploadFileBoxModel = ControlModel.extend({
    defaults: _.extend({
        value: null,
        url: null,
        file: null,
        maxSize: 0,
        readOnly: false,
        acceptTypes: []
    }, ControlModel.prototype.defaults),

    initialize: function () {
        ControlModel.prototype.initialize.apply(this);
    }
});
var UploadFileBoxView = ControlView.extend({
    className: 'pl-upload-file-box',

    blobNameDefault: 'Скачать',

    template: InfinniUI.Template["controls/uploadFileBox/template/uploadFileBox.tpl.html"],

    UI: {
        input: 'input[type=file]',
        preview: '.file-link-preview',
        link: '.file-link-url',
        empty: '.file-link-none'
    },

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        this.listenTo(this.model, 'change:value', this.updateValueHandler);
        this.listenTo(this.model, 'change:readOnly', this.updateReadOnly);
        this.listenTo(this.model, 'change:acceptTypes', this.applyAcceptTypes);
        this.listenTo(this.model, 'change:url', this.onChangeUrl);
    },

    render: function () {

        this.prerenderingActions();

        this.$el.html(this.template({}));

        this.bindUIElements();

        var self = this;


        this.ui.input.change(function (e) {
            if (this.files.length == 0) return;
            var file = this.files[0];
            self.readFileValue(file);
        });

        this.applyAcceptTypes();
        this.updateReadOnly();
        this.applyBlobData();

        this.postrenderingActions();
        return this;
    },

    readFileValue : function (file) {
        var maxSize = this.model.get('maxSize');
        var model = this.model;

        if(typeof maxSize !== 'undefined' && maxSize !== null && file.size >= maxSize){
            alert('размер выбранного файла больше максимального ' + file.size);
            this.ui.input.val(null);
            return;
        }

        var blobData = InfinniUI.BlobUtils.createFromFile(file);
        model.set({value: blobData, file: file});
    },

    updateValueHandler: function(model, value){
        if (!this.wasRendered) {
            return;
        }

        this.applyBlobData();
    },

    applyAcceptTypes: function () {
        if (!this.wasRendered) {
            return;
        }
        var accept = this.model.get("acceptTypes");
        if(typeof accept !== 'undefined' && accept != null){
            this.ui.input.attr("accept", accept.join(','));
        }
    },

    applyBlobData: function () {
        var value = this.model.get('value');
        var that = this;

        var blobData = InfinniUI.ObjectUtils.getPropertyValue(value, 'Info');

        if (typeof blobData === 'undefined' || blobData === null) {
            //Файл не выбран. Очистить, если он был показан.
            this.ui.empty.removeClass('hidden');
            this.ui.link.addClass('hidden');
        } else {
            this.ui.empty.addClass('hidden');

            var id = InfinniUI.ObjectUtils.getPropertyValue(blobData, 'ContentId');

            if (typeof id !== 'undefined' && id !== null) {

                //this.ui.link.attr('href', this.model.get('url'));
                
                var blobName = blobData.Name;
                if (typeof blobName === 'undefined' || blobName === null) {
                    blobName = this.blobNameDefault;
                }

                this.ui.link
                    .text(blobName);

                this.sendRequest(this.model.get('url'), function(data){
                        var blob = new Blob([data], {type: "octet/stream"}),
                            url = window.URL.createObjectURL(blob);
                        that.ui.link.attr('href', url);
                        that.ui.link.attr('download', blobName);
                        that.ui.link.removeClass('hidden');
                    }
                );
            }
        }
    },

    applyUrl: function () {
        if (!this.wasRendered) {
            return;
        }

        this.ui.link.attr('href', url);
    },

    updateReadOnly: function(){
        if(!this.wasRendered) {
            return;
        }
        var readOnly = this.model.get('readOnly');
        this.ui.input.toggleClass('hidden', readOnly);
        this.ui.input.prop('disabled', readOnly);
    },

    onChangeUrl: function (model, url) {
        // @TODO Изменить ссылку на представлении
        this.applyBlobData();
    },

    sendRequest: function(url, handler){
        var xmlhttp = this.getXmlHttp();

        xmlhttp.open('GET', url, true);
        xmlhttp.withCredentials = true;
        xmlhttp.responseType = 'arraybuffer';
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    handler(xmlhttp.response);
                }
            }
        };
        xmlhttp.send();
    },

    getXmlHttp: function(){
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e1) {
                xmlhttp = false;
            }
        }

        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }

        return xmlhttp;
    }
});

var ViewPanelControl = function () {
    _.superClass(ViewPanelControl, this);
};

_.inherit(ViewPanelControl, Control);

ViewPanelControl.prototype.createControlModel = function () {
    return new ViewPanelModel();
};

ViewPanelControl.prototype.createControlView = function (model) {
    return new ViewPanelView({model: model});
};

var ViewPanelModel = Backbone.Model.extend({
    defaults: _.defaults({
        layout: ''
    }, ControlModel.prototype.defaults)
});

var ViewPanelView = ControlView.extend({
    className: 'pl-view-panel',

    initialize: function () {
        ControlView.prototype.initialize.apply(this);
        //this.listenToOnce(this.model, 'change:layout', this.onChangeLayoutHandler); //Почему так было??
        this.listenTo(this.model, 'change:layout', this.onChangeLayoutHandler);
    },

    onChangeLayoutHandler: function (model, layout) {
        this.$el.empty();
        this.$el.append(layout);
    },

    render: function () {
        this.prerenderingActions();

        this.$el.append(this.model.get('layout'));

        this.postrenderingActions();
        return this;
    }
});
var ComparatorBuilder = function  () {

};

ComparatorBuilder.prototype.build = function () {

    return new ComparatorId();
};



var ComparatorId = function () {

    this.propertyName = 'Id';
};

ComparatorId.prototype.isEqual = function (a, b) {
    var result = false;
    var value1, value2;
    if (a && b) {
        value1 = InfinniUI.ObjectUtils.getPropertyValue(a, this.propertyName);
        value2 = InfinniUI.ObjectUtils.getPropertyValue(b, this.propertyName);
        result = value1 == value2;
    }

    return result;
};
var Criteria = function (items) {
    this.onValueChangedHandlers = [];
    this.items = items || [];
};

Criteria.prototype.onValueChanged = function (handler) {
    if (typeof handler === 'function' && this.onValueChangedHandlers.indexOf(handler) === -1) {
        this.onValueChangedHandlers.push(handler);
    }
};

Criteria.prototype.valueChanged = function () {
    _.each(this.onValueChangedHandlers, function (handler) {
        handler();
    });
};



Criteria.prototype.getAsArray = function () {
    var list = [];
    _.each(this.items, function (item) {
        var criteria = {};
        for (var key in item) {
            if (!item.hasOwnProperty(key)) continue;
            if (key === 'Value' && typeof item.Value === 'function') {
                criteria[key] = item.Value();
            } else {
                criteria[key] = item[key];
            }
        }
        list.push(criteria);
    });

    return list;
};

Criteria.prototype.setItems = function (items) {
    if (typeof items !== 'undefined' && items !== null) {
        this.items = items;
    } else {
        this.items = [];
    }
};


/**
 * Обратная совместимость (если строка то конвертирует в "флаговое соответствие")
 */
Criteria.prototype.decodeCriteriaType = function (value) {
    var criteriaType = value;

    if (typeof value === 'string') {
        criteriaType = parseInt(value, 10);
        if (isNaN(criteriaType)) {
            criteriaType = this.criteriaType[value]
        }
    }

    return criteriaType;
};

Criteria.prototype.normalizeCriteria = function (criteria) {

};

Criteria.prototype.criteriaType = {
    IsEquals: 1,
    IsNotEquals: 2,
    IsMoreThan: 4,
    IsLessThan: 8,
    IsMoreThanOrEquals: 16,
    IsLessThanOrEquals: 32,
    IsContains: 64,
    IsNotContains: 128,
    IsEmpty: 256,
    IsNotEmpty: 512,
    IsStartsWith: 1024,
    IsNotStartsWith: 2048,
    IsEndsWith: 4096,
    IsNotEndsWith: 8192,
    IsIn: 16384,
    Script: 32768,
    FullTextSearch: 65536,
    IsIdIn: 131072
};


/**
 * Функция конвертирует CriteriaType в "флаговое соответствие"
 * @param val
 * @returns {number}
 */

function toEnum(val) {

    var criteria = new Criteria();

    return criteria.decodeCriteriaType(val);
}


var CriteriaBuilder = function () {

};

CriteriaBuilder.prototype.build = function(builder, parent, metadata){

    var criteria = new Criteria();


    var items = [];

    if (typeof metadata !== 'undefined' && metadata !== null && metadata.length) {
        for (var i = 0, ln = metadata.length; i < ln; i = i + 1) {
            items.push(this.buildCriteriaItem(builder, parent, metadata[i], criteria));
        }
    }

    criteria.setItems(items);

    return criteria;
};

CriteriaBuilder.prototype.buildCriteriaItem = function(builder, parent, metadata, criteria){

    var item = {
        Property: metadata.Property,
        CriteriaType: criteria.decodeCriteriaType(metadata.CriteriaType)
    };

    var value = metadata.Value;
    var binding;
    item.Value = value;

    if (value !== null && typeof value === 'object') {
        binding = builder.build(parent, value);
        if (typeof binding !== 'undefined' && binding !== null) {
            //Если объект пострен билдером - это Binding
            item.Value = function () {
                return binding.getPropertyValue();
            };
            binding.onPropertyValueChanged(function () {
                //Уведомить условие об изменении значение в биндинге
                criteria.valueChanged();
            });
        }
    }

    return item;
};


/**
 * @class ParameterBinding
 * @param view
 * @param parameter
 * @param property
 * @constructor
 */
var ParameterBinding = function (view, parameter, property) {

    this.element = null;
    this.view = view;
    this.parameter = parameter;
    this.property = property;
    //this.propertyValue = null;
    this.value = null;
    this.eventStore = new EventStore();
};

/**
 * @description  Устанавливает обработчик события изменения значения в элементе представления.
 * @param {Function} handler
 */
ParameterBinding.prototype.onSetPropertyValue = function (handler) {
    this.eventStore.addEvent('onSetPropertyValue', handler);
};


ParameterBinding.prototype.onPropertyValueChanged = function(handler){
    this.eventStore.addEvent('onPropertyValueChanged', handler);

    //если на момент подписки данные binding уже получены,
    //уведомляем подписчика об этих данных
    if(this.getPropertyValue()){
        this.invokeHandler('onPropertyValueChanged', this.property, this.getPropertyValue());
    }
};

ParameterBinding.prototype.invokeHandler = function(eventName, property, value){
    this.eventStore.executeEvent(eventName, this.view.getContext(), {
        parameter: this.parameter,
        property: property,
        value: _.clone(value)
    });
};


ParameterBinding.prototype.getPropertyValue = function () {
    var propertyName = this.getProperty();
    var propertyValue = null;

    if (typeof propertyName !== 'undefined' && propertyName !== null) {
        if (propertyName.length > 2 && propertyName.substring(0, 2) === '$.') {
            propertyValue = InfinniUI.ObjectUtils.getPropertyValue(this.value, propertyName.substr(2));
        }
        else if (propertyName !== '$') {
            propertyValue = InfinniUI.ObjectUtils.getPropertyValue(this.value, propertyName);
        }
        else {
            propertyValue = this.value;
        }
    } else {
        propertyValue = this.value
    }

    return _.clone(propertyValue);
};

/**
 * @description Устанавливает значение параметра.
 * Вызывает элемент представления для оповещения источника данных об изменениях.
 * @memberOf ParameterBinding.prototype
 * @param value
 */
ParameterBinding.prototype.setPropertyValue = function (value) {
    var oldValue = this.getPropertyValue();
    var propertyName = this.getProperty();

    if (_.isEqual(value, oldValue)) {
        return;
    }

    value = _.clone(value);
    if (propertyName.length > 2 && propertyName.substring(0, 2) === '$.') {
        InfinniUI.ObjectUtils.setPropertyValue(this.value, propertyName.substr(2), value);
    }
    else {
        InfinniUI.ObjectUtils.setPropertyValue(this.value, propertyName, value);
    }

    //Уведомить параметр об изменении значения
    this.invokeHandler('onSetPropertyValue', '', this.value);
};

/**
 * @description Устанавливает значение у элемента представления.
 * Вызывает источник данных для оповещения элемента представления об изменениях.
 * @memberOf ParameterBinding.prototype
 * @param value
 */
ParameterBinding.prototype.propertyValueChanged = function(value){

    if (_.isEqual(value, this.value)) {
        return;
    }

    this.value = _.clone(value);
    //Уведомить элемент представления об изменении значения
    this.invokeHandler('onPropertyValueChanged', this.property, this.getPropertyValue());
};

ParameterBinding.prototype.getProperty = function () {
    return this.property;
};

ParameterBinding.prototype.setElement = function (element) {
    this.element = element;
};

ParameterBinding.prototype.getElement = function () {
    return this.element;
};


var ParameterBindingBuilder = function () {

};


ParameterBindingBuilder.prototype.build = function (builder, parent, metadata) {
    this.parameter = metadata.Parameter;
    this.property = metadata.Property;

    var binding = new ParameterBinding(parent, this.parameter, this.property);

    var parameter = parent.getParameter(this.parameter);

    if(typeof parameter !== 'undefined' && parameter !== null){
        parameter.addDataBinding(binding);
    }

    return binding;
};

var FileBindingBuilder = function () {

};

FileBindingBuilder.prototype.build = function (builder, parent, metadata, collectionProperty) {

    var metadataProperty = metadata.Property;

    if(collectionProperty){
        metadataProperty = collectionProperty.resolve(metadata.Property);
    }

    var fileBinding = new FileBinding(parent, metadata.DataSource, metadataProperty);

    var dataSource = parent.getDataSource(metadata.DataSource);

    var uploadFile = function (instanceId) {
        var defer = $.Deferred();
        var file = fileBinding.getFile();
        if (typeof file === 'undefined' || file === null) {
            return;
        }

        dataSource.uploadFile(metadataProperty, instanceId, fileBinding.getFile(), function (response) {
            defer.resolve(response);
        });
        return defer.promise();
    };

    if(dataSource !== null){

        //При изменении значения в источнике данных - получаем URL загруженного файла из источника
        fileBinding.onPropertyValueChanged(function (context, args) {
            fileUrl = fileBinding.getFileUrl();

            var value = args.value;

            if (value.Info.ContentId) {
                var fileUrl = dataSource.getFileUrl(metadataProperty);
                fileBinding.setFileUrl(fileUrl);
            }
            //if (typeof fileUrl === 'undefined' || fileUrl === null) {
            //}
        });

        dataSource.addDataBinding(fileBinding);

        //При сохранении существующего документа - загрузить файл
        dataSource.onBeforeItemSaved(function (context, message) {
            var item = message.value;
            var instanceId = InfinniUI.ObjectUtils.getPropertyValue(item, dataSource.getIdProperty());
            return uploadFile(instanceId);
        });

        //При сохранении нового документа - сохранить файл
        dataSource.onBeforeItemCreated(function (instanceId) {
            return uploadFile(instanceId);
        });

    }

    return fileBinding;
};
function ObjectBinding(view, items){
    var eventStore = new EventStore();

    var element;

    this.getView = function(){
        return view;
    };

    var value = items;


    this.getPropertyValue = function () {
        return items;
    };

    this.setPropertyValue = function(propertyValue){
        value = propertyValue;

        eventStore.executeEvent('onPropertyValueChanged', view.getContext(), { value: items })
    };

    this.onPropertyValueChanged = function(handler){
        eventStore.addEvent('onPropertyValueChanged', handler);
    };

    /**
     * Установить связанный с биндингом элеиент
     * @param {Element} value
     */
    this.setElement = function (value) {
        element = value;
    };

    /**
     * Получить связанный с биндингом элемент
     * @returns {Element}
     */
    this.getElement = function () {
        return element;
    };

    this.setPropertyValue(items);
}
function ObjectBindingBuilder(){

    this.build = function(builder,parent,metadata){

        return new ObjectBinding(parent, metadata.Value);
    }

}
var PropertyBinding = function (view, dataSource, property) {
    this.eventStore = new EventStore();
    this.view = view;
    this.dataSource = dataSource;
    this.property = property;
    this.propertyValue = null;
    this.element = null;
    this.setterName = 'setValue';
};


PropertyBinding.prototype.setSetterName = function (name) {
    this.setterName = name;
};

PropertyBinding.prototype.validate = function () {
    var exchange = this.view.getExchange();
    exchange.send(messageTypes.onValidate, {
        "dataSource": this.getDataSource(),
        "property": this.getProperty()
    });
};

PropertyBinding.prototype.onSetPropertyValue = function (handler) {
    this.eventStore.addEvent('onSetPropertyValue', handler);
};

PropertyBinding.prototype.onPropertyValueChanged = function (handler) {
    /** @TODO Избавиться от хардкода element.setValue **/
    var element = this.element;
    var setter = this.setterName;

    if (element) {
        var method = element[setter];
        if(/*this.propertyValue && */method/*this.element.setValue*/){
            method.call(element, this.getPropertyValue());
            //this.element.setValue(this.getPropertyValue());
        }
    }

    this.eventStore.addEvent('onPropertyValueChanged', handler);

    //если на момент подписки данные binding уже получены,
    //уведомляем подписчика об этих данных
    if(this.getPropertyValue()){
        this.invokeHandler('onPropertyValueChanged');
    }
};

PropertyBinding.prototype.getView = function () {
    return this.view;
};

PropertyBinding.prototype.getDataSource = function () {
    return this.dataSource;
};

PropertyBinding.prototype.getProperty = function () {
    return this.property;
};

PropertyBinding.prototype.invokeHandler = function(eventName){
    this.eventStore.executeEvent(eventName, this.view.getContext(), {
        dataSource: this.dataSource,
        property: this.property,
        value: this.getPropertyValue() });
};

PropertyBinding.prototype.getPropertyValue = function () {
    var value = this.propertyValue;

    /** @TODO Отрефакторить и вынести. дублирование в setPropertyValue **/
    if (value instanceof Date) {

    } else {
        value = (_.isArray(value) || _.isObject(value)) ? _.clone(value) : value;
    }

    return value;
};

PropertyBinding.prototype.setPropertyValue = function (value) {
    var oldValue = this.getPropertyValue();
    if (_.isEqual(value, oldValue)) {
        return;
    }

    //console.log(value);
    if (value instanceof Date) {
        this.propertyValue = value;
    } else {
        this.propertyValue = (_.isArray(value) || _.isObject(value)) ? _.clone(value) : value;
    }

    //this.propertyValue = value;
    this.invokeHandler('onSetPropertyValue');

    //при изменении значения со стороны внешнего компонента
    //(не визуального контрола и не данного PropertyBinding - например, со стороны BaseItemAction) требуется уведомить обоих
    //участников двустороннего binding.
    //В данный момент - ТЕХНИЧЕСКИЙ ДОЛГ
    //TODO: необходимо сделать посредника, который уведомляет об изменении значения propertyValue всех заинтересованных,
    //TODO: так как в данный момент binding является лишь двусторонним, а требуется сделать его n-сторонним
};

PropertyBinding.prototype.propertyValueChanged = function (value) {
    var oldValue = this.getPropertyValue();
    if (_.isEqual(value, oldValue)) {
        return;
    }

    /** @TODO Отраефакторить. убрать дублирование **/
    if (value instanceof Date) {
        this.propertyValue = value;
    } else {
        this.propertyValue = (_.isArray(value) || _.isObject(value)) ? _.clone(value) : value;
    }


    this.invokeHandler('onPropertyValueChanged');
};

/**
 * Установить связанный с биндингом элеиент
 * @param {Element} value
 */
PropertyBinding.prototype.setElement = function (value) {
    this.element = value;
};

/**
 * Получить связанный с биндингом элемент
 * @returns {Element}
 */
PropertyBinding.prototype.getElement = function () {
    return this.element;
};

PropertyBinding.prototype.bind = function (value) {
    //this.propertyValue = _.clone(value);

    this.propertyValueChanged(value);

    //Дублируется вызов onPropertyValueChanged в propertyValueChanged()
    //this.invokeHandler('onPropertyValueChanged');
};

var PropertyBindingBuilder = function () {

};

PropertyBindingBuilder.prototype.build = function (builder, parent, metadata, collectionProperty) {

    var metadataProperty = metadata.Property;

    if(collectionProperty){

        metadataProperty = collectionProperty.resolve(metadata.Property);
    }

    //dataSourceObject = parent.getDataSource(metadata.DataSource);

    var propertyBinding = new PropertyBinding(parent, metadata.DataSource, metadataProperty);


    if(metadata.DefaultValue) {
        propertyBinding.setPropertyValue(metadata.DefaultValue);
    }

    var dataSource = parent.getDataSource(metadata.DataSource);

    if(dataSource !== null){

        dataSource.addDataBinding(propertyBinding);

    }

    /** Переделать! **/
    propertyBinding.refresh = function (callback) {
        dataSource.resumeUpdate(callback);
    };

    return propertyBinding;
};
var FileBinding = function(view, dataSource, property){
    _.superClass(FileBinding, this, view, dataSource, property);

    this.file = null;
    this.fileUrl = null;
};

_.inherit(FileBinding, PropertyBinding);

_.extend(FileBinding.prototype, {

    setFile: function (file) {
        this.file = file;
    },

    getFile: function () {
        return this.file;
    },

    setFileUrl: function (fileUrl) {
        this.fileUrl = fileUrl;
    },

    //getPropertyValue: function () {
    //    var value = PropertyBinding.prototype.getPropertyValue.call(this);
    //
    //    return (typeof value === 'undefined' || value === null) ? null : this.fileUrl;
    //},

    getFileUrl: function () {
        var value = this.getPropertyValue();
        var fileUrl = null;
        if (typeof value !== 'undefined' && value !== null) {
            fileUrl = this.fileUrl;
            if (value.Info.ContentId && false === _.isEmpty(this.fileUrl)) {
                var hash = md5(JSON.stringify(value));
                fileUrl += '&hash=' + hash;
            }
        }
        return  fileUrl;
    }

});

function DataProviderREST(metadata, urlConstructor, successCallback, failCallback) {

    var queueReplaceItem = new DataProviderReplaceItemQueue();

    this.getItems = function (criteriaList, pageNumber, pageSize, sorting, resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructGetDocumentRequest(criteriaList, pageNumber, pageSize, sorting));
    };

    this.createItem = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructCreateDocumentRequest());
    };

    this.replaceItem = function (value, warnings, resultCallback) {

        var request = (function (resultCallback) {
            return function (data) {
                var request = new RequestExecutor(resultCallback, successCallback, failCallback);
                return request.makeRequest(urlConstructor.constructSetDocumentRequest(data.value, data.warnings));
            }
        })(resultCallback);

        queueReplaceItem.append({
            value: value,
            warnings: warnings
        }, request);

    };

    this.deleteItem = function (instanceId, resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructDeleteDocumentRequest(instanceId));
    };

    this.getItem = function (itemId, resultCallback, criteriaList) {
        var criteria = {
            "Property": "Id",
            "Value": itemId,
            "CriteriaType": 1
        };

        criteriaList = criteriaList || [];
        criteriaList.push(criteria);
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructGetDocumentRequest(criteriaList, 0, 1));
    };
}
function MetadataDataSourceProvider(urlConstructor, successCallback, failCallback) {

    this.getRegisteredConfigList = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback)
            .makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getConfigurationMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getDocumentListMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getDocumentMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getDocumentElementListMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getMenuListMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getMenuMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getValidationWarningMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };

    this.getValidationErrorMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(urlConstructor.constructMetadataRequest());
    };
}

function MetadataProviderREST(metadataUrlConstructor, successCallback, failCallback) {

    var makeRequest = function (requestData) {
        return $.ajax({
            type: 'post',
            url: requestData.requestUrl,
            data: JSON.stringify(requestData.args),
            contentType: "application/json;charset=UTF-8",
            success: successCallback,
            fail: failCallback
        });
    };

    this.getViewMetadata = function (resultCallback) {
        var data = metadataUrlConstructor.constructViewMetadataRequest();
        new RequestExecutor(resultCallback,successCallback,failCallback, this.cache).makeRequest(data);
    };

    this.getConfigMetadata = function (resultCallback) {

        new RequestExecutor(resultCallback, successCallback, failCallback).makeRequest(metadataUrlConstructor.constructConfigMetadataRequest());
    };


    this.getMenuMetadata = function (resultCallback) {
        new RequestExecutor(resultCallback, successCallback, failCallback, this.cache).makeRequest(metadataUrlConstructor.constructMenuMetadataRequest());
    };

    this.setCache = function (cache) {
        this.cache = cache;
    }


}
function QueryConstructorMetadata(host,metadata){

    var viewMetadataUrlTemplate = '{0}/systemconfig/StandardApi/metadata/getmanagedmetadata';

    var metadataUrlTemplate = '{0}/RestfulApi/StandardApi/configuration/getconfigmetadata';

    var metadataConfigListUrlTemplate = '{0}/RestfulApi/StandardApi/configuration/getconfigmetadatalist';

    var makeGetViewMetadataRequestParams = function() {
        return {
            "id": null,
            "changesObject": {
                "Configuration": metadata.ConfigId,
                "MetadataObject": metadata.DocumentId,
                "MetadataType": metadata.ViewType,
                "MetadataName": metadata.MetadataName,
                "Parameters": metadata.Parameters
            },
            "replace": false
        }
    };

    var makeGetConfigMetadataRequestParams = function() {
        return {
            "id": null,
            "changesObject":null,
            "replace":false
        }
    };

    var makeGetMenuMetadataRequestParams = function() {
        return {
            "id": null,
            "changesObject":{
                "Configuration":metadata.ConfigId,
                "MetadataType":'Menu'
             },
            "replace":false
        }
    };

    this.constructConfigMetadataRequest = function(){
        return {
            "requestUrl" : stringUtils.format(metadataConfigListUrlTemplate,[host]),
            "args" : makeGetConfigMetadataRequestParams()
        };
    };

    this.constructViewMetadataRequest = function(){
        return {
            "requestUrl" : stringUtils.format(viewMetadataUrlTemplate,[host]),
            "args" : makeGetViewMetadataRequestParams()
        };
    };

    this.constructMenuMetadataRequest = function(){
        return {
            "requestUrl" : stringUtils.format(metadataConfigListUrlTemplate,[host]),
            "args" : makeGetMenuMetadataRequestParams()
        };
    };

}
function QueryConstructorMetadataDataSource(host, metadata) {

    metadata = metadata || {};

    var urlTemplate = '{0}/RestfulApi/StandardApi/configuration/getConfigMetadata';
    var configId = metadata.ConfigId;
    var documentId = metadata.DocumentId;
    var metadataType = metadata.MetadataType;
    var metadataName = metadata.MetadataName;

    var getRequestParams = function() {
        var changesObject = 'null';

        if(configId || documentId|| metadataType || metadataName){
            changesObject = {};

            if(configId){
                changesObject.ConfigId = configId;
            }
            if(documentId){
                changesObject.DocumentId = documentId;
            }
            if(metadataType){
                changesObject.MetadataType = metadataType;
            }
            if(metadataName){
                changesObject.MetadataName = metadataName;
            }
        }

        return {
            "id": null,
            "changesObject": changesObject,
            "replace": false
        };
    };


    this.constructMetadataRequest = function(){
         return {
             "requestUrl" : stringUtils.format(urlTemplate,[host]),
             "args" : getRequestParams()
         };
    };


}
function QueryConstructorStandard(host, metadata) {

    var configId = metadata.ConfigId;
    var documentId = metadata.DocumentId;
    var createAction = metadata.CreateAction || 'CreateDocument';
    var getAction = metadata.GetAction || 'GetDocument';
    var updateAction = metadata.UpdateAction || 'SetDocument';
    var deleteAction = metadata.DeleteAction || 'DeleteDocument';

    if (documentId.indexOf(',') != -1) {
        getAction = 'GetDocumentCrossConfig';
    }

    var makeCreateDocumentRequestParams = function () {
        return {
            "id": null,
            "changesObject": {
                "Configuration": configId,
                "Metadata": documentId
            },
            "replace": false
        };
    };

    var makeGetDocumentRequestParams = function (filter, pageNumber, pageSize, sorting) {
        var params;

        if (getAction == 'GetDocumentCrossConfig') {
            params = {
                "id": null,
                "changesObject": {
                    "Configurations": configId.split(','),
                    "Documents": documentId.split(','),
                    "Filter": filter,
                    "PageNumber": pageNumber,
                    "PageSize": pageSize
                },
                "replace": false
            };
        } else {
            params = {
                "id": null,
                "changesObject": {
                    "Configuration": configId,
                    "Metadata": documentId,
                    "Filter": filter,
                    "PageNumber": pageNumber,
                    "PageSize": pageSize
                },
                "replace": false
            };
        }

        if (typeof sorting !== 'undefined' && sorting !== null && sorting.length > 0) {
            params.changesObject.Sorting = sorting;
        }

        return params;
    };

    var makeSetDocumentRequestParams = function (document, warnings) {
        var ignoreWarnings = warnings ? warnings : false;
        return {
            "id": null,
            "changesObject": {
                "Configuration": configId,
                "Metadata": documentId,
                "Document": document,
                "IgnoreWarnings": ignoreWarnings
            },
            "replace": false
        };
    };

    var makeDeleteDocumentRequestParams = function (instanceId) {
        return {
            "id": null,
            "changesObject": {
                "Configuration": configId,
                "Metadata": documentId,
                "Id": instanceId
            },
            "replace": false
        };
    };

    var constructUrl = function (host, action) {
        var urlTemplate = '{0}/{1}/StandardApi/{2}/{3}',
            document = 'configuration',
            api = 'RestfulApi';

        if (_.contains(['CreateDocument', 'GetDocument', 'SetDocument', 'DeleteDocument', 'GetDocumentCrossConfig'], action) == false) {
            document = documentId;
            api = configId;
        }

        return stringUtils.format(urlTemplate, [host, api, document, action]);
    };

    this.constructCreateDocumentRequest = function () {
        return {
            requestUrl: constructUrl(host, createAction),
            args: makeCreateDocumentRequestParams()
        };
    };

    this.constructGetDocumentRequest = function (filter, pageNumber, pageSize, sorting) {
        return {
            requestUrl: constructUrl(host, getAction),
            args: makeGetDocumentRequestParams(filter, pageNumber, pageSize, sorting)
        };
    };

    this.constructSetDocumentRequest = function (document, warnings) {
        return {
            requestUrl: constructUrl(host, updateAction),
            args: makeSetDocumentRequestParams(document, warnings)
        };
    };

    this.constructDeleteDocumentRequest = function (instanceId) {
        return {
            requestUrl: constructUrl(host, deleteAction),
            args: makeDeleteDocumentRequestParams(instanceId)
        };
    };
}
var RequestExecutorDataStrategy = function (type) {
    if (typeof this.strategies[type] === 'undefined') {
        this.strategy = this.strategies.json
    } else {
        this.strategy = this.strategies[type];
    }
};

RequestExecutorDataStrategy.prototype.request = function (requestData, successCallbackHandler, failCallbackHandler) {
    return this.strategy.apply(this, Array.prototype.slice.call(arguments));
};

RequestExecutorDataStrategy.prototype.strategies = {

    json: function (requestData, onSuccess, onFail) {
        return $.ajax({
            type: 'post',
            url: requestData.requestUrl,
            xhrFields: {
                withCredentials: true
            },
            success: onSuccess,
            error: onFail,
            data: JSON.stringify(requestData.args),
            contentType: "application/json;charset=UTF-8"
        });
    },

    raw: function (requestData, onSuccess, onFail) {

        return $.ajax({
            type: 'post',
            url: requestData.requestUrl,
            xhrFields: {
                withCredentials: true
            },
            success: onSuccess,
            error: onFail,
            processData: false,
            contentType: false,
            data: requestData.args
        });
    }
};

function RequestExecutor(resultCallback, successCallback, failCallback, cache) {

    var successCallbackHandler = function (data) {
        if (successCallback) {
            successCallback(data);
        }
        if (resultCallback) {
            resultCallback(data);
        }
    };

    var failCallbackHandler = function (err) {
        if (failCallback) {
            failCallback(err);
        }
        if (resultCallback) {
            resultCallback(err.responseJSON);
        }
    };

    var cacheRequest = function (requestData, request) {
        if (typeof cache === 'undefined' || cache === null) {
            return request(requestData);
        } else {
            var data = cache.get(requestData);
            if (data !== false) {
                console.log('Fetch from cache');
                var defer = $.Deferred();
                successCallbackHandler(data);
                defer.resolve(data);
                return defer.promise();
            }
            return request(requestData).then(function (data) {
                cache.set(requestData, data);
            });
        }
    };

    var request = function (type, requestData) {
        var strategy = new RequestExecutorDataStrategy(type);
        return strategy.request(requestData, successCallbackHandler, failCallbackHandler);
    };

    this.makeRequest = function (requestData) {
        return cacheRequest(requestData, request.bind(undefined, 'json'))
    };

    this.makeRequestRaw = function (requestData) {
        return cacheRequest(requestData, request.bind(undefined, 'raw'))
    };


}
function DataProviderRegister() {
    var dataProviders = [];

    this.register = function (metadataType, dataProviderConstructor) {
        dataProviders[metadataType] = dataProviderConstructor;
    };

    this.build = function (metadataType, metadataValue) {
        var dataProvider = dataProviders[metadataType];
        if (dataProvider !== undefined && dataProvider !== null) {
            return new dataProviders[metadataType](metadataValue);
        }
        return null;
    };
}


window.providerRegister = new DataProviderRegister();

var DataProviderUpload = function (urlConstructor, successCallback, failCallback) {
    this.urlConstructor = urlConstructor;
    this.successCallback = successCallback;
    this.failCallback = failCallback;
};

DataProviderUpload.prototype.uploadFile = function (fieldName, instanceId, file, resultCallback) {
    var requestData = this.urlConstructor.constructUploadFileRequest(fieldName, instanceId, file);
    new RequestExecutor(resultCallback, this.successCallback, this.failCallback).makeRequestRaw(requestData);
};

DataProviderUpload.prototype.getFileUrl = function (fieldName, instanceId) {
    return this.urlConstructor.getFileUrl(fieldName, instanceId);
};
/**
 * @class QueryConstructorUpload
 * @param host
 * @param metadata
 * @constructor
 */
var QueryConstructorUpload = function (host, metadata) {
    this.host = host;
    this.metadata = metadata;
};

/**
 * @public
 * @memberOf QueryConstructorUpload.prototype
 * @param fieldName
 * @param instanceId
 * @param file
 * @returns {{requestUrl: {String}, args: (FormData|*)}}
 */
QueryConstructorUpload.prototype.constructUploadFileRequest = function (fieldName, instanceId, file) {
    return {
        requestUrl: this.getUploadUrl(instanceId, fieldName),
        args: this.getUploadParams(file)
    };
};

/**
 * @public
 * @description Возвращает ссылкц на загруженный ранее файл
 * @memberOf QueryConstructorUpload.prototype
 * @param instanceId
 * @param fieldName
 * @returns {String}
 */
QueryConstructorUpload.prototype.getFileUrl = function (fieldName, instanceId) {

    if (typeof instanceId === 'undefined' || instanceId === null) {
        return null;
    }

    var data = {
        "Configuration": this.metadata.ConfigId,
        "Metadata": this.metadata.DocumentId,
        "DocumentId": instanceId,
        "FieldName": fieldName
    };
    var urlTemplate = '{0}/RestfulApi/UrlEncodedData/configuration/downloadbinarycontent/?Form={1}';

    return stringUtils.format(urlTemplate, [this.host, JSON.stringify(data)]);
};

/**
 * @protected
 * @memberOf QueryConstructorUpload.prototype
 * @param instanceId
 * @param fieldName
 * @returns {String}
 */
QueryConstructorUpload.prototype.getUploadUrl = function (instanceId, fieldName) {
    var data = {
        "Configuration": this.metadata.ConfigId,
        "Metadata": this.metadata.DocumentId,
        "DocumentId": instanceId,
        "FieldName": fieldName
    };
    var urlTemplate = '{0}/RestfulApi/Upload/configuration/uploadbinarycontent/?linkedData={1}';

    return stringUtils.format(urlTemplate, [this.host, JSON.stringify(data)]);
};


/**
 * @protected
 * @memberOf QueryConstructorUpload.prototype
 * @param file
 * @returns {FormData}
 */
QueryConstructorUpload.prototype.getUploadParams = function (file) {
    var data = new FormData();
    data.append('file', file);
    return data;
};


function ObjectDataProvider(metadata, items) {

    this.getItems = function (criteriaList, pageNumber, pageSize, sorting, resultCallback) {

        resultCallback(items);

    };

    this.createItem = function (resultCallback) {

        resultCallback({});
    };

    this.replaceItem = function (value, resultCallback) {

        for(var i = 0; i < items.length; i++){
            if(InfinniUI.ObjectUtils.getPropertyValue(items[i],metadata.IdProperty) === InfinniUI.ObjectUtils.getPropertyValue(value, metadata.IdProperty) ){
                items[i] = value;
                resultCallback(items[i]);
                break;
            }
        }

    };

    this.deleteItem = function (instanceId, resultCallback) {

        for(var i = 0; i < items.length; i++){
            if(InfinniUI.ObjectUtils.getPropertyValue(items[i], metadata.IdProperty) === instanceId ) {
                items.splice(i,1);
                resultCallback(items);
                break;
            }
        }
    };

    this.getItem = function (itemId, resultCallback) {
        for(var i = 0; i < items.length; i++){
            if(InfinniUI.ObjectUtils.getPropertyValue(items[i], metadata.IdProperty) === itemId ) {

                resultCallback(items[i]);
                break;
            }
        }

    };

}
/**
 *
 * @param parent
 * @param {BaseDataSource} dataSource
 * @constructor
 */
function DataSourceValidator (dataSource,  validationWarnings, validationErrors) {

    /**
     * Результат проверки на предупреждения
     */
    var warnings;

    /**
     * Результат проверки на ошибки
     */
    var errors;

    /**
     * Результат проверки (warnings && errors)
     */
    var success;

    /**
     * Проверка на валидность
     * @param {Boolean} ignoreWarnings Игнорировать предупреждения
     * @returns {boolean}
     */
    this.validate = function (ignoreWarnings) {
        ignoreWarnings = !!ignoreWarnings;

        resetResults();

        var selectedItem = dataSource.getSelectedItem();

        if (validationWarnings && !ignoreWarnings) {
            validationWarnings.validate("", selectedItem, warnings);
        }

        if (validationErrors && warnings.IsValid !== false ) {
            //Проверяем на ошибки ValidationErrors
            validationErrors.validate("", selectedItem, errors);
        }

        success = warnings.IsValid !== false && errors.IsValid !== false;

        return success;
    };


    /**
     * Уведомить элементы о результатах проверки
     */
    this.notifyElements = function (propertyName) {
        clearOldMessages(propertyName);

        if (success) {
            return;
        }

        notifyElement(warnings, propertyName);//Уведомление о предупреждениях
        notifyElement(errors, propertyName);  //Уведомление об ошибках
    };

    function clearOldMessages(propertyName){
        var bindings = dataSource.getDataBindings();
        var element;

        for (var j = 0; j < bindings.length; j++) {
            if (_.isEmpty(propertyName) === false) {
                if (bindings[j].property !== propertyName) {
                    continue;
                }
            }
            element = bindings[j].getElement();
            if (element && typeof element == 'object' && $.isFunction(element.setValidationState) ) {
                element.setValidationState('success', '');
            }
        }
    }

    /**
     * Уведомление элемента о необходимости изменить внешний виж по результатам валидации
     * @param {*} validationResult
     * @param {string} [prop]
     */
    function notifyElement (validationResult, prop) {
        if (validationResult.IsValid === true) {
            return;
        }

        var state = (validationResult === errors) ? 'error' : 'warning';

        var items = validationResult.Items || [];
        var bindings = dataSource.getDataBindings();
        var propertyName, message;
        var element;

        for (var i = 0; i < items.length; i = i + 1) {
            propertyName = items[i].Property;
            message = items[i].Message;

            if (_.isEmpty(propertyName) && _.isEmpty(prop)) {
                toastr.error(message);
            }
            for (var j = 0; j < bindings.length; j++) {
                if (bindings[j].getProperty() === propertyName) {
                    if (!_.isEmpty(prop) && propertyName !== prop) {
                        continue;
                    }
                    element = bindings[j].getElement();
                    if (typeof element !== 'undefined' && element !== null) {
                        element.setValidationState(state, message);
                    }
                }
            }
        }
    }

    /**
     * @private
     * Сброс результатов проверки
     */
    function resetResults() {
        warnings = {};
        errors = {};
    }
}
function BaseDataSource(view, idProperty, dataProvider) {

    this.eventStore = new EventStore();

    //public
    this.onPageNumberChanged = function (handler) {
        this.eventStore.addEvent('onPageNumberChanged', handler);
    };
    this.onPageSizeChanged = function (handler) {
        this.eventStore.addEvent('onPageSizeChanged', handler);
    };
    this.onItemDeleted = function (handler) {
        this.eventStore.addEvent('onItemDeleted', handler);
    };
    this.onBeforeItemSaved = function (handler) {
        this.eventStore.addEvent('onBeforeItemSaved', handler);
    };
    this.onItemSaved = function (handler) {
        this.eventStore.addEvent('onItemSaved', handler);
    };
    this.onTextFilterChanged = function (handler) {
        this.eventStore.addEvent('onTextFilterChanged', handler);
    };
    this.onPropertyFiltersChanged = function (handler) {
        this.eventStore.addEvent('onPropertyFiltersChanged', handler);
    };

    this.onBeforeItemCreated = function (handler) {
        this.eventStore.addEvent('onBeforeItemCreated', handler);
    };
    this.onItemCreated = function (handler) {
        this.eventStore.addEvent('onItemCreated', handler);
    };
    this.onItemsUpdated = function (handler) {
        return this.eventStore.addEvent('onItemsUpdated', handler);
    };
    this.onItemsDeleted = function (handler) {
        this.eventStore.addEvent('onItemsDeleted', handler);
    };

    //private
    var _criteriaConstructor;
    var fillCreatedItem = true;
    var idFilter = null;
    var name = null;
    var dataItems = [];
    var currentStrategy = null;
    var listStrategy = new ListDataSourceStrategy(this);
    var editStrategy = new EditDataSourceStrategy(this);

    var propertyFilters = [];
    var queryFilter = null;
    var textFilter = null;
    var selectedItem = null;

    var pageSize = null;
    var pageNumber = null;

    var sorting = null;

    var dataBindings = [];

    var suspended = false;

    this.isSuspended = function () {
        return suspended;
    };

    var _loadingProcess = $.Deferred();

    this.loading = _loadingProcess.promise();

    this.loadingProcessDone = function () {
        _loadingProcess.resolve();
    };

    //strategy by default
    currentStrategy = listStrategy;


    this.setCriteriaConstructor = function (criteriaConstructor) {
        _criteriaConstructor = criteriaConstructor;
    };

    this.getDataItems = function () {
        return dataItems;
    };

    this.setDataItems = function (value) {
        dataItems = value;
        currentStrategy.setDataItems(value);
        if (suspended) {
            suspended = false;
        }
        currentStrategy.onItemsUpdated(dataItems);
    };

    this.setSorting = function (value) {
        sorting = (typeof value === 'undefined') ? null : value;
    };

    this.getSorting = function () {
        return sorting;
    };

    var setListStrategy = function () {
        currentStrategy = listStrategy;
    };

    var setEditStrategy = function () {
        currentStrategy = editStrategy;
    };

    this.setUserStrategy = function (strategy) {
        currentStrategy = strategy;
    };

    var addOrUpdateItem = function (item) {
        if (dataItems.length == 1) {
            dataItems[0] = item;
        }
        else {
            //may be slow method to add
            dataItems.push(item);
        }
    };

    var removeById = function (item) {
        for (var i = 0; i < dataItems.length; i++) {
            if (dataItems[i].Id === item.Id) {
                var indexToSplice = i;
                break;
            }
        }
        if (indexToSplice !== undefined) {
            dataItems.splice(indexToSplice, 1);
        }
    };

    var resetModified = function (item) {
        if (item != null) {
            var index = modifiedItems.indexOf(item);
            if (index > -1) {
                modifiedItems.splice(index, 1);
            }
        }
    };


    this.suspendUpdate = function () {
        suspended = true;
    };

    this.resumeUpdate = function (callback) {
        if (suspended) {
            suspended = false;
        }
        this.updateItems(callback);
    };

    this.getPageNumber = function () {
        return pageNumber;
    };

    this.setPageNumber = function (value) {
        if (value < 0) {
            value = 0;
        }

        if (value !== pageNumber) {
            pageNumber = value;
            if (currentStrategy.onPageNumberChanged !== null) {
                currentStrategy.onPageNumberChanged(value);
            }
            this.updateItems();
        }
    };

    this.getPageSize = function () {
        return pageSize;
    };

    this.setPageSize = function (value) {
        if (value < 0) {
            value = 0;
        }
        else if (value > 1000) {
            value = 1000;
        }

        var isPageSizeChanging = pageSize !== value;

        pageNumber = 0;
        pageSize = value;

        if (isPageSizeChanging && !suspended) {
            currentStrategy.onPageNumberChanged(pageNumber);
            currentStrategy.onPageSizeChanged(value);

            this.updateItems();
        }
    };


    this.getName = function () {
        return name;
    };

    this.setName = function (value) {
        name = value;
    };

    this.getIdProperty = function () {
        return idProperty || 'Id';
    };

    this.setIdProperty = function (value) {
        idProperty = value;
    };

    this.getFillCreatedItem = function () {
        return fillCreatedItem;
    };

    this.setFillCreatedItem = function (value) {
        fillCreatedItem = value || false;
    };

    this.getIdFilter = function () {
        return idFilter;
    };

    this.setIdFilter = function (value) {
        if (idFilter !== value) {
            idFilter = value;
            this.updateItems();
        }
    };

    this.setEditMode = function () {
        setEditStrategy();
    };

    this.setListMode = function () {
        setListStrategy();
    };

    this.getView = function () {
        return view;
    };

    this.createItem = function () {
        dataProvider.createItem(
            function (data) {
                addOrUpdateItem(data);
                currentStrategy.onItemCreated(data);
                setModified(data);
            });
    };
    var warnings = false;

    this.showErrors = function(errors){
        if (_.isEmpty(errors) || errors.IsValid) {
            return;
        }
        if (errors.Message instanceof Array) {
            for (var i = 0; i < errors.Message.length; i++) {
                toastr.error(errors.Message[i].Message, "Ошибка!");
            }
        } else if(typeof errors.Message == 'string' && errors.Message.indexOf('{') >= 0){
            var result = JSON.parse(errors.Message);
            result = result.ValidationMessage &&
            result.ValidationMessage.ValidationErrors &&
            result.ValidationMessage.ValidationErrors.Message ? result.ValidationMessage.ValidationErrors.Message : 'Обратитесь к системному администратору';
            toastr.error(result, "Ошибка!");
        }else{
            toastr.error('Обратитесь к системному администратору', "Ошибка!");
        }
    };

    this.showWarnings = function(warnings){
        if (_.isEmpty(warnings) || warnings.IsValid) {
            return;
        }

        var resultText = warnings.Message[0].Message;
        for (var j = 1; j < warnings.Message.length; j++) {
            resultText += '<p><i class="fa-lg fa fa-warning" style="color: #45b6af; padding-right: 5px"></i>' + warnings.Message[j].Message;
        }
        resultText += '<p style="font-weight: bolder;">Продолжить добавление?';

        new MessageBox({
            text: resultText,
            buttons: [
                {
                    name: 'Да',
                    type: 'action',
                    onClick: attemptSave.bind(undefined, true)
                },
                {
                    name: 'Нет'
                }
            ]
        });
    };

    this.saveItem = function (item, onSuccess/*, onError*/) {
        var invokeCallback = function (callback) {
            if (typeof callback === 'function') {
                var args = Array.prototype.slice.call(arguments, 1);
                callback.apply(undefined, args);
            }
        };

        var idProperty = that.getIdProperty() || "Id";

        var self = this;

        var attemptSave = function (warnings) {
            dataProvider.replaceItem(item, warnings, function (data) {
                //TODO: убрать 'data.IsValid == undefined' когда заполнятся метаданные
                if ((data.IsValid || data.IsValid == undefined) ) {
                    if(!(data instanceof Array) && item != null) {
                        item[idProperty] = data.InstanceId;
                        addOrUpdateItem(item);
                        currentStrategy.onItemSaved(item, data);
                        resetModified(item);
                    }
                    invokeCallback(onSuccess, data);
                } else {
                    var validation = data.ValidationMessage;
                    self.showErrors(validation.ValidationErrors);
                    self.showWarnings(validation.ValidationWarnings);
                }
            });

        };

        attemptSave(warnings);
    };

    this.deleteItem = function (item) {
        var self = this;
        dataProvider.deleteItem(item, function (data) {
            if ((data.IsValid || data.IsValid == undefined) ) {
                removeById(item);
                currentStrategy.onItemDeleted(item);
            }else{
                var validation = data.ValidationMessage;
                self.showErrors(validation.ValidationErrors);
                self.showWarnings(validation.ValidationWarnings);
            }
        });
    };

    var loadItems = function (resultCallback) {
        currentStrategy.getItems(dataProvider, resultCallback);
    };

    this.getItems = function (resultCallback) {
        loadItems(resultCallback);
    };

    this.updateItems = function (callback) {
        if (!suspended) {
            loadItems(function (data) {

                dataItems = data;
                currentStrategy.onItemsUpdated(data);

                if (callback) {
                    callback(data);
                }
            });
        }
    };

    this.setQueryFilter = function (value, callback) {

        if (queryFilter !== value) {
            queryFilter = _criteriaConstructor(value);
            this.updateItems(callback);
        }
    };

    this.getQueryFilter = function () {
        return queryFilter;
    };

    this.setPropertyFilters = function (value) {
        if (propertyFilters !== value) {
            pageNumber = 0;
            propertyFilters = value;

            currentStrategy.onPageNumberChanged(0);
            currentStrategy.onPropertyFiltersChanged(value);
            this.updateItems();
        }
    };

    this.getPropertyFilters = function () {
        return propertyFilters;
    };

    this.getTextFilter = function () {
        return textFilter;
    };

    this.setTextFilter = function (value) {
        if (textFilter !== value) {
            pageNumber = 0;
            textFilter = value;
            var self = this;

            setTimeout(function () {
                currentStrategy.onPageNumberChanged(0);
                currentStrategy.onTextFilterChanged(value);
                self.updateItems();
            }, 30)
        }
    };

    this.addDataBinding = function (value) {
        if (value !== null) {
            dataBindings.push(value);

            value.onSetPropertyValue(onSetPropertyValueHandler);


            if (!suspended) {

                //устанавливаем значение элемента
                currentStrategy.bindItems(value, dataItems, this);

            }

        }
    };

    this.removeDataBinding = function (value) {
        var itemIndex = dataBindings.indexOf(value);
        if (itemIndex > -1) {
            dataBindings.splice(itemIndex, 1);

            //remove data binding problem
            value.removeOnSetPropertyValue(onSetPropertyValueHandler);
        }
    };

    this.getSelectedItem = function () {
        if (selectedItem === undefined || selectedItem === null) {
            return null;
        }

        return JSON.parse(JSON.stringify(selectedItem));
    };

    this.setSelectedItem = function (value) {
        var isEmpty = function (value) {
            return typeof value === 'undefined' || value === null;
        };

        if (isEmpty(value) || isEmpty(selectedItem)) {
            if (isEmpty(value) && isEmpty(selectedItem)) {
                return;
            }
        } else {
            if (JSON.stringify(selectedItem) === JSON.stringify(value)) {
                return;
            }
        }
        //TODO: Проверить работу selectedItem в ListBox
        //if (JSON.stringify(selectedItem) === JSON.stringify(value)) {
        //    return;
        //}

        selectedItem = currentStrategy.syncSelectedItem(value);
        currentStrategy.onSelectedItemChanged(selectedItem);
    };

    this.getDataBindings = function () {
        return dataBindings;
    };

    var that = this;

    var onSetPropertyValueHandler = function (context, args) {
        var propertyName = args.property;
        var propertyValue = args.value;

        if (propertyName !== undefined && propertyName !== null) {
            var selectedItem = that.getSelectedItem();

            if (selectedItem === null) {
                selectedItem = {};
            }
            if (selectedItem !== null) {
                if (propertyName.length > 2 && propertyName.substring(0, 2) === '$.') {
                    InfinniUI.ObjectUtils.setPropertyValue(selectedItem, propertyName.substr(2), propertyValue);
                }
                else if (propertyName !== '$') {
                    InfinniUI.ObjectUtils.setPropertyValue(selectedItem, propertyName, propertyValue);
                }
                else {
                    for (var property in selectedItem) {
                        delete(selectedItem[property]);
                    }

                    for (var property in propertyValue) {
                        selectedItem[property] = propertyValue[property];
                    }
                }
                that.setSelectedItem(selectedItem);
                setModified(selectedItem);
            }

            var bindings = that.getDataBindings();
            for (var i = 0; i < bindings.length; i++) {
                if (bindings[i].getProperty() === propertyName) {
                    bindings[i].propertyValueChanged(propertyValue);
                }
            }

            that.eventStore.executeEvent('onSelectedItemModified');
        }
    };

    this.onSelectedItemChanged = function (action) {
        this.eventStore.addEvent('onSelectedItemChanged', action);
    };

    this.onSelectedItemModified = function (action) {
        this.eventStore.addEvent('onSelectedItemModified', action);
    };

    //Добавляем событие по умолчанию (уведомление всех датабиндингов)
    this.onSelectedItemChanged(function (context, args) {
        var selectedItem = args.value;

        for (var i = 0; i < dataBindings.length; i++) {
            var propertyName = dataBindings[i].getProperty();

            if (/^\d+/.test(propertyName)) {
                /**
                 * @TODO Костыль! Чтобы при изменении выбранного элемента, в привязки для ItemTemplate не вкидывались
                 * неверные данные из selectedItem
                 */
            } else if (propertyName) {
                if (propertyName.length > 2 && propertyName.substring(0, 2) === '$.') {
                    var propertyValue = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, propertyName.substring(2, propertyName.length));
                }

                else if (propertyName !== '$') {
                    var propertyValue = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, propertyName); //selectedItem[propertyName];
                }

                else {
                    var propertyValue = selectedItem;
                }

                dataBindings[i].propertyValueChanged(propertyValue);
            }
        }
    });

    this.onItemsUpdated(function (context, args) {
        var items = args.value;
        _.each(dataBindings, function (binding) {
            if (binding.property === '$') {
                var value = this.getSelectedItem();
            } else if (/^\$\..+$/.test(binding.property)) {
                var value = InfinniUI.ObjectUtils.getPropertyValue(this.getSelectedItem(), binding.property.substr(2));
            } else {
                var value = InfinniUI.ObjectUtils.getPropertyValue(items, binding.property);
            }
            binding.bind(value);
        }, that);
    });


    var modifiedItems = [];

    this.isModifiedItems = function () {
        return modifiedItems.length > 0;
    };

    this.isModified = function (value) {
        var isModified = value != null && value !== undefined;
        if (!isModified) {
            return false;
        }
        else {
            var index = modifiedItems.indexOf(value);
            return index > -1;
        }
    };

    var setModified = function (value) {
        if (value != null) {
            modifiedItems.push(value);
        }
    };


}

function isMainDataSource(ds) {
    return ds.getName() == 'MainDataSource';
}
function BaseDataSourceBuilder() {

    this.build = function (metadata, dataSource, parent, builder) {

        dataSource.suspendUpdate();
        dataSource.setName(metadata.Name);
        dataSource.setFillCreatedItem(metadata.FillCreatedItem);
        dataSource.setSorting(metadata.Sorting);
        dataSource.setPageSize(metadata.PageSize || 15);
        dataSource.setPageNumber(metadata.PageNumber || null);

        var criteriaConstructor = function (data) {
            //Добавлен
            var criteria;

            if (typeof data === 'undefined' || data === null) {
                return;
            }


            if (_.isArray(data)) {
                //Переданы метаданные для создания Criteria
                criteria = builder.buildType(parent, 'Criteria', data);
            } else {
                //Передан созданный экземпляр. Добавлено для совместимости со старой реализацией.
                criteria = data;
            }
            return criteria;
        };

        dataSource.setCriteriaConstructor(criteriaConstructor);

        var queryFilter = builder.buildType(parent, 'Criteria', metadata.Query);

        queryFilter.onValueChanged(function () {
            dataSource.updateItems();
        });

        dataSource.setQueryFilter(queryFilter);

        this.initScriptsHandlers(parent, metadata, dataSource);

        buildValidation.apply(this, arguments);

        var exchange = parent.getExchange();
        exchange.subscribe(messageTypes.onLoading, function () {
            dataSource.resumeUpdate();
        });
        exchange.subscribe(messageTypes.onSetSelectedItem, function (value) {
            if (dataSource.getName() === value.dataSource && !value.property) {
                dataSource.setSelectedItem(value.value);
            }
        });
        exchange.subscribe(messageTypes.onSetTextFilter, function (value) {
            if (value.dataSource === dataSource.getName()) {
                dataSource.setTextFilter(value.value);
            }
        });
        exchange.subscribe(messageTypes.onSetPropertyFilters, function (value) {
            if (value.dataSource === dataSource.getName()) {
                dataSource.setPropertyFilters(value.value);
            }
        });
        exchange.subscribe(messageTypes.onSetPageNumber, function (value) {
            if (value.dataSource === dataSource.getName()) {
                dataSource.setPageNumber(value.value);
            }
        });
        exchange.subscribe(messageTypes.onSetPageSize, function (value) {
            if (value.dataSource === dataSource.getName()) {
                dataSource.setPageSize(value.value);
            }
        });
    };

    this.initScriptsHandlers = function (parent, metadata, dataSource) {
        //Скриптовые обработчики на события
        if (parent) {
            dataSource.onSelectedItemChanged(function () {
                var exchange = parent.getExchange();
                exchange.send(messageTypes.onSelectedItemChanged, {
                    DataSource: dataSource.getName(),
                    Value: dataSource.getSelectedItem()
                });

                if (metadata.OnSelectedItemChanged) {
                    new ScriptExecutor(parent).executeScript(metadata.OnSelectedItemChanged.Name);
                }
            });
        }

        if (parent && metadata.OnItemsUpdated) {
            dataSource.onItemsUpdated(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnItemsUpdated.Name);
            });
        }

        if (parent && metadata.OnSelectedItemModified) {
            dataSource.onSelectedItemModified(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnSelectedItemModified.Name);
            });
        }

        if (parent && metadata.OnItemDeleted) {
            dataSource.onItemDeleted(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnItemDeleted.Name);
            });
        }
    };

    /**
     * Создает компонент для валидации
     * @param metadata
     * @param dataSource
     * @param parent
     * @param builder
     */
    function buildValidation(metadata, dataSource, parent) {
        var builder = new ValidationBuilder(),
            validationErrors, validationWarnings;

        if (typeof metadata.ValidationErrors !== 'undefined') {
            validationErrors = builder.build(undefined, parent, metadata.ValidationErrors);
        }

        if (typeof metadata.ValidationWarnings !== 'undefined') {
            validationWarnings = builder.build(undefined, parent, metadata.ValidationWarnings);
        }

        dataSource.validation = new DataSourceValidator(dataSource, validationWarnings, validationErrors);

        var exchange = parent.getExchange();
        exchange.subscribe(messageTypes.onValidate, function (message) {
            if (message && message.dataSource === dataSource.getName()) {
                dataSource.validation.validate();
                dataSource.validation.notifyElements(message.property);
            }
        });
    }

}

function BaseDataSourceStrategy() {
}

BaseDataSourceStrategy.prototype.invokeEvent = function (eventName, value) {
    var context = this.dataSource.getView().getContext(),
        args = { value: value };

    this.dataSource.eventStore.executeEvent(eventName, context, args);
};

BaseDataSourceStrategy.prototype.invokeEventAsync = function (eventName, value, callback) {
    var context = this.dataSource.getView().getContext(),
        args = { value: value };

    this.dataSource.eventStore.executeEventAsync(eventName, context, args, callback);
};

BaseDataSourceStrategy.prototype.syncSelectedItem = function (value) {
    return value;
};

BaseDataSourceStrategy.prototype.setDataItems = function (value) {
    return value;
};

BaseDataSourceStrategy.prototype.onSelectedItemChanged = function (value) {
    this.invokeEvent('onSelectedItemChanged', value);
};

/**
 * @description Организация очереди запросов на создание/изменение документа.
 * Признак одного и того же документа по атрибутам Id или __Id (@see {@link EditDataSourceStrategy.getItems})
 * @param attributes
 * @constructor
 */
var DataProviderReplaceItemQueue = function (attributes) {
    var _attributes = attributes || [];
    var _queue = [];
    var requestIdProperty = '__Id';

    var getQueueItemCriteria = function (data) {
        var criteria = _.pick(data, _attributes);
        var idProperty = _.isEmpty(data[requestIdProperty]) ? 'Id' : requestIdProperty;
        criteria[idProperty] = data[idProperty];
        return criteria;
    };

    var getQueueItem = function (data) {
        return _.findWhere(_queue, getQueueItemCriteria(data));
    };

    var getQueueItems = function (data) {
        return _.where(_queue, getQueueItemCriteria(data));
    };

    var updateInstanceId = function (data, response) {
        var items = getQueueItems(data);
        items.forEach(function (item) {
            item.Id = response.InstanceId;
            item.value.Id = response.InstanceId;
        });
    };

    var next = function (data) {
        var index = _queue.indexOf(data);
        if (index === -1) {
            console.error('DataProviderReplaceItemQueue: Не найден запрос в очереди');
        }
        _queue.splice(index, 1);
        var item = getQueueItem(data);
        run(item);
    };

    var run = function (data) {
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        data.request(data)
            .done(updateInstanceId.bind(undefined, data))
            .always(next.bind(undefined, data));
    };


    this.append = function (data, request) {
        var item = _.defaults(data, _.pick(data.value, ['Id', requestIdProperty]));
        item.request = request;

        var items = getQueueItems(item);
        _queue.push(item);

        if (items.length === 0) {
            //В очереди нет запросов с заданными параметрами
            run(data);
        } else if (items.length > 1) {
            //В очереди несколько элементов, удаляем промежуточные
            for (var i = 1, ln = items.length; i < ln; i = i + 1) {
                var index = _queue.indexOf(items[i]);
                _queue.splice(index, 1);
            }
        }
    };

};
function DocumentDataSource(view, metadata) {

    var dataProviderUpload = window.providerRegister.build('UploadDocumentDataSource', metadata);

    var baseDataSource = new BaseDataSource(view, metadata.IdProperty, window.providerRegister.build('DocumentDataSource',metadata));

    baseDataSource.uploadFile = function (fieldName, instanceId, file, resultCallback) {
        dataProviderUpload.uploadFile(fieldName.replace(/^\$\./, ''), instanceId, file, resultCallback);
    };

    baseDataSource.getFileUrl = function (propertyName) {

        var selectedItem = baseDataSource.getSelectedItem();
        var instanceId;
        var idProperty = this.getIdProperty();
        var fieldName;

        if (propertyName) {

            if (/^\d+\..*$/g.test(propertyName)) {
                var matches = propertyName.match(/^(\d+)(.*)$/);
                if (matches && matches.length === 3) {
                    if (matches[2].substr(0,1) === '.') {
                        instanceId = InfinniUI.ObjectUtils.getPropertyValue(this.getDataItems(), matches[1] + '.' + idProperty);
                        fieldName = matches[2].substr(1);
                    }
                }
            } else if (/^\$\..+$/.test(propertyName)) {
                instanceId = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, idProperty);
                fieldName = propertyName.substr(2);
            } else {
                instanceId = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, idProperty);
                fieldName = propertyName;
            }
        }
        return fieldName ? dataProviderUpload.getFileUrl(fieldName, instanceId) : null;

        //
        //var selectedItem = baseDataSource.getSelectedItem();
        //var instanceId = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, this.getIdProperty());
        //return dataProviderUpload.getFileUrl(fieldName, instanceId);
    };


    baseDataSource.getDocumentId = function () {
        return metadata.DocumentId;
    };

    baseDataSource.getConfigId = function () {
        return metadata.ConfigId;
    };

    baseDataSource.getCreateAction = function(){
        return metadata.CreateAction;
    };

    baseDataSource.getGetAction = function(){
        return metadata.GetAction;
    };

    baseDataSource.getUpdateAction = function(){
        return metadata.UpdateAction;
    };

    baseDataSource.getDeleteAction = function(){
       return metadata.DeleteAction;
    };

    return baseDataSource;
}

function DocumentDataSourceBuilder() {

    this.build = function (builder, parent, metadata) {

        var idProperty = metadata.IdProperty;
        if (idProperty == undefined) {
            idProperty = 'Id';
        }
        var dataSource = new DocumentDataSource(parent, metadata);
        new BaseDataSourceBuilder().build(metadata, dataSource, parent, builder);

        return dataSource;
    }
}

function EditDataSourceStrategy(dataSource) {

    this.dataSource = dataSource;
    this.getItems = function (dataProvider, resultCallback) {
        var itemId = dataSource.getIdFilter();

        var callback = function () {
            var args = Array.prototype.slice.call(arguments);
            if (resultCallback) {
                resultCallback.apply(undefined, args);
            }
            dataSource.loadingProcessDone();
        };

        /**
         * @description Добавляет идентификатор запроса. @see {@link DataProviderRequestQueue}
         */
        var setLocalId = function (data) {
            data['__Id'] = guid();
            return data;
        };

        var newItem = function () {
            var selectedItem = dataSource.getSelectedItem();
            if (selectedItem !== null && typeof selectedItem !== 'undefined') {
                //Если редактируется существующий элемент - возвращаем его же.
                callback(dataSource.getDataItems());
                return;
            }

            var createItem = dataSource.getFillCreatedItem();

            if (createItem === true) {
                dataProvider.createItem(function (data) {
                    callback([setLocalId(data)]);
                });
            }
            else {
                callback([
                    setLocalId({})
                ]);
            }

        };

        if (itemId !== null) {
            dataProvider.getItem(itemId, function (item) {
                if (item === null) {
                    newItem();
                }
                if (item && item.length > 0) {
                    callback([item[0]]);
                }
                else {
                    throw stringUtils.format('document with identifier {0} not found.', [itemId]);
                }

            });
        }
        else {
            newItem();
        }
    };

    this.bindItems = function (dataBinding, items) {
        //dataBinding.bind(items[0]);
        var propertyName = dataBinding.getProperty();
        var propertyValue;

        if (typeof propertyName !== 'undefined' && propertyName !== null && propertyName !== '') {
            if(propertyName == '$'){
               propertyValue = items[0];
            }else if(/^\$\..+$/.test(propertyName)){
               propertyValue = InfinniUI.ObjectUtils.getPropertyValue(items[0], propertyName.substr(2));
            }else{
                propertyValue = InfinniUI.ObjectUtils.getPropertyValue(items[0], propertyName);
            }
        } else {
            propertyValue = items[0];
        }
        dataBinding.bind(propertyValue);
    };


    this.onPageNumberChanged = function (value) {
    };

    this.onPageSizeChanged = function (value) {
    };

    this.onPropertyFiltersChanged = function (value) {

    };

    this.onTextFilterChanged = function (value) {

    };

    this.onBeforeItemSaved = function (value, result) {

    };

    this.onItemSaved = function (value, result) {

        var idProperty = this.dataSource.getIdProperty();
        var instanceId = InfinniUI.ObjectUtils.getPropertyValue(value, idProperty);

        if (typeof instanceId === 'undefined' || instanceId === null) {
            var instanceId = InfinniUI.ObjectUtils.getPropertyValue(result, 'InstanceId');
            InfinniUI.ObjectUtils.setPropertyValue(value, idProperty, instanceId);
        }


        this.invokeEventAsync('onBeforeItemSaved', value, function () {
            this.invokeEvent('onItemSaved', value);
        }.bind(this));
    };

    this.onBeforeItemCreated = function (value) {
        this.invokeEvent('onBeforeItemCreated', value);
    };

    /**
     * @param {Object} value
     * @param {String} value.InstanceId Идентификатор созданного документа
     * @param {String} value.ActionId
     * @param {String} value.ConfigId
     * @param {String} value.DocumentId
     */
    this.onItemCreated = function (value) {
        var instanceId = value.InstanceId;
        this.invokeEventAsync('onBeforeItemCreated', instanceId, function () {
            this.invokeEvent('onItemCreated', instanceId);
        }.bind(this));
    };

    this.onItemDeleted = function (value) {
        this.invokeEvent('onItemDeleted', value);
    };

    this.onItemsUpdated = function (value) {


        // Выделение первого элемента в списке, чтобы сработала привязка данных
        dataSource.setSelectedItem(value ? value[0] : null);

        this.invokeEvent('onItemsUpdated', value[0]);
    };

    this.onError = function (value) {
        this.invokeEvent('onError', value);
    };

    /**
     * Для правильной привязки в методе {@link BaseDataSource.addDataBinding} необходимо,
     * чтобы selectedItem указывал на экземпляр данных {@link BaseDataSource.dataItems}.
     *
     * @param value
     * @returns {*}
     */
    this.syncSelectedItem = function (value) {
        var dataItems = this.dataSource.getDataItems();
        if (typeof value === 'undefined' || value === null) {
            //value = {};
            return value;
        }

        var index = dataItems.indexOf(value);
        var selectedItem = value;

        if (index === -1 && dataItems[0]) {
            var i;
            selectedItem = dataItems[0];
            for (i in selectedItem) {
                if (selectedItem.hasOwnProperty(i)) {
                    delete selectedItem[i];
                }
            }
            for (i in value) {
                if (!value.hasOwnProperty(i)) continue;
                selectedItem[i] = value[i];
            }
        }
        return selectedItem;
    }
}


EditDataSourceStrategy.prototype = BaseDataSourceStrategy.prototype;
function ItemsDataSourceStrategy(dataSource, metadata) {

    this.dataSource = dataSource;
    var strategy = this;
    var dataItems;

    dataItems = metadata.Items;
    dataSource.setDataItems(metadata.Items);

    this.getItems = function (dataProvider, resultCallback) {
        var textFilter = this.dataSource.getTextFilter();
        var filtered = [];
        if (false === _.isEmpty(textFilter) && _.isArray(dataItems)) {
            for (var i = 0, ln = dataItems.length; i < ln; i = i + 1) {
                if (JSON.stringify(dataItems[i]).indexOf(textFilter) === -1) continue;
                filtered.push(dataItems[i]);
            }
            resultCallback(filtered);
            return;
        }
        resultCallback(dataItems);
        dataSource.loadingProcessDone();
    };

    this.onItemsUpdated = function (value) {
        strategy.invokeEvent('onItemsUpdated', value);
    };

    this.bindItems = function (dataBinding, items, datasource) {
        var propertyName = dataBinding.getProperty();
        if (propertyName === '$') {
            dataBinding.bind(datasource.getSelectedItem());
        } else if (/^\$\..+$/.test(propertyName)) {
            dataBinding.bind(InfinniUI.ObjectUtils.getPropertyValue(datasource.getSelectedItem(), propertyName.substr(2)));
        } else if (propertyName !== null && typeof propertyName !== 'undefined') {
            dataBinding.bind(InfinniUI.ObjectUtils.getPropertyValue(items, propertyName));
        } else {
            dataBinding.bind(items);
        }
    };

    this.onPageNumberChanged = function (value) {
        strategy.invokeEvent('onPageNumberChanged', value);
    };

    this.onPageSizeChanged = function (value) {
        strategy.invokeEvent('onPageSizeChanged', value);
    };

    this.onTextFilterChanged = function (value) {
        strategy.invokeEvent('onTextFilterChanged', value);
    };

    this.setDataItems = function (value) {
        dataItems = value;
    };
}

ItemsDataSourceStrategy.prototype = BaseDataSourceStrategy.prototype;
function ListDataSourceStrategy(dataSource) {

    this.dataSource = dataSource;
    this.getItems = function (dataProvider, resultCallback) {

        var dataSource = this.dataSource;
        var callback = function () {
            var args = Array.prototype.slice.call(arguments);
            if (resultCallback) {
                resultCallback.apply(undefined, args);
            }
            dataSource.loadingProcessDone();
        };

        var criteriaList = dataSource.getPropertyFilters().slice();
        if (dataSource.getTextFilter()) {
            var fullTextSearchCriteria = {
                Property: '',
                CriteriaType: toEnum('FullTextSearch'), //full text search enumeration back-end service value
                Value: dataSource.getTextFilter()
            };
            criteriaList.push(fullTextSearchCriteria);
        }

        var queryFilter = dataSource.getQueryFilter();
        if (typeof queryFilter !== 'undefined'  && queryFilter !== null) {
            Array.prototype.push.apply(criteriaList, queryFilter.getAsArray());
        }

        var pageNumber = dataSource.getPageNumber();
        var pageSize = dataSource.getPageSize();

        dataProvider.getItems(criteriaList, pageNumber, pageSize, dataSource.getSorting(), callback);
    };

    this.bindItems = function (dataBinding, items, datasource) {
        var propertyName = dataBinding.getProperty();
        if (propertyName === '$') {
            dataBinding.bind(datasource.getSelectedItem());
        } else if (/^\$\..+$/.test(propertyName)) {
            dataBinding.bind(InfinniUI.ObjectUtils.getPropertyValue(datasource.getSelectedItem(), propertyName.substr(2)));
        } else if (propertyName !== null && typeof propertyName !== 'undefined') {
            dataBinding.bind(InfinniUI.ObjectUtils.getPropertyValue(items, propertyName));
        } else {
            dataBinding.bind(items);
        }
    };

    this.onPageNumberChanged = function (value) {
        strategy.invokeEvent('onPageNumberChanged', value);
    };

    this.onPageSizeChanged = function (value) {
        strategy.invokeEvent('onPageSizeChanged', value);
    };

    this.onPropertyFiltersChanged = function (value) {
        strategy.invokeEvent('onPropertyFiltersChanged', value);
    };

    this.onTextFilterChanged = function (value) {
        strategy.invokeEvent('onTextFilterChanged', value);
    };

    this.onBeforeItemSaved = function (value, callback) {
        strategy.invokeEvent('onBeforeItemSaved', value);
    };

    this.onItemSaved = function (value) {
        strategy.invokeEvent('onItemSaved', value);
    };

    this.onBeforeItemCreated = function (value) {
        strategy.invokeEvent('onBeforeItemCreated', value);
    };

    this.onItemCreated = function (value) {
        strategy.invokeEvent('onItemCreated', value);
    };

    this.onItemDeleted = function (value) {
        strategy.invokeEvent('onItemDeleted', value);
    };

    this.onItemsUpdated = function (value) {
        strategy.invokeEvent('onItemsUpdated', value);
        strategy.restoreSelectedItem();
    };

    this.onError = function (value) {
        strategy.invokeEvent('onError', value);
    };

    this.restoreSelectedItem = function () {
        var ds = this.dataSource;
        var selectedItem = ds.getSelectedItem();
        var items = ds.getDataItems();
        if (!_.isEmpty(selectedItem)) {
            var idProperty = ds.getIdProperty();
            var id = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, idProperty);
            var item = _.find(items, function (item) {
                return InfinniUI.ObjectUtils.getPropertyValue(item, idProperty) == id;
            });

            ds.setSelectedItem(item);
        }
    };

    var strategy = this;
}

ListDataSourceStrategy.prototype = BaseDataSourceStrategy.prototype;

function MetadataDataSource(view, metadata) {

    var  provider = window.providerRegister.build('MetadataInfoDataSource', metadata);

    var baseDataSource = new BaseDataSource(view, metadata.IdProperty, provider);

    baseDataSource.getRegisteredConfigList = function (resultCallback) {
        provider.getRegisteredConfigList(resultCallback);
    };

    baseDataSource.getConfigurationMetadata = function (resultCallback) {
        provider.getConfigurationMetadata(resultCallback);
    };

    baseDataSource.getDocumentListMetadata = function (resultCallback) {
        provider.getDocumentListMetadata(resultCallback);
    };

    baseDataSource.getDocumentMetadata = function (resultCallback) {
        provider.getDocumentMetadata(resultCallback);
    };

    baseDataSource.getDocumentElementListMetadata = function (resultCallback) {
        provider.getDocumentElementListMetadata(resultCallback);
    };

    baseDataSource.getMenuListMetadata = function (resultCallback) {
        provider.getMenuListMetadata(resultCallback);
    };

    baseDataSource.getMenuMetadata = function (resultCallback) {
        provider.getMenuMetadata(resultCallback);
    };

    baseDataSource.getValidationWarningMetadata = function (resultCallback) {
        provider.getValidationWarningMetadata(resultCallback);
    };

    baseDataSource.getValidationErrorMetadata = function (resultCallback) {
        provider.getValidationErrorMetadata(resultCallback);
    };



    return baseDataSource;
}

function MetadataDataSourceBuilder() {

    this.build = function (builder, parent, metadata) {

        var idProperty = metadata.IdProperty || 'Id';

        var dataSource = new MetadataDataSource(parent, metadata);
        new BaseDataSourceBuilder().build(metadata, dataSource, parent, builder);

        return dataSource;
    }
}

function ObjectDataSource(view, metadata) {
    var dataProviderUpload = window.providerRegister.build('UploadDocumentDataSource', metadata);

    var baseDataSource = new BaseDataSource(view, metadata.IdProperty, window.providerRegister.build('ObjectDataSource',metadata));

    baseDataSource.uploadFile = function (fieldName, instanceId, file, resultCallback) {
        dataProviderUpload.uploadFile(fieldName.replace(/^\$\./, ''), instanceId, file, resultCallback);
    };

    baseDataSource.getFileUrl = function (propertyName) {

        var selectedItem = baseDataSource.getSelectedItem();
        var instanceId;
        var idProperty = this.getIdProperty();
        var fieldName;

        if (propertyName) {

            if (/^\d+\..*$/g.test(propertyName)) {
                var matches = propertyName.match(/^(\d+)(.*)$/);
                if (matches && matches.length === 3) {
                    if (matches[2].substr(0,1) === '.') {
                        instanceId = InfinniUI.ObjectUtils.getPropertyValue(this.getDataItems(), matches[1] + '.' + idProperty);
                        fieldName = matches[2].substr(1);
                    }
                }
            } else if (/^\$\..+$/.test(propertyName)) {
                instanceId = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, idProperty);
                fieldName = propertyName.substr(2);
            } else {
                instanceId = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, idProperty);
                fieldName = propertyName;
            }
        }
        return fieldName ? dataProviderUpload.getFileUrl(fieldName, instanceId) : null;

        //
        //var selectedItem = baseDataSource.getSelectedItem();
        //var instanceId = InfinniUI.ObjectUtils.getPropertyValue(selectedItem, this.getIdProperty());
        //return dataProviderUpload.getFileUrl(fieldName, instanceId);
    };

    // timeout нужен для работающего биндинга к objectdatasource, объявленного в разделе datasources. Причина не до конца ясна.
    //setTimeout(function(){
        //baseDataSource.eventStore.executeEvent('onItemsUpdated', {}, {value: metadata.Items});
        //baseDataSource.loadingProcessDone();
    //}, 30);

    return baseDataSource;

}
function ObjectDataSourceBuilder() {

    this.build = function (builder, parent, metadata) {

        var dataSource = new ObjectDataSource(parent, metadata);
        new BaseDataSourceBuilder().build(metadata, dataSource, parent, builder);

        dataSource.setUserStrategy(new ItemsDataSourceStrategy(dataSource, metadata));

        return dataSource;
    }
}
function Parameter(){

    var _name;
    var _value;
    var _bindings = [];

    var notifyOnValueChanged = function () {
        for(var i = 0; i < onValueChangedHandlers.length; i++){
            //Уведомление от DataBinding об изменившемся значении
            onValueChangedHandlers[i](null, _value);
        }
    };


    /**
     * @description Уведомить PropertyBinding об изменении значения
     */
    var notifyParameterBinding = function () {
        for (var i = 0, ln = _bindings.length; i < ln; i = i + 1) {
            _bindings[i].propertyValueChanged(_value);
        }
    };

    this.getName = function(){
        return _name;
    };

    this.setName = function(value){
        _name = value;
    };

    this.getValue = function() {
        return _value;
    };

    /**
     * @description Установка значения из источника данных
     * @param value
     */
    this.setValue = function(value){
        if (_.isEqual(value, _value)) {
            return;
        }
        _value = value;
        notifyOnValueChanged();
        notifyParameterBinding();
    };

    /**
     *
     * @param {ParameterBinding} binding
     */
    this.addDataBinding = function (binding) {
        if (typeof binding === 'undefined' || binding === null) {
            return;
        }
        //Подписка на изменение значения в элементе
        binding.onSetPropertyValue(onSetPropertyValueHandler);
        //Установка текущего значения
        binding.propertyValueChanged(this.getValue());
        _bindings.push(binding);
    };

    var onValueChangedHandlers = [];

    this.onValueChanged = function(handler) {
        onValueChangedHandlers.push(handler);
    };

    /**
     * @description Обработчик изменения значения в элементе.
     * Устанавливает значение в параметре
     * @param context
     * @param args
     */
    var onSetPropertyValueHandler = function (context, args) {
        var propertyName = args.property;
        var propertyValue = args.value;

        if (propertyName !== undefined && propertyName !== null) {
            InfinniUI.ObjectUtils.setPropertyValue(_value, propertyName, propertyValue);
        } else {
            _value = propertyValue;
        }

        //@TODO Сгенерировать событие для уведомления об изменении значения параметра
    }
}

function ParameterBuilder() {

    this.build = function(builder,parent,metadata){

        if(metadata.Value){
            var parameter = new Parameter();

            parameter.setName(metadata.Name);

            var dataBinding = builder.build(parent, metadata.Value);

            //если существует Builder для хранящегося в параметре значения
            //то создаем этим Builder'ом объект (PropertyBinding, ObjectBinding, ParameterBinding)
            //иначе устанвливаем в параметре значение из метаданных
            if(dataBinding != null) {

                // Установка обработчика изменения значения в источнике данных
                dataBinding.onPropertyValueChanged(function(dataSourceName,value){
                    parameter.setValue(dataBinding.getPropertyValue());
                });

                var data = dataBinding.getPropertyValue();
                if (data) {
                    parameter.setValue(data);
                }

                // При изменении значения параметра, уведомление DataSource ч/з DataBinding
                parameter.onValueChanged(function (dataSourceName, value) {
                    dataBinding.setPropertyValue(value);
                });
            }
            else {
                parameter.setValue(metadata.Value);
            }
        }else{

        }


        return parameter;
    };
}
var UploadApi = function () {

};

UploadApi.prototype.serviceInstance = null;

UploadApi.prototype.uploadBinaryContent = function (configurationId, documentId, docId, file) {

};



/**
 * Объект должен удовлетворять всем заданным условиям.
 *
 * @constructor
 */
function AndValidator() {

    this.message = null;
    this.property = null;
    this.operators = [];

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        var isValid = true;
        var compositeResult = null;

        if (this.operators != null) {
            var propertyPath = combinePropertyPath(parentProperty, this.property);
            var propertyValue = InfinniUI.ObjectUtils.getPropertyValue(target, this.property);

            compositeResult = new ValidationResult();

            for (var i = 0; i < this.operators.length; ++i) {
                var operator = this.operators[i];
                isValid = operator.validate(propertyPath, propertyValue, compositeResult) && isValid;
            }
        }

        copyValidationResult(result, isValid, compositeResult);

        return isValid;
    }
}
/**
 * Построитель объекта AndValidator.
 *
 * @constructor
 */
function AndValidatorBuilder() {
}

AndValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new AndValidator();
        result.message = meta.Message;
        result.property = meta.Property;

        if (meta.Operators !== null && meta.Operators !== undefined) {
            for (var i = 0; i < meta.Operators.length; ++i) {
                var operator = factory.build(meta.Operators[i]);
                result.operators.push(operator);
            }
        }

        return result;
    }
};
/**
 * Объект никогда не проходит проверку.
 *
 * @constructor
 */
function FalseValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return false;
        });
    }
}
/**
 * Построитель объекта FalseValidator.
 *
 * @constructor
 */
function FalseValidatorBuilder() {
}

FalseValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new FalseValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект не должен удовлетворять заданному условию.
 *
 * @constructor
 */
function NotValidator() {

    this.message = null;
    this.property = null;
    this.operator = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return (validator.operator === null) || !validator.operator.validate(null, propertyValue, null);
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function NotValidatorBuilder() {
}

NotValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new NotValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.operator = factory.build(meta.Operator);
        return result;
    }
};
/**
 * Объект должен удовлетворять хотя бы одному из заданных условий.
 *
 * @constructor
 */
function OrValidator() {

    this.message = null;
    this.property = null;
    this.operators = [];

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        var isValid = false;
        var compositeResult = null;

        if (this.operators != null) {
            var propertyPath = combinePropertyPath(parentProperty, this.property);
            var propertyValue = InfinniUI.ObjectUtils.getPropertyValue(target, this.property);

            compositeResult = new ValidationResult();

            for (var i = 0; i < this.operators.length; ++i) {
                var operator = this.operators[i];

                if (operator.validate(propertyPath, propertyValue, compositeResult)) {
                    isValid = true;
                    break;
                }
            }
        }

        copyValidationResult(result, isValid, compositeResult);

        return isValid;
    }
}
/**
 * Построитель объекта OrValidator.
 *
 * @constructor
 */
function OrValidatorBuilder() {
}

OrValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new OrValidator();
        result.message = meta.Message;
        result.property = meta.Property;

        if (meta.Operators !== null && meta.Operators !== undefined) {
            for (var i = 0; i < meta.Operators.length; ++i) {
                var operator = factory.build(meta.Operators[i]);
                result.operators.push(operator);
            }
        }

        return result;
    }
};
/**
 * Объект проходит проверку, если удовлетворяет предикату.
 *
 * @constructor
 */
function PredicateValidator() {

    this.message = null;
    this.property = null;
    this.predicate = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return validator.predicate !== null
                && validator.predicate !== undefined
                && validator.predicate(propertyValue);
        });
    }
}
/**
 * Объект всегда проходит проверку.
 *
 * @constructor
 */
function TrueValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return true;
        });
    }
}
/**
 * Построитель объекта TrueValidator.
 *
 * @constructor
 */
function TrueValidatorBuilder() {
}

TrueValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new TrueValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Все элементы коллекции удовлетворяют заданному условию.
 *
 * @constructor
 */
function AllValidator() {

    this.operator = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        var isValid = true;
        var compositeResult = null;

        if (target !== null && this.operator !== null) {

            compositeResult = new ValidationResult();

            for (var i = 0; i < target.length; ++i) {
                var element = target[i];
                isValid = this.operator.validate(combinePropertyPath(parentProperty, i), element, compositeResult) && isValid;
            }
        }

        copyValidationResult(result, isValid, compositeResult);

        return isValid;
    }
}
/**
 *
 * Построитель объекта AllValidator.
 *
 * @constructor
 */
function AllValidatorBuilder() {
}

AllValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new AllValidator();
        result.operator = factory.build(meta.Operator);
        return result;
    }
};
/**
 * Один из элементов коллекции удовлетворяют заданному условию.
 *
 * @constructor
 */
function AnyValidator() {

    this.operator = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        var isValid = false;
        var compositeResult = null;

        if (target !== null && this.operator !== null) {

            compositeResult = new ValidationResult();

            for (var i = 0; i < target.length; ++i) {
                var element = target[i];

                if (this.operator.validate(combinePropertyPath(parentProperty, i), element, compositeResult)) {
                    isValid = true;
                    break;
                }
            }
        }

        copyValidationResult(result, isValid, compositeResult);

        return isValid;
    }
}
/**
 *
 * Построитель объекта AnyValidator.
 *
 * @constructor
 */
function AnyValidatorBuilder() {
}

AnyValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new AnyValidator();
        result.operator = factory.build(meta.Operator);
        return result;
    }
};
/**
 * Коллекция содержит заданное значение.
 *
 * @constructor
 */
function IsContainsCollectionValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {

            if (propertyValue !== null && propertyValue !== undefined) {
                for (var i = 0; i < propertyValue.length; ++i) {
                    var element = propertyValue[i];

                    if (element === validator.value) {
                        return true;
                    }
                }
            }

            return false;
        });
    }
}
/**
 * Построитель объекта IsContainsCollectionValidator.
 *
 * @constructor
 */
function IsContainsCollectionValidatorBuilder() {
}

IsContainsCollectionValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsContainsCollectionValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Коллекция является нулевым указателем или пустой коллекцией.
 *
 * @constructor
 */
function IsNullOrEmptyCollectionValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return (propertyValue === null || propertyValue === undefined || propertyValue.length === 0);
        });
    }
}
/**
 * Построитель объекта IsNullOrEmptyCollectionValidator.
 *
 * @constructor
 */
function IsNullOrEmptyCollectionValidatorBuilder() {
}

IsNullOrEmptyCollectionValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsNullOrEmptyCollectionValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект является абсолютным URI.
 *
 * @constructor
 */
function IsAbsoluteUriValidator() {

    this.message = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && /^((http|https):\/\/)/.test(propertyValue);
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsAbsoluteUriValidatorBuilder() {
}

IsAbsoluteUriValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsAbsoluteUriValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект содержит заданную подстроку.
 *
 * @constructor
 */
function IsContainsValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && new RegExp(validator.value, "i").test(propertyValue);
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsContainsValidatorBuilder() {
}

IsContainsValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsContainsValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект является значением по умолчанию для данного типа.
 *
 * @constructor
 */
function IsDefaultValueValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            if (propertyValue !== null && propertyValue !== undefined) {
                var propertyType = typeof propertyValue;

                switch (propertyType) {
                    case "number":
                    case "integer":
                    case "Double":
                        return (propertyValue === 0);
                    case "boolean":
                        return (propertyValue === false);
                    case "string":
                        return (propertyValue === "");
                    default:
                        return false;
                }
            }

            return true;
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsDefaultValueValidatorBuilder() {
}

IsDefaultValueValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsDefaultValueValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект оканчивается заданной подстрокой.
 *
 * @constructor
 */
function IsEndsWithValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && new RegExp(validator.value + "$", "gi").test(propertyValue);
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsEndsWithValidatorBuilder() {
}

IsEndsWithValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsEndsWithValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};

/**
 * Объект равен заданному объекту.
 *
 * @constructor
 */
function IsEqualValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return (propertyValue == validator.value);
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsEqualValidatorBuilder() {
}

IsEqualValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsEqualValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект является глобально уникальным идентификатором (GUID).
 *
 * @constructor
 */
function IsGuidValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return /^(\{){0,1}[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\}){0,1}$/.test(propertyValue);
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsGuidValidatorBuilder() {
}

IsGuidValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsGuidValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект содержится в заданной коллекции.
 *
 * @constructor
 */
function IsInValidator() {

    this.message = null;
    this.property = null;
    this.items = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return validator.items !== null
                && validator.items.indexOf(propertyValue) > -1;
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsInValidatorBuilder() {
}

IsInValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsInValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.items = meta.Items;
        return result;
    }
};
/**
 * Объект меньше или равен заданного объекта.
 *
 * @constructor
 */
function IsLessThanOrEqualValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            if (propertyValue !== null && propertyValue !== undefined) {
                return propertyValue <= validator.value;
            }

            return false;
        });
    }
}
/**
 * Построитель объекта NotValidator.
 *
 * @constructor
 */
function IsLessThanOrEqualValidatorBuilder() {
}

IsLessThanOrEqualValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsLessThanOrEqualValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект меньше заданного объекта.
 *
 * @constructor
 */
function IsLessThanValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            if (propertyValue !== null && propertyValue !== undefined) {
                return propertyValue < validator.value;
            }

            return false;
        });
    }
}
/**
 * Построитель объекта IsLessThanValidator.
 *
 * @constructor
 */
function IsLessThanValidatorBuilder() {
}

IsLessThanValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsLessThanValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект больше или равен заданного объекта.
 *
 * @constructor
 */
function IsMoreThanOrEqualValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            if (propertyValue !== null && propertyValue !== undefined) {
                return propertyValue >= validator.value;
            }

            return false;
        });
    }
}
/**
 * Построитель объекта IsMoreThanOrEqualValidator.
 *
 * @constructor
 */
function IsMoreThanOrEqualValidatorBuilder() {
}

IsMoreThanOrEqualValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsMoreThanOrEqualValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект больше заданного объекта.
 *
 * @constructor
 */
function IsMoreThanValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            if (propertyValue !== null && propertyValue !== undefined) {
                return propertyValue > validator.value;
            }

            return false;
        });
    }
}
/**
 * Построитель объекта IsMoreThanValidator.
 *
 * @constructor
 */
function IsMoreThanValidatorBuilder() {
}

IsMoreThanValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsMoreThanValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект является нулевым указателем или пустой строкой.
 *
 * @constructor
 */
function IsNullOrEmptyValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue === null
                || propertyValue === undefined
                || (typeof propertyValue === "string" && _.isEmpty(propertyValue));
        });
    }
}
/**
 * Построитель объекта IsNullOrEmptyValidator.
 *
 * @constructor
 */
function IsNullOrEmptyValidatorBuilder() {
}

IsNullOrEmptyValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsNullOrEmptyValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект является нулевым указателем или строкой из пробелов.
 *
 * @constructor
 */
function IsNullOrWhiteSpaceValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue === null
                || propertyValue === undefined
                || (typeof propertyValue === "string" && propertyValue.replace(/\s/g, '').length === 0);
        });
    }
}
/**
 * Построитель объекта IsNullOrWhiteSpaceValidator.
 *
 * @constructor
 */
function IsNullOrWhiteSpaceValidatorBuilder() {
}

IsNullOrWhiteSpaceValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsNullOrWhiteSpaceValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект является нулевым указателем.
 *
 * @constructor
 */
function IsNullValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue === null || propertyValue === undefined;
        });
    }
}
/**
 * Построитель объекта IsNullValidator.
 *
 * @constructor
 */
function IsNullValidatorBuilder() {
}

IsNullValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsNullValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект удовлетворяет заданному регулярному выражению.
 *
 * @constructor
 */
function IsRegexValidator() {

    this.message = null;
    this.property = null;
    this.pattern = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && new RegExp(validator.pattern).test(propertyValue);
        });
    }
}
/**
 * Построитель объекта IsRegexValidator.
 *
 * @constructor
 */
function IsRegexValidatorBuilder() {
}

IsRegexValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsRegexValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.pattern = meta.Pattern;
        return result;
    }
};
/**
 * Объект является относительным URI.
 *
 * @constructor
 */
function IsRelativeUriValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return !_.isEmpty(propertyValue);
        });
    }
}
/**
 * Построитель объекта IsRelativeUriValidator.
 *
 * @constructor
 */
function IsRelativeUriValidatorBuilder() {
}

IsRelativeUriValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsRelativeUriValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
/**
 * Объект начинается заданной подстрокой.
 *
 * @constructor
 */
function IsStartsWithValidator() {

    this.message = null;
    this.property = null;
    this.value = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && new RegExp("^" + validator.value + ".*", "gi").test(propertyValue);
        });
    }
}
/**
 * Построитель объекта IsStartsWithValidator.
 *
 * @constructor
 */
function IsStartsWithValidatorBuilder() {
}

IsStartsWithValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsStartsWithValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        result.value = meta.Value;
        return result;
    }
};
/**
 * Объект является URI.
 *
 * @constructor
 */
function IsUriValidator() {

    this.message = null;
    this.property = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && !_.isEmpty(propertyValue);
        });
    }
}
/**
 * Построитель объекта IsUriValidator.
 *
 * @constructor
 */
function IsUriValidatorBuilder() {
}

IsUriValidatorBuilder.prototype = {

    /**
     * Осуществляет построение объекта проверки данных.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @param {*} factory Фабрика для построения объектов проверки данных.
     */
    build: function (meta, factory) {
        var result = new IsUriValidator();
        result.message = meta.Message;
        result.property = meta.Property;
        return result;
    }
};
function ValidationBuilder() {

    this.build = function (builder, parent, metadata) {
        var validatorFactory = createValidationBuilderFactory();
        return validatorFactory.build(metadata);
    }
}
/**
 * Фабрика для построения объектов проверки данных.
 *
 * @constructor
 */
function ValidationBuilderFactory() {
}

ValidationBuilderFactory.prototype = {

    builders: [],

    /**
     * Регистрирует построитель.
     *
     * @public
     * @param {string} type Тип объекта проверки данных.
     * @param {*} builder Построитель объекта проверки данных.
     */
    register: function (type, builder) {
        this.builders[type] = builder;
    },

    /**
     * Регистрирует построитель.
     *
     * @public
     * @param {*} meta Метаданные объекта проверки данных.
     * @return {*} Объект проверки данных.
     */
    build: function (meta) {

        // Определяем тип объекта проверки данных
        var type = (Object.keys(meta)[0]);

        if (type === "null" || type === "undefined") {
            return null;
        }

        // Ищем подходящий построитель для типа
        var builder = this.builders[type];

        if (type === "null" || type === "undefined") {
            return null;
        }

        // Осуществляем построение объекта
        return builder.build(meta[type], this);
    }
};


/**
 * Создает фабрику для построения объектов проверки данных.
 *
 * @public
 * @return {*} Фабрика для построения объектов проверки данных.
 */
function createValidationBuilderFactory() {
    var factory = new ValidationBuilderFactory();

    // BooleanValidator
    factory.register("False", new FalseValidatorBuilder());
    factory.register("True", new TrueValidatorBuilder());
    factory.register("Not", new NotValidatorBuilder());
    factory.register("And", new AndValidatorBuilder());
    factory.register("Or", new OrValidatorBuilder());

    // CollectionValidator
    factory.register("Any", new AnyValidatorBuilder());
    factory.register("All", new AllValidatorBuilder());
    factory.register("IsNullOrEmptyCollection", new IsNullOrEmptyCollectionValidatorBuilder());
    factory.register("IsContainsCollection", new IsContainsCollectionValidatorBuilder());

    // ObjectValidator
    factory.register("IsNull", new IsNullValidatorBuilder());
    factory.register("IsEqual", new IsEqualValidatorBuilder());
    factory.register("IsDefaultValue", new IsDefaultValueValidatorBuilder());
    factory.register("IsGuid", new IsGuidValidatorBuilder());
    factory.register("IsUri", new IsUriValidatorBuilder());
    factory.register("IsAbsoluteUri", new IsAbsoluteUriValidatorBuilder());
    factory.register("IsRelativeUri", new IsRelativeUriValidatorBuilder());
    factory.register("IsNullOrEmpty", new IsNullOrEmptyValidatorBuilder());
    factory.register("IsNullOrWhiteSpace", new IsNullOrWhiteSpaceValidatorBuilder());
    factory.register("IsContains", new IsContainsValidatorBuilder());
    factory.register("IsStartsWith", new IsStartsWithValidatorBuilder());
    factory.register("IsEndsWith", new IsEndsWithValidatorBuilder());
    factory.register("IsRegex", new IsRegexValidatorBuilder());
    factory.register("IsLessThan", new IsLessThanValidatorBuilder());
    factory.register("IsMoreThan", new IsMoreThanValidatorBuilder());
    factory.register("IsMoreThanOrEqual", new IsMoreThanOrEqualValidatorBuilder());
    factory.register("IsLessThanOrEqual", new IsLessThanOrEqualValidatorBuilder());
    factory.register("IsIn", new IsInValidatorBuilder());

    return factory;
}
/**
 * Результат проверки объекта.
 *
 * @constructor
 */
function ValidationResult() {

    /**
     * @member {boolean} IsValid Признак успешности проверки.
     */
    this.IsValid = true;

    /**
     * @member {boolean} Items Список результатов проверки свойств объекта.
     */
    this.Items = [];
}

/**
 * Реализует базовую логику проверки объекта.
 *
 * @public
 * @param {*} validator Объект, предоставляющий интерфейс проверки.
 * @param {string} propertyPath Путь к родительскому объекту в dot-notation.
 * @param {object} target Родительский объект для проверки.
 * @param {object} result Результат проверки объекта.
 * @param {function} validateFunc Функция проверки.
 * @returns {boolean} Успешность проверки.
 */
function generalValidate(validator, propertyPath, target, result, validateFunc) {
    // Получаем значение свойства родительского объекта
    var property = validator.property;
    var propertyValue = InfinniUI.ObjectUtils.getPropertyValue(target, property);

    // Выполняем проверку свойства с помощью функции
    var isValid = validateFunc(validator, propertyValue);

    // Добавляем результат проверки свойства
    setValidationResult(result, isValid, propertyPath, property, validator.message);

    return isValid;
}

/**
 * Добавляет результат проверки объекта.
 *
 * @public
 * @param {object} result Результат проверки объекта.
 * @param {boolean} isValid Успешность проверки объекта.
 * @param {string} parent Путь к родительскому объекту в dot-notation.
 * @param {string} property Относительный путь к дочернему объекту в dot-notation.
 * @param {string} message Сообщение об ошибке.
 */
function setValidationResult(result, isValid, parent, property, message) {
    if (result !== null && result !== undefined) {
        result.IsValid = isValid;

        if (!isValid) {
            if (result.Items === null || result.Items === undefined) {
                result.Items = [];
            }

            var item = {
                Property: combinePropertyPath(parent, property),
                Message: message
            };

            result.Items.push(item);
        }
    }
}

/**
 * Копирует результат проверки объекта.
 *
 * @public
 * @param {object} result Результат проверки объекта.
 * @param {boolean} isValid Успешность проверки объекта.
 * @param {object} source Копируемый результат проверки объекта.
 */
function copyValidationResult(result, isValid, source) {
    if (result !== null && result !== undefined) {

        result.IsValid = isValid;

        if (!isValid
            && source !== null && source !== undefined
            && source.Items !== null && source.Items !== undefined) {

            if (result.Items === null || result.Items === undefined) {
                result.Items = [];
            }

            for (var i = 0; i < source.Items.length; ++i) {
                result.Items.push(source.Items[i]);
            }
        }
    }
}

/**
 * Возвращает объединенный путь к объекту в dot-notation.
 *
 * @public
 * @param {string} parent Путь к родительскому объекту в dot-notation.
 * @param {string} property Относительный путь к дочернему объекту в dot-notation.
 * @returns {string} Объединенный путь к дочернему объекту в dot-notation.
 */
function combinePropertyPath(parent, property) {
    var result= parent;

    if (parent !== null && parent !== undefined) {
        parent = parent.toString();
    }else{
        parent = '';
    }

    if (property !== null && property !== undefined) {
        property = property.toString();
    }

    var parentIsNull = _.isEmpty(parent);
    var propertyIsNull = _.isEmpty(property);

    if (!parentIsNull && !propertyIsNull) {
        result += "." + property;
    }
    else if (parentIsNull) {
        result = property;
    }

    if (result === null || result === undefined) {
        result = "";
    }

    return result;
}
window.dialogResult = {
    accept: 'Accepted',
    cancel: 'Canceled'
};
InfinniUI.Metadata.ColorStyle = [
    "Transparent",
    "Primary1",
    "Primary2",
    "Primary3",
    "Accent1",
    "Accent2",
    "Accent3",
    "White",
    "Black"
];
InfinniUI.Metadata.HorizontalTextAlignment = [
    "Left",
    "Right",
    "Center",
    "Justify"
];
InfinniUI.Metadata.TextStyle = [
    "Display4",
    "Display3",
    "Display2",
    "Display1",
    "Headline",
    "Title",
    "Subhead",
    "Body2",
    "Body1",
    "Caption",
    "Menu",
    "Button"
];
var builderBackgroundMixin = {

    initBackground: function (params) {
        params.element.setBackground(params.metadata.Background);
    }

};
var builderBaseTextElementMixin = {

    initBaseTextElementEvents: function (params) {
        this.initOnKeyDownEvent(params);
    },

    initOnKeyDownEvent: function (params) {
        var metadata = params.metadata;
        var parent = params.parent;
        var element = params.element;

        if (metadata.OnKeyDown) {
            element.onKeyDown(function (data) {
                new ScriptExecutor(parent).executeScript(metadata.OnKeyDown.Name, data);
            });
        }

    }

};
var builderErrorTextMixin = {

    initErrorText: function (params) {
        var element = params.element;
        element.setErrorText(params.metadata.ErrorText);
    }
};
var builderForegroundMixin = {

    initForeground: function (params) {
        params.element.setForeground(params.metadata.Foreground);
    }

};
var builderHintTextMixin = {

    initHintText: function (params) {
        var element = params.element;
        element.setHintText(params.metadata.HintText);
    }

};
var builderLabelTextMixin = {

    initLabelText: function (params) {
        params.element.setLabelText(params.metadata.LabelText);
    }
};

var builderLayoutPanelMixin = {
    registerLayoutPanel: function (params) {
        var exchange = messageBus.getExchange('global');
        exchange.send(messageTypes.onCreateLayoutPanel, {source: params.parent, value: params.element});
    }
};
var builderTextStyleMixin = {

    initTextStyle: function (params) {
        params.element.setTextStyle(params.metadata.TextStyle);
    }

};
var baseTextElementMixin = {

};
var elementBackgroundMixin = {

    getBackground: function () {
        return this.control.get('background');
    },

    setBackground: function (value) {
        if (InfinniUI.Metadata.ColorStyle.indexOf(value) === -1) {
            return;
        }
        this.control.set('background', value);
    }

};
var elementErrorTextMixin = {

    getErrorText: function () {
        return this.control.get('errorText');
    },

    setErrorText: function (value) {
        this.control.set('errorText', value);
    }

};

var elementForegroundMixin = {

    getForeground: function () {
        return this.control.get('foreground');
    },

    setForeground: function (value) {
        if (InfinniUI.Metadata.ColorStyle.indexOf(value) === -1) {
            return;
        }
        this.control.set('foreground', value);
    }

};

var elementHintTextMixin = {

    getHintText: function () {
        return this.control.get('hintText');
    },

    setHintText: function (value) {
        var text = typeof value === 'undefined' || value === null ? '' : value;
        this.control.set('hintText', text);
    }

};

var elementHorizontalTextAlignmentMixin = {

    getHorizontalTextAlignment: function () {
        return this.control.get('horizontalTextAlignment');
    },

    setHorizontalTextAlignment: function (value) {
        if (InfinniUI.Metadata.HorizontalTextAlignment.indexOf(value) === -1) {
            return;
        }
        this.control.set('horizontalTextAlignment', value);
    }

};
var elementLabelTextMixin = {

    getLabelText: function () {
        return this.control.get('labelText');
    },

    setLabelText: function (value) {
        this.control.set('labelText', value);
    }
};

var elementTextStyleMixin = {

    getTextStyle: function () {
        return this.control.get('textStyle');
    },

    setTextStyle: function (value) {
        if (InfinniUI.Metadata.TextStyle.indexOf(value) === -1) {
            return;
        }
        this.control.set('textStyle', value);
    }

};
function Button(parentView) {
    _.superClass(Button, this, parentView);
}

_.inherit(Button, Element);

_.extend(Button.prototype, {
    createControl: function () {
        return new ButtonControl();
    },

    getAction: function () {
        return this.control.get('action');
    },

    setAction: function (action) {
        var self = this,
            isFirstAction = !this.control.get('action');
        this.control.set('action', action);

        if (isFirstAction) {
            this.onClick(function () {
                var action = self.getAction();
                if (action) {
                    action.execute();
                }
            });
        }
    },

    setImage: function(image){
        this.control.set('image', image);
    },

    getImage: function(){
        this.control.get('image');
    },

    click: function () {

        this.control.click();
    },

    onClick: function (handler) {
        this.control.onClick(handler);
    },

    getHeight: function () {
        return 34;
    },

    setParentEnabled: function(enabled){
        if(enabled == undefined){
            enabled = true;
        }
        return this.control.set('parentEnabled', enabled);
    },

    getParentEnabled: function(){
        return this.control.get('parentEnabled');
    },

    onEnabledChange: function (handler) {
        this.control.onEnabledChange(handler);
    }
});
var ButtonBuilder = function (buttonConstructor) {
    this.buttonConstructor = buttonConstructor ? buttonConstructor : Button;

};

_.inherit(ButtonBuilder, ElementBuilder);

_.extend(ButtonBuilder.prototype, {

    applyMetadata: function(params){
        ElementBuilder.prototype.applyMetadata.call(this, params);

        /**
         * @TODO Исправить в PropertyBinding хардкод вызова метода this.element.setValue(this.getPropertyValue());!!!
         */

        this.initFormatProperty(params);
        //this.initValueProperty(params);
        this.initHorizontalTextAlignmentProperty(params);
        this.initScriptsHandlers(params);

        params.element.setImage(params.metadata.Image);

        if(params.metadata.Action) {
            params.element.setAction(params.builder.build(params.parent, params.metadata.Action, params.collectionProperty));
        }
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        if (params.parent && metadata.OnClick){
            params.element.onClick(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnClick.Name);
            });
        }
    },

    createElement: function(params){
        var ButtonConstructor = this.buttonConstructor ? this.buttonConstructor : Button;

        return new ButtonConstructor(params.parent);
    }

}, builderFormatPropertyMixin, builderHorizontalTextAlignmentPropertyMixin);


function MenuBar(parentView) {
    _.superClass(MenuBar, this, parentView);
}

_.inherit(MenuBar, Element);

_.extend(MenuBar.prototype, {

    createControl: function () {
        return new MenuBarControl();
    },

    setItems: function (value) {
        this.control.setItems(value);
    },

    setMenuList: function (list) {
        this.control.setMenuList(list);
    },

    getMenuList: function () {
        return this.control.getMenuList();
    },

    setMenuName: function (value) {
        this.control.setMenuName(value);
    },

    getMenuName: function () {
        return this.control.getMenuName();
    },

    getConfigId: function () {
        return this.control.getConfigId();
    },

    setConfigId: function (value) {
        this.control.setConfigId(value);
    },

    onChangeMenuName: function (handler) {
        if (typeof handler === 'function') {
            this.control.onChangeMenuName(handler);
        }
    },

    onChangeConfigId: function (handler) {
        if (typeof handler === 'function') {
            this.control.onChangeConfigId(handler);
        }
    },

    onChangeMenuList: function (handler) {
        if (typeof handler === 'function') {
            this.control.onChangeMenuList(handler);
        }
    }



});
function MenuBarBuilder() {
}

_.inherit(MenuBarBuilder, ElementBuilder);

_.extend(MenuBarBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        var element = params.element,
            metadata = params.metadata;

        metadata.MetadataName = 'MainMenu';

        function findItems(Items, arr) {
            if (Items) {
                _.each(Items, function (subItem) {
                    var el = {
                        Text: subItem.Text,
                        Image: subItem.Image
                    };
                    if(subItem.Action){
                        el.Action = params.builder.build(params.parent, subItem.Action);
                    }
                    if(subItem.Items){
                        el.Items = [];
                        findItems(subItem.Items, el.Items);
                    }
                    arr.push(el);
                });
            }
            return arr;
        }

        element.onChangeMenuName(function () {
            InfinniUI.State.setMenuName(element.getMenuName());
        });

        element.onChangeConfigId(function () {
            InfinniUI.State.setConfigId(element.getConfigId());
        });

        element.onChangeMenuList(function () {

        });

        this.buildMenuForConfigurations(params)
            .done(function (list) {
                var data = element.getMenuList();

                var menuName = InfinniUI.State.getMenuName();
                var configId = InfinniUI.State.getConfigId() || metadata.ConfigId;

                var menuMetadata;
                if(_.isArray(data)) {
                    if (data.length === 1) {
                        //Единственное меню для указанной конфигурации
                        menuMetadata = data[0];
                        menuName = menuMetadata.Name;
                        configId = menuMetadata.ConfigId;
                    } else {
                        menuMetadata = _.findWhere(data, {ConfigId: configId, Name: menuName});
                    }

                    if (typeof menuMetadata === 'undefined') {
                        if (typeof configId !== 'undefined') {
                            //Ищем меню в заданной конфигурации
                            menuMetadata = _.findWhere(data, {ConfigId: configId});
                        }
                        if (typeof menuMetadata === 'undefined') {
                            //Выбираем первое меню из списка
                            menuMetadata = data[0];
                            configId = menuMetadata.ConfigId;
                        }
                        menuName = menuMetadata.Name;
                    }

                }
                if (menuMetadata) {
                    element.setItems(findItems(menuMetadata.Items, []));
                }
                element.setConfigId(configId);
                element.setMenuName(menuName);
                element.setIsLoaded();
            });
    },

    getConfigurationList: function (callback) {
        var configMetadata = {};
        var provider = new MetadataProviderREST(new QueryConstructorMetadata(InfinniUI.config.serverUrl, configMetadata), null, null);

        provider.getConfigMetadata(callback);
    },

    getMenuList: function (configId) {
        var menuMetadata = {
            ConfigId: configId,
            MetadataType: 'Menu'
        };

        var provider = new MetadataProviderREST(new QueryConstructorMetadata(InfinniUI.config.serverUrl, menuMetadata));
        //provider.getMenuMetadata(callback);
        var defer = $.Deferred();
        provider.getMenuMetadata(function (data) {
            var list = [];

            if (_.isArray(data)) {
                list = _.filter(data, function (item) {
                    return !_.isEmpty(item.ConfigId);
                });
            }

            defer.resolve(list);
        });

        return defer.promise();
    },

    buildMenuForConfigurations: function (params) {
        var defer = $.Deferred();
        var menuList = [];

        this.getConfigurationList(function (configurations) {
            if (_.isArray(configurations) === false || _.isEmpty(configurations)) {
                return;
            }

            var promises = [], promise;
            for (var i = 0, ln = configurations.length; i < ln; i = i + 1) {
                promise = this.getMenuList(configurations[i].Name);
                promises.push(promise);
                promise.done(function (list) {
                    Array.prototype.push.apply(menuList, list);
                    params.element.setMenuList(menuList.slice());
                });
            }
            $.when.apply($, promises)
                .done(function () {
                    defer.resolve(menuList);
                });


        }.bind(this));
        return defer.promise();
    },

    createElement: function (params) {
        return new MenuBar(params.parent);
    }

});
var PopupButton = function (parentView) {
    _.superClass(PopupButton, this, parentView);
};

_.inherit(PopupButton, Button);

_.extend(PopupButton.prototype, {

    addItem: function(item){
        this.control.addItem(item);
    },

    removeItem: function(element){
        this.control.removeItem(element);
    },

    getItems: function(){
        return this.control.getItems();
    },

    getItem: function(name){
        return this.control.getItem(name);
    },

    createControl: function () {
        return new PopupButtonControl();
    }

});
var PopupButtonBuilder = function () {

};

_.inherit(PopupButtonBuilder, ButtonBuilder);

_.extend(PopupButtonBuilder.prototype, {

    applyMetadata: function(params){
        ButtonBuilder.prototype.applyMetadata.call(this, params);

        _.each(params.metadata.Items, function (metadataItem) {
            params.element.addItem(params.builder.build(params.parent, metadataItem));
        });
    },

    initScriptsHandlers: function(params){
        ButtonBuilder.prototype.initScriptsHandlers.call(this, params);
    },

    createElement: function(params){
        return new PopupButton(params.parent);
    }

});
function ToolBar(parentView) {
    _.superClass(ToolBar, this, parentView);
}

_.inherit(ToolBar, Element);

_.extend(ToolBar.prototype, {
    createControl: function () {
        return new ToolBarControl();
    },

    getHeight: function () {
        return 34;
    },

    addItem: function (item) {
        return this.control.addItem(item);
    },

    getItems: function () {
        return this.control.get('items');
    },

    setItems: function(items){
        return this.control.setItems(items)
    },

    onEnabledChange: function (handler) {
        this.control.onEnabledChange(handler);
    }
});

function ToolBarBuilder() {
}

_.inherit(ToolBarBuilder, ElementBuilder);

_.extend(ToolBarBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
        var metadata = params.metadata;

        _.each(params.metadata.Items, function (metadataItem) {
            if (metadata.Enabled == false) {
                metadataItem.ToolBarButton.Enabled = false;
            }

            var btn = params.builder.build(params.parent, metadataItem);
            btn.setParentEnabled(metadata.Enabled);
            params.element.addItem(btn);
        });


        params.element.onEnabledChange(function () {
            var enabled = params.element.getEnabled();
            _.each(params.element.getItems(), function(item){
                item.control.set('parentEnabled', enabled);
            });
        });

    },

    createElement: function (params) {
        return new ToolBar(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }
    }
});
function ToolBarSeparator(parentView) {
    _.superClass(ToolBarSeparator, this, parentView);
}

_.inherit(ToolBarSeparator, Element);

_.extend(ToolBarSeparator.prototype, {

    createControl: function () {
        return new ToolBarSeparatorControl();
    }

});

function ToolBarSeparatorBuilder() {
}

_.inherit(ToolBarSeparatorBuilder, ElementBuilder);

_.extend(ToolBarSeparatorBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
    },

    createElement: function (params) {
        return new ToolBarSeparator(params.parent);
    },

    initScriptsHandlers: function(params){

    }

});
/**
 * @constructor
 */
function CheckBox(parentView) {
    _.superClass(CheckBox, this, parentView);
}

_.inherit(CheckBox, Element);

_.extend(CheckBox.prototype, {

    createControl: function () {
        return new CheckBoxControl();
    }

},
    valuePropertyMixin,
    elementHorizontalTextAlignmentMixin,
    elementForegroundMixin,
    elementTextStyleMixin
);
function CheckBoxBuilder() {
}

_.inherit(CheckBoxBuilder, ElementBuilder);

_.extend(CheckBoxBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
        this.initValueProperty(params, true);
        this.initForeground(params);
        this.initTextStyle(params);
        this.initHorizontalTextAlignmentProperty(params);
    },

    createElement: function (params) {
        return new CheckBox(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    }

},
    builderValuePropertyMixin,
    builderHorizontalTextAlignmentPropertyMixin,
    builderForegroundMixin,
    builderTextStyleMixin
);

function ComboBox() {
    _.superClass(ComboBox, this);
}

_.inherit(ComboBox, Element);

_.extend(ComboBox.prototype, {

        createControl: function () {
            return new ComboBoxControl();
        },

        /**
         * Возвращает значение, определяющее, показывается ли кнопка раскрытия списка
         * @return {Boolean}
         */
        getShowPopup: function () {

        },

        /**
         * Устанавливает значение, определяющее, показывается ли кнопка раскрытия списка
         * @param {Boolean} value
         * @constructor
         */
        setShowPopup: function (value) {

        },

        /**
         * Возвращает значение, определяющее, показывается ли кнопка выбора значения (…).
         * @returns {Boolean}
         */
        getShowSelect: function () {

        },

        /**
         * Устанавливает значение, определяющее, показывается ли кнопка выбора значения (…).
         * @param {Boolean} value
         */
        setShowSelect: function (value) {

        },

        /**
         * Возвращает способ автозаполнения при вводе с клавиатуры.
         * @returns {String} @see {@link http://demo.infinnity.ru:8081/display/MC/Autocomplete}
         */
        getAutocomplete: function () {

        },

        /**
         * Устанавливает способ автозаполнения при вводе с клавиатуры.
         * @param value @see {@link http://demo.infinnity.ru:8081/display/MC/Autocomplete}
         */
        setAutocomplete: function (value) {
            this.control.set('autocomplete', value);
        },

        getSelectView: function () {
            return this.control.get('selectView');
        },

        setSelectView: function (selectViewValue) {
            this.control.set('selectView', selectViewValue);
        },

        setOpenListFunction: function(f){
            this.control.setOpenListFunction(f);
        },

        /**
         * Возвращает значение, определяющее, разрешен ли выбор нескольких элементов.
         * @returns {Boolean}
         */
        getMultiSelect: function () {
            return this.control.get('multiSelect');
        },

        /**
         * Устанавливает значение, определяющее, разрешен ли выбор нескольких элементов.
         * @param {Boolean} value
         */
        setMultiSelect: function (value) {
            this.control.set('multiSelect', value);
        },

        /**
         * Возвращает значение, определяющее, запрещено ли редактирование значения.
         * @return {Boolean}
         */
        getReadOnly: function () {
            return this.control.get('readOnly');
        },

        /**
         * Устанавливает значение, определяющее, запрещено ли редактирование значения.
         * @param {Boolean} value
         */
        setReadOnly: function (value) {
            this.control.set('readOnly', value);
        },

        getValueProperty: function () {
            return this.control.get('valueProperty');
        },

        setValueProperty: function (value) {
            this.control.set('valueProperty', value);
        },

        getDisplayProperty: function () {
            return this.control.get('displayProperty');
        },

        setDisplayProperty: function (value) {
            this.control.set('displayProperty', value);
        },

        getFormat: function () {
            return this.control.get('itemFormat');
        },

        setFormat: function (itemFormat) {
            this.control.set('itemFormat', itemFormat);
        },

        getItemTemplate: function () {

        },

        setItemTemplate: function () {

        },

        addItem: function () {

        },

        removeItem: function () {

        },

        /**
         * Возвращает список элементов.
         * @returns {Object[]}
         */
        getItems: function () {
            return this.control.get('items');
        },

        /**
         * Устанавливает список элементов.
         * @param {Object[]}items
         */
        setItems: function (items) {
            this.control.set('items', items);
            this.control.controlView.trigger('afterchange:items');
        },

        getDataNavigation: function () {

        },

        setDataNavigation: function () {

        },

        /**
         * @description Установка подсказывающего текста
         * @param {String} value
         */
        setPlaceholder: function (value) {
            value = (typeof value === 'undefined' || value === null) ? '' : value;
            this.control.set('placeholder', value);
        },

        /**
         * @description Получение подсказывающего текста
         * @returns {String}
         */
        getPlaceholder: function () {
            return this.control.get('placeholder');
        },

        /**
         * @description Установка видимости кнопки очистки комбобокса
         * @param {Boolean} value
         */
        setShowClear: function (value) {
            if(typeof value === 'boolean') {
                this.control.set('showClear', value);
            };
        },

        /**
         * @description Получение видимости кнопки очистки комбобокса
         * @returns {Boolean}
         */
        getShowClear: function () {
            return this.control.get('showClear');
        },

        /**
         * @description Обработка изменения значения в строке поиска выпадающего списка
         * @param {Function} handler
         */
        onChangeTerm: function (handler) {
            this.control.onChangeTerm(handler);
        },

        onFirstOpening: function(handler){
            this.control.onFirstOpening(handler);
        },

        /**
         * @description Возвращает элементы списка значений соответствующие выбранному значению
         */
        getSelectedItems: function () {
            return this.control.getSelectedItems();
        },

        getDisplayValue: function (value) {
            return this.control.getDisplayValue(value);
        },

        getItem: function () {
            return this.control.getItem();
        },

        setItem: function () {

        },

        onItemChanged: function (handler) {
            this.control.onItemChanged(handler)
        },

        getFocusedItem: function () {

        },

        setFocusedItem: function () {

        },

        getFocusedValue: function () {

        },

        setFocusedValue: function () {

        }

    },
    valuePropertyMixin
);

function ComboBoxBuilder() {

}

_.inherit(ComboBoxBuilder, ElementBuilder);

_.extend(ComboBoxBuilder.prototype, {

    applyMetadata: function (params) {

        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initFormatProperty(params);
        this.initValueProperty(params, true);
        this.initScriptsHandlers(params);

        var element = params.element,
            builder = params.builder,
            metadata = params.metadata,
            parent = params.parent,
            that = this;

        element.setMultiSelect(metadata.MultiSelect);
        element.setReadOnly(metadata.ReadOnly);
        element.setDisplayProperty(metadata.DisplayProperty);
        element.setValueProperty(metadata.ValueProperty);
        element.setPlaceholder(metadata.Placeholder);
        element.setAutocomplete(metadata.Autocomplete || 'Server');
        element.setShowClear(metadata.ShowClear);
        this.initFormatProperty(params);

        var binding;
        if (metadata.Items) {
            var lazyLoad = $.Deferred();

            // Привязка списка значений элемента к источнику данных
            var binding = builder.build(parent, metadata.Items, undefined, {lazyLoad: lazyLoad});

            that.initSearchTermHandler(binding.getDataSource(), params);

            binding.onPropertyValueChanged(function (dataSourceName, value) {
                element.setItems(value.value);
            });


            element.onItemChanged(function() {
                var item = element.getItem(),
                    selectedItem = _.isArray(item) ? item[0] : item;

                parent.getExchange().send(messageTypes.onSetSelectedItem, {
                    dataSource: binding.getDataSource(),
                    property:binding.getProperty(),
                    value: typeof selectedItem === 'undefined' ? null : selectedItem
                });
            });


            var items = binding.getPropertyValue();
            if (items) {
                element.setItems(items);
            }

            element.onFirstOpening(function(){
                lazyLoad.resolve();
            });

        }

        this.initSelectView(element, builder, metadata, parent, binding);

    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    initSearchTermHandler: function (datasource, params) {
        var args = {
            source: params.element,
            dataSource: datasource,
            value: ''
        };
        var view = params.parent;
        var exchange = view.getExchange();

        params.element.onChangeTerm(function (term) {
            args.value = term;
            exchange.send(messageTypes.onSetTextFilter, args);
        });

    },

    createElement: function (params) {
        return new ComboBox(params.parent);
    },

    initSelectView: function(element, builder, metadata, parent, binding){
        if( !metadata.SelectView ){
            return;
        }

        var itemFormat = element.getFormat(),
            displayProperty = element.getDisplayProperty(),
            valueProperty = element.getValueProperty();

        var getItem = function (item) {
            var
                text = element.getDisplayValue(item),
                id = InfinniUI.ObjectUtils.getPropertyValue(item, valueProperty) || item.Id;

            return {Id: id, DisplayName: text};
        };


        element.setSelectView(true);
        element.setOpenListFunction(function(){
            builder.build(parent, metadata.SelectView).createView(function (view) {
                view.onClosed(function (result) {

                    var item = view.getDataSources()[0].getSelectedItem();
                    if (result == dialogResult.accept && item) {
                        var value = _.isArray(item) ? _.map(item, getItem) : getItem(item);
                        binding.refresh(function () {
                            element.setValue(value);
                        });

                    }
                });

                view.open();
            });
        });
    }

}, builderValuePropertyMixin, builderFormatPropertyMixin, builderFormatPropertyMixin);

//function ComboBoxBuilder() {
//
//    this.build = function (builder, parent, metadata) {
//
//        var comboBox = new ComboBox(parent);
//
//
//        if(metadata.Value != undefined) {
//            // Привязка значения элемента к источнику данных
//            var binding = builder.build(parent, metadata.Value);
//
//            binding.onPropertyValueChanged = function(dataSourceName,value) {
//                comboBox.setValue(value.value);
//            };
//
//            // Привязка источника данных к значению элемента
//            comboBox.onValueChanged(function () {
//                binding.setPropertyValue(comboBox.getValue());
//            });
//        }
//
//        window.Combobox = window.Combobox || [];
//        window.Combobox.push(comboBox);
//        return comboBox;
//    };
//}

/**
 * @description Элемент представления для отображения данных в виде таблицы
 * @param {View} parentView
 * @class DataGrid
 */
function DataGrid(parentView) {
    this.onValueChangedHandlers = [];

    _.superClass(DataGrid, this, parentView);
}

_.inherit(DataGrid, Element);

_.extend(DataGrid.prototype, {

    /**
     * @description Создает экземпляр контрола отображения данных в виде таблицы
     * @memberOf DataGrid.prototype
     * @returns {DataGridControl}
     */
    createControl: function () {
        return new DataGridControl();
    },

    getColumn: function (name) {
        /** @TODO Не реализовано getColumn() */

    },

    /**
     * @description Возвращает список колонок таблицы.
     * @memberOf DataGrid.prototype
     * @returns {DataGridColumn[]}
     */
    getColumns: function () {
        return this.control.get('columns');
    },

    /**
     * @description Устанавливает список колонок таблицы
     * @memberOf DataGrid.prototype
     * @param {DataGridColumn[]} value
     */
    setColumns: function (value) {
        if (_.isArray(value)) {
            this.control.set('columns', value);
        }
    },

    /**
     * @description Возвращает значение, определяющее, возможен ли выбор нескольких значений.
     * @memberOf DataGrid.prototype
     * @returns {Boolean}
     */
    getMultiSelect: function () {
        return this.control.get('multiSelect');
    },

    /**
     * @description Устанавливает значение, определяющее, возможен ли выбор нескольких значений.
     * @memberOf DataGrid.prototype
     * @param {Boolean} value
     */
    setMultiSelect: function (value) {
        if (typeof value !== 'undefined') {
            this.control.set('multiSelect', value);
        }
    },

    /**
     * @description Возвращает значение, определяющее, запрещено ли редактирование значения.
     * @memberOf DataGrid.prototype
     * @returns {Boolean}
     */
    getReadOnly: function () {
        return this.control.get('readOnly');
    },

    /**
     * @description Устанавливает значение, определяющее, запрещено ли редактирование значения.
     * @memberOf DataGrid.prototype
     * @param {Boolean} value
     */
    setReadOnly: function (value) {
        if (typeof value !== 'undefined') {
            this.control.set('readOnly', value);
        }
    },

    /**
     * @description Возвращает свойство элемента источника данных, которое хранит значение для выбора.
     * @memberOf DataGrid.prototype
     * @returns {String}
     */
    getValueProperty: function () {
        return this.control.get('valueProperty');
    },

    /**
     * @description Устанавливает свойство элемента источника данных, которое хранит значение для выбора.
     * @memberOf DataGrid.prototype
     * @param {String} value
     */
    setValueProperty: function (value) {
        this.control.set('valueProperty', value);
    },

    /**
     * @description Возвращает выбранное значение
     * @memberOf DataGrid.prototype
     * @returns {*}
     */
    getValue: function () {
        return this.control.get('value');
    },

    /**
     * @description Устанавливает выбранное значение
     * @memberOf DataGrid.prototype
     * @param {*} value
     */
    setValue: function (value) {
        if (this.getMultiSelect() === false) {
            this.control.set('selectedItem', value);
        }
        this.control.set('value', value);
    },

    /**
     * @description Очищает выбранное значение
     * @memberOf DataGrid.prototype
     */
    clearValue: function () {
        this.control.unset('value');
    },

    /**
     * @description Возвращает список значений для выбора.
     * @memberOf DataGrid.prototype
     * @returns {Array}
     */
    getItems: function () {
        return this.control.get('items');
    },

    /**
     * @description Устанавливает список значений для выбора.
     * @memberOf DataGrid.prototype
     * @param {Array} items
     */
    setItems: function (items) {
        if (_.isArray(items)) {
            this.control.set('items', _.deepClone(items));
        } else {
            this.control.set('items', []);
        }
    },

    /**
     * @description Установка обработчика изменения значения
     * @memberOf DataGrid.prototype
     * @param {Function} callback
     */
    onValueChanged: function (callback) {
        this.control.onValueChanged(callback);
    },

    /**
     * @description Установка обработчика изменения на двойной клик
     * @memberOf DataGrid.prototype
     * @param {Function} callback
     */
    onDoubleClick: function (callback) {
        this.control.onDoubleClick(callback);
    },

    /**
     * @description Устанавливает конструктор для создания ItemTemplate
     * @param {Function} itemTemplate
     * @memberOf {DataGrid.prototype}
     */
    setItemTemplate: function (itemTemplate) {
        this.control.set('itemTemplate', itemTemplate);
    },

    setFormat: function (newFormat) {
        this.control.set('itemFormat', newFormat);
    },


    setGroups: function (groups) {
        this.control.set('groups', groups);
    },

    getGroups: function (groups) {
        return this.control.get('groups');
    },

    setCustomColors: function (customColors) {
        this.control.set('customColors', customColors);
    },

    setPopUpMenu: function (popupMenu) {
        this.control.set('popupMenu', popupMenu);
    },

    setAutoLoad: function (isAutoLoad) {
        this.control.set('autoLoad', isAutoLoad);
    },
    onScrollToTheEnd: function(handler){
        this.control.onScrollToTheEnd(handler);
    },

    onSelectedItemChanged: function (handler) {
        this.control.onSelectedItemChanged(handler);
    },

    setSelectedItem: function (value) {
        this.control.set('selectedItem', value);
        if (this.getMultiSelect() === false) {
            this.control.set('value', value);
        }
    },

    getSelectedItem: function () {
        return this.control.get('selectedItem');
    },

    setComparator: function (value) {
        this.control.set('comparator', value);
    }


});

var metaCustomColors = [
    {
        Rule: "",
        PropertyName: "",
        Color: ""
    }
];

var CustomColors = function () {
    this.items = [];
};

CustomColors.prototype.setItems = function (items) {

    if (_.isArray(items) === false || _.isEqual(this.items, items)) {
        return;
    }

    this.items = items;
};

CustomColors.prototype.getColor = function (data) {
    var item;
    var color = false;

    for (var i = 0, ln = this.items.length; i < ln; i = i + 1) {
        item = this.items[i];
        if (item.check(data)) {
            color = item.getColor();
            break;
        }
    }
    return color;
};

var CustomColorsItem = function (propertyName, color, rule) {
    this.propertyName = propertyName;
    this.color = color;
    this.rule = rule;
};

CustomColorsItem.prototype.check = function (data) {
    var value;
    if (typeof this.propertyName !== 'undefined' && this.propertyName !== null && this.propertyName !== '') {
        value = InfinniUI.ObjectUtils.getPropertyValue(data, this.propertyName);
    } else {
        value = data;
    }

    return this.rule(value);
};

CustomColorsItem.prototype.getColor = function () {
    return this.color;
};


var CustomColorsBuilder = function () {

    this.build = function (metadata) {
        var customColors = new CustomColors();
        var items = [];
        var item;
        if (_.isArray(metadata)) {
            for (var i = 0, ln = metadata.length; i < ln; i = i + 1) {
                item = new CustomColorsItem(metadata[i].PropertyName, metadata[i].Color, this.buildRule(metadata[i].Rule));
                items.push(item);
            }
            customColors.setItems(items);
        }

        return customColors;
    };

    this.buildRule = function (rule) {
        var text = 'try {' + rule + '} catch (e) {return false;}';
        return new Function('data', text);
    }
};

/**
 * @description Построитель DataGrid
 * @class DataGridBuilder
 */
var DataGridBuilder = function () {

    /**
     * @description Создание и инициализация экземпляра DataGrid
     * @memberOf DataGridBuilder
     * @param {ApplicationBuilder} builder
     * @param {View} parent
     * @param {Object} metadata
     * @returns {DataGrid}
     */
    this.build = function (builder, parent, metadata, collectionProperty) {

        //var itemTemplateConstructor = this.getItemTemplateConstructor(builder, parent, metadata, collectionProperty);
        this.builder = builder;
        this.parent = parent;
        var dataGrid = new DataGrid(parent);

        this.initScriptsHandlers(parent, metadata, dataGrid);

        /** Begin CustomColors Init **/
        /** @TODO Отрефакторить после описания метаданных */
//        metadata.CustomColors = [
//            {Rule: 'return _.isNull(data);', PropertyName: '', Color: '#ee6e73'},
//            {Rule: 'return data == "89999";', PropertyName: 'CardNumber', Color: '#56c9fd'},
//            {Rule: 'return data === "Баранович";', PropertyName: 'Personal.MiddleName', Color: '#8acc8d'},
//            {Rule: 'return data < 0;', PropertyName: '', Color: '#fff06b'}
//        ];

        if(metadata.AutoLoad === undefined){
            metadata.AutoLoad = true;
        }

        var customColorsBuilder = new CustomColorsBuilder();
        var customColors = customColorsBuilder.build(metadata.CustomColors);
        dataGrid.setCustomColors(customColors);
        /** End CustomColors Init **/
        dataGrid.setStyle(metadata.Style);
        dataGrid.setName(metadata.Name);
        dataGrid.setText(metadata.Text);
        dataGrid.setEnabled(metadata.Enabled);
        dataGrid.setVisible(metadata.Visible);
        dataGrid.setMultiSelect(metadata.MultiSelect);
        //dataGrid.setReadOnly(metadata.ReadOnly);
        dataGrid.setValueProperty(metadata.ValueProperty);
        dataGrid.setHorizontalAlignment(metadata.HorizontalAlignment);
        dataGrid.setVerticalAlignment(metadata.VerticalAlignment);
        dataGrid.setAutoLoad(metadata.AutoLoad);
        dataGrid.setItemTemplate(this.getItemTemplateConstructor(builder, parent, metadata, collectionProperty));
        this.initGroups(dataGrid, metadata.Groups);
        this.initAutoload(parent, metadata, dataGrid);

        dataGrid.setColumns(this.buildColumns(metadata.Columns, collectionProperty));
        dataGrid.setComparator(this.builder.buildType(this.parent, 'Comparator', {}, collectionProperty));

        if (typeof metadata.Items !== 'undefined') {
            var dataBinding = builder.build(parent, metadata.Items, collectionProperty);
            dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                dataGrid.setItems(value.value);
            });

            if (typeof metadata.Items.PropertyBinding !== 'undefined') {
                var exchange = parent.getExchange();
                exchange.subscribe(messageTypes.onSelectedItemChanged, function (message) {
                    if (message && message.DataSource === metadata.Items.PropertyBinding.DataSource) {
                        dataGrid.setSelectedItem(message.Value);
                    }
                })
            }

            dataGrid.onSelectedItemChanged(function () {
                var propertyName = dataBinding.getProperty();
                if (_.isEmpty(propertyName) !== false) {
                    /** событие только если биндинг указывает на весь источник данных !!! */
                    parent.getExchange().send(messageTypes.onSetSelectedItem, {
                        dataSource: dataBinding.getDataSource(),
                        property: propertyName,
                        value: dataGrid.getSelectedItem()
                    });
                }
            });




        }

        if (metadata.ItemFormat) {
            var format = builder.build(parent, metadata.ItemFormat);
            dataGrid.setFormat(format);
        }

        if (typeof metadata.Value !== 'undefined') {
            var valueBinding = builder.build(parent, metadata.Value, collectionProperty);

            // Привязка элемента к источнику данных
            valueBinding.onPropertyValueChanged(function (context, args) {
                dataGrid.setValue(args.value);
            });

            // Привязка источника данных к элементу
            dataGrid.onValueChanged(function (context, args) {
                valueBinding.setPropertyValue(dataGrid.getValue());
            });
        }

        if (metadata.OnKeyDown) {
            dataGrid.onKeyDown(function (data) {
                new ScriptExecutor(parent).executeScript(metadata.OnKeyDown.Name, data);
            });
        }

        if (typeof metadata.ToolBar !== 'undefined') {
            var popupMenu = new DataGridPopupMenuView();
            var items = [];
            var actions = [];
            var scripts = [];
            var executeScript = function (name) {
                new ScriptExecutor(parent).executeScript(name);
            };

            _.each(metadata.ToolBar.Items, function (data) {
                var button = builder.build(parent, data, collectionProperty);
                items.push(button);
            });

            popupMenu.setItems(items);
            dataGrid.setPopUpMenu(popupMenu);
        }

        if (parent && parent.registerElement) {
            parent.registerElement(dataGrid);
        }


        return dataGrid;
    };

    this.initAutoload = function(parent, metadata, dataGrid){

        if(metadata.AutoLoad){
            var autoLoadLastPageSize = 30,
                autoLoadPageStep = 30,
                that = this;

            this.setPageSize(parent, metadata, dataGrid, autoLoadPageStep);

            dataGrid.onScrollToTheEnd(function(itemCount){
                if(itemCount == autoLoadLastPageSize){
                    autoLoadLastPageSize += autoLoadPageStep;
                    that.setPageSize(parent, metadata, dataGrid, autoLoadLastPageSize);
                }
            });
        }
    };


    this.setPageSize = function(parent, metadata, dataGrid, size){
        var args = {
            source: dataGrid,
            dataSource: metadata.Items.PropertyBinding.DataSource,
            value: size
        };

        var exchange = parent.getExchange();
        exchange.send(messageTypes.onSetPageSize, args);
    };

    /**
     * @private
     * @description Инициализация обработчиков событий
     * @memberOf DataGridBuilder
     * @param parent
     * @param metadata
     * @param {DataGrid} dataGrid
     */
    this.initScriptsHandlers = function (parent, metadata, dataGrid) {
        // Скриптовые обработчики на события
        if (parent && metadata.OnLoaded){
            dataGrid.onLoaded(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (parent && metadata.OnValueChanged) {
            dataGrid.onValueChanged (function () {
                new ScriptExecutor(parent).executeScript(metadata.OnValueChanged.Name);
            });
        }

        if(parent && metadata.OnDoubleClick) {
            dataGrid.onDoubleClick(function (args) {
                new ScriptExecutor(parent).executeScript(metadata.OnDoubleClick.Name, args);
            });
        }
    };

    /**
     * @private
     * @description Инициализация списка колонок
     * @memberOf DataGridBuilder.prototype
     * @param metadata
     * @returns {DataGridColumn[]}
     */
    this.buildColumns = function (metadata, collectionProperty) {
        var columns = [], column;

        if (typeof metadata !== 'undefined' && metadata.constructor === Array) {
            for (var i = 0, ln = metadata.length; i < ln; i = i + 1) {
                column = this.builder.buildType(this.parent, 'DataGridColumn', metadata[i], collectionProperty);
                if (typeof column !== 'undefined') {
                    columns.push(column);
                }
            }
        }

        return columns;
    };

    /**
     * @private
     * @param builder
     * @param parent
     * @param metadata
     * @param collectionProperty
     * @memberOf DataGridBuilder
     * @returns {*}
     */
    this.getItemTemplateConstructor = function (builder, parent, metadata, collectionProperty) {

        var itemTemplateConstructor = null;

        if (typeof metadata.ItemTemplate !== 'undefined' && metadata.ItemTemplate !== null && metadata.ItemTemplate !== '') {
            itemTemplateConstructor = function(baseIndex) {
                return builder.build(parent, metadata.ItemTemplate, new ListBoxItemCollectionProperty(metadata.Items.PropertyBinding.Property, baseIndex, collectionProperty));
            };
        }

        return itemTemplateConstructor;
    };

    this.initGroups = function(dataGrid, groups){
        dataGrid.setGroups( groups );
    };

};


/**
 * @description Элемент колонки DataGrid
 * @class DataGridColumn
 */
var DataGridColumn = function () {
    this.control = new DataGridColumnControl();
};

/**
 * @TODO Реализовать ItemFormat,ItemTemplate
 */

_.extend(DataGridColumn.prototype, {

    /**
     * @description Возвращает наименование колонки
     * @memberOf DataGridColumn.prototype
     * @returns {String}
     */
    getName: function () {
        return this.control.get('name');
    },

    /**
     * @description Устанавливает наименование колонки
     * @memberOf DataGridColumn.prototype
     * @param {String} value
     */
    setName: function (value) {
        if (_.isString(value)) {
            this.control.set('name', value);
        }
    },

    /**
     * @description Возвращает текст заголовка колонки.
     * @memberOf DataGridColumn.prototype
     * @returns {String}
     */
    getText: function () {
        return this.control.get('text');
    },

    /**
     * @description Устанавливает текст заголовка колонки
     * @memberOf DataGridColumn.prototype
     * @param {String} value
     */
    setText: function (value) {
        if (_.isString(value)) {
            this.control.set('text', value);
        }
    },

    getImage: function () {
        return this.control.get('image');
    },

    setImage: function (value) {
        if (typeof value !== 'undefined') {
            this.control.set('image', value);
        }
    },

    /**
     * @description Возвращает значение, определяющее, отображается ли колонка в таблице.
     * @memberOf DataGridColumn.prototype
     * @returns {Boolean}
     */
    getVisible: function () {
        return this.control.get('visible');
    },

    /**
     * @description Устанавливает значение, определяющее, отображается ли колонка в таблице.
     * @memberOf DataGridColumn.prototype
     * @param {Boolean} value
     */
    setVisible: function (value) {
        if (_.isBoolean(value)) {
            this.control.set('visible', value);
        }
    },

    getReadOnly: function () {
        return this.control.get('readOnly');
    },

    setReadOnly: function (value) {
        if (_.isBoolean(value)) {
            this.control.set('readOnly', value);
        }
    },

    getResizable: function () {
        return this.control.get('resizable');
    },

    setResizable: function (value) {
        if (_.isBoolean(value)) {
            this.control.set('resizable', value);
        }
    },

    /**
     * @description Устанавливает свойство элемента источника данных, которое хранит значение для отображения
     * @memberOf DataGridColumn.prototype
     * @param {String} value
     */
    setDisplayProperty: function (value) {
        if (_.isString(value)) {
            this.control.set('displayProperty', value);
        }
    },

    /**
     * @description Возвращает свойство элемента источника данных, которое хранит значение для отображения
     * @memberOf DataGridColumn.prototype
     * @returns {String}
     */
    getDisplayProperty: function () {
        return this.get('displayProperty');
    },

    /**
     * @description Устанавливает формат отображения элемента
     * @memberOf DataGridColumn.prototype
     * @param {Object} newFormat
     */
    setFormat: function (newFormat) {
        this.control.set('itemFormat', newFormat);
    },

    /**
     * @description Возвращает формат отображения элемента
     * @memberOf DataGridColumn.prototype
     * @returns {Object}
     */
    getFormat: function () {
        return this.control.get('itemFormat');
    },

    /**
     * @description Устанавливает конструктор для создания ItemTemplate
     * @param {Function} itemTemplate
     * @memberOf {DataGridColumn.prototype}
     */
    setItemTemplate: function (itemTemplate) {
        this.control.set('itemTemplate', itemTemplate);
    }

});

/**
 * @description Построитель DataGridColumn
 * @class DataGridColumnBuilder
 */
var DataGridColumnBuilder = function () {

    /**
     * @description Создает экземпляр {@link DataGridColumn}
     * @memberOf DataGridColumnBuilder
     * @param {ApplicationBuilder} builder
     * @param {View} parent
     * @param {Object} metadata
     * @returns {DataGridColumn}
     */
    this.build = function (builder, parent, metadata, collectionProperty) {
        var column;

        if (typeof metadata !== 'undefined' && metadata !== null) {

            column = new DataGridColumn();

            column.setName(metadata.Name);
            column.setText(metadata.Text);
            column.setImage(metadata.Image);
            column.setResizable(metadata.Resizable);
            column.setVisible(metadata.Visible);
            column.setDisplayProperty(metadata.DisplayProperty);

            var itemTemplate = metadata.ItemTemplate;
            if (typeof itemTemplate !== 'undefined' && itemTemplate !== null && itemTemplate !== '') {
                column.setItemTemplate(this.getItemTemplateConstructor(builder, parent, metadata, collectionProperty));
            }

            if (metadata.ItemFormat) {
                var format = builder.build(parent, metadata.ItemFormat);
                column.setFormat(format);
            }

        }
        return column;
    };

    /**
     * @private
     * @param builder
     * @param parent
     * @param metadata
     * @param collectionProperty
     * @memberOf DataGridColumnBuilder
     * @returns {*}
     */
    this.getItemTemplateConstructor = function (builder, parent, metadata, collectionProperty) {

        var itemTemplateConstructor = null;

        if (typeof metadata.ItemTemplate !== 'undefined' && metadata.ItemTemplate !== null && metadata.ItemTemplate !== '') {
            itemTemplateConstructor = function(baseIndex) {
                return builder.build(parent, metadata.ItemTemplate, new ListBoxItemCollectionProperty('', baseIndex, collectionProperty));
            };
        }

        return itemTemplateConstructor;
    };


};


function DataNavigation(parentView) {
    _.superClass(DataNavigation, this, parentView);
}

_.inherit(DataNavigation, Element);

_.extend(DataNavigation.prototype, {
    createControl: function () {
        return new DataNavigationControl();
    },

    getPageNumber: function () {
        return this.control.get('pageNumber');
    },

    setPageNumber: function (pageNumber) {
        this.control.set('pageNumber', pageNumber);
    },

    getPageSize: function () {
        return this.control.get('pageSize');
    },

    setPageSize: function (pageSize) {
        this.control.set('pageSize', pageSize);
    },

    getAvailablePageSizes: function () {
        return this.control.get('availablePageSizes');
    },

    setAvailablePageSizes: function (availablePageSizes) {
        this.control.set('availablePageSizes', availablePageSizes);
    },

    setDataSource: function (dataSource) {
        return this.control.set('dataSource', dataSource);
    },

    getDataSource: function () {
        return this.control.get('dataSource');
    },

    setView: function (view) {
        return this.control.set('view', view);
    },

    getView: function () {
        return this.control.get('view');
    },

    setPageCount: function (pageCount) {
        return this.control.set('pageCount', pageCount);
    },

    getPageCount: function () {
        return this.control.get('pageCount');
    },

    onUpdateItems: function (handler) {
        this.control.onUpdateItems(handler);
    },

    onSetPageNumber: function (handler) {
        this.control.onSetPageNumber(handler);
    },

    onSetPageSize: function (handler) {
        this.control.onSetPageSize(handler);
    }
});

function DataNavigationBuilder() {
}

_.inherit(DataNavigationBuilder, ElementBuilder);

_.extend(DataNavigationBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);


        this.initDataSource(params);
        this.initScriptsHandlers(params);

        var element = params.element,
            metadata = params.metadata;

        element.setDataSource(metadata.DataSource);
        element.setAvailablePageSizes(metadata.AvailablePageSizes);
        element.setView(params.parent);

        element.setPageNumber(metadata.PageNumber);
        element.setPageSize(metadata.PageSize || 10);

        //Скриптовые обработчики на события
        //TODO: OnUpdateItems

    },

    createElement: function (params) {
        return new DataNavigation(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnSetPageNumber){
            params.element.onSetPageNumber(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnSetPageNumber.Name);
            });
        }

        if (params.parent && metadata.OnSetPageSize){
            params.element.onSetPageSize(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnSetPageSize.Name);
            });
        }
    },

    initDataSource: function (params) {
        var self = params;

        params.element.onSetPageNumber(function (value) {
            var args = {
                source: self.element,
                dataSource: self.metadata.DataSource,
                value: value
            };

            var view = self.element.getView();
            var exchange = view.getExchange();
            exchange.send(messageTypes.onSetPageNumber, args);
        });

        params.element.onSetPageSize(function (value) {
            var args = {
                source: self.element,
                dataSource: self.metadata.DataSource,
                value: value
            };

            var view = self.element.getView();
            var exchange = view.getExchange();
            exchange.send(messageTypes.onSetPageSize, args);
        });
    }
});
function DatePicker(parentView) {
    _.superClass(DatePicker, this, parentView);
}

_.inherit(DatePicker, Element);

_.extend(DatePicker.prototype, {
    createControl: function(){
        return new DatePickerControl();
    },

    getMode: function(){
        return this.control.get('mode');
    },

    setMode: function(mode){
        this.control.set('mode', mode);
    },

    getMinDate: function(){
        return this.control.get('minDate');
    },

    setMinDate: function(minDate){
        this.setDateProperty('minDate', minDate, this.control.controlModel.defaults.minDate);
    },

    getMaxDate: function(){
        return this.control.get('maxDate');
    },

    setMaxDate: function(maxDate){
        this.setDateProperty('maxDate', maxDate, this.control.controlModel.defaults.maxDate);
    },

    setDateProperty: function(property, value, defaultValue){
        if (_.isObject(value) && !(value instanceof Date)) {
            value = null;
        }

        var date = this.parseToDate(value);

        if(date !== null){
            this.control.set(property, date);
        }
        else{
            this.control.set(property, this.parseToDate(defaultValue));
        }
    },

    parseToDate: function(value) {
        if (typeof value === 'undefined' || value === null) {
            return null;
        } else {
            return new Date(value);
        }
    },

    isValidDate: function(value){
        return (value instanceof Date) && (!isNaN(value.getTime()));
    }
},
    valuePropertyMixin,
    formatPropertyMixin,
    editMaskPropertyMixin,
    baseTextElementMixin,
    elementHorizontalTextAlignmentMixin,
    elementForegroundMixin,
    elementBackgroundMixin,
    elementTextStyleMixin,
    elementHintTextMixin,
    elementErrorTextMixin,
    elementLabelTextMixin
);

function DatePickerBuilder() {
}

_.inherit(DatePickerBuilder, ElementBuilder);

_.extend(DatePickerBuilder.prototype, {
    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);
		this.initScriptsHandlers(params);

        params.metadata.Mode = params.metadata.Mode || 'Date';

        //params.metadata.DisplayFormat = {
        //    DateTimeFormat:{
        //        Format: 'f'
        //    }
        //};
        //params.metadata.EditMask = {
        //    DateTimeEditMask: {
        //        Mask: 'F'
        //    }
        //};

        if(!params.metadata.EditMask) {
            var mask;
            switch (params.metadata.Mode) {
                case 'Date':
                    mask = 'd';
                    break;
                case 'Time':
                    mask = 't';
                    break;
                case 'DateTime':
                    mask = 'g';
                    break;
            }
            params.metadata.EditMask = {
                DateTimeEditMask: {
                    Mask: mask
                }
            };
            params.metadata.DisplayFormat = {
                DateTimeFormat:{
                    Format: mask
                }
            };
        }

        if(params.metadata.DisplayFormat){
            switch (params.metadata.DisplayFormat.DateTimeFormat.Format){
                case 'f':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'dd MM yyyy hh:ii';
                    break;
                case 'F':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'dd MM yyyy hh:ii:ss';
                    break;
                case 'g':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'dd.mm.yyyy hh:ii';
                    break;
                case 'G':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'dd.mm.yyyy hh:ii:ss';
                    break;
                case 'd':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'dd.mm.yyyy';
                    break;
                case 'D':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'dd MM yyyy';
                    break;
                case 't':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'hh:ii';
                    break;
                case 'T':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'hh:ii:ss';
                    break;
                case 'y':
                case 'Y':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'MM yyyy';
                    break;
                case 'm':
                case 'M':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'MM dd';
                    break;
                case 's':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'yyyy-mm-ddThh:ii:ss';
                    break;
                case 'u':
                    params.metadata.DisplayFormat.DateTimeFormat.Format = 'yyyy-mm-dd hh:ii:ssZ';
                    break;

                default:

                    break
            }
        }

        this.initEditMaskProperty(params);
        this.initFormatProperty(params);
        this.initValueProperty(params, true);
        this.initForeground(params);
        this.initBackground(params);
        this.initTextStyle(params);
        this.initHorizontalTextAlignmentProperty(params);
        this.initHintText(params);
        this.initErrorText(params);
        this.initLabelText(params);


        params.element.setMode(params.metadata.Mode);
        params.element.setMinDate(params.metadata.MinDate);
        params.element.setMaxDate(params.metadata.MaxDate);

    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }

        this.initBaseTextElementEvents(params);
    },

    createElement: function (params) {
        return new DatePicker(params.parent);
    }

},
    builderValuePropertyMixin,
    builderFormatPropertyMixin,
    builderEditMaskPropertyMixin,
    builderBaseTextElementMixin,
    builderHorizontalTextAlignmentPropertyMixin,
    builderForegroundMixin,
    builderBackgroundMixin,
    builderTextStyleMixin,
    builderErrorTextMixin,
    builderHintTextMixin,
    builderLabelTextMixin
);


function DocumentViewer(parentView) {
    _.superClass(DocumentViewer, this, parentView);
}

_.inherit(DocumentViewer, Element);

_.extend(DocumentViewer.prototype, {

    createControl: function () {
        return new DocumentViewerControl();
    },

    setView: function (view) {
        return this.control.set('view', view);
    },

    setPrintViewType: function(viewType) {
        return this.control.set('viewType', viewType);
    },

    getPrintViewType: function() {
        return this.control.get('viewType');
    },

    setPrintViewId: function(viewId) {
        return this.control.set('viewId', viewId);
    },

    getPrintViewId: function() {
        return this.control.get('viewId');
    },

    setDataSource: function (dataSource) {
        return this.control.set('dataSource', dataSource);
    },

    getDataSource: function () {
        return this.control.get('dataSource');
    },

    setUrl: function (url) {
        return this.control.set('url', url);
    },

    setValueExist: function(val){
        return this.control.set('valueExist', val);
    }

}, valuePropertyMixin);
function DocumentViewerBuilder() {
}

_.inherit(DocumentViewerBuilder, ElementBuilder);

_.extend(DocumentViewerBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);

        params.element.setView(params.parent);


        if(params.metadata.Value){
            var binding  = this.initValueProperty(params);
            binding.onPropertyValueChanged(function (dataSourceName, value) {
                params.element.setUrl(binding.getFileUrl());
            });

            params.element.setValueExist(true);

            params.element.setUrl(binding.getFileUrl());
        }else{
            params.element.setDataSource(params.metadata.DataSource);
            params.element.setPrintViewType(params.metadata.PrintViewType);
            params.element.setPrintViewId(params.metadata.PrintViewId);
        }
        //this.initDataSource(params);
    },

    createElement: function (params) {
        return new DocumentViewer(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }
    }
}, builderValuePropertyMixin);

function FilterPanel(parentView) {
    _.superClass(FilterPanel, this, parentView);
}

_.inherit(FilterPanel, Element);

_.extend(FilterPanel.prototype, {

    createControl: function () {
        return new FilterPanelControl();
    },

    setView: function (view) {
        return this.control.set('view', view);
    },

    getView: function () {
        return this.control.get('view');
    },

    setDataSource: function (dataSource) {
        return this.control.set('dataSource', dataSource);
    },

    getDataSource: function () {
        return this.control.get('dataSource');
    },

    setFilters: function(filters){
        return this.control.set('filters', filters);
    },

    getFilters: function(){
        return this.control.get('filters');
    },

    setQuery: function(query){
        return this.control.set('query', query);
    },

    getQuery: function(){
        if(!this.control.get('value')) {
            return this.control.get('query');
        }else{
            return this.control.get('value');
        }
    },

//    setProperty: function(property){
//        return this.control.set('property', property)
//    },

    getOrientation: function () {
        return this.control.get('orientation');
    },

    setOrientation: function (orientation) {
        if (typeof orientation == 'string') {
            this.control.set('orientation', orientation);
        }
    },

    getHeight: function () {
        return 44;
    },

    /**
     * @see {@link http://jira.infinnity.lan/browse/UI-772}
     */
    filter: function () {
        this.control.filter();
    }

}, valuePropertyMixin);
function FilterPanelBuilder() {
}

_.inherit(FilterPanelBuilder, ElementBuilder);

_.extend(FilterPanelBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initValueProperty(params);
        this.initScriptsHandlers(params);

        params.element.setDataSource(params.metadata.DataSource);
        params.element.setView(params.parent);
        //params.metadata.Query = [
        //        {
        //            CriteriaType: 1,
        //            Property: "MedicalWorker.Id",
        //            Value: "9f7df52a-229a-4b6c-978f-83e19573d510"
        //        }
        //];
        params.element.setQuery(params.metadata.Query);

        var array = [];
        _.each(params.metadata.GeneralProperties, function (metadataProperty) {
            var obj = {};
            var label = params.builder.build(params.parent, {Label: {}});
            label.setValue(metadataProperty.Text);

            obj.text = label;
            obj.property = metadataProperty.Property;
            obj.operators = [];

            _.each(metadataProperty.Operators, function (metadataOperator) {
                var operator = {};
                operator.operator = metadataOperator.Operator;
                operator.el = params.builder.build(params.parent, metadataOperator.Editor);
                obj.operators.push(operator);
            });

            array.push(obj);
        });
        params.element.setFilters(array);

        this.initDataSource(params);
    },

    createElement: function (params) {
        return new FilterPanel(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    initDataSource: function (params) {
        var self = params;

        params.element.onValueChanged(function (value) {
            var args = {
                source: self.element,
                dataSource: self.metadata.DataSource,
                value: value
            };

            var view = self.element.getView();
            var exchange = view.getExchange();
            exchange.send(messageTypes.onSetPropertyFilters, args);
        });
    }

}, builderValuePropertyMixin);

function Label() {
    _.superClass(Label, this);
}

_.inherit(Label, Element);


_.extend(Label.prototype, {

        createControl: function () {
            return new LabelControl();
        },

        getLineCount: function () {
            return this.control.get('lineCount');
        },

        setLineCount: function (value) {
            this.control.set('lineCount', value);
        },
        setTextWrapping: function (value) {
            if (typeof value === 'boolean') {
                this.control.set('textWrapping', value);
            }
        },

        getTextWrapping: function () {
            return this.control.get('textWrapping');
        }

    },
    valuePropertyMixin,
    formatPropertyMixin,
    elementHorizontalTextAlignmentMixin,
    //@TODO TextTrimming
    elementBackgroundMixin,
    elementForegroundMixin,
    elementTextStyleMixin
);
function LabelBuilder() {
}

_.inherit(LabelBuilder, ElementBuilder);

_.extend(LabelBuilder.prototype, {

    applyMetadata: function(params){
        ElementBuilder.prototype.applyMetadata.call(this, params);

        params.element.setLineCount(params.metadata.LineCount);
        params.element.setTextWrapping(params.metadata.TextWrapping);
        this.initScriptsHandlers(params);
        this.initFormatProperty(params);
        this.initValueProperty(params);
        this.initHorizontalTextAlignmentProperty(params);
        this.initForeground(params);
        this.initBackground(params);
        this.initTextStyle(params);

    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    createElement: function(params){
        var label = new Label(params.parent);
        label.getHeight = function () {
            return 34;
        };
        return label;
    }

},
    builderValuePropertyMixin,
    builderFormatPropertyMixin,
    builderHorizontalTextAlignmentPropertyMixin,
    builderBackgroundMixin,
    builderForegroundMixin,
    builderTextStyleMixin
);
function LinkLabel() {
    _.superClass(LinkLabel, this);
}

_.inherit(LinkLabel, Element);

_.extend(LinkLabel.prototype, {

        createControl: function () {
            return new LinkLabelControl();
        },

        getReference: function () {
            return this.control.get('reference');
        },

        setReference: function (value) {
            this.control.set('reference', value);
        },

        onClick: function (handler) {
            this.control.controlView.addEventHandler('OnClick', handler);
        },

        getTextTrimming: function () {
            return this.control.get('textTrimming');
        },

        setTextTrimming: function (value) {
            this.control.set('textTrimming', value);
        },

        getTextWrapping: function () {
            return this.control.get('textWrapping');
        },

        setTextWrapping: function (value) {
            this.control.set('textWrapping', value);
        },

        getLineCount: function () {
            return this.control.get('lineCount');
        },

        setLineCount: function (value) {
            this.control.set('lineCount', value);
        },
        getAction: function () {
            return this.control.get('action');
        },

        setAction: function (action) {
            this.control.set('action', action);

            this.onClick(function () {
                var action = this.getAction();
                if (action) {
                    action.execute();
                }
            }.bind(this));
        }

    },
    valuePropertyMixin,
    formatPropertyMixin,
    elementHorizontalTextAlignmentMixin,
    elementBackgroundMixin,
    elementForegroundMixin,
    elementTextStyleMixin
);
function LinkLabelBuilder() {
}

_.inherit(LinkLabelBuilder, ElementBuilder);

_.extend(LinkLabelBuilder.prototype,
    {
        defaults: {
            Foreground: "Black",
            Background: "Transparent",
            HorizontalTextAlignment: "Left",
            TextStyle: "Body1",
            TextTrimming: true,
            TextWrapping: true
        },

        applyDefaults: function (metadata) {
            var defaults = this.defaults;

            for (var i in defaults) {
                if (typeof metadata[i] === 'undefined') {
                    metadata[i] = defaults[i];
                }
            }
        },

        applyMetadata: function (params) {
            this.applyDefaults(params.metadata);
            var metadata = params.metadata;
            var element = params.element;

            ElementBuilder.prototype.applyMetadata.call(this, params);

            element.setTextWrapping(metadata.TextWrapping);
            element.setTextTrimming(metadata.TextTrimming);
            element.setLineCount(metadata.LineCount);

            this.initHorizontalTextAlignmentProperty(params);
            this.initForeground(params);
            this.initBackground(params);
            this.initTextStyle(params);
            this.initFormatProperty(params);
            this.initValueProperty(params);
            this.initBindingToProperty(params, metadata.Reference, 'Reference');
            this.initScriptsHandlers(params);

            if(params.metadata.Action) {
                params.element.setAction(params.builder.build(params.parent, params.metadata.Action, params.collectionProperty));
            }
        },

        initScriptsHandlers: function (params) {
            var metadata = params.metadata;

            //Скриптовые обработчики на события
            if (params.parent && metadata.OnLoaded) {
                params.element.onLoaded(function () {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
                });
            }

            if (params.parent && metadata.OnValueChanged) {
                params.element.onValueChanged(function () {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
                });
            }

            if (params.parent && metadata.OnClick) {
                params.element.onClick(function () {
                    var script = new ScriptExecutor(params.parent);
                    return script.executeScript(metadata.OnClick.Name);
                });
            }
        },

        createElement: function (params) {
            var linkLabel = new LinkLabel(params.parent);
            linkLabel.getHeight = function () {
                return 34;
            };
            return linkLabel;
        }

    },
    builderValuePropertyMixin,
    builderFormatPropertyMixin,
    builderHorizontalTextAlignmentPropertyMixin,
    builderBackgroundMixin,
    builderForegroundMixin,
    builderTextStyleMixin
);
function ListBox(addItemAction, editItemAction, dataBinding, listBoxItemConstructor) {

    var listBox = this;

    listBox.value = null;

    var template = InfinniUI.Template["element/dataElement/listBox/template/listBox.tpl.html"];

    /*
     Список данных ListBox. Можно было бы обойтись без данного списка,
     используя только listBoxItems, однако он необходим для обеспечения
     лучшей инкапсуляции класса
     */
    var items = [];

    var onSetSelectedValueHandlers = $.Callbacks();
    var onDoubleClickHandlers = $.Callbacks();

    var popupMenu;

    /*
     Внутренний список для хранения соответствий между элементом ListBox, элементом данных, которые
     данный элемент отображает и нативным DOM-элементом, представляющим элемент данных
     */
    var listBoxItems = [];


    //формируем DOM
    var $template = $(template({}));
    var $body = $template.find('.listbox-body');


    /*
     Создание нового элемента, при условии отсутствия установленнго AddItemAction
     */
    var createItem = function () {

        var item = {};
        //добавляем элемент в список
        //var newitems = _.clone(items); newitems.push(item);
        items = _.clone(dataBinding.getPropertyValue());
        items.push(item);
        dataBinding.setPropertyValue(items);
        listBox.addItem(item);
    };


    /*
     Добавление нового ListItem
     */
    this.addItem = function (dataItem) {

        var foundItem = _.find(items, function(item) {
            return item == dataItem;
        });

        if(typeof foundItem === 'undefined') {
            items.push(dataItem);
        }

        var baseIndex = -1;
        //проверяем, создаем ли элемент ListBox для
        //загруженных данных
        for (var i = 0; i < items.length; i++) {
            if (items[i] === dataItem) {
                baseIndex = i;
                break;
            }
        }
        //если не нашли ничего, добавляем индекс последнего элемента коллекции (для осуществления привязки данных по индексу элемента коллекции)
        if (baseIndex === -1) {
            baseIndex = listBoxItems.length;
        }

        var element = listBoxItemConstructor(baseIndex); //builder.build(parent, metadata.ItemTemplate, new ListBoxItemCollectionProperty(metadata.Items.PropertyBinding.Property, baseIndex));

        var listBoxItem = new ListBoxItem(element, getEditHandler(), onRemoveListBoxItem, this.getMultiSelect());

        var setSelectedValue = this.getValue();

        if(this.getMultiSelect() && _.isArray(setSelectedValue)){
            _.each(setSelectedValue, function(item){
                if(item.Id == dataItem.Id){
                    var $el = listBoxItem.render();
                    $el.find('.item-content').addClass('selected');
                    $el.find('.check-listbox-item').prop('checked', true);
                }
            })
        }

        listBoxItems.push({
            element: element,
            listBoxItem: listBoxItem,
            dataItem: dataItem
        });


        /** Создание меню для элемента ***/
        (function(){
            return;
            var popupMenu = new DataGridPopupMenuView();
            var items = ['Добавить'];
            var handlers = [listBox.runAddItemAction];

            //Пункт меню "Изменить"
            var editHandler = getEditHandler();
            if (editHandler !== null) {
                items.push('Изменить');
                handlers.push(editHandler.bind(undefined, listBoxItem));
            }

            //Пункт меню "Удалить"
            items.push('Удалить');
            handlers.push(onRemoveListBoxItem.bind(undefined, listBoxItem));

            popupMenu.setItems(items);

            var $elItem = listBoxItem.getControl();
            $elItem.on('mousedown', function (e) {
                if( e.button == 2 ) {
                    e.preventDefault();
                    e.stopPropagation();
                    popupMenu.show(e.pageX, e.pageY);
                }
            });

            popupMenu.on('clickItem', function (data) {
                var index = data.index;
                console.log(data);
                if (typeof index === 'undefined' || index === null) {
                    return;
                }
                handlers[index].apply(undefined);
            });

        })();


        insertListItem(listBoxItem);

    };

    var getEditHandler = function () {
        if (editItemAction) {
            return onDialogEdit;
        }
        return null;
    };

    /*
     Вставка нового ListItem в DOM элемента ListBox
     */
    var insertListItem = function (collectionItem) {

        $body.append(collectionItem.getControl());
    };

    /*
     Удалить ListItem из DOM элемента ListBox
     */
    var removeListItem = function (collectionItem) {
        collectionItem.getControl().remove();
    };


    var multiSelect = false;

    this.getMultiSelect = function(){
        return multiSelect;
    };

    this.setMultiSelect = function(value){
        multiSelect = value;
    };


    /*
     Удаление элемента ListBox
     */
    this.removeItem = function (dataItem) {

        for (var i = 0; i < listBoxItems.length; i++) {

            if (_.isEqual(listBoxItems[i].dataItem, dataItem)) {

                //удаляем из разметки
                removeListItem(listBoxItems[i].listBoxItem);
            }
        }
    };

    var listItems = [];

    var self = this;

    listBox.setValue = function(val, index){
        if(self.getMultiSelect()){
            var $els = $template.children('.listbox-body').children().children('.item-content');
            var $chkbox = $els.eq(index).children('.check-listbox-item');

            if(index === undefined){
                index = indexOfVal(listBox.value);
            }

            if(index >= 0){
                if(listItems.length && $els.eq(index).hasClass('selected')){
                    $els.eq(index).removeClass('selected');
                    $chkbox.prop('checked', false);
                    for(var j = 0; j < listItems.length; j++){
                        if(listItems[j].Id == val.Id){
                            listItems.splice(j, 1);
                            onSetSelectedValueHandlers.fire(listItems);
                            return;
                        }
                    }
                }else{
                    $els.eq(index).addClass('selected');
                    $chkbox.prop('checked', true);

                    listItems.push(val);
                    onSetSelectedValueHandlers.fire(listItems);
                }
            }

        }else {
            if (val == listBox.value) {
                return;
            }

            if (val === null) {
                listBox.value = val;
                onSetSelectedValueHandlers.fire(null);
                selectUI_Item(-1);
                return;
            }

            for (var i = 0, ii = listBoxItems.length; i < ii; i++) {
                if (isSubObject(listBoxItems[i].dataItem, val) && listBoxItems[i] != listBox.value) {
                    listBox.value = listBoxItems[i].dataItem;
                    onSetSelectedValueHandlers.fire(listBox.value);
                    selectUI_Item(i);
                    return;
                }
            }
        }
    };

    listBox.getValue = function(){
        if(self.getMultiSelect()){
            return listItems;
        }else{
            return listBox.value;
        }
    };

    /*
     Получить список ДАННЫХ, отображаемых в ListBox
     */
    this.getItems = function () {
        return items;
    };

    /*
     Установить список данных для отображения в ListBox
     */
    this.setItems = function (value) {

        for (var i = 0; i < items.length; i++) {
            this.removeItem(items[i]);
        }
        listBoxItems = [];

        if (_.isArray(value)) {
            items = value;
            dataBinding.setPropertyValue(items);

            for (var i = 0; i < items.length; i++) {
                this.addItem(items[i]);
            }

        } else {
            items = [];
            dataBinding.setPropertyValue(items);
        }

        if(indexOfVal(listBox.value) == -1){
            listBox.setValue(null);
        }
    };

    /*
     Рендеринг контрола
     */
    this.render = function () {

        //TODO: рефакторить listbox
        $template.off();
        $template.on('click', function (event) {
            if(multiSelect){
                if(!$(event.target).hasClass('check-listbox-item')){
                    return;
                }
            }
            var $el = $(event.target).parentsUntil($(this), '.item-content');
            if ($el.length == 0 && $(event.target).hasClass('item-content')) {
                $el = $(event.target);
            }

            if ($el.length > 0) {
                $el = $el.last();

                var index = $el.parent().prevAll().length;

                if (index > -1) {
                    listBox.setValue(listBoxItems[index].dataItem, index);
                }
            }

            //listBoxItems
        });
        $template.on('contextmenu', function (event) {
            event.preventDefault();//Запрещаем стандартное контекстное меню браузера
        });
        $template.on('mousedown', function (event) {
            if( event.button == 2 ) {
                event.preventDefault();
                event.stopPropagation();

                //var grid = this.options.grid;
                //grid.trigger('select', this.getValue());
                ////@TODO Возможны гонки?
                if (popupMenu) {
                    popupMenu.show(event.pageX, event.pageY);
                }
            }
        });
        /*
         Выбор режима добавления элементов
         Если при создании указан AddItemAction на добавление
         элементов, биндим обработчик на исполнение данного AddItemAction
         */
        if (addItemAction) {
            $template.on('click', '.btn-add', onDialogAdd);
        }
        $template.on('dblclick', function(event){
            event.preventDefault();
            onDoubleClickHandlers.fire();
        });
        //else {
        //    $template.on('click', '.btn-add', createItem);
        //}

        return $template;
    };
	
	var name = null;
	
	this.getName = function () {
		return name;
	};
	
	this.setName = function (value) {
		name = value;
	};

    dataBinding.onPropertyValueChanged(function (context, args) {

        var dataItems = dataBinding.getPropertyValue();

        listBox.setItems(dataItems);
    });

    this.setPopUpMenu = function (menu) {
        popupMenu = menu;
    };

    this.onSetSelectedValue = function (handler) {
        onSetSelectedValueHandlers.add(handler);
    };

    this.onDoubleClick = function (handler) {
        onDoubleClickHandlers.add(handler);
    };

    /*
     Удалить элемент данных из списка данных
     */
    var removeDataItem = function (dataItem) {
        items = _.clone(dataBinding.getPropertyValue());
        var index = -1;
        for (var x = 0; x < items.length; x++) {
            if (_.isEqual(items[x], dataItem)) {
                index = x;
                break;
            }
        }

        //удаляем из списка элементов
        items.splice(x, 1);

        dataBinding.setPropertyValue(items.slice());

    };

    /*
     Удалить элемент ListBox
     */
    var onRemoveListBoxItem = function (listBoxItem) {

        _.find(listBoxItems, function (item) {
            if (item.listBoxItem === listBoxItem) {
                listBox.removeItem(item.dataItem);
                removeDataItem(item.dataItem);
                //listBox.setItems(dataBinding.getPropertyValue());
                renderItems();
                return true;
            }
        });

        //listBox.setItems(dataBinding.getPropertyValue());
        //renderItems();

        //_.each(listBoxItems, function (item) {
        //    if (item.listBoxItem === listBoxItem) {
        //        listBox.removeItem(item.dataItem);
        //        removeDataItem(item.dataItem);
        //    }
        //});
    };

    if (editItemAction) {
        editItemAction.onValueChanged(function () {
            addItemAction.setItems(dataBinding.getPropertyValue());
            renderItems();
        });
    }

    //при изменении элементов списка addAction перезагружаем список элементов ListBox
    //TODO: В дальнейшем необходимо отслеживать только события onItemsAdded, onItemsDeleted
    //TODO: и рендерить только добавленные элементы
    if (addItemAction) {
        addItemAction.onValueChanged(function () {
            if(editItemAction) {
                editItemAction.setItems(dataBinding.getPropertyValue());
            }
            renderItems();
        });
    }

    var renderItems = function () {
        var dataItems = dataBinding.getPropertyValue();

        listBox.setItems(dataItems);
    };

    /*
     Обработчик добавления элементов коллекции в диалоге
     (если указан addItemAction)

     */
    var onDialogAdd = function () {

        addItemAction.execute();
    };

    /*
     Обработчик редактирования элементов коллекции в модальном окне
     (если указан editItemAction)

     */
    var onDialogEdit = function (listBoxItem) {

        for (var i = 0; i < listBoxItems.length; i++) {
            if (listBoxItems[i].listBoxItem === listBoxItem) {
                editItemAction.setSelectedItem(listBoxItems[i].dataItem);
                editItemAction.execute();
                break;
            }
        }
    };

    var ds = dataBinding.view.getDataSource(dataBinding.getDataSource());

    ds.onSelectedItemChanged(function(context, val){
        val  = val.value;
        listBox.setValue(val);
    });

    listBox.setStyle = function(newStyle){
        $template.addClass(newStyle);
    };

    function isSubObject(subObj, obj){
        if(!subObj || !obj){
            return false;
        }

        for(var k in subObj){
            if(subObj[k] != obj[k]){
                return false;
            }
        }

        return true;
    }

    function indexOfVal(val){
        for(var i = 0, ii=listBoxItems.length; i < ii; i++){
            if(isSubObject(listBoxItems[i].dataItem, val )){
                return i;
            }
        }
        return -1;
    }

    function selectUI_Item(index){

        if(index === undefined){
            index = indexOfVal(listBox.value);
        }

        var $els = $template.children('.listbox-body').children().children('.item-content');
        $els.removeClass('selected');

        if(index >= 0){
            $els.eq(index).addClass('selected');
        }

    }

    this.runAddItemAction = function () {
        addItemAction ? onDialogAdd() : createItem();
    };

    return listBox;
}
function ListBoxBuilder() {

    var getAddAction = function(metadata) {

        for(var i = 0; i < metadata.Items.length; i++){

            var result = InfinniUI.ObjectUtils.getPropertyValue(metadata.Items[i],'ToolBarButton.Action.AddItemAction');
            if(result){
                return result;
            }
        }
        return null;
    };

    var getEditAction = function(metadata) {

        for(var i = 0; i < metadata.Items.length; i++){

            var result = InfinniUI.ObjectUtils.getPropertyValue(metadata.Items[i],'ToolBarButton.Action.EditItemAction');
            if(result){
                return result;
            }
        }
        return null;
    };

    this.build = function (builder, parent, metadata, collectionProperty) {

        if(metadata.ToolBar) {

            var addItemActionMetadata = getAddAction(metadata.ToolBar);

            var editItemActionMetadata = getEditAction(metadata.ToolBar);
        }

        var editItemAction = null;
        if(editItemActionMetadata){
           editItemAction = new EditItemActionBuilder(editItemActionMetadata).build(builder, parent, metadata);
        }

        var addItemAction = null;
        if(addItemActionMetadata) {
           addItemAction = new AddItemActionBuilder(addItemActionMetadata).build(builder, parent, metadata);
        }

        var dataBinding = builder.build(parent, metadata.Items, collectionProperty);

        var listBoxItemConstructor = function(baseIndex) {
            return builder.build(parent, metadata.ItemTemplate, new ListBoxItemCollectionProperty(/*metadata.Items.PropertyBinding.Property*/'', baseIndex, collectionProperty));
        };

        var listBox = new ListBox(addItemAction,editItemAction,dataBinding, listBoxItemConstructor);
		listBox.setName(metadata.Name);
        listBox.setMultiSelect(metadata.MultiSelect);

        listBox.onSetSelectedValue(function(dataItem){
            var ds = metadata.Items.PropertyBinding || {};

            // if MultiSelect
            if(_.isArray(dataItem) === false){
                parent.getExchange().send(messageTypes.onSetSelectedItem,{
                    value : dataItem,
                    dataSource: ds.DataSource,
                    property: ds.Property
                });
            }


            if(metadata.OnValueChanged){
                new ScriptExecutor(parent).executeScript(metadata.OnValueChanged.Name, dataItem);
            }
        });

        listBox.setStyle(metadata.Style);

		parent.registerElement(listBox);

        /** @TODO Дублирование @see {@link DataGridBuilder.build} **/
        //if (addItemAction) {
            var popupMenu = new DataGridPopupMenuView();
            var items = ["Добавить"];
            var handlers = [listBox.runAddItemAction];

            popupMenu.setItems(items);

            popupMenu.on('clickItem', function (data) {
                var index = data.index;

                if (typeof index === 'undefined' || index === null) {
                    return;
                }

                var handler = handlers[index];
                if (typeof handler !== 'undefined' && handler !== null) {
                    handler();
                }
            });
            listBox.setPopUpMenu(popupMenu);
        //}

        this.initScriptsHandlers(metadata, parent, listBox);
        return listBox;
    },

    this.initScriptsHandlers = function(metadata, parent, element){

        if (parent && metadata.OnDoubleClick){
            element.onDoubleClick(function() {
                new ScriptExecutor(parent).executeScript(metadata.OnDoubleClick.Name);
            });
        }
    }
}
function ListBoxItem(innerControl, editItemHandler, removeItemHandler, multiSelect) {

    var template = InfinniUI.Template["element/dataElement/listBox/template/listBoxItem.tpl.html"];

    var $template = $(template({}));
    var $content = $template.find('.item-content');

    var renderedItem = null;

    var instance = null;

    //если inline-редактирование, то удаляем кнопку редактирования
    if (!editItemHandler) {
        $template.find('.btn-edit').remove();
    }


    this.getHeight = function () {
        return 30;
    };

    $template.on('click', '.btn-delete', function () {

        if (removeItemHandler) {
            removeItemHandler(instance);
        }
    });

    $template.on('click', '.btn-edit', function () {
        if (editItemHandler) {
            editItemHandler(instance);
        }
    });


    $template.find('.pl-listbox-item-toolbar').toggleClass('hidden', true/*_.isEmpty(editItemHandler) && _.isEmpty(removeItemHandler)*/);

    this.render = function () {

        if (renderedItem) {
            renderedItem.remove();
        }

        renderedItem = innerControl.render();

        var onClickRowHandler = function (event) {
            $content.click();
        };

        (function f($el) {;
            _.each($el, function (el) {;
                var $el = $(el);
                $el.on('click', onClickRowHandler);
                var handlers = $._data(el, 'events').click;
                if (handlers !== null && typeof handlers !== 'undefined') {
                    var handler = handlers.pop();
                    handlers.splice(0,0, handler);
                }
                f($(el).children());
            });
        })(renderedItem);

        if(multiSelect) {
            $content.append('<input class="check-listbox-item" type="checkbox"/>');
            renderedItem.css('margin-left', '20px');
        }

        $content.append(renderedItem);

        return $template;
    };

    this.getControl = function () {
        return $template;
    };

    instance = this;

    this.render();

    return instance;
}

function ListBoxItemCollectionProperty(baseBindingProperty, baseIndex, parentCollectionProperty ) {

    /*возвращает полный путь к свойству элемента в коллекции*/
    this.resolve = function(itemBindingProperty) {

        if (typeof parentCollectionProperty !== 'undefined' && parentCollectionProperty !== null) {
            itemBindingProperty = parentCollectionProperty.resolve(itemBindingProperty);
        }

        if(baseBindingProperty && baseBindingProperty !== '') {
            return baseBindingProperty + '.' + stringUtils.formatBinding(itemBindingProperty,baseIndex);
        }
        else {
            return stringUtils.formatBinding(itemBindingProperty, baseIndex);
        }
    };

    this.getBaseIndex = function () {
        return baseIndex;
    }
}

function NumericBox(parentView) {
    _.superClass(NumericBox, this, parentView);
}

_.inherit(NumericBox, Element);

_.extend(NumericBox.prototype, {

    createControl: function () {
        return new NumericBoxControl();
    },

    setMinValue: function (minValue) {
        if(this.isNumeric(minValue)) {
            return this.control.set('minValue', minValue);
        }
    },

    getMinValue: function () {
        return this.control.get('minValue');
    },

    setMaxValue: function (maxValue) {
        if(this.isNumeric(maxValue)) {
            return this.control.set('maxValue', maxValue);
        }
    },

    getMaxValue: function () {
        return this.control.get('maxValue');
    },

    setIncrement: function (increment) {
        if(this.isNumeric(increment)) {
            return this.control.set('increment', increment);
        }
    },

    getIncrement: function () {
        return this.control.get('increment');
    },

    isNumeric: function( obj ) {
        return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
    }
},
    valuePropertyMixin,
    formatPropertyMixin,
    elementHorizontalTextAlignmentMixin,
    editMaskPropertyMixin,
    baseTextElementMixin,
    elementBackgroundMixin,
    elementForegroundMixin,
    elementTextStyleMixin,
    elementHintTextMixin,
    elementErrorTextMixin,
    elementLabelTextMixin
);

function NumericBoxBuilder() {
}

_.inherit(NumericBoxBuilder, ElementBuilder);

_.extend(NumericBoxBuilder.prototype, {
    applyMetadata: function(params){
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
        this.initFormatProperty(params);
        this.initEditMaskProperty(params);
        this.initValueProperty(params, true);
        this.initForeground(params);
        this.initBackground(params);
        this.initTextStyle(params);
        this.initHintText(params);
        this.initHorizontalTextAlignmentProperty(params);
        this.initErrorText(params);
        this.initLabelText(params);

        var element = params.element,
            metadata = params.metadata;

        element.setMinValue(metadata.MinValue);
        element.setMaxValue(metadata.MaxValue);
        element.setIncrement(metadata.Increment);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }

        this.initBaseTextElementEvents(params);
    },

    createElement: function(params){
        return new NumericBox(params.parent);
    }

},
    builderValuePropertyMixin,
    builderFormatPropertyMixin,
    builderHorizontalTextAlignmentPropertyMixin,
    builderEditMaskPropertyMixin,
    builderBaseTextElementMixin,
    builderBackgroundMixin,
    builderForegroundMixin,
    builderTextStyleMixin,
    builderErrorTextMixin,
    builderHintTextMixin,
    builderLabelTextMixin
);
function RadioGroup(parentView) {
    _.superClass(RadioGroup, this, parentView);
}

_.inherit(RadioGroup, Element);

_.extend(RadioGroup.prototype, {

        createControl: function () {
            return new RadioGroupControl();
        },

        getReadOnly: function () {
            return this.control.get('readOnly');
        },

        setReadOnly: function (readOnly) {
            if (readOnly === true || readOnly === false ) {
                this.control.set('readOnly', readOnly);
            }
        },

        getValueProperty: function () {
            return this.control.get('valueProperty');
        },

        setValueProperty: function (valueProperty) {
            this.control.set('valueProperty', valueProperty);
        },

        getDisplayProperty: function () {
            return this.control.get('displayProperty');
        },

        setDisplayProperty: function (displayProperty) {
            this.control.set('displayProperty', displayProperty)
        },

        getItemFormat: function () {
            return this.control.get('itemFormat');
        },

        setItemFormat: function (itemFormat) {
            this.control.set('itemFormat', itemFormat);
        },

        getItemTemplate: function () {
            return this.control.get('itemTemplate');
        },

        /**
         *
         * @param {function} itemTemplate
         */
        setItemTemplate: function (itemTemplate) {
            this.control.set('itemTemplate', itemTemplate);
        },

        addItem: function (item) {
            /** @TODO Реализовать **/
        },

        removeItem: function (item) {
            /** @TODO Реализовать **/
        },

        getItems: function () {
            return this.control.get('items');
        },

        setItems: function (items) {
            this.control.set('items', items);
        },

        getDataNavigation: function () {
            return this.control.get('dataNavigation');
        },

        setDataNavigation: function (dataNavigation) {
            this.control.set('dataNavigation', dataNavigation);
        },

        getItem: function () {
            return this.control.get('item');
        },

        getFocusedItems: function () {
            //@TODO Реализовать
        },

        setFocusedItem: function () {
            //@TODO Реализовать
        },

        setOrientation: function (orientation) {
            this.control.set('orientation', orientation);
        },

        getOrientation: function () {
            return this.control.get('orientation');
        }
    },
    valuePropertyMixin
);
function RadioGroupBuilder() {
}

_.inherit(RadioGroupBuilder, ElementBuilder);

_.extend(RadioGroupBuilder.prototype, {

        applyMetadata: function (params) {
            /** @type {RadioGroup} */
            var element = params.element;
            var metadata = params.metadata;

            ElementBuilder.prototype.applyMetadata.call(this, params);

            element.setReadOnly(metadata.ReadOnly);
            element.setValueProperty(metadata.ValueProperty);
            element.setDisplayProperty(metadata.DisplayProperty);
            element.setOrientation(metadata.Orientation);

            if (_.isEmpty(metadata.ItemFormat) === false) {
                var format = params.builder.build(params.parent, metadata.ItemFormat);
                element.setItemFormat(format);
            }


            this.initItemTemplate(params);
            this.initScriptsHandlers(params);
            this.initValueProperty(params, true);
            this.initItems(params);
        },

        initItemTemplate: function (params) {
            var metadata = params.metadata;

            if (_.isEmpty(metadata.ItemTemplate)) {
                return;
            }

            var itemTemplate = function (baseIndex) {
                var collectionProperty = new ListBoxItemCollectionProperty('', baseIndex, params.collectionProperty);
                return params.builder.build(params.parent, metadata.ItemTemplate, collectionProperty);
            };

            params.element.setItemTemplate(itemTemplate);
        },

        initItems: function (params) {
            var metadata = params.metadata;
            if (_.isEmpty(metadata.Items)) {
                return;
            }

            var binding = params.builder.build(params.parent, metadata.Items, params.collectionProperty);

            var setItems = function (value) {
                params.element.setItems(value);
            };

            binding.onPropertyValueChanged(function (dataSourceName, value) {
                setItems(value.value)
            });

            setItems(binding.getPropertyValue());
        },

        initScriptsHandlers: function(params){
            var metadata = params.metadata;

            //Скриптовые обработчики на события
            if (params.parent && metadata.OnLoaded){
                params.element.onLoaded(function() {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
                });
            }

            if (params.parent && metadata.OnValueChanged){
                params.element.onValueChanged(function() {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
                });
            }
        },

        createElement: function (params) {
            return new RadioGroup(params.parent);
        }

    },
    builderValuePropertyMixin
);
function SearchPanel(parentView) {
    _.superClass(SearchPanel, this, parentView);
}

_.inherit(SearchPanel, Element);

_.extend(SearchPanel.prototype, {

    createControl: function () {
        return new SearchPanelControl();
    },

    setDataSource: function (dataSource) {
        return this.control.set('dataSource', dataSource);
    },

    getDataSource: function () {
        return this.control.get('dataSource');
    },

    setView: function (view) {
        return this.control.set('view', view);
    },

    getView: function () {
        return this.control.get('view');
    },

    getHeight: function () {
        return 44;
    }

}, valuePropertyMixin);
function SearchPanelBuilder() {
}

_.inherit(SearchPanelBuilder, ElementBuilder);

_.extend(SearchPanelBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
        this.initValueProperty(params);
        this.initDataSource(params);

        params.element.setDataSource(params.metadata.DataSource);
        params.element.setView(params.parent);
    },

    createElement: function (params) {
        return new SearchPanel(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    initDataSource: function (params) {
        var self = params;

        params.element.onValueChanged(function (value) {
            var args = {
                source: self.element,
                dataSource: self.metadata.DataSource,
                value: value
            };
            var view = self.element.getView();
            var exchange = view.getExchange();
            exchange.send(messageTypes.onSetTextFilter, args);
        });
    }

}, builderValuePropertyMixin);

function TextBox(parentView) {
    _.superClass(TextBox, this, parentView);
}

_.inherit(TextBox, Element);

_.extend(TextBox.prototype, {

    createControl: function(){
        return new TextBoxControl();
    },

    setMultiline:function(multiline){
        this.control.set('multiline', multiline);
    },

    setLineCount: function(lineCount){
        this.control.set('lineCount', lineCount);
    },

    setInputType: function(inputType){
        this.control.set('inputType', inputType);
    }


},
    valuePropertyMixin,
    formatPropertyMixin,
    editMaskPropertyMixin,
    baseTextElementMixin,
    elementBackgroundMixin,
    elementForegroundMixin,
    elementTextStyleMixin,
    elementErrorTextMixin,
    elementHintTextMixin,
    elementLabelTextMixin,
    elementHorizontalTextAlignmentMixin,
    {
        setValue: function(value){
            if((typeof value != 'object' && value) || typeof value == 'string' || value === null)
                return this.control.set('value', value);

        }
    }
);
function TextBoxBuilder() {
}

_.inherit(TextBoxBuilder, ElementBuilder);

_.extend(TextBoxBuilder.prototype, {

    applyMetadata: function(params){
        var metadata = params.metadata,
            element = params.element;

        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
        this.initFormatProperty(params);
        this.initValueProperty(params, true);

        element.setMultiline(metadata.Multiline);
        element.setLineCount(metadata.LineCount);
        if(!metadata.InputType){
            metadata.InputType = 'text';
        }
        element.setInputType(metadata.InputType);

        this.initHorizontalTextAlignmentProperty(params);
        this.initForeground(params);
        this.initBackground(params);
        this.initTextStyle(params);
        this.initErrorText(params);
        this.initHintText(params);
        this.initLabelText(params);

        this.initEditMaskProperty(params);
        this.initBaseTextElementEvents(params);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    createElement: function(params){
        var textBox = new TextBox(params.parent);
        textBox.getHeight = function() {
            return 34;
        };
        return textBox;
    }

},
    builderHorizontalTextAlignmentPropertyMixin,
    builderValuePropertyMixin,
    builderFormatPropertyMixin,
    builderEditMaskPropertyMixin,
    builderBaseTextElementMixin,
    builderBackgroundMixin,
    builderForegroundMixin,
    builderTextStyleMixin,
    builderErrorTextMixin,
    builderHintTextMixin,
    builderLabelTextMixin
);

function ToggleButton(parentView) {
    _.superClass(ToggleButton, this, parentView);
}

_.inherit(ToggleButton, Element);

_.extend(ToggleButton.prototype, {

    createControl: function () {
        return new ToggleButtonControl();
    },

    setTextOn: function (textOn) {
        return this.control.set('textOn', textOn);
    },

    setTextOff: function (textOff) {
        return this.control.set('textOff', textOff);
    }
},
    valuePropertyMixin
);

function ToggleButtonBuilder() {
}

_.inherit(ToggleButtonBuilder, ElementBuilder);

_.extend(ToggleButtonBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);
        this.initValueProperty(params, true);

        var element = params.element,
            metadata = params.metadata;

        element.setTextOn(metadata.TextOn);
        element.setTextOff(metadata.TextOff);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    createElement: function(params){
        return new ToggleButton(params.parent);
    }
},
    builderValuePropertyMixin
);

function TreeView() {
    _.superClass(TreeView, this);
}

_.inherit(TreeView, Element);

_.extend(TreeView.prototype, {

        createControl: function () {
            return new TreeViewControl();
        },

        /**
         * Возвращает значение, определяющее, разрешен ли выбор нескольких элементов.
         * @returns {Boolean}
         */
        getMultiSelect: function () {
            return this.control.get('multiSelect');
        },

        /**
         * Устанавливает значение, определяющее, разрешен ли выбор нескольких элементов.
         * @param {Boolean} value
         */
        setMultiSelect: function (value) {
            this.control.set('multiSelect', value);
        },

        /**
         * Возвращает значение, определяющее, запрещено ли редактирование значения.
         * @return {Boolean}
         */
        getReadOnly: function () {
            return this.control.get('readOnly');
        },

        /**
         * Устанавливает значение, определяющее, запрещено ли редактирование значения.
         * @param {Boolean} value
         */
        setReadOnly: function (value) {
            this.control.set('readOnly', value);
        },

        getValueProperty: function () {
            return this.control.get('valueProperty');
        },

        setValueProperty: function (value) {
            this.control.set('valueProperty', value);
        },

        getKeyProperty: function () {
            return this.control.get('keyProperty');
        },

        setKeyProperty: function (value) {
            this.control.set('keyProperty', value);
        },

        getParentProperty: function () {
            return this.control.get('parentProperty');
        },

        setParentProperty: function (value) {
            this.control.set('parentProperty', value);
        },

        getDisplayProperty: function () {
            return this.control.get('displayProperty');
        },

        setDisplayProperty: function (value) {
            this.control.set('displayProperty', value);
        },

        getFormat: function () {
            return this.control.get('itemFormat');
        },

        setFormat: function (itemFormat) {
            this.control.set('itemFormat', itemFormat);
        },

        getItemTemplate: function () {

        },

        setItemTemplate: function () {

        },

        addItem: function () {

        },

        removeItem: function () {

        },

        /**
         * Возвращает список элементов.
         * @returns {Object[]}
         */
        getItems: function () {
            return this.control.get('items');
        },

        /**
         * Устанавливает список элементов.
         * @param {Object[]}items
         */
        setItems: function (items) {
            this.control.set('items', items);
            this.control.controlView.trigger('afterchange:items');
        },

        getDataNavigation: function () {

        },

        setDataNavigation: function () {

        },

        getSelectedItem: function () {
            return this.control.controlView.getSelectedItem();
        }

    },
    valuePropertyMixin
);

function TreeViewBuilder () {

}

_.inherit(TreeViewBuilder, ElementBuilder);

_.extend(TreeViewBuilder.prototype, {

    applyMetadata: function (params) {

        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initFormatProperty(params);
        this.initValueProperty(params);
        this.initScriptsHandlers(params);

        var element = params.element,
            builder = params.builder,
            metadata = params.metadata,
            parent = params.parent,
            that = this;

        element.setMultiSelect(metadata.MultiSelect);
        element.setReadOnly(metadata.ReadOnly);
        element.setDisplayProperty(metadata.DisplayProperty);
        element.setValueProperty(metadata.ValueProperty);
        element.setKeyProperty(metadata.KeyProperty);
        element.setParentProperty(metadata.ParentProperty);
        this.initFormatProperty(params);

        if (metadata.Items) {
            // Привязка списка значений элемента к источнику данных
            var binding = builder.build(parent, metadata.Items);

            binding.onPropertyValueChanged(function (dataSourceName, value) {
                element.setItems(value.value);
            });

            element.onValueChanged(function (context, args) {
                parent.getExchange().send(messageTypes.onSetSelectedItem, {
                    dataSource: binding.getDataSource(),
                    property: '',
                    value: element.getSelectedItem()
                });
            });

            var items = binding.getPropertyValue();
            if (items) {
                element.setItems(items);
            }
        }
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (params.parent && metadata.OnValueChanged){
            params.element.onValueChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
            });
        }
    },

    createElement: function (params) {
        return new TreeView(params.parent);
    }

}, builderValuePropertyMixin, builderFormatPropertyMixin, builderFormatPropertyMixin);

function UploadFileBox(parentView) {
    _.superClass(UploadFileBox, this, parentView);
}

_.inherit(UploadFileBox, Element);

_.extend(UploadFileBox.prototype, {

        createControl: function(){
            return new UploadFileBoxControl();
        },

        setReadOnly: function(readOnly){
            this.control.set('readOnly', readOnly);
        },

        getReadOnly: function(){
            return this.control.get('readOnly');
        },

        setAcceptTypes: function(acceptTypes){
            this.control.set('acceptTypes', acceptTypes);
        },

        getAcceptTypes: function(){
            return this.control.get('acceptTypes');
        },

        setMaxSize: function(maxSize){
            this.control.set('maxSize', maxSize);
        },

        getMaxSize: function(){
            return this.control.get('maxSize');
        },

        getFile: function () {
            return this.control.get('file');
        },

        setUrl: function (value) {
            this.control.set('url', value);
        }

    },
    valuePropertyMixin
);
function UploadFileBoxBuilder() {
}

_.inherit(UploadFileBoxBuilder, ElementBuilder);

_.extend(UploadFileBoxBuilder.prototype, {

        applyMetadata: function(params){
            ElementBuilder.prototype.applyMetadata.call(this, params);

            var element = params.element;
            this.initScriptsHandlers(params);
            var binding  = this.initValueProperty(params);
            var getUrl = binding.getFileUrl || binding.getPropertyValue;

            element.onValueChanged(function (dataSourceName, value) {
                var file = element.getFile();
                if (typeof binding.setFile === 'function') {
                    binding.setFile(file);
                }
            });

            binding.onPropertyValueChanged(function (dataSourceName, value) {
                element.setUrl(getUrl.call(binding));
            });

            element.setUrl(getUrl.call(binding));
        },

        createElement: function(params){
            var element = new UploadFileBox(params.parent);
            var metadata = params.metadata;

            if(_.isBoolean(metadata.ReadOnly)){
                element.setReadOnly(metadata.ReadOnly);
            }
            if(_.isNumber(metadata.MaxSize) && !isNaN(metadata.MaxSize)) {
                element.setMaxSize(metadata.MaxSize);
            }
            if (_.isArray(metadata.AcceptTypes)) {
                element.setAcceptTypes(metadata.AcceptTypes);
            }

            return element;
        },

        initScriptsHandlers: function(params){
            var metadata = params.metadata;

            //Скриптовые обработчики на события
            if (params.parent && metadata.OnLoaded){
                params.element.onLoaded(function() {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
                });
            }

            if (params.parent && metadata.OnValueChanged){
                params.element.onValueChanged(function() {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
                });
            }
        }

    },
    builderValuePropertyMixin
);
function ImageBox(parentView) {
    _.superClass(ImageBox, this, parentView);
}

_.inherit(ImageBox, Element);

_.extend(ImageBox.prototype, {

        createControl: function () {
            return new ImageBoxControl();
        },

        setReadOnly: function(readOnly){
            this.control.set('readOnly', readOnly);
        },

        getReadOnly: function(){
            return this.control.get('readOnly');
        },

        setAcceptTypes: function(acceptTypes){
            this.control.set('acceptTypes', acceptTypes);
        },

        getAcceptTypes: function(){
            return this.control.get('acceptTypes');
        },

        setMaxSize: function(maxSize){
            this.control.set('maxSize', maxSize);
        },

        getMaxSize: function(){
            return this.control.get('maxSize');
        },

        getFile: function () {
            return this.control.get('file');
        },

        setUrl: function (value) {
            this.control.set('url', value);
        },

        getUrl: function () {
            return this.control.get('url');
        },

        onUrlChanged: function (handler) {
            this.control.onUrlChanged(handler);
        }

        //TODO: добавить API элемента
    },
    valuePropertyMixin
);
function ImageBoxBuilder() {
}

_.inherit(ImageBoxBuilder, ElementBuilder);

_.extend(ImageBoxBuilder.prototype, {

        applyMetadata: function(params){
            ElementBuilder.prototype.applyMetadata.call(this, params);

            var element = params.element;
            params.element.setReadOnly(params.metadata.ReadOnly);
            this.initScriptsHandlers(params);
            var binding  = this.initValueProperty(params);

            var getUrl = binding.getFileUrl || binding.getPropertyValue;

            element.onValueChanged(function (dataSourceName, value) {
                var file = element.getFile();
                if (typeof binding.setFile === 'function') {
                    binding.setFile(file);
                }
            });

            element.onUrlChanged(function () {
                var url = element.getUrl();
                if (typeof binding.setFileUrl === 'function') {
                    binding.setFileUrl(url);
                }
            });

            binding.onPropertyValueChanged(function (dataSourceName, value) {
                element.setUrl(getUrl.call(binding));
            });

            element.setUrl(getUrl.call(binding));

        },

        createElement: function(params){
            var imageBox = new ImageBox(params.parent);
            if(params.metadata.ReadOnly !== undefined) imageBox.setReadOnly(params.metadata.ReadOnly);
            if(params.metadata.MaxSize !== undefined) imageBox.setMaxSize(params.metadata.MaxSize);

            return imageBox;
        },

        initScriptsHandlers: function(params){
            var metadata = params.metadata;

            //Скриптовые обработчики на события
            if (params.parent && metadata.OnLoaded){
                params.element.onLoaded(function() {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
                });
            }

            if (params.parent && metadata.OnValueChanged){
                params.element.onValueChanged(function() {
                    new ScriptExecutor(params.parent).executeScript(metadata.OnValueChanged.Name);
                });
            }
        }

    },
    builderValuePropertyMixin
);
function AbstractGridPanel(parentView) {
    _.superClass(AbstractGridPanel, this, parentView);
}

_.inherit(AbstractGridPanel, Element);

_.extend(AbstractGridPanel.prototype, {

    addRow: function(){
        var row = new GridRow();
        this.control.addRow(row);
        return row;
    },

    getRows: function(){
        return this.control.getRows();
    }

});

function AbstractGridPanelBuilder() {
}

_.inherit(AbstractGridPanelBuilder, ElementBuilder);

_.extend(AbstractGridPanelBuilder.prototype, {

    applyMetadata: function(params){
        ElementBuilder.prototype.applyMetadata.call(this, params);

        var metadata = params.metadata,
            gridPanel = params.element,
            row, cell, item;

        _.each(metadata.Rows, function (metadataItem, rowIndex) {
            row = gridPanel.addRow();

            if (metadataItem.Cells) {
                _.each(metadataItem.Cells, function (cellMetadata, cellIndex) {
                    cell = row.addCell(cellMetadata.ColumnSpan);

                    if (cellMetadata.Items) {
                        _.each(cellMetadata.Items, function (itemMetadata) {
                            item = params.builder.build(params.parent, itemMetadata, params.collectionProperty);
                            cell.addItem(item);
                        }, this);
                    }
                }, this);
            }
        }, this);
    }

});
var GridCell = function(colSpan){
    this.items = [];
    this.colSpan = colSpan || 1;
    this.handlers = {
        onItemsChange: $.Callbacks()
    };
};

_.extend(GridCell.prototype, {

    addItem: function(item){
        this.items.push(item);
        this.handlers.onItemsChange.fire();
    },

    getItems: function(){
        return this.items;
    },

    onItemsChange: function(handler){
        this.handlers.onItemsChange.add(handler);
    }

});
var GridRow = function(){
    this.cells = [];
    this.handlers = {
        onCellsChange: $.Callbacks(),
        onItemsChange: $.Callbacks()
    };
};

_.extend(GridRow.prototype, {

    addCell: function(colSpan){
        var cell = new GridCell(colSpan);
        this.cells.push(cell);
        this.handlers.onCellsChange.fire();
        this.initCellHandlers(cell);
        return cell;
    },

    getCells: function(){
        return this.cells;
    },

    onCellsChange: function(handler){
        this.handlers.onCellsChange.add(handler);
    },

    onItemsChange: function(handler){
        this.handlers.onItemsChange.add(handler);
    },

    initCellHandlers: function(cell){
        var self = this;
        cell.onItemsChange(function(){
            self.handlers.onItemsChange.fire();
        });
    }

});
function ExtensionPanel(parentView) {
    _.superClass(ExtensionPanel, this, parentView);
}

_.inherit(ExtensionPanel, Element);

_.extend(ExtensionPanel.prototype, {
    createControl: function () {
        var control = new ExtensionPanelControl();

        control.controlModel.getContext = function () {
            return this.getContext();
        }.bind(this);

        return control;
    },

    setExtensionName: function (extensionName) {
        return this.control.set('extensionName', extensionName);
    },

    setParameters: function (value) {
        return this.control.set('parameters', value);
    }//,

    //setContext: function (value) {
    //    return this.control.set('context', value);
    //}
});
function ExtensionPanelBuilder() {
}

_.inherit(ExtensionPanelBuilder, ElementBuilder);

_.extend(ExtensionPanelBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);

        var metadata = params.metadata;
        params.element.setExtensionName(metadata.ExtensionName);

        var parameters = [];
        _.each(metadata.Parameters, function (item) {

            var itemToBuild = {
                "Parameter": item
            };

            var param = params.builder.build(params.parent, itemToBuild);
            parameters[param.getName()] = param;
        });

        params.element.setParameters(parameters);
        //params.element.setContext(params.parent.getContext());
        params.element.getContext = function () {
            return params.parent.getContext();
        }
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }
    },

    createElement: function (params) {
        var element = new ExtensionPanel(this.parent);

        element.getContext = function () {
            return params.parent.getContext();
        };

        return element;
    }

});

function GridPanel(parentView) {
    _.superClass(GridPanel, this, parentView);
}

_.inherit(GridPanel, AbstractGridPanel);

GridPanel.prototype.createControl = function () {
    return new GridPanelControl();
};

function GridPanelBuilder() {
}

_.inherit(GridPanelBuilder, AbstractGridPanelBuilder);

_.extend(GridPanelBuilder.prototype, {

    createElement: function(params){
        return new GridPanel(params.parent);
    }

});
var LayoutPanelRegistry = function () {

    var items = [];

    var exchange = messageBus.getExchange('global');

    /**
     *
     * @param message.source {View}
     * @param message.value {LayoutPanel}
     */
    var addLayoutPanel = function (message) {
        console.log('addLayoutPanel', message);
        var matched = false;
        for (var i = 0, ln = items.length; i < ln; i = i + 1) {
            if (items[i].layoutPanel === message.value) {
                matched = true;
                break;
            }
        }
        if (!matched) {
            items.push({view: message.source, layoutPanel: message.value});
        }

    };

    /**
     *
     * @param message.source {View}
     * @param message.value {LayoutPanel}
     */
    var removeLayoutPanel = function (message) {
        console.log('removeLayoutPanel', message);
        var view = message.source;
        var layoutPanel = message.value;

        var filterByLayoutPanel = function (item) {
            return item.layoutPanel !== layoutPanel;
        };

        var filterByView = function (item) {
            return item.view !== view;
        };

        var _items = items.filter(_.isEmpty(layoutPanel) ? filterByView : filterByLayoutPanel);

        items = _items;
    };

    var removeView = function (message) {
        removeLayoutPanel({source: message.view});
    };

    exchange.subscribe(messageTypes.onCreateLayoutPanel, addLayoutPanel);

    exchange.subscribe(messageTypes.onRemoveLayoutPanel, removeLayoutPanel);

    exchange.subscribe(messageTypes.onViewClosed, removeView);

    this.debug = function () {
        console.table(items);
    };

    this.getLayoutPanel = function (name) {
        var item = _.find(items, function (item) {
            var layoutPanel = item.layoutPanel;
            if (layoutPanel.getName() === name) {
                return true;
            }
        });

        return typeof item === 'undefined' ? item : item.layoutPanel;
    }

};


window.layoutPanelRegistry = new LayoutPanelRegistry();
function Panel(parentView) {
    _.superClass(Panel, this, parentView);
}

_.inherit(Panel, Element);

_.extend(Panel.prototype, {
    createControl: function () {
        return new PanelControl();
    },

    setCollapsible: function (collapsible) {
        if(collapsible !== undefined) {
            return this.control.set('collapsible', collapsible);
        }
    },

    getCollapsible: function () {
        return this.control.get('collapsible');
    },

    setCollapsed: function (collapsed) {
        if(collapsed !== undefined) {
            return this.control.set('collapsed', collapsed);
        }
    },

    getCollapsed: function () {
        return this.control.get('collapsed');
    },

    addItem: function (item) {
        return this.control.addItem(item);
    },

    onExpanded: function (handler) {
        return this.control.onExpanded(handler);
    },

    onCollapsed: function (handler) {
        return this.control.onCollapsed(handler);
    }
});
function PanelBuilder() {
}

_.inherit(PanelBuilder, ElementBuilder);

_.extend(PanelBuilder.prototype, {
    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);

        var items = params.builder.buildMany(params.parent, params.metadata.Items);
        if (items) {
            _.each(items, function (item) {
                params.element.addItem(item);
            });
        }

        params.element.setText(params.metadata.Text);
        params.element.setCollapsible(params.metadata.Collapsible);
        params.element.setCollapsed(params.metadata.Collapsed);
    },

    initScriptsHandlers: function (params) {
        var parent = params.parent;
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (parent && metadata.OnLoaded) {
            params.element.onLoaded(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnLoaded.Name);
            });
        }

        if (parent && metadata.OnExpanded) {
            params.element.onExpanded(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnExpanded.Name);
            });
        }

        if (parent && metadata.OnCollapsed) {
            params.element.onCollapsed(function () {
                new ScriptExecutor(parent).executeScript(metadata.OnCollapsed.Name);
            });
        }
    },

    createElement: function (params) {
        return new Panel(params.parent);
    }

});
function ScrollPanel(parentView) {
    _.superClass(ScrollPanel, this, parentView);
}

_.inherit(ScrollPanel, Element);

_.extend(ScrollPanel.prototype, {
    createControl: function () {
        return new ScrollPanelControl();
    },
    
    getVerticalScroll: function () {
        return this.control.get('verticalScroll');
    },

    setVerticalScroll: function (value) {
        if (typeof value == 'string') {
            this.control.set('verticalScroll', value);
        }
    },

    getHorizontalScroll: function () {
        return this.control.get('horizontalScroll');
    },

    setHorizontalScroll: function (value) {
        if (typeof value == 'string') {
            this.control.set('horizontalScroll', value);
        }
    },

    getLayoutPanel: function () {
        return this.control.get('layoutPanel');
    },

    setLayoutPanel: function (value) {
        this.control.set('layoutPanel', value);
    }
});
function ScrollPanelBuilder() {
}

_.inherit(ScrollPanelBuilder, ElementBuilder);

_.extend(ScrollPanelBuilder.prototype, {
    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params)
        ;
        var element = params.element,
            metadata = params.metadata;

        element.setVerticalScroll(metadata.VerticalScroll);
        element.setHorizontalScroll(metadata.HorizontalScroll);
        element.setLayoutPanel(params.builder.build(params.parent, metadata.LayoutPanel, params.collectionProperty));
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }
    },

    createElement: function(params){
        return new ScrollPanel(params.parent);
    }
});
function StackPanel(parentView) {
    _.superClass(StackPanel, this, parentView);
}

_.inherit(StackPanel, Element);

_.extend(StackPanel.prototype, {

    createControl: function () {
        return new StackPanelControl();
    },

    addItem: function (item) {
        return this.control.addItem(item);
    },

    getOrientation: function () {
        return this.control.get('orientation');
    },

    setOrientation: function (orientation) {
        if (typeof orientation == 'string') {
            this.control.set('orientation', orientation);
        }
    }

});

function StackPanelBuilder() {
}

_.inherit(StackPanelBuilder, ElementBuilder);

_.extend(StackPanelBuilder.prototype, {
    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        this.initScriptsHandlers(params);

        var element = params.element,
            metadata = params.metadata;

        element.setOrientation(metadata.Orientation);

        _.each(metadata.Items, function (metadataItem) {
            element.addItem(params.builder.build(params.parent, metadataItem, params.collectionProperty));
        });
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события
        if (params.parent && metadata.OnLoaded){
            params.element.onLoaded(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnLoaded.Name);
            });
        }
    },

    createElement: function(params){
        return new StackPanel(params.parent);
    }
});
function TabPage(parentView) {
    _.superClass(TabPage, this, parentView);
}

_.inherit(TabPage, Element);

_.extend(TabPage.prototype, {

    createControl: function(){
        return new TabPageControl();
    },

    getId: function () {
        return this.control.getId();
    },

    //TabPage API:

    /**
     * Возвращает изображение заголовка страницы.
     * @returns {String}
     */
    getImage: function () {

    },

    /**
     * Устанавливает изображение заголовка страницы.
     * @param {String} value
     */
    setImage: function (value) {

    },

    /**
     * Возвращает значение, определяющее, разрешено ли закрытие страницы.
     * @returns {Boolean}
     */
    getCanClose: function () {
        return this.control.get('canClose');
    },

    /**
     * Устанавливает значение, определяющее, разрешено ли закрытие страницы.
     * @param {Boolean} value
     */
    setCanClose: function (value) {
        this.control.set('canClose', value);
    },

    /**
     * Возвращает контейнер элементов страницы.
     * @return {Object}
     */
    getLayoutPanel: function () {
        return this.control.get('layoutPanel');
    },

    /**
     * Устанавливает контейнер элементов страницы.
     * @param {Object} layoutPanel
     */
    setLayoutPanel: function (layoutPanel) {
        this.control.set('layoutPanel', layoutPanel);
    },

    /**
     * Закрывает страницу
     * @return {Boolean}
     */
    close: function () {
        var response = this.eventStore.executeEvent('onClosing');

        var canClose = _.isEmpty(response) || response.indexOf(false) === -1;

        if (canClose) {
            this.control.close();
            this.eventStore.executeEvent('onClosed', this);
        }
    },

    /**
     * @description Обработчик события о том, что страница закрывается
     * @param handler
     */
    onClosing: function (handler) {
        this.eventStore.addEvent('onClosing', handler);
    },

    /**
     * @description Обработчик события о том, что страница закрыта
     * @param handler
     */
    onClosed: function (handler) {
        this.eventStore.addEvent('onClosed', handler);
    },

    getChildElements: function () {
        return [this.control.get('layoutPanel')];
    }

});
function TabPageBuilder() {

    this.build = function (builder, parent, metadata) {
        var tabPage = new TabPage(parent);

        tabPage.setImage(metadata.Image);
        tabPage.setCanClose(metadata.CanClose);

        //Установка унаследованных атрибутов
        var tabName = _.isEmpty(metadata.Name)? guid() : metadata.Name;
        tabPage.setName(tabName);
        tabPage.setText(metadata.Text);
        tabPage.setEnabled(metadata.Enabled);
        tabPage.setVisible(metadata.Visible);
        tabPage.setHorizontalAlignment(metadata.HorizontalAlignment);

        if (typeof metadata.LayoutPanel !== 'undefined') {
            tabPage.setLayoutPanel(builder.build(parent, metadata.LayoutPanel));
        }

        if (parent && metadata.OnClosing){
            tabPage.onClosing(function() {
                new ScriptExecutor(parent).executeScript(metadata.OnClosing.Name);
            });
        }

        if (parent && metadata.OnClosed){
            tabPage.onClosed(function() {
                new ScriptExecutor(parent).executeScript(metadata.OnClosed.Name);
            });
        }

        return tabPage;
    };
}

function TabPanel(parentView) {
    _.superClass(TabPanel, this, parentView);
}

_.inherit(TabPanel, Element);

_.extend(TabPanel.prototype, {

    createControl: function(){
        return new TabPanelControl();
    },

    getHeaderLocation: function () {
        return this.control.get('headerLocation');
    },

    setHeaderLocation: function (value) {
        this.control.set('headerLocation', value);
    },

    getHeaderOrientation: function () {
        return this.control.get('headerOrientation');
    },

    setHeaderOrientation: function (value) {
        this.control.set('headerOrientation', value);
    },

    /**
     * Возвращает выделенную страницу.
     * @returns {TabPage}
     */
    getSelectedPage: function () {
        return this.control.getSelectedPage();
    },

    /**
     * Устанавливает выделенную страницу.
     * @param {TabPage} page
     */
    setSelectedPage: function (page) {
        this.control.setSelectedPage(page);
    },

    /**
     * Добавляет указанную страницу
     * @param {TabPage} page
     */
    addPage: function (page) {
        this.control.addPage(page);
    },

    /**
     * Удаляет указанную страницу
     * @param {TabPage} page
     */
    removePage: function (page) {
        this.control.removePage(page);
    },

    /**
     * Возвращает страницу с указанным именем.
     * @param {String} name
     * @returns {TabPage}
     */
    getPage: function (name) {
        return this.control.getPage(name);
    },

    /**
     * Возвращает список страниц.
     * @return {TabPage[]}
     */
    getPages: function () {
        return this.control.getPages();
    },


    setDefaultPage: function (value) {
        this.control.set('defaultPage', value);
    },

    getDefaultPage: function () {
        return this.control.get('defaultPage');
    },

    onSelectionChanged: function (handler) {
        this.control.onSelectionChanged(handler);
    },

    getChildElements: function () {
        return this.getPages();
    }

});
function TabPanelBuilder() {
}

_.inherit(TabPanelBuilder, ElementBuilder);

_.extend(TabPanelBuilder.prototype, {

    applyMetadata: function(params){
        ElementBuilder.prototype.applyMetadata.call(this, params);

        var metadata = params.metadata;

        this.registerLayoutPanel(params);

        params.element.setHeaderLocation(metadata.HeaderLocation || 'Top');
        params.element.setHeaderOrientation(metadata.HeaderOrientation || 'Horizontal');
        params.element.setDefaultPage(metadata.DefaultPage);

        this.initScriptsHandlers(params);

        _.each(metadata.Pages, function (metadataItem) {
            var tabPage = params.builder.buildType(params.parent, 'TabPage', metadataItem);
            tabPage.onClosed(function (page) {
                params.element.removePage(page);
            });
            params.element.addPage(tabPage);


        });


        params.element.onSelectionChanged(function() {
            var exchange = messageBus.getExchange('global');
            exchange.send('OnChangeLayout', {});//Генерация события для пересчета расположения элементов формы
        });

        messageBus.getExchange('global').subscribe(messageTypes.onViewOpened,
            this.onViewOpened.bind(this, params));

    },

    /**
     * @param params {Object}
     * @param message.view {View}
     * @param message.$view {JQuery}
     * @param message.container {String} Имя контейнера
     * @param message.openMode {String} Режим открытия
     * @param message.applicationView {View}
     */
    onViewOpened: function (params, message) {
        var element = params.element;

        if (message.container !== element.getName()) {
            return;
        }

        if (message.applicationView && params.parent.getApplicationView() !== message.applicationView) {
            return;
        }

        var tabPage = params.builder.buildType(params.parent, 'TabPage', {
            Text: message.view.getText(),
            Enabled: true,
            Visible: true,
            CanClose: true
        });

        tabPage.onClosing(function () {
            //@TODO Добавить проверку на возможность закрытия представления view, открытого в режиме Page
        });

        tabPage.onClosed(function (page) {
            var exchange = messageBus.getExchange('global');
            exchange.send(messageTypes.onViewClosing, {sourсe: this, view: view});
        });

        message.view.onClosed(function () {
            params.element.removePage(tabPage);
        });

        var layout = message.$view;
        var view = message.view;

        tabPage.setLayoutPanel(view.getLayoutPanel());
        params.element.addPage(tabPage);
        params.element.setSelectedPage(tabPage);


            //layout.data('view', view);
        layout.data('openMode', message.openMode);
    },

    createElement: function(params){
        return new TabPanel(params.parent);
    },

    initScriptsHandlers: function(params){
        var metadata = params.metadata;

        //Скриптовые обработчики на события

        if (params.parent && metadata.OnSelectionChanged){
            params.element.onSelectionChanged(function() {
                new ScriptExecutor(params.parent).executeScript(metadata.OnSelectionChanged.Name);
            });
        }
    }

},
    builderLayoutPanelMixin
);

function ViewPanel(parentView) {
    _.superClass(ViewPanel, this, parentView);
}

_.inherit(ViewPanel, Element);

_.extend(ViewPanel.prototype, {

    setLayout: function (layout) {
        this.control.set('layout', layout);
    },

    getLayout: function () {
        return this.control.get('layout');
    },

    createControl: function () {
        return new ViewPanelControl();
    }

});
function ViewPanelBuilder() {
}

_.inherit(ViewPanelBuilder, ElementBuilder);

_.extend(ViewPanelBuilder.prototype, {
    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        var builder = params.builder;
        var panel = params.element;
        var metadata = params.metadata;

        /* Костыль для обработки OpenMode = Inline */
        if (_.isEmpty(metadata.Name)) {
            metadata.Name = guid();
            panel.setName(metadata.Name);
        }

        this.registerLayoutPanel(params);

        if (typeof metadata.View !== 'undefined' && metadata.View !== null) {
            var linkView = builder.build(params.parent, metadata.View);

            var onOpening = function (layout) {
                panel.setLayout(layout);
            };

            if (typeof linkView !== 'undefined' && linkView !== null) {

                /* Костыль для обработки OpenMode = Inline */
                if (linkView.getOpenMode() === 'Inline') {
                    linkView.setOpenMode('Container');
                    linkView.setContainer(metadata.Name);
                }

                linkView.createView(function (view) {
                    var editDataSource = _.find(view.getDataSources(), function (ds) {
                        return isMainDataSource(ds);
                    });
                    //editDataSource.suspendUpdate();
                    //editDataSource.setEditMode();

                    view.onOpening(onOpening);
                    view.open();
                    //Последним обработчиком в очередь добавляется метод, генерирующий событие View.onLoad
                    //view.getExchange().subscribe(messageTypes.onLoaded, view.loaded);
                    //view.getExchange().send(messageTypes.onLoaded, {});
                });
            }
        }

        messageBus.getExchange('global').subscribe(messageTypes.onViewOpened,
            this.onViewOpened.bind(this, params));

    },

    /**
     * @param params {Object}
     * @param message.view {View}
     * @param message.$view {JQuery}
     * @param message.container {String} Имя контейнера
     * @param message.openMode {String} Режим открытия
     */
    onViewOpened: function (params, message) {
        var element = params.element;

        if (message.container !== element.getName()) {
            return;
        }
        var layout = element.getLayout();
        if (layout) {
            var view = layout.data('view');
            var openMode = layout.data('openMode');
            if (view === message.view) {
                return;
            }


            if (openMode === 'Container') {
                //закрываем предыдущее представление
                view.close();
            } else if (typeof view !== 'undefined') {
                //удаляем из DOM
                layout.detach();
            }

        }

        layout = message.$view;
        view = message.view;
        layout.data('view', view);
        layout.data('openMode', message.openMode);
        element.setLayout(layout);
    },

    createElement: function (params) {
        return new ViewPanel(params.parent);
    }
},
    builderLayoutPanelMixin
);

function ActionBar(parent) {
    _.superClass(ActionBar, this, parent);
}

_.inherit(ActionBar, Element);

_.extend(ActionBar.prototype, {

    createControl: function () {
        return new ActionBarControl();
    },

    //setApplicationView: function (applicationView) {
    //    this.control.set('applicationView', applicationView);
    //},
    //
    //getApplicationView: function () {
    //    return this.control.get('applicationView');
    //},

    setPages: function (pages) {
        this.control.set('pages', pages);
    },

    getPages: function () {
        return this.control.get('pages');
    },

    refresh: function (pages) {
        //var view = this.getApplicationView();

        //console.log('ApplicationView', view);

        //var pages = InfinniUI.global.openMode.getPageViews(view);
        for (var i = 0, ln = pages.length; i < ln; i = i + 1) {
            console.log(pages[i]);
        }
    }

});
function ActionBarBuilder() {

}

_.inherit(ActionBarBuilder, ElementBuilder);

_.extend(ActionBarBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);


        //var applicationView = params.parent.getApplicationView();
        //params.element.setApplicationView(applicationView);


        var exchange = messageBus.getExchange('global');

        exchange.subscribe(messageTypes.onViewOpened, this.onViewOpened.bind(this, params));

        exchange.subscribe(messageTypes.onViewClosed, this.onViewClosed.bind(this, params));

    },

    createElement: function (params) {
        return new ActionBar(params.parent);
    },

    onViewOpened: function (params, message) {
        var applicationView = params.parent.getApplicationView();
        if (message.openMode === 'Page' && applicationView === message.view.getApplicationView()) {
            //Открывается страница текущего приложения
            console.log('ActionBar.onViewOpened', message);
            //console.log(InfinniUI.global.openMode.getPageViews(message.view.getApplicationView()));
            this.updatePages(params);
        }
    },

    updatePages: function (params) {
        var applicationView = params.parent.getApplicationView();
        var pageViews = InfinniUI.global.openMode.getPageViews(applicationView);
        params.element.setPages(pageViews.slice());
    },

    onViewClosed: function (params, message) {
        var applicationView = params.parent.getApplicationView();
        if (applicationView === message.view.getApplicationView()) {
            //Закрыта страница текущего приложения
            console.log('ActionBar.onViewClosed', message);
            this.updatePages(params);
        }
    }

});
function GlobalNavigationBar(parent) {
    _.superClass(GlobalNavigationBar, this, parent);
}

_.inherit(GlobalNavigationBar, Element);

_.extend(GlobalNavigationBar.prototype, {

    createControl: function () {
        return new GlobalNavigationBarControl();
    },

    addApplicationView: function (view) {
        this.control.addApplicationView(view);
    },

    removeApplicationView: function (view) {
        this.control.removeApplicationView(view);
    },

    onActivateApplication: function (handler) {
        this.control.onActivateApplication(handler);
    },

    onClosingApplication: function (handler) {
        this.control.onClosingApplication(handler);
    },

    onCloseApplication: function (handler) {
        this.control.onCloseApplication(handler);
    },

    setApplicationText: function (view, text) {
        this.control.setApplicationText(view, text);
    },

    setApplications: function (applications) {
        this.control.setApplications(applications);
    }


});
function GlobalNavigationBarBuilder() {

}

_.inherit(GlobalNavigationBarBuilder, ElementBuilder);

_.extend(GlobalNavigationBarBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        var element = params.element;
        var parent = params.parent;

        element.setApplications(InfinniUI.global.openMode.getApplicationViews());
        var exchange = this.getGlobalMessageBus();
        exchange.subscribe(messageTypes.onViewOpened, this.onViewOpenedHandler.bind(this, params));

        exchange.subscribe(messageTypes.onViewClosed, this.onViewClosedHandler.bind(this, params));
        exchange.subscribe(messageTypes.onViewTextChange, this.onViewTextChangeHandler.bind(this, params));


        element.onActivateApplication(this.onActivateApplicationHandler.bind(this, params));
        element.onClosingApplication(this.onClosingApplicationHandler.bind(this, params));
    },

    getGlobalMessageBus: function () {
        return messageBus.getExchange('global');
    },

    /**
     * @description Обработчик запроса на закрытие представления от панели навигации
     * @param params
     * @param view
     */
    onClosingApplicationHandler: function (params, view) {
        view.close();
    },

    /**
     * @description Обработчик события переключения на другое приложение
     * @param params
     */
    onActivateApplicationHandler: function (params, view) {
        //@TODO Отправить в шину сообщение о необходимости активировать указанное приложение
        var exchange = this.getGlobalMessageBus();
        exchange.send(messageTypes.onShowView, {source: this, view: view});
    },

    /**
     * @description Обработчик события открытия представления
     */
    onViewOpenedHandler: function (params, message) {
        var element = params.element;

        if (message.openMode !== 'Application') {
            return;
        }

        console.log('messageTypes.onViewOpened', arguments);
        element.addApplicationView(message.view)

    },

    /**
     * @description Обработчик события закрытия представления
     */
    onViewClosedHandler: function (params, message) {
        console.log('messageTypes.onViewClosing', message);
        params.element.removeApplicationView(message.view)
    },

    /**
     * @description При изменении заголовка представления, уведомляем об этом компонент навигации
     * @param params
     */
    onViewTextChangeHandler: function (params, message) {
        params.element.setApplicationText(message.source, message.value);
    },

    createElement: function (params) {
        return new GlobalNavigationBar(params.parent);
    }

});
function View() {
    var model = new ViewModel();

    var culture = new Culture(InfinniUI.config.lang);

    this.onLoadedHandlers = $.Deferred();

    this.context = {
        notInitialized: true,
        Controls: {},
        DataSources: {}
    };

    this.onTextChange = function(callback){
        model.on('change:text', callback);
    };

    this.setText = function (value) {
        model.set('text', value);
    };

    this.getText = function () {
        return model.get('text');
    };

    this.setCaption = function (value) {
        model.set('caption', value);
    };

    this.getCaption = function () {
        return model.get('caption');
    };

    this.setVisible = function (value) {

        model.set('visible', value);
    };

    this.getVisible = function () {
        return model.get('visible');
    };

    this.setLayoutPanel = function (value) {
        model.set('layoutPanel', value);

        //window.setTimeout(function () {
            //eventStore.executeEvent('onLoaded');
        //}, 1000);
    };

    this.getLayoutPanel = function (value) {
        return model.get('layoutPanel');
    };

    var dataSources = [];

    this.setDataSources = function (value) {
        dataSources = value;

        this.context.DataSources = {};
        for(var i = 0, ii = dataSources.length; i < ii; i++){
            this.context.DataSources[dataSources[i].getName()] = dataSources[i];
        }


        //После загрузке данных во все источники данных генерируем событие onLoaded
        var loading = _.map(dataSources, function (ds) {return ds.loading});
        var view = this;
        console.log("%s: %d datasource(s) assigned", view.getName(), loading.length);
        $.when.apply($, loading).done(function() {
            console.log("%s: %d datasource(s) loaded", view.getName(), loading.length);
            view.loaded();
        });
    };

    this.getDataSource = function (value) {
        for (var i = 0; i < dataSources.length; i++) {
            if (dataSources[i].getName() === value) {
                return dataSources[i];
            }
        }
        return null;
    };

    this.getDataSources = function () {
        return dataSources;
    };


    var scripts = {};

    this.setScripts = function (value) {

        if (value) {
            var scriptBuilder = new ScriptBuilder();

            for (var i = 0; i < value.length; i++) {
                scripts[value[i].Name] = scriptBuilder.build(value[i]);
            }
        }
    };

    this.getScript = function (name) {
        return scripts[name];
    };

    this.getScripts = function () {
        return scripts;
    };

    var parameters = [];

    this.getParameter = function (name) {

        for (var i = 0; i < parameters.length; i++) {
            if (parameters[i].getName() === name) {
                return parameters[i];
            }
        }
    };

    this.getParameters = function () {
        return parameters;
    };

    this.addParameter = function (parameter) {
        parameters.push(parameter);
    };

    this.getContext = function () {

        if(!this.context.notInitialized){
            return this.context;
        }
        delete this.context.notInitialized;


        this.context.Parameters = {};
        for (var j = 0; j < parameters.length; j++) {
            this.context.Parameters[parameters[j].getName()] = parameters[j];
        }

        this.context.Scripts = {};
        for (var key in scripts) {
            this.context.Scripts[key] = {
                Run: (function(k){
                    return function (context, args) {
                        scripts[k].run(context, args);
                    }
                })(key)
            }
        }

        this.context.ParentView = this;

        var that = this;
        //добавляем операции глобального контекста
        this.context.Global = {

            openView: function (openViewMetadata, resultCallback) {

                var builder = new ApplicationBuilder();

                var viewMetadata = builder.build(that, openViewMetadata);

                viewMetadata.createView(function (view) {
                    view.open();

                    if (resultCallback) {
                        resultCallback(view);
                    }
                });

            },

            executeAction: function (executeActionMetadata, resultCallback) {
                var builder = new ApplicationBuilder();

                var action = builder.build(that, executeActionMetadata);

                action.execute(resultCallback);
            },

            session: new AuthenticationProvider(InfinniUI.config.serverUrl),

            culture: culture
        };

        return this.context;
    };

    this.getScriptsStorage = function () {
        return this;
    };

    var elements = [];

    this.registerElement = function (element) {
        elements.push(element);
        this.context.Controls[element.getName()] = element;
    };

    this.setHorizontalAlignment = function (horizontalAlignment) {
        //not implemented
    };

    this.setVerticalAlignment = function (verticalAlignment) {
        //not implemented
    };

    var name;
    this.setName = function (value) {
        name = value;
    };

    this.getName = function () {
        return name;
    };

    this.setEnabled = function (name) {
        //not implemented
    };

    this.setStyle = function (style) {
        //not implemented
    };

    var eventStore = new EventStore();

    this.onOpening = function (action) {
        eventStore.addEvent('onOpening', action);
    };

    this.onLoaded = function (action) {
        eventStore.addEvent('onLoaded', action);
    };

    this.handleOnLoaded = function (handler) {
        this.onLoadedHandlers.done(handler);
    };

    this.onLoading = function (action) {
        eventStore.addEvent('onLoading', action);
    };

    this.onClosed = function (action) {
        eventStore.addEvent('onClosed', action);
    };

    this.onClosing = function (action) {
        eventStore.addEvent('onClosing', action);
    };

    this.open = function () {
        eventStore.executeEvent('onOpening', model.get('layoutPanel').render());
    };

    this.close = function (acceptResult) {
        var response = eventStore.executeEvent('onClosing');
        var canClose = response.indexOf(false) === -1;
        if (canClose) {
            eventStore.executeEvent('onClosed', acceptResult);
        }

        return canClose;
    };

    this.exchange = null;

    this.getExchange = function () {
        if (this.exchange == null) {
            this.exchange = messageBus.getExchange(this.getGuid()/*guid()*/);
        }

        return this.exchange;
    };

    this.loaded = function () {
        this.onLoadedHandlers.resolve(this);
        setTimeout(function () {
            eventStore.executeEvent('onLoaded');
        }, 0);

    };

    this.loading = function () {
        eventStore.executeEvent('onLoading');
    };

    var childViews = {};

    this.getChildView = function (name) {
        return childViews[name];
    };

    this.addChildView = function (name, value) {
        childViews[name] = value;
    };

    this.getChildViews = function () {
        return childViews;
    };

    this.setParentView = function (view) {
        this.parent = view;
    };

    this.getParentView = function () {
        return this.parent;
    };

    /**
     * @description Возвращает корневое представление, открытое в режиме приложения
     * @returns {*}
     */
    this.getApplicationView = function () {
        var isApplication = model.get('isApplication');
        var parent = this.parent;

        if (isApplication) {
            return this;
        } else {
            return _.isEmpty(parent) ? null : parent.getApplicationView();
        }
    };

    this.setGuid = function (guid) {
        model.set('guid', guid);
    };

    this.getGuid = function () {
        return model.get('guid');
    };


    var _nestedViews = [];

    this.addNestedView = function ( view) {
        _nestedViews.push(view);
    };

    this.removeNestedView = function (view) {
        var i = _nestedViews.indexOf(view);

        if (i === -1) {
            return;
        }
        _nestedViews.splice(i, 1);
    };

    this.getNestedViews = function () {
        return _nestedViews;
    };

    this.isApplication = function (param) {
        var result = model.get('isApplication');

        if (_.isBoolean(param)) {
            model.set('isApplication', param);
        }

        return result;
    }
}

var ViewModel = Backbone.Model.extend({
    defaults: {
        isApplication: false,
        layoutPanel: null
    }
});

function ViewBuilder() {
}

_.inherit(ViewBuilder, ElementBuilder);

_.extend(ViewBuilder.prototype, {

    applyMetadata: function (params) {
        ElementBuilder.prototype.applyMetadata.call(this, params);

        var metadata = params.metadata;
        var view = params.element;
        var parent = params.parent;
        var outerParams = params.params;

        view.setGuid(guid());

        //InfinniUI.views[view.getGuid()] = {
        //    metadata: metadata,
        //    view: view
        //};

        if (parent instanceof View) {
            parent.addNestedView(view);
        }

        view.setParentView(parent);

        if(parent.addChildView){
            parent.addChildView(metadata.Name, view);
        }


        this.handleParameters(view, metadata.RequestParameters, params.builder, outerParams, parent);
        this.handleParameters(view, metadata.Parameters, params.builder, outerParams, parent);

        view.setCaption(metadata.Caption);
        view.setScripts(metadata.Scripts);

        view.onTextChange(this.onChangeTextHandler.bind(this, params));
        
        view.onClosed(function () {
            var removeView = function (view) {
                InfinniUI.views.removeView(view);
            };
            _.each(view.getNestedViews(), removeView);

            if(metadata.OnClosed){
                new ScriptExecutor(view).executeScript(metadata.OnClosed.Name);
            }

            removeView(view);
        });

        if (metadata.OnClosing) {
            view.OnClosing(function () {
                new ScriptExecutor(view.getScriptsStorage()).executeScript(metadata.OnClosing.Name);
            });
        }

        view.setDataSources(params.builder.buildMany(view, metadata.DataSources));
        
        //_.each(metadata.ChildViews, function (childViewMetadata) {
        //    var linkView = params.builder.build(view, childViewMetadata.LinkView);
        //    view.addChildView(childViewMetadata.Name, linkView);
        //});


        view.setLayoutPanel(params.builder.build(view, metadata.LayoutPanel));
    },

    onChangeTextHandler: function (params) {
        var exchange = messageBus.getExchange('global');

        exchange.send(messageTypes.onViewTextChange, {
            source: params.element,
            value: params.element.getText()
        });
    },

    handleParameters: function(view, parameters, builder, outerParams, parent){
        var name;

        if (typeof parameters !== 'undefined' && parameters !== null) {
            for (var i = 0; i < parameters.length; i++) {
                if(parameters[i].Value === undefined){
                    name = parameters[i].Name;

                    if(outerParams[name]){
                        view.addParameter(outerParams[name]);
                    }else{
                        var emptyParameter = builder.buildType(parent, 'Parameter', {Name:name, Value:null})
                    }

                }


                if(parameters[i].OnValueChanged){
                    (function(parameter){
                        //debugger;
                        view.getParameter(parameter.Name).onValueChanged(function(arg1, value){
                            new ScriptExecutor(view).executeScript(parameter.OnValueChanged.Name, value);
                        });
                    })(parameters[i]);

                }

            }
        }
    },

    createElement: function (params) {
        return new View(params.parent);
    }

}, builderValuePropertyMixin, builderFormatPropertyMixin);

function EventStore() {
    var handlers = {};

    this.addEvent = function (name, action) {
        var event = handlers[name];
        if (event === undefined) {
            event = { actions: [] };
            handlers[name] = event;
        }

        event.actions.push(action);
        return {
            unsubscribe: this.removeEvent.bind(this, name, action)
        };
    };

    this.removeEvent = function (name, action) {
        var events = handlers[name];
        if (typeof events === 'undefined') {
            return;
        }
        var actions = events.actions;
        var i;
        while(true) {
            i = actions.indexOf(action);
            if (i === -1) {
                break;
            }
            actions.splice(i, 1);
        }
    };

    this.executeEvent = function (name) {
        var event = handlers[name],
            response = [],
            args = _.toArray(arguments).slice(1);

        if (event !== undefined) {
            response = _.map(event.actions, function (action) {
                return action.apply(null, args);
            });
        }
        return response;
    };

    this.executeEventAsync = function (name) {
        var args = Array.prototype.slice.call(arguments);
        var callback;
        if (typeof args[args.length - 1] === 'function') {
            callback = args.pop();
        }
        var response = this.executeEvent.apply(this, args);
        $.when.apply($, response)
            .done(function() {
                var results = [];
                if (typeof callback === 'function') {
                    callback(Array.prototype.push.apply(results, arguments));
                }
            });
    };
}
/**
 * @description Методы для форматоирования
 * @mixin
 */
var formatMixin = {
    /**
     * @memberOf formatMixin.prototype
     * @description Разделитель для форматирования коллекций
     */
    separator: ", ",

    /**
     * Форматирование объекта или коллекции объектов.
     * Для форматирования объекта вызывается метод formatValue
     *
     * @param {*} originalValue Форматируемое значение
     * @param {Culture} culture Культура
     * @param {String} format Строка форматирования
     * @returns {String}
     */
    format: function (originalValue, culture, format) {
        var result;

        if (originalValue !== null && typeof originalValue !== 'undefined' && originalValue.constructor === Array) {
            var values = [];
            for (var i = 0, ln = originalValue.length; i < ln; i = i + 1) {
                values.push(this.formatValue(originalValue[i], culture, format));
            }
            result = values.join(this.separator);
        } else {
            result = this.formatValue.apply(this, arguments);
        }

        return result;
    },

    getFormat: function () {
        return this.getPropertyValue('formatRule', this.defaultFormat);
    },

    setFormat: function (value) {
        this.formatRule = value;
    },

    /**
     * Получение значение свойства.
     * Возвращает установленное значение или defaultValue
     * @param name
     * @param defaultValue
     * @returns {*}
     */
    getPropertyValue: function (name, defaultValue) {
        var value = this[name];

        return (typeof value === 'undefined' || value === null) ? defaultValue : value;
    }

};
/**
 * @description Формат отображения логического значения.
 * @class BooleanFormat
 * @mixes formatMixin
 */
var BooleanFormat = function () {
};

_.extend(BooleanFormat.prototype, {

    /**
     * @description Текст для отображения истинного значения
     * @memberOf BooleanFormat.prototype
     */
    defaultTrueText: 'True',

    /**
     * @description Текст для отображения ложного значения
     * @memberOf BooleanFormat.prototype
     */
    defaultFalseText: 'False',

    /**
     * @description Возвращает текст для отображения ложного значения.
     * @memberOf BooleanFormat.prototype
     * @returns {String}
     */
    getFalseText: function () {
        return this.getPropertyValue('falseText', this.defaultFalseText);
    },

    /**
     * @description Устанавливает текст для отображения ложного значения.
     * @memberOf BooleanFormat.prototype
     * @param {String} value
     */
    setFalseText: function (value) {
        this.falseText = value;
    },

    /**
     * @description Возвращает текст для отображения истинного значения.
     * @memberOf BooleanFormat.prototype
     * @returns {String}
     */
    getTrueText: function () {
        return this.getPropertyValue('trueText', this.defaultTrueText);
    },

    /**
     * @description Устанавливает текст для отображения истинного значения
     * @memberOf BooleanFormat.prototype
     * @param {String} value
     */
    setTrueText: function (value) {
        this.trueText = value;
    },

    /**
     * @description Форматирует значение
     * @memberOf BooleanFormat.prototype
     * @param {Boolean} originalValue
     * @returns {String}
     */
    formatValue: function (originalValue) {
        if (originalValue === false || originalValue === null || typeof originalValue === 'undefined') {
            return this.getFalseText();
        } else {
            return this.getTrueText();
        }
    }

}, formatMixin);
/**
 * @description Билдер BooleanFormat
 * @class BooleanFormatBuilder
 */
function BooleanFormatBuilder () {

    /**
     * @description Создает и инициализирует экземпляр {@link BooleanFormat}
     * @memberOf BooleanFormatBuilder
     * @instance
     * @param builder
     * @param parent
     * @param metadata
     * @returns {BooleanFormat}
     */
    this.build = function (builder, parent, metadata) {

        var format = new BooleanFormat();

        format.setFalseText(metadata.FalseText);
        format.setTrueText(metadata.TrueText);

        return format;
    }
}
/**
 * @description Формат отображения даты/времени.
 * @param format
 * @class DateTimeFormat
 * @mixes formatMixin
 */
function DateTimeFormat(format){

    this.setFormat(format);
}

_.extend(DateTimeFormat.prototype, {

    /**
     * @description Строка форматирования даты/времени по умолчанию
     * @memberOf DateTimeFormat.prototype
     */
    defaultFormat: 'G',

    /**
     * @description Форматирует дату
     * @memberOf DateTimeFormat.prototype
     * @param {Date} originalDate
     * @param {Culture} [culture]
     * @param {String} [format]
     * @returns {String}
     */
    formatValue: function(originalDate, culture, format){

        if (typeof originalDate === 'undefined' || originalDate === null) {
            return '';
        }
        var self = this;

        culture = culture || new Culture(InfinniUI.config.lang);

        var date = new Date(originalDate);

        format = format||this.getFormat();

        //if(format.length == 1){
        if(typeof InfinniUI.localizations[culture.name].patternDateFormats[format] !== 'undefined'){
            format = InfinniUI.localizations[culture.name].patternDateFormats[format];
        }

        return format.replace(this.rg, function(s){
            if(s[0] == '"' || s[0] == "'"){
                var len = s.length;
                return s.substring(1, len - 1);
            }else{
                return self.rules[s](date, culture);
            }
        });
    },


    rg: new RegExp(
        '"[\\s\\S]*"|' + "'[\\s\\S]*'"+

        '|yyyy|yy|%y|y' +
        '|MMMM|MMM|MM|%M|M' +
        '|dddd|ddd|dd|%d|d' +
        '|HH|%H|H|hh|%h|h' +
        '|mm|%m|m' +
        '|ss|%s|s' +
        '|tt|%t|t' +
        '|zzz|zz|%z|z' +
        '|:|/',

        'g'),

    rules: {
        'yyyy': function(date){
            return date.getFullYear().toString();
        },
        'yy': function(date){
            var year = date.getFullYear().toString();
            return year.substring(2);
        },
        '%y': function(date){
            var year = date.getFullYear().toString();
            year = year.substring(2);
            year = parseInt(year);
            return year.toString();
        },
        'y': function(date){
            var year = date.getFullYear().toString();
            year = year.substring(2);
            year = parseInt(year);
            return year.toString();
        },

        'MMMM': function(date, culture){
            var monthIndex = date.getMonth(),
                month = culture.dateTimeFormatInfo.monthNames[monthIndex];
            return month;
        },
        'MMM': function(date, culture){
            var monthIndex = date.getMonth(),
                month = culture.dateTimeFormatInfo.abbreviatedMonthNames[monthIndex];
            return month;
        },
        'MM': function(date){
            var monthIndex = date.getMonth() + 1;
            if(monthIndex < 10){
                return '0' + monthIndex.toString();
            }else{
                return monthIndex.toString();
            }
        },
        '%M': function(date){
            var monthIndex = date.getMonth() + 1;
            return monthIndex.toString();
        },
        'M': function(date){
            var monthIndex = date.getMonth() + 1;
            return monthIndex.toString();
        },

        'dddd': function(date, culture){
            var dayIndex = date.getDay(),
                day;

            dayIndex = (dayIndex == 0) ? 6 : dayIndex - 1;
            day = culture.dateTimeFormatInfo.dayNames[dayIndex];
            return day;
        },
        'ddd': function(date, culture){
            var dayIndex = date.getDay(),
                day;

            dayIndex = (dayIndex == 0) ? 6 : dayIndex - 1;
            day = culture.dateTimeFormatInfo.abbreviatedDayNames[dayIndex];
            return day;
        },
        'dd': function(date){
            var dayIndex = date.getDate();

            if(dayIndex < 10){
                return '0' + dayIndex.toString();
            }else{
                return dayIndex.toString();
            }
        },
        '%d': function(date){
            var dayIndex = date.getDate();
            return dayIndex.toString();
        },
        'd': function(date){
            var dayIndex = date.getDate();
            return dayIndex.toString();
        },

        'HH': function(date){
            var hoursIndex = date.getHours();

            if(hoursIndex < 10){
                return '0' + hoursIndex.toString();
            }else{
                return hoursIndex.toString();
            }
        },
        '%H': function(date){
            var hoursIndex = date.getHours();
            return hoursIndex.toString();
        },
        'H': function(date){
            var hoursIndex = date.getHours();
            return hoursIndex.toString();
        },
        'hh': function(date){
            var hoursIndex = date.getHours();

            if(hoursIndex > 12){
                hoursIndex -= 12;
            }

            if(hoursIndex < 10){
                return '0' + hoursIndex.toString();
            }else{
                return hoursIndex.toString();
            }
        },
        '%h': function(date){
            var hoursIndex = date.getHours();
            if(hoursIndex > 12){
                hoursIndex -= 12;
            }
            return hoursIndex.toString();
        },
        'h': function(date){
            var hoursIndex = date.getHours();
            if(hoursIndex > 12){
                hoursIndex -= 12;
            }
            return hoursIndex.toString();
        },

        'mm': function(date){
            var minuteIndex = date.getMinutes();

            if(minuteIndex < 10){
                return '0' + minuteIndex.toString();
            }else{
                return minuteIndex.toString();
            }
        },
        '%m': function(date){
            var minuteIndex = date.getMinutes();
            return minuteIndex.toString();
        },
        'm': function(date){
            var minuteIndex = date.getMinutes();
            return minuteIndex.toString();
        },

        'ss': function(date){
            var secondsIndex = date.getSeconds();

            if(secondsIndex < 10){
                return '0' + secondsIndex.toString();
            }else{
                return secondsIndex.toString();
            }
        },
        '%s': function(date){
            var secondsIndex = date.getSeconds();
            return secondsIndex.toString();
        },
        's': function(date){
            var secondsIndex = date.getSeconds();
            return secondsIndex.toString();
        },

        'tt': function(date, culture){
            var hoursIndex = date.getHours();

            if(hoursIndex < 12){
                return culture.dateTimeFormatInfo.amDesignator;
            }else{
                return culture.dateTimeFormatInfo.pmDesignator;
            }
        },
        '%t': function(date, culture){
            var hoursIndex = date.getHours();

            if(hoursIndex < 12){
                return culture.dateTimeFormatInfo.amDesignator.substr(0, 1);
            }else{
                return culture.dateTimeFormatInfo.pmDesignator.substr(0, 1);
            }
        },
        't': function(date, culture){
            var hoursIndex = date.getHours();

            if(hoursIndex < 12){
                return culture.dateTimeFormatInfo.amDesignator.substr(0, 1);
            }else{
                return culture.dateTimeFormatInfo.pmDesignator.substr(0, 1);
            }
        },

        'zzz': function(date){
            var offset = -date.getTimezoneOffset()/60,
                minutes,
                sign;

            minutes = (offset - Math.floor(offset)) * 100;
            offset = Math.floor(offset);

            if(offset < 0){
                sign = '-';
                offset = -offset;
            }else{
                sign = '+';
            }

            if(minutes < 10){
                minutes = '0' + minutes.toString();
            }else{
                minutes = minutes.toString();
            }

            if(offset < 10){
                return sign + '0' + offset.toString() + ':' + minutes;
            }else{
                return sign + offset.toString() + ':' + minutes;
            }
        },
        'zz': function(date){
            var offset = -date.getTimezoneOffset()/60,
                sign;

            offset = Math.floor(offset);

            if(offset < 0){
                sign = '-';
                offset = -offset;
            }else{
                sign = '+';
            }

            if(offset < 10){
                return sign + '0' + offset.toString();
            }else{
                return sign + offset.toString();
            }
        },
        'z': function(date, culture){
            var offset = -date.getTimezoneOffset()/60,
                sign;

            offset = Math.floor(offset);

            if(offset < 0){
                sign = '-';
                offset = -offset;
            }else{
                sign = '+';
            }

            return sign + offset.toString();
        },
        '%z': function(date, culture){
            var offset = -date.getTimezoneOffset()/60,
                sign;

            offset = Math.floor(offset);

            if(offset < 0){
                sign = '-';
                offset = -offset;
            }else{
                sign = '+';
            }

            return sign + offset.toString();
        },

        ':': function(date, culture){
            return culture.dateTimeFormatInfo.timeSeparator;
        },
        '/': function(date, culture){
            return culture.dateTimeFormatInfo.dateSeparator;
        }
    }
}, formatMixin);
/**
 * @description Билдер DateTimeFormat
 * @class DateTimeFormatBuilder
 */
function DateTimeFormatBuilder () {

    /**
     * @description Создает и инициализирует экземпляр {@link DateTimeFormat}
     * @memberOf DateTimeFormatBuilder
     * @param builder
     * @param parent
     * @param metadata
     * @returns {DateTimeFormat}
     */
    this.build = function (builder, parent, metadata) {
        var format = new DateTimeFormat();

        format.setFormat(metadata.Format);

        return format;
    }

}
/**
 * @description Билдер NumberFormat
 * @class NumberFormatBuilder
 */
function NumberFormatBuilder () {

    /**
     * @description Создает и инициализирует экземпляр {@link NumberFormat}
     * @memberOf NumberFormatBuilder
     * @param builder
     * @param parent
     * @param metadata
     * @returns {NumberFormat}
     */
    this.build = function (builder, parent, metadata) {
        var format = new NumberFormat();

        format.setFormat(metadata.Format);

        return format;
    }
}
/**
 * @description Формат отображения числового значения.
 * @param {String} format Строка форматирования
 * @class NumberFormat
 * @mixes formatMixin
 */
function NumberFormat(format){
    this.setFormat(format);
}

_.extend(NumberFormat.prototype, {

    /**
     * @description Строка форматирования числового значения по умолчанию
     * @memberOf NumberFormat.prototype
     */
    defaultFormat: "n",

    /**
     * @description Форматирует числовое значение
     * @memberOf NumberFormat.prototype
     * @param {Number} originalValue Форматируемое значение
     * @param {Culture} [culture] Культура
     * @param {String} [format] Строка форматирования
     * @returns {String}
     */
    formatValue: function(originalValue, culture, format){
        if (typeof originalValue === 'undefined' || originalValue === null) {
            return '';
        }
        var self = this;

        culture = culture || new Culture(InfinniUI.config.lang);

        format = format||this.getFormat();

        return format.replace(this.rg, function(s, formatName, formatParam){
            if(formatParam !== undefined && formatParam != ''){
                formatParam = parseInt(formatParam);
            }else{
                formatParam = undefined;
            }
            return self.rules[formatName].call(self, originalValue, formatParam, culture);
        });
    },

    rg: /^([pnc])(\d*)$/ig,

    rules: {
        'P': function(val, param, culture){
            param = (param !== undefined) ? param : culture.numberFormatInfo.percentDecimalDigits;
            var isPositive = val >= 0,
                formattedNumber = this.formatNumber(Math.abs(val), param, culture.numberFormatInfo.percentGroupSeparator, culture.numberFormatInfo.percentDecimalSeparator),
                result;

            if(isPositive){
                result = culture.numberFormatInfo.percentPositivePattern.replace('p', formattedNumber);
            }else{
                result = culture.numberFormatInfo.percentNegativePattern.replace('p', formattedNumber);
            }

            result = result.replace('%', culture.numberFormatInfo.percentSymbol);

            return result;
        },
        'p': function(val, param, culture){
            val *= 100;
            return this.rules.P.call(this, val, param, culture);
        },
        'n': function (val, param, culture) {
            param = (param !== undefined) ? param : culture.numberFormatInfo.numberDecimalDigits;
            var isPositive = val >= 0,
                formattedNumber = this.formatNumber(Math.abs(val), param, culture.numberFormatInfo.numberGroupSeparator, culture.numberFormatInfo.numberDecimalSeparator),
                result;

            if(isPositive){
                result = culture.numberFormatInfo.numberPositivePattern.replace('n', formattedNumber);
            }else{
                result = culture.numberFormatInfo.numberNegativePattern.replace('n', formattedNumber);
            }

            return result;
        },
        'N': function () {
            return this.rules.n.apply(this, arguments);
        },
        'c': function (val, param, culture) {
            param = (param !== undefined) ? param : culture.numberFormatInfo.currencyDecimalDigits;
            var isPositive = val >= 0,
                formattedNumber = this.formatNumber(Math.abs(val), param, culture.numberFormatInfo.currencyGroupSeparator, culture.numberFormatInfo.currencyDecimalSeparator),
                result;

            if(isPositive){
                result = culture.numberFormatInfo.currencyPositivePattern.replace('c', formattedNumber);
            }else{
                result = culture.numberFormatInfo.currencyNegativePattern.replace('c', formattedNumber);
            }
            result = result.replace('$', culture.numberFormatInfo.currencySymbol);

            return result;
        },
        'C': function () {
            return this.rules.c.apply(this, arguments);
        }
    },

    /**
     * @protected
     * @description Форматирует числовое значение
     * @memberOf NumberFormat.prototype
     * @param {Number} val Значение
     * @param {Number} capacity Количество знаков в дробной части
     * @param {Number} groupSeparator Разделитель между группами
     * @param {String} decimalSeparator Разделитель между целой и дробной частью
     * @returns {String}
     */
    formatNumber: function(val, capacity, groupSeparator, decimalSeparator){
        val = val.toFixed(capacity);

        var stringOfVal = val.toString(),
            splittedVal = stringOfVal.split('.'),
            intPath = this.formatIntPath(splittedVal[0], groupSeparator),
            fractPath = this.formatFractPath(splittedVal[1], decimalSeparator, capacity);

        return intPath + fractPath;
    },

    /**
     * @protected
     * @description Форматирует целую часть числа
     * @memberOf NumberFormat.prototype
     * @param {String} intPath Целая часть числа
     * @param {String} splitter Разделитель между группами
     * @returns {String}
     */
    formatIntPath: function(intPath, splitter){
        return intPath.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, '$1' + splitter);
    },

    /**
     * @protected
     * @description Форматирует дробную часть числа
     * @memberOf NumberFormat.prototype
     * @param {String} fractPath Дробная часть числа
     * @param {String} splitter Разделитель между целой и дробной частью
     * @param {Number} capacity Количество знаков в дробной части
     * @returns {string}
     */
    formatFractPath: function(fractPath, splitter, capacity){
        var result = fractPath ? fractPath : '',
            postfix;

        if(capacity == 0){
            return '';
        }

        if(result.length >= capacity){
            return splitter + result.substr(0, capacity)
        }

        postfix = Math.pow(10, capacity - result.length);
        postfix = postfix.toString().substr(1);
        return splitter + result + postfix;
    }
}, formatMixin);
/**
 * @description Формат отображения объекта
 * @param {String} format Строка форматирования
 * @class ObjectFormat
 * @mixes formatMixin
 */
function ObjectFormat(format) {
    this.setFormat(format);

    this.formatters = [DateTimeFormat, NumberFormat];
}

_.extend(ObjectFormat.prototype, {

    /**
     * @private
     * @description Форматирует объект
     * @memberOf ObjectFormat.prototype
     * @param {*} originalValue Форматируемое значение
     * @param {Culture} culture Культура
     * @param {String} format Строка форматирования
     * @returns {String}
     */
    formatValue: function (originalValue, culture, format) {

        if (typeof originalValue === 'undefined' || originalValue === null) {
            return '';
        }

        culture = culture || new Culture(InfinniUI.config.lang);
        format = format || this.getFormat();

        var regexp = /{[^}]*}/g;
        var trim = /^{|}$/g;
        var value = '';

        if (typeof originalValue !== 'undefined' && originalValue !== null) {
            value = format.replace(regexp, this.formatIterator.bind(this, originalValue, culture));
        }
        
        return value;

    },

    /**
     * @private
     * @description Форматирование каждого простого вхождения формата в строку форматирования объекта
     * @memberOf ObjectFormat.prototype
     * @param {*} originalValue Форматируемое значение
     * @param {Culture} culture
     * @param {String} match строка форматирования
     * @returns {String}
     */
    formatIterator: function (originalValue, culture, match) {
        var regexp = /{[^}]*}/g;
        var trim = /^{|}$/g;

        var result, text, formatter, value, parts;

        result = match;
        text = match.replace(trim, '');
        parts = text.split(':');

        if (typeof originalValue === 'object') {
            value = (parts[0] === '') ? originalValue : InfinniUI.ObjectUtils.getPropertyValue(originalValue, parts[0]);
        } else {
            value = originalValue;
        }

        if (parts.length === 2) {
            // Найдено "[Property]:Format"
            for (var i = 0, ln = this.formatters.length; i < ln; i = i + 1) {
                //Пытаемся по очереди отформатировать значение разными форматами
                formatter = new this.formatters[i](parts[1]);
                text = formatter.format(value, culture);
                if (text !== parts[1]) {
                    //Если формат отформатировал строку - оставляем ее
                    result = text;
                    break;
                }
            }
        } else {
            // Найдено "[Property]"
            result = value;
        }

        return (typeof result === 'undefined' || result === null) ? '' : result;
    }




}, formatMixin);
/**
 * @description Билдер ObjectFormat
 * @class ObjectFormatBuilder
 */
function ObjectFormatBuilder () {

    /**
     * @description Создает и инициализирует экземпляр {@link ObjectFormat}
     * @memberOf ObjectFormatBuilder
     * @param builder
     * @param parent
     * @param metadata
     * @returns {ObjectFormat}
     */
    this.build = function (builder, parent, metadata) {
        var format = new ObjectFormat();

        format.setFormat(metadata.Format);

        return format;
    }
}
    var editMaskMixin = {
    /**
     * Установка начального значения
     * @param value
     */
    reset: function (value) {
        this.value = value;
        this.buildTemplate(value);
    },

    /**
     * Генерация шаблона ввода текста для текущей маски
     */
    buildTemplate: function () {

    },

    /**
     * Получить редактируемое значение
     * @returns {*}
     */
    getValue: function () {
        return this.value;
    },

    getData: function () {
        return this.getValue();
    },

    /**
     * Переход к предыдущему полю ввода
     * @param position
     * @returns {boolean|number}
     */
    moveToPrevChar: function (position) {

        return false;
    },

    /**
     * Переход к следующему полю ввода
     * @param position
     * @returns {boolean|number}
     */
    moveToNextChar: function (position) {

        return false;
    },

    /**
     * Установить следующее значение в текущей позиции
     * @param position
     * @returns {boolean|number}
     */
    setNextValue: function (position) {

        return false;
    },

    /**
     * Установить предыдущее значение в текущей позиции
     * @param position
     * @returns {boolean|number}
     */
    setPrevValue: function (position) {

        return false;
    },

    /**
     * Удалить выделенный текст
     * @param position
     * @returns {boolean|number}
     */
    deleteSelectedText: function(position){

        return false;
    },

    /**
     * Удалить символ справа от позиции
     * @param position
     * @returns {boolean|number}
     */
    deleteCharRight: function (position) {

        return false;
    },

    /**
     * Удалить символ слева от позиции
     * @param position
     * @returns {boolean|number}
     */
    deleteCharLeft: function (position) {

        return false;
    },

    /**
     * Обработка нажатия символа в указанной позиции
     * @param char
     * @param position
     * @returns {boolean|number}
     */
    setCharAt: function (char, position) {

        return false;
    },

    /**
     * Обработка вставки текста в маску
     * @param clipboardText
     * @param position
     * @returns {boolean}
     */
    pasteStringToMask: function(clipboardText, position){

        return false;
    },

    /**
     * Переход к следующей доступной маске ввода
     * @param position
     * @returns {boolean|number}
     */
    getNextItemMask: function (position) {
        return false;
    },

    /**
     * Получить текст для отображения в элементе
     * @returns {string}
     */
    getText: function () {
        return this.value.toString();
    },

    /**
     * Форматирование значения для заданной группы маски ввода
     * @param {*} value
     * @param {String} mask Маска для фоматтера this.format
     * @returns {String}
     */
    formatMask: function (value, mask) {
        return (value === null || typeof value === 'undefined') ? '' : value;
    },

    getNextIntValue: function (options, value) {
        options = options || {};
        var minValue = null,
            maxValue = null,
            step = (typeof options.step !== 'undefined') ? step : 1;
        if (typeof options.min !== 'undefined') {
            minValue = options.min;
        }
        if (typeof options.max !== 'undefined') {
            maxValue = options.max;
        }
        value = parseInt(value, 10);
        if (isNaN(value)) {
            value = (minValue === null) ? 0 : minValue;
        } else {
            value = value + step;
            if (maxValue !== null && value > maxValue) {
                value = maxValue;
            }
        }
        return value;
    },
    
    getPrevIntValue: function (options, value) {
        options = options || {};
        var minValue = null,
            step = (typeof options.step !== 'undefined') ? step : 1;
        if (typeof options.min !== 'undefined') {
            minValue = options.min;
        }
        value = parseInt(value, 10);
        if (isNaN(value)) {
            value = (minValue === null) ? 0 : minValue;
        } else {
            value = value - step;
            if (minValue !== null && value < minValue) {
                value = minValue;
            }
        }
        return value;
    },

    formatInt: function (options, value) {
        var width = (typeof options.width !== 'undefined') ? options.width : null;

        value = parseInt(value, 10);
        var text, ln;
        if (isNaN(value)) {
            value = '';
        }
        text = value.toString();
        ln = text.length;
        if (width !== null && ln < width) {
            text = Array(width - ln +1).join('0') + text;
        }
        return text;
    },

    /**
     * Проверка что маска была полностью заполнена
     * @param value
     * @returns {boolean}
     */
    getIsComplete: function (value) {

        return false;
    }

};
var DateTimeMaskPartStrategy = (function () {
    var regExpDay = /^(?:3[0-1]|[012]?[0-9]?)$/;
    var regExpMonth = /^(?:1[0-2]|0?[1-9]?)$/;
    var regExpFullYear = /^\d{1,4}$/;
    var regExpYear = /^\d{1,2}$/;
    var regExpHour24 = /^(?:[12][0-3]|[01]?[1-9]?)$/;
    var regExp60 = /^[0-5]?[0-9]$/;

    return {
        'd': {
            init: function () {
                this.width = 2;
                this.min = 1;
                this.max = 31;
            },
            match: function (value) {
                return regExpDay.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setDate(part);
                return value;
            }
        },
        'dd': {
            init: function () {
                this.width = 2;
                this.min = 1;
                this.max = 31;
            },
            match: function (value) {
                return regExpDay.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setDate(part);
                return value;
            }
        },
        'M': {
            init: function () {
                this.width = 2;
                this.min = 1;
                this.max = 12;
            },
            match: function (value) {
                return regExpMonth.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setMonth(parseInt(part, 10) - 1);
                return value;
            }
        },
        'MM': {
            init: function () {
                this.width = 2;
                this.min = 1;
                this.max = 12;
            },
            match: function (value) {
                return regExpMonth.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setMonth(parseInt(part, 10) - 1);
                return value;
            }
        },
        'y': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 99;
            },
            match: function (value) {
                return regExpYear.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                var year = parseInt(part, 10);
                if (!isNaN(year)) {
                    year = '0000' + year;
                    var date = new Date();
                    value.setFullYear(date.getFullYear().toString().substr(0, 2) + year.slice(-2));
                }
                return value;
            }
        },
        'yy': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 99;
            },
            match: function (value) {
                return regExpYear.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                var year = parseInt(part, 10);
                if (!isNaN(year)) {
                    year = '0000' + year;
                    var date = new Date();
                    value.setFullYear(date.getFullYear().toString().substr(0, 2) + year.slice(-2));
                }
                return value;
            }
        },
        'yyyy': {
            init: function () {
                this.width = 4;
                this.min = 0;
                this.max = 9999;
            },
            match: function (value) {
                return regExpFullYear.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setFullYear(part);
                return value;
            }
        },
        'H': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 23;
            },
            match: function (value) {
                return regExpHour24.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setHours(part);
                return value;
            }
        },
        'HH': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 23;
            },
            match: function (value) {
                return regExpHour24.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setHours(part);
                return value;
            }
        },
        'm': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 59;
            },
            match: function (value) {
                return regExp60.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setMinutes(part);
                return value;
            }
        },
        'mm': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 59;
            },
            match: function (value) {
                return regExp60.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setMinutes(part);
                return value;
            }
        },
        's': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 59;
            },
            match: function (value) {
                return regExp60.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setSeconds(part);
                return value;
            }
        },
        'ss': {
            init: function () {
                this.width = 2;
                this.min = 0;
                this.max = 59;
            },
            match: function (value) {
                return regExp60.test(value);
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevIntValue(value);
            },
            next: function (value) {
                return this.getNextIntValue(value);
            },
            format: function (value) {
                return this.padNumber(value);
            },
            apply: function (value, part) {
                value.setSeconds(part);
                return value;
            }
        },
        'MMM': {
            init: function () {
                this.min = 2;
                this.max = 12;
                this.width = 2;
            },
            match: function () {
                return false;   // Не даем ничего вводить
            },
            validator: function (value) {
                return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevMonthValue('MMM', value);
            },
            next: function (value) {
                return this.getNextMonthValue('MMM', value);
            },
            apply: function (value, part) {
                var index = this.getIndexMonthValue('MMM', part);
                if (index !== -1) {
                    value.setMonth(index);
                }

                return value;
            }
        },
        'MMMM': {
            init: function () {
                this.min = 2;
                this.max = 12;
                this.width = 2;
            },
            match: function () {
                return false;   // Не даем ничего вводить
            },
            validator: function (value) {
                var list = this.getListForMask('MMMM');
                return list.indexOf(value) > -1;
                //return this.rangeValidator(value);
            },
            prev: function (value) {
                return this.getPrevMonthValue('MMMM', value);
            },
            next: function (value) {
                return this.getNextMonthValue('MMMM', value);
            },
            apply: function (value, part) {
                var index = this.getIndexMonthValue('MMMM', part);
                if (index !== -1) {
                    value.setMonth(index);
                }
                return value;
            }
        }

    }

})();

var DateTimeMaskPart = function (mask) {
    _.extend(this, DateTimeMaskPartStrategy[mask]);
    this.init();
};

_.extend(DateTimeMaskPart.prototype, {

    init: function () {

    },

    match: function (value) {
        return true;
    },

    validator: function (value) {
        return true;
    },

    fulfilled: function (value) {
        return this.match(value) && this.validator(value);
    },

    prev: function (value) {
        return value;
    },

    next: function (value) {
        return value;
    },

    format: function (value) {
        return value;
    },

    applyPart: function(value, part) {
        return value;
    },

    padNumber: function (value) {
        var width = (typeof this.width !== 'undefined') ? this.width : null;

        value = parseInt(value, 10);
        var text, ln;
        text = (isNaN(value)) ? text = '': value.toString();
        ln = text.length;
        if (width !== null && ln < width) {
            text = Array(width - ln +1).join('0') + text;
        }

        return text;
    },

    getNextIntValue: function (value) {
        var minValue = (typeof this.min !== 'undefined') ? this.min : null,
            maxValue = (typeof this.max !== 'undefined') ? this.max : null,
            step = (typeof this.step !== 'undefined') ? this.step : 1;

        value = parseInt(value, 10);
        if (isNaN(value)) {
            value = (minValue === null) ? 0 : minValue;
        } else {
            value = value + step;
            if (maxValue !== null && value > maxValue) {
                value = maxValue;
            }
        }
        return value;
    },

    getPrevIntValue: function (value) {
        var minValue = (typeof this.min !== 'undefined') ? this.min : null,
            step = (typeof this.step !== 'undefined') ? this.step : 1;

        value = parseInt(value, 10);
        if (isNaN(value)) {
            value = (minValue === null) ? 0 : minValue;
        } else {
            value = value - step;
            if (minValue !== null && value < minValue) {
                value = minValue;
            }
        }
        return value;
    },

    getListForMask: function (mask) {
        //@TODO Получать культуру из контекста!
        var culture = new Culture(InfinniUI.config.lang);
        var formatInfo = culture.dateTimeFormatInfo;

        var list;

        switch (mask) {
            case 'MMMM':
                list = formatInfo.monthNames;
                break;
            case 'MMM':
                list = formatInfo.abbreviatedMonthNames;
                break;
            case 'dddd':
                list = formatInfo.dayNames;
                break;
            case 'ddd':
                list = formatInfo.abbreviatedDayNames;
                break;
        }

        return list;
    },

    getNextListValueForMask: function (mask, value) {
        var list = this.getListForMask(mask);
        var index = list.indexOf(value);
        if (typeof list === 'undefined') {
            return value;
        } else if (index === -1){
            return list.length ? list[0]: '';
        }
        index = index + 1;
        return (index < list.length) ? list[index] : value;
    },

    getPrevListValueForMask: function (mask, value) {
        var list = this.getListForMask(mask);
        var index = list.indexOf(value);
        if (typeof list === 'undefined') {
            return value;
        } else if (index === -1){
            return list.length ? list[list.length - 1]: '';
        }
        index = index - 1;
        return (index >= 0) ? list[index] : value;
    },

    getIndexListValueForMask: function (mask, value) {
        var list = this.getListForMask(mask);

        if (typeof list === 'undefined') {
            return -1;
        }

        return list.indexOf(value);
    },

    getNextMonthValue: function (mask, value) {
        return this.getNextListValueForMask(mask, value);
    },

    getPrevMonthValue: function (mask, value) {
        return this.getPrevListValueForMask(mask, value);
    },

    getIndexMonthValue: function (mask, value) {
        return this.getIndexListValueForMask(mask, value);
    },

    rangeValidator: function (value) {
        value = parseInt(value, 10);
        return  !(isNaN(value) || value < this.min || value > this.max);
    }

});

function DateTimeEditMask() {
    this.mask = null;
    this.format = null;
}

_.extend(DateTimeEditMask.prototype, {

    /**
     * Переход к следующему разделу маски
     * @param position
     * @returns {Integer}
     */
    getNextItemMask: function (position) {
        var data = this.getItemTemplate(position);
        var newPosition;

        if (data !== null) {
            newPosition = this.moveToNextChar(data.left + data.width);
            if (newPosition > data.left + data.width) {
                position = newPosition;
            }

        } else {
            position = this.moveToNextChar(position);
        }
        return position;
    },

    /**
     * Установить следущее из вожможных значений в элементе маски ввода
     * @param position
     * @returns {*}
     */
    setNextValue: function (position) {
        var data = this.getItemTemplate(position);
        var item, value, mask;

        if (data !== null) {
            item = data.item;
            mask = this.masks[item.mask];
            if (typeof mask.next !== 'undefined') {
                value = mask.next(item.text);
                if (typeof mask.format !== 'undefined') {
                    value = mask.format(value);
                }
                item.text = '' + value;

                position = Math.min(data.left + item.text.length, position);
            }
        } else {
            position = this.moveToNextChar(position);
        }
        return position;
    },

    /**
     * Установить предыдущее из вожможных значений в элементе маски ввода
     * @param position
     * @returns {*}
     */
    setPrevValue: function (position) {
        var data = this.getItemTemplate(position);
        var item, value, mask;

        if (data !== null) {
            item = data.item;
            mask = this.masks[item.mask];
            if (typeof mask.prev !== 'undefined') {
                value = mask.prev(item.text);
                if (typeof mask.format !== 'undefined') {
                    value = mask.format(value);
                }
                item.text = '' + value;
                position = Math.min(data.left + item.text.length, position);
            }
        } else {
            position = this.moveToNextChar(position);
        }
        return position;
    },

    /**
     * Удалить символ слева от курсора
     * @param position
     */
    deleteCharLeft: function (position) {
        var data = this.getItemTemplate(position);
        var item, text;

        var selection = window.getSelection().toString();

        if (selection) {
            this.selectRemove(this.template, position, selection);
        } else {
            if (data !== null) {
                if (data.index > 0) {
                    item = data.item;
                    position--;
                    text = item.text.slice(0, data.index - 1) + item.text.slice(data.index);
                    item.text = text;
                } else {
                    data = this.getItemTemplate(data.left - 1);
                    position = data.left + data.item.text.length;
                }
            } else {
                position = this.moveToNextChar(position);
            }
        }
        return position;
    },

    /**
     * Удалить символ справа от курсора
     * @param position
     */
    deleteCharRight: function (position) {
        var data = this.getItemTemplate(position);
        var item, text;

        var selection = window.getSelection().toString();

        if (selection) {
            this.selectRemove(this.template, position, selection);
        } else {
            if (data !== null) {
                item = data.item;
                text = item.text.slice(0, data.index) + item.text.slice(data.index + 1);
                item.text = text;
                if (item.text.length == 0) {
                    position = this.getNextItemMask(position);
                }
            } else {
                position = this.moveToNextChar(position);
            }
        }
        return position;
    },

    /**
     * Удаление выделенного текста
     * @param template
     * @param position
     * @param selection
     */
    selectRemove: function(template, position, selection){
        var firstItem = this.getItemTemplate(position);
        var lastItem = this.getItemTemplate(position + selection.length);

        var firstIndexItem = template.indexOf(firstItem.item);
        var lastIndexItem = template.indexOf(lastItem.item);

        for (var i = firstIndexItem; i < lastIndexItem + 1; i++) {
            if (typeof template[i] == "object") {
                if (firstIndexItem == lastIndexItem) {
                    build(template[i], position, selection);
                } else if (i == firstIndexItem) {
                    build(template[i], position, selection);
                } else if (i == lastIndexItem) {
                    build(template[i], position, selection);
                } else {
                    template[i].text = '';
                }
            }
        }

        function build(templateText, position, selection) {
            var arraySymbols = templateText.text.split('');
            var start = position - templateText.position;
            var end = (position + selection.length) - templateText.position;

            if (start < 0) start = 0;
            arraySymbols.splice(start, end - start);

            templateText.text = arraySymbols.join('');
            return templateText;
        }
    },

    /**
     * Вставка в маску
     * @param clipboardText
     * @param position
     */
    pasteStringToMask: function(clipboardText, position){
        clipboardText = clipboardText.replace(/\D/gi, '');

        var arraySymbols = clipboardText.split('');

        var firstItem = this.getItemTemplate(position);
        var firstIndexItem = this.template.indexOf(firstItem.item), lastIndexItem = 0;

        var lastItem = getLastTemplate(this.template);
        if(lastItem) {
            lastIndexItem = this.template.indexOf(lastItem);
        }else{
            lastIndexItem = firstIndexItem;
        }

        var tLength = 0, maxLength = 0;

        for(var i = firstIndexItem; i < lastIndexItem+1; i++) {
            if (typeof this.template[i] == "object") {
                if (i == firstIndexItem) {
                    maxLength = maxTemplateLength(this.template[i]);
                    tLength = maxLength - (position-this.template[i].position);

                    var first = this.template[i].text.slice(0, position - this.template[i].position);

                    var zero = '';
                    if(!first) {
                        for (var d = 0; d < position - this.template[i].position; d++) {
                            zero = zero + '0';
                        }
                    }

                    this.template[i].text = zero + first + clipboardText.slice(0, tLength);
                    arraySymbols.splice(0, tLength)
                }else{
                    if(i != lastIndexItem){
                        maxLength = maxTemplateLength(this.template[i]);

                        this.template[i].text = arraySymbols.join('').slice(0, maxLength);
                        arraySymbols.splice(0, maxLength);
                    }else{
                        maxLength = maxTemplateLength(this.template[i]);

                        if(arraySymbols.length > maxLength) arraySymbols.splice(maxLength, arraySymbols.length);
                        this.template[i].text = arraySymbols.join('') + this.template[i].text.slice(arraySymbols.length, maxLength);
                    }
                }
            }
        }

        function maxTemplateLength(template){
            return Math.max(template.mask.length, template.text.length)
        }

        function getLastTemplate(template) {
            var dotLength = 0;
            var arr = [];
            for (var i = firstIndexItem; i < template.length; i++) {
                if (typeof template[i] == "object") {
                    if (clipboardText.length > template[i].position - dotLength - position) {
                        arr.push(template[i]);
                    }
                } else {
                    dotLength = dotLength + template[i].length;
                }
            }
            return arr[arr.length-1];
        }
    },

    /**
     * @private
     * @description Получить элемент шаблона в заданной позиции
     * @param {Integer} position
     * @returns {*}
     */
    getItemTemplate: function (position) {
        var template = this.template;
        var item;
        var left = 0;
        var width;
        var index;
        var result = null;
        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') {
                left += item.length;
            } else {
                width = Math.max(this.masks[item.mask].width, item.text.length);
                if (position < left || position >= left && position <= left + width) {
                    index = position - left;
                    result = {
                        item: item,
                        left: left,
                        width: width,
                        index: position - left
                    };
                    break;
                }
                left += width;
            }
        }

        return result;
    },

    setCharAt: function (char, position) {
//        var template;
//
//        for (var i = 0, ln = this.template.length; i < ln; i = i + 1) {
//            template = this.template[i];
//            if (typeof template === 'string') { //Статический текст
//                continue;
//            }
//            if (template.position === position) {    //Маска ввода
//                mask = this.masks[template.mask];
//                console.log(mask);
//                text = char.substr(0,1);
//                if (mask.validator(text)) {
//                    template.text = text;
//                    position = this.getNextItemMask(position);
//                }
//                break;
//            }
//            if (template.position > position) {
//                break;
//            }
//        }
        var data = this.getItemTemplate(position);
        var text;
        var item;
        var mask;
        var index;
        var newpos;

        if (data !== null) {
            item = data.item;
            index = position - data.left;

            if (index > item.text.length) {
                position = data.left;
            }

            mask = this.masks[item.mask];

            newpos = position - item.position;
            if(newpos < 0) newpos = 0;

            if(item.text.slice(newpos, newpos+1)) {
                text = [item.text.slice(0, newpos), char, item.text.slice(newpos+1)].join('');
            }else{
                text = [item.text.slice(0, data.index), char, item.text.slice(data.index)].join('');
            }

            if(mask.match(text)) {
                item.text = text;
                position = this.moveToNextChar(position);
                if (mask.width === newpos+1) {
                    position = this.getNextItemMask(position);
                }
            } else {    //Нажатая кнопка не подходит под маску
                var nextItem = this.template.indexOf(data.item) + 1;
                if (this.template[nextItem] === char) {
                    position = this.getNextItemMask(position);
                }
            }

        } else {
            position = this.moveToNextChar(position);
        }


        return position;
    },

    /**
     * Получить предыдущую позицию, в которой возможен ввод
     */
    moveToPrevChar: function (position) {
        position = position - 1;
        var template = this.template;
        var item;
        var mask;
        var width;
        var left = 0;
        var last;
        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') { //Простой символ
                left += item.length;
                if (typeof last === 'undefined') {
                    last = left;
                }
            } else {    //элемент маски ввода
                mask = item.mask;
                width = Math.max(this.masks[mask].width, item.text.length);
                if (position >= left && position < left + width) {
                    break;
                } else if (position < left) {
                    position = last;
                    break;
                }
                left += width;
                last = left;
            }
        }

        if (i === ln && position > last) {
            position = last;
        }

        return position;
    },

    /**
     * Получить следущую позицию, в которой возможен ввод
     */
    moveToNextChar: function (position) {
        position = position + 1;
        var template = this.template;
        var item;
        var left = 0;
        var last;
        var mask;
        var width;
        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') {  //Простой исмвол
                left += item.length;
            } else {    //Элемент маски ввода
                mask = item.mask;
                width = Math.max(this.masks[mask].width, item.text.length);
                if (position >= left && position <= left + width) {
                    break;
                } else if (position < left) {
                    //position = (typeof last !== 'undefined') ? last : left;
                    position = left;
                    break;
                }
                left += width;
                last = left;

            }
        }
        if (i === ln && position >= last) { //Если вышли за границы маски
            position = last;
        }

        return position;
    },

    /**
     * Получить представление значения для MaskedEdit
     * @returns {string}
     */
    getText: function () {
        var template = this.template;
        var item;
        var result = [];
        var placeholder;

        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') {
                result.push(item);
            } else {
                placeholder = Array(this.masks[item.mask].width + 1).join('_');
                if (item.text.length < placeholder.length) {
                    result.push(item.text + placeholder.slice(item.text.length));
                } else {
                    result.push(item.text);
                }
            }
        }
        return result.join('');
    },

    /**
     * @private
     * @description Построение объекта для форматирования значения
     * @param {Date} [date] Значение
     * @returns {Array}
     */
    buildTemplate: function (date) {
        var mask = this.normalizeMask(this.mask);
        var i, ln;

        //Все доступные маски упорядочиваем по длине
        var masks = _.keys(this.masks);
        masks.sort(function (a, b) {
            return b.length - a.length;
        });

        //Ищем используемые в шаблоне маски
        var usedMasks = [];
        var maskLength;
        var position;
        for (i = 0, ln = masks.length; i < ln; i = i + 1) {
            position = mask.indexOf(masks[i]);
            if (position === -1) continue;
            //Вырезаем маску
            maskLength = masks[i].length;
            mask = [mask.substring(0, position), Array(maskLength + 1).join(" "), mask.substring(position + maskLength)].join('');
            usedMasks.push({
                mask: masks[i],
                position: position
            });
        }
        //Упорядочиваем использованные маски по позиции вхождения в шаблон
        usedMasks.sort(function (a, b) {
            return a.position - b.position;
        });

        var template = [];
        var lastPosition = 0;
        var usedMask;
        for (i = 0, ln = usedMasks.length; i < ln; i = i + 1) {
            usedMask = usedMasks[i];
            if (lastPosition < usedMask.position) {
                template.push(mask.substring(lastPosition, usedMask.position));
            }
            lastPosition = usedMask.position + usedMask.mask.length;
            //usedMask.mask = this.normalizeMask(usedMask.mask);
            //usedMask.text = (date === null || typeof date === 'undefined') ? '' : this.format.format(date, undefined, usedMask.mask);
            usedMask.text = this.formatMask(date, usedMask.mask);
            template.push(usedMask);
        }

        if (lastPosition < mask.length) {
            template.push(mask.substring(lastPosition));
        }

        return template;
    },


    /**
     * Вернуть введеный результат
     * @returns {*}
     */
    getValue: function () {
        var template = this.template;
        var item;
        var mask;
        var value = this.value;
        var done = true;

        for (var i = 0; i < template.length; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') continue;
            mask = this.masks[item.mask];
            if (typeof mask.apply !== 'undefined') {
                if (item.text === '') {
                    done = false;
                    break;
                }
                value = mask.apply(value, item.text);
            }
        }


        return done ? value : null;
    },

    /**
     * Вернуть результат в используемумом формате данных: строка в формате ISO8601
     * @returns {String}
     */
    getData: function () {
        return InfinniUI.DateUtils.toISO8601(this.getValue());
    },

    /**
     * Установка начального значения
     * @param value
     */
    reset: function (value) {
        this.value = null;
        var date = null;

        if (typeof value !== 'undefined' && value !== null && value !== '') {
            //Если переданное значение является датой - инициалищируем этим значением
            try {
                if(value instanceof Date){
                    date = value;
                }else {
                    date = new Date(value);
                }

            } catch (e) {
                date = null;
            }
            this.value = date;
        }

        this.template = this.buildTemplate(date);

        if (this.value === null) {
            this.value = new Date(0);
        }
    },

    /**
     * @private
     * @description Переводим %x => x
     * @param mask
     */
    normalizeMask: function (mask) {
        var localization = InfinniUI.localizations[InfinniUI.config.lang];

        if (typeof localization.patternDateFormats !== 'undefined' && typeof localization.patternDateFormats[mask] !== 'undefined') {
            mask = localization.patternDateFormats[mask];
        }

        return mask.replace(/%([yMdms])/g, '$1');
    },

    /**
     * Форматирование значения для заданной группы маски ввода
     * @param {*} value
     * @param {String} mask Маска для фоматтера this.format
     * @returns {String}
     */
    formatMask: function (value, mask) {
        mask = mask.replace(/^([yMdms])$/, '%$1');
        return (value === null || typeof value === 'undefined') ? '' : this.format.format(value, undefined, mask);
    },

    /**
     * Проверка что маска была полностью заполнена
     */
    getIsComplete: function () {
        var template = this.template;
        var item;
        var complete = true;
        var mask;

        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') continue;
            mask = this.masks[item.mask];
            if (!mask.validator(item.text)) {
                complete = false;
                break;
            }
        }
        return complete;
    },

    masks: {
        'd': new DateTimeMaskPart('d'),
        'dd': new DateTimeMaskPart('dd'),
        'M': new DateTimeMaskPart('M'),
        'MM': new DateTimeMaskPart('MM'),
        'y': new DateTimeMaskPart('y'),
        'yy': new DateTimeMaskPart('yy'),
        'yyyy': new DateTimeMaskPart('yyyy'),
        'H': new DateTimeMaskPart('H'),
        'HH': new DateTimeMaskPart('HH'),
        'm': new DateTimeMaskPart('m'),
        'mm': new DateTimeMaskPart('mm'),
        's': new DateTimeMaskPart('s'),
        'ss': new DateTimeMaskPart('ss'),
        'MMM': new DateTimeMaskPart('MMM'),
        'MMMM': new DateTimeMaskPart('MMMM')
    }

});



/**
 * Билдер DateTimeEditMask
 * @constructor
 */
function DateTimeEditMaskBuilder () {
    this.build = function (builder, parent, metadata) {

        var editMask = new DateTimeEditMask();
        var culture = new Culture(InfinniUI.config.lang);
        var mask;

        if (typeof InfinniUI.localizations[culture.name].patternDateFormats[metadata.Mask] !== 'undefined') {
            mask = InfinniUI.localizations[culture.name].patternDateFormats[metadata.Mask];
        } else {
            mask = metadata.Mask;
        }

        editMask.mask = mask;

        editMask.format = builder.buildType(parent, 'DateTimeFormat', {Format: metadata.Mask});

        return editMask;
    }
}
function NumberEditMask () {
    this.mask = null;
    this.format = null;
    //@TODO Получать культуру из контекста!
    this.culture = new Culture(InfinniUI.config.lang);
}

_.extend(NumberEditMask.prototype, editMaskMixin);


_.extend(NumberEditMask.prototype, {

    placeholder: '_',

    /**
     * Получение десятичного разделителя для текущего формата
     * @returns {String}
     */
    getDecimalSeparator: function () {
        var itemTemplate = this.getItemTemplate();
        var item = itemTemplate.item;
        var regexp = /^[npc]/i;
        var matches = item.mask.match(regexp);
        var separator;
        if (matches && matches.length > 0) {
            switch (matches[0]) {
                case 'n':
                case 'N':
                    separator = this.culture.numberFormatInfo.numberDecimalSeparator;
                    break;
                case 'p':
                case 'P':
                    separator = this.culture.numberFormatInfo.percentDecimalSeparator;
                    break;
                case 'c':
                case 'C':
                    separator = this.culture.numberFormatInfo.currencyDecimalSeparator;
                    break;
            }
        }

        return separator;
    },

    getDecimalDigits: function () {
        var itemTemplate = this.getItemTemplate();
        var item = itemTemplate.item;
        var regexp = /^([npc])(\d*)$/i;
        var matches = item.mask.match(regexp);
        var decimalDigits = 0;
        if (matches && matches.length > 0) {

            if (matches[2] !== '') {
                decimalDigits = +matches[2];
            } else {
                switch (matches[0]) {
                    case 'n':
                    case 'N':
                        decimalDigits = this.culture.numberFormatInfo.numberDecimalDigits;
                        break;
                    case 'p':
                    case 'P':
                        decimalDigits = this.culture.numberFormatInfo.percentDecimalDigits;
                        break;
                    case 'c':
                    case 'C':
                        decimalDigits = this.culture.numberFormatInfo.currencyDecimalDigits;
                        break;
                }
            }
        }
        return decimalDigits;
    },

    /**
     * Установка начального значения
     * @param value
     */
    reset: function (value) {
        this.value = null;

        if (typeof value !== 'undefined' && value !== null && value !== '') {
            value = +value;
            if (isNaN(value)) {
                value = null;
            }
            this.value = value;
        }

        this.template = this.buildTemplate(value);
    },

    buildTemplate: function (value) {
        var r = /([npc])(\d*)/i;

        var mask = this.mask;

        var template = [];

        var that = this;

        mask.replace(r, function (mask, name, precision, position, text) {
            //Часть перед шаблоном
            template.push(text.slice(0, position));
            //Шаблон
            template.push({
                mask: mask,
                text: (value === null) ? "" : that.formatMask(value, mask),
                value: value
            });
            //Часть после шаблона
            template.push(text.substring(position + mask.length));
        });

        return template;
    },

    getText: function () {
        var result = [];
        var item;

        for (var i = 0, ln = this.template.length; i < ln; i = i + 1) {
            item = this.template[i];
            if (typeof item === 'string') {
                result.push(item);
            } else {
                if (typeof item.value === 'undefined' || item.value === null) {
                    //Отдаем маску ввода
                    result.push(this.formatMask(0, item.mask).replace(/0/g, this.placeholder));
                } else {
                    //Отдаем форматированное значени
                    result.push(this.formatMask(item.value, item.mask));
                }
            }
        }

        return result.join('');
    },

    formatMask: function (value, mask) {
        return (value === null || typeof value === 'undefined') ? '' : this.format.format(value, undefined, mask);
    },

    /**
     * Переход к предыдущему символу в строке ввода
     * @param {number} position
     * @returns {number}
     */
    moveToPrevChar: function (position) {
        position = (position > 0) ? position - 1 : 0;
        var itemTemplate = this.getItemTemplate();
        var item = itemTemplate.item;
        var text = item.text;
        var index;
        var start;

        if (position < itemTemplate.left) {
            index = text.search(/\d/);
            position = (index === -1) ?  itemTemplate.left : itemTemplate.left + index;
        } else {
            start = position - itemTemplate.left + 1;
            //Переход к первой цифре слева от позиции
            var txt = text.substring(0, start);
            if (/\d/.test(txt)) {   //Слева есть цифры
                index = txt.length - txt.split('').reverse().join('').search(/\d/);
                if (index === start) {
                    index--;
                }
            } else {    //
                index = Math.max(0, text.search(/\d/));
            }

            position = itemTemplate.left + index;
        }

        return position;
    },

    /**
     * Переход к следущему символу в строке ввода
     * @param {number} position
     * @returns {number}
     */
    moveToNextChar: function (position) {
        position = (position < 0) ? 0 : position + 1;

        var itemTemplate = this.getItemTemplate();
        var item = itemTemplate.item;
        var text = item.text + " ";
        var start = Math.max(0, position - itemTemplate.left);
        var index;


        //Переход к первой цифре справа от позиции

        var r = /\d/;
        var last = 0;
        var char;
        for (var i = 0, ln = text.length; i < ln; i = i + 1) {
            if (r.test(text[i]) === false) {
                char =  text[i-1];
                if (typeof char !== 'undefined' && !r.test(char)) {
                    continue;
                }
            }
            if (i < start) {
                last = i;
            } else {
                index = i;
                break;
            }
        }
        if (typeof index === 'undefined') {
            index = last;
        }

        position = itemTemplate.left + index;
        return position;
    },

    /**
     * Обработка нажатия символа в указанной позиции
     * @param char
     * @param position
     */
    setCharAt: function (char, position) {
        var itemTemplate = this.getItemTemplate();
        var left = itemTemplate.left;
        var item = itemTemplate.item;
        var text = item.text;
        var decimalSeparator = this.getDecimalSeparator();
        var index;

        if (char === '-' && item.value !== null) {  //Смена знака
            item.value = -item.value;
            item.text = this.formatMask(item.value, item.mask);
            position += item.text.length - text.length;
        } else if (position >= itemTemplate.left && position <= itemTemplate.left + text.length) {
            //Позиция попадает в маску ввода
            index = position - left;

            if (char == decimalSeparator) { //Нажат разделитель
                if (item.value === null){
                    item.value = 0;
                    item.text = this.formatMask(item.value, item.mask);
                }
                //Переход на первую цифру дробной части
                if (item.text.indexOf(decimalSeparator) !== -1) {
                    position = left + item.text.indexOf(decimalSeparator) + decimalSeparator.length;
                }

            } else if (/\d/.test(char)) {  //Нажата цифра
                var fractional;

                fractional = text.indexOf(decimalSeparator) > -1 && index > text.indexOf(decimalSeparator);
                item.value = this.parseText([text.slice(0, index), char, text.slice(index)].join(''), item.value);
                item.text = this.formatMask(item.value, item.mask);

                if (text === '') {
                    position = this.moveToNextChar(left);
                } else {
                    position = (fractional) ?  position + 1: position + item.text.length - text.length;
                    position = Math.min(position, left + this.getIndexOfEndDigit(item.text));
                }
            }
        }

        return position;
    },

    /**
     * @private
     * @description увеличивает или уменьшает на 1 значение цифры слева от каретки.
     * @param position
     * @param delta
     * @returns {*}
     */
    updateDigitValue: function (position, delta) {
        var itemTemplate = this.getItemTemplate();
        var left = itemTemplate.left;
        var item = itemTemplate.item;
        var text = item.text;
        var index;


        if (position < itemTemplate.left || position > itemTemplate.left + text.length) {
            //Позиция не попадает в маску ввода
            return this.moveToNextChar(position);
        }

        index = position - left;

        if (index > 0) {
            var digit = text.substr(index - 1, 1);
            if (/\d/.test(digit)) {
                digit = parseInt(digit,10) + delta;
                if (digit > 9) digit = 9;
                if (digit < 0) digit = 0;
                item.value = this.parseText([text.slice(0, index - 1), digit, text.slice(index)].join(''), item.value);
                item.text = this.formatMask(item.value, item.mask);
            }

        }
        return position;
    },

    setNextValue: function (position) {
       return this.updateDigitValue(position, 1);
    },

    setPrevValue: function (position) {
        return this.updateDigitValue(position, -1);
    },

    /**
     * Удаление выделенного текста
     * @param position
     * @param len
     * @param char
     * @returns {*}
     */
    deleteSelectedText: function(position, len, char){
        var itemTemplate = this.getItemTemplate();
        var item = itemTemplate.item;
        var text = item.text;
        var val = item.value.toString();
        var endLength = len + position;
        if(!char)char = "";

        var preventPosition = text.slice(0, position);
        var preventLength = text.slice(0, endLength);

        var spacePreventPosition = (preventPosition.split(" ").length - 1);
        var spacePreventLength = (preventLength.split(" ").length - 1);

        position = position - spacePreventPosition;
        endLength = endLength - spacePreventLength;

        var res = val.slice(0, position) + char + val.slice(endLength, val.length);
        var masktext = this.formatMask(res, item.mask);

        if(char){
            position += char.length+spacePreventPosition;
            position += formatSpace(masktext, position);
        }else{
            position += formatSpace(masktext, position);
        }

        function formatSpace(text, position){
            return text.slice(0, position).split(" ").length - 1;
        }

        if(_.isEmpty(res)){
            res = null;
        }

        return {result: res, position: position};
    },

    /**
     * Удаление символов справа от позиции курсора
     * @param position
     * @param len
     * @returns {*}
     */
    deleteCharRight: function (position, len) {
        var itemTemplate = this.getItemTemplate();
        var left = itemTemplate.left;
        var item = itemTemplate.item;
        var text = item.text;
        var decimalSeparator = this.getDecimalSeparator();
        var index;

        if (position < itemTemplate.left || position > itemTemplate.left + text.length) {
            //Не попадаем в маску
            return this.moveToNextChar(0);
        }

        if (text.length === len) {
            return this.clearValue(item);
        }
        //Позиция попадает в маску ввода
        index = position - left;

        var decimalSeparatorIndex = text.indexOf(decimalSeparator);

        var i = text.substr(index).search(/\d/);
        if (item.value === 0) {
            item.value = null;
            item.text = this.formatMask(item.value, item.mask);
            position = left;
        } else if (i > -1){
            i += index;
            var parts = text.split(decimalSeparator);
            if (index === parts[0].length) { //Находимся в целой части, на границе с дробно - удаляем всю дробную
                item.value = this.parseText(parts[0], item.value);
            } else {
                item.value = this.parseText([text.substr(0, i), text.substr(i + 1)].join(''), item.value);
            }

            //item.value = this.parseText([text.substr(0, i), text.substr(i + 1)].join(''), item.value);
            item.text = this.formatMask(item.value, item.mask);
            if (i < decimalSeparatorIndex) {
                //Находились в целой части, должны в ней и остаться
                //position = left + Math.min(i, item.text.indexOf(decimalSeparator));
                position = left + Math.min(i - (text.length - 1 - item.text.length ), item.text.indexOf(decimalSeparator));
            }
        }

        return position;
    },

    clearValue: function (item) {
        item.value = null;
        item.text = this.formatMask(item.value, item.mask);

        return 0;
    },

    deleteCharLeft: function (position, len) {
        var itemTemplate = this.getItemTemplate();
        var left = itemTemplate.left;
        var item = itemTemplate.item;
        var text = item.text;
        var decimalSeparator = this.getDecimalSeparator();
        var decimalSeparatorIndex = text.indexOf(decimalSeparator);
        var index;
        if (position < itemTemplate.left || position > itemTemplate.left + text.length) {
            //Не попадаем в маску
            return this.moveToNextChar(0);
        }
        //Позиция попадает в маску ввода
        var decimalDigits = this.getDecimalDigits();
        index = position - left;

        if (text.length === len) {
            return this.clearValue(item);
        }

        var fractional = false;
        if (index <= 0) {
            return position;
        }

        if (decimalSeparatorIndex > -1) {
            fractional = index > decimalSeparatorIndex;
            if ((index === text.length - decimalDigits)) {
                //Позиция сразу справа от разделителя - переносим ее в целую часть
                index -= decimalSeparator.length;
                position -= decimalSeparator.length;
            }
        }

        var txt = text.slice(0, index);

        var i = (/\d/.test(txt)) ? txt.length - txt.split('').reverse().join('').search(/\d/) - 1 : 0;
        if (item.value === 0) {
            item.value = null;
            item.text = this.formatMask(item.value, item.mask);
            position = left;
        } else {
            item.value = this.parseText(text.slice(0, i) + text.slice(i + 1), item.value);
            item.text = this.formatMask(item.value, item.mask);
            position = fractional ? position - 1 : position + item.text.length - text.length;

        }


        return position;
    },

    getValue: function () {
        var itemTemplate = this.getItemTemplate();

        return itemTemplate.item.value;
    },

    /**
     * Возвращает позицию указывающую за последнюю цифку м строке
     * @param text
     * @returns {Number}
     */
    getIndexOfEndDigit: function (text) {
        var index = text.split('').reverse().join('').search(/\d/);
        return (index === -1) ? index : text.length - index;
    },

    /**
     * Переводит форматированное представление в числовое
     * @param text
     * @param {number} oldValue
     * @returns {number}
     */
    parseText: function (text, oldValue) {
        var itemTemplate = this.getItemTemplate();
        var item = itemTemplate.item;
        var mask = item.mask;

        var decimalSeparator = this.getDecimalSeparator();
        var decimalDigits = this.getDecimalDigits();
        var parts = text.split(decimalSeparator);
        var value;

        parts = parts.map(function (item, index) {
            var txt = item.replace(/[^\d]/g, '');
            return (index === 1) ? txt.substr(0, decimalDigits) : txt;
        });


        text = parts.join('.');

        if (text === '') {
            value = null;
        } else {
            value = +text;

            if (oldValue < 0) {
                value = -value;
            }

            if (/^p/.test(mask)) {
                value = value / 100;
            }
        }
        return value;
    },

    /**
     * Возвращает часть шаблона для ввода значения
     * @returns {*}
     */
    getItemTemplate: function () {
        var template = this.template;
        var item;
        var left = 0;
        var result = null;
        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') {
                left += item.length;
            } else {
                result = {
                    item: item,
                    left: left
                };
                break;
            }
        }

        return result;
    },

    /**
     * Проверка что маска была полностью заполнена
     */
    getIsComplete: function () {

        return true;
    }
});


/**
 * Билдер NumberEditMask
 * @constructor
 */
function NumberEditMaskBuilder () {
    this.build = function (builder, parent, metadata) {

        var editMask = new NumberEditMask();
        var formatMetadata = {
            "NumberFormat":{
                "Format": metadata.Mask
            }
        };

        editMask.mask = metadata.Mask;

        editMask.format = builder.buildType(parent, 'NumberFormat', {Format: metadata.Mask});

        return editMask;
    }
}
function RegexEditMask () {
    this.mask = null;
}

_.extend(RegexEditMask.prototype, editMaskMixin);

_.extend(RegexEditMask.prototype, {

    /**
     * Проверка что маска была полностью заполнена
     */
    getIsComplete: function (value) {
        var regExp;
        this.value = value;
        if (this.mask !== null) {
            regExp = new RegExp(this.mask);
            return regExp.test(value);
        }
        return false;
    }


});


/**
 * Билдер RegexEditMask
 * @constructor
 */
function RegexEditMaskBuilder () {

    this.build = function (builder, parent, metadata) {

        var editMask = new RegexEditMask();

        editMask.mask = metadata.Mask;

        return editMask;
    }

}
var TemplateMaskPartStrategy = (function () {

    var regexpAnyLetter = /^[a-zA-Zа-яА-ЯёЁ]$/;
    var regexpAnyNumber = /^\d$/;
    var regexpSign = /^[-+]$/;

    function isEmptyValue(value) {
        return typeof value === 'undefined' || value === '' || value === null;
    }


    return {
        //Используемые метасимволы маски ввода

        'c': {  //Необязательный ввод любого символа.
            required: false,    //Признак обязательности элемента маски ввода
            width: 1,   //Ширина для заполнителя маски ввода
            validator: function (value) {   //Проверка на допустимость значения для текущего метасимвола
                return true;
            },
            regexp: '.?'    //Регулярное выражение для выделения символа соответствующего метасимволу из общей строки значения
        },

        'C': {  //Обязательный ввод любого символа.
            required: true,
            width: 1,
            validator: function (value) {
                return !isEmptyValue(value);
            },
            regexp: '.'
        },

        'l': {  //Необязательный ввод буквы.
            required: false,
            width: 1,
            validator: function (value) {
                return isEmptyValue(value) || regexpAnyLetter.test(value);
            },
            regexp: '[a-zA-Zа-яА-ЯёЁ]?'
        },

        'L': {  //Обязательный ввод буквы.
            required: true,
            width: 1,
            validator: function (value) {
                return !isEmptyValue(value) && regexpAnyLetter.test(value);
            },
            regexp: '[a-zA-Zа-яА-ЯёЁ]'
        },

        'a': {  //Необязательный ввод буквы или цифры.
            required: false,
            width: 1,
            validator: function (value) {
                return isEmptyValue(value) || regexpAnyLetter.test(value) || regexpAnyNumber.test(value);
            },
            regexp: '[a-zA-Zа-яА-ЯёЁ0-9]?'
        },

        'A': {  //Обязательный ввод буквы или цифры.
            required: true,
            width: 1,
            validator: function (value) {
                return !isEmptyValue(value) && (regexpAnyLetter.test(value) || regexpAnyNumber.test(value));
            },
            regexp: '[a-zA-Zа-яА-ЯёЁ0-9]?'
        },

        '#': {  //Необязательный ввод цифры, знака "-" или "+".
            required: false,
            width: 1,
            validator: function (value) {
                return isEmptyValue(value) || regexpSign.test(value);
            },
            regexp: '[-+]?'
        },

        '9': {  //Необязательный ввод цифры.
            required: false,
            width: 1,
            validator: function (value) {
                return isEmptyValue(value) || regexpAnyNumber.test(value);
            },
            regexp: '[0-9]?'
        },

        '0': {  //Обязательный ввод цифры.
            required: true,
            width: 1,
            validator: function (value) {
                return !isEmptyValue(value) && regexpAnyNumber.test(value);
            },
            regexp: '[0-9]'
        }
    }

})();


var TemplateMaskPart = function (mask) {
    _.extend(this, TemplateMaskPartStrategy[mask]);

};

_.extend(TemplateMaskPart.prototype, {

    /**
     * Проверка символа на допустимость для метасимвола маски
     * @param {string} value
     * @returns {boolean}
     */
    validate: function (value) {
        return this.validator(value);
    },

    /**
     * Проверка на заполненность значения для метасимвола маски
     * @param {string} value
     * @returns {boolean}
     */
    getIsComplete: function (value) {
        return !this.required || (value !== '' && typeof value !== 'undefined' && value !== null);
    }

});



function TemplateEditMask () {
    this.mask = null;
    this.maskSaveLiteral = true;
    this.maskPlaceHolder = '_';
}

_.extend(TemplateEditMask.prototype, editMaskMixin);

_.extend(TemplateEditMask.prototype, {
    /**
     * @private
     * @description Построение объекта для форматирования значения
     * @param {string} [text] Значение
     * @returns {Array}
     */
    buildTemplate: function (text) {
        var template = [];
        var mask = this.mask;

        var i = 0, ln = mask.length, char, prevChar = '';

        while(i < mask.length) {
            char = mask.substr(i, 1);
            if (char === '\\') {
                char = mask.substr(i + 1, 1);

                if (typeof this.masks[char] !== 'undefined') {  //Экранипрованная маска
                    template.push(char);
                    mask = [mask.substring(0, i), mask.substr(i + 1)].join('');
                    i = i + 1;
                } else {
                    template.push('\\');
                }
                continue;
            }

            if (typeof this.masks[char] !== 'undefined') {
                    template.push({
                        mask: char,
                        text: "",
                        position: i
                    });
            } else {
                template.push(char);
            }
            i = i + 1;
        }
        this.template = template;
        this.setValue(text);
        return template;
    },

    /**
     * @private
     * @description Получение регулярного выражения для разбора значения согласно шаблона маски ввода
     * @returns {RegExp}
     */
    getRegExpForMask: function () {
        var i = 0;
        var ln = this.mask.length;
        var char, next;
        var result = [];
        var decorator = ['(', ')'];
        var r = /([\+\^\*\(\)\|\{\}\[\]\.])/; //Маска для экранирования спец символов

        var store = function (pattern, skip) {
            skip = !!skip;
            result.push(skip ? pattern : decorator.join(pattern));
        };

        while(i < ln) {
            char = this.mask.substr(i, 1);
            if (typeof this.masks[char] !== 'undefined') {
                //Метасимвол маски ввода
                store(this.masks[char].regexp);
            } else if (char === '\\') {
                next = this.mask.substr(i + 1, 1);
                if (typeof this.masks[next] !== 'undefined') {   //Экранированный метасимвол маски ввода
                    if (this.maskSaveLiteral) {
                        store(next, true);
                        i = i + 1;
                    }
                } else {
                    if (this.maskSaveLiteral) {
                        store('\\\\', true);
                    }
                }
            } else {    //Не экранирующий символ и не менасимвол
                if (this.maskSaveLiteral) {
                    store( r.test(char) ? char.replace(r, '\\$1') : char, true);
                }
            }
            i = i + 1;
        }

        return new RegExp('^' + result.join('') + '$');
    },

    /**
     * Установка значения
     * @param value
     */
    setValue: function (value) {

        if (value === null || typeof value === 'undefined') {
            value = '';
        }

        value = value + '';
        var regexp = this.getRegExpForMask();
        var parts;
        var part;
        var i, ln;
        var template;

        parts = (regexp.test(value)) ? value.match(regexp).slice(1) : [];

        for (i = 0, ln = this.template.length; i < ln; i = i + 1) {
            template = this.template[i];
            if (typeof template === 'string') continue;
            part = parts.shift();
            template.text = (typeof part === 'undefined') ? '' : part[0];
        }
    },

    /**
     * Получение введенного значения
     * @returns {string}
     */
    getValue: function () {
        var template = this.template;
        var result = [];
        var text;
        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            if (typeof template[i] === 'string' && this.maskSaveLiteral) {
                result.push(template[i]);
            } else {
                text = template[i].text;
                if (text !== null && text !== '' && typeof text !== 'undefined') {
                    result.push(text);
                }
            }
        }

        return result.join('');
    },

    moveToNextChar: function (position) {
        position = Math.max(position, 0);
        var template = this.template;

        var test = template.slice(position);

        var i, ln, index = null;

        var start = false;
        for (i = 0, ln = test.length; i < ln; i = i + 1) {
            if (typeof test[i] === 'string') {
                start = true;
                continue;
            }
            index = test[i].position - (start ? 1 : 0);
            break;
        }

        if (index === null) {
            test = template.slice(0, position);
            for (i = test.length - 1; i >= 0; i = i - 1) {
                if (typeof test[i] === 'string') {
                    continue;
                }
                index = test[i].position;
                break;
            }
        }

        return (index === null) ? 0 : index + 1;
    },

    moveToPrevChar: function (position) {
        position = Math.max(position, 0);
        var template = this.template;

        var test = template.slice(0, position);

        var i, ln, index = null;

        var end = false;
        for (i = test.length - 1; i >= 0; i = i - 1) {
            if (typeof test[i] === 'string'){
                end = true;
                continue;
            }
            index = test[i].position + (end ? 1 : 0);
            break;
        }

        if (index === null) {
            test = template.slice(position);
            for (i = 0, ln = test.length; i < ln; i = i + 1) {
                if (typeof test[i] === 'string') continue;
                index = test[i].position;
                break;
            }
        }

        return (index === null) ? 0 : index;
    },

    /**
     * @private
     * @description Получить элемент шаблона в заданной позиции
     * @param {Integer} position
     * @returns {*}
     */
    getItemTemplate: function (position) {
        var template = this.template;
        var item;
        var left = 0;
        var width;
        var index;
        var result = null;
        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            item = template[i];
            if (typeof item === 'string') {
                left += item.length;
            } else {
                width = Math.max(this.masks[item.mask].width, item.text.length);
                if (position < left || position >= left && position <= left + width) {
                    index = position - left;
                    result = {
                        item: item,
                        left: left,
                        width: width,
                        index: position - left
                    };
                    break;
                }
                left += width;
            }
        }
        return result;
    },

    deleteCharRight: function (position) {
        var template;
        var i, ln;
        var left;

        var selection = window.getSelection().toString();

        if (selection) {
            this.selectRemove(this.template, position, selection);
        }else{
            for (i = 0, ln = this.template.length; i < ln; i = i + 1) {
                template = this.template[i];

                if (typeof template === 'string' || template.position < position) {
                    continue;
                }
                position = template.position + 1; // Перенос каретки на 1 символ вправо для корректной работы DEL
                template.text = '';
                break;
            }
        }
        return position;
    },

    deleteCharLeft: function (position) {
        var template;
        var i, ln;
        var left;

        var selection = window.getSelection().toString();

        if (selection) {
            this.selectRemove(this.template, position, selection);
        }else {
            for (i = this.template.length - 1; i >= 0; i = i - 1) {
                template = this.template[i];

                if (typeof template === 'string' || template.position >= position) {
                    continue;
                }
                position = template.position;
                template.text = '';
                break;
            }
        }
        return position;
    },

    /**
     * Удаление выделенного текста
     * @param template
     * @param position
     * @param selection
     */
    selectRemove: function(template, position, selection){
        var firstItem = this.getItemTemplate(position);
        var lastItem = this.getItemTemplate(position + selection.length);

        var firstIndexItem = template.indexOf(firstItem.item);
        var lastIndexItem = template.indexOf(lastItem.item);

        for (var i = firstIndexItem; i < lastIndexItem + 1; i++) {
            if (typeof template[i] == "object") {
                if (firstIndexItem == lastIndexItem) {
                    build(template[i], position, selection);
                } else if (i == firstIndexItem) {
                    build(template[i], position, selection);
                } else if (i == lastIndexItem) {
                    build(template[i], position, selection);
                } else {
                    template[i].text = '';
                }
            }
        }

        function build(templateText, position, selection) {
            var arraySymbols = templateText.text.split('');
            var start = position - templateText.position;
            var end = (position + selection.length) - templateText.position;

            if (start < 0) start = 0;
            arraySymbols.splice(start, end - start);

            templateText.text = arraySymbols.join('');
            return templateText;
        }
    },

    /**
     * Вставка в маску
     * @param clipboardText
     * @param position
     */
    pasteStringToMask: function(clipboardText, position){
        clipboardText = clipboardText.replace(/\D/gi, '');

        var arraySymbols = clipboardText.split('');

        var firstItem = this.getItemTemplate(position);
        var firstIndexItem = this.template.indexOf(firstItem.item), lastIndexItem = 0;

        var lastItem = getLastTemplate(this.template);
        if(lastItem) {
            lastIndexItem = this.template.indexOf(lastItem);
        }else{
            lastIndexItem = firstIndexItem;
        }

        var tLength = 0, maxLength = 0;

        for(var i = firstIndexItem; i < lastIndexItem+1; i++) {
            if (typeof this.template[i] == "object") {
                if (i == firstIndexItem) {
                    maxLength = maxTemplateLength(this.template[i]);
                    tLength = maxLength - (position-this.template[i].position);

                    var first = this.template[i].text.slice(0, position - this.template[i].position);

                    //TODO: вставка 0, если предыдущих значений нет
//                    var zero = '';
//                    if(!first) {
//                        for (var d = 0; d < position - this.template[i].position; d++) {
//                            zero = zero + '0';
//                        }
//                    }

                    this.template[i].text = first + clipboardText.slice(0, tLength);
                    arraySymbols.splice(0, tLength)
                }else{
                    if(i != lastIndexItem){
                        maxLength = maxTemplateLength(this.template[i]);

                        this.template[i].text = arraySymbols.join('').slice(0, maxLength);
                        arraySymbols.splice(0, maxLength);
                    }else{
                        maxLength = maxTemplateLength(this.template[i]);

                        if(arraySymbols.length > maxLength) arraySymbols.splice(maxLength, arraySymbols.length);
                        this.template[i].text = arraySymbols.join('') + this.template[i].text.slice(arraySymbols.length, maxLength);
                    }
                }
            }
        }

        function maxTemplateLength(template){
            return Math.max(template.mask.length, template.text.length)
        }

        function getLastTemplate(template) {
            var dotLength = 0;
            var arr = [];
            for (var i = firstIndexItem; i < template.length; i++) {
                if (typeof template[i] == "object") {
                    if (clipboardText.length > template[i].position - dotLength - position) {
                        arr.push(template[i]);
                    }
                } else {
                    dotLength = dotLength + template[i].length;
                }
            }
            return arr[arr.length-1];
        }
    },

    clearText: function (position, len) {
        var tmpl;
        var startFrom;

        for (var i = 0, ln = this.template.length; i < ln; i = i + 1) {
            tmpl = this.template[i];

            if (typeof tmpl === 'string') {
                continue;
            }

            if (tmpl.position >= position && tmpl.position < position + len) {
                if (typeof startFrom === 'undefined') {
                    startFrom = tmpl.position;
                }
                tmpl.text = '';
            }
        }

        return startFrom;
    },

    /**
     * Обработка нажатия символа в указанной позиции
     * @param char
     * @param position
     */
    setCharAt: function (char, position, len) {
        var template;
        var mask;
        var text;

        if (typeof len === 'undefined') {
            len = 0;
        }

        if (len > 0) {
            this.clearText(position, len);
        }

        for (var i = 0, ln = this.template.length; i < ln; i = i + 1) {
            template = this.template[i];
            if (typeof template === 'string') { //Статический текст
                continue;
            }
            if (template.position === position) {    //Маска ввода
                mask = this.masks[template.mask];
                text = char.substr(0,1);
                if (mask.validate(text)) {
                    template.text = text;
                    position = this.getNextItemMask(position);
                }
                break;
            }
            if (template.position > position) {
                break;
            }
        }
        return position;
    },

    deleteSelectedText: function(position, len, char){
        var startFrom = this.clearText(position, len);

        if (typeof char !== 'undefined') {
            startFrom = this.setCharAt(char, position);
        }

        return {
            position: startFrom,
            result: this.getText()
        };
    },

    getNextItemMask: function (position) {
        var template;
        var i, ln;
        var last;
        var index;

        for (i = this.template.length - 1; i >= 0; i = i - 1) {
            template = this.template[i];
            if (typeof template === 'string') {
                continue;
            }
            if (template.position <= position) {
                position = typeof last === 'undefined' ? this.moveToNextChar(position) : last;
                break;
            }
            last = template.position;
        }

        return position;
    },

    getText: function () {
        var template = this.template;
        var result = [];
        var text;

        for (var i = 0, ln = template.length; i < ln; i = i + 1) {
            if (typeof template[i] === 'string') {
                result.push(this.parseSpecialChars(template[i]));
            } else {
                text = template[i].text;
                if (typeof text === 'undefined' || text === '' || text === null) {
                    result.push(this.maskPlaceHolder);
                } else {
                    result.push(text);
                }
            }
        }
        return result.join('');
    },

    /**
     * Проверка что маска была полностью заполнена
     * @returns {boolean}
     */
    getIsComplete: function () {
        var i, ln;
        var template;
        var mask;
        var complete = true;

        for (i = 0, ln = this.template.length; i < ln; i = i + 1) {
            template = this.template[i];
            if (typeof template === 'string') {
                continue;
            }
            mask = this.masks[template.mask];
            complete = mask.getIsComplete(template.text);
            if (!complete) {
                break;
            }
        }

        return complete;
    },

    /**
     * Установка начального значения
     * @param value
     */
    reset: function (value) {
        this.value = null;

        if (typeof value !== 'undefined' && value !== null) {
            this.value = value;
        }

        this.buildTemplate(value);
    },

    /**
     * @private
     * @description Трансляция специальных символом в шаблоне маски ввода в соотвествующие установленной локали
     * @param {string} text
     * @returns {string}
     */
    parseSpecialChars: function (text) {
        var localization = InfinniUI.localizations[InfinniUI.config.lang];
        var map = {
            '/': localization.dateTimeFormatInfo.dateSeparator,
            ':': localization.dateTimeFormatInfo.timeSeparator,
            '%': localization.numberFormatInfo.percentSymbol,
            '$': localization.numberFormatInfo.currencySymbol
        };

        var i, ln, data = [];

        for (var char in map) {
            if (!map.hasOwnProperty(char)) {
                continue;
            }

            data = text.split('');
            for (i = 0, ln = data.length; i < ln; i = i + 1) {
                if (data[i] === char) {
                    data[i] = map[char];
                }
            }

            text = data.join('');
        }

        return text;
    },

    masks: {
        'c': new TemplateMaskPart('c'),
        'C': new TemplateMaskPart('C'),
        'l': new TemplateMaskPart('l'),
        'L': new TemplateMaskPart('L'),
        'a': new TemplateMaskPart('a'),
        'A': new TemplateMaskPart('A'),
        '#': new TemplateMaskPart('#'),
        '9': new TemplateMaskPart('9'),
        '0': new TemplateMaskPart('0')
    }

});

/**
 * Билдер TemplateEditMask
 * @constructor
 */
function TemplateEditMaskBuilder () {
    this.build = function (builder, parent, metadata) {

        var editMask = new TemplateEditMask();

        if (typeof metadata.Mask !== 'undefined') {
            editMask.mask = metadata.Mask;
        }
        if (typeof metadata.MaskSaveLiteral !== 'undefined') {
            editMask.maskSaveLiteral = metadata.MaskSaveLiteral;
        }

        if (typeof metadata.MaskPlaceHolder !== 'undefined') {
            editMask.maskPlaceHolder = metadata.MaskPlaceHolder;
        }



        return editMask;
    }
}
function ChildViewBuilder() {
    this.build = function (context, parent, metadata) {
        var linkView = parent.getChildView(metadata.Name);
        linkView.setOpenMode(metadata.OpenMode);
        linkView.setContainer(metadata.Container);
        if (['Application', 'Page', 'Dialog'].indexOf(metadata.OpenMode) > -1) {
            InfinniUI.views.appendView(null, metadata, linkView);
        }

        return linkView;
    };
}
function InlineViewBuilder() {
    this.build = function (context, parent, metadata) {
        var that = this;

        var linkView = new LinkView(parent, function (resultCallback) {
            var params = that.buildParameters(parent, metadata.Parameters, context);
            var view = context.buildType(parent, 'View', metadata.View, undefined, params);

            if (['Application', 'Page', 'Dialog'].indexOf(metadata.OpenMode) > -1) {
                InfinniUI.views.appendView(null, metadata.View, view);
            }
            resultCallback(view);
        });
        linkView.setOpenMode(metadata.OpenMode);
        linkView.setContainer(metadata.Container);
        return linkView;
    };

   this.buildParameters = function(parentView, parametersMetadata, builder){
       var result = {},
           param;

       if (typeof parametersMetadata !== 'undefined' && parametersMetadata !== null) {
           for (var i = 0; i < parametersMetadata.length; i++) {
               if (parametersMetadata[i].Value !== undefined) {
                   param = builder.buildType(parentView, 'Parameter', parametersMetadata[i])
                   result[param.getName()] = param;
               }
           }
       }
       return result;
   };
}
function LinkView(parentView, viewFactory) {
    this.openMode = 'Page';
    this.parentView = parentView;
    this.viewFactory = viewFactory;
}

LinkView.prototype.setOpenMode = function (mode) {
    if (_.isEmpty(mode)) return;
    this.openMode = mode;
};

LinkView.prototype.getOpenMode = function () {
    return this.openMode;
};

LinkView.prototype.getContainer = function () {
    //return _.isEmpty(this.container) ? 'MainContainer' : this.container;
    return this.container;
};

LinkView.prototype.setContainer = function (container) {
    this.container = container;
};

LinkView.prototype.template = {
    Dialog: InfinniUI.Template["linkView/template/dialog.tpl.html"]
};

LinkView.prototype.createView = function (resultCallback) {

    var openMode = InfinniUI.global.openMode;
    var openModeStrategy = openMode.getStrategy(this);

    this.viewFactory(function (view) {
        view.onOpening(function ($elView) {
            view.onClosed(function () {
                $elView.remove();
                messageBus.getExchange('global')
                    .send(messageTypes.onViewClosed, {view: view});
            });

            openModeStrategy.open(view, $elView);
            view.getExchange().send(messageTypes.onLoading, {});
        });

        resultCallback(view);
    });

};

function MetadataViewBuilder() {

    this.build = function (builder, parent, metadata) {

        if (metadata.OpenMode === 'Container' && metadata.Container === 'Content') {
            metadata.OpenMode = 'Page';
        }

        var linkView = new LinkView(parent, function (resultCallback) {
            if(parent.handleOnLoaded){
                parent.handleOnLoaded(function(){
                    createView(builder, parent, metadata, resultCallback);
                });
            }else{
                createView(builder, parent, metadata, resultCallback);
            }
        });
        linkView.setOpenMode(metadata.OpenMode);
        linkView.setContainer(metadata.Container);
        return linkView;
    };


    var createView = function (builder, parent, metadata, resultCallback) {
        var params = buildParameters(parent, metadata.Parameters, builder);

        window.providerRegister.build('MetadataDataSource', metadata).getViewMetadata(function (viewMetadata) {
            if (viewMetadata !== null) {

                // Ваша платформа - говно
                for (var key in viewMetadata.RequestParameters) {
                    var param = viewMetadata.RequestParameters[key];
                    if (metadata.Parameters[param.Name] != param.Value) {
                        //debugger;
                        param.Value = metadata.Parameters[param.Name];
                    }
                }

                var view = builder.buildType(parent, "View", viewMetadata, undefined, params);

                if (['Application', 'Page', 'Dialog'].indexOf(metadata.OpenMode) > -1) {
                    InfinniUI.views.appendView(metadata, viewMetadata, view);
                }

                resultCallback(view);
            } else {
                throw stringUtils.format('view metadata for {0} not found.', [metadata]);
            }
        });
    };

    var buildParameters = function(parentView, parametersMetadata, builder){
        var result = {},
            param;

        if (typeof parametersMetadata !== 'undefined' && parametersMetadata !== null) {
            for (var i = 0; i < parametersMetadata.length; i++) {
                if (parametersMetadata[i].Value !== undefined) {
                    param = builder.buildType(parentView, 'Parameter', parametersMetadata[i])
                    result[param.getName()] = param;
                }
            }
        }
        return result;
    };
}
var OpenMode = function () {

    var applications = [];
    var pages = [];

    this.getStrategy = function (linkView) {
        var openMode = linkView.openMode;

        var openModeStrategy = {
            Application: OpenModeApplicationStrategy,
            Container: OpenModeContainerStrategy,
            Page: OpenModePageStrategy,
            Dialog: OpenModeDialogStrategy
        };

        if (typeof openModeStrategy[openMode] === 'undefined') {
            throw new Error("Несуществующий OpenMode: " + openMode);
        }

        return new openModeStrategy[openMode](linkView);
    };

    this.getRootContainer = function () {
        return launcherConfig.$rootContainer || $('body');
    };

    this.resolveContainer = function (list, callback) {
        var name, layout;
        _.find(list, function (i) {
            if (_.isEmpty(i)) return false;
            name = i;
            layout = layoutPanelRegistry.getLayoutPanel(name);
            return !_.isEmpty(layout);
        });

        callback(name, layout);
    };

    this.registerPage = function (applicationView, view, openMethod) {
        pages.push({
            applicationView: applicationView,
            view: view,
            openMethod: openMethod
        });
    };

    this.registerApplication = function (applicationView, openMethod) {
        applications.push({
            applicationView: applicationView,
            openMethod: openMethod
        });
    };

    this.getApplicationViews = function () {
        return _.pluck(applications, 'view');
    };

    this.closeApplicationView = function (applicationView) {
        var i = _.findIndex(applications, function (app) {
            return app.applicationView === applicationView;
        });

        if (i !== -1) {
            applications.splice(i, 1);
        }

        //Получаем следущее доступное приложение
        var ln = applications.length;
        if (ln > 0) {
            var next = (i < ln) ? applications[i] : applications[ln - 1];
            return next.applicationView;
        }
    };

    this.closePageView = function (view) {
        var applicationView;
        var next;
        var i, ln;

        for (i = 0, ln = pages.length; i < ln; i = i + 1) {
            if (pages[i].view === view) {
                var data = pages.splice(i,1).pop();
                applicationView = data.applicationView;
                break;
            }
        }

        if (applicationView) {
            for (i = 0, ln = pages.length; i < ln; i = i + 1) {
                if (pages[i].applicationView === applicationView) {
                    next = pages[i].view;
                    break;
                }
            }
        }
        return next;
    };

    this.getApplication = function (applicationView) {
        return _.findWhere(applications, {applicationView: applicationView});
    };

    this.getPageViews = function (applicationView) {
        return _.chain(pages)
            .filter(function (data) {
                return data.applicationView === applicationView;
            })
            .pluck('view')
            .value();
    };

};

InfinniUI.global.openMode = new OpenMode();

var OpenModeApplicationStrategy = function (linkView) {

    var openMode = InfinniUI.global.openMode;

    var containerName;
    var layoutPanel;

    openMode.resolveContainer(['MainContainer'], function (name, layout) {
        containerName = name;
        layoutPanel = layout;
    });

    this.open = function (view, $elView) {

        view.isApplication(true);//Отмечаем представление как приложение

        view.onClosing(function () {
            //@TODO Закрыть все представления данного приложения
        });

        var openView = function () {
            if (_.isEmpty(layoutPanel)) {   //Показать в корневом контейнере системы
                var $rootContainer = openMode.getRootContainer();
                $rootContainer.empty();
                $rootContainer.append($elView);
                $rootContainer.data('view', view);
            }

            messageBus.getExchange('global')
                .send(messageTypes.onViewOpened, {
                    source: linkView,
                    view: view,
                    $view: $elView,
                    container: _.isEmpty(layoutPanel) ? undefined : containerName,
                    openMode: 'Application'
                });

        };

        openMode.registerApplication(view, openView);
        subscribe(view);
        openView();
    };

    var subscribe = function (view) {
        var exchange = messageBus.getExchange('global');

        view.onClosing(function () {
            //Запросить закрытие всех представлений приложения, открытых в режиме Page и затем закрыть Application
            var pages = openMode.getPageViews(view);
            _.forEach(pages, function (page) {
                exchange.send(messageTypes.onViewClosing, {source: this, view: page});
            });
            //console.log(pages);
            //return false;
        });

        //exchange.subscribe(messageTypes.onViewClosing, function (message) {
        //    if (message.view !== view) {
        //        return;
        //    }
        //
        //    //Обработчик запроса на закрытие представления
        //    //Запросить закрытие всех представлений приложения, открытых в режиме Page и затем закрыть Application
        //
        //    view.close();
        //});

        exchange.subscribe(messageTypes.onViewClosed, function (message) {
            //Удалить приложение из списка приложений
            if (message.view !== view) {
                return;
            }

            var nextApplicationView = openMode.closeApplicationView(message.view);
            if (nextApplicationView) {
                //Активировать следущее открытое приложение
                exchange.send(messageTypes.onShowView, {
                    source: message.source,
                    view: nextApplicationView
                });
            }
        });

        exchange.subscribe(messageTypes.onShowView, function (message) {
            //Обработчик события для отображения приложения
            if (view !== message.view) {
                return;
            }

            var application = openMode.getApplication(message.view);

            if (typeof application !== 'undefined') {
                application.openMethod();
            }
        });
    };

};

var OpenModeContainerStrategy = function (linkView) {

    var openMode = InfinniUI.global.openMode;

    var containerName,
        layoutPanel;

    openMode.resolveContainer([linkView.getContainer(), 'MainContainer'], function (name, layout) {
        containerName = name;
        layoutPanel = layout;
    });

    this.open = function (view, $elView) {

        if (_.isEmpty(layoutPanel)) {//Отобразить в корневом контейнере
            var $rootContainer = openMode.getRootContainer();
            var oldView = $rootContainer.data('view');
            if (typeof oldView !== 'undefined' && oldView !== null) {
                oldView.close();
            }
            $rootContainer.empty();
            $rootContainer.append($elView);
            $rootContainer.data('view', view);
        } else {//Есть элемент с указанным именем
            messageBus.getExchange('global')
                .send(messageTypes.onViewOpened, {
                    source: linkView,
                    view: view,
                    $view: $elView,
                    container: containerName,
                    openMode: "Container"
                });
        }
    };

    var subscribe = function (view) {
        var exchange = messageBus.getExchange('global');

        exchange.subscribe(messageTypes.onViewClosing, function (message) {
            if (message.view !== view) {
                return;
            }
            view.close();
        });
    };
};
var OpenModeDialogStrategy = function (linkView) {

    this.open = function (view, $elView) {
        var $modal = $(linkView.template.Dialog())
            .appendTo($('body'));

        $elView.find('.pl-stack-panel-i').css('height', 'auto');
        var $container = $modal.find('.modal-body');

        $container.append($elView);
        $modal.modal({
            show: true,
            backdrop: 'static',
            modalOverflow: true
        });

        //FOCUS IN MODAL WITHOUT FALL
            $container.append('<div class="lastfocuselementinmodal" tabindex="0">');
            $modal.find('.lastfocuselementinmodal').on('focusin', function(){
                $modal.find('.firstfocuselementinmodal').focus();
            });
            $modal.keydown(function(e){
                if($(this).find('.lastfocuselementinmodal').is(":focus") && (e.which || e.keyCode) == 9){
                    e.preventDefault();
                    $(this).find('.firstfocuselementinmodal').focus();
                }
            });
        //

        var preventClosingViewHandler = function(e){
            /** Плагин DatePicker генерируют события hide в DOM!! **/
            var $target = $(e.target);
            if ($target.hasClass('date') || $target.hasClass('datetime')) {
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();

            view.close();
            return false;
        };

        $modal.on('hide.bs.modal', preventClosingViewHandler);

        $modal.on('hidden', function (obj) {
            obj.target.remove();
            $("#select2-drop-mask").click();
        });

        view.onClosed(function () {
            $modal.off('hide.bs.modal', preventClosingViewHandler);
            $modal.modal('hide');
        });

        $modal.find('h3').html(view.getText());
        view.onTextChange(function(){
            $modal.find('h3').html(view.getText());
        });
    }
};

var OpenModePageStrategy = function (linkView) {

    var openMode = InfinniUI.global.openMode;

    var containerName,
        layoutPanel;

    openMode.resolveContainer([linkView.getContainer(), 'MainContainer'], function (name, layout) {
        containerName = name;
        layoutPanel = layout;
    });

    var parentView = linkView.parentView;

    this.open = function (view, $elView) {

        var applicationView = parentView.getApplicationView();

        if (typeof applicationView === 'undefined' || applicationView === null) {
            throw new Error('Для открытия представления в режиме Page не найдено приложение');
        }

        var openView = function () {
            if (_.isEmpty(layoutPanel)) {   //Показать в корневом контейнере системы
                var $rootContainer = openMode.getRootContainer();
                $rootContainer.empty();
                $rootContainer.append($elView);
                $rootContainer.data('view', view);
            }

            messageBus.getExchange('global')
                .send(messageTypes.onViewOpened, {
                    source: linkView,
                    view: view,
                    $view: $elView,
                    container: _.isEmpty(layoutPanel) ? undefined : containerName,
                    openMode: 'Page',
                    applicationView: applicationView
                });
        };

        openMode.registerPage(applicationView, view, openView);

        subscribe(view);
        openView();
    };

    var subscribe = function (view) {
        var exchange = messageBus.getExchange('global');

        exchange.subscribe(messageTypes.onViewClosing, function (message) {
            //Обработчик запроса на закрытие представления
            if (message.view === view) {
                return view.close();
            }
        });

        exchange.subscribe(messageTypes.onViewClosed, function (message) {
            if (view !== message.view) {
                return;
            }

            var nextView = openMode.closePageView(message.view);

            ////Активировать следущую страницу приложения
            //if (nextView) {
            //    exchange.send(messageTypes.onShowView, {source: message.source, view: nextView});
            //}
        });

        exchange.subscribe(messageTypes.onShowView, function (message) {
            //Обработчик события для отображения страницы приложения приложения
            if (view !== message.view) {
                return;
            }
            var page = _.findWhere(pages, {view: message.view});

            if (typeof page !== 'undefined') {
                page.openMethod();
            }
        });
    };

};

function Culture(name){
    this.name = name;
    this.caption = InfinniUI.localizations[name].caption;
    this.dateTimeFormatInfo = InfinniUI.localizations[name].dateTimeFormatInfo;
    this.numberFormatInfo = InfinniUI.localizations[name].numberFormatInfo;
}
InfinniUI.localizations['ru-RU'].dateTimeFormatInfo = {
    monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
    abbreviatedMonthNames: ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
    dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
    abbreviatedDayNames: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
    dateSeparator: '.',
    timeSeparator: ':',
    amDesignator: '',
    pmDesignator: ''
};

InfinniUI.localizations['en-US'].dateTimeFormatInfo = {
    monthNames: [ "January","February","March","April","May","June","July","August","September","October","November","December" ],
    abbreviatedMonthNames: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    dayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    abbreviatedDayNames: ["Sun", "Mon","Tue","Wed","Thu","Fri","Sat"],
    dateSeparator: '/',
    timeSeparator: ':',
    amDesignator: 'AM',
    pmDesignator: 'PM'
};
var localized = InfinniUI.localizations [InfinniUI.config.lang];
InfinniUI.localizations['ru-RU'].numberFormatInfo = {
    numberDecimalDigits: 2,
    numberDecimalSeparator: ',',
    numberGroupSeparator: ' ',
    numberNegativePattern: '-n',
    numberPositivePattern: 'n',

    percentDecimalDigits: 2,
    percentDecimalSeparator: ',',
    percentGroupSeparator: ' ',
    percentSymbol: '%',
    percentNegativePattern: '-p%',
    percentPositivePattern: 'p%',

    currencyDecimalDigits: 2,
    currencyDecimalSeparator: ',',
    currencyGroupSeparator: ' ',
    currencySymbol: 'р.',
    currencyNegativePattern: '-c$',
    currencyPositivePattern: 'c$',

    negativeInfinitySymbol: '-бесконечность',
    positiveInfinitySymbol: 'бесконечность',
    NaNSymbol: 'NaN'
};

InfinniUI.localizations['en-US'].numberFormatInfo = {
    numberDecimalDigits: 2,
    numberDecimalSeparator: '.',
    numberGroupSeparator: ',',
    numberNegativePattern: '-n',
    numberPositivePattern: 'n',

    percentDecimalDigits: 2,
    percentDecimalSeparator: '.',
    percentGroupSeparator: ',',
    percentSymbol: '%',
    percentNegativePattern: '-p %',
    percentPositivePattern: 'p %',

    currencyDecimalDigits: 2,
    currencyDecimalSeparator: '.',
    currencyGroupSeparator: ',',
    currencySymbol: '$',
    currencyNegativePattern: '($c)',
    currencyPositivePattern: '$c',

    negativeInfinitySymbol: '-Infinity',
    positiveInfinitySymbol: 'Infinity',
    NaNSymbol: 'NaN'
};
InfinniUI.localizations['ru-RU'].patternDateFormats = {
    f: 'dd MMMM yyyy г. HH:mm',
    F: 'dd MMMM yyyy г. HH:mm:ss',

    g: 'dd.MM.yyyy HH:mm',
    G: 'dd.MM.yyyy HH:mm:ss',

    d: 'dd.MM.yyyy',
    D: 'dd MMMM yyyy г.',

    t: 'H:mm',
    T: 'H:%m:%s',

    y: 'MMMM yyyy', Y: 'MMMM yyyy',
    m: 'MMMM yy', M: 'MMMM yy',

    s: 'yyyy-MM-ddTHH:mm:ss',
    u: 'yyyy-MM-dd HH:mm:ssZ'
};

InfinniUI.localizations['en-US'].patternDateFormats = {
    f: 'dddd, MMMM dd, yyyy h:%m tt',
    F: 'dddd, MMMM dd, yyyy h:%m:%s tt',

    g: 'M/%d/yyyy h:%m tt',
    G: 'M/%d/yyyy h:%m:%s tt',

    d: 'M/%d/yyyy',
    D: 'dddd, MMMM dd, yyyy',

    t: 'h:%m tt',
    T: 'h:%m:%s tt',

    y: 'MMMM, yyyy', Y: 'MMMM, yyyy',
    m: 'MMMM yy', M: 'MMMM yy',

    s: 'yyyy-MM-ddTHH:mm:ss',
    u: 'yyyy-MM-dd HH:mm:ssZ'
};
/**
 *
 * @constructor
 */
function Script(body, name) {
    this.body = body;
    this.name = name;
}
/**
 *
 * @type {{collection: {}, addToCollection: addToCollection, run: run}}
 */
Script.prototype.run = function(context, args){
    var method = new Function('context', 'args', this.body);
    var result;

    try {
        result = method(context, args);
    } catch (err) {
        console.groupCollapsed('%2$s: %1$c%3$s', 'color: #ff0000', this.name, err.message);
        console.error(this.body);
        console.groupEnd();
        alert(this.name + "\r\n" + err.message  + "\r\n" + this.body);
    }
    return result;
};
/**
 *
 * @constructor
 */
function ScriptBuilder() {}

_.extend( ScriptBuilder.prototype, {
    build: function (metadata) {
        return new Script(metadata.Body, metadata.Name);
    }
});


function ScriptExecutor(parent) {

    this.executeScript = function(scriptName,args ) {

        var context = parent.getContext();
        var result;

        var scriptCompiled = parent.getScript(scriptName);

        if(context && scriptCompiled){

            result = scriptCompiled.run(context,args);
        }

        return result;
    }
}
function Banner() {

    var template = '' +
        '<div class="row" style="margin-left: 0">' +
        '<div class="note note-success col-md-8" style="height: 120px">' +
        '   <div class="col-md-6">' +
        '       <h1 class="block">{{lastName}} {{firstName}} {{middleName}}</h1>' +
        '       <p>Место работы: [ООО "Инфиннити"]</p>' +
        '   </div>' +
        '   <div class="col-md-6">' +
        '       <p>СНИЛС: {{snils}}</p>' +
        '       <p>ОМС: [740045600456554008]</p>' +
        '   </div>' +
        '</div>' +
        '<div class="note note-success col-md-4" style="height: 120px">' +
        '   <p style="vertical-align: top"><i style="font-size: 23px" class="fa fa-ambulance"></i> Привезли на скорой</p>' +
        '   <p style="vertical-align: top"><i style="font-size: 23px" class="fa fa-wheelchair"></i> Инвалид I группы</p>' +
        '   <p style="vertical-align: top"><i style="font-size: 23px" class="fa fa-stethoscope"></i> Сильно кашляет</p>' +
        '</div>' +
        '</div>';

    var ractive = null;

    var updatePanel = function (patient) {
        if (patient) {
            ractive.set({
                lastName: patient.Personal.LastName,
                firstName: patient.Personal.FirstName,
                middleName: patient.Personal.MiddleName,
                snils: patient.Snils
            });
        }
    };

    this.render = function (target, parameters, context) {
        ractive = new Ractive({
            el: target,
            template: template,
            data: {
                lastName: "",
                firstName: "",
                middleName: ""
            }
        });

        var ds = parameters['Patient'];
        if (ds) {
            ds.onValueChanged(updatePanel);
        }
        else {
            if(context.Parameters['Patient']) {
                updatePanel(context.Parameters['Patient'].getValue());
            }
        }
    }
}
function BedStatus() {
    var signalR = $.hubConnection('http://IC:9900'),
        hub = signalR.createHubProxy('WebClientNotificationHub');

    var self = this,
        $tar = null;

    hub.on('BedStatus', function (a) {
        self.render($tar);
    });

    signalR.start().done(function () {
        console.log('Now connected, connection ID=' + signalR.id);
    });

    this.render = function (target) {
        if ($tar == null) {
            $tar = target;
        }

        target.empty();

        var data = {
            id: null,
            changesObject: {
                Configuration: 'EmergencyRoom',
                Register: 'BedStatusIncremental',
                FromDate: moment('2014-10-01'),
                ToDate: moment('2014-10-30'),
                Interval: 'day',
                Dimensions: ['Bed']
            },
            replace: false
        };

        $.ajax({
            type: 'post',
            url: 'http://IC:9900/SystemConfig/StandardApi/metadata/GetRegisterValuesByPeriods',
            data: JSON.stringify(data)
        }).then(function (records) {
            var added = [];

            for (var r in records) {
                var rec = records[r],
                    bedNumber = rec.Bed;

                if (added.indexOf(bedNumber) == -1) {
                    added.push(bedNumber);
                    var $row = $('<tr>').appendTo($table);
                    $row.append($('<td>').html('Койка № ' + rec.Bed));

                    for (var i = 1; i <= 30; i++) {
                        var find = function (re) {
                            return re.Bed == bedNumber && moment(re.DocumentDate).format('D') == i;
                        };

                        var $td = $('<td>').appendTo($row);
                        var entry = _.find(records, find);

                        if (entry) {
                            if (entry.Availability == 1) {
                                $td.addClass('bg-blue-madison');
                            } else if (entry.Availability > 1) {
                                $td.addClass('bg-red-pink');
                            }
                        }
                    }
                }
            }
        });

        var $table = $('<table>').addClass('table table-bordered'),
            $tr = $('<tr>').appendTo($table);

        $tr.append($('<th>'));

        for (var i = 1; i <= 30; i++) {
            $tr.append($('<th>').html(i));
        }

        target.html($table);
    }
}
function Calendar(){

    var OperationMode = "Operations";
    var ClassicMode = "Classic";
    var QueueMode = "Queue";

    var types =  [
        {
            "Id": 1,
            "DisplayName": "К врачу"
        },
        {
            "Id": 2,
            "DisplayName": "На услугу"
        }
    ];

    var MedicalWorkerResourcesTypeId = "1";
    var ApparatusResourcesTypeId = "2";
    var CabinetResourcesTypeId = "3";

    var resourceTypes = [

        {
            "Id": "1",
            "DisplayName": "Врачи"
        },
        {
            "Id": "2",
            "DisplayName": "Аппараты"
        },
        {
            "Id": "3",
            "DisplayName": "Кабинеты"
        }
    ];

    var startDatePicker = null;
    var rootNode = $('<div class="calendar">');

    var viewContext = null;
    var lastData =[];
    var appointments = [];

    var selectedService = null;
    var selectedSchedule = null;
    var lastDate = null;
    var appointmentDocument = null;

    var mode = null;

    this.render = function(target, parameters, context){

        target.append(rootNode);

        mode = parameters['Mode'].getValue();

        viewContext = context;

        startDatePicker = context.Controls['StartDatePicker'];

        startDatePicker.onValueChanged(function(){

            fullCalendar(rootNode, lastData);
        });

        if(mode == OperationMode || mode == QueueMode)
            appointmentDocument = 'OperationAppointment';
        else if(mode == ClassicMode)
            appointmentDocument = 'Appointment';

        if(viewContext.DataSources['SelectedServiceDataSource'])
            viewContext.DataSources['SelectedServiceDataSource'].onSelectedItemChanged(function(){

                selectedService = viewContext.DataSources['SelectedServiceDataSource'].getSelectedItem();

                fullCalendar(rootNode, lastData);
            });

        if(viewContext.DataSources['PatientDataSource'])
            viewContext.DataSources['PatientDataSource'].onSelectedItemChanged(function(){

                var selectedPatient = viewContext.DataSources['PatientDataSource'].getSelectedItem();
                viewContext.Controls['PatientComboBox'].setValue(selectedPatient);
            });

        if(viewContext.Controls['ResourceTypeComboBox'])
            viewContext.Controls['ResourceTypeComboBox'].onValueChanged(function(){

                fullCalendar(rootNode, lastData);
            });

        if(mode == OperationMode){

            viewContext.Controls['ServiceComboBox'].onValueChanged(function(){

                var service = viewContext.Controls['ServiceComboBox'].getValue();
                if(!viewContext.Controls['CalendarPanel'].getVisible())
                    viewContext.Controls['CalendarPanel'].setVisible(service !== null && service !== undefined );
            });

            viewContext.Controls['DepartmentComboBox'].onValueChanged(function(){

                fullCalendar(rootNode, lastData);
            });
        }

        var i = 0;

        viewContext.DataSources['ResourceScheduleDataSource'].onItemsUpdated(function () {

            lastData = viewContext.DataSources['ResourceScheduleDataSource'].getDataItems();

            fullCalendar(rootNode, lastData);

            if( mode == OperationMode && i == 0 && context.ParentView.getParentView().getName() == "HomePage") {

                var service = viewContext.Controls['ServiceComboBox'].getValue();
                viewContext.Controls['CalendarPanel'].setVisible(service !== null && service !== undefined);
                i += 1;
            }
        });

        viewContext.DataSources['AppointmentDataSource'].onItemsUpdated(function () {

            var data = viewContext.DataSources['AppointmentDataSource'].getDataItems();
            appointments = getAppointmentsData(data);
            if(selectedSchedule)
                subCalendar(rootNode, selectedSchedule, lastDate, lastData);
            if(mode == QueueMode)
                fullCalendar(rootNode, lastData);
        });

        if(mode == QueueMode)

            viewContext.DataSources['SelectedPatientDataSource'].onSelectedItemChanged(

                function(){

                    viewContext.Controls['PatientComboBox'].setValue(
                        viewContext.DataSources['SelectedPatientDataSource'].getSelectedItem() );

                    var row = $('tr.selected', $(rootNode));

                    examination(row);
                }
            );

    }

    function fullCalendar (node, data) {

        selectedSchedule = null;

        var slots = getDaySlots(data);

        var startDate = startDatePicker.getValue();
        if(startDate)
            startDate= moment(startDate);
        else{
            startDate = moment();
            startDatePicker.setValue(startDate.toISOString());
        }

        node.html('');

        var table = $('<table class="slot-table table table-condensed" border="1" id="table1"><thead><tr><th></th></tr></thead><tbody></tbody></tbode></table>');
        var tableBody = table.find('tbody');

        node.append(table);

        if(mode == QueueMode){

            queueCalendar(startDate,node, slots,table, tableBody);
            return;
        }

        var tr = table.find('tr');
        tr.append('<th>' + startDate.format('dd DD') + '</th>');
        var clone = startDate.clone();
        for(var i = 1; i < 7; i++)
            tr.append('<th>' + clone.add('days', 1).format('dd DD') + '</th>');

        for(var d in slots){

            var r = $('<tr/>');
            tableBody.append(r);

            var link = '<a href="#" onclick="return false" class="slot-free">' + slots[d]['Data'].Resource.DisplayName +'</a>';
            r.append('<td >' + link +  '</td>');

            for(var i = 0; i < 7; i++) {
                var date = startDate.clone().add('days', i)
                var dayOfWeek = date.lang('en').format('dddd');

                if(slots[d]['Data'].EndDate && moment(slots[d]['Data'].EndDate) < date
                  || moment(slots[d]['Data'].StartDate) > date ){

                    r.append('<td/>');
                    continue;
                }

                if(slots[d]['Items'][dayOfWeek]){

                    var st = moment(slots[d]['Items'][dayOfWeek]['StartTime']).format('HH:mm');
                    var et = moment(slots[d]['Items'][dayOfWeek]['EndTime']).format('HH:mm');

                    link = '<a href="#" onclick="return false" class="slot-free">' + st + ' - ' + et + '</a>';

                    r.append('<td>' + link + '</td>');
                }
                else
                    r.append('<td/>');
            }

            r.find('a').data('rowId', d);

            r.find('a').click(function(){

                var row = $(this).data('rowId');
                var schedule = slots[row];
                subCalendar(node, schedule, startDate, data);
            });
        }
    };

    function queueCalendar(startDate, node, slots,table, tableBody){

        var tr = table.find('tr');
        tr.html('<th>Время</th><th>Опер-стол</th><th>Пациент</th>');

        var dayOfWeek = startDate.lang('en').format('dddd');
        var dateFormatted = startDate.format('YYYY-MM-DD')

        for(var d in slots){

            if(slots[d]['Data'].EndDate && moment(slots[d]['Data'].EndDate) < startDate
                || moment(slots[d]['Data'].StartDate) > startDate ){

                continue;
            }

            if(slots[d]['Items'][dayOfWeek]){

                var r = $('<tr class="apparatus header"><td/><td>'+ slots[d]['Data'].Resource.DisplayName + '</td><td/></tr>');
                tableBody.append(r);

                var cnt = slots[d]['Items'][dayOfWeek]['TimeSlots'].length;
                for(var i = 0; i < cnt; i++){

                    var timeSlot = slots[d]['Items'][dayOfWeek]['TimeSlots'][i];

                    var startTimeFormatted = timeSlot['StartTime'].format('HH:mm');
                    var endTimeFormatted = timeSlot['EndTime'].format('HH:mm');

                    var appointment = null;

                    var r = null;

                    if(appointments[slots[d]['Data'].Id] && appointments[slots[d]['Data'].Id][dateFormatted])
                    {
                        appointment = appointments[slots[d]['Data'].Id][dateFormatted].filter(function(appCand){

                            var time = moment(appCand.DateTime);

                            if(time >= moment(dateFormatted + ' ' + startTimeFormatted) && time < moment(dateFormatted + ' ' + endTimeFormatted) )
                                return true;
                            else
                                return false;
                        });
                        if(appointment.length > 0)
                            appointment = appointment[0];
                        else
                            appointment = null;
                    }

                    if(appointment)
                    {
                        var patient = getPatientString(appointment);

                        var busyClass = "apparatus busy";
                        if(!appointment.IsApproved)
                            busyClass += ' non-approved';
                        var r = $('<tr><td>' + (i + 1) + '</td><td>' + slots[d]['Data'].Resource.DisplayName + '</td><td>' + patient + '</td></tr>');
                        r.addClass(busyClass);
                        tableBody.append(r);
                    }
                    else {
                        r = $('<tr class="apparatus free"><td>' + (i + 1) + '</td><td>' + slots[d]['Data'].Resource.DisplayName + '</td><td/></tr>');

                        tableBody.append(r);
                    }

                    r.attr('data-date-time', dateFormatted + ' ' + startTimeFormatted );
                    r.attr('data-date', dateFormatted);
                    r.attr('data-startTime', timeSlot['StartTime'].format('YYYY-MM-DD HH:mm'));
                    r.attr('data-endTime', timeSlot['EndTime'].format('YYYY-MM-DD HH:mm'));
                    r.attr('data-scheduleId', slots[d]['Data'].Id);
                    r.attr('data-resourceId', slots[d]['Data'].Resource.Id);

                    var popupMenu = new DataGridPopupMenuView();
                    popupMenu.setItems(['Добавить операцию']);

                    popupMenu.on('clickItem', function (data) {

                        addOperation();
                    });

                    r.on('mousedown', function (e) {

                        $('tr.selected', tableBody).removeClass('selected');

                        $(this).addClass('selected');

                        var schedule = $(this).attr('data-scheduleId');
                        var dateTime = $(this).attr('data-date-time');

                        viewContext.DataSources['SelectedTimeDataSource'].setDataItems( [ dateTime ]  );
                        viewContext.DataSources['SelectedScheduleDataSource'].setDataItems( [ schedule ]  );

                        if (e.button == 2 &&  $(this).hasClass('free')) {
                            e.preventDefault();
                            e.stopPropagation();
                            popupMenu.show(e.pageX, e.pageY);
                        }
                    });
                }
            }
        }
    }

    function subCalendar(node, schedule, startDate, data){

        selectedSchedule = schedule;
        lastDate = startDate;

        var table = node.find('table.slot-table');
        var tableBody = table.find('tbody');
        tableBody.html('');

        var head = table.find('thead');

        var th = head.find('tr > th:first');
        th.html('');

        var l = '<a href="#" onclick="return false">Выбрать другое расписание</a>';
        th.append(schedule['Data'].Resource.DisplayName + '<br/>' + l);

        th.find('a').click(function(){
            fullCalendar(node, data);
        });

        if(schedule['Data'].IsAdditionalAllowed) {

            var r = $('<tr/>');
            tableBody.append(r);

            r.append('<td>Срочный прием</td>');

            for (var i = 0; i < 7; i++) {
                var date = startDate.clone().add('days', i)
                var dayOfWeek = date.lang('en').format('dddd');

                if(schedule['Data'].EndDate && moment(schedule['Data'].EndDate) < date
                    || moment(schedule['Data'].StartDate) > date) {
                    r.append('<td/>');
                    continue;
                }

                if (schedule['Items'][dayOfWeek]) {

                    var link = $('<a href="#" onclick="return false">Записать</a>');

                    link.attr('data-date', date.format('YYYY-MM-DD'));
                    link.attr('data-scheduleId', schedule['Data'].Id);
                    link.attr('data-resourceId', schedule['Data'].Resource.Id);
                    r.append( $('<td/>').append(link));
                }
                else
                    r.append('<td/>');
            }

            r.find('a').click(function () {
                additionalExamination($(this));
            });
        }

        var startHour = moment(schedule['Data'].IntervalSettings.map( function(i) { return i.Interval.BeginTime; }).sort()[0]).hour();
        var endHour = moment(schedule['Data'].IntervalSettings.map( function(i) { return i.Interval.EndTime; }).sort().reverse()[0]).hour();

        var maxSlotCount = 0;
        for(var day in schedule['Items']) {

            var cnt = schedule['Items'][day]['TimeSlots'].length;
            if(cnt > maxSlotCount)
                maxSlotCount = cnt;
        }

        for(var ts = 0; ts < maxSlotCount; ts++) {

            var row = $('<tr></tr>');
            row.append('<td>' + (ts + 1) + '</td>');

            for(var i = 0; i < 7; i++) {
                var date = startDate.clone().add('days', i)
                var dayOfWeek = date.lang('en').format('dddd');

                var dateFormatted = date.format('YYYY-MM-DD')

                if(schedule['Data'].EndDate && moment(schedule['Data'].EndDate) < date
                    || moment(schedule['Data'].StartDate) > date) {
                    row.append('<td/>');
                    continue;
                }

                if(schedule['Items'][dayOfWeek] && schedule['Items'][dayOfWeek]['TimeSlots'][ts]){

                    var timeSlot = schedule['Items'][dayOfWeek]['TimeSlots'][ts];

                    var startTimeFormatted = timeSlot['StartTime'].format('HH:mm');
                    var endTimeFormatted = timeSlot['EndTime'].format('HH:mm');

                    var appointment = null;

                    if(appointments[schedule['Data'].Id] && appointments[schedule['Data'].Id][dateFormatted])
                    {
                        appointment = appointments[schedule['Data'].Id][dateFormatted].filter(function(appCand){

                            var time = moment(appCand.DateTime);

                            if(time >= moment(dateFormatted + ' ' + startTimeFormatted) && time < moment(dateFormatted + ' ' + endTimeFormatted) )
                                return true;
                            else
                                return false;
                        });
                        if(appointment.length > 0)
                            appointment = appointment[0];
                        else
                            appointment = null;
                    }

                    if(appointment)
                    {
                        //var appointment = appointments[schedule['Data'].Id][dateFormatted];
                        var link = $('<a href="#" onclick="return false" class="busy">' +
                            getPatientString(appointment) + '</a>');

                        if(mode == OperationMode && !appointment.IsAppoved)
                            link.addClass('non-approved');

                        link.attr('data-appointmentId', appointment.Id);

                        row.append($('<td/>').append(link));
                    }
                    else {

                        var link = $('<a href="#" onclick="return false" class="slot-free free">' +
                        startTimeFormatted + ' - ' + timeSlot['EndTime'].format('HH:mm') + '</a>');

                        link.attr('data-date', dateFormatted);
                        link.attr('data-startTime', timeSlot['StartTime'].format('YYYY-MM-DD HH:mm'));
                        link.attr('data-endTime', timeSlot['EndTime'].format('YYYY-MM-DD HH:mm'));
                        link.attr('data-scheduleId', schedule['Data'].Id);
                        link.attr('data-resourceId', schedule['Data'].Resource.Id);

                        row.append($('<td/>').append(link));
                    }
                }
                else
                    row.append('<td/>');
            }

            row.find('a.free').click(function () {
                examination($(this));
            });

            if(mode == ClassicMode)
                row.find('a.busy').each(function(i) {

                var link = $(this);
                var popupMenu = new DataGridPopupMenuView();
                var items = ['Редактировать'];

                popupMenu.setItems(items);

                link.on('mousedown', function (e) {
                    if (e.button == 2) {
                        e.preventDefault();
                        e.stopPropagation();
                        popupMenu.show(e.pageX, e.pageY);
                    }
                });

                popupMenu.on('clickItem', function (data) {

                    editAppointment(link);
                });
            });

            tableBody.append(row);
        }
    }

    function getDaySlots(data){

        var result = [];

        for(var i in data){

            var schedule = data[i];
            var holidays = (schedule.HolidayCalendarSign ?  schedule.Schedule.Holidays : []) || [];
            var intervals = schedule.IntervalSettings;

            var isFiltered = applyFiltersToSchedule(schedule);

            if(!isFiltered)
                continue;

            var value = [];
            value['Data'] = schedule;

            var days = [];

            for(var j in intervals){

                var interval = intervals[j];

                if(!interval.Interval || !interval.Interval.RepeatDays)
                    continue;

                var startTimeString = interval.Interval.BeginTime;
                var endTimeString = interval.Interval.EndTime;

                if(startTimeString == endTimeString)
                    continue;

                var duration = (interval.Duration / interval.PatientCount) || 20;

                var totalHours = moment(endTimeString).hour() - moment(startTimeString).hour();
                var slotCount = totalHours *60 / duration;

                for(var d in interval.Interval.RepeatDays){

                    if(!interval.Interval.RepeatDays[d])
                        continue;

                    if(holidays[d])
                        continue;

                    if(!days[d]) days[d] = [];

                    if(!days[d]['StartTime'])
                        days[d]['StartTime']= startTimeString;

                    if(startTimeString < days[d]['StartTime'])
                        days[d]['StartTime'] = startTimeString;

                    if(!days[d]['EndTime'])
                        days[d]['EndTime']= endTimeString;

                    if(endTimeString > days[d]['EndTime'])
                        days[d]['EndTime'] = endTimeString;

                    if(!days[d]['TimeSlots'])
                        days[d]['TimeSlots']= [];

                    for(var ts = 0; ts < slotCount; ts++)
                        days[d]['TimeSlots'].push( {
                            'StartTime':(moment(startTimeString).add('minutes', duration*ts)),
                            'EndTime':(moment(startTimeString).add('minutes', duration*ts + duration))
                        } );

                    days[d]['TimeSlots'] = _.sortBy(days[d]['TimeSlots'], function(sl){ return sl.StartTime; });
                }
            }

            if(_.keys(days).length == 0)
                continue;

            value['Items'] = days;
            result[schedule.Id] = value;
        }

        return result;
    }

    function applyFiltersToSchedule(schedule){

        var startDate = startDatePicker.getValue();

        if(!schedule.IntervalSettings || schedule.IntervalSettings.length == 0)
            return false;

        if(startDate) {
            startDate = moment(startDate);

            if (schedule.EndDate && moment(schedule.EndDate) < startDate
                || moment(schedule.StartDate) > startDate.clone().add('days', 6)) {

                return false;
            }
        }

        if(selectedService){

            if(!schedule.MedicalWorker || !schedule.MedicalWorker.Services )
                return false;
            else{

                var f = _.find(schedule.MedicalWorker.Services, function(serv){ return serv.Id == selectedService.Id  } );
                if(!f)
                    return false;
            }
        }

        var isSurgical = isScheduleForSurgicalApparatus(schedule);

        if(isSurgical && mode == ClassicMode)
            return false;
        else if(!isSurgical && (mode == OperationMode || mode == QueueMode) )
            return false;

        if(viewContext.Controls['DepartmentComboBox']){
            if(viewContext.Controls['DepartmentComboBox'].getValue()){

                var dId = viewContext.Controls['DepartmentComboBox'].getValue().Id;
                if(!schedule.Department || schedule.Department.Id != dId)
                    return false;
            }
        }

        if(viewContext.Controls['ResourceTypeComboBox']){
            if(viewContext.Controls['ResourceTypeComboBox'].getValue()){

                if( !schedule.Resource || !schedule.Resource.Id)
                    return false;

                var ds = viewContext.DataSources['CrossDataSource'];
                var resource = _.find(ds.getDataItems(), function(item){ return item.Id == schedule.Resource.Id; } )

                if(!resource)
                    return false;

                var type = viewContext.Controls['ResourceTypeComboBox'].getValue().Id;

                switch (type){
                    case MedicalWorkerResourcesTypeId :
                        return resource.__DocumentId == "medicalworker";
                    case ApparatusResourcesTypeId:
                        return resource.__DocumentId == "apparatus";
                    case CabinetResourcesTypeId:
                        return resource.__DocumentId == "cabinet";
                }
            }
        }

        return true;
    }

    function getAppointmentsData(data){

        var res = [];
        for(var i in data){

            if(data[i].Schedule){

                var id = data[i].Schedule.Id;

                var date = moment(data[i].DateTime);

                var dateKey = date.format('YYYY-MM-DD'),
                    timeKey = date.format('HH:mm');

                if(!res[id])
                    res[id] = [];

                if(!res[id][dateKey])
                    res[id][dateKey] = [];

                res[id][dateKey].push(data[i]);
            }
        }

        return res;
    }

    function additionalExamination(link){

        alert('Срочник: ' + moment(link.attr('data-date')).format('DD-MM-YYYY') + ' ' + link.attr('data-scheduleId'));
    }

    function editAppointment(link){

        var ds = viewContext.DataSources['AppointmentDataSource'];
        var id = link.attr('data-appointmentId');

        var app = _.find(ds.getDataItems(), function(item){return item.Id == id; });
        if(app){

            ds.setSelectedItem(app);

            viewContext.Global.executeAction({

                EditAction:{
                    View: {
                        AutoView: {
                            ConfigId: 'Schedule',
                            DocumentId: appointmentDocument,
                            MetadataName: 'EditView',
                            OpenMode: 'Dialog'
                        }
                    },
                    DataSource: 'AppointmentDataSource'
                }
            });
        }

    }

    function examination(link){

        var date = moment(link.attr('data-date'));
        var time = moment(link.attr('data-startTime'));
        date.hour(time.hour());
        date.minute(time.minute());
        date.second(0);

        var scheduleId = link.attr('data-scheduleId');
        var resourceId = link.attr('data-resourceId');

        var ds = viewContext.DataSources['CrossDataSource'];
        var resource = _.find(ds.getDataItems(), function(item){ return item.Id == resourceId; } );

        var service = selectedService;

        if(mode == OperationMode) {

            var serviceComboBox = viewContext.Controls['ServiceComboBox'];
            if(serviceComboBox) {
                service = serviceComboBox.getValue();
                if (service)
                    service.Name = service.DisplayName;
            }
        }

        viewContext.Global.executeAction(
            {
                AddAction: {
                    View: {
                        AutoView: {
                            ConfigId: 'Schedule',
                            DocumentId: appointmentDocument,
                            MetadataName: 'EditView',
                            OpenMode: 'Dialog',
                            Parameters: {
                                SourceMode: mode
                            }
                        }
                    },
                    DataSource: 'AppointmentDataSource'
                }
            },
            function (view) {

                view.getContext().Controls['ScheduleComboBox'].setValue({Id:scheduleId, DisplayName:'-'});

                view.getContext().Controls['DateTimeDatePicker'].setValue(date.toISOString());

                if(resource){

                    if(resource.__DocumentId == "medicalworker"){
                        resource.DisplayName = (resource.LastName || '') + ' ' + (resource.FirstName || '') + ' ' + (resource.MiddleName || '');
                        view.getContext().Controls['MedicalWorkerComboBox'].setValue(resource);

                        if(view.getContext().Controls['AppointmentTypeComboBox'])
                            view.getContext().Controls['AppointmentTypeComboBox'].setValue(types[0]);
                    }

                    if(resource.__DocumentId == "apparatus" && (mode == OperationMode || mode == QueueMode))
                        view.getContext().Controls['ApparatusComboBox'].setValue( {Id:resourceId, DisplayName: resource.Name });
                }

                if(service){

                    view.getContext().Controls['ServiceComboBox'].setValue(
                        {Id:service.Id, DisplayName: service.Name  });

                    if(view.getContext().Controls['AppointmentTypeComboBox'])
                        view.getContext().Controls['AppointmentTypeComboBox'].setValue(types[1]);
                }

                var selectedPatient = viewContext.Controls['PatientComboBox'].getValue();
                if(selectedPatient){

                    view.getContext().Controls['PatientComboBox'].setValue(selectedPatient);
                }
            }
        );
    }

    function getPatientString(appointment){

        var patientString = '';
        var timeString = '';

        if(appointment.DateTime)
            timeString =  moment(appointment.DateTime).format('HH:mm');

        if(appointment.Patient && appointment.Patient.CommonInfo){

            var ci = appointment.Patient.CommonInfo;
            if(ci.LastName)
                patientString += ci.LastName;

            if(ci.FirstName)
                patientString += ( ci.LastName ? ' ' + ci.FirstName[0] + '.' : ci.FirstName );

            if(ci.MiddleName)
                patientString += ( ci.LastName ? ci.MiddleName[0] + '.' : ' ' + ci.MiddleName );
        }

        return patientString + '(' + timeString + ')';
    }

    function addOperation(){

        var row = $('tr.selected', $(rootNode));
        var schedule = row.attr('data-schedule-id');
        var time = row.attr('data-date-time');

        viewContext.Global.executeAction(
            {
                SelectAction: {
                    View: {
                        AutoView: {
                            ConfigId: 'Demography',
                            DocumentId: "Patient",
                            MetadataName: 'PatientsInDepartment',
                            OpenMode: 'Dialog'
                        }
                    },
                    SourceValue: {
                        PropertyBinding: {
                            DataSource: "MainDataSource",
                            Property:"$"
                        }
                    },
                    DestinationValue: {
                        PropertyBinding: {
                            DataSource: "SelectedPatientDataSource",
                            Property: "$"
                        }
                    }
                }
            });

    }

    function isScheduleForSurgicalApparatus(schedule){

        return schedule && schedule.Apparatus && schedule.Apparatus.IsSurgicalTable;
    }
}
function CalendarLegend(){

    var OperationMode = "Operations";
    var ClassicMode = "Classic";
    var QueueMode = "Queue";

    var queueLegend = '<div class="calendar">'
        +'<table class="legend" border="1"><tbody>'
        +'<tr><td class="free">Свободно</td>'
        +'<td class="busy">Утвержденная операция</td>'
        +'<td class="busy non-approved">Неутвержденная операция</td>'
        +'</tr></tbody></table>'
        +'</div>';

    var operationLegend = '<div class="calendar">'
        +'<table class="legend" border="1"><tbody>'
        +'<tr><td class="slot-free">Свободно</td>'
        +'<td class="busy">Утвержденная операция</td>'
        +'<td class="busy non-approved">Неутвержденная операция</td>'
        +'</tr></tbody></table>'
        +'</div>';

    this.render = function(target, parameters, context){

        var  mode = parameters['Mode'].getValue();

        if(mode == QueueMode)
            target.append(queueLegend);
        else if(mode == OperationMode)
            target.append(operationLegend);
    }
}
function EhrImage() {
    this.render = function (target, parameters, context) {
        var timer;
        var openView = function () {
            context.Global.executeAction({
                OpenViewAction: {
                    View: {
                        AutoView: {
                            ConfigId: 'PatientEhr',
                            DocumentId: 'Common',
                            MetadataName: 'ResearchHistory',
                            OpenMode: 'Dialog',
                            Parameters: {
                                Patient: context.DataSources['HospitalizationHistoryDataSource'].getSelectedItem().Patient
                            }
                        }
                    }
                }
            });
        };

        var $image = $('<a>')
            .css('cursor', 'pointer')
            .on('click dblclick', function () {
                window.clearTimeout(timer);
                timer = window.setTimeout(openView, 300);
                return false;
            })
            .append($('<img>')
                .attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAABKCAYAAADpAouEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABAnSURBVHhe7Z3LctzEHof9CCxZ8ggsmWzgEVhSdc4pqML2Oxxu2bBM7LA8dapgzYIDsbFDHAgEAgQIlxBiG5uES0goIFxz9yV9/l9Lf02r1ZI1I43tmelUfdGMpJFmxr9P3a1uaSaMMRMvvfSSOXjwYCQyVszOzkr8jXUg+U8mjz322Fjwz3/9y/z76WdzPNWQp+GZEM/1xTM+zzbn2TKeK+NgLZ6rg4SuF0KhHQT33Xef+fbbb60MmQhHjx4dC44vLZnrtzYsNyybRW5vmps1uAV3QmwVuA13d+aOy0YZ25a7ITbzbFSxVWTTci/Mdp6tnbh3z2wXMGEkiDLZVR544IHxFqFKgDoSDFwACAoAaeB9JNi1JfDCPwgBihIEwg8SwL2QAMZahCUrgidAKkEo9C5WAKghgRUAJNRVjJQAUBCgWgKZ7BlRhB4FgLZLgV4ECEogwW4uQD0JgoH3GSIBlCjCHgoA9QQACXgICXdzCZzQu0hSe5JgCAVQBi7C3Nxc7vlrr72WzVfc5e4yf37bWBG8sIeI7YAdkMAPQzugil0pEQi/CuDPL3seWr9tECEUfCW2A2pQEKBaApnsSwYugkrw6quv2un8/HyO119/PUNLApVAX+tvsy2qRNi7alBsB+wFAxXBr94Q/DfeeMOcPHnSfPDBB+bTTz81X375pfniiy/MRx99ZE6dOmXeeusts7i4mIkyyCpSSITYDtiBERNAGagIejQnzMePHzdnz54133//vfnrr7/M5uam3ek9+SJ1urGxYX777Tdz8eJF8+GHH1ohdkuE8mpQiQCQBr2MnAAQDD9IuENIsPeNAJALf4UAIH9UmQwNAy8RqPKcPn3a/PjjjzboGnxwH+vz7W3544kkt27dskKcOHFiYDKoCG2XAvtaAJCkNhMAAuEH+UPKZOhoTQQ3rLQHeL6wsGA+/vhje5T3Q1+Hra0t8/PPP5v333/fbottt9lmQIQ2BYC6AtSVIBh+JShAhQSS1ChAmIGVCFRraAP8/fffVgKFfdSF9ZHh999/t20I2gyDFaElASAoAKSB95Fg15bACX9eAif0LpLUniTgexfqCjDsEkDrIhBUqkOffPKJuXHjhg0/1R1oIgMlA41p3Ye/337oilAiAEioqxgpAcCGvoYAIH8gmYwErYigwdTp22+/bS5fvmzDzzahHwmAbSAC7Qu2SaO7XRFKJJBQV7GvBQBJajMBKiSQP4xMRopWRHDbB9TlOSV69+7drATotzQAfR3QgF5ZWbFVJHf//bK0dKJnAaCuAMNSDRpnAZTWG8s0bKnTuwFmuzptAkJdu3YtqyI1RUWI7YCdBRhlCaDVNsKxY8fMV199ZasybQQffJFu3rxpSxwtFbSa1M8pVkSI7YCdJZDJyNNqG+Gdd94xP/30U2sSKGxPt4lk9EnQVgi9h16wIkiwy5k3Tz40Yy7I40QAeT4xZY4GBAhKIMFuLkA9CYKB98lCHwXwabVqdObMGXP9+vVWRXAl0Od//PGHeffdd3P7b1uE5OifipAG/ujkhHxBvggS8BAS7uYSOKF3kaT2JIENfBSgitZE4JTpZ599Zhu0bGdQMjDltCzjk9hvkzNIIRFyVSBE6KQizE2ZickZc6ijImynYoSQdSTgueWTC0noV2ZNZ3LKTOr8zqxZXpV5U7Lchn9BlnXM4VVCz+PuNiYXehcgtgPq0ZoIdKDRPuBsEdtpUwRwt8ep1EuXLtn9tiVCXgCCDiqCVolWUxHkCG/FWMiVAMuHO+ahw2tJCTAvywk54RfmRIrJ+VQE2dZceuSfm5L5M4kIHO3npzqm00lFmJ82nZl1G/p51ktFCIbeJxf+nSWQyVjTmgiMKuXUpj+YriluSaBTzh5duXKlrwayi4pQFEBJRDgkIX5yjnbAWiZCLvQpOo/g87iTPs495+iPIKkIKzMyf2rKimAfS/CRISkR1s3hTrdEmBIRgqF3sYH3CYQf5AuVSURorbGMCF9//bU9Y8R2Bgky0NOsZ476FQIRyiUASgIJYXbk74qQlQipBCpCFn5KBK0OCfbIT4ngiEA7wB7pKRGkFHBLhcNrIsJasu6KpJb1KkUohL9agChBntZKBM7irK6u7ooI8Ouvv2bXK6gIvVaTMhEKAijU0dPguyKkwXfbAITcLwWoDunyibQNYEXQeen8TTtv2synDWEVYWW2k4W/UoS6AoB8eTKJeLRaImjVqK1qURWUCE3aB2BFCAqgwfdIBXDR0BdIqz4u9kxQWiKs6BkgF0mqEgy8T0GACgnkS5NJpIRWG8vnz58fWGPZhTYC445C76MXiiLswvDokAiS1J4kKIQ/CtCU1kSgmsKwa3p+2c4guXPnjq2GsV+tGvVTOuRFSAPvI8GuLYET/rwEaeB9JKm9ClC7GiRfVJSgHovHjplHH33U3L59W541EIEQAtch//nnn3Zjg4R+BC779N+D+7wOiQgS7hAS7H0jABQEqJZAJpEa+BJA8l+fIjDlwvvvvvuu0BPso8t6QV/HlIYy+3L33Q+IMBgB6kkQDLyPfN4owGAISQDJf32IoNUTqkeff/65vXZAh167Q7A1zL3gv442CNcy05Ot+2bab4nQvgRO6F0kqT1JIJ85CjA4XAlu3t0yx85fk7lJxpL/GpQIwEU5DIpjWxpgf9oLvgiMZeLqNxUg9B7qkokgwS4XwB3mQEdXN/iDEiC2AwaLL8FT/7to/nPqiixJMpb811AEAsoF+zr4rokELryePgrOFnGq1t2vlkj6HupiRXDCnxcA1szhzpSZ47EX/tYFABv6+hLIJNIjIQn+8d8L7YigEEyqR9zAi+qL27nWrxDu67jghwt/2I8vn+5f59XBFSEvQArjgujxtaWB4PUI23mQ9ggnHWM6P+kUI+Crs53culsL093ndKSty+umFyTgSfgXpjtmdl3Cvn5E5i+m4V80UxMH7Hy+kUjvlEnQqggaQqYEk3sZ0elFgEHbCrqzuuhrOS3LoD72ocF3S4EmJUJQAtCBc2kJoMMkGAzHfO0LsMMk5uUxAUeKbcYIdcwMIjBMgvBLmoFeYzuf5xr6BVcEI/OSwLsiMK9zIIrQL8srK+bBBx+0EmzI3+zg0UuZBK2XCKBC0Jjl6P3LL79kMmioXSnc+TrPRSWg19q/txHhbyIDIgQFSINvRZAQazVIB8XpVKtBDIXoSEJ1uiUizKgIuaN/wtQCy9PnCECJkFsnL8LaEZHgyHomiPsHjtRHfy9N/k2cu3zdPPHicvsicFMvphpGnsN7771nSwaqSX7YfRn856yPwd98801uXJHuAyFUCn2uj+tQEEEFUHK9wMlRXodHZ9Uhe5SXEsGGW4/2nghOieC3A9aQZ3raqQJ5JYKUAizjm4kiNKdMhlYby25AdRkB5mJ7uq85srth16niPkccLtTnDBHb0O36+/If90JOBE+CpCGcbwu4pUC+jTBrj/BJaeCJIM9z60rbYUqqQ93n02Yh1xZwAs98lssXw7cTRWiHkAytiOAfpXWePgeqNZQOdLhxlCfsfhWJ5whAo/jcuXMS1KWsJNB9le3DfV4XK4IT/rwESeALSFJ7OhuE1Hy2HEngC8gXEc8G7Q6+DC+evmofQ18iED7uXkHj+MKFC+aHH36wVRlOoXKa063SaGCZz5Geq8w4HcpFNvQ9cD0D7QotAfQ1oNtgX3TasR9eu7y8bF/DMHB9XV2WTuRFaFUAqCsAyJcvk8gu4srAWSSmUBCB4LnB0SADR3iqPDRiucmvDr/Wozw9wASc8UfaC+xvx5XE35cPy9kft5XXu2or7Jv3wHuh1CkTQver++LnZXcUACSpzQSAQPhBvnSZRPYIVwalIIIejfU5IADjfNbW1myd3+0r8GEZv4XA8Gw946ONakVlcEOqQdUGN0O8KQX0dxUIv78vQEJuHkB7hB5u3a5uT6e6L0qEtqtBUYDhw5ch+U8mKoAGRh8TJD0lSuj0hVUQWoZNE0462vwxQq4Y7n6AdQk0VSZKGC1tykQAlrEeo2C5gzYCutvVffM8ESENfUMBYjtguAlej6CBUXhO3ZxbqHCbdw1kLzJoI5jS4c0338xtHwimPmZ/lDqsS5XHFQD87Sv6nnQ9hnnwnhHK/Uwqwgl5H40EAPZZwAu/Im9SJpF9SOWFORpOgkNdX3/www0crynDXU8fIwTXE9B+IKTcqIvQc+Tn56K44IYSR6td7n50O7r9MlhHX8vNwGjIu6JpKZQrESSpUYDxZccr1JCAn29iJYLFOm4Yy4LphlYfK2xHpfDRdXbaji738ddlP4ilpZCWBkxpLLsCFCRgeIR8H3wnCR0zw3AId54dGiFhz/UFMC6o2z/AO7pnFs20M1Zo/cgBZxuyTm5d7TPgNc6+dJvuPOc1kf4pFYGgMKUxyx3sOPfPcqgKYohe1/dxw63zdsJdl/bF+vp64WySLREkuQUBlPR2Kqs8vpd0ks2uuyXAupntSDhlVzkRJPS+CAQ7GysUCv1iSITkMdIwxEKXdZH9H+h2uEX6p7KNwJGTBi7n65uGeS/hvVOt47PwufTz0UYICqCoCFnoEYGpc0Qm8PLVZCLIDpOjf1cEDXIW7sXi+KPpI7Jubl6ZCITfXS+K0AaVVSOOoHR8tX1j372ANgclm342K4KUCEEBFAbDiQhrrgiz03YohSwOlgjJF+uIEBorhAjO0d8SKiVCIshr81JEEdogKII2LDlTRG8xVYthF4HPwGlYt3OvVAQbfKEgAuGk2tM9anc0iAQ5m+/SDaob7oVpdx2ZX7tq5LYbnP1HGlFZItDAZCGNWJYNM3wGqnju7yowlqlUggyO/CXIhmVSggT2wBE5ZoeWRfYblSLwwx9Xr14d+tIA+AyMZqUU0M+XKxFy4d9BAtmgTHYgijBMVIrA+XdunTIKIgCdgfoDIzSYbYlQCH9TASLDSKkIBIUOLjqkRkUEGswMu8jOGkmJUFeAKMFoUyoCjUrOGOkv57NsmOEz0BfCsI2iCF7wXeTFMomMOKUicOqUEZ9uR9qww5kjRs3y+TgzxsmAYPhBXiCTyJhQWSJw9NRfwBkFuI6B6xm0RAiKICvyxUTGi1IRuAaAC11GpX0AnEJ1f3IqqRp1BYgSjC+lInC+nUsuR0UEPgdwFqwggqzgfimR8aNUBKoNVCNGqUQAronQ3mVE8L+QyHhSKoJ2pjFvlOB0sPYuRxEiSqkIdKbRE8u8UYLrnnUUahQhopSKcObMGduHwLxRqh4xkpY7XUQRIi6lIpw9ezbrQxglEbhMFMmjCBGXUhG4nlhHnY6KCHwOhlkgeRQh4hIUgbMq3II9dI3ysMN9j5A8ihBxCYrABTncTUIFGCURuMeS/s5CFCGiBEUgINyXdJQEUPRKtShCxCUoQuiC/VGRgvFG/KyVDrpzv4zI+BIU4YUXXjCvvPKKFYIbb40C+lm4mdjLL79snn/+eXPo0CFzkmWRsef+++/Pi/D440+Yhx9+2PLII4+MLOPwGSP1cX94PFeFiETGEzPxfzpmoWctNhxLAAAAAElFTkSuQmCC')
                .css('height', '17px'));

        target.append($image);
    }
}
function ExcelButton() {
    this.render = function (target, parameters, context) {
        var $button = $('<a>')
            .attr('href', '#')
            .append($('<img src="/launchers/main/excel.png" />').css('width', '34px'))
            .click(function () {
                context.Global.executeAction({
                    OpenViewAction: {
                        View: {
                            AutoView: {
                                ConfigId: 'Schedule',
                                DocumentId: 'OperationAppointment',
                                MetadataName: 'ExcelView',
                                OpenMode: 'Dialog'
                            }
                        }
                    }
                });

                return false;
            });

        target.append($button);
    }
}
function FederalPublicationListener() {
    this.render = function (target, parameters, context) {
        var ds = context.DataSources['MainDataSource'];

        var signalR = $.hubConnection(window.host),
            hub = signalR.createHubProxy('WebClientNotificationHub');

        hub.on('FederalStatusChanged', function (id) {
            function predicate(item){
                return item.Id == id;
            }

            if (_.some(ds.getDataItems(), predicate)){
                ds.updateItems();
            }
        });

        signalR.start().done(function () {
            console.log('Now connected, connection ID=' + signalR.id);
        });
    }
}
function HistoryView(){

    var viewContext = null;
    var rootNode = $('<div style="overflow:scroll; height:500px;">');

    this.render = function(target, parameters, context){

        var mainDiv = target.append(rootNode);
		rootNode.append('<br>');
		
		if (context.ParentView && context.ParentView.parent)
		{
			var parentContext = context.ParentView.parent.getContext();
			if (parentContext)
			{
				var data = parentContext.DataSources.VarDataSource.getSelectedItem();
				if (data && data.HistoryData)
				{
					$.each(data.HistoryData, function( key, value ) 
					{
						var elementNode = $('<p style="margin-top: 10px;">');					
						elementNode.append('<span style="background-color: #e7e7e7;padding: 7px;font-size: 14px;"><u>Дата: '+value["Date"]+'</u></span>');
						if (value.Items)
						{	
							var ulDiv = $('<ul style="margin-top: 10px;">');

							$.each( value.Items, function( key, historyItems ) 
							{ 
								var liDiv = $('<li>');
								
								if ($.isArray(historyItems))
								{
									$.each( historyItems, function( key, item ) 
									{
										addItemToHistory(item, liDiv)
									});							
								}
								else
									addItemToHistory(historyItems, liDiv)

								ulDiv.append(liDiv);
							});
							
							elementNode.append(ulDiv);
						}		
						
						elementNode.append('<hr width="100%" />');
						rootNode.prepend(elementNode);
					});

					rootNode.find("p:first").css('background-color', '#fffddf');
				}
			}
		}
    }
}

function addItemToHistory(item, liDiv)
{
	if (item == null)
		return;
		
	liDiv.append('<span>'+item["Name"]+':<b> '+item["Value"]+', </b></span>');
}
function oldCalendar() {
    var $calendar;
    var globalContext;

    var signalR = $.hubConnection('http://IC:9900'),
        hub = signalR.createHubProxy('WebClientNotificationHub');

    hub.on('ReservationCreated', function (a) {
        var reservation = JSON.parse(a);

        toastr.info(
            'Длительность: ' + reservation.Duration + 'мин.',
            'Выдан талон на ресурс "' + reservation.Resource.DisplayName + '"');

        $calendar.fullCalendar('renderEvent', {
            id: guid(),
            title: reservation.Comment,
            start: reservation.StartTime,
            end: moment(reservation.StartTime).add(parseInt(reservation.Duration), 'minutes').toISOString(),
            allDay: false,
            backgroundColor: Metronic.getBrandColor('blue')
        }, true);
    });

    signalR.start().done(function () {
        console.log('Now connected, connection ID=' + signalR.id);
    });

    var fullCalendar = function (node, events) {
        $calendar = $(node).fullCalendar({
            header: false,
            defaultView: 'agendaWeek',
            defaultDate: '2014-09-12',
            selectable: true,
            selectHelper: true,
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',
                'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл',
                'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            buttonText: {
                today: 'сегодня',
                month: 'месяц',
                week: 'неделя',
                day: 'день'
            },
            allDayDefault: false,

            allDayText: 'Все дни',
            allDaySlot: false,
            slotMinutes: 15,
            defaultEventMinutes: 120,
            height: 825,

            axisFormat: 'HH:mm',
            timeFormat: {
                agenda: 'HH:mm{ - HH:mm}'
            },
            dragOpacity: {
                agenda: .5
            },
            minTime: 8,
            maxTime: 21,

            fixedWeekCount: false,
            firstDay: 1,

            editable: true,

            select: function (start, end) {
                globalContext.executeAction({
                    AddAction: {
                        View: {
                            AutoView: {
                                ConfigId: 'Registry',
                                DocumentId: 'ResourceReservationForm',
                                ViewType: 'EditView',
                                OpenMode: 'Dialog'
                            }
                        },
                        DataSource: 'ReservationsDataSource'
                    }
                }, function (view) {
                    var diff = new Date(moment(end).diff(moment(start)));

                    view.getContext().Controls['StartTimeEditor'].setValue(moment(start).add(6, 'hours').toISOString());
                    view.getContext().Controls['DurationEditor'].setValue((diff.getHours() - 6) * 60 + diff.getMinutes());
                });
            },

            eventLimit: true, // allow "more" link when too many events
            events: events,

            eventClick: function (calEvent, jsEvent, view) {
                var r = confirm("Delete " + calEvent.title);
                if (r === true) {
                    $(node).fullCalendar('removeEvents', calEvent._id);
                }
            }
        });
    };

    this.render = function (target, parameters, context) {
        var $node = target.append('<div>');

        window.setTimeout(function () {
            fullCalendar($node, []);
        }, 0);

        var curr = new Date();
        var firstDay = moment(new Date(curr.setDate(curr.getDate() - curr.getDay())));

        var days = [
            firstDay.add(1, 'days').format('YYYY-MM-DD'),
            firstDay.add(1, 'days').format('YYYY-MM-DD'),
            firstDay.add(1, 'days').format('YYYY-MM-DD'),
            firstDay.add(1, 'days').format('YYYY-MM-DD'),
            firstDay.add(1, 'days').format('YYYY-MM-DD'),
            firstDay.add(1, 'days').format('YYYY-MM-DD'),
            firstDay.add(1, 'days').format('YYYY-MM-DD')
        ];

        globalContext = context.Global;

        var slots,
            reservations;

        function rerender() {
            //Добавляем слоты
            function resourceId(r) {
                return r.Resource.Id;
            }

            function addEvent(day, item) {
                _.each(item.Week.Time, function (time) {
                    if (time.PeriodParity.DisplayName == 'Четные дни' && day.slice(-1) % 2 != 0) return true;
                    if (time.PeriodParity.DisplayName == 'Нечетные дни' && day.slice(-1) % 2 == 0) return true;

                    $calendar.fullCalendar('renderEvent', {
                        id: guid(),
                        title: item.Resource.DisplayName,
                        start: day + 'T' + moment(time.From).format('HH:mm:ss'),
                        end: day + 'T' + moment(time.To).format('HH:mm:ss'),
                        allDay: false,
                        backgroundColor: Metronic.getBrandColor('green')
                    }, true);
                });
            }

            $calendar.fullCalendar('removeEvents');

            if (_.uniq(slots, resourceId).length != 1) {
                return;
            }

            _.each(slots, function (schedule) {
                if (schedule.Week.Monday) addEvent(days[0], schedule);
                if (schedule.Week.Tuesday) addEvent(days[1], schedule);
                if (schedule.Week.Wednesday) addEvent(days[2], schedule);
                if (schedule.Week.Thursday) addEvent(days[3], schedule);
                if (schedule.Week.Friday) addEvent(days[4], schedule);
                if (schedule.Week.Saturday) addEvent(days[5], schedule);
                if (schedule.Week.Sunday) addEvent(days[6], schedule);
            });

            // Добавляем талончики
            _.each(reservations, function (reservation) {
                if (!reservation.Resource || reservation.Resource.Id != slots[0].Resource.Id)
                    return true;

                $calendar.fullCalendar('renderEvent', {
                    id: guid(),
                    title: reservation.Comment,
                    start: reservation.StartTime,
                    end: moment(reservation.StartTime).add(parseInt(reservation.Duration), 'minutes').toISOString(),
                    allDay: false,
                    backgroundColor: Metronic.getBrandColor('blue')
                }, true);
            });
        }

        parameters['BaseScheduleDataSource'].onValueChanged(function (data) {
            slots = data;
            rerender();
        });

        parameters['ReservationsDataSource'].onValueChanged(function (data) {
            reservations = data;
            rerender();
        });
    }
}
function PdfViewer() {
    this.render = function (target, parameters, context) {
        var href = null;
        var documentViewer = context.ParentView.getContext().Controls['DocumentViewer'];
        var $originalDiv = $('<div>').hide();
        var inittext = 'Показать оригинал документа';

        var button = new Button();
        button.setText(inittext);
        button.setVisible(false);
        button.onClick(function () {
            if (href != null) {
                if (documentViewer.getVisible()) {
                    button.setText('Показать заголовок');
                    documentViewer.setVisible(false);
                    $originalDiv.show().append(
                        $('<iframe>')
                            .attr('src', href)
                            .attr('width', '100%')
                            .css('border', 'none')
                            .attr('height', window.innerHeight - 50)
                    );
                } else {
                    button.setText(inittext);
                    documentViewer.setVisible(true);
                    $originalDiv.hide();
                }
            }
        });

        target.append(button.render());
        target.append($originalDiv);

        context.DataSources['MainDataSource'].onSelectedItemChanged(function (c, data) {
            var header = data.value;

            documentViewer.setVisible(true);
            $originalDiv.empty().hide();
            button.setText(inittext);

            if (header != null && header.hasOwnProperty('PrintView') && _.isEmpty(header.PrintView) == false) {
                href = header.PrintView;
                button.setVisible(true);
            } else {
                documentViewer.setVisible(false);
                href = null;
                button.setVisible(false);
            }
        });
    }
}})();