var Shuffle = function(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};
var vPlayer, yPlayer;

$(function() {
  var unshuffled, playlist = [];
  updatePlaylist = function() {
    console.log('updating playlist...');
    $.ajax({
      type: "GET",
      url: "playlist.yaml",
      dataType: "text",
      success: function(data) {
        var doc = jsyaml.load(data);
        // console.log('doc is', doc);
        $(doc).each(function(k, v){
          console.log('k is', k, 'v is', v);
          console.log('v\'s keys are', Object.keys(v));
          playlist.push({t: Object.keys(v), vID: v[Object.keys(v)]});

        });
        unshuffled = playlist;
        Shuffle(playlist);
        nextVideo();

      }
    });
  }
  // playlist.push({t: 'v', vID: 73430271 });
  // playlist.push({t: 'v', vID: 34665000 });
  // playlist.push({t: 'v', vID: 32522317 });
  // playlist.push({t: 'v', vID: 28274354 });
  // playlist.push({t: 'v', vID: 27669555 });

  // playlist.push({t: 'y', vID: 'y1A4AEqHoqA'});
  
  // playlist.push({t: 'yp', vID: 'Arhehc7HoQs', pID: 'PLpxQ_drADAA-bMAKcxxJ92yIB86ku3GxK'});
  // playlist.push({ t: 'y', vID: 'Arhehc7HoQs' });
  // playlist.push({ t: 'y', vID: 'Dz45vPovCas' });
  // playlist.push({ t: 'y', vID: 'Cz-bkk7CL8Y' });
  // playlist.push({ t: 'y', vID: 'MIL0b2FfmWg' });
  // playlist.push({ t: 'y', vID: '0OKm9E-W99k' });
  // playlist.push({ t: 'y', vID: 'TVHWeS1lLVg' });
  // unshuffled = playlist;
  // Shuffle(playlist);
  // playlist.push({t: 'yp', vID: 'PLpxQ_drADAA-bMAKcxxJ92yIB86ku3GxK'});
  var idx = 0;
  // var vPlayer = $f(iframe);
  var status = $('.status');

  // var iframe = $('#player1')[0];
  var iframe = document.createElement('iframe');
  iframe.id = 'player1';
  var wrapper = document.getElementById('yPlayer');
  wrapper.parentNode.insertBefore(iframe, wrapper);
  iframe = $('#player1')[0];


  // 2. This code loads the IFrame Player API code asynchronously.
  var loadYTAPI = function(){
    // console.log('tag is', tag);
    // if (tag)
    //   delete(tag);
      // tag.remove();
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  };
  loadYTAPI();

  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
    function onYouTubeIframeAPIReady() {
      console.log('youtubeIframeAPIReady!')
    };

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      event.target.playVideo();
      console.log('player ready, playing video');
    };

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    var done = false;
    function onPlayerStateChange(event) {
      // if (event.data == YT.PlayerState.PLAYING && !done) {
      console.log(event);
      if (event.data == YT.PlayerState.ENDED) {
        nextVideo();
        done = true;
      }
    };
    function stopVideo() {
      yPlayer.stopVideo();
    };
    var createYPlayer = function(item) {
      console.log('creating YT player with item:', item)
      // loadYTAPI();
      clearVP();
      // clearYTP();
      if (item.t == 'y') {
        if(!yPlayer){
          yPlayer = new YT.Player('yPlayer', {
            height: '390',
            width: '640',
            videoId: item.vID,
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        } else {
          console.log('loading playlist on existing yPlayer');
          yPlayer.loadVideo(item.vID);
        }
      } else if (item.t == 'yp') {
        console.log('yPlayer is', yPlayer);
        if (!yPlayer) {
              yPlayer = new YT.Player('yPlayer', {
                height: '390',
                width: '640',
                videoId: item.vID,
                playerVars: {
                  listType: 'playlist',
                  list: item.pID
                },
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                }
              });
            } else {
              console.log('loading playlist on existing yPlayer');
              yPlayer.loadPlaylist({listType: 'playlist', list: item.pID});
            }
      }
  }
  var createVPlayer = function(item) {
    $(iframe).attr('src', vimeoAPIURL(item.vID));
    $(iframe).show();
    vPlayer = $f(iframe);
    vPlayer.api('play');

    vPlayer.addEvent('ready', function() {
        // status.text('ready');
        
        vPlayer.addEvent('pause', onPause);
        vPlayer.addEvent('finish', onFinish);
        vPlayer.addEvent('playProgress', onPlayProgress);
    });

    function onPause(id) {
        // status.text('paused');
    }

    function onFinish(id) {
        // status.text('finished');
        nextVideo();
    }

    function onPlayProgress(data, id) {
        // status.text(data.seconds + 's played');
    }


  }
  var clearYTP = function() {
    // remove youtube player
    // delete(yPlayer);
    // if (yPlayer)
    //   yPlayer.destroy();
    if (yPlayer){
      yPlayer.destroy();
      yPlayer = undefined;
    }
    return true;
  }
  var clearVP = function() {
    // clear vimeo player
    // delete(vPlayer);
    // vPlayer.unload();
    vPlayer.pause();
    $(iframe).hide();
    // if (vPlayer)
    //   vPlayer.element.remove();
    return true;
  }

  var vimeoAPIURL = function(vID) {
    return 'https://player.vimeo.com/video/' + vID +'?api=1&player_id=player1&autoplay=true';
  }
  var nextVideo = function(){
    setTimeout(function(){
      if (idx > playlist.length - 1){
        idx = 0;
        updatePlaylist();
        // Shuffle(playlist);        
      }
      var next = playlist[idx];
      // switch(next.t) {
      //   case 'v':
      //     handleVimeo(next);
      //     break;
      //   case 'y':
      //   case 'yp':
      //     handleYoutube(next);
      //     break;
      //   default:
      //     break;
      // }
      if (next.t == 'v')
        handleVimeo(next);
      if (next.t == 'y')
        handleYoutube(next);
      if (next.t == 'yp')
        handleYoutubePlaylist(next);
      idx++;
      return;
    }, 400);
  }

  var handleVimeo = function(item) {
    clearYTP();
    createVPlayer(item);
  }

  var handleYoutube = function(item) {
    clearVP();
    clearYTP();
    createYPlayer(item);
  }

  var handleYoutubePlaylist = function(item) {
    clearVP();
    createYPlayer(item);

  }
  // nextVideo();
  updatePlaylist();

});