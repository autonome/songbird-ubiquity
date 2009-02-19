/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ubiquity.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

EXPORTED_SYMBOLS = ["EnParser"];

Components.utils.import("resource://ubiquity/modules/parser/parser.js");

// util functions to make it easier to use objects as fake dictionaries
function dictDeepCopy( dict ) {
  var newDict = {};
  for (var i in dict ) {
    newDict[i] = dict[i];
  }
  return newDict;
};

function dictKeys( dict ) {
  return [ key for ( key in dict ) ];
};

var EnParser = {};

EnParser.PRONOUNS = ["this", "that", "it", "selection", "him", "her", "them"];

function _recursiveParse(unusedWords,
                         filledArgs,
                         unfilledArgs,
			 creationCallback) {
  var x;
  var suggestions = [];
  var completions = [];
  var newFilledArgs = {};
  var newCompletions = [];
  // First, the termination conditions of the recursion:
  if (unusedWords.length == 0) {
    // We've used the whole sentence; no more words. Return what we have.
    return [creationCallback(filledArgs)];
  } else if ( dictKeys( unfilledArgs ).length == 0 ) {
    // We've used up all arguments, so we can't continue parsing, but
    // there are still unused words.  This was a bad parsing; don't use it.
    return [];
  } else {
    // "pop" off the LAST unfilled argument in the sentence and try to fill it
    var argName = dictKeys( unfilledArgs ).reverse()[0];
    // newUnfilledArgs is the same as unfilledArgs without argName
    var newUnfilledArgs = dictDeepCopy( unfilledArgs );
    delete newUnfilledArgs[argName];

    // Look for a match for this argument
    let argumentFound = false;
    var nounType = unfilledArgs[argName].type;
    var nounLabel = unfilledArgs[argName].label;
    var preposition = unfilledArgs[argName].flag;
    for ( x = 0; x < unusedWords.length; x++ ) {
      if ( preposition == null || preposition == unusedWords[x] ) {
        /* a match for the preposition is found at position x!
          (require exact matches for prepositions.)
	   Anything following this preposition could be part of the noun.
           Check every possibility starting from "all remaining words" and
	   working backwards down to "just the word after the preposition."
	   */
        let lastWordEnd = (preposition == null)? x : x +1;
        let lastWordStart = (preposition == null)? unusedWords.length : unusedWords.length -1;
        for (let lastWord = lastWordStart; lastWord >= lastWordEnd; lastWord--) {
          //copy the array, don't modify the original
          let newUnusedWords = unusedWords.slice();
	  if (preposition != null) {
            // take out the preposition
	    newUnusedWords.splice(x, 1);
	  }
	  // pull out words from preposition up to lastWord, as nounWords:
          let nounWords = newUnusedWords.splice( x, lastWord - x );
          newFilledArgs = dictDeepCopy( filledArgs );
          newFilledArgs[ argName ] = nounWords;
          newCompletions = this._recursiveParse( newUnusedWords,
                                                 newFilledArgs,
                                                 newUnfilledArgs,
						 creationCallback);
          completions = completions.concat(newCompletions);
          argumentFound = true;
	}
      } // end if preposition matches
    } // end for each unused word
    // If argument was never found, try a completion where it's left blank.
    if (!argumentFound) {
      newCompletions = _recursiveParse( unusedWords,
                                        filledArgs,
     		                        newUnfilledArgs,
					creationCallback );
      completions = completions.concat( newCompletions );
    }
    return completions;
  } // end if there are still arguments
}

EnParser.parseSentence = function(inputString, nounList, verbList, selObj,
                                  asyncSuggestionCb) {
  // Returns a list of PartiallyParsedSentences.
  // Language-specific.  This one is for English.
  let parsings = [];

  // English uses spaces between words:
  let words = inputString.split(" ");
  /* If input is "dostuff " (note space) then splitting on space will
   *  produce ["dostuff", ""].  We don't want the empty string, so drop
   *  all zero-length strings: */
  words = [ word for each(word in words) if (word.length > 0)];
  // English puts verb at the beginning of the sentence:
  let inputVerb = words[0];
  // And the arguments after it:
  let inputArguments = words.slice(1);

  // Try matching the verb against all the words we know:
  for each (let verb in verbList) if (!verb.disabled) {
    let matchScore = verb.match( inputVerb );

    if (matchScore == 0)
      continue;
    let newParsings = [];
    if (inputArguments.length == 0) {
      // No arguments
      newParsings = [new NLParser.PartiallyParsedSentence(verb,
							 {},
							 selObj,
							 matchScore,
                                                         EnParser,
                                                         asyncSuggestionCb)];
    } else {
      // Recursively parse to assign arguments
      let makeNewParsing = function( argStrings ) {
	return new NLParser.PartiallyParsedSentence(verb,
						    argStrings,
						    selObj,
						    matchScore,
                                                    EnParser,
                                                    asyncSuggestionCb);
      };
      newParsings = _recursiveParse( inputArguments,
                                     {},
                                     verb._arguments,
				     makeNewParsing);
    }
    parsings = parsings.concat( newParsings );
  }
  return parsings;
}

NLParser.registerPluginForLanguage("en", EnParser);
