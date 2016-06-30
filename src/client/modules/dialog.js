(function() {
    'use strict';
    var MaterialDialog = function MaterialDialog(element) {
        this.element_ = element;
        var t = this;
        window.addEventListener("hashchange", function () {
            if (window.location.hash === "") t.close.bind(t)();
            else if (window.location.hash === "#dialog") t.show.bind(t)(true);
        });
    };
    window['MaterialDialog'] = MaterialDialog;
    MaterialDialog.prototype.cssClasses_ = {
        BACKDROP: 'mdl-dialog-backdrop'
    };
    MaterialDialog.prototype.showInternal_ = function(backdrop) {
        if (backdrop === undefined) {
            throw Error('You must provide whether or not to show the backdrop.');
        }
        if (this.element_.hasAttribute('open')) {
            return;
        }
        if (backdrop) {
            this.createBackdrop_();
        }
        this.element_.style.bottom = this.element_.style.height * (-1);
        this.element_.setAttribute('open', true);
        var el = this.element_;
        setTimeout(function () {
            el.classList.add("mdl-dialog-visible");
        }, 10);
        window.location.hash = "dialog";
    };
    MaterialDialog.prototype.createBackdrop_ = function() {
        this.backdropElement_ = document.createElement('div');
        this.backdropElement_.classList.add(this.cssClasses_.BACKDROP);
        var t = this;
        document.querySelector(".mdl-js-dialog").insertAdjacentHTML('beforebegin', this.backdropElement_.outerHTML);
        this.backdropElement_ = document.querySelector("." + this.cssClasses_.BACKDROP);
        var el = this.backdropElement_;
        this.backdropElement_.addEventListener("click", function () {
            t.close.bind(t)();
        });
        setTimeout(function () {
            el.classList.add("visible");
        }, 10);
    };
    MaterialDialog.prototype.show = function(modal) {
        this.showInternal_(modal);
    };
    MaterialDialog.prototype['show'] = MaterialDialog.prototype.show;
    MaterialDialog.prototype.close = function() {
        this.element_.classList.remove("mdl-dialog-visible");
        if (this.backdropElement_) this.backdropElement_.classList.remove("visible");
        var t = this;
        setTimeout(function () {
            t.element_.removeAttribute('open');
            if (document.querySelector('.mdl-dialog-backdrop') && t.backdropElement_) {
                document.querySelector('#wrapper').removeChild(document.querySelector('.mdl-dialog-backdrop'));
                t.backdropElement_ = undefined;
            }
            window.location.hash = "";
        }, 200);
    };
    MaterialDialog.prototype['close'] = MaterialDialog.prototype.close;
    componentHandler.register({
        constructor: MaterialDialog,
        classAsString: 'MaterialDialog',
        cssClass: 'mdl-js-dialog',
        widget: true
    });
}());