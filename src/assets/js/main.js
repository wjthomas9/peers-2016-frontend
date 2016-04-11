//= include ../bower_components/masonry/dist/masonry.pkgd.js

var elem = document.querySelector('.masonry-grid');

var msnry = new Masonry( elem, {
    itemSelector: '.masonry-grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true
});