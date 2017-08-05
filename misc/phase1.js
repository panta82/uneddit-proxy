var oldComments = [];
var requestMore = [];
var deletedList = [];
var baseStoryURL = "";
var newestCommentTS = 0;

function showLoadingStuff(){
    var e = document.createElement('div');
    e.setAttribute("style", "display: table; position: fixed; z-index: 99999; top: 0; left: 0; width: 100%; height: 100%; background: rgba( 255, 255, 255, .8 ) url('//uneddit.com/loading.gif') 50% 50% no-repeat;");
    e.setAttribute('id',"unedditLoading");
    e.innerHTML = "<div style='display: table-cell; text-align: center; vertical-align: middle;'><div style='display: inline-block; text-align: left; margin-top: 50px;'><br /><br /><h1>Uneddit is loading, please wait.</h1></div></div>";
    document.body.appendChild(e);
}

function hideLoadingStuff(){
    $("#unedditLoading").hide();
}

function reportDeletedCommentsToServer(){
    console.log("reporting deleted comments:");
    console.log(deletedList);
    
    
    
    //report 128 at a time so as to not overflow the maximum URL length

    var numReqs = Math.ceil(deletedList.length / 128);

    for(var x = 0; x < numReqs; x++){
    
        var oneReq = deletedList.slice(x * 128, (x * 128) + 128)    

        var e=document.createElement('script');
        e.setAttribute('type','text/javascript');
        e.setAttribute('charset','UTF-8');
        e.setAttribute('src', '//uneddit.com/reportDeleted.php?ids='+oneReq.join(','));
        document.body.appendChild(e);
    }
}
/*
function deleteAllComments(){
    $(".sitetable.nestedlisting").html("");
}
*/
function deleteAllComments(cmtTree){
    console.log("cmtTree: ");
    console.log(cmtTree);
    document.getElementById("siteTable_"+cmtTree[0].data.link_id).innerHTML = "";
}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function cleanURL(urlToClean){
    //remove trailing slashes
        var pname = urlToClean;
        while(pname.charAt(pname.length - 1) == "/"){
            pname = pname.substr(0, pname.length - 1);
        }
        //remove double slashes
        pname = pname.replace(/(\/)\/+/g, "$1");
        return pname;
}

function onCommentPage(){
    //check if we're on a link page or a comment page
    var pname = cleanURL(window.location.pathname);
    pname = pname.split("/");
    var numSlashes = pname.length;
    if(numSlashes == 7){
        return pname[6];
    }else{
        return false;
    }
}

function loadCommentsFromDB(){
    var cmtIdOnPage = onCommentPage();
    console.log("cmtIdOnPage: "+cmtIdOnPage);
    if(cmtIdOnPage){
        var lnkId = "t1_"+cmtIdOnPage;
    }else{
        var lnkId = $("#siteTable").find("div[data-fullname]").first().attr("data-fullname");
        if(!lnkId){
            //uhoh, the story might be deleted.  steal the id from the URL muwhahaha
            lnkId = "t3_"+window.location.pathname.split("/")[4]
        }
    }
    var e=document.createElement('script');
    e.setAttribute('type','text/javascript');
    e.setAttribute('charset','UTF-8');
    e.setAttribute('src', '//uneddit.com/phase_two?ncTS='+newestCommentTS+'&lnk='+lnkId);
    document.body.appendChild(e);
}

function createCommentListRecursively(cmts){
    for(var i = 0; i < cmts.length; i++){
        var c = cmts[i];
        //console.log(c);
        if(c.kind == "t1"){
            if(c.data.created_utc > newestCommentTS){
                newestCommentTS = c.data.created_utc;
            }
            oldComments.push({name: c.data.name, deleted: c.data.body=="[deleted]", score: c.data.score, body: c.data.body});
            //console.log(c.data.body_html);
            if(c.data.replies){
                createCommentListRecursively(c.data.replies.data.children);
            }
        }else if(c.kind == "more"){
            requestMore.push(c.data);
        }
    }
    
}

function showErrorMessage(){
    alert("An error occured with Uneddit: it returned no comments for this story.  It might not be working right now or it might not be working for this story.  Sorry, try again later, maybe with a different story.");
}

