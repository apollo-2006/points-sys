# art

`gryffindor-crest.svg` and `slytherin-crest.svg` are the official house crests,
taken from the house collection pages on harrypotter.com. They are Warner Bros.
property, not ours.

**This is why the repository is private.** Keep it that way. If it is ever made
public these two files have to come out first, and `themes/heraldry.js` already
knows how to manage without them: an entry in `H.arms` that has no `crest` key
falls back to a drawn shield with a drawn charge, which is what Origin uses.
Deleting the files and the two `crest:` lines is the whole of it.

The same goes for shipping this anywhere, or handing the folder to anyone who
is not one of the two people it keeps score for.
