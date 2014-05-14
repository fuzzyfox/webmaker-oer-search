/* global jQuery */
(function( window, document ) {
  'use strict';

  var makeapi = new window.Make({
    apiURL: 'https://makeapi.webmaker.org'
  });

  function search( term, OERTags, error, success ) {
    var results = [];

    function uniqueResults( err, makes ) {
      if( err ) {
        return error( err );
      }

      makes.forEach( function( make ) {
        var duplicate = false;

        results.forEach( function( result ) {
          if( JSON.stringify( result ) === JSON.stringify( make ) ) {
            duplicate = true;
          }
        });

        if( !duplicate ) {
          results.push( make );
        }
      });

      // this is a temp fix till
      // https://bugzilla.mozilla.org/show_bug.cgi?id=987780 is resolved
      tmpDone();
    }

    // HACK HACK HACK
    // nasty hack till
    // https://bugzilla.mozilla.org/show_bug.cgi?id=987780 is resolved
    var initiatedSearches = 0;
    var completedSearches = 0;

    OERTags.forEach( function( requiredTag ) {
      initiatedSearches += 2;
      makeapi.description( term ).tags( [ requiredTag ] ).limit( 10 ).then( uniqueResults );
      makeapi.title( term ).tags( [ requiredTag ] ).limit( 10 ).then( uniqueResults );

      var termAsTags = term.split( /(,\s*|\s+)/i );
      initiatedSearches += termAsTags.length;
      termAsTags.forEach( function( tag ) {
        makeapi.tags( [ requiredTag, tag ] ).limit( 10 ).then( uniqueResults );
      });
    });

    function tmpDone() {
      completedSearches++;
      if( initiatedSearches === completedSearches ) {
        success( results );
      }
    }
    // END HACK HACK HACK
  }

  function WMOERSearch( term, options ) {
    options = {
      OERType: options.OERType || 'all', // (kit|activity|all)
      success: options.success || function( makes ) { return makes; },
      error: options.error || function( err ) { return console.error( err); }
    };

    var OERTags = [];

    switch( options.OERType ) {
      case 'kit':
      case 'activity':
        OERTags.push( options.OERType, 'teach-' + options.OERType );
      break;
      case 'all':
        OERTags.push( 'teach' );
      break;
      default:
        return console.error( 'Unknown OERType. Received ' + options.OERType + ' expected one of the following: "kit", "activity", "all"' );
    }

    search( term, OERTags, options.error, options.success );
  }

  window.WMOERSearch = WMOERSearch;
})( this, document );