function createComment(cmt, childCount){
    
    //console.log("creating comment: ");
    //console.log(cmt);
    
    //check if this comment has been deleted
    var deleted = true;
    var edited = false;
    var theOldComment = "";
    for(var i = 0; i < oldComments.length; i++){
        if(cmt.name == oldComments[i].name && !oldComments[i].deleted){
            theOldComment = oldComments[i];
            deleted = false;
            edited = !(theOldComment.body == cmt.body);
            
            
            
            /*
            console.log("old body:");
            console.log(theOldComment.body);
            console.log("new body:");
            console.log(cmt.body);
            console.log("--------");
            */
            break;
        }
    }
    
    if(deleted){
        deletedList.push(cmt.name.substr(3));
    }
    
    

    //<div class=" thing id-t1_ckosyd2 noncollapsed   comment " onclick="click_thing(this)" data-fullname="t1_ckosyd2" data-ups="?" data-downs="?">
    var e=document.createElement('div');
    e.setAttribute('class', 'thing id-'+cmt.name+' noncollapsed comment');
    e.setAttribute('onclick', 'click_thing(this)');
    e.setAttribute('data-fullname', cmt.name);
    e.setAttribute('data-ups', '?');
    e.setAttribute('data-downs', '?'); 
    
    //<p class="parent"><a name="ckosyd2"></a></p>
    var p = document.createElement('p');
    p.setAttribute('class', 'parent');
    
    var a = document.createElement('a');
    a.setAttribute('name', cmt.name.substr(3));
    
    p.appendChild(a);
    e.appendChild(p);
    
    //<div class="midcol unvoted">
    //  contains: 
    //  <div class="arrow up login-required" onclick="$(this).vote(r.config.vote_hash, null, event)" role="button" aria-label="upvote" tabindex="0" pairnum="1"></div>
    //  <div class="arrow down login-required" onclick="$(this).vote(r.config.vote_hash, null, event)" role="button" aria-label="downvote" tabindex="0" pairnum="1"></div>
    var midcol = document.createElement('div');
    midcol.setAttribute('class', 'midcol unvoted');
    
    var arrowup = document.createElement('div');
    arrowup.setAttribute('class','arrow up login-required');
    arrowup.setAttribute('onclick','$(this).vote(r.config.vote_hash, null, event)');
    arrowup.setAttribute('role','button');
    arrowup.setAttribute('aria-label','upvote');
    arrowup.setAttribute('tabindex','0');
    arrowup.setAttribute('pairnum','1');
    
    var arrowdown = document.createElement('div');
    arrowdown.setAttribute('class','arrow down login-required');
    arrowdown.setAttribute('onclick','$(this).vote(r.config.vote_hash, null, event)');
    arrowdown.setAttribute('role','button');
    arrowdown.setAttribute('aria-label','downvote');
    arrowdown.setAttribute('tabindex','0');
    arrowdown.setAttribute('pairnum','1');
    
    midcol.appendChild(arrowup);
    midcol.appendChild(arrowdown);
    
    e.appendChild(midcol);
    
    
    //<div class="entry unvoted">
    //  contains: 
    //  <p class="tagline">
    //  <form action="#" class="usertext" onsubmit="return post_form(this, 'editusertext')" id="form-t1_ckosyd211n">
    //  <ul class="flat-list buttons">
    
    var entry = document.createElement('div');
    entry.setAttribute('class', 'entry unvoted');
    
    
    //<p class="tagline">
    //  contains:
    //  <a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a>
    //  <a href="http://www.reddit.com/user/_Anti-Matter_" class="author may-blank id-t2_85kzq">_Anti-Matter_</a>
    //  <span class="userattrs"></span>
    //  <span class="score unvoted">218 points</span>
    //  <time title="Sun Sep 21 22:46:53 2014 UTC" datetime="2014-09-21T22:46:53+00:00" class="live-timestamp">4 hours ago</time>
    //  &nbsp;
    //  <a href="javascript:void(0)" class="numchildren" onclick="return togglecomment(this)">(22 children)</a>
    //</p>
    
    var tagline = document.createElement('p');
    tagline.setAttribute('class', 'tagline');
    
    var expand = document.createElement('a');
    expand.setAttribute('href', 'javascript:void(0)');
    expand.setAttribute('class', 'expand');
    expand.setAttribute('onclick', 'return togglecomment(this)');
    expand.innerHTML = "[-]";
    
    var author = document.createElement('a');
    author.setAttribute('href', 'http://www.reddit.com/user/'+cmt.author);
    author.setAttribute('class', 'author may-blank');
    author.innerHTML = cmt.author;
    
    var userattrs = document.createElement('span');
    userattrs.setAttribute('class', 'userattrs');
    
    var score = document.createElement('span');
    score.setAttribute('class', 'score unvoted');
    score.innerHTML = cmt.score;
    if(!deleted){
        score.innerHTML = theOldComment.score;
        //console.log(theOldComment);
    }
    var newScore = score.innerHTML + " point";
    if(score.innerHTML != "1"){
        newScore += "s"
    }
    score.innerHTML = newScore;
    
    
    var time = document.createElement('time');
    var t = new Date(cmt.created_utc * 1000);
    //t.setSeconds();
    //title="Sun Sep 21 22:46:53 2014 UTC"  
    var formatted = t.toUTCString().replace(",","");
    time.setAttribute('title', formatted);
    
    var t = new Date(cmt.created_utc * 1000);
    //t.setSeconds();
    //datetime="2014-09-21T22:46:53+00:00"
    var formatted = t.toISOString();
    time.setAttribute('datetime', formatted);
    time.setAttribute('class', 'live-timestamp');
    time.innerHTML = "";
    
    var numChildren = document.createElement('a');
    numChildren.setAttribute('href', 'javascript:void(0)');
    numChildren.setAttribute('class', 'numchildren');
    numChildren.setAttribute('onclick', 'return togglecomment(this)');
    numChildren.innerHTML = "("+childCount+" children)";
    
    tagline.appendChild(expand);
    tagline.appendChild(author);
    tagline.appendChild(userattrs);
    tagline.appendChild(score);
    tagline.appendChild(time);
    $(tagline).append("&nbsp;");
    if(edited && !deleted){
        $(tagline).append(" [original unedited comment restored by uneddit.com] ");
    }
    if(deleted){
        $(tagline).append(" [deleted comment restored by uneddit.com] ");
    }
    tagline.appendChild(numChildren);
    
 
    
    
    
    
    
    
    
    
    //<form action="#" class="usertext" onsubmit="return post_form(this, 'editusertext')" id="form-t1_ckosyd211n">
    //  contains:
    //  <input type="hidden" name="thing_id" value="t1_ckosyd2">
    //  <div class="usertext-body may-blank-within">
    //      contains:
    //      <div class="md">
    //          contains:
    //          <p>Some people with their eyes closed, can draw better than me with both of my eyes opened.</p>
    
    
    var frm = document.createElement('form');
    frm.setAttribute('action','#');
    frm.setAttribute('class','usertext');
    frm.setAttribute('onsubmit',"return post_form(this, 'editusertext')");
    //frm.setAttribute('id','form-t1_ckosyd211n');
    
    var inpt = document.createElement("input");
    inpt.setAttribute('type','hidden');
    inpt.setAttribute('name','thing_id');
    inpt.setAttribute('value',cmt.name);
    
    var usrtext = document.createElement('div');
    usrtext.setAttribute('class', 'usertext-body may-blank-within');
    usrtext.innerHTML = htmlDecode(cmt.body_html);
    
    if(edited){
        usrtext.setAttribute('style', 'background-color: rgba(100,100,255,0.2);');
    }
    
    if(deleted){
        usrtext.setAttribute('style', 'background-color: rgba(255,100,100,0.3);');
    }
    
    //console.log(htmlDecode(cmt.body_html));
    
    
    frm.appendChild(inpt);
    frm.appendChild(usrtext);
    
    
    //<ul class="flat-list buttons">
    //  contains: 
    //  <li class="first">
    //      contains:
    //      <a href="http://www.reddit.com/r/funny/comments/2h2np9/comic_strip_artists_from_the_40s_draw_their/ckosyd2" class="bylink" rel="nofollow">permalink</a>
    //  </li>
    //</ul>
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'flat-list buttons');
    var li = document.createElement('li');
    li.setAttribute('class', 'first');
    var plnk = document.createElement('a');
    plnk.setAttribute('href', baseStoryURL + cmt.name.substr(3));
    plnk.setAttribute('class', 'bylink');
    plnk.setAttribute('rel', 'nofollow');
    plnk.innerHTML = "permalink";
    li.appendChild(plnk);
    ul.appendChild(li);
   
    
    entry.appendChild(tagline);
    entry.appendChild(frm);
    entry.appendChild(ul);
    e.appendChild(entry);
    
    //<div class="child"><div id="siteTable_t1_ckosyd2" class="sitetable listing">
    var childCmt = document.createElement('div');
    childCmt.setAttribute('class', 'child');
    
    var innerSiteTable = document.createElement('div');
    innerSiteTable.setAttribute('class', 'sitetable listing');
    innerSiteTable.setAttribute('id', 'siteTable_'+cmt.name);
    
    childCmt.appendChild(innerSiteTable);
    e.appendChild(childCmt);
    
    //<div class="clearleft"></div>
    var clearLeft = document.createElement('div');
    clearLeft.setAttribute('class', 'clearleft');
    
    e.appendChild(clearLeft);
    
    return e;
    
}





