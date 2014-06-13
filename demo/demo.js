/* global $, jQuery, wmOERSearch */
/* jshint strict: false */

/*
  Utility Functions
 */

function shuffleArray( array ) {
  for(var j, x, i = array.length; i; j = parseInt(Math.random() * i, 10), x = array[--i], array[i] = array[j], array[j] = x);

  return array;
}

/*
  Activity Selection (UI)
 */

// array of selected items (in display order)
var selectedActivities = [];

// move result into selection
$('#results').on('click', '.media > .thumbnail', function(event) {
  var $self = $(this).parent('.media');

  $('#selected').append( $self.clone() );

  $self.addClass('selected');

  selectedActivities.push($self.data('make-id'));
});

// remove selection
$('#selected').on('click', '.media > .thumbnail', function(event) {
  var $self = $(this).parent('.media');

  selectedActivities = $.grep( selectedActivities, function( item ) {
    return item !== $self.data('make-id');
  });

  $('#results .media[data-make-id=' + $self.data('make-id') + ']').removeClass('selected');

  $self.remove();
});

// make selected items sortable
$('#selected').sortable();

// on rearrange update selectedActivities.
$('#selected').on('sortdeactivate', function( event, ui ) {
  var newOrder = [];

  $(this).children('.media[data-make-id]').each( function( index, activity ) {
    newOrder.push( $( activity ).data( 'make-id' ) );
  });

  selectedActivities = newOrder;
});

/*
  Search MakeAPI
 */
function handleActivitySearch( makes ) {
  var limit = 10;
  if ( makes.length < limit ) {
    limit = makes.length;
  }

  for(var x = 0; x < limit; x++) {
    var markSelected = '';
    if( selectedActivities.indexOf( makes[x].id || makes[x].url ) > -1 ) {
      markSelected = ' selected';
      console.log('win');
    }

    $('#results').append('<li class="media' + markSelected + '" data-make-id="' + ( makes[x].id || makes[x].url ) + '">' +
                          '<a href="#result-1" class="pull-left thumbnail"><img src="' + makes[x].thumbnail + '" alt="#"></a>' +
                          '<div class="media-body">' +
                            '<h4 class="media-heading">' + makes[x].title + ' <small>by ' + makes[x].username + '</small></h4>' +
                            '<p>' + makes[x].description + '</p>' +
                          '</div>' +
                        '</li>');
  }
}

// deal w/ user searches
var $input = $('#activitySearch input');

$('#activitySearch button#search').on('click', function( event ) {
  $('#results').empty();
  if( $input.val() !== '' ) {
    wmOERSearch( $input.val(), {
      OERType: $('#oer-type').val(),
      success: handleActivitySearch,
      error: function( err ) { return console.error( err ); }
    });
  }
});
