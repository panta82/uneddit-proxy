# Uneddit Proxy

Proxy for http://uneddit.com/

It fixes a few problems that have cropped up:
- https certificate
- tailing / when building URL

This is a temp fix, until the author of uneddit (hopefully) fixes their stuff.

### Usage

Replace URL in bookmarklet with `uneddit.pantas.net`

```
javascript:void((function(){var e=document.createElement('script');e.setAttribute('type','text/javascript');e.setAttribute('charset','UTF-8');e.setAttribute('src', '//uneddit.pantas.net/phase_one');document.body.appendChild(e)})());
```

Or drag this link to the bookmarks.

<a href="javascript:void((function(){var e=document.createElement('script');e.setAttribute('type','text/javascript');e.setAttribute('charset','UTF-8');e.setAttribute('src', '//uneddit.pantas.net/phase_one');document.body.appendChild(e)})())">Uneddit</a>