function createReadMoreLink(cmt, childCount){
    
    /* Whole object:
    <div class=" thing id-t1_cl8ekip noncollapsed   morechildren " onclick="click_thing(this)" data-fullname="t1_cl8ekip">
        <p class="parent"></p>
        <div class="entry unvoted">
            <p class="tagline"></p>
            <span class="morecomments">
                <a style="font-size: smaller; font-weight: bold" class="button" id="more_t1_cl8ekip" href="javascript:void(0)" onclick="return morechildren(this, 't3_2j4etg', 'confidence', 'cl8ekip,cl8emwj,cl8g70w,cl8gxq0,cl8h6sy,cl8hjwf,cl8hva9,cl8i6fb,cl8ieys,cl8jvnk,cl8l30a,cl8mek8,cl8ml6y,cl8n0hv,cl8p7j4,cl8pc7d,cl8rcti,cl8sezj', 3, '')">
                    load more comments
                    <span class="gray">
                        &nbsp;(18 replies)
                    </span>
                </a>
            </span>
            <ul class="flat-list buttons"></ul>
        </div>
        <div class="child"></div>
        <div class="clearleft"></div>
    </div>
    */
    

    //<div class=" thing id-t1_cl8ekip noncollapsed   morechildren " onclick="click_thing(this)" data-fullname="t1_cl8ekip">
    var e=document.createElement('div');
    e.setAttribute('class', 'thing id-'+cmt.name+' noncollapsed morechildren');
    e.setAttribute('onclick', 'click_thing(this)');
    e.setAttribute('data-fullname', cmt.name);
    
    //<p class="parent"></p>
    var p = document.createElement('p');
    p.setAttribute('class', 'parent');
    
    e.appendChild(p);
    
  
    
    /*
    <div class="entry unvoted">
        <p class="tagline"></p>
        <span class="morecomments">
            <a style="font-size: smaller; font-weight: bold" class="button" id="more_t1_cl8ekip" href="javascript:void(0)" onclick="return morechildren(this, 't3_2j4etg', 'confidence', 'cl8ekip,cl8emwj,cl8g70w,cl8gxq0,cl8h6sy,cl8hjwf,cl8hva9,cl8i6fb,cl8ieys,cl8jvnk,cl8l30a,cl8mek8,cl8ml6y,cl8n0hv,cl8p7j4,cl8pc7d,cl8rcti,cl8sezj', 3, '')">
                load more comments
                <span class="gray">
                    &nbsp;(18 replies)
                </span>
            </a>
        </span>
        <ul class="flat-list buttons"></ul>
    </div>
     */
    
    var entry = document.createElement('div');
    entry.setAttribute('class', 'entry unvoted');
    
    
    var tagline = document.createElement('p');
    tagline.setAttribute('class', 'tagline');
    entry.appendChild(tagline);
    
    var morecomments = document.createElement('span');
    morecomments.setAttribute('class', 'morecomments');
    
    //<a style="font-size: smaller; font-weight: bold" class="button" id="more_t1_cl8ekip" href="javascript:void(0)" onclick="return morechildren(this, 't3_2j4etg', 'confidence', 'cl8ekip,cl8emwj,cl8g70w,cl8gxq0,cl8h6sy,cl8hjwf,cl8hva9,cl8i6fb,cl8ieys,cl8jvnk,cl8l30a,cl8mek8,cl8ml6y,cl8n0hv,cl8p7j4,cl8pc7d,cl8rcti,cl8sezj', 3, '')">
    var theLink = document.createElement('a');
    theLink.setAttribute('style', 'font-size: smaller; font-weight: bold');
    theLink.setAttribute('class', 'button');
    theLink.setAttribute('id', 'more_'+cmt.name);
    theLink.setAttribute('href', baseStoryURL + cmt.parent_id.substr(3));
    //theLink.setAttribute('onclick', "return morechildren(this, '"+cmt.link_id"+', 'confidence', 'cl8ekip,cl8emwj,cl8g70w,cl8gxq0,cl8h6sy,cl8hjwf,cl8hva9,cl8i6fb,cl8ieys,cl8jvnk,cl8l30a,cl8mek8,cl8ml6y,cl8n0hv,cl8p7j4,cl8pc7d,cl8rcti,cl8sezj', 3, '')");
    theLink.innerHTML = "load more comments";
    
    morecomments.appendChild(theLink);
    entry.appendChild(morecomments);
    
    
   
    //usrtext.innerHTML = "<a href='" + baseStoryURL + cmt.name.substr(3) + "'>Load more comments</a>";
    
    //<ul class="flat-list buttons"></ul>
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'flat-list buttons');
    
    entry.appendChild(ul);
   
   
    e.appendChild(entry);
    
    
    //<div class="child"></div>
    var childDiv = document.createElement('div');
    childDiv.setAttribute('class', 'child');
    
    e.appendChild(childDiv);
    
    //<div class="clearleft"></div>
    var clearLeft = document.createElement('div');
    clearLeft.setAttribute('class', 'clearleft');
    
    e.appendChild(clearLeft);
    
    return e;
    
}



