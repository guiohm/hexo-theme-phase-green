(function($){
  // Caption
  // TODO: find a way to use custom classes for images while using this...
  // $('.entry-content').each(function(i){
  //   $(this).find('img').each(function(){
  //     var alt = this.alt;

  //     if (alt){
  //       $(this).after('<span class="caption">' + alt + '</span>');
  //     }

  //     $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox" rel="gallery' + i + '" />');
  //   });
  // });

  // Gallery
  var play = function(parent, item, animate, callback){
    var width = parent.width();

    item.imagesLoaded(function(){
      var _this = this[0],
        nWidth = _this.naturalWidth,
        nHeight = _this.naturalHeight;

      callback();
      if (animate) {
        this.animate({opacity: 1}, 500);
        parent.animate({height: width * nHeight / nWidth}, 500);
      } else {
        this.css({opacity: 1});
        parent.css({height: width * nHeight / nWidth});
      }
    });
  };

  $('.gallery').each(function(){
    var $this = $(this),
      current = 0,
      photoset = $this.children('.photoset').children(),
      all = photoset.length,
      loading = true;

    play($this, photoset.eq(0), false, function(){
      loading = false;
    });

    if (photoset.length === 1) {
      $this.children('.control').remove();
      return;
    }

    $this.on('click', '.prev', function(){
      if (!loading){
        var next = (current - 1) % all;
        loading = true;

        play($this, photoset.eq(next), true, function(){
          photoset.eq(current).animate({opacity: 0}, 500);
          loading = false;
          current = next;
        });
      }
    }).on('click', '.next', function(){
      if (!loading){
        var next = (current + 1) % all;
        loading = true;

        play($this, photoset.eq(next), true, function(){
          photoset.eq(current).animate({opacity: 0}, 500);
          loading = false;
          current = next;
        });
      }
    });
  });
})(jQuery);