function restoreCommentsFromTree(cmts, parent){
    //console.log(cmts);
    //console.log("restoring comments from tree.  length: "+cmts.length);
    for(var i = 0; i < cmts.length; i++){
        var c = cmts[i];
        
        
        //restore the actual comment
        if(c.data.readMoreLink && c.data.postIt){
            console.log("restoring "+c.data.name);
            console.log(c);
            var e = createReadMoreLink(c.data, c.children?c.children.length:0);
        }else{
            var e = createComment(c.data, c.children?c.children.length:0);
        }
        if(parent == ""){
            //restore to root node
            document.getElementById("siteTable_"+c.data.link_id).appendChild(e);
        }else{
            //restore to parent node
            //console.log("restoring to parent node with name "+parent.data.name);
            document.getElementById("siteTable_"+parent.data.name).appendChild(e);
        }
        
        //recurse on the children
        restoreCommentsFromTree(c.children, c); 
    }
}









//MAIN

showLoadingStuff();

//set the baseStoryURL
var pname = cleanURL(window.location.pathname);
pname = pname.split("/");
baseStoryURL = window.location.origin + pname.slice(0, 6).join("/") + "/";

console.log("Base story url: " + baseStoryURL);

//create list of comments from current json
var newurl = "//www.reddit.com"+window.location.pathname;
$.ajax({
    url: newurl + ".json?limit=1500&depth=10&sort=old",
    success: function(res){
        console.log(res);
        createCommentListRecursively(res[1].data.children);
        console.log("newest comment timestamp: "+newestCommentTS);
       
        
        loadCommentsFromDB();  
        
    },
    error: function(res){
        alert("Uneddit: An error occured, sorry.");
        console.log(res);
    }
});


 
//google analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-42073571-1', 'uneddit.com');
  ga('send', 'pageview');
